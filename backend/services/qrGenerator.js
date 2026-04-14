const QRCode = require('qrcode');

/**
 * Genera un código QR con la URL de verificación de la guía
 * @param {string} guiaId - UUID de la guía
 * @param {string} customUrl - URL personalizada (opcional, incluye firma)
 * @returns {Promise<string>} Data URL del QR code
 */
async function generateQRCode(guiaId, customUrl = null) {
    try {
        const verificationUrl = customUrl || `${process.env.BASE_URL}/verificar/${guiaId}`;

        const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 200,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generando QR code:', error);
        throw new Error('Error al generar código QR');
    }
}

/**
 * Genera un código QR como buffer para embeber en PDF
 * @param {string} guiaId - UUID de la guía
 * @param {string} customUrl - URL personalizada (opcional, incluye firma)
 * @returns {Promise<Buffer>} Buffer del QR code
 */
async function generateQRBuffer(guiaId, customUrl = null) {
    try {
        const verificationUrl = customUrl || `${process.env.BASE_URL}/verificar/${guiaId}`;

        const qrBuffer = await QRCode.toBuffer(verificationUrl, {
            errorCorrectionLevel: 'H',
            type: 'png',
            quality: 0.95,
            margin: 1,
            width: 200
        });

        return qrBuffer;
    } catch (error) {
        console.error('Error generando QR buffer:', error);
        throw new Error('Error al generar código QR');
    }
}

module.exports = {
    generateQRCode,
    generateQRBuffer
};
