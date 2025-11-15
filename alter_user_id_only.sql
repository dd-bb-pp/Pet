-- 直接修改 pets 表 user_id 字段的 SQL 语句
-- 注意：如果表中有数据，需要先处理数据兼容性问题

-- 步骤1: 删除外键约束（如果存在）
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_user_id_fkey;

-- 步骤2: 修改字段类型
-- 如果表中没有数据，可以直接修改
ALTER TABLE pets ALTER COLUMN user_id TYPE UUID;

-- 如果表中有数据，需要使用转换函数（数据会丢失）
-- ALTER TABLE pets ALTER COLUMN user_id TYPE UUID USING gen_random_uuid();

-- 或者保留现有数据（如果现有数据是有效的UUID格式）
-- ALTER TABLE pets ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 步骤3: 重新添加索引
DROP INDEX IF EXISTS idx_pets_user_id;
CREATE INDEX idx_pets_user_id ON pets(user_id);

-- 说明：
-- 1. 如果没有数据，使用最简单的 ALTER COLUMN TYPE
-- 2. 如果有数据但可以丢失，使用 gen_random_uuid() 生成新的UUID
-- 3. 如果现有数据是有效的UUID字符串，可以尝试转换

-- 推荐先检查表中是否有数据：
-- SELECT COUNT(*) FROM pets;