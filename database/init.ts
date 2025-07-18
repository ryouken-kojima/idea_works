import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'idea_works.db'));

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating database schema:', err);
    } else {
      console.log('Database schema created successfully');
    }
    db.close();
  });
});