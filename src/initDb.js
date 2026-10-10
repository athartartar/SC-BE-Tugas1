const pool = require('./db');

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

async function initDb() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          year INTEGER,
          stock INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Database initialized successfully.');
      return;
    } catch (err) {
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        throw new Error('Failed to initialize database after maximum retries.');
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

module.exports = initDb;
