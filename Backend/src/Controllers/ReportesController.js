import puppeteer from 'puppeteer';
import MantenimientoCamiones from '../Models/MantenimientoCamiones.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';
import { generatePdfFromHtml } from '../Utils/pdfGenerator.js';

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
// Detectar entorno de ejecución
const IS_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Ruta al logo
const RUTA_LOGO = path.join(process.cwd(), 'src', 'imagenes', 'imagen_15.png');
const PUPPETEER_CONFIG = () => {
    if (IS_PRODUCTION || IS_CLOUD_RUN) {
        // Configuración para Cloud Run
        return {
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
    } else {
        // Configuración para desarrollo local
        return {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        };
    }
};

const launchBrowserSafe = async () => {
    return launchUniversalBrowser(puppeteer, {
        serviceName: 'reportes-mantenimiento',
        primaryConfig: PUPPETEER_CONFIG()
    });
};
// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
};

// Función para formatear fecha de forma consistente
const formatearFecha = (fecha) => {
    // Si es un string en formato YYYY-MM-DD, parsearlo directamente SIN crear Date
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    }
    
    // Si es un objeto Date, usar métodos locales
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// 1. PDF INDIVIDUAL - Mantenimiento super detallado
ReportesRoutes.generarPDFIndividual = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        const manto = await MantenimientoCamiones.findById(id)
            .populate({
                path: "ciculatioCard",
                select: "name brand model state age licensePlate description img"
            });

        if (!manto) {
            return res.status(404).json({
                success: false,
                message: 'Mantenimiento no encontrado'
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const totalDetalle = manto.detalles.reduce((sum, detalle) => sum + detalle.subTotal, 0);

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-container img {
                    max-width: 120px;
                    height: auto;
                    background: white;
                    padding: 2px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-bottom: 4px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 10px;
                    font-weight: bold;
                    margin-top: 4px;
                    color: #5F8EAD;
                }
                .header .info-id {
                    text-align: right;
                    font-size: 9px;
                    font-weight: bold;
                    margin-top: 6px;
                    color: #5F8EAD;
                }
                
                /* STATS SUMMARY */
                .stats-summary {
                    margin-bottom: 20px;
                    padding: 10px;
                    background: #f5f9fc;
                    border: 2px solid #5F8EAD;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 9px;
                    color: #34353A;
                }
                .stats-row:last-child {
                    border-bottom: none;
                }
                .stats-row strong {
                    font-weight: bold;
                }
                
                /* SECCIONES */
                .section-title {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                    padding: 8px 12px;
                    font-size: 11px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    margin: 20px 0 10px 0;
                    text-transform: uppercase;
                }
                
                /* TABLA DE INFORMACIÓN */
                table.info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                table.info-table thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                table.info-table th {
                    padding: 6px 4px;
                    text-align: center;
                    font-size: 9px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                table.info-table td {
                    padding: 6px 8px;
                    border: 1px solid #34353A;
                    font-size: 8px;
                    background: #fff;
                    color: #34353A;
                }
                table.info-table .col-label {
                    width: 200px;
                    font-weight: bold;
                    text-align: left;
                    padding-left: 15px;
                    background: #f5f5f5;
                }
                table.info-table .col-value {
                    text-align: left;
                    padding-left: 15px;
                }
                
                /* TABLA DE DETALLES */
                table.details-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                table.details-table thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                table.details-table th {
                    padding: 8px 6px;
                    text-align: center;
                    font-size: 9px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                table.details-table td {
                    padding: 6px 8px;
                    border: 1px solid #34353A;
                    font-size: 8px;
                    background: #fff;
                    color: #34353A;
                }
                table.details-table .text-right {
                    text-align: right;
                }
                table.details-table .text-center {
                    text-align: center;
                }
                
                /* BADGES */
                .badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 3px;
                    font-size: 8px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .badge-preventivo {
                    background: #5D9646;
                    color: #FFFFFF;
                }
                .badge-correctivo {
                    background: #dc2626;
                    color: #FFFFFF;
                }
                .badge-llantas {
                    background: #d97706;
                    color: #FFFFFF;
                }
                .badge-rines {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-furgo {
                    background: #be123c;
                    color: #FFFFFF;
                }
                .badge-madera_furgo {
                    background: #c2410c;
                    color: #FFFFFF;
                }
                .badge-torno {
                    background: #7c3aed;
                    color: #FFFFFF;
                }
                .badge-bomba {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-reparacion_turbo {
                    background: #991b1b;
                    color: #FFFFFF;
                }
                .badge-otros {
                    background: #4f46e5;
                    color: #FFFFFF;
                }
                
                /* FOOTER SECTION */
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:100px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
                <h1>REPORTE DE MANTENIMIENTO</h1>
                <div class="subtitle">REGISTRO DETALLADO DE SERVICIO VEHICULAR</div>
                <div class="info-id">ID: ${manto._id}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span><strong>VEHÍCULO:</strong></span>
                    <span>${manto.ciculatioCard.name} - ${manto.ciculatioCard.licensePlate}</span>
                </div>
                <div class="stats-row">
                    <span><strong>FECHA:</strong></span>
                    <span>${new Date(manto.fecha_mantenimiento).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="stats-row">
                    <span><strong>TIPO:</strong></span>
                    <span>${manto.tipo_de_mantenimiento.toUpperCase()}</span>
                </div>
                <div class="stats-row">
                    <span><strong>TOTAL ITEMS:</strong></span>
                    <span>${manto.detalles.length}</span>
                </div>
                <div class="stats-row">
                    <span><strong>COSTO TOTAL:</strong></span>
                    <span><strong>$ ${totalDetalle.toFixed(2)}</strong></span>
                </div>
            </div>

            <div class="section-title">Información del Vehículo</div>

            <table class="info-table">
                <thead>
                    <tr>
                        <th class="col-label">DETALLE</th>
                        <th class="col-value">INFORMACIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="col-label">NOMBRE DEL VEHÍCULO:</td>
                        <td class="col-value">${manto.ciculatioCard.name.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">PLACAS:</td>
                        <td class="col-value">${manto.ciculatioCard.licensePlate.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">MARCA:</td>
                        <td class="col-value">${manto.ciculatioCard.brand.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">MODELO:</td>
                        <td class="col-value">${manto.ciculatioCard.model.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">ESTADO:</td>
                        <td class="col-value">${manto.ciculatioCard.state.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">AÑO:</td>
                        <td class="col-value">${manto.ciculatioCard.age || 'N/A'}</td>
                    </tr>
                    ${manto.ciculatioCard.description ? `
                    <tr>
                        <td class="col-label">DESCRIPCIÓN:</td>
                        <td class="col-value">${manto.ciculatioCard.description.toUpperCase()}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>

            <div class="section-title">Detalles del Mantenimiento</div>

            <table class="info-table">
                <thead>
                    <tr>
                        <th class="col-label">DETALLE</th>
                        <th class="col-value">INFORMACIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="col-label">FECHA DE MANTENIMIENTO:</td>
                        <td class="col-value">${new Date(manto.fecha_mantenimiento).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }).toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">PERÍODO:</td>
                        <td class="col-value">${obtenerNombreMes(manto.mes).toUpperCase()} ${manto.ano}</td>
                    </tr>
                    <tr>
                        <td class="col-label">TIPO DE MANTENIMIENTO:</td>
                        <td class="col-value">
                            <span class="badge badge-${manto.tipo_de_mantenimiento}">
                                ${manto.tipo_de_mantenimiento.toUpperCase()}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="col-label">CANTIDAD DE ITEMS:</td>
                        <td class="col-value">${manto.detalles.length} ${manto.detalles.length === 1 ? 'ITEM' : 'ITEMS'}</td>
                    </tr>
                    <tr>
                        <td class="col-label">DESCRIPCIÓN:</td>
                        <td class="col-value">${manto.descripcion.toUpperCase()}</td>
                    </tr>
                </tbody>
            </table>

            <div class="section-title">Desglose de Costos</div>

            <table class="details-table">
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 45%;">CONCEPTO</th>
                        <th style="width: 15%;">CANTIDAD</th>
                        <th style="width: 17.5%;">PRECIO UNIT.</th>
                        <th style="width: 17.5%;">SUBTOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${manto.detalles.map((detalle, index) => `
                        <tr>
                            <td class="text-center"><strong>${index + 1}</strong></td>
                            <td>${detalle.concepto.toUpperCase()}</td>
                            <td class="text-center">${detalle.cantidad}</td>
                            <td class="text-right">$${detalle.precioUnitario.toFixed(2)}</td>
                            <td class="text-right"><strong>$${detalle.subTotal.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer-section">
                <div>COSTO TOTAL DEL MANTENIMIENTO</div>
                <div class="balance-final">$ ${totalDetalle.toFixed(2)}</div>
                <div style="margin-top: 10px; font-size: 9px;">
                    <div>Total de Items: ${manto.detalles.length}</div>
                    <div>Costo Promedio por Item: $${(totalDetalle / manto.detalles.length).toFixed(2)}</div>
                </div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        const pdfBuffer = await generatePdfFromHtml(htmlContent, {
            serviceName: 'reportes-mantenimiento',
            pdfOptions: { format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } },
            timeoutMs: 45000,
            retries: 2,
            waitUntil: 'networkidle2'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=mantenimiento-${manto.ciculatioCard.licensePlate}-${Date.now()}.pdf`);
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
// 2. PDF REPORTE ANUAL - Tabla horizontal con meses que tienen datos
ReportesRoutes.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        // Buscar todos los mantenimientos del año
        const mantenimientos = await MantenimientoCamiones.find({
            ano: anoNum
        })
            .populate('ciculatioCard', 'licensePlate')
            .sort({ mes: 1, 'ciculatioCard.licensePlate': 1 });

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay mantenimientos registrados para el año ${anoNum}`
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Identificar qué meses tienen datos
        const mesesConDatos = new Set();
        mantenimientos.forEach(m => {
            mesesConDatos.add(m.mes);
        });
        const mesesOrdenados = Array.from(mesesConDatos).sort((a, b) => a - b);

        // Agrupar por placa y mes
        const porPlaca = {};
        mantenimientos.forEach(m => {
            const placa = m.ciculatioCard.licensePlate;
            const mes = m.mes;
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            
            if (!porPlaca[placa]) {
                porPlaca[placa] = {};
            }
            if (!porPlaca[placa][mes]) {
                porPlaca[placa][mes] = 0;
            }
            porPlaca[placa][mes] += total;
        });

        // Calcular totales por mes y por placa
        const totalesPorMes = {};
        mesesOrdenados.forEach(mes => {
            totalesPorMes[mes] = 0;
        });

        const datosTabla = Object.entries(porPlaca)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([placa, meses]) => {
                let totalPlaca = 0;
                mesesOrdenados.forEach(mes => {
                    const monto = meses[mes] || 0;
                    totalPlaca += monto;
                    totalesPorMes[mes] += monto;
                });
                return { placa, meses, totalPlaca };
            });

        const totalGeneral = Object.values(totalesPorMes).reduce((sum, val) => sum + val, 0);

        // Generar headers de meses
        const headersMeses = mesesOrdenados.map(mes => {
            return `<th style="background-color: #5F8EAD; color: white; font-size: 7px;">${obtenerNombreMes(mes).toUpperCase()}</th>`;
        }).join('');

        // Generar filas de tabla
        const filasHTML = datosTabla.map((item, index) => {
            const columnasMeses = mesesOrdenados.map(mes => {
                const monto = item.meses[mes] || 0;
                return `<td>${monto > 0 ? '$ ' + monto.toFixed(2) : '-'}</td>`;
            }).join('');

            return `
                <tr>
                    <td class="col-numero">${index + 1}</td>
                    <td class="col-placa">${item.placa}</td>
                    ${columnasMeses}
                    <td class="col-total">$ ${item.totalPlaca.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        // Fila de totales por mes
        const columnasTotalesMeses = mesesOrdenados.map(mes => {
            return `<td><strong>$ ${totalesPorMes[mes].toFixed(2)}</strong></td>`;
        }).join('');

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
                    padding: 10px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 8px;
                }
                .header .logo-container img {
                    max-width: 160px;
                    height: auto;
                }
                .header h1 {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 3px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 11px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 6px 3px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 8px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 5px 3px;
                    text-align: center;
                    font-size: 7px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 4%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 8%;
                    font-weight: 600;
                    color: #34353A;
                    text-align: left;
                    padding-left: 8px;
                }
                .col-total {
                    width: 8%;
                    font-weight: 600;
                    color: #5F8EAD;
                    text-align: right;
                    padding-right: 8px;
                }
                th.col-numero,
                th.col-placa,
                th.col-total {
                    color: white;
                }
                .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                }
                .total-row td {
                    border: 2px solid #5D9646;
                    font-size: 8px;
                }
                .footer {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 7px;
                    color: #5F8EAD;
                    border-top: 2px solid #5D9646;
                    padding-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>MANTENIMIENTO POR CAMIÓN</h1>
                <div class="subtitle">AÑO ${anoNum}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-placa">PLACA</th>
                        ${headersMeses}
                        <th class="col-total">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TALLER</strong></td>
                        ${columnasTotalesMeses}
                        <td class="col-total"><strong>$ ${totalGeneral.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await launchBrowserSafe();

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Legal',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=mantenimiento-anual-${anoNum}.pdf`);
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

// 3. PDF REPORTE MENSUAL SIMPLE - Solo placas y montos de un mes
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

        const mantenimientos = await MantenimientoCamiones.find({
            mes: mesNum,
            ano: anoNum
        })
            .populate('ciculatioCard', 'licensePlate')
            .sort({ 'ciculatioCard.licensePlate': 1 });

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay mantenimientos para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const porPlaca = {};
        mantenimientos.forEach(m => {
            const placa = m.ciculatioCard.licensePlate;
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            
            if (!porPlaca[placa]) {
                porPlaca[placa] = 0;
            }
            porPlaca[placa] += total;
        });

        const datosTabla = Object.entries(porPlaca)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([placa, monto]) => ({ placa, monto }));

        const totalGeneral = datosTabla.reduce((sum, item) => sum + item.monto, 0);

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
                    width: 15%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 45%;
                    font-weight: 600;
                    color: #34353A;
                    text-align: left;
                    padding-left: 15px;
                }
                .col-monto {
                    width: 40%;
                    font-weight: 600;
                    color: #5F8EAD;
                    text-align: right;
                    padding-right: 15px;
                }
                th.col-numero,
                th.col-placa,
                th.col-monto {
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
                <h1>MANTENIMIENTO POR CAMIÓN</h1>
                <div class="subtitle">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="col-numero">#</th>
                            <th class="col-placa">PLACA</th>
                            <th class="col-monto">MONTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${datosTabla.map((item, index) => `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-placa">${item.placa}</td>
                                <td class="col-monto">$ ${item.monto.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="2" style="text-align: left; padding-left: 15px;"><strong>TALLER</strong></td>
                            <td class="col-monto"><strong>$ ${totalGeneral.toFixed(2)}</strong></td>
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

        browser = await launchBrowserSafe();

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=mantenimiento-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual simple:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};


// 4. PDF REPORTE MÚLTIPLES MESES - Elegir varios meses
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
                message: 'No hay meses válidos en la lista'
            });
        }

        const mantenimientos = await MantenimientoCamiones.find({
            mes: { $in: mesesValidos },
            ano: anoNum
        })
            .populate('ciculatioCard', 'licensePlate')
            .sort({ mes: 1, 'ciculatioCard.licensePlate': 1 });

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay mantenimientos para los meses seleccionados'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const porMes = {};
        mesesValidos.forEach(m => {
            porMes[m] = {};
        });

        mantenimientos.forEach(m => {
            const mes = m.mes;
            const placa = m.ciculatioCard.licensePlate;
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            
            if (!porMes[mes][placa]) {
                porMes[mes][placa] = 0;
            }
            porMes[mes][placa] += total;
        });

        const mesesHTML = mesesValidos.map(mesNum => {
            const datos = porMes[mesNum];
            const datosTabla = Object.entries(datos)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([placa, monto]) => ({ placa, monto }));

            const totalMes = datosTabla.reduce((sum, item) => sum + item.monto, 0);

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
                                <th class="col-monto">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${datosTabla.length > 0 ? datosTabla.map((item, index) => `
                                <tr>
                                    <td class="col-numero">${index + 1}</td>
                                    <td class="col-placa">${item.placa}</td>
                                    <td class="col-monto">$ ${item.monto.toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Sin registros</td></tr>'}
                            ${datosTabla.length > 0 ? `
                            <tr class="total-row">
                                <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TOTAL</strong></td>
                                <td class="col-monto"><strong>$ ${totalMes.toFixed(2)}</strong></td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const totalGeneral = mantenimientos.reduce((sum, m) => {
            return sum + m.detalles.reduce((s, d) => s + d.subTotal, 0);
        }, 0);

        const logoHTML = logoBase64 
            ? `<img src="${logoBase64}" alt="Rivera Logo" />` 
            : '<div style="color: #34353A; font-size: 24px; font-weight: bold;">RIVERA - Distribuidora y Transportes</div>';

        const htmlContent = `<!DOCTYPE html>
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
            padding: 10px;
            color: #34353A;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #5F8EAD;
        }
        .header .logo-container {
            margin-bottom: 8px;
        }
        .header .logo-container img {
            max-width: 160px;
            height: auto;
        }
        .header h1 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #34353A;
        }
        .header .subtitle {
            font-size: 11px;
            font-weight: bold;
            color: #5F8EAD;
        }
        .mes-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .mes-header {
            background: #5F8EAD;
            color: white;
            padding: 8px;
            margin-bottom: 10px;
            text-align: center;
            border-left: 4px solid #5D9646;
        }
        .mes-header h2 {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th {
            background: #34353A;
            color: white;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 8px;
            border: 1px solid #34353A;
        }
        td {
            padding: 5px;
            text-align: center;
            font-size: 7px;
            border: 1px solid #5F8EAD;
        }
        .col-numero {
            width: 10%;
            color: #6b7280;
            font-weight: 500;
        }
        .col-placa {
            width: 60%;
            font-weight: 600;
            color: #34353A;
            text-align: left;
            padding-left: 8px;
        }
        .col-monto {
            width: 30%;
            font-weight: 600;
            color: #5F8EAD;
            text-align: right;
            padding-right: 8px;
        }
        th.col-numero,
        th.col-placa,
        th.col-monto {
            color: white;
        }
        .total-row {
            background: #e8f4e8;
            font-weight: bold;
        }
        .total-row td {
            border: 2px solid #5D9646;
            font-size: 8px;
        }
        .resumen-final {
            margin-top: 20px;
            padding: 15px;
            background: #e8f4e8;
            border: 3px solid #5D9646;
            text-align: center;
        }
        .resumen-final h3 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #5D9646;
        }
        .resumen-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }
        .resumen-stat {
            padding: 8px;
            background: white;
            border: 1px solid #5F8EAD;
        }
        .resumen-stat label {
            display: block;
            font-size: 7px;
            color: #34353A;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .resumen-stat .value {
            font-size: 10px;
            font-weight: bold;
            color: #5F8EAD;
        }
        .total-final {
            font-size: 16px;
            font-weight: bold;
            color: #5D9646;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #5D9646;
        }
        .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 7px;
            color: #5F8EAD;
            border-top: 2px solid #5D9646;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            ${logoHTML}
        </div>
        <h1>REPORTE DE MANTENIMIENTO</h1>
        <div class="subtitle">Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
    </div>
    ${mesesHTML}
    <div class="resumen-final">
        <h3>RESUMEN GENERAL DEL PERÍODO</h3>
        <div class="resumen-stats">
            <div class="resumen-stat">
                <label>MESES INCLUIDOS</label>
                <div class="value">${mesesValidos.length}</div>
            </div>
            <div class="resumen-stat">
                <label>TOTAL MANTENIMIENTOS</label>
                <div class="value">${mantenimientos.length}</div>
            </div>
            <div class="resumen-stat">
                <label>PROMEDIO/MES</label>
                <div class="value">$${(totalGeneral / mesesValidos.length).toFixed(2)}</div>
            </div>
        </div>
        <div class="total-final">$ ${totalGeneral.toFixed(2)}</div>
    </div>
    <div class="footer">
        <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

        browser = await launchBrowserSafe();

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: false,  // ← CAMBIADO A VERTICAL
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();

        const nombresMeses = mesesValidos.map(m => obtenerNombreMes(m)).join('-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=mantenimiento-${nombresMeses}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF múltiples meses:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// 5. PDF SEMANAL - Reporte por semana del mes
// 5. PDF SEMANAL - Reporte DETALLADO por semana del mes
ReportesRoutes.generarPDFSemanal = async (req, res) => {
    let browser;
    try {
        const { mes, ano, semana } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);
        const semanaNum = parseInt(semana);

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
        const inicioSemana = new Date(anoNum, mesNum - 1, ((semanaNum - 1) * 7) + 1);
        const ultimoDiaMes = new Date(anoNum, mesNum, 0).getDate();
        const finSemana = new Date(anoNum, mesNum - 1, Math.min(semanaNum * 7, ultimoDiaMes));

        // ✅ VERIFICACIÓN PARA HEAD REQUEST
        const mantenimientos = await MantenimientoCamiones.find({
            mes: mesNum,
            ano: anoNum,
            fecha_mantenimiento: {
                $gte: inicioSemana,
                $lte: finSemana
            }
        })
            .populate('ciculatioCard', 'licensePlate')
            .sort({ fecha_mantenimiento: 1, 'ciculatioCard.licensePlate': 1 });

        if (req.method === 'HEAD') {
            if (!mantenimientos || mantenimientos.length === 0) {
                return res.status(404).end();
            }
            return res.status(200).end();
        }

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay mantenimientos para la semana ${semanaNum} de ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Generar tabla DETALLADA (cada mantenimiento una fila)
        let totalGeneral = 0;
        const filasHTML = mantenimientos.map((m, index) => {
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            totalGeneral += total;
            
            return `
                <tr>
                    <td class="col-numero">${index + 1}</td>
                    <td class="col-placa">${m.ciculatioCard.licensePlate}</td>
                    <td class="col-fecha">${new Date(m.fecha_mantenimiento).toLocaleDateString('es-ES')}</td>
                    <td class="col-tipo"><span class="badge badge-${m.tipo_de_mantenimiento}">${m.tipo_de_mantenimiento}</span></td>
                    <td class="col-descripcion">${m.descripcion}</td>
                    <td class="col-monto">$ ${total.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

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
                .header .period {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 5px;
                }
                .info-box {
                    background: #f0f9ff;
                    border: 2px solid #5F8EAD;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .info-box h3 {
                    font-size: 12px;
                    color: #5F8EAD;
                    margin-bottom: 10px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .info-item {
                    font-size: 10px;
                    text-align: center;
                }
                .info-item label {
                    font-weight: bold;
                    color: #34353A;
                    display: block;
                    margin-bottom: 3px;
                }
                .info-item span {
                    color: #5F8EAD;
                    font-size: 14px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: bold;
                    font-size: 10px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 9px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 5%;
                    color: #6b7280;
                    font-weight: 500;
                    text-align: center;
                }
                .col-placa {
                    width: 12%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-fecha {
                    width: 12%;
                    color: #6b7280;
                }
                .col-tipo {
                    width: 15%;
                    text-align: center;
                }
                .col-descripcion {
                    width: 40%;
                    color: #34353A;
                }
                .col-monto {
                    width: 16%;
                    font-weight: 600;
                    color: #5F8EAD;
                    text-align: right;
                }
                th.col-numero,
                th.col-placa,
                th.col-fecha,
                th.col-tipo,
                th.col-descripcion,
                th.col-monto {
                    color: white;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 8px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge-preventivo {
                    background: #5D9646;
                    color: #FFFFFF;
                }
                .badge-correctivo {
                    background: #dc2626;
                    color: #FFFFFF;
                }
                .badge-llantas {
                    background: #d97706;
                    color: #FFFFFF;
                }
                .badge-rines {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-furgo {
                    background: #be123c;
                    color: #FFFFFF;
                }
                .badge-madera_furgo {
                    background: #c2410c;
                    color: #FFFFFF;
                }
                .badge-torno {
                    background: #7c3aed;
                    color: #FFFFFF;
                }
                .badge-bomba {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-reparacion_turbo {
                    background: #991b1b;
                    color: #FFFFFF;
                }
                .badge-otros {
                    background: #4f46e5;
                    color: #FFFFFF;
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
                <h1>MANTENIMIENTO SEMANAL</h1>
                <div class="subtitle">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum} - SEMANA ${semanaNum}</div>
                <div class="period">${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}</div>
            </div>

            <div class="info-box">
                <h3>Resumen de la Semana</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Mantenimientos</label>
                        <span>${mantenimientos.length}</span>
                    </div>
                    <div class="info-item">
                        <label>Vehículos</label>
                        <span>${new Set(mantenimientos.map(m => m.ciculatioCard.licensePlate)).size}</span>
                    </div>
                    <div class="info-item">
                        <label>Días</label>
                        <span>${inicioSemana.getDate()} al ${finSemana.getDate()}</span>
                    </div>
                    <div class="info-item">
                        <label>Promedio</label>
                        <span>$${(totalGeneral / mantenimientos.length).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-placa">PLACA</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-descripcion">DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td colspan="5" style="text-align: left; padding-left: 15px;"><strong>TOTAL TALLER</strong></td>
                        <td class="col-monto"><strong>$ ${totalGeneral.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await launchBrowserSafe();

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=mantenimiento-${obtenerNombreMes(mesNum)}-sem${semanaNum}-${anoNum}.pdf`);
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

ReportesRoutes.generarPDFRangoFechas = async (req, res) => {
    let browser;
    try {
        const { fechaInicio, fechaFin } = req.params;

        // Crear fechas en zona horaria local (NO UTC)
        const [yInicio, mInicio, dInicio] = fechaInicio.split('-');
        const [yFin, mFin, dFin] = fechaFin.split('-');

        const inicio = new Date(parseInt(yInicio), parseInt(mInicio) - 1, parseInt(dInicio), 0, 0, 0, 0);
        const fin = new Date(parseInt(yFin), parseInt(mFin) - 1, parseInt(dFin), 23, 59, 59, 999);

        // ✅ VERIFICACIÓN PARA HEAD REQUEST
        const mantenimientos = await MantenimientoCamiones.find({
            fecha_mantenimiento: {
                $gte: inicio,
                $lte: fin
            }
        })
            .populate('ciculatioCard', 'licensePlate')
            .sort({ fecha_mantenimiento: 1, 'ciculatioCard.licensePlate': 1 });

        if (req.method === 'HEAD') {
            if (!mantenimientos || mantenimientos.length === 0) {
                return res.status(404).end();
            }
            return res.status(200).end();
        }

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay mantenimientos en el rango de fechas seleccionado`
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Calcular días entre fechas
        const diasDiferencia = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;

        // Generar tabla DETALLADA (cada mantenimiento una fila)
        let totalGeneral = 0;
        const filasHTML = mantenimientos.map((m, index) => {
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            totalGeneral += total;
            
            // Ajustar fecha de MongoDB (UTC) a fecha local
            const fechaMongo = new Date(m.fecha_mantenimiento);
            const fechaLocal = new Date(fechaMongo.getTime() - (fechaMongo.getTimezoneOffset() * 60000));
            const year = fechaLocal.getFullYear();
            const month = String(fechaLocal.getMonth() + 1).padStart(2, '0');
            const day = String(fechaLocal.getDate()).padStart(2, '0');
            const fechaFormateada = `${day}/${month}/${year}`;
            
            return `
                <tr>
                    <td class="col-numero">${index + 1}</td>
                    <td class="col-placa">${m.ciculatioCard.licensePlate}</td>
                    <td class="col-fecha">${fechaFormateada}</td>
                    <td class="col-tipo"><span class="badge badge-${m.tipo_de_mantenimiento}">${m.tipo_de_mantenimiento}</span></td>
                    <td class="col-descripcion">${m.descripcion}</td>
                    <td class="col-monto">$ ${total.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

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
                .header .period {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 5px;
                }
                .info-box {
                    background: #f0f9ff;
                    border: 2px solid #5F8EAD;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .info-box h3 {
                    font-size: 12px;
                    color: #5F8EAD;
                    margin-bottom: 10px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .info-item {
                    font-size: 10px;
                    text-align: center;
                }
                .info-item label {
                    font-weight: bold;
                    color: #34353A;
                    display: block;
                    margin-bottom: 3px;
                }
                .info-item span {
                    color: #5F8EAD;
                    font-size: 14px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: bold;
                    font-size: 10px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 9px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 5%;
                    color: #6b7280;
                    font-weight: 500;
                    text-align: center;
                }
                .col-placa {
                    width: 12%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-fecha {
                    width: 12%;
                    color: #6b7280;
                }
                .col-tipo {
                    width: 15%;
                    text-align: center;
                }
                .col-descripcion {
                    width: 40%;
                    color: #34353A;
                }
                .col-monto {
                    width: 16%;
                    font-weight: 600;
                    color: #5F8EAD;
                    text-align: right;
                }
                th.col-numero,
                th.col-placa,
                th.col-fecha,
                th.col-tipo,
                th.col-descripcion,
                th.col-monto {
                    color: white;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 8px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge-preventivo {
                    background: #5D9646;
                    color: #FFFFFF;
                }
                .badge-correctivo {
                    background: #dc2626;
                    color: #FFFFFF;
                }
                .badge-llantas {
                    background: #d97706;
                    color: #FFFFFF;
                }
                .badge-rines {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-furgo {
                    background: #be123c;
                    color: #FFFFFF;
                }
                .badge-madera_furgo {
                    background: #c2410c;
                    color: #FFFFFF;
                }
                .badge-torno {
                    background: #7c3aed;
                    color: #FFFFFF;
                }
                .badge-bomba {
                    background: #5F8EAD;
                    color: #FFFFFF;
                }
                .badge-reparacion_turbo {
                    background: #991b1b;
                    color: #FFFFFF;
                }
                .badge-otros {
                    background: #4f46e5;
                    color: #FFFFFF;
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
                <h1>REPORTE DE MANTENIMIENTO POR RANGO DE FECHAS</h1>
                <div class="subtitle">PERÍODO PERSONALIZADO</div>
                <div class="period">${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}</div>
            </div>

            <div class="info-box">
                <h3>Resumen del Período</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Mantenimientos</label>
                        <span>${mantenimientos.length}</span>
                    </div>
                    <div class="info-item">
                        <label>Vehículos</label>
                        <span>${new Set(mantenimientos.map(m => m.ciculatioCard.licensePlate)).size}</span>
                    </div>
                    <div class="info-item">
                        <label>Días</label>
                        <span>${diasDiferencia}</span>
                    </div>
                    <div class="info-item">
                        <label>Promedio</label>
                        <span>$${(totalGeneral / mantenimientos.length).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-placa">PLACA</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-descripcion">DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td colspan="5" style="text-align: left; padding-left: 15px;"><strong>TOTAL PERÍODO</strong></td>
                        <td class="col-monto"><strong>$ ${totalGeneral.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await launchBrowserSafe();

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=mantenimiento-${fechaInicio}_${fechaFin}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF por rango de fechas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReportesRoutes;