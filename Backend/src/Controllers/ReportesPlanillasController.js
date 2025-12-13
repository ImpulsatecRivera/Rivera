/**
 * Controlador para generar reportes PDF de planillas
 * Similar a ReportesResumenDiesel pero para planillas de empleados
 */

import puppeteer from 'puppeteer';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import PlanillaQuincenal from '../Models/PlanillaQuincenal.js';
import { isValidObjectId } from 'mongoose';

const ReportesPlanillasController = {};

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

// =============================================
// REPORTES PLANILLA SEMANAL
// =============================================

/**
 * Generar PDF de una planilla semanal específica
 * GET /api/reportes/planilla/semanal/:id
 */
ReportesPlanillasController.generarPDFSemanal = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Generar HTML del reporte
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
                    color: #000;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .header .subtitle {
                    font-size: 14px;
                    color: #333;
                }
                .info-section {
                    margin-bottom: 15px;
                    padding: 12px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 10px;
                }
                th {
                    background: #333;
                    color: white;
                    padding: 8px 4px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #000;
                }
                td {
                    padding: 6px 4px;
                    border: 1px solid #ddd;
                    text-align: center;
                }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .employee-name {
                    font-weight: bold;
                    font-size: 9px;
                }
                .totals-row {
                    background: #f0f0f0;
                    font-weight: bold;
                }
                .summary {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f9f9f9;
                    border: 2px solid #333;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    font-size: 12px;
                }
                .summary-row.total {
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 2px solid #000;
                    margin-top: 10px;
                    padding-top: 10px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PLANILLA SEMANAL</h1>
                <div class="subtitle">${planilla.descripcion}</div>
                <div class="subtitle">Semana #${planilla.numeroSemana} - ${obtenerNombreMes(planilla.mes)} ${planilla.año}</div>
            </div>

            <div class="info-section">
                <strong>Período:</strong> ${formatearFecha(planilla.fechaInicio)} al ${formatearFecha(planilla.fechaFin)}<br>
                <strong>Estado:</strong> ${planilla.estado.toUpperCase()}<br>
                ${planilla.notas ? `<strong>Notas:</strong> ${planilla.notas}<br>` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 20%;">Nombre</th>
                        ${planilla.empleados[0]?.registrosDiarios.map(r => 
                            `<th style="width: 6%;">${formatearFecha(r.fecha).split('/')[0]}/${formatearFecha(r.fecha).split('/')[1]}</th>`
                        ).join('')}
                        <th style="width: 8%;">Total Base</th>
                        <th style="width: 8%;">Total Viáticos</th>
                        <th style="width: 7%;">Anticipos</th>
                        <th style="width: 7%;">Descuentos</th>
                        <th style="width: 8%;"><strong>Total a Pagar</strong></th>
                    </tr>
                </thead>
                <tbody>
                    ${planilla.empleados.map((emp, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-left employee-name">${emp.nombreCompleto}</td>
                            ${emp.registrosDiarios.map(r => 
                                `<td>$${(r.base || 0).toFixed(2)}<br><small style="color: #666;">V: $${(r.viaticos || 0).toFixed(2)}</small></td>`
                            ).join('')}
                            <td class="text-right"><strong>$${emp.totalBase.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>$${emp.totalViaticos.toFixed(2)}</strong></td>
                            <td class="text-right">$${emp.anticipos.toFixed(2)}</td>
                            <td class="text-right">$${emp.descuentos.toFixed(2)}</td>
                            <td class="text-right"><strong>$${emp.totalAPagar.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                    <tr class="totals-row">
                        <td colspan="2"><strong>TOTALES</strong></td>
                        ${Array(planilla.empleados[0]?.registrosDiarios.length || 0).fill(0).map(() => '<td></td>').join('')}
                        <td class="text-right"><strong>$${planilla.totales.totalBase.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalViaticos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalAnticipos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalDescuentos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalGeneral.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="summary">
                <h3 style="margin-bottom: 10px;">RESUMEN GENERAL</h3>
                <div class="summary-row">
                    <span>Total Base:</span>
                    <span><strong>$${planilla.totales.totalBase.toFixed(2)}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Viáticos:</span>
                    <span><strong>$${planilla.totales.totalViaticos.toFixed(2)}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span><strong>$${(planilla.totales.totalBase + planilla.totales.totalViaticos).toFixed(2)}</strong></span>
                </div>
                <div class="summary-row">
                    <span>(-) Anticipos:</span>
                    <span>$${planilla.totales.totalAnticipos.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>(-) Descuentos:</span>
                    <span>$${planilla.totales.totalDescuentos.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>TOTAL A PAGAR:</span>
                    <span>$${planilla.totales.totalGeneral.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión de Planillas - Rivera Transportes</p>
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
        res.setHeader('Content-Disposition', `attachment; filename=planilla-semanal-${planilla.numeroSemana}-${planilla.mes}-${planilla.año}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF planilla semanal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// =============================================
// REPORTES PLANILLA QUINCENAL
// =============================================

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
                    color: #000;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .header .subtitle {
                    font-size: 14px;
                    color: #333;
                }
                .info-section {
                    margin-bottom: 15px;
                    padding: 12px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 9px;
                }
                th {
                    background: #333;
                    color: white;
                    padding: 6px 3px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #000;
                }
                td {
                    padding: 5px 3px;
                    border: 1px solid #ddd;
                    text-align: center;
                }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .employee-name {
                    font-weight: bold;
                    font-size: 8px;
                }
                .section-header {
                    background: #666;
                    color: white;
                    font-weight: bold;
                }
                .totals-row {
                    background: #f0f0f0;
                    font-weight: bold;
                }
                .summary {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f9f9f9;
                    border: 2px solid #333;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    font-size: 12px;
                }
                .summary-row.total {
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 2px solid #000;
                    margin-top: 10px;
                    padding-top: 10px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PLANILLA DE NÓMINA DE SALARIOS</h1>
                <div class="subtitle">${planilla.descripcion}</div>
                <div class="subtitle">${formatearFecha(planilla.fechaInicio)} al ${formatearFecha(planilla.fechaFin)}</div>
            </div>

            <div class="info-section">
                <strong>Quincena:</strong> ${planilla.quincena === 1 ? 'Primera' : 'Segunda'} - ${obtenerNombreMes(planilla.mes)} ${planilla.año}<br>
                <strong>Estado:</strong> ${planilla.estado.toUpperCase()}<br>
                ${planilla.notas ? `<strong>Notas:</strong> ${planilla.notas}<br>` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 3%;">#</th>
                        <th rowspan="2" style="width: 15%;">Nombre del Empleado</th>
                        <th rowspan="2" style="width: 7%;">Salario Quincenal</th>
                        <th rowspan="2" style="width: 6%;">Viáticos</th>
                        <th rowspan="2" style="width: 7%;">Trabajo Sáb/Dom</th>
                        <th rowspan="2" style="width: 7%;">Total Salario + Viáticos</th>
                        <th colspan="3" class="section-header">Descuentos de Ley</th>
                        <th colspan="4" class="section-header">Otros Descuentos</th>
                        <th rowspan="2" style="width: 7%;"><strong>Total Descuentos</strong></th>
                        <th rowspan="2" style="width: 8%;"><strong>Total a Pagar</strong></th>
                    </tr>
                    <tr>
                        <th style="width: 5%;">ISSS 3%</th>
                        <th style="width: 5%;">AFP 7.25%</th>
                        <th style="width: 5%;">Renta</th>
                        <th style="width: 5%;">Anticipos</th>
                        <th style="width: 5%;">Préstamos</th>
                        <th style="width: 5%;">Camisas</th>
                        <th style="width: 5%;">Otros</th>
                    </tr>
                </thead>
                <tbody>
                    ${planilla.empleados.map((emp, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-left employee-name">${emp.nombreCompleto}</td>
                            <td class="text-right">$${emp.salarioQuincenal.toFixed(2)}</td>
                            <td class="text-right">$${emp.viaticos.toFixed(2)}</td>
                            <td class="text-right">$${emp.trabajoSabadoDomingo.toFixed(2)}</td>
                            <td class="text-right"><strong>$${emp.totalSalarioMasViaticos.toFixed(2)}</strong></td>
                            <td class="text-right">$${emp.descuentosLey.isss.monto.toFixed(2)}</td>
                            <td class="text-right">$${emp.descuentosLey.afp.monto.toFixed(2)}</td>
                            <td class="text-right">$${emp.descuentosLey.renta.monto.toFixed(2)}</td>
                            <td class="text-right">$${emp.otrosDescuentos.anticipos.toFixed(2)}</td>
                            <td class="text-right">$${emp.otrosDescuentos.prestamos.toFixed(2)}</td>
                            <td class="text-right">$${emp.otrosDescuentos.camisas.toFixed(2)}</td>
                            <td class="text-right">$${emp.otrosDescuentos.otros.toFixed(2)}</td>
                            <td class="text-right"><strong>$${emp.totalDescuentos.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>$${emp.totalAPagar.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                    <tr class="totals-row">
                        <td colspan="2"><strong>TOTAL DE PLANILLA</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalSalariosQuincenales.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalViaticos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalTrabajoExtra.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalSalarioMasViaticos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalISSS.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalAFP.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalRenta.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalAnticipos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalPrestamos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalCamisas.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalOtrosDescuentos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalDescuentos.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>$${planilla.totales.totalAPagar.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="summary">
                <h3 style="margin-bottom: 10px;">RESUMEN DE PLANILLA</h3>
                <div class="summary-row">
                    <span>Total Empleados:</span>
                    <span><strong>${planilla.empleados.length}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Salarios Quincenales:</span>
                    <span><strong>$${planilla.totales.totalSalariosQuincenales.toFixed(2)}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Viáticos:</span>
                    <span><strong>$${planilla.totales.totalViaticos.toFixed(2)}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Descuentos de Ley:</span>
                    <span>$${(planilla.totales.totalISSS + planilla.totales.totalAFP + planilla.totales.totalRenta).toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Total Otros Descuentos:</span>
                    <span>$${(planilla.totales.totalAnticipos + planilla.totales.totalPrestamos + planilla.totales.totalCamisas + planilla.totales.totalOtrosDescuentos).toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>TOTAL A PAGAR:</span>
                    <span>$${planilla.totales.totalAPagar.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión de Planillas - Rivera Transportes</p>
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
 * Generar reporte mensual consolidado de planillas (semanales + quincenales)
 * GET /api/reportes/planilla/mensual/:mes/:año
 */
ReportesPlanillasController.generarPDFMensual = async (req, res) => {
    let browser;
    try {
        const { mes, año } = req.params;
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);

        // Buscar todas las planillas del mes
        const planillasSemanales = await PlanillaSemanal.find({
            año: añoNum,
            mes: mesNum
        }).sort({ numeroSemana: 1 });

        const planillasQuincenales = await PlanillaQuincenal.find({
            año: añoNum,
            mes: mesNum
        }).sort({ quincena: 1 });

        if (planillasSemanales.length === 0 && planillasQuincenales.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay planillas para ${obtenerNombreMes(mesNum)} ${añoNum}`
            });
        }

        // Calcular totales consolidados
        const totalSemanales = planillasSemanales.reduce((sum, p) => sum + p.totales.totalGeneral, 0);
        const totalQuincenales = planillasQuincenales.reduce((sum, p) => sum + p.totales.totalAPagar, 0);
        const totalGeneral = totalSemanales + totalQuincenales;

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
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #000;
                }
                .header h1 {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .section {
                    margin: 30px 0;
                }
                .section h2 {
                    font-size: 16px;
                    background: #333;
                    color: white;
                    padding: 10px;
                    margin-bottom: 15px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 12px;
                }
                th {
                    background: #666;
                    color: white;
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #000;
                }
                td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .summary {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f0f0f0;
                    border: 3px solid #000;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 14px;
                }
                .summary-row.total {
                    font-size: 18px;
                    font-weight: bold;
                    border-top: 2px solid #000;
                    margin-top: 15px;
                    padding-top: 15px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>REPORTE MENSUAL DE PLANILLAS</h1>
                <div>${obtenerNombreMes(mesNum)} ${añoNum}</div>
            </div>

            ${planillasSemanales.length > 0 ? `
            <div class="section">
                <h2>📋 PLANILLAS SEMANALES</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Descripción</th>
                            <th>Empleados</th>
                            <th class="text-center">Estado</th>
                            <th class="text-right">Total Base</th>
                            <th class="text-right">Total Viáticos</th>
                            <th class="text-right">Total a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${planillasSemanales.map(p => `
                            <tr>
                                <td>Semana #${p.numeroSemana}</td>
                                <td>${p.descripcion}</td>
                                <td class="text-center">${p.empleados.length}</td>
                                <td class="text-center">${p.estado.toUpperCase()}</td>
                                <td class="text-right">$${p.totales.totalBase.toFixed(2)}</td>
                                <td class="text-right">$${p.totales.totalViaticos.toFixed(2)}</td>
                                <td class="text-right"><strong>$${p.totales.totalGeneral.toFixed(2)}</strong></td>
                            </tr>
                        `).join('')}
                        <tr style="background: #f0f0f0; font-weight: bold;">
                            <td colspan="6" class="text-right">SUBTOTAL SEMANALES:</td>
                            <td class="text-right">$${totalSemanales.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${planillasQuincenales.length > 0 ? `
            <div class="section">
                <h2>📋 PLANILLAS QUINCENALES</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Quincena</th>
                            <th>Descripción</th>
                            <th>Empleados</th>
                            <th class="text-center">Estado</th>
                            <th class="text-right">Total Salarios</th>
                            <th class="text-right">Total Descuentos</th>
                            <th class="text-right">Total a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${planillasQuincenales.map(p => `
                            <tr>
                                <td>${p.quincena === 1 ? 'Primera' : 'Segunda'} Quincena</td>
                                <td>${p.descripcion}</td>
                                <td class="text-center">${p.empleados.length}</td>
                                <td class="text-center">${p.estado.toUpperCase()}</td>
                                <td class="text-right">$${p.totales.totalSalarioMasViaticos.toFixed(2)}</td>
                                <td class="text-right">$${p.totales.totalDescuentos.toFixed(2)}</td>
                                <td class="text-right"><strong>$${p.totales.totalAPagar.toFixed(2)}</strong></td>
                            </tr>
                        `).join('')}
                        <tr style="background: #f0f0f0; font-weight: bold;">
                            <td colspan="6" class="text-right">SUBTOTAL QUINCENALES:</td>
                            <td class="text-right">$${totalQuincenales.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="summary">
                <h3 style="margin-bottom: 15px;">💰 RESUMEN GENERAL DEL MES</h3>
                <div class="summary-row">
                    <span>Total Planillas Semanales:</span>
                    <span><strong>${planillasSemanales.length}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Total Planillas Quincenales:</span>
                    <span><strong>${planillasQuincenales.length}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Monto Planillas Semanales:</span>
                    <span>$${totalSemanales.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Monto Planillas Quincenales:</span>
                    <span>$${totalQuincenales.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>INVERSIÓN TOTAL EN PLANILLAS:</span>
                    <span>$${totalGeneral.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión de Planillas - Rivera Transportes</p>
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