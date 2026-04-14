const PDFDocument = require('pdfkit');
const { formatNumeroGuia } = require('../utils/security');

/**
 * Genera un PDF con el historial de verificaciones de un fiscalizador
 * @param {Array} verificaciones - Lista de verificaciones
 * @param {Object} fiscalizador - Datos del fiscalizador (nombre)
 * @returns {Promise<Buffer>} Buffer del PDF
 */
async function generateVerificacionesPDF(verificaciones, fiscalizador) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'LETTER',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Título
            doc.fontSize(16).font('Helvetica-Bold').text('REPORTE DE VERIFICACIONES DE GUÍAS', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(`Generado por: ${fiscalizador.username}`, { align: 'center' });
            doc.text(`Fecha de Reporte: ${new Date().toLocaleString('es-VE')}`, { align: 'center' });
            doc.moveDown(2);

            // Tabla Headers
            const tableTop = 150;
            const colWidths = [100, 80, 120, 80, 120];
            const colNames = ['Fecha', 'Guía #', 'Mineral', 'Vehículo', 'Empresa'];
            let x = 50;

            doc.fontSize(10).font('Helvetica-Bold');
            colNames.forEach((name, i) => {
                doc.text(name, x, tableTop);
                x += colWidths[i];
            });

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            
            // Tabla Filas
            let y = tableTop + 25;
            doc.fontSize(9).font('Helvetica');

            verificaciones.forEach(v => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }

                const fecha = new Date(v.fecha_verificacion).toLocaleDateString('es-VE');
                const vehiculo = v.vehiculo_placa || 'N/A';
                
                x = 50;
                doc.text(fecha, x, y);
                x += colWidths[0];
                doc.text(v.numero_guia, x, y);
                x += colWidths[1];
                doc.text(`${v.tipo_mineral} (${v.cantidad} ${v.unidad})`, x, y, { width: colWidths[2] - 5 });
                x += colWidths[2];
                doc.text(vehiculo, x, y);
                x += colWidths[3];
                doc.text(v.empresa_nombre, x, y, { width: colWidths[4] - 5 });

                y += 25;
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateVerificacionesPDF
};
