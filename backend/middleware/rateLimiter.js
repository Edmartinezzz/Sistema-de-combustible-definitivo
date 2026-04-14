const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para intentos de login
 * Máximo 5 intentos cada 15 minutos
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Aumentado de 5 a 50
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter general para API
 * Máximo 100 requests cada 15 minutos
 */
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Reducido a 5 minutos
    max: 1000, // Aumentado de 100 a 1000
    message: {
        error: 'Demasiadas solicitudes. Por favor, intente nuevamente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter para subida de archivos
 * Máximo 10 archivos cada hora
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Reducido a 15 minutos
    max: 100, // Aumentado de 10 a 100
    message: {
        error: 'Demasiadas subidas de archivos. Por favor, intente nuevamente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
    uploadLimiter
};
