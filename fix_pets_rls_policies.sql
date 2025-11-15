-- 修复 pets 表 RLS 策略的 SQL 语句
-- 解决 "数据库权限不足，请检查RLS策略设置" 错误

-- 1. 首先删除现有的 pets 表策略（如果有）
DROP POLICY IF EXISTS "任何人都可以查看公开宠物" ON pets;
DROP POLICY IF EXISTS "用户可以查看自己的宠物" ON pets;
DROP POLICY IF EXISTS "用户只能创建和修改自己的宠物" ON pets;

-- 2. 创建新的精确 RLS 策略
-- 查看公开宠物（任何人）
CREATE POLICY "任何人都可以查看公开宠物" ON pets
    FOR SELECT USING (is_public = true);

-- 查看自己的宠物（登录用户）
CREATE POLICY "用户可以查看自己的宠物" ON pets
    FOR SELECT USING (auth.uid() = user_id);

-- 插入自己的宠物（登录用户）
CREATE POLICY "用户可以插入自己的宠物" ON pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新自己的宠物（登录用户）
CREATE POLICY "用户可以更新自己的宠物" ON pets
    FOR UPDATE USING (auth.uid() = user_id);

-- 删除自己的宠物（登录用户）
CREATE POLICY "用户可以删除自己的宠物" ON pets
    FOR DELETE USING (auth.uid() = user_id);

-- 说明：
-- 1. auth.uid() 返回当前登录用户的 UUID
-- 2. user_id 是宠物表中的 UUID 字段
-- 3. 策略确保用户只能操作自己的数据
-- 4. 公开的宠物任何人都可以查看

-- 执行步骤：
-- 1. 在 Supabase SQL 编辑器中执行此脚本
-- 2. 刷新页面测试保存功能