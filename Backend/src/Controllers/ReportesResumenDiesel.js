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
const PUPPETEER_CONFIG = {
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
    ]
};
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

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

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

        // Preparar todos los registros individuales
        const datosTabla = registros.map(r => ({
            placa: r.CicurlationCard.licensePlate,
            fecha: new Date(r.fecha).toLocaleDateString('es-ES'),
            galones: r.Galones,
            monto: r.Total
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
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 10px;
                }
                .header .logo-container img {
                    max-width: 180px;
                    height: auto;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 13px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .table-container {
                    max-width: 600px;
                    margin: 0 auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 12px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 10px;
                    text-align: center;
                    font-size: 10px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 10%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 25%;
                    font-weight: 600;
                    color: #34353A;
                    text-align: left;
                    padding-left: 15px;
                }
                .col-fecha {
                    width: 25%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-galones {
                    width: 20%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-total {
                    width: 20%;
                    font-weight: 600;
                    color: #5F8EAD;
                    text-align: right;
                    padding-right: 15px;
                }
                th.col-numero,
                th.col-placa,
                th.col-fecha,
                th.col-galones,
                th.col-total {
                    color: white;
                }
                .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                }
                .total-row td {
                    border: 2px solid #5D9646;
                    font-size: 11px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 8px;
                    color: #5F8EAD;
                    border-top: 2px solid #5D9646;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>RESUMEN DE DIESEL</h1>
                <div class="subtitle">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="col-numero">#</th>
                            <th class="col-placa">PLACA</th>
                            <th class="col-fecha">FECHA</th>
                            <th class="col-galones">GALONES</th>
                            <th class="col-total">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${datosTabla.map((item, index) => `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-placa">${item.placa}</td>
                                <td class="col-fecha">${item.fecha}</td>
                                <td class="col-galones">${item.galones.toFixed(2)}</td>
                                <td class="col-total">$ ${item.monto.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: left; padding-left: 15px;"><strong>TOTAL DIESEL</strong></td>
                            <td class="col-galones"><strong>${totalGalones.toFixed(2)}</strong></td>
                            <td class="col-total"><strong>$ ${totalMonto.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

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

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

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

        // Obtener todas las placas únicas
        const placasSet = new Set();
        registros.forEach(r => {
            placasSet.add(r.CicurlationCard.licensePlate);
        });
        const placas = Array.from(placasSet).sort();

        // Agrupar por mes y placa
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

        // Construir tabla horizontal comparativa
        let tablasComparativas = '<table class="tabla-comparativa">\n<thead>\n<tr>\n<th class="col-placa">PLACA</th>\n';
        
        // Headers de meses
        mesesValidos.forEach(mesNum => {
            tablasComparativas += `<th colspan="2" class="mes-header-col">${obtenerNombreMes(mesNum).toUpperCase()}</th>\n`;
        });
        tablasComparativas += '</tr>\n<tr>\n<th class="col-placa"></th>\n';
        
        // Sub-headers: Galones y Monto
        mesesValidos.forEach(mesNum => {
            tablasComparativas += `<th class="sub-header">GAL</th><th class="sub-header">TOTAL</th>\n`;
        });
        tablasComparativas += '</tr>\n</thead>\n<tbody>\n';

        // Filas por placa
        let totalesPorMes = {};
        mesesValidos.forEach(m => {
            totalesPorMes[m] = { galones: 0, monto: 0 };
        });

        placas.forEach(placa => {
            tablasComparativas += `<tr><td class="col-placa"><strong>${placa}</strong></td>\n`;
            
            mesesValidos.forEach(mesNum => {
                const datos = porMes[mesNum][placa] || { galones: 0, monto: 0 };
                tablasComparativas += `<td class="col-galones">${datos.galones.toFixed(2)}</td>\n`;
                tablasComparativas += `<td class="col-total">$${datos.monto.toFixed(2)}</td>\n`;
                
                totalesPorMes[mesNum].galones += datos.galones;
                totalesPorMes[mesNum].monto += datos.monto;
            });
            tablasComparativas += '</tr>\n';
        });

        // Fila de totales
        tablasComparativas += `<tr class="total-row"><td class="col-placa"><strong>TOTAL</strong></td>\n`;
        let totalGeneralGalones = 0;
        let totalGeneralMonto = 0;
        mesesValidos.forEach(mesNum => {
            tablasComparativas += `<td class="col-galones"><strong>${totalesPorMes[mesNum].galones.toFixed(2)}</strong></td>\n`;
            tablasComparativas += `<td class="col-total"><strong>$${totalesPorMes[mesNum].monto.toFixed(2)}</strong></td>\n`;
            totalGeneralGalones += totalesPorMes[mesNum].galones;
            totalGeneralMonto += totalesPorMes[mesNum].monto;
        });
        tablasComparativas += '</tr>\n</tbody>\n</table>';

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
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 10px;
                }
                .header .logo-container img {
                    max-width: 180px;
                    height: auto;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 13px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .table-container {
                    width: 100%;
                    overflow-x: auto;
                    margin-bottom: 20px;
                }
                .tabla-comparativa {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                }
                .tabla-comparativa th {
                    background: #34353A;
                    color: white;
                    padding: 8px 4px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #34353A;
                }
                .tabla-comparativa td {
                    padding: 8px 4px;
                    text-align: center;
                    font-size: 9px;
                    border: 1px solid #5F8EAD;
                }
                .tabla-comparativa .col-placa {
                    text-align: left;
                    padding-left: 10px;
                    width: 80px;
                    font-weight: 600;
                    color: #34353A;
                }
                .tabla-comparativa .col-fecha {
                    text-align: center;
                    width: 70px;
                    font-size: 8px;
                    color: #6b7280;
                }
                .tabla-comparativa .mes-header-col {
                    background: #5F8EAD;
                    color: white;
                    font-weight: bold;
                }
                .tabla-comparativa .sub-header {
                    background: #5F8EAD;
                    color: white;
                    font-size: 8px;
                    padding: 6px 2px;
                }
                .tabla-comparativa .col-galones {
                    color: #5F8EAD;
                    font-weight: 600;
                }
                .tabla-comparativa .col-total {
                    color: #5F8EAD;
                    font-weight: 600;
                }
                .tabla-comparativa .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                }
                .tabla-comparativa .total-row td {
                    border: 2px solid #5D9646;
                    font-size: 10px;
                }
                .resumen-final {
                    background: #f0f0f0;
                    border: 2px solid #5F8EAD;
                    padding: 15px;
                    margin: 30px auto 20px;
                    max-width: 100%;
                    text-align: center;
                }
                .resumen-final h3 {
                    color: #34353A;
                    font-size: 13px;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #5D9646;
                    padding-bottom: 8px;
                }
                .resumen-stat {
                    display: inline-block;
                    margin: 8px 15px;
                    font-size: 11px;
                }
                .resumen-stat label {
                    display: block;
                    color: #5F8EAD;
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                .resumen-stat .value {
                    font-size: 14px;
                    color: #34353A;
                    font-weight: bold;
                }
                .total-final {
                    font-size: 18px;
                    color: #5D9646;
                    font-weight: bold;
                    margin-top: 12px;
                    padding-top: 10px;
                    border-top: 2px solid #5D9646;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 8px;
                    color: #5F8EAD;
                    border-top: 2px solid #5D9646;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>REPORTE COMPARATIVO DE DIESEL</h1>
                <div class="subtitle">Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
            </div>

            <div class="table-container">
                ${tablasComparativas}
            </div>

            <div class="resumen-final">
                <h3>RESUMEN GENERAL DEL PERÍODO</h3>
                <div class="resumen-stat">
                    <label>Meses</label>
                    <div class="value">${mesesValidos.length}</div>
                </div>
                <div class="resumen-stat">
                    <label>Placas</label>
                    <div class="value">${placas.length}</div>
                </div>
                <div class="resumen-stat">
                    <label>Registros</label>
                    <div class="value">${registros.length}</div>
                </div>
                <div class="resumen-stat">
                    <label>Galones</label>
                    <div class="value">${totalGeneralGalones.toFixed(2)}</div>
                </div>
                <div class="total-final">$ ${totalGeneralMonto.toFixed(2)}</div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

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

// 4. PDF ANUAL - Reporte comparativo horizontal por meses del año
ReportesRoutes.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        const registros = await ResumenDiesel.find({
            ano: anoNum
        })
            .populate('CicurlationCard', 'licensePlate')
            .sort({ mes: 1, fecha: 1 });

        // ✅ Permitir generar PDF aunque no haya registros
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // ✅ SIEMPRE 12 MESES
        const mesesValidos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        const semestre1 = mesesValidos.filter(m => m <= 6);
        const semestre2 = mesesValidos.filter(m => m > 6);

        const placasSet = new Set();
        registros.forEach(r => {
            placasSet.add(r.CicurlationCard.licensePlate);
        });
        const placas = Array.from(placasSet).sort();

        // AGRUPACIÓN RESUMIDA: Por placa y mes (suma de galones y montos)
        let datosPorPlacaMes = {};
        registros.forEach(r => {
            const placa = r.CicurlationCard.licensePlate;
            const mes = r.mes;
            
            if (!datosPorPlacaMes[placa]) {
                datosPorPlacaMes[placa] = {};
            }
            if (!datosPorPlacaMes[placa][mes]) {
                datosPorPlacaMes[placa][mes] = { galones: 0, monto: 0 };
            }
            
            datosPorPlacaMes[placa][mes].galones += r.Galones;
            datosPorPlacaMes[placa][mes].monto += r.Total;
        });

        // Función para generar tabla semestral
        const generarTablaSemestre = (mesesSemestre, titulo) => {
            let html = `<div class="semestre-section"><h2 class="semestre-titulo">${titulo}</h2>`;
            html += '<table class="tabla-comparativa"><thead><tr>';
            html += '<th class="col-placa">PLACA</th>';
            
            mesesSemestre.forEach(mesNum => {
                html += `<th colspan="2" class="mes-header-col">${obtenerNombreMes(mesNum).toUpperCase()}</th>`;
            });
            
            html += '</tr><tr><th class="col-placa"></th>';
            
            mesesSemestre.forEach(() => {
                html += '<th class="sub-header">GAL</th><th class="sub-header">TOTAL</th>';
            });
            
            html += '</tr></thead><tbody>';
            
            let totalesMes = {};
            mesesSemestre.forEach(m => { totalesMes[m] = { galones: 0, monto: 0 }; });
            
            // ✅ Si no hay placas, mostrar una fila vacía
            if (placas.length === 0) {
                html += '<tr><td class="col-placa"><em>Sin registros</em></td>';
                mesesSemestre.forEach(() => {
                    html += '<td class="col-galones">-</td><td class="col-total">-</td>';
                });
                html += '</tr>';
            } else {
                // Filas por placa
                placas.forEach(placa => {
                    html += `<tr><td class="col-placa"><strong>${placa}</strong></td>`;
                    
                    mesesSemestre.forEach(mesNum => {
                        const datos = datosPorPlacaMes[placa]?.[mesNum] || null;
                        if (datos) {
                            html += `<td class="col-galones">${datos.galones.toFixed(2)}</td>`;
                            html += `<td class="col-total">$${datos.monto.toFixed(2)}</td>`;
                            totalesMes[mesNum].galones += datos.galones;
                            totalesMes[mesNum].monto += datos.monto;
                        } else {
                            html += '<td class="col-galones">-</td><td class="col-total">-</td>';
                        }
                    });
                    html += '</tr>';
                });
            }
            
            // Fila de totales
            html += '<tr class="total-row"><td class="col-placa"><strong>TOTAL</strong></td>';
            mesesSemestre.forEach(mesNum => {
                html += `<td class="col-galones"><strong>${totalesMes[mesNum].galones.toFixed(2)}</strong></td>`;
                html += `<td class="col-total"><strong>$${totalesMes[mesNum].monto.toFixed(2)}</strong></td>`;
            });
            html += '</tr></tbody></table></div>';
            
            return html;
        };

        // Generar HTML
        let tablasHTML = '';
        
        tablasHTML += generarTablaSemestre(semestre1, 'PRIMER SEMESTRE (ENERO - JUNIO)');
        tablasHTML += '<div class="page-break"></div>';
        tablasHTML += generarTablaSemestre(semestre2, 'SEGUNDO SEMESTRE (JULIO - DICIEMBRE)');

        let totalGeneralGalones = 0;
        let totalGeneralMonto = 0;
        registros.forEach(r => {
            totalGeneralGalones += r.Galones;
            totalGeneralMonto += r.Total;
        });

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: Arial, sans-serif;
                    padding: 15px; 
                    font-size: 9px; 
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #5F8EAD;
                    padding-bottom: 10px;
                }
                .logo-container img {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: 5px;
                }
                .header h1 { 
                    font-size: 14px; 
                    color: #34353A;
                    margin: 5px 0;
                }
                .header .subtitle { 
                    font-size: 10px; 
                    color: #5F8EAD;
                    font-weight: bold;
                }
                .page-break {
                    page-break-before: always;
                    page-break-after: always;
                }
                .semestre-section { 
                    margin-bottom: 20px; 
                }
                .semestre-titulo { 
                    font-size: 11px; 
                    text-align: center; 
                    margin: 10px 0 8px 0;
                    color: #5F8EAD;
                    font-weight: bold;
                }
                .tabla-comparativa { 
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                    margin-bottom: 10px;
                }
                .tabla-comparativa th { 
                    background-color: #5F8EAD;
                    color: white;
                    padding: 6px 3px; 
                    font-size: 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                }
                .tabla-comparativa td { 
                    padding: 5px 3px; 
                    font-size: 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                }
                .tabla-comparativa .col-placa { 
                    width: 80px;
                    text-align: left;
                    padding-left: 8px;
                    font-weight: 600;
                }
                .tabla-comparativa .mes-header-col { 
                    font-size: 8px;
                    background-color: #5F8EAD;
                }
                .tabla-comparativa .sub-header { 
                    font-size: 7px; 
                    padding: 3px 2px;
                    background-color: #7BA3BD;
                }
                .tabla-comparativa .col-galones {
                    text-align: right;
                    padding-right: 5px;
                }
                .tabla-comparativa .col-total {
                    text-align: right;
                    padding-right: 5px;
                    font-weight: bold;
                }
                .tabla-comparativa tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .total-row {
                    background-color: #5D9646 !important;
                    color: white;
                    font-weight: bold;
                }
                .total-row td {
                    font-weight: bold;
                    color: white;
                }
                .resumen-final { 
                    background-color: #f5f5f5;
                    border: 2px solid #5F8EAD;
                    border-radius: 5px;
                    padding: 12px; 
                    margin-top: 15px;
                    font-size: 9px;
                }
                .resumen-final h3 { 
                    font-size: 11px;
                    color: #34353A;
                    text-align: center;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #5F8EAD;
                    padding-bottom: 5px;
                }
                .resumen-stats {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                }
                .resumen-stat {
                    text-align: center;
                    margin: 5px 10px;
                }
                .resumen-stat label {
                    display: block;
                    font-size: 8px;
                    color: #666;
                    margin-bottom: 3px;
                }
                .resumen-stat .value {
                    font-size: 11px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .total-final {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    color: #5D9646;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #5D9646;
                }
                .footer { 
                    font-size: 7px; 
                    margin-top: 15px;
                    text-align: center;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA</p>'}
                </div>
                <h1>REPORTE ANUAL DE DIESEL</h1>
                <div class="subtitle">Año ${anoNum}</div>
            </div>

            ${tablasHTML}

            <div class="resumen-final">
                <h3>RESUMEN GENERAL DEL AÑO ${anoNum}</h3>
                <div class="resumen-stats">
                    <div class="resumen-stat">
                        <label>Meses con datos</label>
                        <div class="value">${registros.length > 0 ? new Set(registros.map(r => r.mes)).size : 0}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Placas</label>
                        <div class="value">${placas.length}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Registros</label>
                        <div class="value">${registros.length}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Galones</label>
                        <div class="value">${totalGeneralGalones.toFixed(2)}</div>
                    </div>
                </div>
                <div class="total-final">$ ${totalGeneralMonto.toFixed(2)}</div>
            </div>

            <div class="footer">
                <p>Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'] });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
            landscape: true
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diesel-anual-${anoNum}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF anual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};


// 5. PDF SEMANAL - Reporte por semana del mes
ReportesRoutes.generarPDFSemanal = async (req, res) => {
    let browser;
    try {
        const { mes, ano, semana } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);
        const semanaNum = parseInt(semana);

        // ✅ SOPORTE PARA RANGO DE FECHAS PERSONALIZADO
        let inicioSemana, finSemana;

        if (fechaInicio && fechaFin) {
            // Validar formato de fechas
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
                return res.status(400).json({
                    success: false,
                    message: "Las fechas deben tener formato YYYY-MM-DD"
                });
            }

            // Crear fechas en zona horaria local (NO UTC)
            const [yInicio, mInicio, dInicio] = fechaInicio.split('-');
            const [yFin, mFin, dFin] = fechaFin.split('-');

            inicioSemana = new Date(parseInt(yInicio), parseInt(mInicio) - 1, parseInt(dInicio), 0, 0, 0, 0);
            finSemana = new Date(parseInt(yFin), parseInt(mFin) - 1, parseInt(dFin), 23, 59, 59, 999);

            console.log('🔍 DEBUG - Fechas de búsqueda (Diesel Semanal):');
            console.log('   📅 Inicio:', inicioSemana.toLocaleString('es-ES', { timeZone: 'America/El_Salvador' }));
            console.log('   📅 Fin:', finSemana.toLocaleString('es-ES', { timeZone: 'America/El_Salvador' }));
            console.log('   📅 Fin ISO:', finSemana.toISOString());

            // Validar que fechaFin >= fechaInicio
            if (finSemana < inicioSemana) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de fin debe ser mayor o igual a la fecha de inicio"
                });
            }
        } else {
            // Sistema original por número de semana
            if (!mes || !ano || !semana) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren: mes, ano, semana (o fechaInicio y fechaFin en formato YYYY-MM-DD)'
                });
            }

            if (mesNum < 1 || mesNum > 12) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes inválido'
                });
            }

            if (semanaNum < 1 || semanaNum > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Semana inválida. Debe estar entre 1 y 5'
                });
            }

            // Calcular rango de fechas de la semana
            const ultimoDiaMes = new Date(anoNum, mesNum, 0);
            inicioSemana = new Date(anoNum, mesNum - 1, ((semanaNum - 1) * 7) + 1, 0, 0, 0, 0);
            finSemana = new Date(anoNum, mesNum - 1, Math.min(semanaNum * 7, ultimoDiaMes.getDate()), 23, 59, 59, 999);
        }
        // Asegurar que las fechas están correctamente configuradas
        console.log('📋 DEBUG - Búsqueda de registros:');
        console.log('   Inicio:', inicioSemana.toISOString());
        console.log('   Fin:', finSemana.toISOString());
        console.log('   Búsqueda: fecha >= ' + inicioSemana.toLocaleString('es-ES') + ' y fecha <= ' + finSemana.toLocaleString('es-ES'));

        const registros = await ResumenDiesel.find({
            fecha: {
                $gte: inicioSemana,
                $lte: finSemana
            }
        })
            .populate('CicurlationCard', 'licensePlate')
            .sort({ fecha: 1 });

        console.log('📊 Registros encontrados:', registros.length);

        // ✅ VERIFICACIÓN PARA HEAD REQUEST
        if (req.method === 'HEAD') {
            if (!registros || registros.length === 0) {
                return res.status(404).end();
            }
            return res.status(200).end();
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Obtener todas las placas únicas
        const placasSet = new Set();
        registros.forEach(r => {
            placasSet.add(r.CicurlationCard.licensePlate);
        });
        const placas = Array.from(placasSet).sort();

        // Generar título y subtítulo según el tipo de búsqueda
        let subtituloHTML = '';
        let resumenTitulo = '';
        
        if (fechaInicio && fechaFin) {
            // Formato: DD/MM/YYYY
            const formatoFecha = (f) => {
                const [y, m, d] = f.split('-');
                return `${d}/${m}/${y}`;
            };
            subtituloHTML = `${formatoFecha(fechaInicio)} AL ${formatoFecha(fechaFin)}`;
            resumenTitulo = `RESUMEN DEL PERÍODO (${formatoFecha(fechaInicio)} - ${formatoFecha(fechaFin)})`;
        } else {
            subtituloHTML = `${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum} - SEMANA ${semanaNum}`;
            resumenTitulo = `RESUMEN DE LA SEMANA ${semanaNum}`;
        }

        // Calcular días (considerando posibles cruces de meses)
        const diasSemana = [];
        let fechaActual = new Date(inicioSemana);
        while (fechaActual <= finSemana) {
            diasSemana.push(fechaActual.getDate());
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        // ✅ GENERAR TABLA DETALLADA (cada registro una fila)
        let tablaHTML = '<table class="tabla-detallada"><thead><tr>';
        tablaHTML += '<th class="col-numero">#</th>';
        tablaHTML += '<th class="col-placa">PLACA</th>';
        tablaHTML += '<th class="col-fecha">FECHA</th>';
        tablaHTML += '<th class="col-galones">GALONES</th>';
        tablaHTML += '<th class="col-total">TOTAL</th>';
        tablaHTML += '</tr></thead><tbody>';
        
        let totalGeneralGalones = 0;
        let totalGeneralMonto = 0;

        if (registros.length === 0) {
            tablaHTML += '<tr><td colspan="5" style="text-align: center; color: #6b7280;"><em>Sin registros</em></td></tr>';
        } else {
            registros.forEach((registro, index) => {
                totalGeneralGalones += registro.Galones;
                totalGeneralMonto += registro.Total;
                
                // Formatear fecha correctamente (ajustando zona horaria local)
                const fechaRegistro = new Date(registro.fecha);
                const offset = fechaRegistro.getTimezoneOffset() * 60000;
                const fechaLocal = new Date(fechaRegistro.getTime() + offset);
                const fechaFormato = fechaLocal.toLocaleDateString('es-ES');
                
                tablaHTML += `<tr>`;
                tablaHTML += `<td class="col-numero">${index + 1}</td>`;
                tablaHTML += `<td class="col-placa"><strong>${registro.CicurlationCard.licensePlate}</strong></td>`;
                tablaHTML += `<td class="col-fecha">${fechaFormato}</td>`;
                tablaHTML += `<td class="col-galones">${registro.Galones.toFixed(2)}</td>`;
                tablaHTML += `<td class="col-total">$${registro.Total.toFixed(2)}</td>`;
                tablaHTML += `</tr>`;
            });
        }
        
        // Fila de totales
        tablaHTML += '<tr class="total-row">';
        tablaHTML += '<td colspan="3" style="text-align: left; padding-left: 8px;"><strong>TOTAL</strong></td>';
        tablaHTML += `<td class="col-galones"><strong>${totalGeneralGalones.toFixed(2)}</strong></td>`;
        tablaHTML += `<td class="col-total"><strong>$${totalGeneralMonto.toFixed(2)}</strong></td>`;
        tablaHTML += '</tr></tbody></table>';

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: Arial, sans-serif;
                    padding: 15px; 
                    font-size: 9px; 
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #5F8EAD;
                    padding-bottom: 10px;
                }
                .logo-container img {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: 5px;
                }
                .header h1 { 
                    font-size: 14px; 
                    color: #34353A;
                    margin: 5px 0;
                }
                .header .subtitle { 
                    font-size: 10px; 
                    color: #5F8EAD;
                    font-weight: bold;
                }
                .tabla-detallada { 
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                    margin-bottom: 10px;
                }
                .tabla-detallada th { 
                    background-color: #5F8EAD;
                    color: white;
                    padding: 8px 6px; 
                    font-size: 9px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-weight: bold;
                }
                .tabla-detallada td { 
                    padding: 6px; 
                    font-size: 8px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                .tabla-detallada .col-numero { 
                    width: 8%;
                    text-align: center;
                    color: #6b7280;
                    font-weight: 500;
                }
                .tabla-detallada .col-placa { 
                    width: 20%;
                    font-weight: 600;
                    color: #34353A;
                }
                .tabla-detallada .col-fecha { 
                    width: 22%;
                    color: #6b7280;
                }
                .tabla-detallada .col-galones {
                    width: 20%;
                    text-align: right;
                    padding-right: 8px;
                }
                .tabla-detallada .col-total {
                    width: 30%;
                    text-align: right;
                    padding-right: 8px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .tabla-detallada th.col-numero,
                .tabla-detallada th.col-placa,
                .tabla-detallada th.col-fecha,
                .tabla-detallada th.col-galones,
                .tabla-detallada th.col-total {
                    color: white;
                }
                .tabla-detallada tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .total-row {
                    background-color: #5D9646 !important;
                    color: white;
                    font-weight: bold;
                }
                .total-row td {
                    font-weight: bold;
                    color: white;
                }
                .total-row .col-galones,
                .total-row .col-total {
                    color: white !important;
                }
                .resumen-final { 
                    background-color: #f5f5f5;
                    border: 2px solid #5F8EAD;
                    border-radius: 5px;
                    padding: 12px; 
                    margin-top: 20px;
                    font-size: 9px;
                }
                .resumen-final h3 { 
                    font-size: 11px;
                    color: #34353A;
                    text-align: center;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #5F8EAD;
                    padding-bottom: 5px;
                }
                .resumen-stats {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                }
                .resumen-stat {
                    text-align: center;
                    margin: 5px 10px;
                }
                .resumen-stat label {
                    display: block;
                    font-size: 8px;
                    color: #666;
                    margin-bottom: 3px;
                }
                .resumen-stat .value {
                    font-size: 11px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .total-final {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    color: #5D9646;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #5D9646;
                }
                .footer { 
                    font-size: 7px; 
                    margin-top: 15px;
                    text-align: center;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA</p>'}
                </div>
                <h1>REPORTE SEMANAL DE DIESEL</h1>
                <div class="subtitle">${subtituloHTML}</div>
            </div>

            ${tablaHTML}

            <div class="resumen-final">
                <h3>${resumenTitulo}</h3>
                <div class="resumen-stats">
                    <div class="resumen-stat">
                        <label>Días</label>
                        <div class="value">${diasSemana.length}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Placas</label>
                        <div class="value">${placas.length}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Registros</label>
                        <div class="value">${registros.length}</div>
                    </div>
                    <div class="resumen-stat">
                        <label>Galones</label>
                        <div class="value">${totalGeneralGalones.toFixed(2)}</div>
                    </div>
                </div>
                <div class="total-final">$ ${totalGeneralMonto.toFixed(2)}</div>
            </div>

            <div class="footer">
                <p>Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'] });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
            landscape: false
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diesel-semanal-${obtenerNombreMes(mesNum)}-sem${semanaNum}-${anoNum}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF semanal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};
export default ReportesRoutes;