import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    console.log('Starting migration...');
    console.log('Schema file content:', schema);

    await client.query('BEGIN');
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
    
    for (let statement of statements) {
      console.log('Executing statement:', statement);
      await client.query(statement);
    }
    
    await client.query('COMMIT');

    console.log('Migration completed successfully');
    
    // Verify tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', tablesResult.rows.map(row => row.table_name));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrate().catch((error) => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});

