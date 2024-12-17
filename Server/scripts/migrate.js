import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    console.log('Starting migration...');

    await client.query('BEGIN');
    
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
    
    for (let statement of statements) {
      console.log('Executing statement:', statement.trim());
      await client.query(statement);
    }
    
    await client.query('COMMIT');

    console.log('Migration completed successfully');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', tablesResult.rows.map(row => row.table_name));

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    return false;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(success => {
    if (success) {
      console.log('Migration script completed successfully');
      process.exit(0);
    } else {
      console.error('Migration script failed');
      process.exit(1);
    }
  });
}

