const fs = require('fs');
const path = require('path');
const { pool } = require('./backend/config/database');

async function runMigration() {
    console.log('🔄 Ejecutando migración de campos de vehículo...\n');

    try {
        const sqlPath = path.join(__dirname, 'database/migration_vehiculo_campos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sql);
        
        console.log('✅ Migración ejecutada exitosamente');
        console.log('   Columnas agregadas a guias_movilizacion:');
        console.log('   - vehiculo_marca');
        console.log('   - vehiculo_modelo');
        console.log('   - vehiculo_color');
        console.log('   - vehiculo_carroceria');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

runMigration();
