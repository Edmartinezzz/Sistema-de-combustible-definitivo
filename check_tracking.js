const db = require('./backend/config/database');

async function checkTracking() {
    try {
        const res = await db.query('SELECT COUNT(*) FROM tracking_historial');
        console.log('Total Puntos de Rastreo:', res.rows[0].count);

        const recent = await db.query('SELECT * FROM tracking_historial ORDER BY timestamp DESC LIMIT 5');
        console.log('Últimos 5 puntos:', recent.rows);
    } catch (e) {
        console.error(e);
    }
}

checkTracking();
