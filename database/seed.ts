import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, 'idea_works.db'));

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seedDatabase() {
  console.log('🌱 シードデータの投入を開始します...');

  // 既存のデータをクリア（オプション）
  console.log('既存のデータをクリアしています...');
  db.run('DELETE FROM developments');
  db.run('DELETE FROM ideas');
  db.run('DELETE FROM users');

  // パスワードのハッシュ化
  const hashedPassword = await hashPassword('password123');

  // 依頼者データ
  const clients = [
    { email: 'tanaka@example.com', username: '田中太郎', password: hashedPassword },
    { email: 'suzuki@example.com', username: '鈴木花子', password: hashedPassword },
    { email: 'yamada@example.com', username: '山田健一', password: hashedPassword },
    { email: 'sato@example.com', username: '佐藤美咲', password: hashedPassword },
    { email: 'watanabe@example.com', username: '渡辺翔太', password: hashedPassword },
    { email: 'ito@example.com', username: '伊藤あやか', password: hashedPassword },
    { email: 'nakamura@example.com', username: '中村大輝', password: hashedPassword },
    { email: 'kobayashi@example.com', username: '小林真理', password: hashedPassword },
    { email: 'kato@example.com', username: '加藤隆司', password: hashedPassword },
    { email: 'yoshida@example.com', username: '吉田優子', password: hashedPassword },
  ];

  // 開発者データ
  const developers = [
    { email: 'dev1@example.com', username: 'DevMaster', password: hashedPassword },
    { email: 'dev2@example.com', username: 'CodeNinja', password: hashedPassword },
    { email: 'dev3@example.com', username: 'TechGuru', password: hashedPassword },
    { email: 'dev4@example.com', username: 'WebWizard', password: hashedPassword },
    { email: 'dev5@example.com', username: 'AppBuilder', password: hashedPassword },
    { email: 'dev6@example.com', username: 'FullStackPro', password: hashedPassword },
    { email: 'dev7@example.com', username: 'CloudExpert', password: hashedPassword },
    { email: 'dev8@example.com', username: 'DataScientist', password: hashedPassword },
    { email: 'dev9@example.com', username: 'AIEngineer', password: hashedPassword },
    { email: 'dev10@example.com', username: 'MobileDev', password: hashedPassword },
  ];

  // アイディアデータ
  const ideas = [
    {
      title: 'タスク管理アプリ',
      description: 'シンプルで使いやすいタスク管理アプリを作りたい。カレンダー連携機能とリマインダー機能は必須。',
      budget: 300000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80'
    },
    {
      title: '在庫管理システム',
      description: '小規模な小売店向けの在庫管理システム。バーコード読み取りと売上分析機能が欲しい。',
      budget: 500000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80'
    },
    {
      title: 'オンライン学習プラットフォーム',
      description: '動画配信とクイズ機能を持つ学習プラットフォーム。進捗管理と証明書発行機能も必要。',
      budget: 800000,
      status: 'in_progress',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
    },
    {
      title: '予約管理システム',
      description: '美容院向けの予約管理システム。顧客管理とLINE通知連携ができるようにしたい。',
      budget: 400000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'
    },
    {
      title: 'チャットボット',
      description: 'カスタマーサポート用のAIチャットボット。FAQの自動応答と人間へのエスカレーション機能。',
      budget: 600000,
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&q=80'
    },
    {
      title: '経費精算アプリ',
      description: '領収書の写真撮影で自動入力される経費精算アプリ。承認ワークフロー機能付き。',
      budget: 450000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
    },
    {
      title: 'SNS分析ツール',
      description: 'Twitter/Instagramの投稿分析ツール。エンゲージメント率の可視化とレポート作成機能。',
      budget: 350000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80'
    },
    {
      title: '勤怠管理システム',
      description: 'リモートワーク対応の勤怠管理システム。GPS打刻と作業時間の自動集計機能。',
      budget: 550000,
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80'
    },
    {
      title: 'ECサイト構築',
      description: 'ハンドメイド作品を販売するECサイト。作家ごとのページとメッセージ機能が欲しい。',
      budget: 700000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
    },
    {
      title: 'IoTセンサーダッシュボード',
      description: '温度・湿度センサーのデータを可視化するダッシュボード。アラート通知機能付き。',
      budget: 400000,
      status: 'open',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    }
  ];

  // ユーザーを挿入
  console.log('ユーザーを作成中...');
  let clientIds: number[] = [];
  let developerIds: number[] = [];

  // 依頼者を挿入
  for (const client of clients) {
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
        [client.email, client.username, client.password, 'client'],
        function(err) {
          if (err) console.error('Error inserting client:', err);
          else clientIds.push(this.lastID);
          resolve(null);
        }
      );
    });
  }

  // 開発者を挿入
  for (const developer of developers) {
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
        [developer.email, developer.username, developer.password, 'developer'],
        function(err) {
          if (err) console.error('Error inserting developer:', err);
          else developerIds.push(this.lastID);
          resolve(null);
        }
      );
    });
  }

  // アイディアを挿入
  console.log('アイディアを作成中...');
  let ideaIds: number[] = [];
  
  for (let i = 0; i < ideas.length; i++) {
    const idea = ideas[i];
    const userId = clientIds[i % clientIds.length];
    
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO ideas (user_id, title, description, budget, status, thumbnail) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, idea.title, idea.description, idea.budget, idea.status, idea.thumbnail],
        function(err) {
          if (err) console.error('Error inserting idea:', err);
          else ideaIds.push(this.lastID);
          resolve(null);
        }
      );
    });
  }

  // いくつかの開発案件を作成
  console.log('開発案件を作成中...');
  
  // アイディア3（オンライン学習プラットフォーム）に開発者1が着手
  await new Promise((resolve) => {
    db.run(
      'INSERT INTO developments (idea_id, developer_id, status) VALUES (?, ?, ?)',
      [ideaIds[2], developerIds[0], 'started'],
      (err) => {
        if (err) console.error('Error inserting development:', err);
        resolve(null);
      }
    );
  });

  // アイディア5（チャットボット）に開発者2が着手し納品済み
  await new Promise((resolve) => {
    db.run(
      'INSERT INTO developments (idea_id, developer_id, status, deliverable_url, completed_at) VALUES (?, ?, ?, ?, ?)',
      [ideaIds[4], developerIds[1], 'completed', 'https://github.com/example/chatbot', new Date().toISOString()],
      (err) => {
        if (err) console.error('Error inserting development:', err);
        resolve(null);
      }
    );
  });

  // アイディア8（勤怠管理システム）に開発者3が着手し完了
  await new Promise((resolve) => {
    db.run(
      'INSERT INTO developments (idea_id, developer_id, status, deliverable_url, completed_at) VALUES (?, ?, ?, ?, ?)',
      [ideaIds[7], developerIds[2], 'completed', 'https://github.com/example/attendance-system', new Date().toISOString()],
      (err) => {
        if (err) console.error('Error inserting development:', err);
        resolve(null);
      }
    );
  });

  console.log('✅ シードデータの投入が完了しました！');
  console.log('\n📝 テストアカウント情報:');
  console.log('依頼者: tanaka@example.com / password123');
  console.log('開発者: dev1@example.com / password123');
  console.log('\n※ 全てのアカウントのパスワードは "password123" です');
  
  db.close();
}

// 実行
seedDatabase().catch(console.error);