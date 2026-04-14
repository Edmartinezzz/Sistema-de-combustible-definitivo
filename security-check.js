const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: 'WRONG_PASSWORD_123',
});

pool.connect((err, client, release) => {
    if (err) {
        console.log('✅ Correcto: La conexión falló como se esperaba con contraseña incorrecta.');
        process.exit(0);
    }
    console.error('❌ ALERTA DE SEGURIDAD: La conexión fue EXITOSA con una contraseña incorrecta. La base de datos está en modo TRUST.');
    release();
    process.exit(1);
});
