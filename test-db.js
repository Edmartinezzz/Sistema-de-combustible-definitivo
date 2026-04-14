const { Client } = require('pg');
require('dotenv').config();

const passwords = ['postgres', '123456', 'root', 'admin', 'password', '1234', ''];

async function testConnection() {
    console.log('🔍 Probando conexión a PostgreSQL...');

    for (const password of passwords) {
        console.log(`\nProbando con contraseña: "${password}"`);

        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'minerales_laguaira',
            user: process.env.DB_USER || 'postgres',
            password: password
        });

        try {
            await client.connect();
            console.log('✅ ¡CONEXIÓN EXITOSA!');
            console.log(`🔑 La contraseña correcta es: "${password}"`);

            // Actualizar .env si se encuentra la contraseña
            const fs = require('fs');
            let envContent = fs.readFileSync('.env', 'utf8');
            envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
            fs.writeFileSync('.env', envContent);
            console.log('📝 Archivo .env actualizado automáticamente.');

            await client.end();
            process.exit(0);
        } catch (err) {
            console.log('❌ Falló:', err.message);
            await client.end();
        }
    }

    console.log('\n⚠️ No se pudo encontrar la contraseña correcta.');
    console.log('Por favor, edita el archivo .env manualmente con tu contraseña de PostgreSQL.');
}

testConnection();
