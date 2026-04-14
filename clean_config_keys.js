const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function cleanConfigKeys() {
    try {
        console.log("Cleaning config_sistema keys...");
        
        // Remove whitespace/newlines from keys
        const result = await pool.query(`
            UPDATE config_sistema 
            SET clave = TRIM(BOTH FROM clave)
            WHERE clave != TRIM(BOTH FROM clave)
            RETURNING *;
        `);
        
        console.log("Updated rows:", result.rowCount);
        if (result.rowCount > 0) {
            console.log("Cleaned keys:", result.rows.map(r => r.clave));
        }

        // Final check
        const finalRows = await pool.query("SELECT clave, valor FROM config_sistema");
        console.log("Current state:", finalRows.rows);

    } catch (err) {
        console.error("Database error:", err.message);
    } finally {
        await pool.end();
    }
}

cleanConfigKeys();
