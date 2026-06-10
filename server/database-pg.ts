import pkg from 'pg'
const { Pool } = pkg

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:ZKwglQ3vyCyWlhy4@db.juhdteykstaelvplrxmp.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

// Helper: run a parameterized query and return nothing
export async function dbRun(query: string, ...params: any[]): Promise<void> {
  await pool.query(query, params)
}

// Helper: run a query and return first row
export async function dbGet<T = any>(query: string, ...params: any[]): Promise<T | undefined> {
  const result = await pool.query(query, params)
  return result.rows[0] as T
}

// Helper: run a query and return all rows
export async function dbAll<T = any>(query: string, ...params: any[]): Promise<T[]> {
  const result = await pool.query(query, params)
  return result.rows as T[]
}

export default pool
