import puppeteer from 'puppeteer';
import ResumenDiesel from '../Models/ResumenDiesel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const ReportesRoutes = {};

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para convertir imagen a base64
const convertirImagenABase64 = (rutaImagen) => {
    try {
        console.log('Intentando leer imagen desde:', rutaImagen);
        
        if (!fs.existsSync(rutaImagen)) {
            console.error('La imagen no existe en la ruta:', rutaImagen);
            return null;
        }
        
        const imagen = fs.readFileSync(rutaImagen);
        const base64 = imagen.toString('base64');
        const ext = path.extname(rutaImagen).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        
        console.log('Imagen convertida exitosamente a base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('Error al convertir imagen:', error);
        return null;
    }
};

// Ruta al logo
const RUTA_LOGO = path.join(process.cwd(), 'src', 'imagenes', 'imagen_15.png');

// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
};

// 1. PDF INDIVIDUAL - Resumen de diesel de un registro específico
ReportesRoutes.generarPDFIndividual = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        const resumen = await ResumenDiesel.findById(id)
            .populate({
                path: "CicurlationCard",
                select: "name licensePlate"
            });

        if (!resumen) {
            return res.status(404).json({
                success: false,
                message: 'Resumen no encontrado'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    padding: 0;
                    color: #34353A;
                    background: #FFFFFF;
                }
                .page-wrapper {
                    padding: 50px;
                }
                
                /* HEADER */
                .header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 40px;
                    margin: -50px -50px 40px -50px;
                    text-align: center;
                    border-bottom: 5px solid #5D9646;
                }
                .header .logo-container {
                    margin-bottom: 25px;
                }
                .header .logo-container img {
    width: 220px !important;
    height: auto !important;
    max-width: 220px !important;
    display: block !important;
    margin: 0 auto !important;
}
                .header h1 {
                    color: #FFFFFF;
                    font-size: 30px;
                    font-weight: 300;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 10px;
                }
                .header .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    letter-spacing: 1px;
                }
                
                /* INFO SECTION */
                .info-section {
                    margin-bottom: 40px;
                    background: #FFFFFF;
                    border: 2px solid #e5e7eb;
                    border-left: 5px solid #5F8EAD;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0;
                }
                .info-item {
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                }
                .info-item:nth-child(2n) {
                    border-right: none;
                }
                .info-item:nth-last-child(-n+2) {
                    border-bottom: none;
                }
                .info-item label {
                    display: block;
                    font-size: 11px;
                    color: #5F8EAD;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .info-item .value {
                    font-size: 16px;
                    font-weight: 500;
                    color: #34353A;
                }
                
                /* DETAIL BOX */
                .detail-box {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #FFFFFF;
                    border: 2px solid #e5e7eb;
                    overflow: hidden;
                }
                .detail-header {
                    background: #34353A;
                    color: #FFFFFF;
                    padding: 15px 25px;
                    border-bottom: 3px solid #5D9646;
                }
                .detail-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .detail-content {
                    padding: 30px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px 0;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 15px;
                }
                .detail-row:last-child {
                    border-bottom: none;
                    margin-top: 20px;
                    padding: 25px;
                    background: #34353A;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 20px;
                    margin: 20px -30px -30px -30px;
                }
                .detail-row label {
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .detail-row .value {
                    font-weight: 600;
                    color: #34353A;
                }
                .detail-row:last-child label,
                .detail-row:last-child .value {
                    color: #FFFFFF;
                }
                .detail-row:last-child .value {
                    color: #5D9646;
                    font-size: 24px;
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 3px solid #34353A;
                    text-align: center;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 11px;
                    margin: 5px 0;
                    line-height: 1.6;
                }
                .footer .company {
                    color: #34353A;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="header">
                    <div class="logo-container">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white; font-size: 24px;">RIVERA</p>'}
                    </div>
                    <h1>Comprobante de Diesel</h1>
                    <p class="subtitle">Registro de Consumo de Combustible</p>
                </div>

                <div class="info-section">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Vehículo</label>
                            <div class="value">${resumen.CicurlationCard.name}</div>
                        </div>
                        <div class="info-item">
                            <label>Placa</label>
                            <div class="value">${resumen.CicurlationCard.licensePlate}</div>
                        </div>
                        <div class="info-item">
                            <label>Fecha</label>
                            <div class="value">${new Date(resumen.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</div>
                        </div>
                        <div class="info-item">
                            <label>Período</label>
                            <div class="value">${obtenerNombreMes(resumen.mes)} ${resumen.ano}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-box">
                    <div class="detail-header">
                        <h3>Detalles del Consumo</h3>
                    </div>
                    <div class="detail-content">
                        <div class="detail-row">
                            <label>Galones</label>
                            <span class="value">${resumen.Galones.toFixed(2)} gal</span>
                        </div>
                        <div class="detail-row">
                            <label>Costo por Galón</label>
                            <span class="value">$ ${(resumen.Total / resumen.Galones).toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <label>TOTAL A PAGAR</label>
                            <span class="value">$ ${resumen.Total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                    <p>Sistema de Gestión de Combustible</p>
                </div>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diesel-${resumen.CicurlationCard.licensePlate}-${Date.now()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF individual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// 2. PDF MENSUAL SIMPLE - Resumen por placa del mes
ReportesRoutes.generarPDFMensualSimple = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido. Debe estar entre 1 y 12'
            });
        }

        const registros = await ResumenDiesel.find({
            mes: mesNum,
            ano: anoNum
        })
            .populate('CicurlationCard', 'licensePlate')
            .sort({ fecha: 1 });

        if (!registros || registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay registros para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Agrupar por placa y sumar totales
        const porPlaca = {};
        registros.forEach(r => {
            const placa = r.CicurlationCard.licensePlate;
            
            if (!porPlaca[placa]) {
                porPlaca[placa] = {
                    galones: 0,
                    monto: 0
                };
            }
            porPlaca[placa].galones += r.Galones;
            porPlaca[placa].monto += r.Total;
        });

        const datosTabla = Object.entries(porPlaca)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([placa, datos]) => ({
                placa,
                galones: datos.galones,
                monto: datos.monto
            }));

        const totalGalones = datosTabla.reduce((sum, item) => sum + item.galones, 0);
        const totalMonto = datosTabla.reduce((sum, item) => sum + item.monto, 0);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    padding: 0;
                    color: #34353A;
                    background: #FFFFFF;
                }
                .page-wrapper {
                    padding: 50px;
                }
                
                /* HEADER */
                .header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 40px;
                    margin: -50px -50px 50px -50px;
                    text-align: center;
                    border-bottom: 5px solid #5D9646;
                }
                .header .logo-container {
                    margin-bottom: 25px;
                }
               .header .logo-container img {
    width: 220px !important;
    height: auto !important;
    max-width: 220px !important;
    display: block !important;
    margin: 0 auto !important;
}
                .header h1 {
                    color: #FFFFFF;
                    font-size: 28px;
                    font-weight: 300;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 5px;
                }
                .header .period {
                    color: #5D9646;
                    font-size: 20px;
                    font-weight: 600;
                    margin-top: 15px;
                    letter-spacing: 2px;
                }
                
                /* TABLA */
                .table-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                thead {
                    background: #34353A;
                    color: #FFFFFF;
                }
                th {
                    padding: 18px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    border-bottom: 4px solid #5D9646;
                }
                td {
                    padding: 16px 18px;
                    text-align: center;
                    font-size: 15px;
                    border-bottom: 1px solid #e5e7eb;
                }
                tbody tr:hover {
                    background: #f9fafb;
                }
                .col-numero {
                    width: 10%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 35%;
                    font-weight: 600;
                    color: #34353A;
                    letter-spacing: 1px;
                }
                .col-galones {
                    width: 25%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-total {
                    width: 30%;
                    text-align: right;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .total-row {
                    background: #34353A;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 17px;
                }
                .total-row td {
                    padding: 20px 18px;
                    border-bottom: none;
                }
                .total-row .col-galones {
                    color: #FFFFFF;
                }
                .total-row .col-total {
                    color: #5D9646;
                    font-size: 20px;
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 3px solid #34353A;
                    text-align: center;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 11px;
                    margin: 5px 0;
                    line-height: 1.6;
                }
                .footer .company {
                    color: #34353A;
                    font-weight: 600;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="header">
                    <div class="logo-container">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white; font-size: 24px;">RIVERA</p>'}
                    </div>
                    <h1>Resumen de Diesel</h1>
                    <div class="period">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-numero">#</th>
                                <th class="col-placa">PLACA</th>
                                <th class="col-galones">GALONES</th>
                                <th class="col-total">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${datosTabla.map((item, index) => `
                                <tr>
                                    <td class="col-numero">${index + 1}</td>
                                    <td class="col-placa">${item.placa}</td>
                                    <td class="col-galones">${item.galones.toFixed(2)}</td>
                                    <td class="col-total">$ ${item.monto.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td class="col-galones">${totalGalones.toFixed(2)}</td>
                                <td class="col-total">$ ${totalMonto.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                    <p>Sistema de Gestión de Combustible</p>
                </div>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="resumen-diesel-${obtenerNombreMes(mesNum)}-${anoNum}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// 3. PDF DETALLADO DEL MES - Con todos los registros individuales (COMPACTO)
ReportesRoutes.generarPDFMensualDetallado = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido'
            });
        }

        const registros = await ResumenDiesel.find({
            mes: mesNum,
            ano: anoNum
        })
            .populate('CicurlationCard', 'name licensePlate')
            .sort({ fecha: 1 });

        if (!registros || registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay registros para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const totalGalones = registros.reduce((sum, r) => sum + r.Galones, 0);
        const totalMonto = registros.reduce((sum, r) => sum + r.Total, 0);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    padding: 0;
                    color: #34353A;
                    background: #FFFFFF;
                }
                .page-wrapper {
                    padding: 35px;
                }
                
                /* HEADER COMPACTO */
                .header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 30px;
                    margin: -35px -35px 35px -35px;
                    text-align: center;
                    border-bottom: 5px solid #5D9646;
                }
                .header .logo-container {
                    margin-bottom: 20px;
                }
               .header .logo-container img {
    width: 220px !important;
    height: auto !important;
    max-width: 220px !important;
    display: block !important;
    margin: 0 auto !important;
}
                .header h1 {
                    color: #FFFFFF;
                    font-size: 24px;
                    font-weight: 300;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .header .period {
                    color: #5D9646;
                    font-size: 16px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                
                /* TABLA COMPACTA */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    font-size: 11px;
                }
                thead {
                    background: #34353A;
                    color: #FFFFFF;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 3px solid #5D9646;
                }
                td {
                    padding: 10px 8px;
                    text-align: center;
                    border-bottom: 1px solid #e5e7eb;
                }
                tbody tr:hover {
                    background: #f9fafb;
                }
                tbody tr:last-child td {
                    border-bottom: none;
                }
                .col-numero {
                    width: 6%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-fecha {
                    width: 18%;
                    font-weight: 500;
                }
                .col-placa {
                    width: 20%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-galones {
                    width: 18%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-total {
                    width: 20%;
                    text-align: right;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .total-row {
                    background: #34353A;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 12px;
                }
                .total-row td {
                    padding: 15px 8px;
                }
                .total-row .col-galones {
                    color: #FFFFFF;
                }
                .total-row .col-total {
                    color: #5D9646;
                    font-size: 14px;
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #34353A;
                    text-align: center;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 9px;
                    margin: 3px 0;
                }
                .footer .company {
                    color: #34353A;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="header">
                    <div class="logo-container">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white; font-size: 20px;">RIVERA</p>'}
                    </div>
                    <h1>Resumen Detallado de Diesel</h1>
                    <div class="period">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="col-numero">#</th>
                            <th class="col-fecha">FECHA</th>
                            <th class="col-placa">PLACA</th>
                            <th class="col-galones">GALONES</th>
                            <th class="col-total">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registros.map((r, index) => `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-fecha">${new Date(r.fecha).toLocaleDateString('es-ES')}</td>
                                <td class="col-placa">${r.CicurlationCard.licensePlate}</td>
                                <td class="col-galones">${r.Galones.toFixed(2)}</td>
                                <td class="col-total">$ ${r.Total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3">TOTAL</td>
                            <td class="col-galones">${totalGalones.toFixed(2)}</td>
                            <td class="col-total">$ ${totalMonto.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                </div>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diesel-detallado-${obtenerNombreMes(mesNum)}-${anoNum}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF detallado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// 4. PDF COMPARATIVO MÚLTIPLES MESES (COMPACTO)
ReportesRoutes.generarPDFMultiplesMeses = async (req, res) => {
    let browser;
    try {
        const { meses, ano } = req.body;

        if (!Array.isArray(meses) || meses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un array de meses'
            });
        }

        const anoNum = parseInt(ano);
        const mesesValidos = meses.filter(m => m >= 1 && m <= 12);

        if (mesesValidos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay meses válidos'
            });
        }

        const registros = await ResumenDiesel.find({
            mes: { $in: mesesValidos },
            ano: anoNum
        })
            .populate('CicurlationCard', 'licensePlate')
            .sort({ mes: 1, fecha: 1 });

        if (!registros || registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay registros para los meses seleccionados'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Agrupar por mes
        const porMes = {};
        mesesValidos.forEach(m => {
            porMes[m] = {};
        });

        registros.forEach(r => {
            const mes = r.mes;
            const placa = r.CicurlationCard.licensePlate;
            
            if (!porMes[mes][placa]) {
                porMes[mes][placa] = { galones: 0, monto: 0 };
            }
            porMes[mes][placa].galones += r.Galones;
            porMes[mes][placa].monto += r.Total;
        });

        const mesesHTML = mesesValidos.map(mesNum => {
            const datos = porMes[mesNum];
            const datosTabla = Object.entries(datos)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([placa, valores]) => ({ placa, ...valores }));

            const totalGalones = datosTabla.reduce((sum, item) => sum + item.galones, 0);
            const totalMonto = datosTabla.reduce((sum, item) => sum + item.monto, 0);

            return `
                <div class="mes-section">
                    <div class="mes-header">
                        <h2>${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th class="col-numero">#</th>
                                <th class="col-placa">PLACA</th>
                                <th class="col-galones">GALONES</th>
                                <th class="col-total">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${datosTabla.length > 0 ? datosTabla.map((item, i) => `
                                <tr>
                                    <td class="col-numero">${i + 1}</td>
                                    <td class="col-placa">${item.placa}</td>
                                    <td class="col-galones">${item.galones.toFixed(2)}</td>
                                    <td class="col-total">$ ${item.monto.toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">Sin registros</td></tr>'}
                            ${datosTabla.length > 0 ? `
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td class="col-galones">${totalGalones.toFixed(2)}</td>
                                <td class="col-total">$ ${totalMonto.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const totalGeneral = registros.reduce((sum, r) => sum + r.Total, 0);
        const galonesGenerales = registros.reduce((sum, r) => sum + r.Galones, 0);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    color: #34353A;
                    background: #FFFFFF;
                }
                
                /* HEADER */
                .main-header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 40px;
                    text-align: center;
                    border-bottom: 5px solid #5D9646;
                }
                .logo-container {
                    margin-bottom: 25px;
                }
                .logo-container img {
                    width: 200px;
                    height: auto;
                    filter: brightness(0) invert(1);
                }
                .main-header h1 {
                    color: #FFFFFF;
                    font-size: 26px;
                    font-weight: 300;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                }
                .main-header .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                
                .page-content {
                    padding: 35px;
                }
                
                /* SECCIONES DE MES */
                .mes-section {
                    margin-bottom: 45px;
                    page-break-inside: avoid;
                }
                .mes-header {
                    background: #5F8EAD;
                    padding: 15px;
                    margin-bottom: 20px;
                    text-align: center;
                    border-left: 5px solid #5D9646;
                }
                .mes-header h2 {
                    color: #FFFFFF;
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    margin: 0;
                }
                
                /* TABLAS */
                table {
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto;
                    border-collapse: collapse;
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    font-size: 12px;
                }
                thead {
                    background: #34353A;
                }
                th {
                    padding: 14px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #FFFFFF;
                    border-bottom: 3px solid #5D9646;
                }
                td {
                    padding: 12px 14px;
                    text-align: center;
                    border-bottom: 1px solid #e5e7eb;
                }
                tbody tr:hover {
                    background: #f9fafb;
                }
                tbody tr:last-child td {
                    border-bottom: none;
                }
                .col-numero {
                    width: 10%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 40%;
                    font-weight: 600;
                    color: #34353A;
                    letter-spacing: 1px;
                }
                .col-galones {
                    width: 25%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-total {
                    width: 25%;
                    text-align: right;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .total-row {
                    background: #34353A;
                }
                .total-row td {
                    padding: 16px 14px;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 14px;
                }
                .total-row .col-galones {
                    color: #FFFFFF;
                }
                .total-row .col-total {
                    color: #5D9646;
                    font-size: 16px;
                }
                
                /* RESUMEN FINAL */
                .resumen-final {
                    margin-top: 45px;
                    padding: 30px;
                    background: #34353A;
                    border-top: 5px solid #5D9646;
                    text-align: center;
                    page-break-inside: avoid;
                }
                .resumen-final h3 {
                    font-size: 18px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                    color: rgba(255, 255, 255, 0.9);
                }
                .resumen-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .resumen-stat {
                    padding: 15px;
                    background: rgba(95, 142, 173, 0.15);
                    border-radius: 4px;
                }
                .resumen-stat label {
                    display: block;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .resumen-stat .value {
                    font-size: 20px;
                    font-weight: 600;
                    color: #FFFFFF;
                }
                .total-final {
                    font-size: 36px;
                    font-weight: 700;
                    color: #5D9646;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid rgba(93, 150, 70, 0.3);
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 45px;
                    padding: 25px 35px;
                    border-top: 3px solid #34353A;
                    text-align: center;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 10px;
                    margin: 4px 0;
                    line-height: 1.6;
                }
                .footer .company {
                    color: #34353A;
                    font-weight: 600;
                    font-size: 11px;
                }
            </style>
        </head>
        <body>
            <div class="main-header">
                <div class="logo-container">
                    <img src="${logoBase64}" alt="Rivera Logo" />
                </div>
                <h1>Reporte Comparativo de Diesel</h1>
                <div class="subtitle">Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
            </div>
            
            <div class="page-content">
                ${mesesHTML}
                
                <div class="resumen-final">
                    <h3>Resumen General del Período</h3>
                    <div class="resumen-stats">
                        <div class="resumen-stat">
                            <label>Meses Incluidos</label>
                            <div class="value">${mesesValidos.length}</div>
                        </div>
                        <div class="resumen-stat">
                            <label>Total Registros</label>
                            <div class="value">${registros.length}</div>
                        </div>
                        <div class="resumen-stat">
                            <label>Galones Totales</label>
                            <div class="value">${galonesGenerales.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="total-final">$ ${totalGeneral.toFixed(2)}</div>
                </div>
                
                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                    <p>Sistema de Gestión de Combustible</p>
                </div>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'] });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        const nombresMeses = mesesValidos.map(m => obtenerNombreMes(m)).join('-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diesel-comparativo-${nombresMeses}-${anoNum}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF comparativo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReportesRoutes;