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
                    <label class="block text-gray-700 mb-2">ユーザー名</label>
                    <input type="text" name="username" required class="w-full border rounded px-3 py-2" 
                           placeholder="表示名として使用されます">
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
                        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                             onclick="navigateTo('/idea?id=${idea.id}')">
                            <h3 class="text-lg font-semibold">${idea.title}</h3>
                            <p class="text-gray-600 mb-2">${idea.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="inline-block px-3 py-1 text-sm rounded-full 
                                    ${idea.status === 'open' ? 'bg-green-100 text-green-800' : 
                                      idea.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                      idea.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                      'bg-blue-100 text-blue-800'}">
                                    ${idea.status === 'open' ? '公開募集中' : 
                                      idea.status === 'in_progress' ? '開発中' :
                                      idea.status === 'completed' ? '完了' : ''}
                                </span>
                                <button onclick="event.stopPropagation(); navigateTo('/idea?id=${idea.id}')" 
                                        class="text-blue-600 hover:underline">
                                    詳細を見る
                                </button>
                            </div>
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
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold mb-8 text-center">公開アイディア一覧</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${ideas.map(idea => `
                        <div class="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
                             onclick="navigateTo('/idea?id=${idea.id}')">
                            <!-- サムネイル -->
                            <div class="aspect-w-16 aspect-h-12 overflow-hidden bg-gray-200">
                                ${idea.thumbnail ? `
                                    <img src="${idea.thumbnail}" alt="${idea.title}" 
                                         class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300">
                                ` : `
                                    <div class="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                `}
                            </div>
                            
                            <!-- コンテンツ -->
                            <div class="p-4 bg-white">
                                <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${idea.title}</h3>
                                <div class="flex items-center justify-between">
                                    <span class="text-2xl font-bold text-indigo-600">
                                        ${idea.budget ? `¥${idea.budget.toLocaleString()}` : '要相談'}
                                    </span>
                                    <span class="text-xs text-gray-500">
                                        by ${idea.username || idea.user_email}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- ステータスバッジ -->
                            <div class="absolute top-2 right-2">
                                <span class="text-xs px-2 py-1 rounded-full ${
                                    idea.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    idea.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                                    idea.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                }">
                                    ${idea.status === 'in_progress' ? '開発中' :
                                      idea.status === 'delivered' ? '納品済み' :
                                      idea.status === 'completed' ? '完了' : '募集中'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${ideas.length === 0 ? `
                    <div class="text-center py-12">
                        <p class="text-gray-500 text-lg">現在、公開されているアイディアはありません</p>
                    </div>
                ` : ''}
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
                    <input type="text" name="title" id="idea-title" required class="w-full border rounded px-3 py-2" onchange="enableThumbnailGeneration()">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">詳細説明</label>
                    <textarea name="description" rows="5" required class="w-full border rounded px-3 py-2"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">サムネイル画像</label>
                    <div id="thumbnail-container" class="mb-3">
                        <div id="thumbnail-preview" class="hidden mb-3">
                            <img id="thumbnail-image" src="" alt="サムネイルプレビュー" class="w-full max-w-md mx-auto rounded-lg shadow-lg">
                        </div>
                        <div id="thumbnail-placeholder" class="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                            <p>タイトルを入力してサムネイルを生成してください</p>
                        </div>
                    </div>
                    <button type="button" id="generate-thumbnail-btn" onclick="generateThumbnail()" disabled class="mb-2 px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700">
                        AIでサムネイルを生成
                    </button>
                    <input type="hidden" name="thumbnail" id="thumbnail-url">
                    <p class="text-xs text-gray-500 mt-1">タイトルからAIが自動でサムネイルを生成します。何度でも再生成できます。</p>
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

async function renderIdeaDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('id');
    
    if (!ideaId) {
        document.getElementById('main-content').innerHTML = '<p>アイディアが見つかりません</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ideas/${ideaId}`);
        const idea = await response.json();
        
        const isOwner = state.user && state.user.id === idea.user_id;
        const isDeveloper = state.user && state.user.role === 'developer';
        
        document.getElementById('main-content').innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white p-6 rounded shadow">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold">${idea.title}</h2>
                        ${isOwner ? `
                            <button onclick="deleteIdea(${ideaId})" 
                                    class="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                    title="ゴミ箱に移動">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <p class="text-gray-600 mb-4">${idea.description}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <span class="text-sm text-gray-500">投稿者:</span>
                            <p>${idea.username || idea.user_email}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">公開設定:</span>
                            ${isOwner ? `
                                <label class="inline-flex items-center cursor-pointer ml-2">
                                    <input type="checkbox" 
                                           id="is-public-toggle" 
                                           ${idea.is_public ? 'checked' : ''} 
                                           onchange="updateIdeaVisibility(${ideaId})"
                                           class="sr-only peer">
                                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    <span class="ms-2 text-sm font-medium text-gray-900">
                                        ${idea.is_public ? '公開' : '非公開'}
                                    </span>
                                </label>
                            ` : `
                                <span class="inline-block px-3 py-1 text-sm rounded-full 
                                    ${idea.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${idea.is_public ? '公開' : '非公開'}
                                </span>
                            `}
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">ステータス:</span>
                            <span class="inline-block px-3 py-1 text-sm rounded-full 
                                ${idea.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                                  idea.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  idea.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                                  idea.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'}">
                                ${idea.status === 'open' ? '募集中' : 
                                  idea.status === 'in_progress' ? '依頼中' :
                                  idea.status === 'delivered' ? '納品済み' :
                                  idea.status === 'completed' ? '完了' : ''}
                            </span>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">予算:</span>
                            ${isOwner ? `
                                <input type="number" id="budget-input" value="${idea.budget || ''}" 
                                       onchange="updateIdeaBudget(${ideaId})"
                                       placeholder="未設定"
                                       class="mt-1 px-2 py-1 border rounded">
                            ` : `
                                <p>${idea.budget ? `¥${idea.budget.toLocaleString()}` : '未設定'}</p>
                            `}
                        </div>
                        ${idea.development_id ? `
                        <div>
                            <span class="text-sm text-gray-500">開発者:</span>
                            <p>${idea.developer_username || idea.developer_email}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${idea.deliverable_url ? `
                        <div class="mb-6 p-4 bg-green-50 rounded">
                            <h3 class="font-semibold mb-2">成果物</h3>
                            <a href="${idea.deliverable_url}" target="_blank" class="text-blue-600 hover:underline">
                                ${idea.deliverable_url}
                            </a>
                        </div>
                    ` : ''}
                    
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">要件定義</h3>
                        ${idea.requirements ? `
                            <div id="requirements-display">
                                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div class="markdown-content">${marked.parse(idea.requirements)}</div>
                                </div>
                                ${isOwner ? `
                                    <button onclick="toggleRequirementsEdit()" class="mt-4 text-blue-600 hover:underline">
                                        要件定義を編集
                                    </button>
                                ` : ''}
                            </div>
                        ` : `
                            ${isOwner ? `
                                <div class="bg-yellow-50 p-4 rounded mb-4">
                                    <p class="mb-4">まだ要件定義が作成されていません。AIに下書きを作成させることができます。</p>
                                    <button onclick="generateRequirements(${ideaId})" 
                                            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        AIで要件定義を生成
                                    </button>
                                </div>
                            ` : '<p class="text-gray-500">要件定義はまだ作成されていません。</p>'}
                        `}
                        
                        <div id="requirements-edit" class="hidden">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <h4 class="text-sm font-semibold text-gray-700 mb-2">編集（マークダウン形式）</h4>
                                    <textarea id="requirements-textarea" rows="20" 
                                              onkeyup="updatePreview()"
                                              class="w-full border rounded px-3 py-2 font-mono text-sm">${idea.requirements || ''}</textarea>
                                </div>
                                <div>
                                    <h4 class="text-sm font-semibold text-gray-700 mb-2">プレビュー</h4>
                                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 h-[480px] overflow-y-auto">
                                        <div id="requirements-preview" class="markdown-content"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick="saveRequirements(${ideaId})" 
                                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    保存
                                </button>
                                <button onclick="toggleRequirementsEdit()" 
                                        class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${isDeveloper && idea.status === 'open' && !idea.development_id ? `
                        <button onclick="handleStartDevelopment(${ideaId})" 
                                class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                            開発を開始する
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('main-content').innerHTML = '<p>エラーが発生しました</p>';
    }
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
                budget: formData.get('budget') || null,
                thumbnail: formData.get('thumbnail') || null
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
    if (!state.token) {
        alert('ログインが必要です');
        navigateTo('/login');
        return;
    }
    
    if (confirm('この開発を開始しますか？')) {
        try {
            const response = await fetch(`${API_URL}/developments/start`, {
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

async function generateRequirements(ideaId) {
    if (!state.token) {
        alert('ログインが必要です');
        return;
    }
    
    // ローディングオーバーレイを表示
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loader mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold mb-2">AI要件定義を生成中<span class="loading-dots"></span></h3>
            <p class="text-gray-600 text-sm">アイディアを分析して最適な要件定義を作成しています</p>
            <p class="text-gray-500 text-xs mt-2">通常10〜30秒程度かかります</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    try {
        const button = event.target;
        button.disabled = true;
        
        const response = await fetch(`${API_URL}/ideas/${ideaId}/generate-requirements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (response.ok) {
            // 生成された要件定義を表示して編集モードに
            document.getElementById('requirements-textarea').value = data.requirements;
            toggleRequirementsEdit();
            
            // 成功メッセージを一瞬表示
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
            successMessage.textContent = '要件定義の生成が完了しました！';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
        } else {
            alert(data.error || '要件定義の生成に失敗しました');
            button.disabled = false;
        }
    } catch (error) {
        alert('エラーが発生しました');
        const button = event.target;
        button.disabled = false;
    } finally {
        // ローディングオーバーレイを削除
        loadingOverlay.remove();
    }
}

function toggleRequirementsEdit() {
    const displayDiv = document.getElementById('requirements-display');
    const editDiv = document.getElementById('requirements-edit');
    
    if (displayDiv) {
        displayDiv.classList.toggle('hidden');
    }
    editDiv.classList.toggle('hidden');
    
    // 編集モードに入ったらプレビューを更新
    if (!editDiv.classList.contains('hidden')) {
        updatePreview();
    }
}

function updatePreview() {
    const textarea = document.getElementById('requirements-textarea');
    const preview = document.getElementById('requirements-preview');
    
    if (textarea && preview) {
        const markdown = textarea.value;
        preview.innerHTML = marked.parse(markdown || '*(プレビューがここに表示されます)*');
    }
}

async function saveRequirements(ideaId) {
    if (!state.token) {
        alert('ログインが必要です');
        return;
    }
    
    const requirements = document.getElementById('requirements-textarea').value;
    
    if (!requirements.trim()) {
        alert('要件定義を入力してください');
        return;
    }
    
    // 簡易ローディング表示
    const saveButton = event.target;
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="inline-block animate-spin mr-2">⚪</span>保存中...';
    
    try {
        const response = await fetch(`${API_URL}/ideas/${ideaId}/requirements`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requirements })
        });
        
        const data = await response.json();
        if (response.ok) {
            // 成功メッセージを表示
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
            successMessage.textContent = '要件定義を保存しました';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
            
            renderIdeaDetail(); // 画面を再レンダリング
        } else {
            alert(data.error || '保存に失敗しました');
            saveButton.disabled = false;
            saveButton.textContent = originalText;
        }
    } catch (error) {
        alert('エラーが発生しました');
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

async function handleStartDevelopment(ideaId) {
    if (!state.token) {
        alert('ログインが必要です');
        return;
    }
    
    if (confirm('この開発を開始しますか？')) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span class="inline-block animate-spin mr-2">⚪</span>処理中...';
        
        try {
            const response = await fetch(`${API_URL}/developments/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idea_id: ideaId })
            });
            
            const data = await response.json();
            if (response.ok) {
                // 成功メッセージを表示
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
                successMessage.textContent = '開発を開始しました！';
                document.body.appendChild(successMessage);
                setTimeout(() => successMessage.remove(), 3000);
                
                renderIdeaDetail(); // 画面を再レンダリング
            } else {
                alert(data.error || '開発開始に失敗しました');
                button.disabled = false;
                button.textContent = originalText;
            }
        } catch (error) {
            alert('エラーが発生しました');
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

async function updateIdeaVisibility(ideaId) {
    const toggle = document.getElementById('is-public-toggle');
    const isPublic = toggle.checked;
    
    try {
        const response = await fetch(`${API_URL}/ideas/${ideaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_public: isPublic })
        });
        
        if (response.ok) {
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
            successMessage.textContent = `アイデアを${isPublic ? '公開' : '非公開'}に設定しました`;
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
            
            // ラベルのテキストを更新
            const label = toggle.parentElement.querySelector('span');
            if (label) {
                label.textContent = isPublic ? '公開' : '非公開';
            }
        } else {
            alert('公開設定の更新に失敗しました');
            toggle.checked = !isPublic; // 元に戻す
        }
    } catch (error) {
        alert('エラーが発生しました');
        toggle.checked = !isPublic; // 元に戻す
    }
}

async function updateIdeaBudget(ideaId) {
    const budgetInput = document.getElementById('budget-input');
    const newBudget = budgetInput.value ? parseInt(budgetInput.value) : null;
    
    try {
        const response = await fetch(`${API_URL}/ideas/${ideaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ budget: newBudget })
        });
        
        if (response.ok) {
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
            successMessage.textContent = '予算を更新しました';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
        } else {
            alert('予算の更新に失敗しました');
            renderIdeaDetail(); // 元に戻す
        }
    } catch (error) {
        alert('エラーが発生しました');
        renderIdeaDetail(); // 元に戻す
    }
}

async function deleteIdea(ideaId) {
    if (!state.token) {
        alert('ログインが必要です');
        return;
    }
    
    if (confirm('このアイディアをゴミ箱に移動しますか？')) {
        try {
            const response = await fetch(`${API_URL}/ideas/${ideaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
            
            if (response.ok) {
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
                successMessage.textContent = 'アイディアをゴミ箱に移動しました';
                document.body.appendChild(successMessage);
                setTimeout(() => successMessage.remove(), 3000);
                
                // ダッシュボードに戻る
                navigateTo('/dashboard');
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            alert('エラーが発生しました');
        }
    }
}

async function checkAuth() {
    if (state.token) {
        try {
            const decoded = JSON.parse(atob(state.token.split('.')[1]));
            state.user = { id: decoded.id, email: decoded.email, username: decoded.username, role: decoded.role };
        } catch (error) {
            state.token = null;
            localStorage.removeItem('token');
        }
    }
}

// Enable thumbnail generation button when title is entered
function enableThumbnailGeneration() {
    const titleInput = document.getElementById('idea-title');
    const generateBtn = document.getElementById('generate-thumbnail-btn');
    
    if (titleInput && generateBtn) {
        generateBtn.disabled = !titleInput.value.trim();
    }
}

// Generate thumbnail using AI
async function generateThumbnail() {
    const titleInput = document.getElementById('idea-title');
    const title = titleInput?.value.trim();
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    
    const generateBtn = document.getElementById('generate-thumbnail-btn');
    const thumbnailPlaceholder = document.getElementById('thumbnail-placeholder');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const thumbnailImage = document.getElementById('thumbnail-image');
    const thumbnailUrl = document.getElementById('thumbnail-url');
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="loader inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>生成中...';
    
    try {
        // Generate thumbnail
        const response = await fetch(`${API_URL}/ideas/generate-thumbnail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate thumbnail');
        }
        
        const data = await response.json();
        
        // Update UI with generated thumbnail
        thumbnailUrl.value = data.thumbnail;
        thumbnailImage.src = data.thumbnail;
        thumbnailPlaceholder.classList.add('hidden');
        thumbnailPreview.classList.remove('hidden');
        
    } catch (error) {
        alert('サムネイル生成に失敗しました: ' + error.message);
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.innerHTML = '再生成する';
    }
}

window.navigateTo = navigateTo;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handlePostIdea = handlePostIdea;
window.startDevelopment = startDevelopment;
window.handleSubmitDeliverable = handleSubmitDeliverable;
window.logout = logout;
window.generateRequirements = generateRequirements;
window.toggleRequirementsEdit = toggleRequirementsEdit;
window.saveRequirements = saveRequirements;
window.handleStartDevelopment = handleStartDevelopment;
window.updatePreview = updatePreview;
window.updateIdeaVisibility = updateIdeaVisibility;
window.updateIdeaBudget = updateIdeaBudget;
window.deleteIdea = deleteIdea;
window.enableThumbnailGeneration = enableThumbnailGeneration;
window.generateThumbnail = generateThumbnail;

window.addEventListener('popstate', render);
checkAuth();
render();