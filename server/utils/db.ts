import sqlite3 from 'sqlite3';
import { join, resolve } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH 
  ? resolve(process.env.DATABASE_PATH)
  : resolve(__dirname, '../../database/idea_works.db');

console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeChatTables();
  }
});

function initializeChatTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Failed to create messages table:', err);
    } else {
      console.log('Messages table ready');
    }
  });
}

export default db;