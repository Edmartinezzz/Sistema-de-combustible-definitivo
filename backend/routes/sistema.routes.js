const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { truncateIP } = require('../utils/security');
const currencyService = require('../services/currencyService');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/sistema/tasa
 * Obtiene la tasa BCV actual
 */
router.get('/tasa', async (req, res) => {
    try {
        const tasa = await currencyService.getCurrentRate();
        res.json({
            success: true,
            tasa_bcv: tasa
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la tasa' });
    }
});

/**
 * PUT /api/sistema/tasa
 * Actualiza manualmente la tasa BCV (Solo Master)
 */
router.put('/tasa', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { tasa } = req.body;

        if (!tasa || isNaN(tasa)) {
            return res.status(400).json({ error: 'Tasa inválida' });
        }

        const success = await currencyService.updateRate(parseFloat(tasa));

        if (success) {
            // Auditoría
            await db.query(
                `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, datos_nuevos, ip_address)
                 VALUES ($1, $2, $3, $4, $5)`,
                [req.user.id, 'actualizar_tasa_bcv', 'config_sistema', JSON.stringify({ nueva_tasa: tasa, clave: 'tasa_bcv' }), truncateIP(req.ip)]
            );

            res.json({ success: true, message: 'Tasa actualizada correctamente' });
        } else {
            res.status(500).json({ error: 'Error al guardar la tasa' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tasa' });
    }
});

/**
 * GET /api/sistema/config
 * Obtiene toda la configuración del sistema
 */
router.get('/config', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT clave, valor FROM config_sistema');
        const config = {};
        result.rows.forEach(row => {
            config[row.clave] = row.valor;
        });
        
        // Evitar caché para configuraciones críticas (Kill Switch)
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

/**
 * PUT /api/sistema/config/:clave
 * Actualiza una configuración específica (Solo Master)
 */
router.put('/config/:clave', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const clave = req.params.clave ? req.params.clave.trim() : '';
        const { valor } = req.body;

        if (valor === undefined) {
            return res.status(400).json({ error: 'Valor no proporcionado' });
        }

        await db.query(
            `INSERT INTO config_sistema (clave, valor) VALUES ($1, $2)
             ON CONFLICT (clave) DO UPDATE SET valor = $2, ultima_actualizacion = CURRENT_TIMESTAMP`,
            [clave, String(valor)]
        );

        // Auditoría (omitiendo registro_id ya que usamos claves de texto en configs, no UUIDs)
        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, datos_nuevos, ip_address)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, 'actualizar_config', 'config_sistema', JSON.stringify({ clave, nuevo_valor: valor }), truncateIP(req.ip)]
        );

        res.json({ success: true, message: 'Configuración actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar config:', error);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

module.exports = router;
