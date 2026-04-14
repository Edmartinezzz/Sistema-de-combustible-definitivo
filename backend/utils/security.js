const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Genera un UUID v4 único para identificadores de guías
 */
function generateUUID() {
    return uuidv4();
}

/**
 * Genera un hash SHA-256 de un contenido (para verificación de PDFs)
 * @param {Buffer|string} content - Contenido a hashear
 * @returns {string} Hash en formato hexadecimal
 */
function generateHash(content) {
    return crypto
        .createHash('sha256')
        .update(content)
        .digest('hex');
}

/**
 * Verifica si un hash coincide con el contenido
 * @param {Buffer|string} content - Contenido a verificar
 * @param {string} hash - Hash esperado
 * @returns {boolean} True si coincide
 */
function verifyHash(content, hash) {
    const computedHash = generateHash(content);
    return computedHash === hash;
}

/**
 * Sanitiza input para prevenir inyección SQL y XSS
 * @param {string} input - Input del usuario
 * @returns {string} Input sanitizado
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .substring(0, 1000); // Limitar longitud
}

/**
 * Valida formato de RIF venezolano
 * @param {string} rif - RIF a validar
 * @returns {boolean} True si es válido
 */
function validateRIF(rif) {
    const rifPattern = /^[JGVEP]-\d{8,9}-\d$/;
    return rifPattern.test(rif);
}

/**
 * Valida formato de cédula venezolana
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} True si es válida
 */
function validateCedula(cedula) {
    const cedulaPattern = /^[VE]-?\d{6,8}$/;
    return cedulaPattern.test(cedula.replace(/\s/g, ''));
}

/**
 * Valida formato de placa venezolana
 * @param {string} placa - Placa a validar
 * @returns {boolean} True si es válida
 */
function validatePlaca(placa) {
    const placaPattern = /^[A-Z]{3}\d{3}[A-Z]?$/;
    return placaPattern.test(placa.replace(/\s|-/g, '').toUpperCase());
}

/**
 * Formatea el número de guía con el prefijo de la empresa y el símbolo # al inicio
 * @param {number|string} numeroGuia - Número de guía
 * @param {string} prefix - Letra de código de la empresa (Prefijo)
 * @returns {string} Número formateado (ej: "#N01")
 */
function formatNumeroGuia(numeroGuia, prefix = '') {
    if (!numeroGuia) return '';
    
    // Si ya es un string formateado (ej: "#N01"), retornarlo
    if (typeof numeroGuia === 'string' && numeroGuia.startsWith('#')) {
        return numeroGuia;
    }

    const num = String(numeroGuia).padStart(2, '0');
    const pref = prefix ? String(prefix).toUpperCase().trim() : '';
    
    return `#${pref}${num}`;
}

/**
 * Trunca la dirección IP para ajustarse a los límites de la base de datos si es necesario
 * @param {string} ip - Dirección IP
 * @returns {string} IP truncada (máx 45 caracteres para compatibilidad)
 */
function truncateIP(ip) {
    if (!ip) return '0.0.0.0';
    const ipStr = String(ip);
    return ipStr.length > 45 ? ipStr.substring(0, 45) : ipStr;
}

/**
 * Genera un código de verificación único para un ID de guía (Firma Digital)
 * @param {string} guiaId - ID de la guía
 * @returns {string} Firma corta de 10 caracteres
 */
function generateVerificationCode(guiaId) {
    const secret = process.env.JWT_SECRET || 'secret_laguaira_minerales_2026';
    return crypto
        .createHmac('sha256', secret)
        .update(guiaId)
        .digest('hex')
        .substring(0, 10);
}

module.exports = {
    generateUUID,
    generateHash,
    verifyHash,
    sanitizeInput,
    validateRIF,
    validateCedula,
    validatePlaca,
    formatNumeroGuia,
    truncateIP,
    generateVerificationCode
};
