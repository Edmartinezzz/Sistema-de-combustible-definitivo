const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
    console.log('🔍 Probando conexión a Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const dbUrl = process.env.DATABASE_URL;

    // 1. Probar API REST
    console.log('\n--- Probando API REST ---');
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('⚠️ API REST respondió con error (puede ser por falta de tablas):', error.message);
            // If API REST fails, it might be due to missing tables. Let's check the DB directly.
            // This part is moved here to provide more context if the initial API call fails.
            
            // Ensure DB connection is established before querying tables
            if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
                console.error('❌ ERROR: Debes configurar tu contraseña en el archivo .env');
                // Do not return here, as we still want to run the DB test below
            }

        } else {
            console.log('✅ API REST conectada correctamente.');
        }
    } catch (err) {
        console.error('❌ Error fatal en API REST:', err.message);
    }

    // 2. Probar Base de Datos (PostgreSQL)
    console.log('\n--- Probando Base de Datos ---');
    if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
        console.error('❌ ERROR: Debes configurar tu contraseña en el archivo .env');
        return;
    }

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('✅ ¡CONEXIÓN EXITOSA A POSTGRESQL!');
        
        const info = await client.query('SELECT current_user, current_database()');
        console.log(`👤 Usuario: ${info.rows[0].current_user}`);
        console.log(`📊 BD: ${info.rows[0].current_database}`);

        // Listar esquemas
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata");
        console.log('📂 Esquemas disponibles:', schemas.rows.map(s => s.schema_name).join(', '));

        // 3. Listar todas las tablas en el esquema public para verificar migración
        console.log('\n📋 Listando tablas en el esquema public...');
        const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        
        if (tablesResult.rows.length === 0) {
            console.log('❌ No hay tablas en el esquema public.');
        } else {
            console.log('Tablas encontradas:');
            tablesResult.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

        // 4. Verificar específicamente la tabla usuarios
        console.log('\n🔍 Verificando tabla usuarios...');
        const userCheck = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'usuarios'");
        if (parseInt(userCheck.rows[0].count) === 0) {
            console.error('❌ ERROR: La tabla "usuarios" no existe.');
        } else {
            console.log('✅ La tabla "usuarios" existe.');
            const userCount = await client.query("SELECT count(*) FROM usuarios");
            console.log(`📊 Número de usuarios: ${userCount.rows[0].count}`);
        }
        
        client.release();
        await pool.end();
        console.log('\n✅ Prueba finalizada.');

    } catch (err) {
        console.error('\n❌ ERROR durante la prueba de DB:');
        console.error(err.message);
        if (err.message.includes('Tenant or user not found')) {
            console.log('👉 Tip: El ID del proyecto en el usuario de la URL podría estar mal o el pooler no está activo.');
        }
        process.exit(1);
    }
}

testSupabase();
