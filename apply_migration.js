const { pool } = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running migration...');
        const sql = fs.readFileSync(path.join(__dirname, 'database', 'migration_add_logo_empresa.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    }
}

runMigration();
