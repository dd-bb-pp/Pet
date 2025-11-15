-- PawPals 宠物社交平台核心数据库表结构
-- 精简版本，适配PostgreSQL
-- 创建日期: 2024-11-13
-- 数据库: PostgreSQL 12+

-- 创建数据库 (PostgreSQL中创建数据库使用单独的命令)
-- CREATE DATABASE pawpals ENCODING 'UTF8';
-- \c pawpals;

-- 1. 用户表 (users) - 核心表
-- 存储用户的基本信息和认证信息
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE, -- 关联Supabase认证用户的ID
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(50),
    avatar_color CHAR(7) DEFAULT '#4CAF50',
    location VARCHAR(100),
    bio TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);

-- 2. 宠物类型枚举
CREATE TYPE pet_type_enum AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'rodent', 'reptile', 'other');
CREATE TYPE gender_enum AS ENUM ('male', 'female');

-- 宠物表 (pets) - 核心表
-- 存储用户拥有的宠物信息（简化宠物类型，直接使用类型字段）
CREATE TABLE pets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- 修改回BIGINT类型以匹配users表的id
    name VARCHAR(50) NOT NULL,
    pet_type pet_type_enum NOT NULL,
    breed VARCHAR(100),
    gender gender_enum NOT NULL,
    birth_date DATE,
    avatar_color CHAR(7) DEFAULT '#FF9800',
    weight DECIMAL(5,2),
    personality_tags JSONB,
    health_notes TEXT,
    living_habits TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_pet_type ON pets(pet_type);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- 3. 动态表 (posts) - 核心表
-- 存储用户发布的宠物动态（简化设计，整合点赞和评论功能）
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    location VARCHAR(100),
    tags JSONB,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_location ON posts(location);

-- 为全文搜索创建GIN索引
CREATE INDEX idx_posts_content ON posts USING gin(to_tsvector('english', content));

-- 4. 养宠知识表 (knowledge_articles) - 简化版本
-- 存储基础养宠知识
CREATE TABLE knowledge_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(20) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category);

-- 插入基础养宠知识
INSERT INTO knowledge_articles (title, content, category) VALUES
('新手养宠指南', '从零开始学习科学养宠，避免常见误区。', 'beginner'),
('宠物健康护理', '常见疾病预防和日常护理方法。', 'health'),
('行为训练技巧', '宠物行为解读和基础训练方法。', 'training');

-- 创建视图

-- 用户动态视图（包含用户信息）
CREATE VIEW post_details AS
SELECT 
    p.*,
    u.username,
    u.display_name,
    u.avatar_color as user_avatar_color
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.is_public = TRUE;

-- 热门动态视图
CREATE VIEW hot_posts AS
SELECT * FROM post_details 
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY like_count DESC, comment_count DESC
LIMIT 50;

-- 创建复合索引优化查询性能
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX idx_posts_location_created ON posts(location, created_at);
CREATE INDEX idx_pets_user_created ON pets(user_id, created_at);

-- 创建触发器来处理updated_at自动更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 显示表结构信息
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 显示各表记录数统计
SELECT 
    table_name,
    (SELECT reltuples FROM pg_class WHERE relname = table_name) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;