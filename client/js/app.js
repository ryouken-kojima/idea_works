import { createLayout, setPageTitle, setupLayoutEventListeners } from './layout.js';

const API_URL = 'http://localhost:3001/api';

const state = {
    user: null,
    token: localStorage.getItem('token')
};

const router = {
    '/': renderHome,
    '/login': renderLogin,
    '/register': renderRegister,
    '/inbox': renderInbox,
    '/dev-inbox': renderDevInbox,
    '/my-ideas': renderMyIdeas,
    '/applied-ideas': renderAppliedIdeas,
    '/ongoing-projects': renderOngoingProjects,
    '/completed-projects': renderCompletedProjects,
    '/dev-ongoing': renderDevOngoing,
    '/dev-completed': renderDevCompleted,
    '/idea': renderIdeaDetail,
    '/post-idea': renderPostIdea,
    '/chat': renderChat,
    '/requests': renderRequests,
    '/request': renderRequestDetail,
    '/development': renderDevelopmentDetail,
    '/developers': renderDevelopers,
    '/developer': renderDeveloperProfile,
    '/profile-edit': () => window.location.href = '/profile-edit.html'
};

function navigateTo(path) {
    window.history.pushState({}, '', path);
    render();
}

function render() {
    const path = window.location.pathname;
    const handler = router[path] || renderHome;
    handler();
}


async function renderHome() {
    try {
        const response = await fetch(`${API_URL}/ideas`);
        const ideas = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold mb-2">みんなのアイディア</h1>
                    <p class="text-gray-600">開発者を募集しているアイディアを探してみましょう</p>
                </div>
                
                ${state.token && state.user?.role === 'client' ? `
                    <div class="mb-6 flex justify-end">
                        <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;" 
                           class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            新しいアイディアを投稿
                        </a>
                    </div>
                ` : ''}
                
                ${ideas.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <p class="text-gray-500">まだアイディアが投稿されていません</p>
                    </div>
                ` : `
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${ideas.map(idea => `
                            <div class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                 onclick="navigateTo('/idea?id=${idea.id}')">
                                ${idea.thumbnail_url ? `
                                    <div class="aspect-w-16 aspect-h-9">
                                        <img src="${idea.thumbnail_url}" alt="${idea.title}" 
                                             class="w-full h-48 object-cover rounded-t-lg">
                                    </div>
                                ` : `
                                    <div class="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                                        <svg class="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                        </svg>
                                    </div>
                                `}
                                <div class="p-6">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-xl font-semibold line-clamp-1">${idea.title}</h3>
                                        ${idea.budget ? `
                                            <span class="text-sm text-gray-500 whitespace-nowrap ml-2">
                                                ¥${idea.budget.toLocaleString()}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <p class="text-gray-600 mb-4 line-clamp-2">${idea.description}</p>
                                    <div class="flex items-center justify-between text-sm text-gray-500">
                                        <span>${idea.username}</span>
                                        <span class="bg-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-100 
                                                     text-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-800 
                                                     px-2 py-1 rounded">
                                            ${idea.status === 'open' ? '募集中' : idea.status === 'in_progress' ? '開発中' : '完了'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        if (state.token) {
            document.getElementById('app').innerHTML = createLayout(content, 'home');
            setPageTitle('みんなのアイディア');
            setupLayoutEventListeners();
        } else {
            // ログインしていない場合は通常のレイアウト
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen bg-gray-50">
                    <!-- Navigation -->
                    <nav class="bg-white shadow-sm">
                        <div class="container mx-auto px-4 py-4">
                            <div class="flex justify-between items-center">
                                <h1 class="text-2xl font-bold text-indigo-600">IdeaWorks</h1>
                                <div class="flex gap-4">
                                    <a href="/" onclick="navigateTo('/'); return false;" class="text-gray-600 hover:text-indigo-600">アイディア一覧</a>
                                    <a href="/developers" onclick="navigateTo('/developers'); return false;" class="text-gray-600 hover:text-indigo-600">開発者一覧</a>
                                    <a href="/login" onclick="navigateTo('/login'); return false;" class="text-gray-600 hover:text-indigo-600">ログイン</a>
                                    <a href="/register" onclick="navigateTo('/register'); return false;" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">新規登録</a>
                                </div>
                            </div>
                        </div>
                    </nav>
                    
                    <main class="container mx-auto px-4 py-8">
                        ${content}
                    </main>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching ideas:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        if (state.token) {
            document.getElementById('app').innerHTML = createLayout(errorContent, 'home');
        } else {
            document.getElementById('app').innerHTML = errorContent;
        }
    }
}

function renderLogin() {
    // ログインページは従来のレイアウト
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Navigation -->
            <nav class="bg-white shadow-sm">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-indigo-600">IdeaWorks</h1>
                        <div class="flex gap-4">
                            <a href="/" onclick="navigateTo('/'); return false;" class="text-gray-600 hover:text-indigo-600">ホーム</a>
                            <a href="/register" onclick="navigateTo('/register'); return false;" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">新規登録</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <main class="container mx-auto px-4 py-16">
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
            </main>
        </div>
    `;
}

function renderRegister() {
    const content = `
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
    
    document.getElementById('app').innerHTML = createLayout(content, 'register');
    setPageTitle('新規登録');
    setupLayoutEventListeners();
}

function renderPostIdea() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }

    const content = `
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
    
    document.getElementById('app').innerHTML = createLayout(content, 'post-idea');
    setPageTitle('アイディア投稿');
    setupLayoutEventListeners();
}

async function renderChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('ideaId');
    
    if (!state.token) {
        navigateTo('/login');
        return;
    }
    
    if (!ideaId) {
        const errorContent = '<p>アイデアが指定されていません</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'chat');
        setPageTitle('チャット');
        setupLayoutEventListeners();
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
        
        const chatContent = `
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
        
        // レイアウトを適用
        document.getElementById('app').innerHTML = createLayout(chatContent, 'chat');
        setPageTitle(`チャット - ${idea.title}`);
        setupLayoutEventListeners();
        
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
        const errorContent = '<p>エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'chat');
        setPageTitle('チャット');
        setupLayoutEventListeners();
    }
}

async function renderIdeaDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('id');
    
    if (!ideaId) {
        const errorContent = '<p class="text-center text-red-600">アイディアが見つかりません</p>';
        document.getElementById('app').innerHTML = state.token 
            ? createLayout(errorContent, 'ideas')
            : errorContent;
        if (state.token) setupLayoutEventListeners();
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
        
        const content = `
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
        
        document.getElementById('app').innerHTML = state.token 
            ? createLayout(content, 'ideas')
            : content;
        setPageTitle(idea.title);
        if (state.token) setupLayoutEventListeners();
    } catch (error) {
        console.error('Error in renderIdeaDetail:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = state.token 
            ? createLayout(errorContent, 'ideas')
            : errorContent;
        if (state.token) setupLayoutEventListeners();
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
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.user.role);
            navigateTo('/');
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
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.user.role);
            navigateTo('/');
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
            navigateTo('/');
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
                navigateTo('/');
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
            navigateTo('/');
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
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
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
                navigateTo('/');
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
                navigateTo('/');
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

        const content = `
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
        
        document.getElementById('app').innerHTML = createLayout(content, 'requests');
        setPageTitle('開発リクエスト');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching requests:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'requests');
        setupLayoutEventListeners();
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

        const requestDetailContent = `
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
        
        // レイアウトを適用
        document.getElementById('app').innerHTML = createLayout(requestDetailContent, 'requests');
        setPageTitle(`リクエスト詳細 - ${request.title}`);
        setupLayoutEventListeners();
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
        navigateTo('/');
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

        const content = `
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
        
        document.getElementById('app').innerHTML = createLayout(content, 'development');
        setPageTitle(`開発進捗: ${development.idea_title}`);
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error in renderDevelopmentDetail:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'development');
        setPageTitle('エラー');
        setupLayoutEventListeners();
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

// 開発者プロフィールページ
async function renderDeveloperProfile() {
    console.log('renderDeveloperProfile called');
    const urlParams = new URLSearchParams(window.location.search);
    const developerId = urlParams.get('id');
    console.log('Developer ID:', developerId);
    
    if (!developerId) {
        console.log('No developer ID, redirecting to /developers');
        navigateTo('/developers');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/developer-profiles/profile/${developerId}`);
        if (!response.ok) {
            throw new Error('開発者が見つかりません');
        }
        
        const data = await response.json();
        const { user, profile, skills, languages, specializations, stats } = data;
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- 左側：基本情報 -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="text-center mb-6">
                                ${profile?.profile_image_url ? 
                                    `<img src="${profile.profile_image_url}" alt="${user.username}" class="w-32 h-32 rounded-full mx-auto mb-4">` :
                                    `<div class="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                                        <i class="fas fa-user text-4xl text-gray-400"></i>
                                    </div>`
                                }
                                <h2 class="text-2xl font-bold text-gray-800">${user.username}</h2>
                                <p class="text-gray-600">${user.email}</p>
                            </div>
                            
                            ${profile ? `
                                <div class="space-y-4 text-sm">
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600">経験年数</span>
                                        <span class="font-medium">${profile.years_of_experience || 0}年</span>
                                    </div>
                                    
                                    ${profile.hourly_rate ? `
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-600">時給</span>
                                            <span class="font-medium">¥${profile.hourly_rate.toLocaleString()}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${profile.project_rate ? `
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-600">プロジェクト単価</span>
                                            <span class="font-medium">¥${profile.project_rate.toLocaleString()}</span>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600">受注状況</span>
                                        <span class="${profile.available_for_hire ? 'text-green-600' : 'text-red-600'} font-medium">
                                            ${profile.available_for_hire ? '受注可能' : '受注不可'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="mt-6 pt-6 border-t">
                                    <div class="text-sm text-gray-600 mb-2">実績</div>
                                    <div class="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div class="text-2xl font-bold text-indigo-600">${stats.completed_projects || 0}</div>
                                            <div class="text-xs text-gray-500">完了プロジェクト</div>
                                        </div>
                                        <div>
                                            <div class="text-2xl font-bold text-green-600">${stats.accepted_requests || 0}</div>
                                            <div class="text-xs text-gray-500">承認リクエスト</div>
                                        </div>
                                    </div>
                                </div>
                            ` : '<p class="text-gray-500 text-center">プロフィール未設定</p>'}
                            
                            ${renderDeveloperActionButtons(profile)}
                        </div>
                        
                        ${renderDeveloperLinks(profile)}
                    </div>
                    
                    <!-- 右側：詳細情報 -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- 自己紹介 -->
                        ${profile?.bio ? `
                            <div class="bg-white rounded-lg shadow p-6">
                                <h3 class="text-lg font-semibold mb-3">自己紹介</h3>
                                <p class="text-gray-700 whitespace-pre-wrap">${profile.bio}</p>
                            </div>
                        ` : ''}
                        
                        <!-- スキル -->
                        ${skills.length > 0 ? `
                            <div class="bg-white rounded-lg shadow p-6">
                                <h3 class="text-lg font-semibold mb-4">スキル</h3>
                                <div class="space-y-4">
                                    ${groupSkillsByCategory(skills).map(category => `
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-600 mb-2">${category.name}</h4>
                                            <div class="flex flex-wrap gap-2">
                                                ${category.skills.map(skill => `
                                                    <div class="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        <span class="font-medium">${skill.name}</span>
                                                        <span class="text-gray-500 ml-1">${renderProficiency(skill.proficiency_level)}</span>
                                                        ${skill.years_of_experience > 0 ? `<span class="text-gray-500 ml-1">(${skill.years_of_experience}年)</span>` : ''}
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- 専門分野 -->
                        ${specializations.length > 0 ? `
                            <div class="bg-white rounded-lg shadow p-6">
                                <h3 class="text-lg font-semibold mb-4">専門分野</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    ${specializations.map(spec => `
                                        <div class="flex items-start">
                                            <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                                            <div>
                                                <div class="font-medium">${spec.name}</div>
                                                ${spec.description ? `<div class="text-sm text-gray-600">${spec.description}</div>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- 対応言語 -->
                        ${languages.length > 0 ? `
                            <div class="bg-white rounded-lg shadow p-6">
                                <h3 class="text-lg font-semibold mb-4">対応言語</h3>
                                <div class="flex flex-wrap gap-3">
                                    ${languages.map(lang => `
                                        <div class="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                                            <span class="font-medium">${lang.name}</span>
                                            <span class="ml-2 text-sm text-gray-600">${renderLanguageProficiency(lang.proficiency_level)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'developers');
        setPageTitle(`${user.username} - 開発者プロフィール`);
        setupLayoutEventListeners();
        
        // グローバル関数を設定
        window.showDeveloperRequestModal = showDeveloperRequestModal;
        
    } catch (error) {
        console.error('Error loading developer profile:', error);
        const errorContent = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <p class="text-red-600 mb-4">${error.message}</p>
                    <a href="/developers" onclick="navigateTo('/developers'); return false;" 
                       class="text-indigo-600 hover:underline">開発者一覧に戻る</a>
                </div>
            </div>
        `;
        document.getElementById('app').innerHTML = createLayout(errorContent, 'developers');
        setPageTitle('エラー');
        setupLayoutEventListeners();
    }
}

// 開発者プロフィール用のヘルパー関数
function groupSkillsByCategory(skills) {
    const grouped = {};
    skills.forEach(skill => {
        if (!grouped[skill.category]) {
            grouped[skill.category] = {
                name: skill.category,
                skills: []
            };
        }
        grouped[skill.category].skills.push(skill);
    });
    return Object.values(grouped);
}

function renderProficiency(level) {
    const stars = ['☆☆☆☆☆', '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];
    return stars[level] || stars[0];
}

function renderLanguageProficiency(level) {
    const levels = {
        'native': 'ネイティブ',
        'fluent': '流暢',
        'conversational': '会話可能',
        'basic': '基礎レベル'
    };
    return levels[level] || level;
}

function renderDeveloperLinks(profile) {
    if (!profile) return '';
    
    const links = [];
    if (profile.portfolio_url) {
        links.push(`<a href="${profile.portfolio_url}" target="_blank" class="flex items-center text-gray-600 hover:text-indigo-600">
            <i class="fas fa-globe mr-2"></i> ポートフォリオ
        </a>`);
    }
    if (profile.github_url) {
        links.push(`<a href="${profile.github_url}" target="_blank" class="flex items-center text-gray-600 hover:text-indigo-600">
            <i class="fab fa-github mr-2"></i> GitHub
        </a>`);
    }
    if (profile.gitlab_url) {
        links.push(`<a href="${profile.gitlab_url}" target="_blank" class="flex items-center text-gray-600 hover:text-indigo-600">
            <i class="fab fa-gitlab mr-2"></i> GitLab
        </a>`);
    }
    
    if (links.length === 0) return '';
    
    return `
        <div class="bg-white rounded-lg shadow p-6 mt-6">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">リンク</h3>
            <div class="space-y-2">
                ${links.join('')}
            </div>
        </div>
    `;
}

function renderDeveloperActionButtons(profile) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !profile || !profile.available_for_hire) {
        return '';
    }
    
    if (userRole === 'client') {
        return `
            <button onclick="showDeveloperRequestModal()" 
                class="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
                <i class="fas fa-paper-plane mr-2"></i>開発リクエストを送る
            </button>
        `;
    }
    
    return '';
}

async function showDeveloperRequestModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('ログインが必要です');
        navigateTo('/login');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const developerId = urlParams.get('id');
    
    // 自分のアイデアを取得
    try {
        const response = await fetch(`${API_URL}/ideas/my-ideas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('アイデアの取得に失敗しました');
        }
        
        const ideas = await response.json();
        const openIdeas = ideas.filter(idea => idea.status === 'open');
        
        if (openIdeas.length === 0) {
            alert('開発リクエストを送信できるアイデアがありません。まずアイデアを投稿してください。');
            return;
        }
        
        // モーダルを作成
        const modal = document.createElement('div');
        modal.id = 'requestModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">開発リクエストを送信</h3>
                <form onsubmit="sendDevelopmentRequestToDeveloper(event, ${developerId})">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">アイデアを選択</label>
                        <select id="requestIdeaId" required class="w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">選択してください</option>
                            ${openIdeas.map(idea => `<option value="${idea.id}">${idea.title}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">提案予算（円）</label>
                        <input type="number" id="requestBudget" required min="0" step="1000"
                            class="w-full border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">希望納期</label>
                        <input type="date" id="requestDeadline" required
                            class="w-full border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
                        <textarea id="requestMessage" rows="3" required
                            class="w-full border-gray-300 rounded-md shadow-sm"
                            placeholder="開発への意気込みや質問など"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closeDevelopmentRequestModal()"
                            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            キャンセル
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                            送信
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 明日の日付をデフォルトに設定
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        document.getElementById('requestDeadline').value = tomorrow.toISOString().split('T')[0];
        
        // グローバル関数を設定
        window.closeDevelopmentRequestModal = closeDevelopmentRequestModal;
        window.sendDevelopmentRequestToDeveloper = sendDevelopmentRequestToDeveloper;
        
    } catch (error) {
        alert(error.message);
    }
}

function closeDevelopmentRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.remove();
    }
}

async function sendDevelopmentRequestToDeveloper(event, developerId) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const ideaId = document.getElementById('requestIdeaId').value;
    const budget = document.getElementById('requestBudget').value;
    const deadline = document.getElementById('requestDeadline').value;
    const message = document.getElementById('requestMessage').value;
    
    try {
        const response = await fetch(`${API_URL}/requests/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                idea_id: parseInt(ideaId),
                developer_id: parseInt(developerId),
                proposed_budget: parseInt(budget),
                proposed_deadline: deadline,
                message: message
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '送信に失敗しました');
        }
        
        alert('開発リクエストを送信しました');
        closeDevelopmentRequestModal();
    } catch (error) {
        alert(error.message);
    }
}

// 開発者一覧ページ
async function renderDevelopers() {
    let allSpecializations = [];
    let allLanguages = [];
    
    // フィルターオプションを読み込む
    async function loadFilterOptions() {
        try {
            const specResponse = await fetch(`${API_URL}/developer-profiles/specializations`);
            allSpecializations = await specResponse.json();
            
            const langResponse = await fetch(`${API_URL}/developer-profiles/languages`);
            allLanguages = await langResponse.json();
        } catch (error) {
            console.error('フィルターオプションの読み込みエラー:', error);
        }
    }
    
    // 開発者を検索する
    async function searchDevelopers() {
        const params = new URLSearchParams();
        
        const skill = document.getElementById('skillFilter')?.value || '';
        const specialization = document.getElementById('specializationFilter')?.value || '';
        const language = document.getElementById('languageFilter')?.value || '';
        const minRate = document.getElementById('minRateFilter')?.value || '';
        const maxRate = document.getElementById('maxRateFilter')?.value || '';

        if (skill) params.append('skill', skill);
        if (specialization) params.append('specialization', specialization);
        if (language) params.append('language', language);
        if (minRate) params.append('minRate', minRate);
        if (maxRate) params.append('maxRate', maxRate);

        try {
            const response = await fetch(`${API_URL}/developer-profiles/search?${params}`);
            const developers = await response.json();
            
            const developersContainer = document.getElementById('developersContainer');
            if (!developersContainer) return;

            if (developers.length === 0) {
                developersContainer.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">該当する開発者が見つかりませんでした</p>
                    </div>
                `;
                return;
            }

            developersContainer.innerHTML = developers.map(dev => renderDeveloperCard(dev)).join('');
        } catch (error) {
            console.error('開発者の検索エラー:', error);
        }
    }
    
    // 開発者カードを描画
    function renderDeveloperCard(dev) {
        return `
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                 onclick="navigateTo('/developer?id=${dev.id}')">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center">
                            ${dev.profile_image_url ? 
                                `<img src="${dev.profile_image_url}" alt="${dev.username}" class="w-12 h-12 rounded-full mr-3">` :
                                `<div class="w-12 h-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                    <i class="fas fa-user text-gray-400"></i>
                                </div>`
                            }
                            <div>
                                <h3 class="font-semibold text-gray-800">${dev.username}</h3>
                                <p class="text-sm text-gray-600">経験${dev.years_of_experience || 0}年</p>
                            </div>
                        </div>
                        ${dev.available_for_hire ? 
                            '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">受注可能</span>' :
                            '<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">受注不可</span>'
                        }
                    </div>
                    
                    ${dev.bio ? `
                        <p class="text-sm text-gray-700 mb-4" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${dev.bio}</p>
                    ` : ''}
                    
                    <div class="space-y-2">
                        ${dev.hourly_rate ? `
                            <div class="flex items-center text-sm">
                                <i class="fas fa-clock text-gray-400 mr-2"></i>
                                <span class="text-gray-600">時給: </span>
                                <span class="font-medium ml-1">¥${dev.hourly_rate.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        
                        ${dev.project_rate ? `
                            <div class="flex items-center text-sm">
                                <i class="fas fa-project-diagram text-gray-400 mr-2"></i>
                                <span class="text-gray-600">プロジェクト: </span>
                                <span class="font-medium ml-1">¥${dev.project_rate.toLocaleString()}〜</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="mt-4 pt-4 border-t">
                        <a href="/developer?id=${dev.id}" onclick="navigateTo('/developer?id=${dev.id}'); return false;" 
                           class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            プロフィールを見る <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    await loadFilterOptions();
    
    const content = `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">開発者を探す</h2>
                
                <!-- 検索フィルター -->
                <div class="bg-white p-6 rounded-lg shadow mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">スキル</label>
                            <input type="text" id="skillFilter" placeholder="例: React, Python"
                                class="w-full border-gray-300 rounded-md shadow-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">専門分野</label>
                            <select id="specializationFilter" class="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">すべて</option>
                                ${allSpecializations.map(spec => 
                                    `<option value="${spec.name}">${spec.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">対応言語</label>
                            <select id="languageFilter" class="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">すべて</option>
                                ${allLanguages.map(lang => 
                                    `<option value="${lang.name}">${lang.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button onclick="searchDevelopers()" 
                                class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                                <i class="fas fa-search mr-2"></i>検索
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">最低時給（円）</label>
                            <input type="number" id="minRateFilter" placeholder="例: 3000"
                                class="w-full border-gray-300 rounded-md shadow-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">最高時給（円）</label>
                            <input type="number" id="maxRateFilter" placeholder="例: 10000"
                                class="w-full border-gray-300 rounded-md shadow-sm">
                        </div>
                    </div>
                </div>
            </div>

            <!-- 開発者リスト -->
            <div id="developersContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- ローディング表示 -->
                <div class="col-span-full flex justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        </div>
    `;
    
    if (state.token) {
        document.getElementById('app').innerHTML = createLayout(content, 'developers');
        setPageTitle('開発者を探す');
        setupLayoutEventListeners();
    } else {
        // ログインしていない場合は通常のレイアウト
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Navigation -->
                <nav class="bg-white shadow-sm">
                    <div class="container mx-auto px-4 py-4">
                        <div class="flex justify-between items-center">
                            <h1 class="text-2xl font-bold text-indigo-600">IdeaWorks</h1>
                            <div class="flex gap-4">
                                <a href="/" onclick="navigateTo('/'); return false;" class="text-gray-600 hover:text-indigo-600">ホーム</a>
                                <a href="/ideas" onclick="navigateTo('/ideas'); return false;" class="text-gray-600 hover:text-indigo-600">アイディア一覧</a>
                                <a href="/login" onclick="navigateTo('/login'); return false;" class="text-gray-600 hover:text-indigo-600">ログイン</a>
                                <a href="/register" onclick="navigateTo('/register'); return false;" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">新規登録</a>
                            </div>
                        </div>
                    </div>
                </nav>
                <main class="container mx-auto px-4 py-8">
                    ${content}
                </main>
            </div>
        `;
    }
    
    // グローバルに関数を公開
    window.searchDevelopers = searchDevelopers;
    
    // 初期検索を実行
    setTimeout(() => searchDevelopers(), 100);
}

// 開発者の受信箱
async function renderDevInbox() {
    if (!state.token || state.user?.role !== 'developer') {
        navigateTo('/');
        return;
    }
    
    const content = `
        <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold mb-6">受信箱</h2>
            
            <div class="bg-white rounded-lg shadow p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="text-lg font-semibold mb-2">通知機能は準備中です</h3>
                <p class="text-gray-600">新しい開発リクエストや重要なお知らせをこちらに表示予定です。</p>
            </div>
        </div>
    `;
    
    document.getElementById('app').innerHTML = createLayout(content, 'dev-inbox');
    setPageTitle('受信箱');
    setupLayoutEventListeners();
}

// 開発者が応募したアイデア一覧
async function renderAppliedIdeas() {
    if (!state.token || state.user?.role !== 'developer') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/requests/my-requests`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const requests = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">応募したアイデア</h2>
                
                ${requests.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 class="text-lg font-semibold mb-2">応募したアイデアはありません</h3>
                        <p class="text-gray-600 mb-4">興味のあるアイデアを見つけて開発リクエストを送りましょう。</p>
                        <a href="/ideas" onclick="navigateTo('/ideas'); return false;" class="text-indigo-600 hover:text-indigo-800">アイデア一覧を見る</a>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${requests.map(request => `
                            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-semibold mb-2">
                                            <a href="/request?id=${request.id}" onclick="navigateTo('/request?id=${request.id}'); return false;" class="text-gray-800 hover:text-indigo-600">
                                                ${request.title}
                                            </a>
                                        </h3>
                                        <p class="text-gray-600 mb-2">アイデア: ${request.idea_title || 'タイトルなし'}</p>
                                        <p class="text-sm text-gray-500">提案日: ${new Date(request.created_at).toLocaleDateString('ja-JP')}</p>
                                        
                                        ${request.proposed_budget ? `
                                            <p class="text-sm text-gray-600 mt-2">提案予算: ¥${request.proposed_budget.toLocaleString()}</p>
                                        ` : ''}
                                        ${request.proposed_deadline ? `
                                            <p class="text-sm text-gray-600">提案期限: ${new Date(request.proposed_deadline).toLocaleDateString('ja-JP')}</p>
                                        ` : ''}
                                    </div>
                                    <span class="px-3 py-1 text-sm rounded-full ${
                                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }">
                                        ${
                                            request.status === 'pending' ? '検討中' :
                                            request.status === 'accepted' ? '承諾済み' :
                                            request.status === 'rejected' ? '却下' :
                                            request.status
                                        }
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'applied-ideas');
        setPageTitle('応募したアイデア');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching applied ideas:', error);
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">応募したアイデア</h2>
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <p class="text-red-600">データの取得中にエラーが発生しました。</p>
                </div>
            </div>
        `;
        document.getElementById('app').innerHTML = createLayout(content, 'applied-ideas');
        setPageTitle('応募したアイデア');
        setupLayoutEventListeners();
    }
}

// 開発者の進行中プロジェクト
async function renderDevOngoing() {
    if (!state.token || state.user?.role !== 'developer') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/developments?status=started`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const developments = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">進行中プロジェクト</h2>
                
                ${developments.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 class="text-lg font-semibold mb-2">進行中のプロジェクトはありません</h3>
                        <p class="text-gray-600">承諾されたリクエストがここに表示されます。</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${developments.map(dev => `
                            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-semibold mb-2">
                                            <a href="/development?id=${dev.id}" onclick="navigateTo('/development?id=${dev.id}'); return false;" class="text-gray-800 hover:text-indigo-600">
                                                ${dev.idea_title || 'プロジェクト'}
                                            </a>
                                        </h3>
                                        <p class="text-gray-600 mb-2">依頼者: ${dev.client_name || 'クライアント'}</p>
                                        <p class="text-sm text-gray-500">開始日: ${new Date(dev.created_at).toLocaleDateString('ja-JP')}</p>
                                        
                                        ${dev.budget ? `
                                            <p class="text-sm text-gray-600 mt-2">予算: ¥${dev.budget.toLocaleString()}</p>
                                        ` : ''}
                                        ${dev.deadline ? `
                                            <p class="text-sm text-gray-600">期限: ${new Date(dev.deadline).toLocaleDateString('ja-JP')}</p>
                                        ` : ''}
                                        
                                        <div class="mt-4">
                                            <div class="flex items-center text-sm text-gray-600">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                進捗: ${dev.progress || 0}%
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div class="bg-indigo-600 h-2 rounded-full" style="width: ${dev.progress || 0}%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                        開発中
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'dev-ongoing');
        setPageTitle('進行中プロジェクト');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching ongoing projects:', error);
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">進行中プロジェクト</h2>
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <p class="text-red-600">データの取得中にエラーが発生しました。</p>
                </div>
            </div>
        `;
        document.getElementById('app').innerHTML = createLayout(content, 'dev-ongoing');
        setPageTitle('進行中プロジェクト');
        setupLayoutEventListeners();
    }
}

// 開発者の完了プロジェクト
async function renderDevCompleted() {
    if (!state.token || state.user?.role !== 'developer') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/developments?status=completed`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const developments = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">完了プロジェクト</h2>
                
                ${developments.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
                        </svg>
                        <h3 class="text-lg font-semibold mb-2">完了したプロジェクトはまだありません</h3>
                        <p class="text-gray-600">完成したプロジェクトがここに表示されます。</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${developments.map(dev => `
                            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-semibold mb-2">
                                            <a href="/development?id=${dev.id}" onclick="navigateTo('/development?id=${dev.id}'); return false;" class="text-gray-800 hover:text-indigo-600">
                                                ${dev.idea_title || 'プロジェクト'}
                                            </a>
                                        </h3>
                                        <p class="text-gray-600 mb-2">依頼者: ${dev.client_name || 'クライアント'}</p>
                                        <p class="text-sm text-gray-500">完了日: ${new Date(dev.completed_at || dev.updated_at).toLocaleDateString('ja-JP')}</p>
                                        
                                        ${dev.budget ? `
                                            <p class="text-sm text-gray-600 mt-2">予算: ¥${dev.budget.toLocaleString()}</p>
                                        ` : ''}
                                        
                                        ${dev.rating ? `
                                            <div class="flex items-center mt-2">
                                                <span class="text-sm text-gray-600 mr-2">評価:</span>
                                                <div class="flex">
                                                    ${[1, 2, 3, 4, 5].map(star => `
                                                        <svg class="w-4 h-4 ${star <= dev.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                        </svg>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <span class="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                                        完了
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'dev-completed');
        setPageTitle('完了プロジェクト');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching completed projects:', error);
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">完了プロジェクト</h2>
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <p class="text-red-600">データの取得中にエラーが発生しました。</p>
                </div>
            </div>
        `;
        document.getElementById('app').innerHTML = createLayout(content, 'dev-completed');
        setPageTitle('完了プロジェクト');
        setupLayoutEventListeners();
    }
}

// 依頼者のホームページ
async function renderClientHome() {
    try {
        // 最新のアイディアを取得
        const [myIdeasRes, ongoingRes] = await Promise.all([
            fetch(`${API_URL}/ideas/my-ideas`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            }),
            fetch(`${API_URL}/ideas/my-ideas?status=in_progress`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            })
        ]);
        
        const myIdeas = await myIdeasRes.json();
        const ongoingProjects = await ongoingRes.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold mb-2">ようこそ、${state.user.username}さん</h1>
                    <p class="text-gray-600">あなたのアイディアを形にしましょう</p>
                </div>
                
                <!-- クイックアクション -->
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;" 
                       class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
                        <svg class="w-12 h-12 mx-auto mb-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <h3 class="font-semibold">新しいアイディアを投稿</h3>
                        <p class="text-sm text-gray-600 mt-1">あなたのアイディアを共有しましょう</p>
                    </a>
                    
                    <a href="/developers" onclick="navigateTo('/developers'); return false;" 
                       class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
                        <svg class="w-12 h-12 mx-auto mb-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <h3 class="font-semibold">開発者を探す</h3>
                        <p class="text-sm text-gray-600 mt-1">あなたのアイディアを実現する開発者を見つけましょう</p>
                    </a>
                    
                    <a href="/ideas" onclick="navigateTo('/ideas'); return false;" 
                       class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
                        <svg class="w-12 h-12 mx-auto mb-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <h3 class="font-semibold">みんなのアイディアを見る</h3>
                        <p class="text-sm text-gray-600 mt-1">他の人のアイディアからインスピレーションを得ましょう</p>
                    </a>
                </div>
                
                <!-- 進行中のプロジェクト -->
                ${ongoingProjects.length > 0 ? `
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold">進行中のプロジェクト</h2>
                            <a href="/ongoing-projects" onclick="navigateTo('/ongoing-projects'); return false;" 
                               class="text-indigo-600 hover:text-indigo-700 text-sm">すべて見る →</a>
                        </div>
                        <div class="grid gap-4">
                            ${ongoingProjects.slice(0, 3).map(project => `
                                <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                     onclick="navigateTo('/idea?id=${project.id}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-semibold">${project.title}</h4>
                                            <p class="text-sm text-gray-600 mt-1">${project.description}</p>
                                        </div>
                                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">開発中</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- 最近のアイディア -->
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">あなたのアイディア</h2>
                        <a href="/my-ideas" onclick="navigateTo('/my-ideas'); return false;" 
                           class="text-indigo-600 hover:text-indigo-700 text-sm">すべて見る →</a>
                    </div>
                    ${myIdeas.length === 0 ? `
                        <div class="bg-white rounded-lg shadow p-8 text-center">
                            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            <p class="text-gray-500 mb-4">まだアイディアを投稿していません</p>
                            <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;" 
                               class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block">
                                最初のアイディアを投稿
                            </a>
                        </div>
                    ` : `
                        <div class="grid gap-4">
                            ${myIdeas.slice(0, 5).map(idea => `
                                <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                     onclick="navigateTo('/idea?id=${idea.id}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-semibold">${idea.title}</h4>
                                            <p class="text-sm text-gray-600 mt-1">${idea.description}</p>
                                        </div>
                                        <span class="bg-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-100 
                                                     text-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-800 
                                                     px-2 py-1 rounded text-sm">
                                            ${idea.status === 'open' ? '募集中' : idea.status === 'in_progress' ? '開発中' : '完了'}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'home');
        setPageTitle('ホーム');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error in renderClientHome:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'home');
        setPageTitle('ホーム');
        setupLayoutEventListeners();
    }
}

// 受信ボックスページ
async function renderInbox() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }
    
    const content = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-4">受信ボックス</h2>
                <p class="text-gray-600">通知機能は現在開発中です。</p>
                <div class="mt-8 bg-gray-50 rounded-lg p-8 text-center">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-gray-500">新しい通知はありません</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('app').innerHTML = createLayout(content, 'inbox');
    setPageTitle('受信ボックス');
    setupLayoutEventListeners();
}

// 自分のアイディア一覧ページ
async function renderMyIdeas() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ideas/my-ideas`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const ideas = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">自分のアイディア</h2>
                        <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;" 
                           class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            新しいアイディアを投稿
                        </a>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>投稿したすべてのアイディアが表示されます（公開・非公開、ステータスに関わらず）</p>
                    </div>
                </div>
                
                ${ideas.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <p class="text-gray-500 mb-4">まだアイディアを投稿していません</p>
                        <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;" 
                           class="text-indigo-600 hover:text-indigo-700">最初のアイディアを投稿する</a>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${ideas.map(idea => `
                            <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                 onclick="navigateTo('/idea?id=${idea.id}')">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-xl font-semibold mb-2">${idea.title}</h3>
                                        <p class="text-gray-600 mb-2">${idea.description}</p>
                                        <div class="flex items-center gap-4 text-sm text-gray-500">
                                            <span class="bg-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-100 
                                                         text-${idea.status === 'open' ? 'green' : idea.status === 'in_progress' ? 'yellow' : 'blue'}-800 
                                                         px-2 py-1 rounded">
                                                ${idea.status === 'open' ? '募集中' : idea.status === 'in_progress' ? '開発中' : '完了'}
                                            </span>
                                            <span class="${idea.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded">
                                                ${idea.is_public ? '公開' : '非公開'}
                                            </span>
                                            <span>${new Date(idea.created_at).toLocaleDateString()}</span>
                                            ${idea.pending_requests_count > 0 ? `
                                                <span class="text-orange-600">
                                                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                                    </svg>
                                                    ${idea.pending_requests_count}件のリクエスト
                                                </span>
                                            ` : ''}
                                        </div>
                                    </div>
                                    ${idea.thumbnail_url ? `
                                        <img src="${idea.thumbnail_url}" alt="${idea.title}" 
                                             class="w-24 h-24 object-cover rounded ml-4">
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'my-ideas');
        setPageTitle('自分のアイディア');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching my ideas:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'my-ideas');
        setPageTitle('エラー');
        setupLayoutEventListeners();
    }
}

// 進行中プロジェクトページ
async function renderOngoingProjects() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ideas/my-ideas?status=in_progress`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const projects = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">進行中プロジェクト</h2>
                
                ${projects.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p class="text-gray-500">進行中のプロジェクトはありません</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${projects.map(project => `
                            <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                 onclick="navigateTo('/idea?id=${project.id}')">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                                        <p class="text-gray-600 mb-2">${project.description}</p>
                                        <div class="flex items-center gap-4 text-sm text-gray-500">
                                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">開発中</span>
                                            <span>開始日: ${new Date(project.development_started_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    ${project.activeDevelopment ? `
                                        <button onclick="event.stopPropagation(); navigateTo('/development?id=${project.activeDevelopment.id}')" 
                                                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                            開発状況を見る
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'ongoing-projects');
        setPageTitle('進行中プロジェクト');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching ongoing projects:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'ongoing-projects');
        setPageTitle('エラー');
        setupLayoutEventListeners();
    }
}

// 完了プロジェクトページ
async function renderCompletedProjects() {
    if (!state.token || state.user?.role !== 'client') {
        navigateTo('/');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ideas/my-ideas?status=delivered`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const projects = await response.json();
        
        const content = `
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6">完了プロジェクト</h2>
                
                ${projects.length === 0 ? `
                    <div class="bg-white rounded-lg shadow p-8 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
                        </svg>
                        <p class="text-gray-500">完了したプロジェクトはまだありません</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${projects.map(project => `
                            <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                                 onclick="navigateTo('/idea?id=${project.id}')">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                                        <p class="text-gray-600 mb-2">${project.description}</p>
                                        <div class="flex items-center gap-4 text-sm text-gray-500">
                                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">完了</span>
                                            <span>完了日: ${project.development_completed_at ? new Date(project.development_completed_at).toLocaleDateString() : '不明'}</span>
                                            ${project.budget ? `<span>予算: ¥${project.budget.toLocaleString()}</span>` : ''}
                                        </div>
                                    </div>
                                    ${project.thumbnail_url ? `
                                        <img src="${project.thumbnail_url}" alt="${project.title}" 
                                             class="w-24 h-24 object-cover rounded ml-4">
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('app').innerHTML = createLayout(content, 'completed-projects');
        setPageTitle('完了プロジェクト');
        setupLayoutEventListeners();
    } catch (error) {
        console.error('Error fetching completed projects:', error);
        const errorContent = '<p class="text-center text-red-600">エラーが発生しました</p>';
        document.getElementById('app').innerHTML = createLayout(errorContent, 'completed-projects');
        setPageTitle('エラー');
        setupLayoutEventListeners();
    }
}

// グローバル関数として公開
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    state.token = null;
    state.user = null;
    window.location.href = '/';
};

// デバッグ用：window関数の確認
console.log('Window functions check:');
console.log('navigateTo:', typeof window.navigateTo);
console.log('generateThumbnail:', typeof window.generateThumbnail);
console.log('deleteIdea:', typeof window.deleteIdea);

// グローバルクリックイベントハンドラー（デリゲーション）
document.addEventListener('click', function(event) {
    // aタグのonclick処理
    const anchor = event.target.closest('a[onclick]');
    if (anchor) {
        event.preventDefault();
        const onclickAttr = anchor.getAttribute('onclick');
        try {
            eval(onclickAttr);
        } catch (error) {
            console.error('Error executing onclick:', error, onclickAttr);
        }
    }
    
    // buttonタグのonclick処理
    const button = event.target.closest('button[onclick]');
    if (button && !anchor) {
        const onclickAttr = button.getAttribute('onclick');
        try {
            eval(onclickAttr);
        } catch (error) {
            console.error('Error executing onclick:', error, onclickAttr);
        }
    }
    
    // divタグのonclick処理
    const div = event.target.closest('div[onclick]');
    if (div && !anchor && !button) {
        const onclickAttr = div.getAttribute('onclick');
        try {
            eval(onclickAttr);
        } catch (error) {
            console.error('Error executing onclick:', error, onclickAttr);
        }
    }
});

window.addEventListener('popstate', render);
checkAuth().then(() => {
    render();
    // 初回レンダリング後の関数チェック
    setTimeout(() => {
        console.log('Functions available after render:');
        console.log('navigateTo:', typeof window.navigateTo);
        console.log('All window functions:', Object.keys(window).filter(key => typeof window[key] === 'function' && key.includes('navigate')));
    }, 1000);
});