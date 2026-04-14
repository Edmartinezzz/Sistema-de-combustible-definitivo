const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de Validación de Fotos de Guías con OCR
 * Valida que la foto sea auténtica y extrae texto para verificar datos
 */

/**
 * Validar foto de guía con OCR avanzado
 * @param {string} filePath - Ruta completa del archivo de imagen
 * @param {string} expectedGuiaCode - Código de guía esperado para comparación
 * @returns {Promise<Object>} Resultado de validación completo
 */
async function validateGuiaPhoto(filePath, expectedGuiaCode) {
    const resultado = {
        valida: false,
        confianza: 0,
        advertencias: [],
        errores: [],
        metadata: {},
        ocr: {
            textoExtraido: '',
            confianzaOCR: 0,
            numeroGuiaEncontrado: null,
            coincideNumeroGuia: false
        }
    };

    try {
        // 1. Validación básica de archivo
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;

        resultado.metadata.tamañoBytes = fileSize;
        resultado.metadata.fechaCarga = new Date().toISOString();

        // Validar tamaño mínimo (1KB) y máximo (20MB)
        if (fileSize < 1 * 1024) {
            resultado.advertencias.push('Archivo muy pequeño.');
        }

        if (fileSize > 20 * 1024 * 1024) {
            resultado.errores.push('Archivo muy grande (más de 20MB).');
            return resultado;
        }

        // 2. Procesar imagen con Sharp para obtener metadata y validar
        let imageInfo;
        try {
            imageInfo = await sharp(filePath).metadata();

            resultado.metadata.formato = imageInfo.format;
            resultado.metadata.ancho = imageInfo.width;
            resultado.metadata.alto = imageInfo.height;
            resultado.metadata.espacioColor = imageInfo.space;
            resultado.metadata.densidad = imageInfo.density;

            // ELIMINADO: Validación de dimensiones mínimas (Solicitado por el usuario)

            // Validar formato extendido
            const formatosPermitidos = ['jpeg', 'jpg', 'png', 'webp', 'heic', 'tiff'];
            if (!formatosPermitidos.includes(imageInfo.format.toLowerCase())) {
                resultado.errores.push(`Formato no permitido: ${imageInfo.format}`);
                return resultado;
            }

        } catch (error) {
            resultado.errores.push(`Error al procesar imagen: ${error.message}`);
            return resultado;
        }

        // 3. Calcular hash SHA256 de la imagen
        const fileBuffer = await fs.readFile(filePath);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        resultado.metadata.hashSHA256 = hash;

        // 4. Pre-procesar imagen para mejorar OCR
        const preprocessedPath = path.join(path.dirname(filePath), `preprocessed_${path.basename(filePath)}`);

        try {
            await sharp(filePath)
                .greyscale() // Convertir a escala de grises
                .normalize() // Normalizar contraste
                .sharpen() // Aumentar nitidez
                .toFile(preprocessedPath);

        } catch (error) {
            resultado.advertencias.push('No se pudo pre-procesar imagen para OCR');
        }

        // 5. Ejecutar OCR con Tesseract
        console.log('[PhotoValidator] Iniciando OCR...');

        const ocrResult = await Tesseract.recognize(
            preprocessedPath || filePath,
            'spa', // Idioma español
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`[PhotoValidator] OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
                    }
                }
            }
        );

        // Limpiar archivo pre-procesado
        try {
            if (preprocessedPath) {
                await fs.unlink(preprocessedPath);
            }
        } catch (err) {
            // Ignorar error de limpieza
        }

        // 6. Analizar resultado de OCR
        const textoCompleto = ocrResult.data.text;
        const confianzaOCR = ocrResult.data.confidence;

        resultado.ocr.textoExtraido = textoCompleto;
        resultado.ocr.confianzaOCR = Math.round(confianzaOCR * 100) / 100;

        console.log('[PhotoValidator] Texto extraído:', textoCompleto.substring(0, 200));

        // 7. Buscar número de guía en el texto extraído
        // Patrones comunes: "No. 12345", "Guía: 12345", "Nº 12345", etc.
        const patronesGuia = [
            /(?:guía|guia|no\.?|nº|número|numero|#)\s*:?\s*(\d+)/gi,
            /\b(\d{4,10})\b/g // Números de 4-10 dígitos
        ];

        let numerosEncontrados = [];

        for (const patron of patronesGuia) {
            const matches = textoCompleto.matchAll(patron);
            for (const match of matches) {
                const numero = match[1] || match[0];
                if (numero && /^\d+$/.test(numero.trim())) {
                    numerosEncontrados.push(numero.trim());
                }
            }
        }

        // Eliminar duplicados
        numerosEncontrados = [...new Set(numerosEncontrados)];

        console.log('[PhotoValidator] Números encontrados:', numerosEncontrados);
        console.log('[PhotoValidator] Número esperado:', expectedGuiaCode);

        // 8. Comparar con el código esperado
        const expectedCode = String(expectedGuiaCode).trim();

        for (const numeroEncontrado of numerosEncontrados) {
            if (numeroEncontrado === expectedCode ||
                numeroEncontrado.includes(expectedCode) ||
                expectedCode.includes(numeroEncontrado)) {

                resultado.ocr.numeroGuiaEncontrado = numeroEncontrado;
                resultado.ocr.coincideNumeroGuia = true;
                break;
            }
        }

        // 9. Calcular nivel de confianza general
        let puntajeConfianza = 0;

        // Tamaño apropiado: +20 puntos
        if (fileSize >= 100 * 1024 && fileSize <= 5 * 1024 * 1024) {
            puntajeConfianza += 20;
        }

        // Resolución adecuada: +20 puntos
        if (imageInfo.width >= 1200 && imageInfo.height >= 900) {
            puntajeConfianza += 20;
        } else if (imageInfo.width >= 800 && imageInfo.height >= 600) {
            puntajeConfianza += 10;
        }

        // OCR exitoso: +30 puntos
        if (confianzaOCR >= 80) {
            puntajeConfianza += 30;
        } else if (confianzaOCR >= 60) {
            puntajeConfianza += 20;
        } else if (confianzaOCR >= 40) {
            puntajeConfianza += 10;
        }

        // Número de guía coincide: +30 puntos
        if (resultado.ocr.coincideNumeroGuia) {
            puntajeConfianza += 30;
        } else {
            resultado.advertencias.push('No se pudo verificar el número de guía en la foto');
        }

        resultado.confianza = puntajeConfianza;

        // 10. Determinar si la foto es válida
        // MODIFICADO: Cualquier foto que logre ser cargada es válida (Solicitado por el usuario)
        resultado.valida = true;
        if (puntajeConfianza < 50) {
            resultado.advertencias.push('Foto aceptada (Validación básica).');
        }

        console.log(`[PhotoValidator] Validación completada. Confianza: ${puntajeConfianza}%`);

    } catch (error) {
        console.error('[PhotoValidator] Error en validación:', error);
        resultado.errores.push(`Error crítico en validación: ${error.message}`);
        resultado.valida = false;
    }

    return resultado;
}

/**
 * Validación básica rápida (sin OCR)
 * Útil para verificación inicial antes de procesar con OCR
 */
async function quickValidate(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;

        if (fileSize < 50 * 1024 || fileSize > 10 * 1024 * 1024) {
            return { valido: false, mensaje: 'Tamaño de archivo inválido' };
        }

        const imageInfo = await sharp(filePath).metadata();

        if (!['jpeg', 'jpg', 'png', 'webp'].includes(imageInfo.format.toLowerCase())) {
            return { valido: false, mensaje: 'Formato no permitido' };
        }

        return { valido: true };

    } catch (error) {
        return { valido: false, mensaje: error.message };
    }
}

module.exports = {
    validateGuiaPhoto,
    quickValidate
};
