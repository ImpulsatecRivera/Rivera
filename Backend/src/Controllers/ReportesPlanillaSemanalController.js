import puppeteer from 'puppeteer';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import { isValidObjectId } from 'mongoose';

const ReportesPlanillaSemanalController = {};

/**
 * Función auxiliar para redondear dinero
 */
const redondearDinero = (valor) => {
    return Math.round(valor * 100) / 100;
};

/**
 * Formatear fecha en español
 */
const formatearFecha = (fecha) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const f = new Date(fecha);
    return `${f.getDate()} de ${meses[f.getMonth()]} ${f.getFullYear()}`;
};

/**
 * Formatear rango de fechas
 */
const formatearRangoFechas = (inicio, fin) => {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    
    return `DEL ${fechaInicio.getDate()} AL ${fechaFin.getDate()} DE ${meses[fechaInicio.getMonth()]} ${fechaInicio.getFullYear()}`;
};

/**
 * GET /api/reportes/planilla-semanal/semanal-detallado/:id
 * Generar PDF de planilla semanal detallada (día por día como imagen 1)
 */
ReportesPlanillaSemanalController.generarPDFSemanalDetallado = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Generar HTML para el PDF
        const html = generarHTMLSemanalDetallado(planilla);

        // Generar PDF con Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Legal',
            landscape: true,
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();

        // Enviar PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-semanal-${formatearFecha(planilla.fechaInicio)}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF semanal detallado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

/**
 * GET /api/reportes/planilla-semanal/mensual/:mes/:ano
 * Generar PDF mensual consolidado (estilo imagen 2)
 */
ReportesPlanillaSemanalController.generarPDFMensual = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;

        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido (debe ser entre 1 y 12)'
            });
        }

        // Buscar todas las planillas del mes
        const planillas = await PlanillaSemanal.find({
            fechaInicio: {
                $gte: new Date(anoNum, mesNum - 1, 1),
                $lt: new Date(anoNum, mesNum, 1)
            }
        }).sort({ fechaInicio: 1 });

        if (!planillas || planillas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron planillas para este mes'
            });
        }

        // Generar HTML
        const html = generarHTMLMensual(planillas, mesNum, anoNum);

        // Generar PDF
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: false,
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });

        await browser.close();

        const nombreMes = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][mesNum - 1];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-extra-${nombreMes}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte mensual',
            error: error.message
        });
    }
};

/**
 * POST /api/reportes/planilla-semanal/multi-mes
 * Generar PDF consolidado de múltiples meses (trimestral, semestral, 9 meses)
 * 
 * Body: {
 *   "meses": [1, 2, 3],  // Array de meses (1-12), máximo 9
 *   "ano": 2025
 * }
 */
ReportesPlanillaSemanalController.generarPDFMultiMes = async (req, res) => {
    let browser;
    try {
        const { meses, ano } = req.body;

        if (!Array.isArray(meses) || meses.length === 0 || meses.length > 9) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar entre 1 y 9 meses'
            });
        }

        // Validar que todos sean números válidos
        const mesesValidos = meses.every(m => m >= 1 && m <= 12);
        if (!mesesValidos) {
            return res.status(400).json({
                success: false,
                message: 'Todos los meses deben estar entre 1 y 12'
            });
        }

        const anoNum = parseInt(ano);
        const planillasPorMes = [];

        // Obtener planillas de cada mes
        for (const mes of meses) {
            const planillas = await PlanillaSemanal.find({
                fechaInicio: {
                    $gte: new Date(anoNum, mes - 1, 1),
                    $lt: new Date(anoNum, mes, 1)
                }
            }).sort({ fechaInicio: 1 });

            if (planillas.length > 0) {
                planillasPorMes.push({
                    mes,
                    planillas
                });
            }
        }

        if (planillasPorMes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron planillas para los meses seleccionados'
            });
        }

        // Generar HTML
        const html = generarHTMLMultiMes(planillasPorMes, anoNum);

        // Generar PDF
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: false,
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });

        await browser.close();

        const periodo = meses.length === 3 ? 'trimestre' :
                       meses.length === 6 ? 'semestre' :
                       meses.length === 9 ? '9-meses' : `${meses.length}-meses`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-consolidado-${periodo}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF multi-mes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

/**
 * GET /api/reportes/planilla-semanal/anual/:ano
 * Generar PDF anual consolidado (todos los meses del año)
 */
ReportesPlanillaSemanalController.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        const planillasPorMes = [];

        // Obtener planillas de cada mes del año
        for (let mes = 1; mes <= 12; mes++) {
            const planillas = await PlanillaSemanal.find({
                fechaInicio: {
                    $gte: new Date(anoNum, mes - 1, 1),
                    $lt: new Date(anoNum, mes, 1)
                }
            }).sort({ fechaInicio: 1 });

            if (planillas.length > 0) {
                planillasPorMes.push({
                    mes,
                    planillas
                });
            }
        }

        if (planillasPorMes.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontraron planillas para el año ${anoNum}`
            });
        }

        // Generar HTML
        const html = generarHTMLAnual(planillasPorMes, anoNum);

        // Generar PDF
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: false,
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-anual-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF anual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte anual',
            error: error.message
        });
    }
};

// ============================================
// FUNCIONES AUXILIARES PARA GENERAR HTML
// ============================================

/**
 * Generar HTML para reporte semanal detallado (imagen 1)
 */
function generarHTMLSemanalDetallado(planilla) {
    const titulo = `PLANILLA SEMANAL, VIÁTICOS Y ANTICIPO ${formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin)}`;
    
    // Obtener fechas de cada día
    const diasFechas = {};
    if (planilla.empleados.length > 0 && planilla.empleados[0].dias.length > 0) {
        planilla.empleados[0].dias.forEach(d => {
            const fecha = new Date(d.fecha);
            diasFechas[d.dia] = fecha.getDate();
        });
    }

    // Construir filas de empleados
    let filasEmpleados = '';
    let numeroEmpleado = 1;

    planilla.empleados.forEach(emp => {
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        
        // Crear objeto con datos de cada día
        const datosDias = {};
        emp.dias.forEach(d => {
            datosDias[d.dia] = d;
        });

        filasEmpleados += `
            <tr>
                <td>${numeroEmpleado}</td>
                <td style="text-align: left;">${emp.nombreCompleto}</td>
        `;

        // Columnas para cada día (BASE y VIÁTICOS)
        dias.forEach(dia => {
            const dato = datosDias[dia] || { base: 0, viaticos: 0 };
            const base = dato.base || 0;
            const viaticos = dato.viaticos || 0;

            filasEmpleados += `
                <td>$ ${base > 0 ? base.toFixed(2) : '-'}</td>
                <td>$ ${viaticos > 0 ? viaticos.toFixed(2) : '-'}</td>
            `;
        });

        // Columnas finales
        filasEmpleados += `
                <td>$ ${emp.totalBase.toFixed(2)}</td>
                <td>$ ${emp.totalViaticos.toFixed(2)}</td>
                <td>$ ${emp.anticipos > 0 ? emp.anticipos.toFixed(2) : '-'}</td>
                <td>$ ${emp.totalDescuentos > 0 ? emp.totalDescuentos.toFixed(2) : '-'}</td>
                <td>$ ${emp.totalAPagar.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    // Fila de totales
    const totales = planilla.totales;
    const filaTotales = `
        <tr style="font-weight: bold; background-color: #e0e0e0;">
            <td colspan="2">TOTAL</td>
            <td colspan="12"></td>
            <td>$ ${totales.totalBase.toFixed(2)}</td>
            <td>$ ${totales.totalViaticos.toFixed(2)}</td>
            <td>$ ${totales.totalAnticipos.toFixed(2)}</td>
            <td>$ ${totales.totalDescuentos.toFixed(2)}</td>
            <td>$ ${totales.totalAPagar.toFixed(2)}</td>
        </tr>
    `;

    return `
        <!DOCTYPE html>
        <html>
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
                    font-size: 9px;
                    padding: 10px;
                }
                
                h1 {
                    text-align: center;
                    font-size: 11px;
                    margin-bottom: 15px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #000;
                    padding: 4px 2px;
                    text-align: center;
                    font-size: 8px;
                }
                
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    font-size: 7px;
                }
                
                .subtotal {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                
                .header-dia {
                    font-size: 7px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">#</th>
                        <th rowspan="2">NOMBRE</th>
                        <th colspan="2" class="header-dia">LUNES ${diasFechas['lunes'] || ''}</th>
                        <th colspan="2" class="header-dia">MARTES ${diasFechas['martes'] || ''}</th>
                        <th colspan="2" class="header-dia">MIÉRCOLES ${diasFechas['miercoles'] || ''}</th>
                        <th colspan="2" class="header-dia">JUEVES ${diasFechas['jueves'] || ''}</th>
                        <th colspan="2" class="header-dia">VIERNES ${diasFechas['viernes'] || ''}</th>
                        <th colspan="2" class="header-dia">SÁBADO ${diasFechas['sabado'] || ''}</th>
                        <th rowspan="2">BASE</th>
                        <th rowspan="2">VIÁTICOS</th>
                        <th rowspan="2">ANTICIPO<br/></th>
                        <th rowspan="2">DESCUENTO-<br/> FALTAS</th>
                        <th rowspan="2">TOTAL A PAGAR</th>
                    </tr>
                    <tr>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                        <th>BASE</th>
                        <th>VIÁTICOS</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; font-size: 8px; text-align: center; color: #666;">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión Rivera © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generar HTML para reporte mensual (imagen 2)
 */
function generarHTMLMensual(planillas, mes, ano) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const titulo = `PLANILLA DE EXTRA ${meses[mes - 1]} ${ano}`;

    // Consolidar datos por empleado
    const empleadosMap = new Map();

    planillas.forEach(planilla => {
        planilla.empleados.forEach(emp => {
            const key = emp.empleadoId.toString();
            
            if (!empleadosMap.has(key)) {
                empleadosMap.set(key, {
                    nombreCompleto: emp.nombreCompleto,
                    semanas: []
                });
            }

            empleadosMap.get(key).semanas.push({
                rango: formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin),
                total: emp.totalAPagar
            });
        });
    });

    // Generar filas
    let filasEmpleados = '';
    let numeroEmpleado = 1;

    // Determinar número máximo de semanas
    const maxSemanas = planillas.length;

    empleadosMap.forEach((data, empleadoId) => {
        let totalEmpleado = 0;
        let columnasSemanales = '';

        // Generar columnas para cada semana
        for (let i = 0; i < maxSemanas; i++) {
            if (i < data.semanas.length) {
                const monto = data.semanas[i].total;
                totalEmpleado += monto;
                columnasSemanales += `<td>$ ${monto.toFixed(2)}</td>`;
            } else {
                columnasSemanales += `<td>$ -</td>`;
            }
        }

        filasEmpleados += `
            <tr>
                <td>${numeroEmpleado}</td>
                <td style="text-align: left;">${data.nombreCompleto}</td>
                ${columnasSemanales}
                <td style="font-weight: bold;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    // Calcular totales por semana
    let totalesPorSemana = '';
    let totalGeneral = 0;
    
    for (let i = 0; i < maxSemanas; i++) {
        let totalSemana = 0;
        
        empleadosMap.forEach((data) => {
            if (i < data.semanas.length) {
                totalSemana += data.semanas[i].total;
            }
        });

        totalGeneral += totalSemana;
        totalesPorSemana += `<td style="font-weight: bold;">$ ${totalSemana.toFixed(2)}</td>`;
    }

    // Headers dinámicos para las semanas
    let headersSemanales = '';
    planillas.forEach((planilla, index) => {
        headersSemanales += `<th>${formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin)}</th>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #e0e0e0;">
            <td colspan="2">TOTAL</td>
            ${totalesPorSemana}
            <td>$ ${totalGeneral.toFixed(2)}</td>
        </tr>
    `;

    return `
        <!DOCTYPE html>
        <html>
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
                    font-size: 11px;
                    padding: 20px;
                }
                
                h1 {
                    text-align: center;
                    font-size: 14px;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #000;
                    padding: 6px 4px;
                    text-align: center;
                }
                
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersSemanales}
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; font-size: 8px; text-align: center; color: #666;">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión Rivera © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generar HTML para reporte multi-mes (trimestral, semestral, 9 meses)
 */
function generarHTMLMultiMes(planillasPorMes, ano) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const mesesIncluidos = planillasPorMes.map(p => meses[p.mes - 1]).join(', ');
    const titulo = `PLANILLA CONSOLIDADA ${mesesIncluidos} ${ano}`;

    // Consolidar datos por empleado
    const empleadosMap = new Map();

    planillasPorMes.forEach(({ mes, planillas }) => {
        planillas.forEach(planilla => {
            planilla.empleados.forEach(emp => {
                const key = emp.empleadoId.toString();
                
                if (!empleadosMap.has(key)) {
                    empleadosMap.set(key, {
                        nombreCompleto: emp.nombreCompleto,
                        meses: new Map()
                    });
                }

                const empleadoData = empleadosMap.get(key);
                if (!empleadoData.meses.has(mes)) {
                    empleadoData.meses.set(mes, 0);
                }

                empleadoData.meses.set(mes, empleadoData.meses.get(mes) + emp.totalAPagar);
            });
        });
    });

    // Generar filas
    let filasEmpleados = '';
    let numeroEmpleado = 1;
    let totalesPorMes = new Map();

    // Inicializar totales
    planillasPorMes.forEach(({ mes }) => {
        totalesPorMes.set(mes, 0);
    });

    empleadosMap.forEach((data, empleadoId) => {
        let totalEmpleado = 0;
        let columnasMeses = '';

        planillasPorMes.forEach(({ mes }) => {
            const monto = data.meses.get(mes) || 0;
            totalEmpleado += monto;
            totalesPorMes.set(mes, totalesPorMes.get(mes) + monto);

            columnasMeses += `<td>$ ${monto > 0 ? monto.toFixed(2) : '-'}</td>`;
        });

        filasEmpleados += `
            <tr>
                <td>${numeroEmpleado}</td>
                <td style="text-align: left;">${data.nombreCompleto}</td>
                ${columnasMeses}
                <td style="font-weight: bold;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    // Headers de meses
    let headersMeses = '';
    planillasPorMes.forEach(({ mes }) => {
        headersMeses += `<th>${meses[mes - 1]}</th>`;
    });

    // Totales por mes
    let columnaTotales = '';
    let granTotal = 0;
    
    planillasPorMes.forEach(({ mes }) => {
        const total = totalesPorMes.get(mes);
        granTotal += total;
        columnaTotales += `<td style="font-weight: bold;">$ ${total.toFixed(2)}</td>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #e0e0e0;">
            <td colspan="2">TOTAL</td>
            ${columnaTotales}
            <td>$ ${granTotal.toFixed(2)}</td>
        </tr>
    `;

    return `
        <!DOCTYPE html>
        <html>
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
                    font-size: 11px;
                    padding: 20px;
                }
                
                h1 {
                    text-align: center;
                    font-size: 14px;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #000;
                    padding: 6px 4px;
                    text-align: center;
                }
                
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersMeses}
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; font-size: 8px; text-align: center; color: #666;">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión Rivera © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generar HTML para reporte anual
 */
function generarHTMLAnual(planillasPorMes, ano) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const titulo = `PLANILLA ANUAL ${ano}`;

    // Consolidar datos por empleado
    const empleadosMap = new Map();

    planillasPorMes.forEach(({ mes, planillas }) => {
        planillas.forEach(planilla => {
            planilla.empleados.forEach(emp => {
                const key = emp.empleadoId.toString();
                
                if (!empleadosMap.has(key)) {
                    empleadosMap.set(key, {
                        nombreCompleto: emp.nombreCompleto,
                        meses: new Map()
                    });
                }

                const empleadoData = empleadosMap.get(key);
                if (!empleadoData.meses.has(mes)) {
                    empleadoData.meses.set(mes, 0);
                }

                empleadoData.meses.set(mes, empleadoData.meses.get(mes) + emp.totalAPagar);
            });
        });
    });

    // Generar filas
    let filasEmpleados = '';
    let numeroEmpleado = 1;
    let totalesPorMes = new Map();

    // Inicializar totales para los 12 meses
    for (let i = 1; i <= 12; i++) {
        totalesPorMes.set(i, 0);
    }

    empleadosMap.forEach((data, empleadoId) => {
        let totalEmpleado = 0;
        let columnasMeses = '';

        for (let mes = 1; mes <= 12; mes++) {
            const monto = data.meses.get(mes) || 0;
            totalEmpleado += monto;
            totalesPorMes.set(mes, totalesPorMes.get(mes) + monto);

            columnasMeses += `<td>$ ${monto > 0 ? monto.toFixed(2) : '-'}</td>`;
        }

        filasEmpleados += `
            <tr>
                <td>${numeroEmpleado}</td>
                <td style="text-align: left;">${data.nombreCompleto}</td>
                ${columnasMeses}
                <td style="font-weight: bold;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    // Headers de meses
    let headersMeses = '';
    meses.forEach(mes => {
        headersMeses += `<th>${mes.substring(0, 3)}</th>`;
    });

    // Totales por mes
    let columnaTotales = '';
    let granTotal = 0;
    
    for (let mes = 1; mes <= 12; mes++) {
        const total = totalesPorMes.get(mes);
        granTotal += total;
        columnaTotales += `<td style="font-weight: bold;">$ ${total.toFixed(2)}</td>`;
    }

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #e0e0e0;">
            <td colspan="2">TOTAL</td>
            ${columnaTotales}
            <td>$ ${granTotal.toFixed(2)}</td>
        </tr>
    `;

    return `
        <!DOCTYPE html>
        <html>
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
                    font-size: 9px;
                    padding: 15px;
                }
                
                h1 {
                    text-align: center;
                    font-size: 12px;
                    margin-bottom: 15px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #000;
                    padding: 4px 2px;
                    text-align: center;
                    font-size: 8px;
                }
                
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersMeses}
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; font-size: 8px; text-align: center; color: #666;">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Sistema de Gestión Rivera © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

export default ReportesPlanillaSemanalController;