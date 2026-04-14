const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default postgres DB to change role password
    user: 'postgres',
    password: '', // Empty password should work now with trust method
});

async function reset() {
    try {
        await pool.query("ALTER USER postgres WITH PASSWORD '123456';");
        console.log('✅ Contraseña restablecida a "123456"');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al cambiar contraseña:', err.message);
        process.exit(1);
    }
}

reset();
