// 简化版Supabase配置文件
// 专注于解决数据库连接问题

const SUPABASE_URL = 'https://aiigtntikyxqqqsmqidj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpaWd0bnRpa3l4cXFxc21xaWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTkyMTUsImV4cCI6MjA3ODA3NTIxNX0.MSwn6jJw-6WHplhEfe2JejM6aAVH_lmdnqhVWkkWLMQ';

// 全局数据库连接状态
window.databaseConnected = false;
window.databaseError = null;

// 简单的数据库连接测试
async function checkDatabaseConnection() {
    console.log('开始检查数据库连接...');
    
    try {
        // 检查Supabase库是否已加载
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase库未加载');
            window.databaseError = 'Supabase库未加载，请检查CDN连接';
            return false;
        }
        
        // 创建客户端
        const { createClient } = supabase;
        window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false
            }
        });
        
        console.log('✅ Supabase客户端创建成功');
        
        // 测试网络连接
        console.log('测试网络连接...');
        const response = await fetch(SUPABASE_URL + '/rest/v1/', {
            method: 'HEAD',
            headers: {
                'apikey': SUPABASE_ANON_KEY
            }
        });
        
        if (!response.ok) {
            console.error('❌ 网络连接失败，状态码:', response.status);
            window.databaseError = `网络连接失败 (${response.status})`;
            return false;
        }
        
        console.log('✅ 网络连接正常');
        
        // 测试数据库表访问
        console.log('测试数据库表访问...');
        const { data, error } = await window.supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ 数据库访问失败:', error);
            
            if (error.code === 'PGRST116') {
                window.databaseError = '数据库表不存在，请先创建表';
                console.log('💡 解决方案: 在Supabase中运行以下SQL:');
                console.log(`
-- 创建基础表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(50),
    avatar_color CHAR(7) DEFAULT '#4CAF50',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    location VARCHAR(100),
    tags TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
                `);
            } else if (error.code === '42501') {
                window.databaseError = '权限不足，请检查RLS策略';
            } else {
                window.databaseError = error.message;
            }
            
            return false;
        }
        
        console.log('✅ 数据库连接成功');
        window.databaseConnected = true;
        window.databaseError = null;
        return true;
        
    } catch (error) {
        console.error('❌ 连接测试异常:', error);
        window.databaseError = error.message;
        return false;
    }
}

// 页面初始化函数
async function initDatabase() {
    console.log('初始化数据库连接...');
    
    // 显示加载状态
    showLoadingMessage('正在连接数据库...');
    
    const connected = await checkDatabaseConnection();
    
    hideLoadingMessage();
    
    if (connected) {
        console.log('🎉 数据库连接成功！');
        showSuccessMessage('数据库连接成功');
        return true;
    } else {
        console.error('💥 数据库连接失败');
        showErrorMessage('数据库连接失败: ' + (window.databaseError || '未知错误'));
        return false;
    }
}

// 显示加载消息
function showLoadingMessage(message) {
    const existing = document.getElementById('db-loading');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'db-loading';
    div.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <div class="spinner"></div>
            <span>${message}</span>
        </div>
    `;
    
    // 添加CSS样式
    if (!document.querySelector('#db-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'db-spinner-style';
        style.textContent = `
            .spinner {
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top: 2px solid white;
                width: 16px;
                height: 16px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(div);
}

// 隐藏加载消息
function hideLoadingMessage() {
    const loading = document.getElementById('db-loading');
    if (loading) loading.remove();
}

// 显示成功消息
function showSuccessMessage(message) {
    const existing = document.getElementById('db-status');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'db-status';
    div.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(div);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 3000);
}

// 显示错误消息
function showErrorMessage(message) {
    const existing = document.getElementById('db-status');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'db-status';
    div.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <a href="database-debug.html" style="
                color: white;
                text-decoration: underline;
                margin-left: 10px;
                font-size: 12px;
            ">诊断</a>
        </div>
    `;
    
    document.body.appendChild(div);
    
    // 10秒后自动隐藏
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 10000);
}

// 页面加载后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initDatabase, 1000);
    });
} else {
    setTimeout(initDatabase, 1000);
}

// 导出函数
window.checkDatabaseConnection = checkDatabaseConnection;
window.initDatabase = initDatabase;