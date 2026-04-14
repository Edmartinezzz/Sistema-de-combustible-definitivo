const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/database');

async function initDatabase() {
    console.log('🔧 Inicializando base de datos...\n');

    try {
        // 1. Ejecutar schema principal
        console.log('📦 Ejecutando schema principal...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✓ Schema principal ejecutado');

        // 2. Ejecutar migración de tracking
        console.log('📦 Ejecutando migración de tracking...');
        const trackingPath = path.join(__dirname, 'update_tracking.sql');
        if (fs.existsSync(trackingPath)) {
            const trackingSQL = fs.readFileSync(trackingPath, 'utf8');
            await pool.query(trackingSQL);
            console.log('✓ Tabla tracking_historial creada');
        }

        // 3. Ejecutar migración de empresas destinatarias
        console.log('📦 Ejecutando migración de empresas destinatarias...');
        const empresaDestPath = path.join(__dirname, 'migration_add_empresa_destinataria.sql');
        if (fs.existsSync(empresaDestPath)) {
            const empresaDestSQL = fs.readFileSync(empresaDestPath, 'utf8');
            await pool.query(empresaDestSQL);
            console.log('✓ Tablas empresas_destinatarias y confirmaciones_llegada creadas');
        }

        console.log('\n════════════════════════════════════════════════════');
        console.log('✓ Base de datos inicializada correctamente');
        console.log('════════════════════════════════════════════════════');
        console.log('\nTablas creadas:');
        console.log('  • empresas');
        console.log('  • usuarios');
        console.log('  • guias_movilizacion');
        console.log('  • pagos');
        console.log('  • auditoria');
        console.log('  • tracking_historial');
        console.log('  • empresas_destinatarias');
        console.log('  • confirmaciones_llegada');
        
        console.log('\n📝 Credenciales de prueba:');
        console.log('   ┌─────────────────────────────────────────┐');
        console.log('   │ Usuario Master (Administrador)         │');
        console.log('   │   Username: admin                      │');
        console.log('   │   Password: 1234                       │');
        console.log('   ├─────────────────────────────────────────┤');
        console.log('   │ Usuario Empresa (Cantera)              │');
        console.log('   │   Username: canteraprogreso            │');
        console.log('   │   Password: empresa123                 │');
        console.log('   ├─────────────────────────────────────────┤');
        console.log('   │ Usuario Destino (Confirma llegadas)    │');
        console.log('   │   Username: destino                    │');
        console.log('   │   Password: 1234                       │');
        console.log('   └─────────────────────────────────────────┘');
        console.log('\n⚠️  IMPORTANTE: Cambiar estas contraseñas en producción\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        console.error('Detalles:', error.message);
        process.exit(1);
    }
}

initDatabase();
