import puppeteer from 'puppeteer';
import Viajes from '../Models/Viajes.js';
import ResumenDiesel from '../Models/ResumenDiesel.js';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import PlanillaQuincenal from '../Models/PlanillaQuincenal.js';
import Camiones from '../Models/Camiones.js';
import Motorista from '../Models/Motorista.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const ReporteConsolidadoController = {};

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
// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses[mes - 1] || 'MES INVÁLIDO';
};

/**
 * FUNCIÓN AUXILIAR: Obtener datos consolidados de un camión en un mes específico
 * @param {String} placa - Placa del camión
 * @param {Number} mes - Mes (1-12)
 * @param {Number} ano - Año
 * @returns {Object} - Datos consolidados: ingresos, diesel, planilla, utilidad, viajes
 */
const obtenerDatosCamionMes = async (placa, mes, ano) => {
    try {
        // 1. Buscar el camión por placa
        const camion = await Camiones.findOne({ licensePlate: placa });
        if (!camion) {
            return {
                placa,
                ingresos: 0,
                diesel: 0,
                planilla: 0,
                utilidadBruta: 0,
                cantidadViajes: 0
            };
        }

        // 2. INGRESOS: Obtener viajes completados del camión en ese mes
        const viajes = await Viajes.find({
            truckId: camion._id,
            tipoViaje: 'operativo',
            'estado.actual': 'completado',
            'periodoContable.mes': mes,
            'periodoContable.año': ano
        });

        const ingresos = viajes.reduce((sum, v) => sum + (v.montoAcordado || 0), 0);
        const cantidadViajes = viajes.length;

        // 3. DIESEL: Obtener todos los registros de diesel del camión en ese mes
        const registrosDiesel = await ResumenDiesel.find({
            CicurlationCard: camion._id,
            mes: mes,
            ano: ano
        });

        const diesel = registrosDiesel.reduce((sum, d) => sum + (d.Total || 0), 0);

        // 4. PLANILLA: Obtener pagos al motorista asociado al camión (SOLO PAGADAS)
        // Buscar el motorista asociado a este camión (driverId en el documento del camión)
        const motorista = camion.driverId ? await Motorista.findById(camion.driverId) : null;

        let planilla = 0;

        if (motorista) {
            // 4.1 PLANILLA QUINCENAL (SOLO PAGADAS)
            // Los motoristas están en el array empleados identificados por empleadoId
            // IMPORTANTE: El campo es 'año' (con ñ) en el esquema
            const planillasQuincenales = await PlanillaQuincenal.find({
                año: ano,  // ⚠️ CORREGIDO: 'año' con ñ, no 'ano'
                mes: mes,
                'empleados.empleadoId': motorista._id,
                estado: 'pagada',
                pagada: true
            });

            planillasQuincenales.forEach(p => {
                const empleado = p.empleados.find(e => 
                    e.empleadoId.toString() === motorista._id.toString()
                );
                if (empleado) {
                    planilla += empleado.totalAPagar || 0;
                }
            });

            // 4.2 PLANILLA SEMANAL (SOLO PAGADAS)
            // Los motoristas están en el array empleados identificados por empleadoId
            // Filtrar por fechas que caigan dentro del mes
            const fechaInicio = new Date(ano, mes - 1, 1);
            const fechaFin = new Date(ano, mes, 0);
            fechaFin.setHours(23, 59, 59, 999);

            const planillasSemanales = await PlanillaSemanal.find({
                fechaInicio: { $gte: fechaInicio },
                fechaFin: { $lte: fechaFin },
                'empleados.empleadoId': motorista._id,
                estado: 'pagada',
                pagada: true
            });

            planillasSemanales.forEach(p => {
                const empleado = p.empleados.find(e => 
                    e.empleadoId.toString() === motorista._id.toString()
                );
                if (empleado) {
                    planilla += empleado.totalAPagar || 0;
                }
            });
        }

        // 5. CALCULAR UTILIDAD BRUTA
        const utilidadBruta = ingresos - diesel - planilla;

        return {
            placa,
            ingresos,
            diesel,
            planilla,
            utilidadBruta,
            cantidadViajes
        };

    } catch (error) {
        console.error(`Error obteniendo datos del camión ${placa}:`, error);
        return {
            placa,
            ingresos: 0,
            diesel: 0,
            planilla: 0,
            utilidadBruta: 0,
            cantidadViajes: 0
        };
    }
};

/**
 * 1. REPORTE MENSUAL CONSOLIDADO (HORIZONTAL)
 * Genera PDF horizontal con todos los camiones de un mes específico
 * Incluye columna de "Observaciones" con formato "X de Y" donde Y son días trabajados
 */
ReporteConsolidadoController.generarPDFMensual = async (req, res) => {
    let browser;
    try {
        const { mes, ano, diasTrabajados } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);
        const diasNum = parseInt(diasTrabajados);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido. Debe estar entre 1 y 12'
            });
        }

        if (!diasNum || diasNum < 1 || diasNum > 31) {
            return res.status(400).json({
                success: false,
                message: 'Días trabajados inválidos. Debe estar entre 1 y 31'
            });
        }

        // Obtener todos los camiones
        const camiones = await Camiones.find().sort({ licensePlate: 1 });

        if (!camiones || camiones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay camiones registrados en el sistema'
            });
        }

        // Obtener datos consolidados de cada camión
        const datosConsolidados = [];
        for (const camion of camiones) {
            const datos = await obtenerDatosCamionMes(camion.licensePlate, mesNum, anoNum);
            // Solo incluir camiones con actividad
            if (datos.cantidadViajes > 0 || datos.diesel > 0 || datos.planilla > 0) {
                datosConsolidados.push(datos);
            }
        }

        if (datosConsolidados.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay datos para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Calcular totales
        const totales = {
            ingresos: datosConsolidados.reduce((s, d) => s + d.ingresos, 0),
            diesel: datosConsolidados.reduce((s, d) => s + d.diesel, 0),
            planilla: datosConsolidados.reduce((s, d) => s + d.planilla, 0),
            utilidadBruta: datosConsolidados.reduce((s, d) => s + d.utilidadBruta, 0)
        };

        // Generar filas de la tabla
        const filasHTML = datosConsolidados.map((dato, index) => `
            <tr>
                <td class="col-numero">${index + 1}</td>
                <td class="col-placa">${dato.placa}</td>
                <td class="col-monto">$ ${dato.ingresos.toFixed(2)}</td>
                <td class="col-monto">$ ${dato.diesel.toFixed(2)}</td>
                <td class="col-monto">$ ${dato.planilla.toFixed(2)}</td>
                <td class="col-monto ${dato.utilidadBruta >= 0 ? 'positivo' : 'negativo'}">$ ${dato.utilidadBruta.toFixed(2)}</td>
                <td class="col-observaciones">${dato.cantidadViajes} de ${diasNum}</td>
            </tr>
        `).join('');

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
                    padding: 8px 4px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 8px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 6px 4px;
                    text-align: center;
                    font-size: 7px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 5%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 10%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-monto {
                    width: 15%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-observaciones {
                    width: 10%;
                    font-weight: 500;
                    color: #34353A;
                }
                /* Asegurar que los headers sean blancos */
                th.col-numero,
                th.col-placa,
                th.col-monto,
                th.col-observaciones {
                    color: white !important;
                }
                .positivo {
                    color: #5D9646 !important;
                }
                .negativo {
                    color: #dc2626 !important;
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
                <h1>RESUMEN CONSOLIDADO POR CAMIÓN</h1>
                <div class="subtitle">${obtenerNombreMes(mesNum)} ${anoNum}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-placa">PLACA</th>
                        <th class="col-monto">INGRESOS</th>
                        <th class="col-monto">DIESEL</th>
                        <th class="col-monto">PLANILLA</th>
                        <th class="col-monto">UTILIDAD BRUTA</th>
                        <th class="col-observaciones">OBSERVACIONES</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                    <tr class="total-row">
                        <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TOTALES</strong></td>
                        <td class="col-monto"><strong>$ ${totales.ingresos.toFixed(2)}</strong></td>
                        <td class="col-monto"><strong>$ ${totales.diesel.toFixed(2)}</strong></td>
                        <td class="col-monto"><strong>$ ${totales.planilla.toFixed(2)}</strong></td>
                        <td class="col-monto ${totales.utilidadBruta >= 0 ? 'positivo' : 'negativo'}"><strong>$ ${totales.utilidadBruta.toFixed(2)}</strong></td>
                        <td class="col-observaciones">-</td>
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
        res.setHeader('Content-Disposition', `attachment; filename=resumen-consolidado-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual consolidado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * 2. REPORTE MULTI-MES CONSOLIDADO (VERTICAL)
 * Genera PDF vertical con sección por cada mes seleccionado
 */
ReporteConsolidadoController.generarPDFMultiMes = async (req, res) => {
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
        const mesesValidos = meses.filter(m => m >= 1 && m <= 12).sort((a, b) => a - b);
        
        if (mesesValidos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay meses válidos en la lista'
            });
        }

        // Obtener todos los camiones
        const camiones = await Camiones.find().sort({ licensePlate: 1 });

        if (!camiones || camiones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay camiones registrados'
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Generar HTML para cada mes
        const mesesHTML = [];
        for (const mesNum of mesesValidos) {
            const datosConsolidados = [];
            
            for (const camion of camiones) {
                const datos = await obtenerDatosCamionMes(camion.licensePlate, mesNum, anoNum);
                if (datos.cantidadViajes > 0 || datos.diesel > 0 || datos.planilla > 0) {
                    datosConsolidados.push(datos);
                }
            }

            if (datosConsolidados.length === 0) continue;

            const totales = {
                ingresos: datosConsolidados.reduce((s, d) => s + d.ingresos, 0),
                diesel: datosConsolidados.reduce((s, d) => s + d.diesel, 0),
                planilla: datosConsolidados.reduce((s, d) => s + d.planilla, 0),
                utilidadBruta: datosConsolidados.reduce((s, d) => s + d.utilidadBruta, 0)
            };

            const filasHTML = datosConsolidados.map((dato, index) => `
                <tr>
                    <td class="col-numero">${index + 1}</td>
                    <td class="col-placa">${dato.placa}</td>
                    <td class="col-monto">$ ${dato.ingresos.toFixed(2)}</td>
                    <td class="col-monto">$ ${dato.diesel.toFixed(2)}</td>
                    <td class="col-monto">$ ${dato.planilla.toFixed(2)}</td>
                    <td class="col-monto ${dato.utilidadBruta >= 0 ? 'positivo' : 'negativo'}">$ ${dato.utilidadBruta.toFixed(2)}</td>
                    <td class="col-observaciones">${dato.cantidadViajes} viajes</td>
                </tr>
            `).join('');

            mesesHTML.push(`
                <div class="mes-section">
                    <div class="mes-header">
                        <h2>${obtenerNombreMes(mesNum)} ${anoNum}</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th class="col-numero">#</th>
                                <th class="col-placa">PLACA</th>
                                <th class="col-monto">INGRESOS</th>
                                <th class="col-monto">DIESEL</th>
                                <th class="col-monto">PLANILLA</th>
                                <th class="col-monto">UTILIDAD</th>
                                <th class="col-observaciones">OBSERV.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                            <tr class="total-row">
                                <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TOTALES</strong></td>
                                <td class="col-monto"><strong>$ ${totales.ingresos.toFixed(2)}</strong></td>
                                <td class="col-monto"><strong>$ ${totales.diesel.toFixed(2)}</strong></td>
                                <td class="col-monto"><strong>$ ${totales.planilla.toFixed(2)}</strong></td>
                                <td class="col-monto ${totales.utilidadBruta >= 0 ? 'positivo' : 'negativo'}"><strong>$ ${totales.utilidadBruta.toFixed(2)}</strong></td>
                                <td class="col-observaciones">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `);
        }

        if (mesesHTML.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay datos para los meses seleccionados'
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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container img {
                    max-width: 180px;
                    height: auto;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0 5px 0;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .mes-section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .mes-header {
                    background: #5F8EAD;
                    color: white;
                    padding: 10px;
                    margin-bottom: 10px;
                    text-align: center;
                    border-left: 4px solid #5D9646;
                }
                .mes-header h2 {
                    font-size: 12px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 10px 6px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 9px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 8px 6px;
                    text-align: center;
                    font-size: 8px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 5%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 12%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-monto {
                    width: 15%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-observaciones {
                    width: 13%;
                    font-weight: 500;
                    color: #34353A;
                }
                /* Asegurar que los headers sean blancos */
                th.col-numero,
                th.col-placa,
                th.col-monto,
                th.col-observaciones {
                    color: white !important;
                }
                .positivo {
                    color: #5D9646 !important;
                }
                .negativo {
                    color: #dc2626 !important;
                }
                .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                }
                .total-row td {
                    border: 2px solid #5D9646;
                    font-size: 9px;
                }
                .footer {
                    margin-top: 20px;
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
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA</p>'}
                </div>
                <h1>RESUMEN CONSOLIDADO MULTI-MES</h1>
                <div class="subtitle">Año ${anoNum}</div>
            </div>

            ${mesesHTML.join('')}

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
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        await browser.close();

        const nombresMeses = mesesValidos.map(m => obtenerNombreMes(m)).join('-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resumen-consolidado-${nombresMeses}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF multi-mes consolidado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * 3. REPORTE ANUAL CONSOLIDADO (VERTICAL CON TODAS LAS COLUMNAS)
 * Genera PDF vertical con tabla mostrando: # | PLACA | INGRESOS | DIESEL | PLANILLA | UTILIDAD | OBSERVACIONES por cada mes
 */
ReporteConsolidadoController.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        // Obtener todos los camiones
        const camiones = await Camiones.find().sort({ licensePlate: 1 });

        if (!camiones || camiones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay camiones registrados'
            });
        }

        // Convertir imagen a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Generar HTML para cada mes del año
        const mesesHTML = [];
        
        for (let mes = 1; mes <= 12; mes++) {
            const datosConsolidados = [];
            
            for (const camion of camiones) {
                const datos = await obtenerDatosCamionMes(camion.licensePlate, mes, anoNum);
                if (datos.cantidadViajes > 0 || datos.diesel > 0 || datos.planilla > 0) {
                    datosConsolidados.push(datos);
                }
            }

            // Si no hay datos en este mes, saltar
            if (datosConsolidados.length === 0) continue;

            const totales = {
                ingresos: datosConsolidados.reduce((s, d) => s + d.ingresos, 0),
                diesel: datosConsolidados.reduce((s, d) => s + d.diesel, 0),
                planilla: datosConsolidados.reduce((s, d) => s + d.planilla, 0),
                utilidadBruta: datosConsolidados.reduce((s, d) => s + d.utilidadBruta, 0)
            };

            const filasHTML = datosConsolidados.map((dato, index) => `
                <tr>
                    <td class="col-numero">${index + 1}</td>
                    <td class="col-placa">${dato.placa}</td>
                    <td class="col-monto">$ ${dato.ingresos.toFixed(2)}</td>
                    <td class="col-monto">$ ${dato.diesel.toFixed(2)}</td>
                    <td class="col-monto">$ ${dato.planilla.toFixed(2)}</td>
                    <td class="col-monto ${dato.utilidadBruta >= 0 ? 'positivo' : 'negativo'}">$ ${dato.utilidadBruta.toFixed(2)}</td>
                    <td class="col-observaciones">${dato.cantidadViajes} viajes</td>
                </tr>
            `).join('');

            mesesHTML.push(`
                <div class="mes-section">
                    <div class="mes-header">
                        <h2>${obtenerNombreMes(mes)} ${anoNum}</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th class="col-numero">#</th>
                                <th class="col-placa">PLACA</th>
                                <th class="col-monto">INGRESOS</th>
                                <th class="col-monto">DIESEL</th>
                                <th class="col-monto">PLANILLA</th>
                                <th class="col-monto">UTILIDAD</th>
                                <th class="col-observaciones">OBSERV.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                            <tr class="total-row">
                                <td colspan="2" style="text-align: left; padding-left: 8px;"><strong>TOTALES</strong></td>
                                <td class="col-monto"><strong>$ ${totales.ingresos.toFixed(2)}</strong></td>
                                <td class="col-monto"><strong>$ ${totales.diesel.toFixed(2)}</strong></td>
                                <td class="col-monto"><strong>$ ${totales.planilla.toFixed(2)}</strong></td>
                                <td class="col-monto ${totales.utilidadBruta >= 0 ? 'positivo' : 'negativo'}"><strong>$ ${totales.utilidadBruta.toFixed(2)}</strong></td>
                                <td class="col-observaciones">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `);
        }

        if (mesesHTML.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay datos para el año ${anoNum}`
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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container img {
                    max-width: 180px;
                    height: auto;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0 5px 0;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .mes-section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .mes-header {
                    background: #5F8EAD;
                    color: white;
                    padding: 10px;
                    margin-bottom: 10px;
                    text-align: center;
                    border-left: 4px solid #5D9646;
                }
                .mes-header h2 {
                    font-size: 12px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                th {
                    background: #34353A;
                    color: white;
                    padding: 10px 6px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 9px;
                    border: 1px solid #34353A;
                }
                td {
                    padding: 8px 6px;
                    text-align: center;
                    font-size: 8px;
                    border: 1px solid #5F8EAD;
                }
                .col-numero {
                    width: 5%;
                    color: #6b7280;
                    font-weight: 500;
                }
                .col-placa {
                    width: 12%;
                    font-weight: 600;
                    color: #34353A;
                }
                .col-monto {
                    width: 15%;
                    font-weight: 600;
                    color: #5F8EAD;
                }
                .col-observaciones {
                    width: 13%;
                    font-weight: 500;
                    color: #34353A;
                }
                /* Asegurar que los headers sean blancos */
                th.col-numero,
                th.col-placa,
                th.col-monto,
                th.col-observaciones {
                    color: white !important;
                }
                .positivo {
                    color: #5D9646 !important;
                }
                .negativo {
                    color: #dc2626 !important;
                }
                .total-row {
                    background: #e8f4e8;
                    font-weight: bold;
                }
                .total-row td {
                    border: 2px solid #5D9646;
                    font-size: 9px;
                }
                .footer {
                    margin-top: 20px;
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
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA</p>'}
                </div>
                <h1>RESUMEN CONSOLIDADO ANUAL</h1>
                <div class="subtitle">AÑO ${anoNum}</div>
            </div>

            ${mesesHTML.join('')}

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
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resumen-consolidado-anual-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF anual consolidado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReporteConsolidadoController;