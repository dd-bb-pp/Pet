-- 修复后的 pets 表修改 SQL，解决外键依赖问题

-- 方法1: 使用 CASCADE 删除（推荐，最简洁）
-- 这会同时删除所有依赖 pets 表的对象（包括外键约束）
DROP TABLE IF EXISTS pets CASCADE;

-- 重新创建 pets 表
CREATE TABLE pets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    pet_type VARCHAR(20) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(10) NOT NULL,
    birth_date DATE,
    avatar_color CHAR(7) DEFAULT '#FF9800',
    weight DECIMAL(5,2),
    personality_tags JSONB,
    health_notes TEXT,
    living_habits TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 重新创建 posts 表的外键约束（如果需要的话）
-- ALTER TABLE posts ADD CONSTRAINT posts_pet_id_fkey 
-- FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_pet_type ON pets(pet_type);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- 方法2: 先删除依赖关系，再删除表（更安全）
-- 1. 删除 posts 表的外键约束
-- ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_pet_id_fkey;

-- 2. 删除表
-- DROP TABLE IF EXISTS pets;

-- 3. 重新创建 pets 表（同上）
-- CREATE TABLE pets (...);

-- 4. 重新添加外键约束
-- ALTER TABLE posts ADD CONSTRAINT posts_pet_id_fkey 
-- FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL;

-- 推荐使用方法1（CASCADE），因为：
-- - 更简洁，一步完成
-- - 不会遗留无效的依赖关系
-- - 如果数据不重要，这是最直接的方法