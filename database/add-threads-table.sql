-- Add request_id to developments table to link with approved request
ALTER TABLE developments ADD COLUMN request_id INTEGER REFERENCES development_requests(id);

-- Threads table for development discussions
CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    development_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (development_id) REFERENCES developments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Thread messages table
CREATE TABLE IF NOT EXISTS thread_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_threads_development_id ON threads(development_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_thread_id ON thread_messages(thread_id);