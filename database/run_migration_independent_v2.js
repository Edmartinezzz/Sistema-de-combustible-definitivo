const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, // Aumentado a 10s
});

async function runMigration() {
    console.log('🚀 Iniciando migración de numeración independiente (Timeout: 10s)...');
    try {
        const sqlPath = path.join(__dirname, 'migration_independent_guias.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📝 Ejecutando SQL en Supabase...');
        await pool.query(sql);
        console.log('✅ Migración completada exitosamente.');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error.message);
        process.exit(1);
    }
}

runMigration();
