/**
 * Controlador para generar reportes PDF de planillas quincenales
 * Estilo similar a ReportesCajaChicaController
 * Colores personalizados: #5F8EAD (azul), #5D9646 (verde), #34353A (gris oscuro)
 */

import puppeteer from 'puppeteer';
import PlanillaQuincenal from '../Models/PlanillaQuincenal.js';
import { isValidObjectId } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';
import { generatePdfFromHtml } from '../Utils/pdfGenerator.js';

const ReportesPlanillasController = {};

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
// Detectar entorno de ejecución
const IS_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Puppeteer config para Cloud Run
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
        serviceName: 'reportes-planilla-quincenal',
        primaryConfig: PUPPETEER_CONFIG()
    });
};

/**
 * Función auxiliar para obtener nombre del mes
 */
const obtenerNombreMes = (mes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
};

/**
 * Formatear fecha a string legible
 */
const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Generar PDF de una planilla quincenal específica
 * GET /api/reportes/planilla/quincenal/:id
 */
ReportesPlanillasController.generarPDFQuincenal = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // 🔥 VALIDAR Y ASEGURAR QUE TOTALES EXISTA
        const totales = planilla.totales || {};
        const safeNumber = (value) => (value || 0).toFixed(2);

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
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 12px;
                    color: #5F8EAD;
                }
                .info-section {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f9fc;
                    border: 2px solid #5F8EAD;
                    border-radius: 5px;
                    font-size: 11px;
                }
                .info-section strong {
                    color: #34353A;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 8px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 6px 3px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 4px 3px;
                    border: 1px solid #5F8EAD;
                    text-align: center;
                }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .employee-name {
                    font-weight: bold;
                    font-size: 7px;
                    color: #34353A;
                }
                .section-header {
                    background: #5F8EAD;
                    color: white;
                    font-weight: bold;
                }
                .totals-row {
                    background: #e8f4e8;
                    font-weight: bold;
                    color: #34353A;
                }
                .totals-row td {
                    border: 2px solid #5D9646;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 9px;
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
                <h1>PLANILLA DE NÓMINA DE SALARIOS</h1>
                <div class="subtitle">${planilla.descripcion || 'Sin descripción'}</div>
                <div class="subtitle">Del ${formatearFecha(planilla.fechaInicio)} al ${formatearFecha(planilla.fechaFin)}</div>
            </div>

            <div class="info-section">
                <strong>Quincena:</strong> ${planilla.quincena === 1 ? 'Primera' : 'Segunda'} - ${obtenerNombreMes(planilla.mes)} ${planilla.año}<br>
                <strong>Estado:</strong> ${(planilla.estado || 'pendiente').toUpperCase()}<br>
                <strong>Total Empleados:</strong> ${planilla.empleados?.length || 0}
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 3%;">#</th>
                        <th rowspan="2" style="width: 15%;">NÓMINA DE LOS EMPLEADOS</th>
                        <th rowspan="2" style="width: 7%;">SALARIO QUINCENAL</th>
                        <th rowspan="2" style="width: 6%;">VIÁTICOS</th>
                        <th rowspan="2" style="width: 7%;">TRABAJO SÁBADO Y DOMINGO</th>
                        <th rowspan="2" style="width: 7%;">TOTAL SALARIO MAS VIÁTICOS</th>
                        <th colspan="3" class="section-header">DESCUENTOS DE LEY</th>
                        <th colspan="3" class="section-header">OTROS DESCUENTOS</th>
                        <th rowspan="2" style="width: 7%; background: #5D9646;"><strong>TOTAL DE DESCUENTOS</strong></th>
                        <th rowspan="2" style="width: 8%; background: #5D9646;"><strong>TOTAL A PAGAR</strong></th>
                    </tr>
                    <tr>
                        <th style="width: 5%;">ISSS 3%</th>
                        <th style="width: 5%;">AFP 7.25%</th>
                        <th style="width: 5%;">RENTA</th>
                        <th style="width: 5%;">ANTICIPOS</th>
                        <th style="width: 5%;">PTMOS</th>
                        <th style="width: 5%;">OTROS DESC.</th>
                    </tr>
                </thead>
                <tbody>
                    ${(planilla.empleados || []).map((emp, index) => {
            const salarioQuincenal = emp.salarioQuincenal || 0;
            const viaticos = emp.viaticos || 0;
            const trabajoSabadoDomingo = emp.trabajoSabadoDomingo || 0;
            const totalSalarioMasViaticos = emp.totalSalarioMasViaticos || 0;
            const isss = emp.descuentosLey?.isss?.monto || 0;
            const afp = emp.descuentosLey?.afp?.monto || 0;
            const renta = emp.descuentosLey?.renta?.monto || 0;
            const anticipos = emp.otrosDescuentos?.anticipos || 0;
            const prestamos = emp.otrosDescuentos?.prestamos || 0;
            const otros = emp.otrosDescuentos?.otros || 0;
            const totalDescuentos = emp.totalDescuentos || 0;
            const totalAPagar = emp.totalAPagar || 0;

            return `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-left employee-name">${emp.nombreCompleto || 'Sin nombre'}</td>
                            <td class="text-right">$ ${salarioQuincenal.toFixed(2)}</td>
                            <td class="text-right">${viaticos > 0 ? '$ ' + viaticos.toFixed(2) : '-'}</td>
                            <td class="text-right">${trabajoSabadoDomingo > 0 ? '$ ' + trabajoSabadoDomingo.toFixed(2) : '-'}</td>
                            <td class="text-right"><strong>$ ${totalSalarioMasViaticos.toFixed(2)}</strong></td>
                            <td class="text-right">$ ${isss.toFixed(2)}</td>
                            <td class="text-right">$ ${afp.toFixed(2)}</td>
                            <td class="text-right">${renta > 0 ? '$ ' + renta.toFixed(2) : '-'}</td>
                            <td class="text-right">${anticipos > 0 ? '$ ' + anticipos.toFixed(2) : '-'}</td>
                            <td class="text-right">${prestamos > 0 ? '$ ' + prestamos.toFixed(2) : '-'}</td>
                            <td class="text-right">${otros > 0 ? '$ ' + otros.toFixed(2) : '-'}</td>
                            <td class="text-right"><strong>$ ${totalDescuentos.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>$ ${totalAPagar.toFixed(2)}</strong></td>
                        </tr>
                        `;
        }).join('')}
                    <tr class="totals-row">
                        <td colspan="2"><strong>TOTAL DE PLANILLA</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalSalariosQuincenales)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalViaticos)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalTrabajoSabadoDomingo)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalSalariosMasViaticos)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalISSS)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalAFP)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalRenta)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalAnticipos)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalPrestamos)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalOtros)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalDescuentos)}</strong></td>
                        <td class="text-right"><strong>$ ${safeNumber(totales.totalAPagar)}</strong></td>
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

        const pdfBuffer = await generatePdfFromHtml(htmlContent, {
            serviceName: 'reportes-planilla-quincenal',
            pdfOptions: { format: 'A4', landscape: true, printBackground: true, margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' } },
            timeoutMs: 45000,
            retries: 2,
            waitUntil: 'networkidle2'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-quincenal-${planilla.quincena}-${planilla.mes}-${planilla.año}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF planilla quincenal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * Generar reporte mensual consolidado de planillas quincenales
 * GET /api/reportes/planilla/quincenal/mensual/:mes/:año
 */
ReportesPlanillasController.generarPDFMensual = async (req, res) => {
    let browser;
    try {
        const { mes, año } = req.params;
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido. Debe estar entre 1 y 12'
            });
        }

        // Buscar todas las planillas quincenales del mes
        const planillas = await PlanillaQuincenal.find({
            año: añoNum,
            mes: mesNum
        }).sort({ quincena: 1 });

        if (planillas.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay planillas para ${obtenerNombreMes(mesNum)} ${añoNum}`
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // 🔥 CALCULAR TOTALES CONSOLIDADOS CON VALIDACIÓN SEGURA
        const totalGeneral = planillas.reduce((sum, p) => sum + (p.totales?.totalAPagar || 0), 0);
        const totalSalarios = planillas.reduce((sum, p) => sum + (p.totales?.totalSalariosQuincenales || 0), 0);
        const totalSalariosMasViaticos = planillas.reduce((sum, p) => sum + (p.totales?.totalSalariosMasViaticos || 0), 0);
        const totalDescuentos = planillas.reduce((sum, p) => sum + (p.totales?.totalDescuentos || 0), 0);
        const totalEmpleados = planillas.reduce((sum, p) => sum + (p.empleados?.length || 0), 0);

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 4px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                }
                .header .logo-container img {
                    max-width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #34353A;
                }
                .section {
                    margin: 30px 0;
                }
                .section h2 {
                    font-size: 16px;
                    background: #5F8EAD;
                    color: white;
                    padding: 10px;
                    margin-bottom: 15px;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 12px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 8px;
                    border: 1px solid #5F8EAD;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .summary {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f5f9fc;
                    border: 3px solid #5D9646;
                    border-radius: 8px;
                }
                .summary h3 {
                    color: #5D9646;
                    margin-bottom: 15px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 14px;
                    color: #34353A;
                }
                .summary-row.total {
                    font-size: 18px;
                    font-weight: bold;
                    border-top: 3px solid #5D9646;
                    margin-top: 15px;
                    padding-top: 15px;
                    color: #5D9646;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 10px;
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
                <h1>REPORTE MENSUAL DE PLANILLAS QUINCENALES</h1>
                <div style="font-size: 14px; color: #5F8EAD;">${obtenerNombreMes(mesNum)} ${añoNum}</div>
            </div>

            ${planillas.map(p => `
            <div class="section">
                <h2>${p.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th class="text-center">Empleados</th>
                            <th class="text-center">Estado</th>
                            <th class="text-right">Total Salarios + Viáticos</th>
                            <th class="text-right">Total Descuentos</th>
                            <th class="text-right">Total a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${p.descripcion || 'Sin descripción'}</td>
                            <td class="text-center">${p.empleados?.length || 0}</td>
                            <td class="text-center">${(p.estado || 'pendiente').toUpperCase()}</td>
                            <td class="text-right">$ ${(p.totales?.totalSalariosMasViaticos || 0).toFixed(2)}</td>
                            <td class="text-right">$ ${(p.totales?.totalDescuentos || 0).toFixed(2)}</td>
                            <td class="text-right"><strong>$ ${(p.totales?.totalAPagar || 0).toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            `).join('')}

            <div class="summary">
                <h3>RESUMEN GENERAL DEL MES</h3>
                <div class="summary-row">
                    <span>Total Planillas Quincenales:</span>
                    <span><strong>${planillas.length}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Empleados Procesados:</span>
                    <span><strong>${totalEmpleados}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Salarios Base:</span>
                    <span>$ ${totalSalarios.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Total Salarios + Viáticos:</span>
                    <span>$ ${totalSalariosMasViaticos.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Total Descuentos:</span>
                    <span>$ ${totalDescuentos.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>INVERSIÓN TOTAL EN PLANILLAS:</span>
                    <span>$ ${totalGeneral.toFixed(2)}</span>
                </div>
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-planillas-${obtenerNombreMes(mesNum)}-${añoNum}.pdf`);
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
// =====================================================
// 3. PDF REPORTE CONSOLIDADO MÚLTIPLES MESES
// =====================================================
ReportesPlanillasController.generarPDFMultiMes = async (req, res) => {
    let browser;
    try {
        const { meses, ano } = req.body;

        // Validaciones
        if (!Array.isArray(meses) || meses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un array de meses'
            });
        }

        if (meses.length > 9) {
            return res.status(400).json({
                success: false,
                message: 'El máximo de meses permitidos es 9'
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

        // Objeto para almacenar datos por mes
        const porMes = {};
        let totalGeneralBruto = 0;
        let totalGeneralDescuentos = 0;
        let totalGeneralLiquido = 0;
        let totalQuincenasConDatos = 0;

        // Procesar cada mes
        for (const mesNum of mesesValidos) {
            const planillas = await PlanillaQuincenal.find({
                mes: mesNum,
                año: anoNum
            }).sort({ quincena: 1 });

            if (planillas && planillas.length > 0) {
                let totalBrutoMes = 0;
                let totalDescuentosMes = 0;
                let totalLiquidoMes = 0;
                let totalEmpleadosMes = 0;

                planillas.forEach(planilla => {
                    totalBrutoMes += planilla.totales?.totalSalariosMasViaticos || 0;
                    totalDescuentosMes += planilla.totales?.totalDescuentos || 0;
                    totalLiquidoMes += planilla.totales?.totalAPagar || 0;
                    totalEmpleadosMes += planilla.empleados?.length || 0;
                });

                totalGeneralBruto += totalBrutoMes;
                totalGeneralDescuentos += totalDescuentosMes;
                totalGeneralLiquido += totalLiquidoMes;
                totalQuincenasConDatos += planillas.length;

                porMes[mesNum] = {
                    nombre: obtenerNombreMes(mesNum),
                    quincenas: planillas.length,
                    empleados: totalEmpleadosMes,
                    totalBruto: totalBrutoMes,
                    totalDescuentos: totalDescuentosMes,
                    totalLiquido: totalLiquidoMes
                };
            }
        }

        // Verificar si hay datos
        if (Object.keys(porMes).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay planillas quincenales para los meses seleccionados'
            });
        }

        // Determinar tipo de reporte
        let tipoReporte = 'CONSOLIDADO';
        if (mesesValidos.length === 3) tipoReporte = 'TRIMESTRAL';
        else if (mesesValidos.length === 6) tipoReporte = 'SEMESTRAL';
        else if (mesesValidos.length === 9) tipoReporte = '9 MESES';

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Generar filas de tabla para cada mes
        const filasHTML = mesesValidos.map(mesNum => {
            const datos = porMes[mesNum];
            if (!datos) return '';

            return `
                <tr>
                    <td class="mes-nombre">${datos.nombre.toUpperCase()}</td>
                    <td class="text-center">${datos.quincenas}</td>
                    <td class="text-center">${datos.empleados}</td>
                    <td class="text-right">$ ${datos.totalBruto.toFixed(2)}</td>
                    <td class="text-right">$ ${datos.totalDescuentos.toFixed(2)}</td>
                    <td class="text-right total-destacado">$ ${datos.totalLiquido.toFixed(2)}</td>
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
                    padding: 30px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 4px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                }
                .header .logo-container img {
                    max-width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 14px;
                    color: #5F8EAD;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 12px 10px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 10px;
                    border: 1px solid #5F8EAD;
                }
                .mes-nombre {
                    font-weight: bold;
                    text-align: left;
                    padding-left: 15px;
                }
                .text-center {
                    text-align: center;
                }
                .text-right {
                    text-align: right;
                    padding-right: 15px;
                }
                .total-destacado {
                    font-weight: bold;
                }
                .totals-row {
                    background: #e8f4e8;
                    font-weight: bold;
                    font-size: 13px;
                }
                .totals-row td {
                    border: 2px solid #5D9646;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
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
                <h1>REPORTE ${tipoReporte} DE PLANILLAS QUINCENALES</h1>
                <div class="subtitle">${mesesValidos.map(m => obtenerNombreMes(m)).join(', ')} ${anoNum}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 20%;">MES</th>
                        <th style="width: 12%;">QUINCENAS</th>
                        <th style="width: 12%;">EMPLEADOS</th>
                        <th style="width: 18%;">TOTAL BRUTO</th>
                        <th style="width: 18%;">DESCUENTOS</th>
                        <th style="width: 20%;">TOTAL A PAGAR</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="totals-row">
                        <td class="text-right" style="padding-right: 15px;"><strong>TOTAL GENERAL:</strong></td>
                        <td class="text-center"><strong>${totalQuincenasConDatos}</strong></td>
                        <td class="text-center"><strong>-</strong></td>
                        <td class="text-right" style="padding-right: 15px;"><strong>$ ${totalGeneralBruto.toFixed(2)}</strong></td>
                        <td class="text-right" style="padding-right: 15px;"><strong>$ ${totalGeneralDescuentos.toFixed(2)}</strong></td>
                        <td class="text-right" style="padding-right: 15px;"><strong>$ ${totalGeneralLiquido.toFixed(2)}</strong></td>
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        const nombresMeses = mesesValidos.map(m => obtenerNombreMes(m)).join('-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="planilla-quincenal-${tipoReporte.toLowerCase().replace(/ /g, '-')}-${anoNum}.pdf"`);
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
// =====================================================
// 4. PDF REPORTE ANUAL CONSOLIDADO
// =====================================================
ReportesPlanillasController.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        // Objeto para almacenar datos de todos los meses
        const porMes = {};
        let totalAnualBruto = 0;
        let totalAnualDescuentos = 0;
        let totalAnualLiquido = 0;
        const empleadosUnicos = new Set();
        let mesesConDatos = 0;
        let totalQuincenasAnual = 0;

        // Variables para máximos y mínimos
        let mesMaxNomina = { mes: '', valor: 0 };
        let mesMinNomina = { mes: '', valor: Infinity };

        // Procesar todos los meses del año
        for (let mesNum = 1; mesNum <= 12; mesNum++) {
            const planillas = await PlanillaQuincenal.find({
                mes: mesNum,
                año: anoNum
            });

            if (planillas && planillas.length > 0) {
                let totalBrutoMes = 0;
                let totalDescuentosMes = 0;
                let totalLiquidoMes = 0;
                let totalEmpleadosMes = 0;

                planillas.forEach(planilla => {
                    // Sumar totales de la planilla
                    totalBrutoMes += planilla.totales?.totalSalariosMasViaticos || 0;
                    totalDescuentosMes += planilla.totales?.totalDescuentos || 0;
                    totalLiquidoMes += planilla.totales?.totalAPagar || 0;

                    // Contar empleados únicos
                    planilla.empleados.forEach(emp => {
                        empleadosUnicos.add(emp.empleadoId.toString());
                        totalEmpleadosMes++;
                    });
                });

                totalAnualBruto += totalBrutoMes;
                totalAnualDescuentos += totalDescuentosMes;
                totalAnualLiquido += totalLiquidoMes;
                mesesConDatos++;
                totalQuincenasAnual += planillas.length;

                // Actualizar máximo y mínimo
                if (totalLiquidoMes > mesMaxNomina.valor) {
                    mesMaxNomina = { mes: obtenerNombreMes(mesNum), valor: totalLiquidoMes };
                }
                if (totalLiquidoMes < mesMinNomina.valor) {
                    mesMinNomina = { mes: obtenerNombreMes(mesNum), valor: totalLiquidoMes };
                }

                porMes[mesNum] = {
                    nombre: obtenerNombreMes(mesNum),
                    quincenas: planillas.length,
                    empleados: totalEmpleadosMes,
                    totalBruto: totalBrutoMes,
                    totalDescuentos: totalDescuentosMes,
                    totalLiquido: totalLiquidoMes
                };
            } else {
                porMes[mesNum] = {
                    nombre: obtenerNombreMes(mesNum),
                    quincenas: 0,
                    empleados: 0,
                    totalBruto: 0,
                    totalDescuentos: 0,
                    totalLiquido: 0
                };
            }
        }

        // Verificar si hay datos
        if (mesesConDatos === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay planillas quincenales registradas para el año ${anoNum}`
            });
        }

        const promedioMensual = totalAnualLiquido / mesesConDatos;

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Generar filas de la tabla para cada mes
        const filasHTML = Object.keys(porMes).map(mesNum => {
            const datos = porMes[mesNum];
            const tieneRegistros = datos.quincenas > 0;

            return `
                <tr style="${!tieneRegistros ? 'opacity: 0.5;' : ''}">
                    <td class="col-mes">${datos.nombre.toUpperCase()}</td>
                    <td class="col-numero">${datos.quincenas}</td>
                    <td class="col-numero">${datos.empleados}</td>
                    <td class="col-monto">$ ${datos.totalBruto.toFixed(2)}</td>
                    <td class="col-monto">$ ${datos.totalDescuentos.toFixed(2)}</td>
                    <td class="col-monto"><strong>$ ${datos.totalLiquido.toFixed(2)}</strong></td>
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
                    margin-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                    padding-bottom: 10px;
                }
                .header .logo-container {
                    margin-bottom: 8px;
                }
                .header .logo-container img {
                    max-width: 160px;
                    height: auto;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 3px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 5px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 12px;
                    padding: 10px;
                    background: #f5f9fc;
                    border: 2px solid #5F8EAD;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .stat-card {
                    text-align: center;
                    padding: 6px;
                    background: #fff;
                    border: 1px solid #5F8EAD;
                }
                .stat-card .label {
                    font-size: 7px;
                    font-weight: bold;
                    color: #34353A;
                    margin-bottom: 3px;
                    text-transform: uppercase;
                }
                .stat-card .value {
                    font-size: 11px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 12px;
                }
                th {
                    background: #34353A;
                    color: #fff;
                    padding: 6px 4px;
                    text-align: center;
                    font-size: 8px;
                    font-weight: bold;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 5px 4px;
                    border: 1px solid #5F8EAD;
                    font-size: 8px;
                    background: #fff;
                }
                .col-mes {
                    width: 100px;
                    text-align: left;
                    padding-left: 10px;
                    font-weight: bold;
                }
                .col-numero {
                    width: 70px;
                    text-align: center;
                }
                .col-monto {
                    text-align: right;
                    padding-right: 10px;
                }
                .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                    font-size: 9px;
                }
                .total-row td {
                    border: 2px solid #5D9646;
                }
                .resumen-final {
                    background: #f5f9fc;
                    padding: 12px;
                    border: 3px solid #5D9646;
                    margin-top: 12px;
                }
                .resumen-final h3 {
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #5D9646;
                    text-transform: uppercase;
                    text-align: center;
                    border-bottom: 2px solid #5D9646;
                    padding-bottom: 6px;
                }
                .resumen-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                .resumen-item {
                    background: #fff;
                    padding: 8px;
                    border: 2px solid #5F8EAD;
                }
                .resumen-item .label {
                    font-size: 8px;
                    font-weight: bold;
                    color: #34353A;
                    margin-bottom: 3px;
                    text-transform: uppercase;
                }
                .resumen-item .value {
                    font-size: 10px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 15px;
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
                <h1>REPORTE ANUAL DE PLANILLAS QUINCENALES</h1>
                <div class="subtitle">${anoNum}</div>
            </div>

            <div class="stats-summary">
                <div class="stat-card">
                    <div class="label">Meses con Datos</div>
                    <div class="value">${mesesConDatos} / 12</div>
                </div>
                <div class="stat-card">
                    <div class="label">Quincenas Procesadas</div>
                    <div class="value">${totalQuincenasAnual}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Empleados Únicos</div>
                    <div class="value">${empleadosUnicos.size}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Promedio Mensual</div>
                    <div class="value">$ ${promedioMensual.toFixed(2)}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-mes">MES</th>
                        <th class="col-numero">QUINCENAS</th>
                        <th class="col-numero">EMPLEADOS</th>
                        <th class="col-monto">TOTAL BRUTO</th>
                        <th class="col-monto">DESCUENTOS</th>
                        <th class="col-monto">TOTAL LÍQUIDO</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td class="col-mes"><strong>TOTAL ANUAL</strong></td>
                        <td class="col-numero"><strong>${totalQuincenasAnual}</strong></td>
                        <td class="col-numero"><strong>-</strong></td>
                        <td class="col-monto"><strong>$ ${totalAnualBruto.toFixed(2)}</strong></td>
                        <td class="col-monto"><strong>$ ${totalAnualDescuentos.toFixed(2)}</strong></td>
                        <td class="col-monto"><strong>$ ${totalAnualLiquido.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="resumen-final">
                <h3>Análisis del Año</h3>
                <div class="resumen-grid">
                    <div class="resumen-item">
                        <div class="label">Total Pagado (Anual)</div>
                        <div class="value">$ ${totalAnualLiquido.toFixed(2)}</div>
                    </div>
                    <div class="resumen-item">
                        <div class="label">Total Descuentos (Anual)</div>
                        <div class="value">$ ${totalAnualDescuentos.toFixed(2)}</div>
                    </div>
                    <div class="resumen-item">
                        <div class="label">Mes Mayor Nómina</div>
                        <div class="value">${mesMaxNomina.mes} ($ ${mesMaxNomina.valor.toFixed(2)})</div>
                    </div>
                    <div class="resumen-item">
                        <div class="label">Mes Menor Nómina</div>
                        <div class="value">${mesMinNomina.mes} ($ ${mesMinNomina.valor.toFixed(2)})</div>
                    </div>
                </div>
            </div>

            <div class="footer-info">
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
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="planilla-quincenal-anual-${anoNum}.pdf"`);
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
export default ReportesPlanillasController;