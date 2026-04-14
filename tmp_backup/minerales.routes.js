const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeInput } = require('../utils/security');

const router = express.Router();

/**
 * GET /api/minerales
 * Obtener lista de tipos de minerales activos
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM tipos_minerales WHERE activo = true ORDER BY nombre ASC';
        const result = await db.query(query);
        
        res.json({
            success: true,
            minerales: result.rows
        });
    } catch (error) {
        console.error('Error al obtener minerales:', error);
        res.status(500).json({ error: 'Error al obtener la lista de minerales.' });
    }
});

/**
 * GET /api/minerales/admin
 * Obtener todos los minerales incluyendo inactivos (Solo Administrador)
 */
router.get('/admin', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const query = 'SELECT * FROM tipos_minerales ORDER BY created_at DESC';
        const result = await db.query(query);
        
        res.json({
            success: true,
            minerales: result.rows
        });
    } catch (error) {
        console.error('Error al obtener minerales (admin):', error);
        res.status(500).json({ error: 'Error al obtener minerales.' });
    }
});

/**
 * POST /api/minerales
 * Agregar un nuevo tipo de mineral (Solo Administrador)
 */
router.post('/', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del mineral es requerido.' });
        }

        const query = 'INSERT INTO tipos_minerales (nombre) VALUES ($1) RETURNING *';
        const result = await db.query(query, [sanitizeInput(nombre)]);
        
        res.status(201).json({
            success: true,
            message: 'Mineral agregado exitosamente.',
            mineral: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Este mineral ya existe.' });
        }
        console.error('Error al agregar mineral:', error);
        res.status(500).json({ error: 'Error al agregar mineral.' });
    }
});

/**
 * PUT /api/minerales/:id
 * Actualizar un mineral o su estado (Solo Administrador)
 */
router.put('/:id', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, activo } = req.body;
        
        const query = `
            UPDATE tipos_minerales 
            SET nombre = COALESCE($1, nombre),
                activo = COALESCE($2, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await db.query(query, [
            nombre ? sanitizeInput(nombre) : null,
            activo !== undefined ? activo : null,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mineral no encontrado.' });
        }
        
        res.json({
            success: true,
            message: 'Mineral actualizado exitosamente.',
            mineral: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar mineral:', error);
        res.status(500).json({ error: 'Error al actualizar mineral.' });
    }
});

/**
 * DELETE /api/minerales/:id
 * Eliminar un mineral (Solo Administrador)
 */
router.delete('/:id', authenticateToken, requireRole(['master']), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si está en uso en guías
        const checkQuery = 'SELECT id FROM guias_movilizacion WHERE tipo_mineral = (SELECT nombre FROM tipos_minerales WHERE id = $1) LIMIT 1';
        const checkResult = await db.query(checkQuery, [id]);
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar este mineral porque ya ha sido utilizado en guías. Considere desactivarlo en su lugar.' 
            });
        }
        
        const deleteQuery = 'DELETE FROM tipos_minerales WHERE id = $1 RETURNING *';
        const result = await db.query(deleteQuery, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mineral no encontrado.' });
        }
        
        res.json({
            success: true,
            message: 'Mineral eliminado exitosamente.'
        });
    } catch (error) {
        console.error('Error al eliminar mineral:', error);
        res.status(500).json({ error: 'Error al eliminar mineral.' });
    }
});

module.exports = router;
