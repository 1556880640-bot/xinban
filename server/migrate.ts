import pkg from 'pg'
const { Client } = pkg

const CONN = 'postgresql://postgres:ZKwglQ3vyCyWlhy4@db.juhdteykstaelvplrxmp.supabase.co:5432/postgres'

async function migrate() {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to Supabase PostgreSQL')

  await client.query(`
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
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS echoes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target_person TEXT NOT NULL,
      personality TEXT,
      memories TEXT,
      quotes TEXT,
      places TEXT,
      games_memes TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      echo_id TEXT NOT NULL REFERENCES echoes(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      segment_index INTEGER DEFAULT 0,
      total_segments INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS echo_settings (
      echo_id TEXT PRIMARY KEY REFERENCES echoes(id) ON DELETE CASCADE,
      active_message_enabled INTEGER DEFAULT 1,
      active_message_frequency TEXT DEFAULT 'medium',
      delay_reply_enabled INTEGER DEFAULT 1,
      delay_seconds_min INTEGER DEFAULT 5,
      delay_seconds_max INTEGER DEFAULT 30,
      silent_mode INTEGER DEFAULT 0,
      skip_reply_mode INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contest_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_echoes_user ON echoes(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_echo ON messages(echo_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_time ON messages(created_at);
  `)

  console.log('All tables created successfully!')

  // Verify
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `)
  console.log('Tables:', tables.rows.map(r => r.table_name).join(', '))

  await client.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
