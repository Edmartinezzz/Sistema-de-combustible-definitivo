const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/database');

async function runMigration() {
    console.log('🚀 Iniciando migración de numeración independiente...');
    try {
        const sqlPath = path.join(__dirname, '../database/migration_independent_guias.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📝 Ejecutando SQL...');
        await pool.query(sql);
        console.log('✅ Migración completada exitosamente.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error.message);
        process.exit(1);
    }
}

runMigration();
