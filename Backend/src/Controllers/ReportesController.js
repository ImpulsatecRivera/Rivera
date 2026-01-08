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

// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
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

// 2. PDF CONSOLIDADO - Todos los mantenimientos
ReportesRoutes.generarPDFTodosMantenimientos = async (req, res) => {
    let browser;
    try {
        const mantenimientos = await MantenimientoCamiones.find()
            .populate('ciculatioCard', 'name licensePlate brand model')
            .sort({ fecha_mantenimiento: -1 });

        if (!mantenimientos || mantenimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay mantenimientos registrados'
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Calcular estadísticas generales
        const totalGeneral = mantenimientos.reduce((sum, m) => {
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            return sum + total;
        }, 0);

        const promedioMantenimiento = totalGeneral / mantenimientos.length;

        // Contar por tipo
        const porTipo = mantenimientos.reduce((acc, m) => {
            acc[m.tipo_de_mantenimiento] = (acc[m.tipo_de_mantenimiento] || 0) + 1;
            return acc;
        }, {});

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
                    padding: 40px;
                }
                
                /* HEADER */
                .header {
                    background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
                    padding: 40px 50px;
                    margin: -40px -40px 40px -40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .header::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: #5D9646;
                }
                .header .logo-container {
                    margin-bottom: 20px;
                }
                .header .logo-container img {
                    max-width: 200px;
                    height: auto;
                   
                }
                .header h1 {
                    color: #FFFFFF;
                    font-size: 32px;
                    font-weight: 300;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .header .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    font-weight: 300;
                    letter-spacing: 1px;
                }
                
                /* STATS GRID */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .stat-card {
                    background: #FFFFFF;
                    padding: 25px;
                    border: 2px solid #e5e7eb;
                    border-left: 5px solid #5F8EAD;
                    text-align: center;
                    transition: all 0.3s;
                }
                .stat-card:nth-child(2) {
                    border-left-color: #5D9646;
                }
                .stat-card:nth-child(3) {
                    border-left-color: #34353A;
                }
                .stat-card:nth-child(4) {
                    border-left-color: #5F8EAD;
                }
                .stat-card label {
                    display: block;
                    font-size: 11px;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .stat-card .value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #34353A;
                }
                
                /* TABLA */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #FFFFFF;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                thead {
                    background: #34353A;
                    color: #FFFFFF;
                }
                th {
                    padding: 16px 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 3px solid #5D9646;
                }
                td {
                    padding: 14px 12px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 12px;
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
                
                /* BADGES */
                .badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge-preventivo { background: #5D9646; color: #FFFFFF; }
                .badge-correctivo { background: #dc2626; color: #FFFFFF; }
                .badge-llantas { background: #d97706; color: #FFFFFF; }
                .badge-rines { background: #5F8EAD; color: #FFFFFF; }
                .badge-furgo { background: #be123c; color: #FFFFFF; }
                .badge-madera_furgo { background: #c2410c; color: #FFFFFF; }
                .badge-torno { background: #7c3aed; color: #FFFFFF; }
                .badge-bomba { background: #5F8EAD; color: #FFFFFF; }
                .badge-reparacion_turbo { background: #991b1b; color: #FFFFFF; }
                .badge-otros { background: #4f46e5; color: #FFFFFF; }
                
                /* SUMMARY */
                .summary {
                    margin-top: 40px;
                    background: #34353A;
                    padding: 35px;
                    text-align: center;
                    border-top: 5px solid #5D9646;
                }
                .summary h3 {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 15px;
                }
                .summary .total {
                    font-size: 48px;
                    font-weight: 700;
                    color: #5D9646;
                }
                
                /* FOOTER */
                .footer {
                    margin-top: 50px;
                    padding-top: 25px;
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
                    <h1>REPORTE CONSOLIDADO</h1>
                    <p class="subtitle">Historial Completo de Mantenimientos</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <label>Total Mantenimientos</label>
                        <div class="value">${mantenimientos.length}</div>
                    </div>
                    <div class="stat-card">
                        <label>Inversión Total</label>
                        <div class="value">$${totalGeneral.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <label>Costo Promedio</label>
                        <div class="value">$${promedioMantenimiento.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <label>Tipos de Servicio</label>
                        <div class="value">${Object.keys(porTipo).length}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 12%;">Fecha</th>
                            <th style="width: 18%;">Vehículo</th>
                            <th style="width: 12%;">Placas</th>
                            <th style="width: 15%;">Tipo</th>
                            <th style="width: 23%;">Descripción</th>
                            <th class="text-right" style="width: 8%;">Items</th>
                            <th class="text-right" style="width: 12%;">Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mantenimientos.map((m, index) => {
                            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
                            return `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td>${new Date(m.fecha_mantenimiento).toLocaleDateString('es-ES')}</td>
                                    <td>${m.ciculatioCard.name}</td>
                                    <td><strong>${m.ciculatioCard.licensePlate}</strong></td>
                                    <td><span class="badge badge-${m.tipo_de_mantenimiento}">${m.tipo_de_mantenimiento}</span></td>
                                    <td>${m.descripcion.substring(0, 35)}${m.descripcion.length > 35 ? '...' : ''}</td>
                                    <td class="text-right">${m.detalles.length}</td>
                                    <td class="text-right"><strong>$${total.toFixed(2)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="summary">
                    <h3>Inversión Total en Mantenimiento</h3>
                    <div class="total">$${totalGeneral.toFixed(2)}</div>
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                    <p>Sistema de Gestión de Mantenimiento Vehicular</p>
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
            landscape: true,
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-todos-mantenimientos-${Date.now()}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF consolidado:', error);
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

        // Buscar mantenimientos del mes
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

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Agrupar por placa y sumar totales
        const porPlaca = {};
        mantenimientos.forEach(m => {
            const placa = m.ciculatioCard.licensePlate;
            const total = m.detalles.reduce((s, d) => s + d.subTotal, 0);
            
            if (!porPlaca[placa]) {
                porPlaca[placa] = 0;
            }
            porPlaca[placa] += total;
        });

        // Convertir a array y ordenar
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
                    position: relative;
                    border-bottom: 5px solid #5D9646;
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
                    font-size: 28px;
                    font-weight: 300;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 5px;
                }
                .header .period {
                    color: #5D9646;
                    font-size: 24px;
                    font-weight: 600;
                    margin-top: 15px;
                    letter-spacing: 2px;
                }
                
                /* TABLA */
                .table-container {
                    max-width: 700px;
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
                    width: 15%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 45%;
                    font-weight: 600;
                    color: #34353A;
                    letter-spacing: 1px;
                }
                .col-monto {
                    width: 40%;
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
                .total-row .col-monto {
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
                    <h1>Mantenimiento por Camión</h1>
                    <div class="period">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
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
                                <td colspan="2">TOTAL</td>
                                <td class="col-monto">$ ${totalGeneral.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p class="company">Rivera Distribuidora y Transportes</p>
                    <p>Sistema de Gestión de Mantenimiento Vehicular</p>
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

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        
        // VERIFICACIÓN
        console.log('🖼️ Logo para múltiples meses:', !!logoBase64);

        // Agrupar por mes
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

        // Generar HTML para cada mes
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
                                <td colspan="2">TOTAL</td>
                                <td class="col-monto">$ ${totalMes.toFixed(2)}</td>
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

        // Preparar el logo para insertar directamente
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
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 0;
            color: #34353A;
            background: #FFFFFF;
        }
        .page-wrapper {
            padding: 40px;
        }
        .main-header {
            background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
            padding: 40px;
            margin: -40px -40px 50px -40px;
            text-align: center;
            border-bottom: 5px solid #5D9646;
            position: relative;
            overflow: hidden;
        }
        .main-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(93, 150, 70, 0.1));
        }
        .main-header .logo-container {
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }
        .main-header .logo-container img {
            max-width: 220px;
            max-height: 100px;
            height: auto;
            width: auto;
            display: inline-block;
            filter: brightness(0) invert(1);
        }
        .main-header h1 {
            color: #FFFFFF;
            font-size: 30px;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        .main-header .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            margin-top: 10px;
            letter-spacing: 1px;
            position: relative;
            z-index: 1;
        }
        .mes-section {
            margin-bottom: 60px;
            page-break-inside: avoid;
        }
        .mes-header {
            background: #5F8EAD;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
            border-left: 5px solid #5D9646;
        }
        .mes-header h2 {
            color: #FFFFFF;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 2px;
        }
        table {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            border-collapse: collapse;
            background: #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        thead {
            background: #34353A;
            color: #FFFFFF;
        }
        th {
            padding: 16px;
            text-align: center;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 3px solid #5D9646;
        }
        td {
            padding: 14px 16px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }
        tbody tr:hover {
            background: #f9fafb;
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
            letter-spacing: 1px;
        }
        .col-monto {
            width: 40%;
            text-align: right;
            font-weight: 600;
            color: #5F8EAD;
        }
        .total-row {
            background: #34353A;
            color: #FFFFFF;
            font-weight: 700;
            font-size: 16px;
        }
        .total-row td {
            padding: 18px 16px;
            border-bottom: none;
        }
        .total-row .col-monto {
            color: #5D9646;
            font-size: 18px;
        }
        .resumen-final {
            margin-top: 50px;
            padding: 35px;
            background: #34353A;
            border-top: 5px solid #5D9646;
            text-align: center;
            page-break-inside: avoid;
            color: #FFFFFF;
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
            gap: 25px;
            margin-bottom: 25px;
        }
        .resumen-stat {
            padding: 15px;
            background: rgba(95, 142, 173, 0.1);
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
            font-size: 40px;
            font-weight: 700;
            color: #5D9646;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid rgba(93, 150, 70, 0.3);
        }
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
        <div class="main-header">
            <div class="logo-container">
                ${logoHTML}
            </div>
            <h1>Reporte de Mantenimiento</h1>
            <div class="subtitle">Período: ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
        </div>
        ${mesesHTML}
        <div class="resumen-final">
            <h3>Resumen General del Período</h3>
            <div class="resumen-stats">
                <div class="resumen-stat">
                    <label>Meses Incluidos</label>
                    <div class="value">${mesesValidos.length}</div>
                </div>
                <div class="resumen-stat">
                    <label>Total Mantenimientos</label>
                    <div class="value">${mantenimientos.length}</div>
                </div>
                <div class="resumen-stat">
                    <label>Promedio/Mes</label>
                    <div class="value">$${(totalGeneral / mesesValidos.length).toFixed(2)}</div>
                </div>
            </div>
            <div class="total-final">$ ${totalGeneral.toFixed(2)}</div>
        </div>
        <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
            <p class="company">Rivera Distribuidora y Transportes</p>
            <p>Sistema de Gestión de Mantenimiento Vehicular</p>
        </div>
    </div>
</body>
</html>`;

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

export default ReportesRoutes;