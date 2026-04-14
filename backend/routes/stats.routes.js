const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/stats/guias-count
 * Obtiene el conteo de guías generadas en un rango de fechas
 */
router.get('/guias-count', authenticateToken, requireRole(['master', 'fiscalizador']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Fecha de inicio y fin son requeridas (YYYY-MM-DD).' });
        }

        // Asegurar que las fechas incluyan todo el día (desde las 00:00:00 hasta las 23:59:59)
        const start = `${startDate} 00:00:00`;
        const end = `${endDate} 23:59:59`;

        const result = await db.query(
            `SELECT COUNT(*) as total 
             FROM guias_movilizacion 
             WHERE created_at BETWEEN $1 AND $2`,
            [start, end]
        );

        res.json({
            success: true,
            total: parseInt(result.rows[0].total),
            period: { startDate, endDate }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al procesar el reporte de estadísticas.' });
    }
});

module.exports = router;
