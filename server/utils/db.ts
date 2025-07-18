import sqlite3 from 'sqlite3';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './database/idea_works.db';
const db = new sqlite3.Database(dbPath);

export default db;