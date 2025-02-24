import { query } from '../config/database.js';

export const executeTransaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para Render
  },
});

pool.connect()
  .then(() => console.log('✅ Conectado a Supabase'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = pool;


export const paginate = async (queryText, params, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS count_query`;
  const paginatedQuery = `${queryText} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  const [countResult, dataResult] = await Promise.all([
    query(countQuery, params),
    query(paginatedQuery, [...params, limit, offset])
  ]);

  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages
    }
  };
};