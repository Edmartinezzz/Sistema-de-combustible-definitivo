const { pool } = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database/migration_update_roles.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Migración de roles completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
