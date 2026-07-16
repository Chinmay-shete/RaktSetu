/**
 * RaktSetu — Migration Runner
 * Applies all SQL migration files in models/migrations/ in numeric order.
 * Safe to run multiple times — already-applied migrations are skipped.
 *
 * Usage (from backend/ directory):
 *   node run_migrations.js
 */
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'models', 'migrations');

// Same SSL helper as config/db.js — required for Aiven MySQL (DB_SSL=true)
function getSslConfig() {
  if (process.env.DB_SSL !== 'true') return undefined;
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
  return { rejectUnauthorized };
}

async function run() {
  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || '127.0.0.1',
    port:               parseInt(process.env.DB_PORT || '3306'),
    user:               process.env.DB_USER     || process.env.DB_USERNAME || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || process.env.DB_DATABASE || 'raktsetu',
    ssl:                getSslConfig(),
    multipleStatements: true,

  });

  console.log('Connected to database:', process.env.DB_HOST);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [applied] = await conn.execute('SELECT filename FROM _migrations');
  const appliedSet = new Set(applied.map(r => r.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log('  SKIP (already applied):', file);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log('  APPLYING:', file);
    await conn.query(sql);
    await conn.execute('INSERT INTO _migrations (filename) VALUES (?)', [file]);
    console.log('  DONE:', file);
    count++;
  }

  console.log(count === 0 ? 'All migrations already applied.' : 'Applied ' + count + ' migration(s).');
  await conn.end();
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
