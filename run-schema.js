const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL no está en el .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function runSchema() {
    try {
        console.log('📖 Leyendo schema.sql...');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Ejecutando script SQL en Supabase...');
        // Dividir por ; para ejecutar por partes si es necesario, pero intentaremos todo junto primero
        // postgres soporta scripts largos si no hay comandos de psql (\)
        await pool.query(sql);

        console.log('✅ ¡Schema aplicado exitosamente!');
        
        // Verificar una tabla
        const res = await pool.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(`📊 Tablas creadas: ${res.rows[0].count}`);

        await pool.end();
    } catch (error) {
        console.error('❌ Error ejecutando schema:', error.message);
        if (error.position) {
            console.error(`Error cerca de la posición: ${error.position}`);
        }
        process.exit(1);
    }
}

runSchema();
