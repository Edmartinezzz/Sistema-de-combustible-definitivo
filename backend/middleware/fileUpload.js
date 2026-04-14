const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateUUID } = require('../utils/security');

// Configuración de almacenamiento en memoria para Supabase
const storage = multer.memoryStorage();

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG) o PDF'));
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
    },
    fileFilter: fileFilter
});

module.exports = upload;
