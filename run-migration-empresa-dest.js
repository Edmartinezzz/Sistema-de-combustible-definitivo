// Script para ejecutar la migración de empresa_destinataria usando Node.js
// Uso: node run-migration-empresa-dest.js

const db = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🔄 Ejecutando migración de empresa_destinataria...\n');

    try {
        // Leer archivo SQL
        const migrationPath = path.join(__dirname, 'database', 'migration_add_empresa_destinataria.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

        // Ejecutar migración
        await db.query(sqlContent);

        console.log('✅ Migración completada exitosamente!\n');
        console.log('Nuevas tablas creadas:');
        console.log('  - empresas_destinatarias');
        console.log('  - confirmaciones_llegada');
        console.log('\nUsuario de prueba creado:');
        console.log('  Usuario: cementoslaguaira');
        console.log('  Contraseña: empresa123');
        console.log('  Rol: empresa_destinataria\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar migración:', error.message);
        console.error('\nDetalles:', error);
        process.exit(1);
    }
}

runMigration();
