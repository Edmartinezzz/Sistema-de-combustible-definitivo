const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/tracking/update
 * Recibir actualización de ubicación (GPS ping)
 * Usado por la Web App en "Modo Chofer"
 */
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { guia_id, lat, lng, velocidad, precision } = req.body;

        if (!guia_id || !lat || !lng) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // Insertar en historial
        await db.query(
            `INSERT INTO tracking_historial 
             (guia_id, lat, lng, velocidad, precision, reportado_por, timestamp)
             VALUES ($1, $2, $3, $4, $5, 'chofer_app', CURRENT_TIMESTAMP)`,
            [guia_id, lat, lng, velocidad || 0, precision || 0]
        );

        res.json({ success: true, timestamp: new Date() });

    } catch (error) {
        console.error('Error en tracking update:', error);
        // Respondemos 200 aunque falle para no saturar al cliente móvil con reintentos
        res.status(200).json({ success: false });
    }
});

/**
 * GET /api/tracking/last-positions
 * Obtener última posición conocida de todas las guías activas (Para el mapa del Master)
 */
router.get('/last-positions', authenticateToken, async (req, res) => {
    try {
        // Solo master puede ver todas. Empresa ve las suyas.

        let query = `
            SELECT DISTINCT ON (t.guia_id) 
                   t.guia_id, t.lat, t.lng, t.timestamp,
                   g.numero_guia, g.vehiculo_placa,
                   e.razon_social as empresa
            FROM tracking_historial t
            JOIN guias_movilizacion g ON t.guia_id = g.id
            JOIN empresas e ON g.empresa_id = e.id
            WHERE g.estado = 'activa'
        `;

        const params = [];

        if (req.user.role !== 'master') {
            query += ' AND g.empresa_id = $1';
            params.push(req.user.empresaId);
        }

        query += ' ORDER BY t.guia_id, t.timestamp DESC';

        const result = await db.query(query, params);

        res.json({
            success: true,
            positions: result.rows
        });

    } catch (error) {
        console.error('Error obteniendo posiciones:', error);
        res.status(500).json({ error: 'Error al obtener mapa' });
    }
});

module.exports = router;
