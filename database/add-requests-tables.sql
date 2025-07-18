-- Development requests table
CREATE TABLE IF NOT EXISTS development_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    developer_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget INTEGER,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
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