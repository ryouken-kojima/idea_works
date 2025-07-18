# Claude向けの指示

## 言語設定
- **必ず日本語で回答すること**
- ユーザーへの全ての応答は日本語で行う
- 技術的な説明も日本語で行う

## プロジェクト固有の情報

### サーバー設定
- バックエンドサーバーはポート3001で動作
- フロントエンドのAPI_URLは `http://localhost:3001/api` に設定済み

### サーバー起動方法
```bash
# 依存関係のインストール（初回のみ）
npm install

# 開発サーバーの起動
npm run dev
```

このコマンドで以下が同時に起動：
- バックエンドサーバー（Express、ポート3001）
- フロントエンドサーバー（Python、ポート8000）

### 主要なファイル構成
- サーバーエントリーポイント: `/server/index.ts`
- クライアントアプリ: `/client/js/app.js`
- APIルート:
  - `/api/auth` - 認証関連
  - `/api/ideas` - アイデア管理（サムネイル生成を含む）
  - `/api/developments` - 開発進捗管理

### サムネイル生成機能
- エンドポイント: `POST /api/ideas/generate-thumbnail`
- OpenAI DALL-E 3を使用
- 認証が必要（authenticateTokenミドルウェア）
- 環境変数 `OPENAI_API_KEY` の設定が必須

### トラブルシューティング
- `ERR_CONNECTION_REFUSED`エラー: サーバーが起動していない
- ポート設定: `.env`ファイルでPORT=3001を確認
- 依存関係: `npm install`で全てのパッケージをインストール