const { pool } = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database/migration_verificaciones.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Tabla verificaciones_guias creada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
