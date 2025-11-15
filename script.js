// 全局功能脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏活动状态
    initNavbar();
    
    // 初始化交互功能
    initInteractions();
    
    // 初始化快速入口按钮
    initQuickActions();
});

// 导航栏状态管理
function initNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 初始化交互功能
function initInteractions() {
    // 特色功能卡片点击
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            switch(title) {
                case '宠物档案':
                    window.location.href = 'pet-profile.html';
                    break;
                case '同城社交':
                case '养宠分享':
                    window.location.href = 'community.html';
                    break;
                default:
                    showToast(`进入${title}功能`);
            }
        });
    });

    // 养宠知识卡片点击
    const knowledgeCards = document.querySelectorAll('.knowledge-card');
    knowledgeCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showToast(`查看${title}详情`);
            // 这里可以添加显示知识详情的模态框
            showKnowledgeModal(title);
        });
    });

    // 同城动态卡片点击
    const trendCards = document.querySelectorAll('.trend-card');
    trendCards.forEach(card => {
        // 点赞功能
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('fa-heart') || 
                e.target.parentElement.classList.contains('fa-heart')) {
                e.preventDefault();
                e.stopPropagation();
                toggleLike(this);
            }
        });
        
        // 点击动态内容查看详情
        const content = card.querySelector('.trend-content p');
        content.addEventListener('click', function() {
            const username = card.querySelector('.username').textContent;
            const petName = card.querySelector('.pet-name').textContent;
            showToast(`查看${username}的${petName}动态详情`);
            showPostDetailModal(card);
        });
    });
    
    // 卡片悬停效果
    const cards = document.querySelectorAll('.feature-card, .trend-card, .service-card, .knowledge-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            this.style.cursor = 'pointer';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });
}

// 点赞功能实现
function toggleLike(card) {
    const heartIcon = card.querySelector('.fa-heart');
    if (heartIcon) {
        if (heartIcon.classList.contains('far')) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas', 'liked');
            heartIcon.style.color = '#E91E63';
            showToast('已点赞！');
        } else {
            heartIcon.classList.remove('fas', 'liked');
            heartIcon.classList.add('far');
            heartIcon.style.color = '';
            showToast('取消点赞');
        }
    }
}

// 快速入口按钮功能
function initQuickActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.querySelector('span').textContent;
            
            switch(text) {
                case '创建宠物档案':
                    window.location.href = 'pet-profile.html';
                    break;
                case '发布动态':
                    window.location.href = 'community.html';
                    break;
                case '养宠知识':
                    showToast('养宠知识库，助您科学养宠！');
                    // 滚动到知识部分
                    document.querySelector('.pet-knowledge').scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                    break;
                default:
                    showToast('功能即将上线，敬请期待！');
            }
        });
    });
}

// 显示提示消息
function showToast(message) {
    // 移除现有的提示
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新的提示
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .liked {
        animation: pulse 0.6s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
`;

document.head.appendChild(style);

// 表单验证功能（用于登录注册页面）
function validateForm(formData) {
    const errors = [];
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push('请输入有效的邮箱地址');
    }
    
    if (formData.password && formData.password.length < 6) {
        errors.push('密码至少需要6位字符');
    }
    
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.push('两次输入的密码不一致');
    }
    
    return errors;
}

// 模态框功能
function showKnowledgeModal(title) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>这里将显示${title}的详细内容。该功能需要连接Supabase数据库获取知识文章详情。</p>
                <p>您可以查看相关的养宠知识和技巧。</p>
            </div>
            <div class="modal-footer">
                <button class="close-btn">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // 关闭功能
    const closeBtns = modal.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showPostDetailModal(card) {
    const username = card.querySelector('.username').textContent;
    const petName = card.querySelector('.pet-name').textContent;
    const content = card.querySelector('.trend-content p').textContent;
    const location = card.querySelector('.trend-meta span:first-child').textContent;
    const time = card.querySelector('.trend-meta span:last-child').textContent;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="user-info">
                    <div class="avatar">${username.charAt(0)}</div>
                    <div>
                        <h3>${username}</h3>
                        <span>${petName}</span>
                    </div>
                </div>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="post-meta">
                    <span>${location}</span>
                    <span>${time}</span>
                </div>
                <div class="post-tags">
                    ${Array.from(card.querySelectorAll('.tag')).map(tag => tag.outerHTML).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn">
                    <i class="far fa-heart"></i>
                    点赞
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                    评论
                </button>
                <button class="close-btn">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // 关闭功能
    const closeBtns = modal.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 模态框功能
function showKnowledgeModal(title) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>这里将显示${title}的详细内容。该功能需要连接Supabase数据库获取知识文章详情。</p>
                <p>您可以查看相关的养宠知识和技巧。</p>
            </div>
            <div class="modal-footer">
                <button class="close-btn">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // 关闭功能
    const closeBtns = modal.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showPostDetailModal(card) {
    const username = card.querySelector('.username').textContent;
    const petName = card.querySelector('.pet-name').textContent;
    const content = card.querySelector('.trend-content p').textContent;
    const location = card.querySelector('.trend-meta span:first-child').textContent;
    const time = card.querySelector('.trend-meta span:last-child').textContent;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="user-info">
                    <div class="avatar">${username.charAt(0)}</div>
                    <div>
                        <h3>${username}</h3>
                        <span>${petName}</span>
                    </div>
                </div>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="post-meta">
                    <span>${location}</span>
                    <span>${time}</span>
                </div>
                <div class="post-tags">
                    ${Array.from(card.querySelectorAll('.tag')).map(tag => tag.outerHTML).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn">
                    <i class="far fa-heart"></i>
                    点赞
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                    评论
                </button>
                <button class="close-btn">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // 关闭功能
    const closeBtns = modal.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 本地存储功能
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('读取数据失败:', error);
        return null;
    }
}

// 导出功能供其他页面使用
window.PawPals = {
    validateForm,
    saveToLocalStorage,
    getFromLocalStorage,
    showToast
};