const fs = require('fs');
const path = require('path');
const db = require('./backend/config/database');

async function runMigration() {
    try {
        const fileName = process.argv[2] || 'database/schema.sql';
        const sqlPath = path.join(__dirname, fileName);

        if (!fs.existsSync(sqlPath)) {
            console.error(`Error: El archivo ${sqlPath} no existe.`);
            return;
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log(`Ejecutando migración: ${fileName}...`);
        await db.query(sql);
        console.log('✅ Migración ejecutada exitosamente.');
    } catch (e) {
        console.error('Error en migración:', e);
    } finally {
        // En un script corto como este es opcional pero buena práctica
        // Si db exporta pool podrías hacer db.pool.end()
    }
}

runMigration();
