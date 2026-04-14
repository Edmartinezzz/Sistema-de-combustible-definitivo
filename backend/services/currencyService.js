const db = require('../config/database');

/**
 * Servicio para gestionar la tasa de cambio del BCV
 */
const currencyService = {
    // Tasa por defecto si falla la descarga
    FALLBACK_RATE: 36.50,

    /**
     * Obtiene la tasa actual desde la base de datos
     */
    async getCurrentRate() {
        try {
            const result = await db.query("SELECT valor FROM config_sistema WHERE clave = 'tasa_bcv'");
            if (result.rows.length > 0) {
                return parseFloat(result.rows[0].valor);
            }
            return this.FALLBACK_RATE;
        } catch (error) {
            console.error('Error obteniendo tasa de DB:', error);
            return this.FALLBACK_RATE;
        }
    },

    /**
     * Actualiza la tasa en la base de datos
     */
    async updateRate(newRate) {
        try {
            await db.query(
                "INSERT INTO config_sistema (clave, valor, ultima_actualizacion) VALUES ('tasa_bcv', $1, CURRENT_TIMESTAMP) ON CONFLICT (clave) DO UPDATE SET valor = $1, ultima_actualizacion = CURRENT_TIMESTAMP",
                [newRate.toString()]
            );
            return true;
        } catch (error) {
            console.error('Error actualizando tasa en DB:', error);
            return false;
        }
    },

};

module.exports = currencyService;
