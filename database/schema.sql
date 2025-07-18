-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'developer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget INTEGER,
    thumbnail TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'delivered', 'completed')),
    is_public BOOLEAN DEFAULT 1,
    deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Developments table
CREATE TABLE IF NOT EXISTS developments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL,
    developer_id INTEGER NOT NULL,
    deliverable_url TEXT,
    status TEXT NOT NULL DEFAULT 'started' CHECK(status IN ('started', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (idea_id) REFERENCES ideas(id),
    FOREIGN KEY (developer_id) REFERENCES users(id)
);

-- Add requirements column to ideas table
ALTER TABLE ideas ADD COLUMN requirements TEXT;

-- Development requests table (開発者から依頼者への開発リクエスト)
CREATE TABLE IF NOT EXISTS development_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL, -- アイデアの所有者（依頼者）
    developer_id INTEGER NOT NULL, -- リクエストを送信する開発者
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposed_budget INTEGER, -- 開発者が提案する予算
    proposed_deadline DATE, -- 開発者が提案する納期
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas(id),
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (developer_id) REFERENCES users(id)
);

-- Request messages table
CREATE TABLE IF NOT EXISTS request_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES development_requests(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_developments_idea_id ON developments(idea_id);
CREATE INDEX idx_developments_developer_id ON developments(developer_id);
CREATE INDEX idx_development_requests_idea_id ON development_requests(idea_id);
CREATE INDEX idx_development_requests_client_id ON development_requests(client_id);
CREATE INDEX idx_development_requests_developer_id ON development_requests(developer_id);
CREATE INDEX idx_request_messages_request_id ON request_messages(request_id);