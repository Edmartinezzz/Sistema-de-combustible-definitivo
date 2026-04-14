const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        console.log("Checking schema for config_sistema...");
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'config_sistema';
        `);
        console.log("Columns:", result.rows);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
