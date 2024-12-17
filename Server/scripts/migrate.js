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

        await client.query('BEGIN');
        await client.query(schema);
        await client.query('COMMIT');

        console.log('Migration completed successfully');
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

