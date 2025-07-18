# Idea Works - ライブコーディングMVP量産所

## 概要
日常の困りごとを投稿すると、ライブコーダーが即席で開発して納品するMVP量産プラットフォーム

## 起動方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集：
```
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here  # OpenAI APIキー（AI要件定義生成に必要）
PORT=4000
```

### 3. データベースの初期化
```bash
cd database && node --import tsx init.ts
```

### 4. サーバーの起動
```bash
npm run dev
```

- バックエンド: http://localhost:3001
- フロントエンド: http://localhost:3000

## 使い方

### 依頼者として
1. 新規登録で「依頼者」を選択
2. アイディアを投稿
3. AI機能を使って要件定義を自動生成（編集可能）
4. 開発者が開発完了するまで待つ
5. 成果物を受け取る

### 開発者として
1. 新規登録で「開発者」を選択
2. アイディア一覧から開発したいアイディアを選ぶ
3. 「開発を始める」ボタンをクリック
4. 開発を行い、成果物URLを提出

## 技術スタック
- フロントエンド: Vanilla JavaScript + TailwindCSS
- バックエンド: Node.js + Express + TypeScript
- データベース: SQLite
- 認証: JWT
- AI: OpenAI API (GPT-4)

## 主な機能
- アイディア投稿・管理
- AI要件定義生成（依頼者の曖昧な要望を具体的な要件定義に変換）
- 開発着手・成果物提出
- ステータス管理