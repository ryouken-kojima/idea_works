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
    '/post-idea': renderPostIdea,
    '/chat': renderChat,
    '/requests': renderRequests,
    '/request': renderRequestDetail,
    '/development': renderDevelopmentDetail
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
            <a href="/requests" onclick="navigateTo('/requests'); return false;" class="text-gray-600 hover:text-indigo-600">開発リクエスト</a>
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
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await response.json();
        const ideas = data.ideas || [];
        const developments = data.developments || [];
        
        return `
            <div>
                ${developments.length > 0 ? `
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">進行中の開発プロジェクト</h2>
                        <div class="grid gap-4">
                            ${developments.map(dev => `
                                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                                     onclick="navigateTo('/development?id=${dev.id}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h3 class="text-lg font-semibold text-blue-900">${dev.idea_title}</h3>
                                            <p class="text-sm text-gray-600">開発者: ${dev.developer_username}</p>
                                            <p class="text-xs text-gray-500">開始日: ${new Date(dev.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                            開発詳細へ
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <h2 class="text-2xl font-bold mb-6">マイアイディア</h2>
                <div class="grid gap-4">
                    ${ideas.map(idea => `
                        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                             onclick="navigateTo('/idea?id=${idea.id}')">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold">${idea.title}</h3>
                                    <p class="text-gray-600 mb-2">${idea.description}</p>
                                </div>
                                ${idea.pending_requests_count > 0 ? `
                                    <div class="ml-4 text-center">
                                        <div class="text-2xl font-bold text-orange-600">${idea.pending_requests_count}</div>
                                        <div class="text-xs text-gray-600">リクエスト</div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="flex justify-between items-center mt-2">
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
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await response.json();
        const developments = data.developments || [];
        const requests = data.requests || [];
        
        return `
            <div>
                ${developments.length > 0 ? `
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">進行中の開発プロジェクト</h2>
                        <div class="grid gap-4">
                            ${developments.map(dev => `
                                <div class="bg-green-50 border border-green-200 p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                                     onclick="navigateTo('/development?id=${dev.id}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h3 class="text-lg font-semibold text-green-900">${dev.idea_title}</h3>
                                            <p class="text-sm text-gray-600">依頼者: ${dev.client_username}</p>
                                            <p class="text-xs text-gray-500">開始日: ${new Date(dev.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                            開発詳細へ
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${requests.length > 0 ? `
                    <div>
                        <h2 class="text-2xl font-bold mb-4">開発リクエスト</h2>
                        <div class="grid gap-4">
                            ${requests.map(req => `
                                <div class="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                                     onclick="navigateTo('/request?id=${req.id}')">
                                    <h3 class="text-lg font-semibold">${req.title}</h3>
                                    <p class="text-gray-600 mb-2">${req.description}</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">アイデア: ${req.idea_title}</span>
                                        <span class="px-3 py-1 text-sm rounded-full ${
                                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            req.status === 'accepted' || req.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }">
                                            ${getStatusLabel(req.status)}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
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
                                ${idea.pending_requests_count > 0 ? `
                                    <div class="mt-2 text-sm text-orange-600 font-semibold">
                                        🔔 ${idea.pending_requests_count}件の開発リクエスト
                                    </div>
                                ` : ''}
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

async function renderChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('ideaId');
    
    if (!state.token) {
        navigateTo('/login');
        return;
    }
    
    if (!ideaId) {
        document.getElementById('main-content').innerHTML = '<p>アイデアが指定されていません</p>';
        return;
    }
    
    try {
        // アイデア情報を取得
        const ideaResponse = await fetch(`${API_URL}/ideas/${ideaId}`);
        if (!ideaResponse.ok) {
            throw new Error('アイデア情報の取得に失敗しました');
        }
        const idea = await ideaResponse.json();
        
        // チャットメッセージを取得
        const messagesResponse = await fetch(`${API_URL}/chat/messages/${ideaId}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (!messagesResponse.ok && messagesResponse.status === 401) {
            // 認証エラーの場合はログイン画面へ
            navigateTo('/login');
            return;
        }
        
        const chatMessages = messagesResponse.ok ? await messagesResponse.json() : [];
        
        document.getElementById('main-content').innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex flex-col">
                    <!-- ヘッダー -->
                    <div class="border-b p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-xl font-semibold">${idea.title}</h2>
                                <p class="text-sm text-gray-600">
                                    ${state.user.role === 'client' ? '開発者とのやりとり' : 'クライアントとのやりとり'}
                                </p>
                            </div>
                            <button onclick="navigateTo('/idea?id=${ideaId}')" 
                                    class="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- メッセージエリア -->
                    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
                        ${chatMessages.length === 0 ? `
                            <div class="text-center text-gray-500 mt-8">
                                <p>メッセージはまだありません</p>
                                <p class="text-sm mt-2">最初のメッセージを送って会話を始めましょう！</p>
                            </div>
                        ` : chatMessages.map(msg => `
                            <div class="flex ${msg.sender_id === state.user.id ? 'justify-end' : 'justify-start'}">
                                <div class="max-w-xs lg:max-w-md">
                                    <div class="${msg.sender_id === state.user.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-800'} 
                                        rounded-lg px-4 py-2">
                                        <p class="text-sm">${msg.message}</p>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1 ${msg.sender_id === state.user.id ? 'text-right' : ''}">
                                        ${new Date(msg.created_at).toLocaleString('ja-JP', { 
                                            month: 'numeric', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 入力エリア -->
                    <div class="border-t p-4">
                        <form onsubmit="handleSendMessage(event, ${ideaId})" class="flex gap-2">
                            <input type="text" 
                                   name="message"
                                   placeholder="メッセージを入力..."
                                   required
                                   class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <button type="submit" 
                                    class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
                                送信
                            </button>
                        </form>
                        
                        ${state.user.role === 'developer' && idea.status === 'open' && !idea.development_id ? `
                            <div class="mt-4 text-center">
                                <p class="text-sm text-gray-600 mb-2">やりとりを通じて要件が明確になりましたか？</p>
                                <button onclick="handleSendDevelopmentRequest(${ideaId})" 
                                        class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors">
                                    開発依頼リクエストを送る
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // メッセージエリアを最下部にスクロール
        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // 入力欄にフォーカスを設定
        const messageInput = document.querySelector('input[name="message"]');
        if (messageInput) {
            messageInput.focus();
        }
        
        // 定期的にメッセージを更新（ポーリング）
        const pollingInterval = setInterval(async () => {
            // 現在のパスがチャット画面でない場合は停止
            if (window.location.pathname !== '/chat') {
                clearInterval(pollingInterval);
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/chat/messages/${ideaId}`, {
                    headers: { 'Authorization': `Bearer ${state.token}` }
                });
                
                if (response.ok) {
                    const newMessages = await response.json();
                    if (newMessages.length > chatMessages.length) {
                        // 新しいメッセージがある場合は画面を更新
                        renderChat();
                    }
                } else if (response.status === 401) {
                    // 認証エラーの場合はポーリングを停止
                    clearInterval(pollingInterval);
                    navigateTo('/login');
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        }, 3000); // 3秒ごとに更新
        
    } catch (error) {
        document.getElementById('main-content').innerHTML = '<p>エラーが発生しました</p>';
    }
}

async function renderIdeaDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('id');
    
    if (!ideaId) {
        document.getElementById('main-content').innerHTML = '<p>アイディアが見つかりません</p>';
        return;
    }
    
    try {
        const [ideaResponse, requestsResponse] = await Promise.all([
            fetch(`${API_URL}/ideas/${ideaId}`),
            fetch(`${API_URL}/ideas/${ideaId}/requests`)
        ]);
        
        const idea = await ideaResponse.json();
        const requests = await requestsResponse.json();
        
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
                        <div class="flex gap-4">
                            <button onclick="showDevelopmentRequestModal(${ideaId})" 
                                    class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                                開発リクエストを送る
                            </button>
                        </div>
                    ` : ''}
                    
                    ${(isOwner || isDeveloper) && idea.activeDevelopment ? `
                        <button onclick="navigateTo('/development?id=${idea.activeDevelopment.id}')" 
                                class="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                            開発詳細を見る
                        </button>
                    ` : ''}
                </div>
                
                ${isOwner && requests.length > 0 ? `
                    <div class="mt-6">
                        <h3 class="text-xl font-bold mb-4">開発リクエスト (${requests.length}件)</h3>
                        <div class="space-y-4">
                            ${requests.map(request => `
                                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h4 class="font-semibold">${request.title}</h4>
                                            <p class="text-gray-600 text-sm mt-1">${request.description}</p>
                                            <div class="flex gap-4 mt-2 text-sm text-gray-500">
                                                <span>開発者: ${request.developer_username}</span>
                                                ${request.proposed_budget ? `<span>提案予算: ¥${request.proposed_budget.toLocaleString()}</span>` : ''}
                                                ${request.proposed_deadline ? `<span>提案納期: ${new Date(request.proposed_deadline).toLocaleDateString()}</span>` : ''}
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <span class="px-3 py-1 rounded-full ${
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'accepted' || request.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }">
                                                ${getStatusLabel(request.status)}
                                            </span>
                                            ${request.status === 'pending' ? `
                                                <button onclick="navigateTo('/request?id=${request.id}')" 
                                                        class="ml-2 text-blue-600 hover:text-blue-800">
                                                    詳細を見る
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
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
                username: formData.get('username'),
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
async function handleSendDevelopmentRequest(ideaId) {
    if (!state.token) {
        alert('ログインが必要です');
        return;
    }
    
    if (confirm('この開発依頼リクエストを送信しますか？')) {
        try {
            // 現在は開発を即座に開始する仕組みを流用
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
                alert('開発依頼リクエストを送信しました！');
                navigateTo('/dashboard');
            } else {
                alert(data.error || '送信に失敗しました');
            }
        } catch (error) {
            alert('エラーが発生しました');
        }
    }
}

async function handleSendMessage(event, ideaId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const message = formData.get('message');
    
    if (!message.trim()) return;
    
    try {
        const response = await fetch(`${API_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idea_id: ideaId,
                message: message
            })
        });
        
        if (response.ok) {
            const newMessage = await response.json();
            // メッセージをUIに追加
            const messagesDiv = document.getElementById('chat-messages');
            const messageHTML = `
                <div class="flex justify-end">
                    <div class="max-w-xs lg:max-w-md">
                        <div class="bg-blue-600 text-white rounded-lg px-4 py-2">
                            <p class="text-sm">${newMessage.message}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 text-right">
                            ${new Date(newMessage.created_at).toLocaleString('ja-JP', { 
                                month: 'numeric', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            `;
            
            // 空メッセージの表示を削除
            const emptyMessage = messagesDiv.querySelector('.text-center.text-gray-500');
            if (emptyMessage) {
                emptyMessage.remove();
            }
            
            messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // フォームをリセットしてフォーカスを維持
            const messageInput = event.target.querySelector('input[name="message"]');
            event.target.reset();
            messageInput.focus();
        } else {
            const error = await response.json();
            alert(error.error || 'メッセージの送信に失敗しました');
        }
    } catch (error) {
        alert('メッセージの送信に失敗しました');
    }
}

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

async function renderRequests() {
    if (!state.token) {
        navigateTo('/login');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/requests`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        const requests = await response.json();

        document.getElementById('main-content').innerHTML = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">開発リクエスト</h2>
                
                <div class="grid gap-4">
                    ${requests.map(request => `
                        <div class="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer" 
                             onclick="navigateTo('/request?id=${request.id}')">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold mb-2">${request.title}</h3>
                                    <p class="text-gray-600 mb-2">${request.description}</p>
                                    <div class="flex gap-4 text-sm text-gray-500">
                                        <span>アイデア: ${request.idea_title}</span>
                                        ${request.proposed_budget ? `<span>提案予算: ¥${request.proposed_budget.toLocaleString()}</span>` : ''}
                                        <span>ステータス: ${getStatusLabel(request.status)}</span>
                                        ${request.unread_count > 0 ? `<span class="bg-red-500 text-white px-2 py-1 rounded">未読: ${request.unread_count}</span>` : ''}
                                    </div>
                                </div>
                                ${request.idea_thumbnail ? `
                                    <img src="${request.idea_thumbnail}" alt="${request.idea_title}" 
                                         class="w-24 h-24 object-cover rounded ml-4">
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                    
                    ${requests.length === 0 ? `
                        <p class="text-gray-600 text-center py-8">開発リクエストはありません</p>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching requests:', error);
        document.getElementById('main-content').innerHTML = '<p>エラーが発生しました</p>';
    }
}

async function renderRequestDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');
    
    if (!requestId || !state.token) {
        navigateTo('/requests');
        return;
    }

    try {
        const [requestResponse, messagesResponse] = await Promise.all([
            fetch(`${API_URL}/requests/${requestId}`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            }),
            fetch(`${API_URL}/requests/${requestId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            })
        ]);

        const request = await requestResponse.json();
        const messages = await messagesResponse.json();

        const isClient = state.user.id === request.client_id;
        const isDeveloper = state.user.role === 'developer';

        document.getElementById('main-content').innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white p-6 rounded shadow mb-6">
                    <h2 class="text-2xl font-bold mb-4">${request.title}</h2>
                    <p class="text-gray-600 mb-4">${request.description}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span class="text-sm text-gray-500">アイデア:</span>
                            <p>${request.idea_title}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">ステータス:</span>
                            <p>${getStatusLabel(request.status)}</p>
                        </div>
                        ${request.proposed_budget ? `
                            <div>
                                <span class="text-sm text-gray-500">提案予算:</span>
                                <p>¥${request.proposed_budget.toLocaleString()}</p>
                            </div>
                        ` : ''}
                        ${request.proposed_deadline ? `
                            <div>
                                <span class="text-sm text-gray-500">提案納期:</span>
                                <p>${new Date(request.proposed_deadline).toLocaleDateString()}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${isClient && request.status === 'pending' ? `
                        <div class="flex gap-2">
                            <button onclick="acceptRequest(${requestId})" 
                                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                承諾する
                            </button>
                            <button onclick="rejectRequest(${requestId})" 
                                    class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                拒否する
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="bg-white p-6 rounded shadow">
                    <h3 class="text-lg font-semibold mb-4">メッセージ</h3>
                    
                    <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        ${messages.map(msg => `
                            <div class="${msg.sender_id === state.user.id ? 'text-right' : 'text-left'}">
                                <div class="inline-block bg-${msg.sender_id === state.user.id ? 'blue' : 'gray'}-100 
                                            rounded-lg px-4 py-2 max-w-md">
                                    <p class="text-sm font-semibold mb-1">${msg.sender_username}</p>
                                    <p>${msg.message}</p>
                                    <p class="text-xs text-gray-500 mt-1">
                                        ${new Date(msg.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${messages.length === 0 ? `
                            <p class="text-gray-500 text-center">まだメッセージはありません</p>
                        ` : ''}
                    </div>
                    
                    <form onsubmit="sendRequestMessage(event, ${requestId})" class="flex gap-2">
                        <input type="text" 
                               name="message" 
                               placeholder="メッセージを入力" 
                               required
                               class="flex-1 border rounded px-3 py-2">
                        <button type="submit" 
                                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            送信
                        </button>
                    </form>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        navigateTo('/requests');
    }
}

async function showDevelopmentRequestModal(ideaId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">開発リクエストを送る</h3>
            <form onsubmit="createDevelopmentRequest(event, ${ideaId})">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">タイトル</label>
                    <input type="text" 
                           name="title" 
                           required 
                           class="w-full border rounded px-3 py-2"
                           placeholder="例: このアイデアの開発を担当させてください">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">提案内容</label>
                    <textarea name="description" 
                              required 
                              rows="4"
                              class="w-full border rounded px-3 py-2"
                              placeholder="開発経験、スキル、実装方針などを記載してください"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">提案予算</label>
                    <input type="number" 
                           name="proposed_budget" 
                           class="w-full border rounded px-3 py-2"
                           placeholder="例: 50000">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">提案納期</label>
                    <input type="date" 
                           name="proposed_deadline" 
                           class="w-full border rounded px-3 py-2">
                </div>
                <div class="flex gap-2">
                    <button type="submit" 
                            class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        送信
                    </button>
                    <button type="button" 
                            onclick="this.closest('.fixed').remove()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function createDevelopmentRequest(event, ideaId) {
    event.preventDefault();
    
    console.log('Current user:', state.user);
    
    const formData = new FormData(event.target);
    const data = {
        idea_id: ideaId,
        title: formData.get('title'),
        description: formData.get('description'),
        proposed_budget: formData.get('proposed_budget') ? parseInt(formData.get('proposed_budget')) : null,
        proposed_deadline: formData.get('proposed_deadline') || null
    };

    console.log('Sending request:', data);

    try {
        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (response.ok) {
            alert('開発リクエストを送信しました');
            document.querySelector('.fixed').remove();
            navigateTo('/requests');
        } else {
            console.error('Request failed:', responseData);
            alert(responseData.message || '送信に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました');
    }
}

async function acceptRequest(requestId) {
    if (!confirm('この開発リクエストを承諾しますか？')) return;

    try {
        const response = await fetch(`${API_URL}/requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                status: 'accepted'
            })
        });

        if (response.ok) {
            const data = await response.json();
            alert('開発リクエストを承諾しました。開発が開始されます。');
            if (data.developmentId) {
                navigateTo(`/development?id=${data.developmentId}`);
            } else {
                renderRequestDetail();
            }
        } else {
            alert('エラーが発生しました');
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function rejectRequest(requestId) {
    if (!confirm('この開発リクエストを拒否しますか？')) return;

    try {
        const response = await fetch(`${API_URL}/requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                status: 'rejected'
            })
        });

        if (response.ok) {
            alert('開発リクエストを拒否しました');
            renderRequestDetail();
        } else {
            alert('エラーが発生しました');
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function sendRequestMessage(event, requestId) {
    event.preventDefault();
    
    const message = event.target.message.value;
    
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            event.target.reset();
            renderRequestDetail();
        } else {
            alert('送信に失敗しました');
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

function getStatusLabel(status) {
    const labels = {
        pending: '検討中',
        accepted: '承諾済み',
        rejected: '拒否',
        in_progress: '開発中',
        completed: '完了',
        cancelled: 'キャンセル'
    };
    return labels[status] || status;
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
window.handleSendDevelopmentRequest = handleSendDevelopmentRequest;
window.handleSendMessage = handleSendMessage;
window.showDevelopmentRequestModal = showDevelopmentRequestModal;
window.createDevelopmentRequest = createDevelopmentRequest;
async function renderDevelopmentDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const developmentId = urlParams.get('id');
    
    if (!developmentId || !state.token) {
        navigateTo('/dashboard');
        return;
    }

    try {
        const [devResponse, threadsResponse] = await Promise.all([
            fetch(`${API_URL}/development-detail/${developmentId}`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            }),
            fetch(`${API_URL}/development-detail/${developmentId}/threads`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            })
        ]);

        if (!devResponse.ok || !threadsResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const development = await devResponse.json();
        const threads = await threadsResponse.json();
        
        const isClient = state.user.id === development.client_id;
        const isDeveloper = state.user.id === development.developer_id;

        document.getElementById('main-content').innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="bg-white p-6 rounded shadow mb-6">
                    <h2 class="text-2xl font-bold mb-4">${development.idea_title}</h2>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span class="text-sm text-gray-500">依頼者:</span>
                            <p>${development.client_username}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">開発者:</span>
                            <p>${development.developer_username}</p>
                        </div>
                        ${development.proposed_budget ? `
                            <div>
                                <span class="text-sm text-gray-500">予算:</span>
                                <p>¥${development.proposed_budget.toLocaleString()}</p>
                            </div>
                        ` : ''}
                        ${development.proposed_deadline ? `
                            <div>
                                <span class="text-sm text-gray-500">納期:</span>
                                <p>${new Date(development.proposed_deadline).toLocaleDateString()}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="mb-4">
                        <span class="text-sm text-gray-500">開発内容:</span>
                        <p class="text-gray-700">${development.request_description || development.idea_description}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="showCreateThreadModal(${developmentId})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            新しいスレッドを作成
                        </button>
                    </div>
                </div>

                <div class="bg-white p-6 rounded shadow">
                    <h3 class="text-xl font-bold mb-4">スレッド一覧</h3>
                    <div class="space-y-4">
                        ${threads.map(thread => `
                            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                 onclick="showThreadMessages(${developmentId}, ${thread.id})">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="font-semibold">${thread.title}</h4>
                                        <p class="text-sm text-gray-500">
                                            作成者: ${thread.created_by_username} · 
                                            メッセージ: ${thread.message_count || 0}件
                                        </p>
                                    </div>
                                    <span class="text-xs text-gray-400">
                                        ${new Date(thread.updated_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${threads.length === 0 ? `
                            <p class="text-gray-500 text-center py-8">まだスレッドがありません</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        navigateTo('/dashboard');
    }
}

async function showCreateThreadModal(developmentId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">新しいスレッドを作成</h3>
            <form onsubmit="createThread(event, ${developmentId})">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">タイトル</label>
                    <input type="text" 
                           name="title" 
                           required 
                           class="w-full border rounded px-3 py-2"
                           placeholder="例: 機能について相談">
                </div>
                <div class="flex gap-2">
                    <button type="submit" 
                            class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        作成
                    </button>
                    <button type="button" 
                            onclick="this.closest('.fixed').remove()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function createThread(event, developmentId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title');

    try {
        const response = await fetch(`${API_URL}/development-detail/${developmentId}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            document.querySelector('.fixed').remove();
            renderDevelopmentDetail();
        } else {
            alert('エラーが発生しました');
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

async function showThreadMessages(developmentId, threadId) {
    try {
        const response = await fetch(
            `${API_URL}/development-detail/${developmentId}/threads/${threadId}/messages`,
            {
                headers: { 'Authorization': `Bearer ${state.token}` }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const messages = await response.json();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">スレッドメッセージ</h3>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto mb-4 space-y-4">
                    ${messages.map(msg => `
                        <div class="${msg.sender_id === state.user.id ? 'text-right' : 'text-left'}">
                            <div class="inline-block bg-${msg.sender_id === state.user.id ? 'blue' : 'gray'}-100 
                                        rounded-lg px-4 py-2 max-w-md">
                                <p class="text-sm font-semibold mb-1">${msg.sender_username}</p>
                                <p>${msg.message}</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    ${new Date(msg.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${messages.length === 0 ? `
                        <p class="text-gray-500 text-center">まだメッセージはありません</p>
                    ` : ''}
                </div>
                
                <form onsubmit="sendThreadMessage(event, ${developmentId}, ${threadId})" 
                      class="flex gap-2">
                    <input type="text" 
                           name="message" 
                           placeholder="メッセージを入力" 
                           required
                           class="flex-1 border rounded px-3 py-2">
                    <button type="submit" 
                            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        送信
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error:', error);
        alert('メッセージの取得に失敗しました');
    }
}

async function sendThreadMessage(event, developmentId, threadId) {
    event.preventDefault();
    
    const message = event.target.message.value;
    
    try {
        const response = await fetch(
            `${API_URL}/development-detail/${developmentId}/threads/${threadId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({ message })
            }
        );

        if (response.ok) {
            event.target.reset();
            document.querySelector('.fixed').remove();
            showThreadMessages(developmentId, threadId);
        } else {
            alert('送信に失敗しました');
        }
    } catch (error) {
        alert('エラーが発生しました');
    }
}

window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.sendRequestMessage = sendRequestMessage;
window.showCreateThreadModal = showCreateThreadModal;
window.createThread = createThread;
window.showThreadMessages = showThreadMessages;
window.sendThreadMessage = sendThreadMessage;

window.addEventListener('popstate', render);
checkAuth();
render();