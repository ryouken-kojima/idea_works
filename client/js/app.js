const API_URL = 'http://localhost:3001/api';

const state = {
    user: null,
    token: localStorage.getItem('token')
};

const router = {
    '/': renderHome,
    '/login': renderLogin,
    '/register': renderRegister,
    '/dashboard': renderDashboard,
    '/ideas': renderIdeas,
    '/idea': renderIdeaDetail,
    '/post-idea': renderPostIdea
};

function navigateTo(path) {
    window.history.pushState({}, '', path);
    render();
}

function render() {
    const path = window.location.pathname;
    const handler = router[path] || renderHome;
    handler();
    updateNav();
}

function updateNav() {
    const navMenu = document.getElementById('nav-menu');
    
    if (state.token) {
        navMenu.innerHTML = `
            <a href="/dashboard" onclick="navigateTo('/dashboard'); return false;" class="text-gray-600 hover:text-indigo-600">ダッシュボード</a>
            <a href="/ideas" onclick="navigateTo('/ideas'); return false;" class="text-gray-600 hover:text-indigo-600">アイディア一覧</a>
            ${state.user?.role === 'client' ? '<a href="/post-idea" onclick="navigateTo(\'/post-idea\'); return false;" class="text-gray-600 hover:text-indigo-600">アイディア投稿</a>' : ''}
            <button onclick="logout()" class="text-red-600 hover:text-red-700">ログアウト</button>
        `;
    } else {
        navMenu.innerHTML = `
            <a href="/login" onclick="navigateTo('/login'); return false;" class="text-gray-600 hover:text-indigo-600">ログイン</a>
            <a href="/register" onclick="navigateTo('/register'); return false;" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">新規登録</a>
        `;
    }
}

function renderHome() {
    document.getElementById('main-content').innerHTML = `
        <div class="max-w-4xl mx-auto text-center py-16">
            <h2 class="text-4xl font-bold mb-6">アイディアを形にするMVP量産所</h2>
            <p class="text-xl text-gray-600 mb-8">日常の困りごとを投稿して、ライブコーダーが即席で開発</p>
            <div class="flex gap-4 justify-center">
                <a href="/register" onclick="navigateTo('/register'); return false;" class="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700">今すぐ始める</a>
                <a href="/ideas" onclick="navigateTo('/ideas'); return false;" class="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg hover:bg-indigo-50">アイディアを見る</a>
            </div>
        </div>
    `;
}

function renderLogin() {
    document.getElementById('main-content').innerHTML = `
        <div class="max-w-md mx-auto">
            <h2 class="text-2xl font-bold mb-6">ログイン</h2>
            <form onsubmit="handleLogin(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">メールアドレス</label>
                    <input type="email" name="email" required class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">パスワード</label>
                    <input type="password" name="password" required class="w-full border rounded px-3 py-2">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">ログイン</button>
            </form>
        </div>
    `;
}

function renderRegister() {
    document.getElementById('main-content').innerHTML = `
        <div class="max-w-md mx-auto">
            <h2 class="text-2xl font-bold mb-6">新規登録</h2>
            <form onsubmit="handleRegister(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">メールアドレス</label>
                    <input type="email" name="email" required class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">パスワード</label>
                    <input type="password" name="password" required class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">ロール</label>
                    <select name="role" required class="w-full border rounded px-3 py-2">
                        <option value="client">依頼者</option>
                        <option value="developer">開発者</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">登録</button>
            </form>
        </div>
    `;
}

async function renderDashboard() {
    if (!state.token) {
        navigateTo('/login');
        return;
    }

    const content = state.user?.role === 'client' 
        ? await renderClientDashboard()
        : await renderDeveloperDashboard();
    
    document.getElementById('main-content').innerHTML = content;
}

async function renderClientDashboard() {
    try {
        const response = await fetch(`${API_URL}/ideas/my/ideas`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const ideas = await response.json();
        
        return `
            <div>
                <h2 class="text-2xl font-bold mb-6">マイアイディア</h2>
                <div class="grid gap-4">
                    ${ideas.map(idea => `
                        <div class="bg-white p-4 rounded shadow">
                            <h3 class="text-lg font-semibold">${idea.title}</h3>
                            <p class="text-gray-600 mb-2">${idea.description}</p>
                            <span class="inline-block px-3 py-1 text-sm rounded-full 
                                ${idea.status === 'open' ? 'bg-green-100 text-green-800' : 
                                  idea.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'}">
                                ${idea.status === 'open' ? '募集中' : 
                                  idea.status === 'in_progress' ? '開発中' : '完了'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        return '<p>エラーが発生しました</p>';
    }
}

async function renderDeveloperDashboard() {
    try {
        const response = await fetch(`${API_URL}/developments/my/developments`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const developments = await response.json();
        
        return `
            <div>
                <h2 class="text-2xl font-bold mb-6">開発中のアイディア</h2>
                <div class="grid gap-4">
                    ${developments.map(dev => `
                        <div class="bg-white p-4 rounded shadow">
                            <h3 class="text-lg font-semibold">${dev.title}</h3>
                            <p class="text-gray-600 mb-2">${dev.description}</p>
                            ${dev.status === 'started' ? `
                                <form onsubmit="handleSubmitDeliverable(event, ${dev.id})">
                                    <input type="url" name="url" placeholder="成果物URL" required 
                                           class="w-full border rounded px-3 py-2 mb-2">
                                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        成果物を提出
                                    </button>
                                </form>
                            ` : `
                                <p class="text-green-600">完了: ${dev.deliverable_url}</p>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        return '<p>エラーが発生しました</p>';
    }
}

async function renderIdeas() {
    try {
        const response = await fetch(`${API_URL}/ideas`);
        const ideas = await response.json();
        
        document.getElementById('main-content').innerHTML = `
            <div>
                <h2 class="text-2xl font-bold mb-6">募集中のアイディア</h2>
                <div class="grid gap-4">
                    ${ideas.map(idea => `
                        <div class="bg-white p-4 rounded shadow">
                            <h3 class="text-lg font-semibold">${idea.title}</h3>
                            <p class="text-gray-600 mb-2">${idea.description}</p>
                            <p class="text-sm text-gray-500 mb-2">投稿者: ${idea.user_email}</p>
                            ${idea.budget ? `<p class="text-sm font-semibold mb-2">予算: ¥${idea.budget.toLocaleString()}</p>` : ''}
                            ${state.user?.role === 'developer' ? `
                                <button onclick="startDevelopment(${idea.id})" 
                                        class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                    開発を始める
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('main-content').innerHTML = '<p>エラーが発生しました</p>';
    }
}

function renderPostIdea() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }

    document.getElementById('main-content').innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-6">アイディアを投稿</h2>
            <form onsubmit="handlePostIdea(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">タイトル</label>
                    <input type="text" name="title" required class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">詳細説明</label>
                    <textarea name="description" rows="5" required class="w-full border rounded px-3 py-2"></textarea>
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">予算（任意）</label>
                    <input type="number" name="budget" class="w-full border rounded px-3 py-2">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">投稿</button>
            </form>
        </div>
    `;
}

function renderIdeaDetail() {
    // Implementation for idea detail view
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            navigateTo('/dashboard');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role')
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            navigateTo('/dashboard');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function handlePostIdea(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${API_URL}/ideas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                budget: formData.get('budget') || null
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            navigateTo('/dashboard');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function startDevelopment(ideaId) {
    try {
        const response = await fetch(`${API_URL}/developments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ idea_id: ideaId })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('開発を開始しました');
            navigateTo('/dashboard');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function handleSubmitDeliverable(event, developmentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${API_URL}/developments/${developmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                deliverable_url: formData.get('url')
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('成果物を提出しました');
            renderDashboard();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    navigateTo('/');
}

async function checkAuth() {
    if (state.token) {
        try {
            const decoded = JSON.parse(atob(state.token.split('.')[1]));
            state.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        } catch (error) {
            state.token = null;
            localStorage.removeItem('token');
        }
    }
}

window.navigateTo = navigateTo;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handlePostIdea = handlePostIdea;
window.startDevelopment = startDevelopment;
window.handleSubmitDeliverable = handleSubmitDeliverable;
window.logout = logout;

window.addEventListener('popstate', render);
checkAuth();
render();