const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'minerales_laguaira',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
});

async function checkColumns() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'guias_movilizacion';");
        console.log('Columnas en guias_movilizacion:');
        console.log(res.rows.map(r => r.column_name).join(', '));

        const res2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'confirmaciones_llegada';");
        console.log('\nColumnas en confirmaciones_llegada:');
        console.log(res2.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkColumns();
