const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkConfigTable() {
    try {
        console.log("Checking for config_sistema table...");
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'config_sistema'
            );
        `);
        console.log("Table exists:", result.rows[0].exists);

        if (result.rows[0].exists) {
            const rows = await pool.query("SELECT * FROM config_sistema");
            console.log("Current config rows:", rows.rows);
        } else {
            console.log("Table config_sistema does NOT exist. Creating it...");
            await pool.query(`
                CREATE TABLE IF NOT EXISTS config_sistema (
                    clave TEXT PRIMARY KEY,
                    valor TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await pool.query("INSERT INTO config_sistema (clave, valor) VALUES ('modulo_pagos_habilitado', 'true') ON CONFLICT DO NOTHING");
            console.log("Table created and initialized.");
        }
    } catch (err) {
        console.error("Database error:", err.message);
    } finally {
        await pool.end();
    }
}

checkConfigTable();
