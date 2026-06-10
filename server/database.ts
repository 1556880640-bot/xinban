import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'xinban.db')
const db = new Database(dbPath)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    invite_code TEXT UNIQUE,
    invited_by TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TEXT,
    trial_ends_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS echoes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_person TEXT NOT NULL,
    personality TEXT,
    memories TEXT,
    quotes TEXT,
    places TEXT,
    games_memes TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    echo_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    segment_index INTEGER DEFAULT 0,
    total_segments INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (echo_id) REFERENCES echoes(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS echo_settings (
    echo_id TEXT PRIMARY KEY,
    active_message_enabled INTEGER DEFAULT 1,
    active_message_frequency TEXT DEFAULT 'medium',
    delay_reply_enabled INTEGER DEFAULT 1,
    delay_seconds_min INTEGER DEFAULT 5,
    delay_seconds_max INTEGER DEFAULT 30,
    silent_mode INTEGER DEFAULT 0,
    skip_reply_mode INTEGER DEFAULT 0,
    FOREIGN KEY (echo_id) REFERENCES echoes(id)
  );

  CREATE TABLE IF NOT EXISTS contest_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

export default db
