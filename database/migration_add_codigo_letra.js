const { pool } = require('../backend/config/database');

async function runMigration() {
    console.log('🚀 Iniciando migración: Agregar codigo_letra a empresas...');
    try {
        await pool.query(`
            ALTER TABLE empresas 
            ADD COLUMN IF NOT EXISTS codigo_letra VARCHAR(5);
        `);
        console.log('✅ Columna codigo_letra agregada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error.message);
        process.exit(1);
    }
}

runMigration();
