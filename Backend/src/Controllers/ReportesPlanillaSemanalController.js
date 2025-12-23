import puppeteer from 'puppeteer';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';

const ReportesPlanillaSemanalController = {};

// ============================================
// FUNCIÓN AUXILIAR - Formatear fecha
// ============================================
const formatearFecha = (fecha) => {
    const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
};

const formatearFechaCorta = (fecha) => {
    const f = new Date(fecha);
    return `${f.getDate()}/${f.getMonth() + 1}`;
};

// ============================================
// REPORTE SEMANAL DETALLADO (Día por día)
// ============================================
ReportesPlanillaSemanalController.generarPDFSemanalDetallado = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;

        const planilla = await PlanillaSemanal.findById(id);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Generar HTML
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
                    font-family: Arial, Courier, sans-serif;
                    padding: 20px;
                    color: #000;
                    background: #fff;
                    font-size: 10px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #000;
                }
                .header h1 {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    font-size: 9px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 4px 2px;
                    text-align: center;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .nombre-col {
                    text-align: left;
                    max-width: 120px;
                    font-size: 8px;
                }
                .dia-col {
                    width: 40px;
                }
                .total-col {
                    font-weight: bold;
                    background-color: #f9f9f9;
                }
                .falta {
                    background-color: #ffe0e0;
                }
                .totales-row {
                    font-weight: bold;
                    background-color: #e0e0e0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PLANILLA SEMANAL, VIÁTICOS Y ANTICIPO DEL ${formatearFechaCorta(planilla.fechaInicio)} AL ${formatearFechaCorta(planilla.fechaFin)} ${new Date(planilla.fechaFin).getFullYear()}</h1>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2">#</th>
                        <th rowspan="2" class="nombre-col">NOMBRE</th>
                        <th colspan="2">LUNES ${formatearFechaCorta(planilla.empleados[0]?.dias[0]?.fecha)}</th>
                        <th colspan="2">MARTES ${formatearFechaCorta(planilla.empleados[0]?.dias[1]?.fecha)}</th>
                        <th colspan="2">MIÉRCOLES ${formatearFechaCorta(planilla.empleados[0]?.dias[2]?.fecha)}</th>
                        <th colspan="2">JUEVES ${formatearFechaCorta(planilla.empleados[0]?.dias[3]?.fecha)}</th>
                        <th colspan="2">VIERNES ${formatearFechaCorta(planilla.empleados[0]?.dias[4]?.fecha)}</th>
                        <th colspan="2">SÁBADO ${formatearFechaCorta(planilla.empleados[0]?.dias[5]?.fecha)}</th>
                        <th rowspan="2">SALARIO BASE</th>
                        <th rowspan="2">VIÁTICOS</th>
                        <th rowspan="2">ANTICIPO</th>
                        <th rowspan="2">DESCUENTOS</th>
                        <th rowspan="2">TOTAL A PAGAR</th>
                    </tr>
                    <tr>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                        <th class="dia-col">BASE</th>
                        <th class="dia-col">VIÁTICOS</th>
                    </tr>
                </thead>
                <tbody>
                    ${planilla.empleados.map((empleado, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="nombre-col">${empleado.nombreCompleto}</td>
                            ${empleado.dias.map(dia => `
                                <td class="${dia.faltaInjustificada ? 'falta' : ''}">${dia.base > 0 ? dia.base.toFixed(2) : '-'}</td>
                                <td>${dia.viaticos > 0 ? dia.viaticos.toFixed(2) : '-'}</td>
                            `).join('')}
                            <td class="total-col">$ ${empleado.totalBase.toFixed(2)}</td>
                            <td class="total-col">$ ${empleado.totalViaticos.toFixed(2)}</td>
                            <td>$ ${empleado.anticipos.toFixed(2)}</td>
                            <td>$ ${empleado.descuentos.toFixed(2)}</td>
                            <td class="total-col">$ ${empleado.totalPagar.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="totales-row">
                        <td colspan="2">TOTAL</td>
                        ${Array(12).fill(0).map((_, i) => {
                            const columna = Math.floor(i / 2);
                            const esBase = i % 2 === 0;
                            const total = planilla.empleados.reduce((sum, emp) => {
                                const dia = emp.dias[columna];
                                return sum + (esBase ? (dia?.base || 0) : (dia?.viaticos || 0));
                            }, 0);
                            return `<td>$ ${total.toFixed(2)}</td>`;
                        }).join('')}
                        <td>$ ${planilla.empleados.reduce((sum, emp) => sum + emp.totalBase, 0).toFixed(2)}</td>
                        <td>$ ${planilla.empleados.reduce((sum, emp) => sum + emp.totalViaticos, 0).toFixed(2)}</td>
                        <td>$ ${planilla.empleados.reduce((sum, emp) => sum + emp.anticipos, 0).toFixed(2)}</td>
                        <td>$ ${planilla.empleados.reduce((sum, emp) => sum + emp.descuentos, 0).toFixed(2)}</td>
                        <td>$ ${planilla.empleados.reduce((sum, emp) => sum + emp.totalPagar, 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 20px; font-size: 9px;">
                <p>() DESCUENTOS</p>
                <p>TOTAL: $ ${planilla.empleados.reduce((sum, emp) => sum + emp.totalPagar, 0).toFixed(2)}</p>
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
            format: 'Legal',
            landscape: true,
            printBackground: true,
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-semanal-${formatearFechaCorta(planilla.fechaInicio)}-${Date.now()}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF semanal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar PDF',
            error: error.message
        });
    }
};

// ============================================
// REPORTE MENSUAL (estilo "extra")
// Agrupa todas las semanas del mes
// ============================================
ReportesPlanillaSemanalController.generarPDFMensual = async (req, res) => {
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

        // Buscar todas las planillas del mes
        const inicioMes = new Date(anoNum, mesNum - 1, 1);
        const finMes = new Date(anoNum, mesNum, 0);

        const planillas = await PlanillaSemanal.find({
            fechaInicio: { $gte: inicioMes },
            fechaFin: { $lte: finMes },
            estado: { $in: ['aprobada', 'pagada', 'cerrada'] }
        }).sort({ fechaInicio: 1 });

        if (!planillas || planillas.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay planillas aprobadas para este mes`
            });
        }

        // Agrupar por empleado
        const empleadosTotales = {};
        
        planillas.forEach(planilla => {
            planilla.empleados.forEach(emp => {
                const key = emp.empleadoId.toString();
                if (!empleadosTotales[key]) {
                    empleadosTotales[key] = {
                        nombre: emp.nombreCompleto,
                        semanas: [],
                        totalGeneral: 0
                    };
                }
                
                // Agregar semana
                empleadosTotales[key].semanas.push({
                    periodo: `${formatearFechaCorta(planilla.fechaInicio)} AL ${formatearFechaCorta(planilla.fechaFin)}`,
                    total: emp.totalPagar
                });
                empleadosTotales[key].totalGeneral += emp.totalPagar;
            });
        });

        const empleadosArray = Object.values(empleadosTotales).sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
        );

        const nombreMes = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                          'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'][mesNum - 1];

        // Generar HTML
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
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    text-align: center;
                }
                .text-right {
                    text-align: right;
                }
                .total-row {
                    font-weight: bold;
                    background-color: #e0e0e0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PLANILLA DE EXTRA ${nombreMes} ${anoNum}</h1>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${planillas.map(p => `
                            <th>${formatearFechaCorta(p.fechaInicio)} AL ${formatearFechaCorta(p.fechaFin)}</th>
                        `).join('')}
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${empleadosArray.map((empleado, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${empleado.nombre}</td>
                            ${planillas.map(planilla => {
                                const semana = empleado.semanas.find(s => 
                                    s.periodo === `${formatearFechaCorta(planilla.fechaInicio)} AL ${formatearFechaCorta(planilla.fechaFin)}`
                                );
                                return `<td class="text-right">$ ${semana ? semana.total.toFixed(2) : '-'}</td>`;
                            }).join('')}
                            <td class="text-right"><strong>$ ${empleado.totalGeneral.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        ${planillas.map(planilla => {
                            const total = planilla.empleados.reduce((sum, emp) => sum + emp.totalPagar, 0);
                            return `<td class="text-right">$ ${total.toFixed(2)}</td>`;
                        }).join('')}
                        <td class="text-right">$ ${empleadosArray.reduce((sum, emp) => sum + emp.totalGeneral, 0).toFixed(2)}</td>
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
            landscape: planillas.length > 2,
            printBackground: true,
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-extra-${nombreMes}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar PDF',
            error: error.message
        });
    }
};

export default ReportesPlanillaSemanalController;