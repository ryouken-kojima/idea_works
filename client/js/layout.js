// モダンなサイドバーレイアウトコンポーネント

export function createLayout(content, activeSection = '') {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('userRole');
  
  return `
    <div class="flex h-screen bg-gray-50">
      <!-- サイドバー -->
      <aside id="sidebar" class="w-64 bg-white shadow-lg transition-all duration-300">
        <div class="h-full flex flex-col">
          <!-- ロゴ -->
          <div class="p-6 border-b">
            <h1 class="text-2xl font-bold text-indigo-600">IdeaWorks</h1>
          </div>
          
          <!-- メニュー -->
          <nav class="flex-1 p-4 space-y-2">
            <!-- アクティビティセクション -->
            ${userRole === 'client' ? `
            <!-- 依頼者メニュー -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">アクティビティ</h3>
              <a href="/inbox" onclick="navigateTo('/inbox'); return false;" 
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'inbox' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                受信ボックス
              </a>
            </div>
            
            <!-- アイディアセクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">アイディア</h3>
              <a href="/" onclick="navigateTo('/'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'home' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                みんなのアイディア
              </a>
              <a href="/my-ideas" onclick="navigateTo('/my-ideas'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'my-ideas' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                自分のアイディア
              </a>
              <a href="/post-idea" onclick="navigateTo('/post-idea'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'post-idea' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 4v16m8-8H4"></path>
                </svg>
                アイディア投稿
              </a>
            </div>
            
            <!-- 依頼するセクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">依頼する</h3>
              <a href="/developers" onclick="navigateTo('/developers'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'developers' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                開発者を探す
              </a>
            </div>
            
            <!-- プロジェクト管理セクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">プロジェクト管理</h3>
              <a href="/ongoing-projects" onclick="navigateTo('/ongoing-projects'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'ongoing-projects' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                進行中プロジェクト
              </a>
              <a href="/completed-projects" onclick="navigateTo('/completed-projects'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'completed-projects' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
                </svg>
                完了プロジェクト
              </a>
            </div>
            ` : `
            <!-- 開発者メニュー -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">アクティビティ</h3>
              <a href="/dev-inbox" onclick="navigateTo('/dev-inbox'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'dev-inbox' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                受信ボックス
              </a>
            </div>
            
            <!-- アイディアセクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">アイディア</h3>
              <a href="/" onclick="navigateTo('/'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'home' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                みんなのアイディア
              </a>
              <a href="/applied-ideas" onclick="navigateTo('/applied-ideas'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'applied-ideas' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                応募したアイディア
              </a>
            </div>
            
            <!-- コーダーセクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">コーダー</h3>
              <a href="/developers" onclick="navigateTo('/developers'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'developers' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                開発者を探す
              </a>
            </div>
            
            <!-- プロジェクト管理セクション -->
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">プロジェクト管理</h3>
              <a href="/dev-ongoing" onclick="navigateTo('/dev-ongoing'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'dev-ongoing' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                進行中プロジェクト
              </a>
              <a href="/dev-completed" onclick="navigateTo('/dev-completed'); return false;"
                 class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${activeSection === 'dev-completed' ? 'bg-indigo-50 text-indigo-700' : ''}">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
                </svg>
                完了プロジェクト
              </a>
            </div>
            ` /* endif userRole */}
          </nav>
          
          <!-- ユーザー情報 -->
          <div class="p-4 border-t">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-sm font-medium text-indigo-600">${user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-700">${user.username || 'ユーザー'}</p>
                <p class="text-xs text-gray-500">${userRole === 'developer' ? '開発者' : '依頼者'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- メインコンテンツ -->
      <div class="flex-1 flex flex-col">
        <!-- トップバー -->
        <header class="bg-white shadow-sm border-b">
          <div class="flex items-center justify-between px-6 py-4">
            <!-- モバイルメニューボタン -->
            <button id="mobileMenuBtn" class="lg:hidden text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <!-- ページタイトル（動的に変更） -->
            <h2 id="pageTitle" class="text-xl font-semibold text-gray-800"></h2>
            
            <!-- 設定メニュー -->
            <div class="relative">
              <button id="settingsBtn" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              
              <!-- ドロップダウンメニュー -->
              <div id="settingsDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                ${userRole === 'developer' ? `
                  <a href="/profile-edit" onclick="navigateTo('/profile-edit'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    マイページ
                  </a>
                ` : ''}
                <button id="logoutBtn" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- メインコンテンツエリア -->
        <main class="flex-1 overflow-y-auto p-6">
          ${content}
        </main>
      </div>
    </div>
    
    <!-- モバイル用オーバーレイ -->
    <div id="mobileOverlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>
  `;
}

// ページタイトルを設定
export function setPageTitle(title) {
  const titleElement = document.getElementById('pageTitle');
  if (titleElement) {
    titleElement.textContent = title;
  }
}

// レイアウトのイベントリスナーを設定
export function setupLayoutEventListeners() {
  // 設定ボタンのイベントリスナー
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = document.getElementById('settingsDropdown');
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
    });
  }
  
  // ログアウトボタンのイベントリスナー
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    });
  }
  
  // ドロップダウン外クリックで閉じる
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('settingsDropdown');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (dropdown && !dropdown.classList.contains('hidden')) {
      if (!dropdown.contains(event.target) && !settingsBtn.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });
  
  // モバイルメニューの制御
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      if (sidebar) sidebar.classList.toggle('-translate-x-full');
      if (mobileOverlay) mobileOverlay.classList.toggle('hidden');
    });
  }
  
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function() {
      if (sidebar) sidebar.classList.add('-translate-x-full');
      mobileOverlay.classList.add('hidden');
    });
  }
  
  // 進行中プロジェクトの動的読み込み
  loadOngoingProjects();
}

// 進行中プロジェクトを読み込み
async function loadOngoingProjects() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) return;
  
  try {
    let endpoint = '';
    if (userRole === 'developer') {
      endpoint = '/api/developments/my-developments';
    } else {
      endpoint = '/api/developments/client-developments';
    }
    
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const developments = await response.json();
      const ongoingProjects = developments.filter(d => 
        d.status === 'started' || d.status === 'in_progress'
      );
      
      const container = document.getElementById('ongoingProjects');
      if (container) {
        if (ongoingProjects.length === 0) {
          container.innerHTML = `
            <p class="text-sm text-gray-500 px-4">進行中のプロジェクトはありません</p>
          `;
        } else {
          container.innerHTML = ongoingProjects.slice(0, 5).map(project => `
            <a href="/development?id=${project.id}" onclick="navigateTo('/development?id=${project.id}'); return false;"
               class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span class="text-sm truncate">${project.idea_title || 'プロジェクト'}</span>
            </a>
          `).join('');
        }
      }
    }
  } catch (error) {
    console.error('進行中プロジェクトの読み込みエラー:', error);
  }
}

// グローバルに関数を公開
window.loadOngoingProjects = loadOngoingProjects;

// navigateTo関数をグローバルスコープから使えるようにする
window.navigateTo = window.navigateTo || function(path) {
  window.location.href = path;
};