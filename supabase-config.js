// Supabase配置文件
const SUPABASE_URL = 'https://aiigtntikyxqqqsmqidj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpaWd0bnRpa3l4cXFxc21xaWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTkyMTUsImV4cCI6MjA3ODA3NTIxNX0.MSwn6jJw-6WHplhEfe2JejM6aAVH_lmdnqhVWkkWLMQ';

// 数据库连接状态检测
let isDatabaseConnected = false;
let supabaseClient = null;

// 初始化Supabase客户端
async function initSupabaseClient() {
    return new Promise((resolve) => {
        try {
            // 确保supabase对象已加载
            if (typeof supabase === 'undefined') {
                console.error('Supabase库未加载，请检查CDN链接');
                resolve(null);
                return;
            }
            
            const { createClient } = supabase;
            supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            
            console.log('Supabase客户端初始化成功');
            resolve(supabaseClient);
        } catch (error) {
            console.error('Supabase客户端初始化失败:', error);
            resolve(null);
        }
    });
}

// 测试数据库连接
async function testDatabaseConnection() {
    try {
        console.log('开始测试数据库连接...');
        
        if (!supabaseClient) {
            console.error('Supabase客户端未初始化');
            isDatabaseConnected = false;
            return false;
        }
        
        console.log('Supabase客户端状态:', supabaseClient);
        
        // 先测试网络连接和API密钥
        console.log('测试网络连接和API密钥...');
        try {
            const response = await fetch(SUPABASE_URL + '/rest/v1/', {
                method: 'HEAD',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (!response.ok) {
                console.error('网络连接测试失败，状态码:', response.status);
                console.error('请检查: 1) Supabase URL是否正确 2) API密钥是否正确 3) 网络连接');
                isDatabaseConnected = false;
                return false;
            }
            
            console.log('网络连接和API密钥测试通过');
        } catch (fetchError) {
            console.error('网络连接测试异常:', fetchError.message);
            console.error('无法连接到Supabase服务器，请检查网络连接或URL设置');
            isDatabaseConnected = false;
            return false;
        }
        
        // 先测试认证连接
        const { data: authData, error: authError } = await supabaseClient.auth.getSession();
        
        if (authError) {
            console.warn('认证连接测试失败（不影响数据库连接）:', authError);
        } else {
            console.log('认证连接成功:', authData);
        }
        
        // 尝试查询一个简单的表来测试连接
        console.log('尝试查询数据库表...');
        const { data, error } = await supabaseClient
            .from('users')  // 改为查询users表，这个表是基础表
            .select('id')
            .limit(1);
            
        if (error) {
            console.error('数据库连接测试失败:', error);
            
            // 提供详细的错误信息和解决方案
            if (error.code === 'PGRST116') {
                console.error('❌ 错误: 表不存在');
                console.log('💡 解决方案: 请先在Supabase仪表板中运行以下SQL创建表:');
                console.log(`
-- 创建基础表结构
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(50),
    avatar_color CHAR(7) DEFAULT '#4CAF50',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    location VARCHAR(100),
    tags JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
                `);
            } else if (error.code === '42501') {
                console.error('❌ 错误: 权限不足');
                console.log('💡 解决方案: 请检查并设置RLS策略:');
                console.log(`
-- 在Supabase仪表板中设置RLS策略
-- 1. 进入Authentication > Policies
-- 2. 为users表启用RLS
-- 3. 添加以下策略（允许匿名访问）:

-- 允许任何人读取公开数据
CREATE POLICY "允许任何人读取用户数据" ON users
    FOR SELECT USING (true);

-- 允许已认证用户插入数据
CREATE POLICY "允许认证用户插入数据" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许用户更新自己的数据
CREATE POLICY "允许用户更新自己数据" ON users
    FOR UPDATE USING (auth_id = auth.uid());
                `);
            } else if (error.message.includes('fetch')) {
                console.error('❌ 错误: 网络连接失败');
                console.log('💡 解决方案: 检查以下内容:');
                console.log('1. Supabase URL是否正确: ' + SUPABASE_URL);
                console.log('2. API密钥是否正确: ' + SUPABASE_ANON_KEY.substring(0, 20) + '...');
                console.log('3. 网络连接是否正常');
                console.log('4. 防火墙或代理设置');
            } else {
                console.error('❌ 未知错误:', error);
                console.log('💡 请检查Supabase项目设置和数据库配置');
            }
            
            isDatabaseConnected = false;
            return false;
        }
        
        isDatabaseConnected = true;
        console.log('✅ 数据库连接成功!');
        console.log('测试查询结果:', data);
        return true;
    } catch (error) {
        console.error('❌ 数据库连接测试异常:', error);
        console.error('完整错误信息:', error);
        isDatabaseConnected = false;
        return false;
    }
}

// 页面加载时初始化Supabase
async function initPageSupabase() {
    console.log('开始初始化Supabase...');
    
    // 检查Supabase库是否已加载
    if (typeof supabase === 'undefined') {
        console.error('Supabase库未加载，请检查CDN链接');
        
        // 尝试加载Supabase CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';  // 更新到最新版本
        script.onload = async function() {
            console.log('Supabase库加载成功，开始初始化客户端...');
            await initializeSupabase();
        };
        script.onerror = function() {
            console.error('Supabase库加载失败，请检查网络连接');
            window.databaseInitialized = false;
            
            // 调用页面初始化完成回调
            if (window.onDatabaseInitialized) {
                window.onDatabaseInitialized(false);
            }
        };
        document.head.appendChild(script);
    } else {
        console.log('Supabase库已加载，开始初始化客户端...');
        await initializeSupabase();
    }
    
    async function initializeSupabase() {
        try {
            await initSupabaseClient();
            
            // 重新导出到全局作用域，确保supabaseClient已初始化
            window.supabaseClient = supabaseClient;
            
            console.log('开始测试数据库连接...');
            const connectionStatus = await testDatabaseConnection();
            
            if (!connectionStatus) {
                console.error('数据库连接失败，请检查以下问题:');
                console.error('1. Supabase URL和API密钥是否正确');
                console.error('2. 网络连接是否正常');
                console.error('3. 数据库表是否已创建');
                console.error('4. RLS策略是否配置正确');
                
                // 在页面上显示连接状态
                showDatabaseStatus('数据库连接失败，请检查控制台错误信息');
                
                // 提供具体的诊断信息
                await diagnoseConnectionIssue();
            } else {
                console.log('数据库连接成功，系统准备就绪');
                showDatabaseStatus('数据库连接成功');
            }
            
            // 设置数据库连接状态标记
            window.databaseInitialized = true;
            
            // 调用页面初始化完成回调
            if (window.onDatabaseInitialized) {
                window.onDatabaseInitialized(connectionStatus);
            }
        } catch (error) {
            console.error('初始化Supabase失败:', error);
            window.databaseInitialized = false;
            showDatabaseStatus('初始化失败: ' + error.message);
            
            // 调用页面初始化完成回调
            if (window.onDatabaseInitialized) {
                window.onDatabaseInitialized(false);
            }
        }
    }
    
    // 诊断连接问题
    async function diagnoseConnectionIssue() {
        console.log('开始诊断连接问题...');
        
        try {
            // 1. 测试Supabase URL可访问性
            console.log('测试Supabase URL可访问性...');
            const urlTest = await fetch(SUPABASE_URL + '/rest/v1/', {
                method: 'HEAD',
                headers: {
                    'apikey': SUPABASE_ANON_KEY
                }
            });
            
            if (urlTest.ok) {
                console.log('Supabase URL可访问性测试通过');
            } else {
                console.error('Supabase URL不可访问，状态码:', urlTest.status);
            }
        } catch (error) {
            console.error('URL可访问性测试失败:', error.message);
        }
        
        try {
            // 2. 测试认证连接
            console.log('测试认证连接...');
            const { data: session, error: authError } = await supabaseClient.auth.getSession();
            
            if (authError) {
                console.error('认证连接失败:', authError.message);
            } else {
                console.log('认证连接成功，会话状态:', session);
            }
        } catch (error) {
            console.error('认证连接测试失败:', error.message);
        }
        
        try {
            // 3. 测试数据库表访问
            console.log('测试数据库表访问...');
            const { data, error } = await supabaseClient
                .from('users')
                .select('id')
                .limit(1);
                
            if (error) {
                console.error('数据库表访问失败:', error);
                
                if (error.code === 'PGRST116') {
                    console.error('⚠️ 数据库表不存在，请先运行以下SQL创建表:');
                    console.log(`
-- 创建users表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(50),
    avatar_color CHAR(7) DEFAULT '#4CAF50',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建posts表
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    location VARCHAR(100),
    tags JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
                    `);
                }
            } else {
                console.log('数据库表访问成功，数据:', data);
            }
        } catch (error) {
            console.error('数据库表访问测试失败:', error.message);
        }
    }
    
    function showDatabaseStatus(message) {
        // 在页面顶部显示数据库连接状态
        const statusDiv = document.createElement('div');
        statusDiv.id = 'database-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            background: #f44336;
            color: white;
        `;
        statusDiv.textContent = message;
        
        // 如果连接成功，改为绿色
        if (message.includes('成功')) {
            statusDiv.style.background = '#4CAF50';
        }
        
        document.body.appendChild(statusDiv);
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 5000);
    }
}

// 简化版本的初始化函数
async function initializeSupabase() {
    console.log('开始简化版Supabase初始化...');
    
    try {
        // 确保supabase对象已加载
        if (typeof supabase === 'undefined') {
            console.error('Supabase库未加载');
            return false;
        }
        
        const { createClient } = supabase;
        window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('Supabase客户端初始化成功');
        
        // 测试连接
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('id')
            .limit(1);
            
        if (error) {
            console.error('数据库连接测试失败:', error);
            window.databaseInitialized = false;
            return false;
        }
        
        console.log('数据库连接成功');
        window.databaseInitialized = true;
        return true;
    } catch (error) {
        console.error('初始化Supabase失败:', error);
        window.databaseInitialized = false;
        return false;
    }
}

// 用户认证相关函数
class SupabaseAuth {
    // 用户注册
    static async signUp(email, password, username) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        display_name: username
                    }
                }
            });

            if (error) throw error;
            
            // 创建用户记录
            if (data.user) {
                console.log('准备创建用户记录，用户ID:', data.user.id);
                
                try {
                    const { data: userData, error: profileError } = await supabaseClient
                        .from('users')
                        .insert({
                            auth_id: data.user.id,  // 使用auth_id而不是id
                            username: username,
                            email: email,
                            display_name: username,
                            avatar_color: this.generateAvatarColor(),
                            is_active: true
                        })
                        .select();
                    
                    if (profileError) {
                        console.error('创建用户记录失败 - 详细错误:', profileError);
                        
                        // 如果是RLS策略错误，提供解决方案
                        if (profileError.code === '42501') {
                            console.warn('RLS策略阻止写入，需要设置"任何人都可以注册用户"策略');
                            return { 
                                success: false, 
                                error: 'RLS策略阻止写入用户信息，请检查数据库权限配置',
                                auth_success: true,
                                data: data
                            };
                        }
                        
                        // 其他错误也返回失败
                        return { 
                            success: false, 
                            error: '创建用户记录失败: ' + profileError.message,
                            auth_success: true
                        };
                    } else {
                        console.log('用户记录创建成功:', userData);
                        return { success: true, data: userData };
                    }
                } catch (dbError) {
                    console.error('创建用户记录时发生异常:', dbError);
                    return { 
                        success: false, 
                        error: '创建用户记录异常: ' + dbError.message,
                        auth_success: true
                    };
                }
            }
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登录
    static async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登出
    static async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取当前用户
    static getCurrentUser() {
        return supabaseClient.auth.getUser();
    }

    // 生成随机头像颜色
    static generateAvatarColor() {
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#673AB7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// 数据操作相关函数
class SupabaseData {
    // 获取用户信息
    static async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.log('数据库查询错误详情:', error);
                // 如果表不存在，尝试创建基础用户记录
                if (error.code === 'PGRST116') {
                    console.warn('用户表可能不存在，请先在Supabase中创建数据库表');
                    return { success: false, error: '数据库表未创建，请运行 database_schema.sql' };
                }
                throw error;
            }
            
            if (!data) {
                return { success: false, error: '用户不存在' };
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 通过用户名获取用户信息
    static async getUserByUsername(username) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                console.log('数据库查询错误详情:', error);
                // 如果表不存在，尝试创建基础用户记录
                if (error.code === 'PGRST116') {
                    console.warn('用户表可能不存在，请先在Supabase中创建数据库表');
                    return { success: false, error: '数据库表未创建，请运行 database_schema.sql' };
                }
                throw error;
            }
            
            if (!data) {
                return { success: false, error: '用户不存在' };
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取宠物列表
    static async getPets(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('pets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取宠物列表失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 创建宠物档案
    static async createPet(petData) {
        try {
            const { data, error } = await supabaseClient
                .from('pets')
                .insert([petData])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建宠物失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取动态列表
    static async getPosts(options = {}) {
        try {
            // 先获取posts数据
            let postsQuery = supabaseClient
                .from('posts')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            // 添加分页
            if (options.limit) {
                postsQuery = postsQuery.limit(options.limit);
            }

            const { data: postsData, error: postsError } = await postsQuery;

            if (postsError) throw postsError;

            // 如果没有数据，直接返回
            if (!postsData || postsData.length === 0) {
                return { success: true, data: [] };
            }

            // 获取相关的用户和宠物信息
            const userIds = [...new Set(postsData.map(post => post.user_id).filter(id => id))];
            const petIds = [...new Set(postsData.map(post => post.pet_id).filter(id => id))];

            // 获取用户信息
            let usersData = [];
            if (userIds.length > 0) {
                const { data: fetchedUsers, error: usersError } = await supabaseClient
                    .from('users')
                    .select('id, username, display_name, avatar_color')
                    .in('id', userIds);
                
                if (!usersError) {
                    usersData = fetchedUsers;
                }
            }

            // 获取宠物信息
            let petsData = [];
            if (petIds.length > 0) {
                const { data: fetchedPets, error: petsError } = await supabaseClient
                    .from('pets')
                    .select('id, name, pet_type, avatar_color')
                    .in('id', petIds);
                
                if (!petsError) {
                    petsData = fetchedPets;
                }
            }

            // 合并数据
            const data = postsData.map(post => ({
                ...post,
                users: usersData.find(user => user.id === post.user_id) || null,
                pets: petsData.find(pet => pet.id === post.pet_id) || null
            }));

            return { success: true, data };
        } catch (error) {
            console.error('获取动态失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 发布动态
    static async createPost(postData) {
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .insert([postData])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('发布动态失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新宠物信息
    static async updatePet(petId, petData) {
        try {
            const { data, error } = await supabaseClient
                .from('pets')
                .update(petData)
                .eq('id', petId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新宠物失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除宠物
    static async deletePet(petId) {
        try {
            const { error } = await supabaseClient
                .from('pets')
                .delete()
                .eq('id', petId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('删除宠物失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取养宠知识
    static async getKnowledgeArticles() {
        try {
            const { data, error } = await supabaseClient
                .from('knowledge_articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取知识文章失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 创建宠物记录
    static async createPetRecord(recordData) {
        try {
            const { data, error } = await supabaseClient
                .from('pet_records')
                .insert([recordData])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('创建宠物记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取宠物记录
    static async getPetRecords(petId) {
        try {
            const { data, error } = await supabaseClient
                .from('pet_records')
                .select('*')
                .eq('pet_id', petId)
                .order('record_date', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取宠物记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新宠物记录
    static async updatePetRecord(recordId, recordData) {
        try {
            const { data, error } = await supabaseClient
                .from('pet_records')
                .update(recordData)
                .eq('id', recordId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('更新宠物记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除宠物记录
    static async deletePetRecord(recordId) {
        try {
            const { error } = await supabaseClient
                .from('pet_records')
                .delete()
                .eq('id', recordId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('删除宠物记录失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 导出到全局作用域
window.SupabaseAuth = SupabaseAuth;
window.SupabaseData = SupabaseData;
window.supabaseClient = supabaseClient;
window.isDatabaseConnected = isDatabaseConnected;
window.testDatabaseConnection = testDatabaseConnection;