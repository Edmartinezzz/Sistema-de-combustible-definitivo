const db = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log('Checking/Applying migration for monto_recargo...');
        const sql = fs.readFileSync(path.join(__dirname, 'database', 'migration_add_recargo.sql'), 'utf8');
        await db.query(sql);
        console.log('✅ Migration applied successfully!');
    } catch (err) {
        if (err.code === '42701') { // duplicate_column
            console.log('ℹ️ Column already exists, skipping.');
        } else {
            console.error('❌ Error applying migration:', err);
        }
    } finally {
        process.exit();
    }
}

run();
