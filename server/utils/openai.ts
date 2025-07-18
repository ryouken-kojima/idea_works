import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRequirements(title: string, description: string, budget?: number): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `
あなたは優秀なシステムアナリストです。以下のアイディアから、システム開発の要件定義を作成してください。
依頼者の曖昧な要望から、開発者が理解しやすい具体的な要件定義を作成することが目的です。

アイディア情報:
タイトル: ${title}
説明: ${description}
${budget ? `予算: ${budget}円` : '予算: 未定'}

以下の形式で要件定義を作成してください：

## 概要
（システムの目的と概要を2-3文で簡潔に記載）

## 機能要件
### 必須機能
1. （最低限必要な機能を具体的に）
2. 
3. 

### 推奨機能
1. （あると良い機能）
2. 

## ユーザーストーリー
- 〇〇として、△△したい。なぜなら□□だから。
（主要なユーザーストーリーを3-5個）

## 非機能要件
### パフォーマンス
- レスポンス時間: 
- 同時接続数: 

### セキュリティ
- 認証方式: 
- データ保護: 

### 使いやすさ
- デバイス対応: 
- アクセシビリティ: 

## 技術仕様
### 推奨技術スタック
- フロントエンド: 
- バックエンド: 
- データベース: 
- インフラ: 

### API設計の方針
- 

## 開発スコープ
### 含まれるもの
- 
- 

### 含まれないもの
- 
- 

## 成果物
1. ソースコード一式
2. 環境構築手順書
3. 基本操作マニュアル
4. API仕様書（該当する場合）

## 開発期間の目安
- MVP版: 〇〇週間
- 完全版: 〇〇週間

## 注意事項
- （開発時の注意点や制約事項）
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは優秀なシステムアナリストです。依頼者の曖昧な要望から、開発者が理解しやすい具体的な要件定義を作成します。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content || '要件定義の生成に失敗しました。';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('要件定義の生成中にエラーが発生しました');
  }
}

export default { generateRequirements };