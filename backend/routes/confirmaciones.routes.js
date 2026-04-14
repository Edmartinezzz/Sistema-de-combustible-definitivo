const express = require('express');
const multer = require('multer');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const { validateGuiaPhoto, quickValidate } = require('../services/photoValidator');
const { sanitizeInput, formatNumeroGuia, truncateIP } = require('../utils/security');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

const { uploadFile, supabase } = require('../services/supabaseService');
const os = require('os');
const crypto = require('crypto');

// Configuración de multer en memoria para confirmaciones
const storage = multer.memoryStorage();
const uploadConfirmacion = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes JPEG o PNG'));
        }
    }
});

/**
 * POST /api/confirmaciones
 * Crear nueva confirmación de llegada de mineral (solo empresa_destinataria)
 */
router.post('/', authenticateToken, requireRole(['empresa_destinataria']), uploadConfirmacion.single('foto_guia'), async (req, res) => {
    const client = await db.pool.connect();

    try {
        // Verificar que se subió una foto
        if (!req.file) {
            return res.status(400).json({
                error: 'Debe adjuntar una foto de la guía.'
            });
        }

        const {
            hora_llegada,
            nombre_empresa_confirmante,
            codigo_guia,
            mineral_recibido
        } = req.body;

        // Validaciones
        if (!hora_llegada || !nombre_empresa_confirmante || !codigo_guia || !mineral_recibido) {
            // Eliminar archivo subido si hay error de validación
            await fs.unlink(req.file.path).catch(() => { });

            return res.status(400).json({
                error: 'Todos los campos son requeridos.'
            });
        }

        await client.query('BEGIN');

        // Guardar archivo temporal para validación OCR
        const tempPath = path.join(os.tmpdir(), `confirmacion_${crypto.randomUUID()}${path.extname(req.file.originalname)}`);
        await fs.writeFile(tempPath, req.file.buffer);

        // Remover # del código si viene con él
        const codigoGuiaLimpio = String(codigo_guia).replace(/^#/, '');

        // Verificar que la guía existe
        const guiaCheck = await client.query(
            'SELECT id, numero_guia, estado FROM guias_movilizacion WHERE numero_guia = $1',
            [codigoGuiaLimpio]
        );

        if (guiaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            await fs.unlink(tempPath).catch(() => { });
            return res.status(404).json({ error: 'No existe una guía con ese código.' });
        }

        const guia = guiaCheck.rows[0];

        // Validación rápida de la foto
        const quickCheck = await quickValidate(tempPath);
        if (!quickCheck.valido) {
            await client.query('ROLLBACK');
            await fs.unlink(tempPath).catch(() => { });
            return res.status(400).json({ error: `Foto inválida: ${quickCheck.mensaje}` });
        }

        // Validación avanzada con OCR
        const validacionResultado = await validateGuiaPhoto(tempPath, codigoGuiaLimpio);

        // Subir a Supabase Storage
        const fileName = `confirmaciones/${crypto.randomUUID()}${path.extname(req.file.originalname)}`;
        const publicUrl = await uploadFile(req.file.buffer, fileName, process.env.SUPABASE_BUCKET || 'minerales-assets');

        // Limpiar archivo temporal
        await fs.unlink(tempPath).catch(() => { });

        // Insertar confirmación
        const confirmacionId = crypto.randomUUID();
        const insertResult = await client.query(
            `INSERT INTO confirmaciones_llegada 
             (id, guia_id, empresa_destinataria_id, usuario_confirma_id, 
              hora_llegada, nombre_empresa_confirmante, codigo_guia, mineral_recibido,
              foto_guia_url, foto_filename, foto_size_bytes, foto_mime_type,
              foto_validada, validacion_resultado, validacion_confianza, 
              texto_extraido, coincidencia_numero_guia,
              ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
             RETURNING *`,
            [
                confirmacionId,
                guia.id,
                req.user.empresaDestinId,
                req.user.id,
                hora_llegada,
                sanitizeInput(nombre_empresa_confirmante),
                codigo_guia,
                sanitizeInput(mineral_recibido),
                publicUrl,
                fileName,
                req.file.size,
                req.file.mimetype,
                validacionResultado.valida,
                JSON.stringify(validacionResultado),
                validacionResultado.confianza,
                validacionResultado.ocr.textoExtraido,
                validacionResultado.ocr.coincideNumeroGuia,
                truncateIP(req.ip),
                req.get('user-agent')
            ]
        );

        // Registrar auditoría
        await client.query(
            `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.user.id,
                'crear_confirmacion',
                'confirmaciones_llegada',
                confirmacionId,
                JSON.stringify({ codigo_guia, confianza: validacionResultado.confianza }),
                truncateIP(req.ip)
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Gracias por confirmar la llegada del mineral',
            confirmacion: {
                id: confirmacionId,
                validacion: {
                    confianza: validacionResultado.confianza,
                    advertencias: validacionResultado.advertencias,
                    numeroGuiaCoincide: validacionResultado.ocr.coincideNumeroGuia
                }
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');

        // Eliminar archivo si hubo error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }

        console.error('Error al crear confirmación:', error);
        res.status(500).json({
            error: 'Error al procesar la confirmación.'
        });
    } finally {
        client.release();
    }
});

/**
 * GET /api/confirmaciones
 * Listar todas las confirmaciones (solo master)
 */
router.get('/', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { desde, hasta, validada, guia_id } = req.query;

        let query = `
            SELECT c.*, 
                   g.numero_guia, g.tipo_mineral as guia_mineral,
                   ed.nombre as empresa_dest_nombre, ed.rif as empresa_dest_rif,
                   u.username as confirmado_por
            FROM confirmaciones_llegada c
            JOIN guias_movilizacion g ON c.guia_id = g.id
            JOIN empresas_destinatarias ed ON c.empresa_destinataria_id = ed.id
            JOIN usuarios u ON c.usuario_confirma_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Filtros
        if (desde) {
            query += ` AND c.created_at >= $${paramCount}`;
            params.push(desde);
            paramCount++;
        }

        if (hasta) {
            query += ` AND c.created_at <= $${paramCount}`;
            params.push(hasta);
            paramCount++;
        }

        if (validada !== undefined) {
            query += ` AND c.foto_validada = $${paramCount}`;
            params.push(validada === 'true');
            paramCount++;
        }

        if (guia_id) {
            query += ` AND c.guia_id = $${paramCount}`;
            params.push(guia_id);
            paramCount++;
        }

        query += ' ORDER BY c.created_at DESC LIMIT 100';

        const result = await db.query(query, params);

        // Formatear números de guía con #
        const confirmacionesFormateadas = result.rows.map(conf => ({
            ...conf,
            numero_guia: formatNumeroGuia(conf.numero_guia)
        }));

        res.json({
            success: true,
            confirmaciones: confirmacionesFormateadas
        });

    } catch (error) {
        console.error('Error al listar confirmaciones:', error);
        res.status(500).json({
            error: 'Error al obtener confirmaciones.'
        });
    }
});

/**
 * GET /api/confirmaciones/:id
 * Obtener detalles de una confirmación específica (master)
 */
router.get('/:id', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT c.*, 
                    g.numero_guia, g.tipo_mineral, g.cantidad, g.unidad,
                    ed.nombre as empresa_dest_nombre, ed.rif as empresa_dest_rif,
                    u.username as confirmado_por
             FROM confirmaciones_llegada c
             JOIN guias_movilizacion g ON c.guia_id = g.id
             JOIN empresas_destinatarias ed ON c.empresa_destinataria_id = ed.id
             JOIN usuarios u ON c.usuario_confirma_id = u.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Confirmación no encontrada.'
            });
        }

        // Formatear número de guía con #
        const confirmacion = {
            ...result.rows[0],
            numero_guia: formatNumeroGuia(result.rows[0].numero_guia)
        };

        res.json({
            success: true,
            confirmacion: confirmacion
        });

    } catch (error) {
        console.error('Error al obtener confirmación:', error);
        res.status(500).json({
            error: 'Error al obtener confirmación.'
        });
    }
});

/**
 * GET /api/confirmaciones/:id/foto
 * Servir la foto de una confirmación
 */
router.get('/:id/foto', authenticateToken, requireRole(['master', 'empresa_destinataria']), async (req, res) => {
    try {
        const { id } = req.params;

        let query = 'SELECT foto_filename, empresa_destinataria_id FROM confirmaciones_llegada WHERE id = $1';
        const params = [id];

        // Si es empresa_destinataria, solo puede ver sus propias fotos
        if (req.user.role === 'empresa_destinataria') {
            query += ' AND empresa_destinataria_id = $2';
            params.push(req.user.empresaDestinId);
        }

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Foto no encontrada.'
            });
        }

        const fileName = result.rows[0].foto_filename;

        // Obtener URL firmada o descargar de Supabase
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'minerales-assets')
            .download(fileName);

        if (error || !data) {
            return res.status(404).json({ error: 'Foto no encontrada en el repositorio seguro.' });
        }

        const arrayBuffer = await data.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg'); // O dinámico basado en extensión
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error('Error al servir foto:', error);
        res.status(500).json({
            error: 'Error al obtener foto.'
        });
    }
});

module.exports = router;
