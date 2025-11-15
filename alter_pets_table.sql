-- 单独修改 pets 表 user_id 字段的 SQL 语句
-- 用于修复 "invalid input syntax for type bigint" 错误

-- 方法1: 创建新表并迁移数据（推荐，避免数据丢失）
-- 1. 创建新表
CREATE TABLE pets_new (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    pet_type VARCHAR(20) NOT NULL, -- 使用字符串类型，避免枚举类型问题
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

-- 2. 复制数据（如果有现有数据）
-- INSERT INTO pets_new (id, name, pet_type, breed, gender, birth_date, avatar_color, weight, personality_tags, health_notes, living_habits, is_public, created_at, updated_at)
-- SELECT id, name, pet_type::text, breed, gender::text, birth_date, avatar_color, weight, personality_tags, health_notes, living_habits, is_public, created_at, updated_at
-- FROM pets;

-- 3. 删除旧表
-- DROP TABLE pets;

-- 4. 重命名新表
-- ALTER TABLE pets_new RENAME TO pets;

-- 5. 创建索引
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_pet_type ON pets(pet_type);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- 方法2: 直接修改现有表结构（如果表为空或可以接受数据丢失）
-- 1. 删除外键约束（如果存在）
-- ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_user_id_fkey;

-- 2. 修改字段类型
-- ALTER TABLE pets ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 3. 重新创建索引
-- CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

-- 选择方法说明：
-- 如果 pets 表有重要数据，使用方法1（创建新表）
-- 如果 pets 表是空的或可以重建，使用方法2（直接修改）