const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware para verificar token JWT
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Permitir token tanto en header como en query string (útil para descargas directas en móvil)
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado. Token no proporcionado.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar que el usuario sigue activo
        const result = await db.query(
            'SELECT id, username, role, empresa_id, empresa_destinataria_id, activo FROM usuarios WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Usuario no encontrado.'
            });
        }

        const user = result.rows[0];

        if (!user.activo) {
            return res.status(403).json({
                error: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        // Agregar información del usuario al request
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            empresaId: user.empresa_id,
            empresaDestinId: user.empresa_destinataria_id
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado. Por favor, inicie sesión nuevamente.'
            });
        }

        return res.status(403).json({
            error: 'Token inválido.'
        });
    }
}

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} allowedRoles - Roles permitidos ['master', 'empresa']
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'No tiene permisos para realizar esta acción.'
            });
        }

        next();
    };
}

/**
 * Middleware para verificar que una empresa solo acceda a sus propios datos
 */
function checkEmpresaAccess(req, res, next) {
    // Si es master, tiene acceso a todo
    if (req.user.role === 'master') {
        return next();
    }

    // Si es empresa, verificar que acceda solo a sus datos
    const empresaIdParam = req.params.empresaId || req.body.empresaId || req.query.empresaId;

    if (empresaIdParam && empresaIdParam !== req.user.empresaId) {
        return res.status(403).json({
            error: 'No tiene permisos para acceder a esta información.'
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    requireRole,
    checkEmpresaAccess
};
