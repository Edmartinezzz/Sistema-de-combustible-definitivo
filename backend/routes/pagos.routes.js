const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { formatNumeroGuia, generateUUID, truncateIP } = require('../utils/security');
const { uploadFile, supabase } = require('../services/supabaseService');
const path = require('path');

const router = express.Router();

/**
 * POST /api/pagos/subir-comprobante
 * Subir comprobante de pago (solo empresas)
 */
router.post('/subir-comprobante',
    authenticateToken,
    requireRole(['empresa', 'contribuyente']),
    uploadLimiter,
    upload.single('comprobante'),
    async (req, res) => {
        const client = await db.pool.connect();

        try {
            // Verificar si el módulo de pagos está habilitado
            const configResult = await client.query("SELECT valor FROM config_sistema WHERE clave = 'modulo_pagos_habilitado'");
            const moduloPagosHabilitado = configResult.rows.length > 0 ? configResult.rows[0].valor === 'true' : true;

            if (!moduloPagosHabilitado) {
                client.release();
                return res.status(403).json({
                    error: 'El módulo de pagos está temporalmente deshabilitado por administración.'
                });
            }

            const { guia_id, banco, numero_referencia, fecha_pago, monto } = req.body;

            if (!req.file) {
                return res.status(400).json({
                    error: 'Debe subir un comprobante de pago.'
                });
            }

            if (!guia_id || !banco || !numero_referencia || !fecha_pago || !monto) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos.'
                });
            }

            await client.query('BEGIN');

            const isPagoGlobal = guia_id === 'deuda_total';
            let guia = null;

            if (!isPagoGlobal) {
                // Verificar que la guía existe y pertenece a la empresa
                const guiaResult = await client.query(
                    'SELECT * FROM guias_movilizacion WHERE id = $1 AND empresa_id = $2',
                    [guia_id, req.user.empresaId]
                );

                if (guiaResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Guía no encontrada.' });
                }

                guia = guiaResult.rows[0];
                const totalPendiente = (parseFloat(guia.monto_pagar) + parseFloat(guia.monto_recargo || 0)) - parseFloat(guia.monto_pagado || 0);

                if (totalPendiente <= 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'Esta guía ya ha sido pagada totalmente.' });
                }

                const estadosPermitidos = ['activa', 'pendiente_pago', 'pago_pendiente_verificacion'];
                if (!estadosPermitidos.includes(guia.estado)) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'El estado actual de la guía no permite registrar pagos.' });
                }

                // Calcular recargo si han pasado más de 24 horas
                const now = new Date();
                const diffHours = (now - new Date(guia.created_at)) / (1000 * 60 * 60);
                if (diffHours > 24 && !guia.recargo_aplicado) {
                    const recargo = parseFloat(guia.monto_pagar) * 0.10;
                    await client.query(
                        `UPDATE guias_movilizacion SET monto_recargo = $1, recargo_aplicado = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                        [recargo, guia.id]
                    );
                }
            }

            // Subir a Supabase Storage
            const fileExt = path.extname(req.file.originalname);
            const fileName = `pagos/${generateUUID()}${fileExt}`;
            const publicUrl = await uploadFile(req.file.buffer, fileName);

            // Registrar pago (guia_id será NULL si es global)
            const pagoResult = await client.query(
                `INSERT INTO pagos 
                 (guia_id, empresa_id, monto, banco, numero_referencia, fecha_pago, comprobante_url, estado)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [isPagoGlobal ? null : guia_id, req.user.empresaId, monto, banco, numero_referencia,
                    fecha_pago, publicUrl, 'pendiente']
            );

            if (!isPagoGlobal && guia_id) {
                // Actualizar estado de la guía específica
                await client.query(
                    `UPDATE guias_movilizacion SET estado = 'pago_pendiente_verificacion', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [guia_id]
                );
            }

            await client.query(
                `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos, ip_address)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.user.id, 'subir_comprobante', 'pagos', pagoResult.rows[0].id,
                JSON.stringify({ guia_id, monto }), truncateIP(req.ip)]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Comprobante subido exitosamente. Pendiente de verificación.',
                pago: pagoResult.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al subir comprobante:', error);
            res.status(500).json({
                error: 'Error al procesar el comprobante.',
                details: error.message
            });
        } finally {
            client.release();
        }
    }
);

/**
 * GET /api/pagos/pendientes
 * Listar pagos pendientes de verificación (solo master)
 */
router.get('/pendientes', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.*, g.numero_guia, g.tipo_mineral, g.cantidad,
                    e.razon_social as empresa_nombre, e.rif as empresa_rif
             FROM pagos p
             LEFT JOIN guias_movilizacion g ON p.guia_id = g.id
             JOIN empresas e ON p.empresa_id = e.id
             WHERE p.estado = 'pendiente'
             ORDER BY p.created_at ASC`
        );

        // Formatear números de guía con #
        const pagosFormateados = result.rows.map(pago => ({
            ...pago,
            numero_guia: formatNumeroGuia(pago.numero_guia)
        }));

        res.json({
            success: true,
            pagos: pagosFormateados
        });

    } catch (error) {
        console.error('Error al listar pagos pendientes:', error);
        res.status(500).json({
            error: 'Error al obtener pagos.'
        });
    }
});

/**
 * PUT /api/pagos/:id/verificar
 * Verificar un pago (solo master)
 */
router.put('/:id/verificar', authenticateToken, requireRole(['master']), async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // 1. Actualizar estado del pago
        const pagoResult = await client.query(
            `UPDATE pagos 
             SET estado = 'verificado', 
                 verificado_por = $1, 
                 fecha_verificacion = CURRENT_TIMESTAMP
             WHERE id = $2 AND estado = 'pendiente'
             RETURNING *`,
            [req.user.id, id]
        );

        if (pagoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pago no encontrado o ya procesado.' });
        }

        const pago = pagoResult.rows[0];

        if (!pago.guia_id) {
            // --- PAGO GLOBAL: Distribuir FIFO ---
            const guiasResult = await client.query(
                `SELECT * FROM guias_movilizacion 
                 WHERE empresa_id = $1 
                   AND estado IN ('activa', 'pago_pendiente_verificacion', 'pendiente_pago')
                   AND (COALESCE(monto_pagado, 0) < (monto_pagar + COALESCE(monto_recargo, 0)))
                 ORDER BY created_at ASC`,
                [pago.empresa_id]
            );

            let montoRestante = parseFloat(pago.monto);
            const guiasAfectadas = [];

            for (const guia of guiasResult.rows) {
                if (montoRestante <= 0.01) break;

                const totalRequerido = parseFloat(guia.monto_pagar) + parseFloat(guia.monto_recargo || 0);
                const pendiente = totalRequerido - parseFloat(guia.monto_pagado || 0);
                const abono = Math.min(montoRestante, pendiente);

                await client.query(
                    `UPDATE guias_movilizacion 
                     SET monto_pagado = COALESCE(monto_pagado, 0) + $1,
                         estado = 'activa',
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [abono, guia.id]
                );

                montoRestante -= abono;
                guiasAfectadas.push({ id: guia.id, numero_guia: guia.numero_guia, abono });
            }

            await client.query(
                `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos, ip_address)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.user.id, 'verificar_pago_global', 'pagos', id,
                JSON.stringify({ monto_total: pago.monto, guias_afectadas: guiasAfectadas }), truncateIP(req.ip)]
            );

            await client.query('COMMIT');
            return res.json({ success: true, message: `Pago global verificado. Se distribuyó entre ${guiasAfectadas.length} guías.` });
        }

        // --- PAGO ESPECÍFICO ---
        const guiaDataResult = await client.query(
            `UPDATE guias_movilizacion 
             SET monto_pagado = COALESCE(monto_pagado, 0) + $1,
                 estado = 'activa',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [pago.monto, pago.guia_id]
        );

        if (guiaDataResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Guía asociada no encontrada.' });
        }

        const guia = guiaDataResult.rows[0];
        const totalRequerido = parseFloat(guia.monto_pagar) + parseFloat(guia.monto_recargo || 0);
        const totalPagado = parseFloat(guia.monto_pagado);
        const esPagoCompleto = totalPagado >= (totalRequerido - 0.01);

        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.id, esPagoCompleto ? 'verificar_pago_completo' : 'verificar_abono_parcial', 'pagos', id,
            JSON.stringify({ guia_id: guia.id, monto_abonado: pago.monto, saldo_restante: totalRequerido - totalPagado }), truncateIP(req.ip)]
        );

        await client.query('COMMIT');
        
        res.json({
            success: true,
            pago_completo: esPagoCompleto,
            message: esPagoCompleto ? 
                'Pago verificado. La deuda ha sido saldada totalmente.' : 
                `Abono verificado. Restan Bs. ${(totalRequerido - totalPagado).toFixed(2)}`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al verificar pago:', error);
        res.status(500).json({ error: 'Error al procesar la verificación.', details: error.message });
    } finally {
        client.release();
    }
});

/**
 * PUT /api/pagos/:id/rechazar
 * Rechazar un pago (solo master)
 */
router.put('/:id/rechazar', authenticateToken, requireRole(['master']), async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { id } = req.params;
        const { notas_rechazo } = req.body;

        if (!notas_rechazo) {
            return res.status(400).json({
                error: 'Debe proporcionar el motivo del rechazo.'
            });
        }

        await client.query('BEGIN');

        const pagoResult = await client.query(
            `UPDATE pagos 
             SET estado = 'rechazado', 
                 verificado_por = $1, 
                 fecha_verificacion = CURRENT_TIMESTAMP,
                 notas_rechazo = $2
             WHERE id = $3 AND estado = 'pendiente'
             RETURNING *`,
            [req.user.id, notas_rechazo, id]
        );

        if (pagoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pago no encontrado o ya procesado.' });
        }

        const pago = pagoResult.rows[0];

        // Auditoría
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.id, 'rechazar_pago', 'pagos', id,
            JSON.stringify({ motivo: notas_rechazo, guia_id: pago.guia_id }), truncateIP(req.ip)]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Pago rechazado exitosamente.'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al rechazar pago:', error);
        res.status(500).json({ error: 'Error al rechazar pago.' });
    } finally {
        client.release();
    }
});

/**
 * GET /api/pagos/historial
 * Historial de pagos (filtrado por empresa si no es master)
 */
router.get('/historial', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT p.*, g.numero_guia, g.tipo_mineral,
                   e.razon_social as empresa_nombre
            FROM pagos p
            JOIN guias_movilizacion g ON p.guia_id = g.id
            JOIN empresas e ON p.empresa_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role !== 'master') {
            query += ' AND p.empresa_id = $1';
            params.push(req.user.empresaId);
        }

        query += ' ORDER BY p.created_at DESC LIMIT 100';

        const result = await db.query(query, params);

        // Formatear números de guía con #
        const pagosFormateados = result.rows.map(pago => ({
            ...pago,
            numero_guia: formatNumeroGuia(pago.numero_guia)
        }));

        res.json({
            success: true,
            pagos: pagosFormateados
        });

    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial.' });
    }
});

module.exports = router;
