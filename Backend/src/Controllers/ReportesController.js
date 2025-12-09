import puppeteer from 'puppeteer';
import MantenimientoCamiones from '../Models/MantenimientoCamiones.js';

const ReportesRoutes = {};

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
                    letter-spacing: 1px;
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
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .section-title::before {
                    content: '';
                    width: 8px;
                    height: 8px;
                    background: #2563eb;
                    border-radius: 50%;
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
                    letter-spacing: 0.5px;
                }
                .info-item .value {
                    color: #1e293b;
                    font-size: 15px;
                    font-weight: 500;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .badge {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge-preventivo {
                    background: #dcfce7;
                    color: #166534;
                }
                .badge-correctivo {
                    background: #fee2e2;
                    color: #991b1b;
                }
                .badge-llantas {
                    background: #fef3c7;
                    color: #92400e;
                }
                .badge-rines {
                    background: #dbeafe;
                    color: #1e40af;
                }
                .badge-furgo {
                    background: #fce7f3;
                    color: #831843;
                }
                .badge-madera_furgo {
                    background: #fed7aa;
                    color: #7c2d12;
                }
                .badge-torno {
                    background: #e9d5ff;
                    color: #6b21a8;
                }
                .badge-bomba {
                    background: #bfdbfe;
                    color: #1e3a8a;
                }
                .badge-reparacion_turbo {
                    background: #fecaca;
                    color: #7f1d1d;
                }
                .badge-otros {
                    background: #e0e7ff;
                    color: #3730a3;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
                    letter-spacing: 0.5px;
                }
                td {
                    padding: 15px;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 14px;
                }
                tbody tr:last-child td {
                    border-bottom: none;
                }
                tbody tr:hover {
                    background: #f8fafc;
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
                    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                }
                .total-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .total-item {
                    text-align: center;
                }
                .total-item label {
                    display: block;
                    font-size: 12px;
                    opacity: 0.9;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .total-item .value {
                    font-size: 20px;
                    font-weight: 700;
                }
                .grand-total {
                    border-top: 2px solid rgba(255,255,255,0.3);
                    padding-top: 20px;
                    text-align: center;
                }
                .grand-total label {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .grand-total .amount {
                    font-size: 36px;
                    font-weight: 700;
                }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    color: #64748b;
                    font-size: 11px;
                    border-top: 2px solid #e2e8f0;
                    padding-top: 20px;
                }
                .footer p {
                    margin: 5px 0;
                }
                .timestamp {
                    font-weight: 600;
                    color: #475569;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 Reporte de Mantenimiento</h1>
                    <p class="subtitle">Registro Detallado de Servicio Vehicular</p>
                    <div class="id-badge">ID: ${manto._id}</div>
                </div>

                <div class="section">
                    <h2 class="section-title">🚚 Información del Vehículo</h2>
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
                    <h2 class="section-title">🔧 Detalles del Mantenimiento</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Fecha de Mantenimiento</label>
                            <div class="value">${new Date(manto.fecha_mantenimiento).toLocaleDateString('es-ES', {
                                weekday: 'long',
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
                    <h2 class="section-title">💰 Desglose de Costos</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Concepto</th>
                                <th class="text-right">Cantidad</th>
                                <th class="text-right">Precio Unitario</th>
                                <th class="text-right">Subtotal</th>
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
                            <label>💵 COSTO TOTAL</label>
                            <div class="amount">$${totalDetalle.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p class="timestamp">Documento generado el ${new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p>Sistema de Gestión de Mantenimiento Vehicular</p>
                    <p>© ${new Date().getFullYear()} - Todos los derechos reservados</p>
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
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px'
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
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 30px;
                    color: #1e293b;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                }
                .header h1 {
                    font-size: 32px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .header .subtitle {
                    font-size: 16px;
                    opacity: 0.9;
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
                    display: block;
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .stat-card .value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #2563eb;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                thead {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                }
                th {
                    padding: 12px 10px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                }
                td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 12px;
                }
                tbody tr:hover {
                    background: #f8fafc;
                }
                .text-right {
                    text-align: right;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge-preventivo { background: #dcfce7; color: #166534; }
                .badge-correctivo { background: #fee2e2; color: #991b1b; }
                .badge-llantas { background: #fef3c7; color: #92400e; }
                .badge-rines { background: #dbeafe; color: #1e40af; }
                .badge-furgo { background: #fce7f3; color: #831843; }
                .badge-madera_furgo { background: #fed7aa; color: #7c2d12; }
                .badge-torno { background: #e9d5ff; color: #6b21a8; }
                .badge-bomba { background: #bfdbfe; color: #1e3a8a; }
                .badge-reparacion_turbo { background: #fecaca; color: #7f1d1d; }
                .badge-otros { background: #e0e7ff; color: #3730a3; }
                .summary {
                    margin-top: 30px;
                    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                }
                .summary h3 {
                    font-size: 16px;
                    margin-bottom: 15px;
                    opacity: 0.9;
                }
                .summary .total {
                    font-size: 40px;
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
            <div class="header">
                <h1>📊 REPORTE CONSOLIDADO</h1>
                <p class="subtitle">Todos los Mantenimientos Registrados</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <label>Total Mantenimientos</label>
                    <div class="value">${mantenimientos.length}</div>
                </div>
                <div class="stat-card">
                    <label>Costo Total</label>
                    <div class="value">$${totalGeneral.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <label>Promedio</label>
                    <div class="value">$${promedioMantenimiento.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <label>Tipos Diferentes</label>
                    <div class="value">${Object.keys(porTipo).length}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Fecha</th>
                        <th>Vehículo</th>
                        <th>Placas</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th class="text-right">Items</th>
                        <th class="text-right">Costo Total</th>
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
                                <td>${m.ciculatioCard.licensePlate}</td>
                                <td><span class="badge badge-${m.tipo_de_mantenimiento}">${m.tipo_de_mantenimiento}</span></td>
                                <td>${m.descripcion.substring(0, 40)}${m.descripcion.length > 40 ? '...' : ''}</td>
                                <td class="text-right">${m.detalles.length}</td>
                                <td class="text-right"><strong>$${total.toFixed(2)}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="summary">
                <h3>💰 INVERSIÓN TOTAL EN MANTENIMIENTO</h3>
                <div class="total">$${totalGeneral.toFixed(2)}</div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión de Mantenimiento Vehicular - Reporte Consolidado</p>
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

// 3. PDF REPORTE MENSUAL
export default ReportesRoutes