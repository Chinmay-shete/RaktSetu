const fs = require('fs');
const path = require('path');
const { writePool } = require('./config/db');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'models', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Strip comments line-by-line
    const cleanSql = sql
      .split('\n')
      .map(line => {
        const index = line.indexOf('--');
        return index !== -1 ? line.substring(0, index) : line;
      })
      .join('\n');
    
    const queries = cleanSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Starting migration... Found ${queries.length} SQL statements to execute.`);
    
    const connection = await writePool.getConnection();
    try {
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`Executing statement ${i + 1}/${queries.length}...`);
        await connection.query(query);
      }
      console.log('Migration completed successfully!');
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
