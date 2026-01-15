import puppeteer from 'puppeteer';
import MantenimientoCamiones from '../Models/MantenimientoCamiones.js';
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
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    padding: 0;
                    color: #34353A;
                    background: #FFFFFF;
                }
                .page-wrapper {
                    padding: 50px;
                }
                
                /* HEADER PRINCIPAL */
                .header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 40px 50px;
                    margin: -50px -50px 40px -50px;
                    position: relative;
                    overflow: hidden;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(93, 150, 70, 0.1));
                }
                .header-content {
                    position: relative;
                    z-index: 1;
                }
                .header .logo-container {
                    margin-bottom: 25px;
                }
                .header .logo-container img {
                    max-width: 220px;
                    height: auto;
                    
                }
                .header h1 {
                    color: #FFFFFF;
                    font-size: 34px;
                    margin-bottom: 8px;
                    font-weight: 300;
                    letter-spacing: 2px;
                }
                .header .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    font-weight: 300;
                    letter-spacing: 1px;
                }
                .id-badge {
                    display: inline-block;
                    background: rgba(93, 150, 70, 0.2);
                    border: 1px solid #5D9646;
                    padding: 8px 20px;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #FFFFFF;
                    margin-top: 15px;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 1px;
                }
                
                /* SECCIONES */
                .section {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }
                .section-header {
                    background: #34353A;
                    color: #FFFFFF;
                    padding: 15px 25px;
                    margin-bottom: 20px;
                    border-left: 5px solid #5D9646;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                
                /* GRID DE INFORMACIÓN */
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    background: #FFFFFF;
                }
                .info-item {
                    padding: 20px;
                    border: 1px solid #e5e7eb;
                    background: #FFFFFF;
                }
                .info-item label {
                    display: block;
                    font-weight: 600;
                    color: #5F8EAD;
                    font-size: 11px;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .info-item .value {
                    color: #34353A;
                    font-size: 16px;
                    font-weight: 400;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                
                /* BADGES */
                .badge {
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 3px;
                    font-size: 12px;
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
                
                /* TABLA */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #FFFFFF;
                }
                thead {
                    background: #34353A;
                    color: #FFFFFF;
                }
                th {
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 3px solid #5D9646;
                }
                td {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 14px;
                    color: #34353A;
                }
                tbody tr:hover {
                    background: #f9fafb;
                }
                tbody tr:last-child td {
                    border-bottom: none;
                }
                .text-right {
                    text-align: right;
                }
                
                /* SECCIÓN DE TOTALES */
                .total-section {
                    margin-top: 30px;
                    background: #34353A;
                    padding: 30px;
                    border-top: 5px solid #5D9646;
                }
                .total-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 25px;
                    margin-bottom: 25px;
                }
                .total-item {
                    text-align: center;
                    padding: 20px;
                    background: rgba(95, 142, 173, 0.1);
                    border-radius: 4px;
                }
                .total-item label {
                    display: block;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .total-item .value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #FFFFFF;
                }
                .grand-total {
                    border-top: 2px solid rgba(93, 150, 70, 0.3);
                    padding-top: 25px;
                    text-align: center;
                }
                .grand-total label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .grand-total .amount {
                    font-size: 42px;
                    font-weight: 700;
                    color: #5D9646;
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 3px solid #34353A;
                    text-align: center;
                }
                .footer-content {
                    color: #6b7280;
                    font-size: 11px;
                    line-height: 1.8;
                }
                .footer-content p {
                    margin: 5px 0;
                }
                .timestamp {
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .company-name {
                    font-weight: 600;
                    color: #34353A;
                }
            </style>
        </head>
        <body>
            <div class="page-wrapper">
                <div class="header">
                    <div class="header-content">
                        <div class="logo-container">
                            ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white; font-size: 24px; font-weight: 300;">RIVERA</p>'}
                        </div>
                        <h1>REPORTE DE MANTENIMIENTO</h1>
                        <p class="subtitle">Registro Detallado de Servicio Vehicular</p>
                        <div class="id-badge">ID: ${manto._id}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Información del Vehículo</h2>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nombre del Vehículo</label>
                            <div class="value">${manto.ciculatioCard.name}</div>
                        </div>
                        <div class="info-item">
                            <label>Placas</label>
                            <div class="value">${manto.ciculatioCard.licensePlate}</div>
                        </div>
                        <div class="info-item">
                            <label>Marca</label>
                            <div class="value">${manto.ciculatioCard.brand}</div>
                        </div>
                        <div class="info-item">
                            <label>Modelo</label>
                            <div class="value">${manto.ciculatioCard.model}</div>
                        </div>
                        <div class="info-item">
                            <label>Estado</label>
                            <div class="value">${manto.ciculatioCard.state}</div>
                        </div>
                        <div class="info-item">
                            <label>Año</label>
                            <div class="value">${manto.ciculatioCard.age || 'N/A'}</div>
                        </div>
                        ${manto.ciculatioCard.description ? `
                        <div class="info-item full-width">
                            <label>Descripción</label>
                            <div class="value">${manto.ciculatioCard.description}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Detalles del Mantenimiento</h2>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Fecha de Mantenimiento</label>
                            <div class="value">${new Date(manto.fecha_mantenimiento).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</div>
                        </div>
                        <div class="info-item">
                            <label>Período</label>
                            <div class="value">${obtenerNombreMes(manto.mes)} ${manto.ano}</div>
                        </div>
                        <div class="info-item">
                            <label>Tipo de Mantenimiento</label>
                            <div class="value">
                                <span class="badge badge-${manto.tipo_de_mantenimiento}">
                                    ${manto.tipo_de_mantenimiento}
                                </span>
                            </div>
                        </div>
                        <div class="info-item">
                            <label>Cantidad de Items</label>
                            <div class="value">${manto.detalles.length} ${manto.detalles.length === 1 ? 'item' : 'items'}</div>
                        </div>
                        <div class="info-item full-width">
                            <label>Descripción del Trabajo Realizado</label>
                            <div class="value">${manto.descripcion}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Desglose de Costos</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 8%;">#</th>
                                <th style="width: 42%;">Concepto</th>
                                <th class="text-right" style="width: 15%;">Cantidad</th>
                                <th class="text-right" style="width: 17.5%;">Precio Unit.</th>
                                <th class="text-right" style="width: 17.5%;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${manto.detalles.map((detalle, index) => `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td><strong>${detalle.concepto}</strong></td>
                                    <td class="text-right">${detalle.cantidad}</td>
                                    <td class="text-right">$${detalle.precioUnitario.toFixed(2)}</td>
                                    <td class="text-right"><strong>$${detalle.subTotal.toFixed(2)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-grid">
                            <div class="total-item">
                                <label>Total Items</label>
                                <div class="value">${manto.detalles.length}</div>
                            </div>
                            <div class="total-item">
                                <label>Subtotal</label>
                                <div class="value">$${totalDetalle.toFixed(2)}</div>
                            </div>
                            <div class="total-item">
                                <label>Costo Promedio</label>
                                <div class="value">$${(totalDetalle / manto.detalles.length).toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="grand-total">
                            <label>COSTO TOTAL</label>
                            <div class="amount">$${totalDetalle.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-content">
                        <p class="timestamp">Documento generado el ${new Date().toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                        <p class="company-name">Rivera Distribuidora y Transportes</p>
                        <p>Sistema de Gestión de Mantenimiento Vehicular</p>
                        <p>© ${new Date().getFullYear()} Todos los derechos reservados</p>
                    </div>
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

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

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
                                <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TALLER</strong></td>
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
            : '<div style="color: white; font-size: 24px; font-weight: 300;">RIVERA - Distribuidora y Transportes</div>';

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

        browser = await puppeteer.launch(PUPPETEER_CONFIG);

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Legal',
            landscape: true,
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