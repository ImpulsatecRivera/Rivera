import puppeteer from 'puppeteer';
import ResumenDiesel from '../Models/ResumenDiesel.js';

const ReportesRoutes = {};

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
                    padding: 40px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 22px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .info-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .info-row {
                    margin: 10px 0;
                    font-size: 14px;
                }
                .info-row strong {
                    font-weight: bold;
                }
                .detail-box {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    border: 2px solid #000;
                    padding: 20px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 14px;
                }
                .detail-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 16px;
                    background: #e8e8e8;
                    padding: 15px;
                    margin-top: 10px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>COMPROBANTE DE DIESEL</h1>
            </div>

            <div class="info-section">
                <div class="info-row">
                    <strong>Vehículo:</strong> ${resumen.CicurlationCard.name}
                </div>
                <div class="info-row">
                    <strong>Placa:</strong> ${resumen.CicurlationCard.licensePlate}
                </div>
                <div class="info-row">
                    <strong>Fecha:</strong> ${new Date(resumen.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div class="info-row">
                    <strong>Período:</strong> ${obtenerNombreMes(resumen.mes)} ${resumen.ano}
                </div>
            </div>

            <div class="detail-box">
                <div class="detail-row">
                    <span><strong>Galones:</strong></span>
                    <span>${resumen.Galones.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Total a Pagar:</strong></span>
                    <span>$ ${resumen.Total.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span><strong>TOTAL:</strong></span>
                    <span>$ ${resumen.Total.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión Riverar © ${new Date().getFullYear()}</p>
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
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
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

// 2. PDF MENSUAL SIMPLE - Resumen por placa del mes (COMO LA IMAGEN)
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

        // Buscar todos los registros del mes
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

        // Convertir a array y ordenar por placa
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
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                table {
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto;
                    border-collapse: collapse;
                    border: 2px solid #000;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 12px 8px;
                    text-align: center;
                }
                th {
                    background: #d3d3d3;
                    font-weight: bold;
                    font-size: 13px;
                    text-transform: uppercase;
                }
                td {
                    font-size: 12px;
                }
                .col-numero {
                    width: 8%;
                }
                .col-placa {
                    width: 35%;
                    font-weight: bold;
                }
                .col-galones {
                    width: 27%;
                }
                .col-total {
                    width: 30%;
                    text-align: right;
                    padding-right: 15px;
                }
                .total-row {
                    font-weight: bold;
                    font-size: 14px;
                    background: #e8e8e8;
                }
                .total-row td {
                    padding: 15px 12px;
                }
                thead th.col-total {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RESUMEN DE DIESEL DEL MES DE ${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</h1>
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
                    ${datosTabla.map((item, index) => `
                        <tr>
                            <td class="col-numero">${index + 1}</td>
                            <td class="col-placa">${item.placa}</td>
                            <td class="col-galones">${item.galones.toFixed(2)}</td>
                            <td class="col-total">$${item.monto.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td class="col-galones">${totalGalones.toFixed(2)}</td>
                        <td class="col-total">$${totalMonto.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
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

// 3. PDF DETALLADO DEL MES - Con todos los registros individuales
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
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #000;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 20px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #000;
                    font-size: 11px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px 6px;
                    text-align: center;
                }
                th {
                    background: #d3d3d3;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                }
                .col-fecha { width: 15%; }
                .col-placa { width: 20%; }
                .col-galones { width: 15%; }
                .col-total { width: 20%; text-align: right; }
                .total-row {
                    font-weight: bold;
                    background: #e8e8e8;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RESUMEN DE DIESEL DEL MES DE ${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</h1>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-galones">GALONES</th>
                        <th class="col-total">TOTAL</th>
                        <th class="col-placa">PLACA</th>
                    </tr>
                </thead>
                <tbody>
                    ${registros.map((r, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="col-fecha">${new Date(r.fecha).toLocaleDateString('es-ES')}</td>
                            <td class="col-galones">${r.Galones.toFixed(2)}</td>
                            <td class="col-total">$${r.Total.toFixed(2)}</td>
                            <td class="col-placa">${r.CicurlationCard.licensePlate}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td>${totalGalones.toFixed(2)}</td>
                        <td class="col-total">$${totalMonto.toFixed(2)}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
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

// 4. PDF COMPARATIVO MÚLTIPLES MESES
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
                                <th>#</th>
                                <th>PLACA</th>
                                <th>GALONES</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${datosTabla.length > 0 ? datosTabla.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${item.placa}</td>
                                    <td>${item.galones.toFixed(2)}</td>
                                    <td>$${item.monto.toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">Sin registros</td></tr>'}
                            ${datosTabla.length > 0 ? `
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td>${totalGalones.toFixed(2)}</td>
                                <td>$${totalMonto.toFixed(2)}</td>
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
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 30px; }
                .main-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #000;
                }
                .main-header h1 {
                    font-size: 22px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .mes-section {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }
                .mes-header {
                    text-align: center;
                    margin-bottom: 15px;
                    padding: 12px;
                    background: #f0f0f0;
                    border: 2px solid #000;
                }
                .mes-header h2 { font-size: 16px; font-weight: bold; }
                table {
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto;
                    border-collapse: collapse;
                    border: 2px solid #000;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 10px;
                    text-align: center;
                    font-size: 12px;
                }
                th {
                    background: #d3d3d3;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .total-row {
                    font-weight: bold;
                    background: #e8e8e8;
                    font-size: 13px;
                }
                .resumen-final {
                    margin-top: 40px;
                    padding: 25px;
                    background: #f5f5f5;
                    border: 3px solid #000;
                    text-align: center;
                    page-break-inside: avoid;
                }
                .resumen-final h3 {
                    font-size: 18px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                }
                .resumen-final .total-final {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="main-header">
                <h1>REPORTE COMPARATIVO DE DIESEL</h1>
                <div>Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
            </div>
            ${mesesHTML}
            <div class="resumen-final">
                <h3>RESUMEN GENERAL</h3>
                <div>Meses: ${mesesValidos.length}</div>
                <div>Registros: ${registros.length}</div>
                <div>Galones Totales: ${galonesGenerales.toFixed(2)}</div>
                <div class="total-final">Total: $${totalGeneral.toFixed(2)}</div>
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
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