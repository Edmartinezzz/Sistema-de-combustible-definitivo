const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Advertencia: SUPABASE_URL o SUPABASE_KEY no están configurados.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sube un archivo a Supabase Storage
 * @param {Buffer} fileBuffer - El buffer del archivo
 * @param {string} fileName - Nombre del archivo en el bucket
 * @param {string} bucketName - Nombre del bucket (por defecto 'minerales-assets')
 * @returns {Promise<string>} - URL pública del archivo
 */
async function uploadFile(fileBuffer, fileName, bucketName = process.env.SUPABASE_BUCKET || 'minerales-assets') {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileBuffer, {
                contentType: 'auto',
                upsert: true
            });

        if (error) {
            throw error;
        }

        // Obtener la URL pública
        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (error) {
        console.error('Error al subir archivo a Supabase:', error);
        throw error;
    }
}

module.exports = {
    supabase,
    uploadFile
};
