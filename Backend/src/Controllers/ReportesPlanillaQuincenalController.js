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
                <h2>📋 ${p.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA</h2>
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
                <h3>💰 RESUMEN GENERAL DEL MES</h3>
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

export default ReportesPlanillasController;