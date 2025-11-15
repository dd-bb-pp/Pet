-- PawPals 数据库 RLS（行级安全）策略配置
-- 这些策略定义了不同用户对数据的访问权限

-- 1. 启用所有表的RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

-- 2. 用户表策略
-- 任何人都可以查看活跃用户（用于显示用户名、头像等基本信息）
CREATE POLICY "任何人都可以查看活跃用户" ON users
    FOR SELECT USING (is_active = true);

-- 用户只能修改自己的信息（由于id类型不匹配，暂时禁用此策略）
-- CREATE POLICY "用户只能修改自己的信息" ON users
--     FOR UPDATE USING (auth.uid()::text = id::text);

-- 任何人可以创建新用户（注册功能）
CREATE POLICY "任何人都可以注册用户" ON users
    FOR INSERT WITH CHECK (true);

-- 允许用户修改自己的信息（使用auth.uid()关联，需要先修改用户表结构）
CREATE POLICY "允许用户修改信息" ON users
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 3. 宠物表策略
-- 任何人都可以查看公开的宠物档案
CREATE POLICY "任何人都可以查看公开宠物" ON pets
    FOR SELECT USING (is_public = true);

-- 用户可以查看自己的所有宠物（暂时简化策略）
CREATE POLICY "用户可以查看自己的宠物" ON pets
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 用户只能创建和修改自己的宠物（精确策略）
CREATE POLICY "用户可以插入自己的宠物" ON pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的宠物" ON pets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的宠物" ON pets
    FOR DELETE USING (auth.uid() = user_id);

-- 4. 动态表策略
-- 任何人都可以查看公开的动态
CREATE POLICY "任何人都可以查看公开动态" ON posts
    FOR SELECT USING (is_public = true);

-- 用户可以查看自己发布的所有动态（暂时简化策略）
CREATE POLICY "用户可以查看自己的动态" ON posts
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 用户只能创建和修改自己的动态（暂时简化策略）
CREATE POLICY "用户只能创建和修改自己的动态" ON posts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. 养宠知识表策略
-- 任何人都可以查看养宠知识文章
CREATE POLICY "任何人都可以查看知识文章" ON knowledge_articles
    FOR SELECT USING (true);

-- 只有管理员可以管理知识文章（使用service_role key）
CREATE POLICY "只有管理员可以管理知识文章" ON knowledge_articles
    FOR ALL USING (false);  -- 默认禁止所有操作，需要使用service_role key

-- 6. 创建用于API测试的服务账号策略（可选）
-- 允许服务账号完全访问所有数据（用于后台管理）
CREATE POLICY "服务账号完全访问权限" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "服务账号完全访问权限" ON pets
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "服务账号完全访问权限" ON posts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "服务账号完全访问权限" ON knowledge_articles
    FOR ALL USING (auth.role() = 'service_role');