-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS request_messages;
DROP TABLE IF EXISTS development_requests;

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
CREATE INDEX IF NOT EXISTS idx_development_requests_idea_id ON development_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_development_requests_client_id ON development_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_development_requests_developer_id ON development_requests(developer_id);
CREATE INDEX IF NOT EXISTS idx_request_messages_request_id ON request_messages(request_id);