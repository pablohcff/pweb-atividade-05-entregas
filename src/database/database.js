import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_URL || './database.sqlite';
const MIGRATION_PATH = join(__dirname, '../../migration.sql');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migration = readFileSync(MIGRATION_PATH, 'utf-8');
db.exec(migration);
