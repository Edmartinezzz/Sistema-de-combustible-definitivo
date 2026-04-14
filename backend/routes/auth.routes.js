const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { truncateIP } = require('../utils/security');

const router = express.Router();

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Usuario y contraseña son requeridos.'
            });
        }

        // Buscar usuario
        const result = await db.query(
            `SELECT u.id, u.username, u.password_hash, u.role, u.empresa_id, u.empresa_destinataria_id, u.activo,
                    e.razon_social as empresa_nombre, e.codigo_letra,
                    ed.nombre as empresa_dest_nombre
             FROM usuarios u
             LEFT JOIN empresas e ON u.empresa_id = e.id
             LEFT JOIN empresas_destinatarias ed ON u.empresa_destinataria_id = ed.id
             WHERE u.username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        const user = result.rows[0];

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(403).json({
                error: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
                empresaId: user.empresa_id,
                empresaDestinId: user.empresa_destinataria_id,
                codigoLetra: user.codigo_letra
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, ip_address)
             VALUES ($1, $2, $3)`,
            [user.id, 'login', truncateIP(req.ip)]
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                empresaId: user.empresa_id,
                empresaDestinId: user.empresa_destinataria_id,
                empresaNombre: user.empresa_nombre || user.empresa_dest_nombre,
                codigoLetra: user.codigo_letra
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión.'
        });
    }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión (solo registra en auditoría)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, ip_address)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'logout', truncateIP(req.ip)]
        );

        res.json({
            success: true,
            message: 'Sesión cerrada correctamente.'
        });

    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error al cerrar sesión.'
        });
    }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.role, u.empresa_id, u.empresa_destinataria_id,
                    e.razon_social as empresa_nombre, e.rif, e.codigo_letra,
                    ed.nombre as empresa_dest_nombre
             FROM usuarios u
             LEFT JOIN empresas e ON u.empresa_id = e.id
             LEFT JOIN empresas_destinatarias ed ON u.empresa_destinataria_id = ed.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado.'
            });
        }

        const user = result.rows[0];
        
        // Normalizar el nombre de empresa para todos los roles
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                empresa_id: user.empresa_id,
                empresaDestinId: user.empresa_destinataria_id,
                empresa_nombre: user.empresa_nombre || user.empresa_dest_nombre,
                rif: user.rif,
                codigo_letra: user.codigo_letra
            }
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            error: 'Error al obtener información del usuario.'
        });
    }
});

/**
 * POST /api/auth/register-user
 * Registrar nuevo usuario con rol específico (Solo Master)
 * Soporta: empresa, contribuyente, fiscalizador
 */
router.post('/register-user', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const {
            username,
            password,
            role,
            razon_social, // Para empresa/contribuyente
            rif,          // Para empresa/contribuyente
            codigo_letra  // Prefijo para guías
        } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Usuario, contraseña y rol son requeridos.' });
        }

        const validRoles = ['empresa', 'contribuyente', 'fiscalizador'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Rol no válido.' });
        }

        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Verificar si el usuario ya existe
            const checkUser = await client.query('SELECT id FROM usuarios WHERE username = $1', [username]);
            if (checkUser.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
            }

            let empresaId = null;

            // 2. Si es empresa o contribuyente, manejar la entidad empresa
            if (role === 'empresa' || role === 'contribuyente') {
                if (!rif || !razon_social) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'RIF y Razón Social son requeridos para este rol.' });
                }

                // Buscar o crear empresa
                const checkEmpresa = await client.query('SELECT id FROM empresas WHERE rif = $1', [rif]);
                if (checkEmpresa.rows.length > 0) {
                    empresaId = checkEmpresa.rows[0].id;
                    // Opcional: Actualizar el código si existe
                    if (codigo_letra) {
                        await client.query('UPDATE empresas SET codigo_letra = $1 WHERE id = $2', [codigo_letra, empresaId]);
                    }
                } else {
                    const newEmpresa = await client.query(
                        `INSERT INTO empresas (razon_social, rif, codigo_letra, direccion, telefono, email, representante_legal)
                         VALUES ($1, $2, $3, '', '', '', '')
                         RETURNING id`,
                        [razon_social, rif, codigo_letra || '']
                    );
                    empresaId = newEmpresa.rows[0].id;
                }
            }

            // 3. Crear el usuario
            const hashedPassword = await bcrypt.hash(password, 12);
            await client.query(
                `INSERT INTO usuarios (username, password_hash, role, empresa_id)
                 VALUES ($1, $2, $3, $4)`,
                [username, hashedPassword, role, empresaId]
            );

            await client.query('COMMIT');
            res.json({ success: true, message: `Usuario ${role} creado exitosamente.` });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno al crear el usuario.' });
    }
});

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario actual
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Ambas contraseñas son requeridas.' });
        }

        // Obtener hash actual
        const result = await db.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isValid) return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });

        // Actualizar
        const hashedNew = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE usuarios SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNew, req.user.id]);

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, ip_address)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'change_password', truncateIP(req.ip)]
        );

        res.json({ success: true, message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
});

/**
 * PATCH /api/auth/toggle-status/:userId
 * Activar o desactivar un usuario (Solo Master)
 */
router.patch('/toggle-status/:userId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') return res.status(403).json({ error: 'Acceso denegado.' });

        const { userId } = req.params;
        const { activo } = req.body;

        if (typeof activo !== 'boolean') return res.status(400).json({ error: 'El estado activo debe ser booleano.' });

        const result = await db.query(
            'UPDATE usuarios SET activo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING username',
            [activo, userId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, registro_id, ip_address)
             VALUES ($1, $2, $3, $4)`,
            [req.user.id, activo ? 'activate_user' : 'deactivate_user', userId, truncateIP(req.ip)]
        );

        res.json({ success: true, message: `Usuario ${result.rows[0].username} ${activo ? 'activado' : 'desactivado'} correctamente.` });

    } catch (error) {
        console.error('Error al cambiar estado de usuario:', error);
        res.status(500).json({ error: 'Error al cambiar estado del usuario.' });
    }
});

/**
 * GET /api/auth/users
 * Listar todos los usuarios (Solo Master)
 */
router.get('/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') return res.status(403).json({ error: 'Acceso denegado.' });

        const result = await db.query(
            `SELECT u.id, u.username, u.role, u.activo, u.created_at, u.empresa_id,
                    e.razon_social as empresa_nombre, e.rif, e.codigo_letra
             FROM usuarios u
             LEFT JOIN empresas e ON u.empresa_id = e.id
             WHERE u.role != 'master'
             ORDER BY u.created_at DESC`
        );

        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error al obtener lista de usuarios.' });
    }
});

/**
 * POST /api/auth/register-destination-company
 * Registrar nueva Empresa Destinataria y usuario asociado (Solo Master)
 */
router.post('/register-destination-company', authenticateToken, async (req, res) => {
    try {
        // Verificar que sea master
        if (req.user.role !== 'master') {
            return res.status(403).json({
                error: 'Acceso denegado.'
            });
        }

        const {
            nombre,
            rif,
            username,
            password
        } = req.body;

        if (!nombre || !rif || !username || !password) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos.'
            });
        }

        // Iniciar transacción
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Verificar existencia por RIF
            const checkRif = await client.query(
                'SELECT id FROM empresas_destinatarias WHERE rif = $1',
                [rif]
            );

            if (checkRif.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Ya existe una empresa destinataria con ese RIF.'
                });
            }

            // 2. Verificar existencia por Username
            const checkUser = await client.query(
                'SELECT id FROM usuarios WHERE username = $1',
                [username]
            );

            if (checkUser.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Ya existe un usuario con ese nombre de usuario.'
                });
            }

            // 3. Crear empresa destinataria
            const empresaDestRes = await client.query(
                `INSERT INTO empresas_destinatarias (nombre, rif, direccion, telefono, email, contacto_principal)
                 VALUES ($1, $2, '', '', '', '')
                 RETURNING id`,
                [nombre, rif]
            );
            const empresaDestId = empresaDestRes.rows[0].id;

            // 4. Crear usuario
            const hashedPassword = await bcrypt.hash(password, 12);
            await client.query(
                `INSERT INTO usuarios (username, password_hash, role, empresa_destinataria_id)
                 VALUES ($1, $2, 'empresa_destinataria', $3)`,
                [username, hashedPassword, empresaDestId]
            );

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Empresa destinataria y usuario creados exitosamente.'
            });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error al registrar empresa destinataria:', error);
        res.status(500).json({
            error: 'Error interno al crear la empresa destinataria.'
        });
    }
});

/**
 * DELETE /api/auth/users/:id
 * Eliminar un usuario permanentemente (Solo Master)
 */
router.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') return res.status(403).json({ error: 'Acceso denegado.' });

        const { id } = req.params;
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Eliminar usuario
            const deleteResult = await client.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
            
            if (deleteResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            await client.query('COMMIT');
            res.json({ success: true, message: 'Usuario eliminado del sistema.' });
            
        } catch (e) {
            await client.query('ROLLBACK');
            // Manejar violación de llave foránea (23503)
            if (e.code === '23503') {
                return res.status(400).json({ error: 'Denegado: Este usuario ya ha emitido guías, pagos o verificado documentos. Por seguridad e integridad de datos no puede borrarse. Por favor, utilice el botón "Desactivar" en su lugar.'});
            }
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor al intentar borrar.' });
    }
});

/**
 * PUT /api/auth/users/:id/vincular
 * Actualiza la empresa (empresa_id) a la que pertenece un usuario (Solo Master)
 */
router.put('/users/:id/vincular', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') return res.status(403).json({ error: 'Acceso denegado.' });

        const { id } = req.params;
        const { empresa_id } = req.body;

        if (!empresa_id) {
            return res.status(400).json({ error: 'El ID de la empresa vinculada es requerido.' });
        }

        const result = await db.query(
            'UPDATE usuarios SET empresa_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
            [empresa_id, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, registro_id, ip_address, datos_nuevos)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, 'vincular_aliado', id, truncateIP(req.ip), JSON.stringify({ nueva_empresa_id: empresa_id })]
        );

        res.json({ success: true, message: 'Usuario vinculado exitosamente a la empresa seleccionada.' });

    } catch (error) {
        console.error('Error al vincular usuario:', error);
        res.status(500).json({ error: 'Error al cambiar la vinculación del usuario.' });
    }
});

/**
 * PUT /api/auth/empresas/:id
 * Actualizar datos de una empresa (Solo Master)
 */
router.put('/empresas/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') return res.status(403).json({ error: 'Acceso denegado.' });

        const { id } = req.params;
        const { razon_social, codigo_letra, nueva_contrasena } = req.body;

        if (!razon_social) return res.status(400).json({ error: 'La Razón Social es requerida.' });

        const result = await db.query(
            'UPDATE empresas SET razon_social = $1, codigo_letra = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id',
            [razon_social, codigo_letra ? codigo_letra.toUpperCase().trim() : '', id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada.' });

        // Si se proporcionó nueva contraseña, actualizar el usuario vinculado a esta empresa
        if (nueva_contrasena && nueva_contrasena.trim().length >= 6) {
            const hashedPassword = await bcrypt.hash(nueva_contrasena.trim(), 12);
            await db.query(
                `UPDATE usuarios SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE empresa_id = $2 AND role IN ('empresa', 'contribuyente')`,
                [hashedPassword, id]
            );
        }

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, registro_id, ip_address, datos_nuevos)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, 'update_empresa', id, truncateIP(req.ip), JSON.stringify({ razon_social, codigo_letra, password_changed: !!nueva_contrasena })]
        );

        res.json({ success: true, message: 'Empresa actualizada correctamente.' });

    } catch (error) {
        console.error('Error al actualizar empresa:', error);
        res.status(500).json({ error: 'Error al actualizar los datos de la empresa.' });
    }
});

/**
 * PUT /api/auth/users/:id/password
 * Permite al administrador master cambiar la contraseña de CUALQUIER usuario.
 */
router.put('/users/:id/password', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const { id } = req.params;
        const { nueva_contrasena } = req.body;

        if (!nueva_contrasena || nueva_contrasena.trim().length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        // Verificar si existe el usuario
        const resultUser = await db.query('SELECT username, role FROM usuarios WHERE id = $1', [id]);
        if (resultUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const hashedPassword = await bcrypt.hash(nueva_contrasena.trim(), 12);
        
        await db.query(
            `UPDATE usuarios SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [hashedPassword, id]
        );

        await db.query(
            `INSERT INTO auditoria (usuario_id, accion, registro_id, ip_address, datos_nuevos)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, 'reset_password_admin', id, truncateIP(req.ip), JSON.stringify({ target_user: resultUser.rows[0].username, target_role: resultUser.rows[0].role })]
        );

        res.json({ success: true, message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error('Error al cambiar contraseña del usuario:', error);
        res.status(500).json({ error: 'Error al cambiar la contraseña del usuario.' });
    }
});

module.exports = router;
