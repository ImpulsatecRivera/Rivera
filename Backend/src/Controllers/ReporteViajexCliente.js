import puppeteer from 'puppeteer';
import ViajesxCliente from '../Models/ViajesPorClientes.js';

const ReportesViajesRoutes = {};

// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses[mes - 1] || 'MES INVÁLIDO';
};

// 1. PDF ESTILO IMAGEN - Exactamente como la imagen compartida
ReportesViajesRoutes.generarPDFEstiloTabla = async (req, res) => {
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

        // Obtener el reporte mensual usando el método del modelo
        const reporte = await ViajesxCliente.obtenerReporteMensual(mesNum, anoNum);

        if (!reporte.clientes || reporte.clientes.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay viajes registrados para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        // Generar las filas de la tabla
        let filasHTML = '';
        let numeroCliente = 1;

        reporte.clientes.forEach(cliente => {
            const rutasActivas = cliente.rutas.filter(r => r.activa);
            
            if (rutasActivas.length === 0) return;

            // Primera fila del cliente (con número y monto total)
            filasHTML += `
                <tr>
                    <td rowspan="${rutasActivas.length}" class="cell-numero">${numeroCliente}</td>
                    <td class="cell-cliente">${rutasActivas[0].rutaCompleta}</td>
                    <td class="cell-viajes">${rutasActivas[0].cantidadViajes}</td>
                    <td class="cell-monto">$${rutasActivas[0].montoTotal.toFixed(2)}</td>
                    <td rowspan="${rutasActivas.length}" class="cell-total">$ ${cliente.montoTotal.toFixed(2)}</td>
                </tr>
            `;

            // Filas adicionales del cliente (sin número ni monto total)
            for (let i = 1; i < rutasActivas.length; i++) {
                filasHTML += `
                    <tr>
                        <td class="cell-cliente">${rutasActivas[i].rutaCompleta}</td>
                        <td class="cell-viajes">${rutasActivas[i].cantidadViajes}</td>
                        <td class="cell-monto">$${rutasActivas[i].montoTotal.toFixed(2)}</td>
                    </tr>
                `;
            }

            numeroCliente++;
        });

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
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .header .period {
                    font-size: 20px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #000;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background: #d3d3d3;
                    font-weight: bold;
                    font-size: 14px;
                }
                td {
                    font-size: 13px;
                }
                .cell-numero {
                    width: 5%;
                    font-weight: bold;
                    vertical-align: middle;
                }
                .cell-cliente {
                    width: 40%;
                    text-align: left;
                    padding-left: 15px;
                    font-weight: bold;
                }
                .cell-viajes {
                    width: 12%;
                }
                .cell-monto {
                    width: 18%;
                    text-align: right;
                    padding-right: 15px;
                }
                .cell-total {
                    width: 25%;
                    text-align: right;
                    padding-right: 15px;
                    font-weight: bold;
                    vertical-align: middle;
                }
                .total-row {
                    background: #e8e8e8;
                    font-weight: bold;
                    font-size: 14px;
                }
                .total-row td {
                    padding: 12px 8px;
                }
                .footer {
                    margin-top: 20px;
                }
                .footer .nota {
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer .detalle {
                    font-size: 12px;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RESUMEN DE VIAJES POR CLIENTE</h1>
                <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>CLIENTE</th>
                        <th>VIAJES</th>
                        <th>MONTO POR<br>VIAJES</th>
                        <th>MONTO TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td>${reporte.granTotal.totalViajes}</td>
                        <td>$ ${reporte.granTotal.totalMonto.toFixed(2)}</td>
                        <td>$ ${reporte.granTotal.totalMonto.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <div class="nota">NOTA:</div>
                <div class="detalle">PRECIO SIN IVA</div>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viajes-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF estilo tabla:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// 2. PDF INDIVIDUAL - Detalle completo de un cliente específico
ReportesViajesRoutes.generarPDFClienteIndividual = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        const cliente = await ViajesxCliente.findById(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const rutasActivas = cliente.rutas.filter(r => r.activa);

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
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 40px;
                    color: #1e293b;
                    background: #f8fafc;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 4px solid #2563eb;
                    padding-bottom: 25px;
                }
                .header h1 {
                    color: #2563eb;
                    font-size: 32px;
                    margin-bottom: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .header .subtitle {
                    color: #64748b;
                    font-size: 16px;
                    font-weight: 500;
                }
                .id-badge {
                    display: inline-block;
                    background: #f1f5f9;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #475569;
                    margin-top: 10px;
                    font-family: monospace;
                }
                .section {
                    margin-bottom: 35px;
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 10px;
                    border-left: 5px solid #2563eb;
                }
                .section-title {
                    color: #2563eb;
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 20px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-top: 15px;
                }
                .info-item {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .info-item label {
                    display: block;
                    font-weight: 600;
                    color: #64748b;
                    font-size: 11px;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }
                .info-item .value {
                    color: #1e293b;
                    font-size: 15px;
                    font-weight: 500;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                }
                thead {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                }
                th {
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 13px;
                    text-transform: uppercase;
                }
                td {
                    padding: 15px;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 14px;
                }
                .text-right {
                    text-align: right;
                }
                .total-section {
                    margin-top: 30px;
                    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                }
                .total-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .total-item {
                    text-align: center;
                }
                .total-item label {
                    font-size: 12px;
                    opacity: 0.9;
                    margin-bottom: 8px;
                }
                .total-item .value {
                    font-size: 24px;
                    font-weight: 700;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #64748b;
                    font-size: 11px;
                    border-top: 2px solid #e2e8f0;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚗 Reporte de Viajes</h1>
                    <p class="subtitle">Detalle Completo por Cliente</p>
                    <div class="id-badge">ID: ${cliente.clienteId}</div>
                </div>

                <div class="section">
                    <h2 class="section-title">📋 Información del Cliente</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nombre del Cliente</label>
                            <div class="value">${cliente.clienteNombre}</div>
                        </div>
                        <div class="info-item">
                            <label>Período</label>
                            <div class="value">${obtenerNombreMes(cliente.mes)} ${cliente.ano}</div>
                        </div>
                        ${cliente.telefono ? `
                        <div class="info-item">
                            <label>Teléfono</label>
                            <div class="value">${cliente.telefono}</div>
                        </div>
                        ` : ''}
                        ${cliente.email ? `
                        <div class="info-item">
                            <label>Email</label>
                            <div class="value">${cliente.email}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">🛣️ Rutas y Viajes</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ruta</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th class="text-right">Viajes</th>
                                <th class="text-right">$ por Viaje</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rutasActivas.map((ruta, index) => `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td><strong>${ruta.rutaCompleta}</strong></td>
                                    <td>${ruta.origen}</td>
                                    <td>${ruta.destino}</td>
                                    <td class="text-right">${ruta.cantidadViajes}</td>
                                    <td class="text-right">$${ruta.montoPorViaje.toFixed(2)}</td>
                                    <td class="text-right"><strong>$${ruta.montoTotal.toFixed(2)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-grid">
                            <div class="total-item">
                                <label>Total de Viajes</label>
                                <div class="value">${cliente.totalViajes}</div>
                            </div>
                            <div class="total-item">
                                <label>💵 Monto Total</label>
                                <div class="value">$${cliente.montoTotalGeneral.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${cliente.notas ? `
                <div class="section">
                    <h2 class="section-title">📝 Notas</h2>
                    <p>${cliente.notas}</p>
                </div>
                ` : ''}

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p>Sistema de Gestión de Viajes</p>
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
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viajes-${cliente.clienteNombre}-${Date.now()}.pdf`);
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

// 3. PDF COMPARATIVO - Múltiples meses
ReportesViajesRoutes.generarPDFComparativoMeses = async (req, res) => {
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

        // Obtener reportes de cada mes
        const reportes = await Promise.all(
            mesesValidos.map(mes => ViajesxCliente.obtenerReporteMensual(mes, anoNum))
        );

        const mesesHTML = reportes.map((reporte, idx) => {
            const mesNum = mesesValidos[idx];
            
            if (!reporte.clientes || reporte.clientes.length === 0) {
                return `
                    <div class="mes-section">
                        <h2>${obtenerNombreMes(mesNum)} ${anoNum}</h2>
                        <p>Sin registros</p>
                    </div>
                `;
            }

            let filasHTML = '';
            let numeroCliente = 1;

            reporte.clientes.forEach(cliente => {
                const rutasActivas = cliente.rutas.filter(r => r.activa);
                if (rutasActivas.length === 0) return;

                filasHTML += `
                    <tr>
                        <td rowspan="${rutasActivas.length}" class="cell-numero">${numeroCliente}</td>
                        <td class="cell-cliente">${rutasActivas[0].rutaCompleta}</td>
                        <td class="cell-viajes">${rutasActivas[0].cantidadViajes}</td>
                        <td class="cell-monto">$${rutasActivas[0].montoTotal.toFixed(2)}</td>
                        <td rowspan="${rutasActivas.length}" class="cell-total">$ ${cliente.montoTotal.toFixed(2)}</td>
                    </tr>
                `;

                for (let i = 1; i < rutasActivas.length; i++) {
                    filasHTML += `
                        <tr>
                            <td class="cell-cliente">${rutasActivas[i].rutaCompleta}</td>
                            <td class="cell-viajes">${rutasActivas[i].cantidadViajes}</td>
                            <td class="cell-monto">$${rutasActivas[i].montoTotal.toFixed(2)}</td>
                        </tr>
                    `;
                }

                numeroCliente++;
            });

            return `
                <div class="mes-section">
                    <h2>${obtenerNombreMes(mesNum)} ${anoNum}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CLIENTE</th>
                                <th>VIAJES</th>
                                <th>MONTO POR VIAJES</th>
                                <th>MONTO TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td>${reporte.granTotal.totalViajes}</td>
                                <td>$ ${reporte.granTotal.totalMonto.toFixed(2)}</td>
                                <td>$ ${reporte.granTotal.totalMonto.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const totalGeneralMeses = reportes.reduce((sum, r) => sum + r.granTotal.totalMonto, 0);
        const totalViajesGeneral = reportes.reduce((sum, r) => sum + r.granTotal.totalViajes, 0);

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
                }
                .main-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #000;
                }
                .main-header h1 {
                    font-size: 26px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .mes-section {
                    margin-bottom: 50px;
                    page-break-inside: avoid;
                }
                .mes-section h2 {
                    text-align: center;
                    background: #f0f0f0;
                    padding: 15px;
                    border: 2px solid #000;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #000;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-size: 12px;
                }
                th {
                    background: #d3d3d3;
                    font-weight: bold;
                }
                .cell-numero {
                    width: 5%;
                    font-weight: bold;
                    vertical-align: middle;
                }
                .cell-cliente {
                    width: 40%;
                    text-align: left;
                    padding-left: 15px;
                    font-weight: bold;
                }
                .cell-viajes {
                    width: 12%;
                }
                .cell-monto {
                    width: 18%;
                    text-align: right;
                    padding-right: 15px;
                }
                .cell-total {
                    width: 25%;
                    text-align: right;
                    padding-right: 15px;
                    font-weight: bold;
                    vertical-align: middle;
                }
                .total-row {
                    background: #e8e8e8;
                    font-weight: bold;
                }
                .resumen-final {
                    margin-top: 40px;
                    padding: 25px;
                    background: #f5f5f5;
                    border: 3px solid #000;
                    text-align: center;
                }
                .resumen-final h3 {
                    font-size: 20px;
                    margin-bottom: 15px;
                }
                .resumen-final .total-final {
                    font-size: 28px;
                    font-weight: bold;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="main-header">
                <h1>REPORTE COMPARATIVO DE VIAJES</h1>
                <p>Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</p>
            </div>

            ${mesesHTML}

            <div class="resumen-final">
                <h3>RESUMEN GENERAL</h3>
                <div>Meses incluidos: ${mesesValidos.length}</div>
                <div>Total de viajes: ${totalViajesGeneral}</div>
                <div class="total-final">$ ${totalGeneralMeses.toFixed(2)}</div>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viajes-comparativo-${anoNum}.pdf`);
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

// 4. PDF CONSOLIDADO ANUAL - Todos los clientes del año
ReportesViajesRoutes.generarPDFConsolidadoAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        const clientes = await ViajesxCliente.find({
            ano: anoNum,
            estado: "ACTIVO"
        }).sort({ mes: 1, clienteNombre: 1 });

        if (!clientes || clientes.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay registros para el año ${anoNum}`
            });
        }

        // Estadísticas generales
        const totalGeneral = clientes.reduce((sum, c) => sum + c.montoTotalGeneral, 0);
        const totalViajes = clientes.reduce((sum, c) => sum + c.totalViajes, 0);
        const promedioPorCliente = totalGeneral / clientes.length;

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
                }
                .header {
                    text-align: center;
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    border-left: 4px solid #2563eb;
                }
                .stat-card label {
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .stat-card .value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #2563eb;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                thead {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                }
                th {
                    padding: 10px 8px;
                    text-align: left;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .text-right {
                    text-align: right;
                }
                .summary {
                    margin-top: 30px;
                    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                }
                .summary .total {
                    font-size: 36px;
                    font-weight: 700;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 REPORTE CONSOLIDADO ANUAL</h1>
                <p>Año ${anoNum}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <label>Total Clientes</label>
                    <div class="value">${clientes.length}</div>
                </div>
                <div class="stat-card">
                    <label>Total Viajes</label>
                    <div class="value">${totalViajes}</div>
                </div>
                <div class="stat-card">
                    <label>Monto Total</label>
                    <div class="value">${totalGeneral.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <label>Promedio</label>
                    <div class="value">${promedioPorCliente.toFixed(2)}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mes</th>
                        <th>Cliente</th>
                        <th class="text-right">Rutas</th>
                        <th class="text-right">Viajes</th>
                        <th class="text-right">Monto Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientes.map((c, idx) => `
                        <tr>
                            <td><strong>${idx + 1}</strong></td>
                            <td>${obtenerNombreMes(c.mes)}</td>
                            <td><strong>${c.clienteNombre}</strong></td>
                            <td class="text-right">${c.rutas.filter(r => r.activa).length}</td>
                            <td class="text-right">${c.totalViajes}</td>
                            <td class="text-right"><strong>${c.montoTotalGeneral.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="summary">
                <h3>💰 TOTAL ANUAL</h3>
                <div class="total">${totalGeneral.toFixed(2)}</div>
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
            landscape: true,
            printBackground: true,
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viajes-consolidado-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF consolidado anual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReportesViajesRoutes;