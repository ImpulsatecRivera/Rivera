import puppeteer from 'puppeteer';
import Viajes from '../Models/Viajes.js';
import ResumenDiesel from '../Models/ResumenDiesel.js';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import PlanillaQuincenal from '../Models/PlanillaQuincenal.js';
import Camiones from '../Models/Camiones.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Motorista from '../Models/Motorista.js';
import fs from 'fs';
import path from 'path';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';
import { generatePdfFromHtml } from '../Utils/pdfGenerator.js';

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

const obtenerNombreMes = (mes) => {
    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses[mes - 1] || 'MES INVÁLIDO';
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
        serviceName: 'reporte-consolidado',
        primaryConfig: PUPPETEER_CONFIG()
    });
};

321

/**
 * FUNCIÓN AUXILIAR: Calcular días hábiles del mes (restando solo domingos)
 * @param {Number} mes - Mes (1-12)
 * @param {Number} ano - Año
 * @returns {Number} - Número de días hábiles
 */
const calcularDiasHabilesPorMes = (mes, ano) => {
    const ultimoDia = new Date(ano, mes, 0); // Último día del mes
    const totalDias = ultimoDia.getDate();
    
    let domingos = 0;
    
    // Contar domingos en el mes
    for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = new Date(ano, mes - 1, dia);
        if (fecha.getDay() === 0) { // 0 = domingo
            domingos++;
        }
    }
    
    const diasHabiles = totalDias - domingos;
    console.log(`📊 Mes ${mes}/${ano}: Total ${totalDias} días - ${domingos} domingos = ${diasHabiles} días hábiles`);
    return diasHabiles;
};

/**
 * FUNCIÓN AUXILIAR: Obtener días hábiles del mes desde la planilla semanal
 * Busca TODAS las planillas que toquen el mes y retorna el diasHabiles más frecuente
 * Si no hay planillas, calcula dinámicamente restando domingos
 * @param {Number} mes - Mes (1-12)
 * @param {Number} ano - Año
 * @returns {Promise<Number>} - Número de días hábiles (el más frecuente en las planillas)
 */
const obtenerDiasHabilesMes = async (mes, ano) => {
    try {
        const primerDiaMes = new Date(ano, mes - 1, 1);
        const ultimoDiaMes = new Date(ano, mes, 0); // Último día del mes
        
        console.log(`🔍 Buscando TODAS las planillas que toquen ${mes}/${ano}...`);
        
        // Buscar TODAS las planillas que intersecten con este mes
        const planillas = await PlanillaSemanal.find({
            $or: [
                {
                    // Planilla que empieza en este mes
                    fechaInicio: {
                        $gte: primerDiaMes,
                        $lte: ultimoDiaMes
                    }
                },
                {
                    // Planilla que termina en este mes
                    fechaFin: {
                        $gte: primerDiaMes,
                        $lte: ultimoDiaMes
                    }
                },
                {
                    // Planilla que abarca todo el mes
                    fechaInicio: { $lte: primerDiaMes },
                    fechaFin: { $gte: ultimoDiaMes }
                }
            ]
        }).sort({ fechaInicio: 1 });
        
        if (planillas.length === 0) {
            console.log(`⚠️ No se encontraron planillas para ${mes}/${ano}, calculando dinámicamente...`);
            return calcularDiasHabilesPorMes(mes, ano);
        }
        
        console.log(`📊 Se encontraron ${planillas.length} planilla(s) para ${mes}/${ano}:`);
        
        // Contar la frecuencia de cada valor de diasHabiles
        const frecuencias = {};
        const detalles = [];
        
        for (const planilla of planillas) {
            const diasHabiles = planilla.diasHabiles;
            console.log(`   - ${planilla.fechaInicio.toLocaleDateString()} al ${planilla.fechaFin.toLocaleDateString()}: ${diasHabiles} días`);
            
            detalles.push({
                rango: `${planilla.fechaInicio.toLocaleDateString()} al ${planilla.fechaFin.toLocaleDateString()}`,
                diasHabiles: diasHabiles
            });
            
            frecuencias[diasHabiles] = (frecuencias[diasHabiles] || 0) + 1;
        }
        
        // Encontrar el valor más frecuente
        const diasMasFrecuente = Object.keys(frecuencias).reduce((a, b) => 
            frecuencias[a] > frecuencias[b] ? a : b
        );
        
        const diasNum = parseInt(diasMasFrecuente);
        console.log(`✅ Valor más frecuente para ${mes}/${ano}: ${diasNum} días (aparece ${frecuencias[diasMasFrecuente]} veces)`);
        
        return diasNum;
        
    } catch (error) {
        console.error(`❌ Error obteniendo días hábiles del mes ${mes}/${ano}:`, error);
        // En caso de error, calcular dinámicamente
        return calcularDiasHabilesPorMes(mes, ano);
    }
};

/**
 * FUNCIÓN AUXILIAR: Obtener datos consolidados de un camión en un mes específico
 * @param {String} placa - Placa del camión
 * @param {Number} mes - Mes (1-12)
 * @param {Number} ano - Año
 * @param {Number} diasTrabajados - Número de días trabajados en el mes
 * @returns {Object} - Datos consolidados: ingresos, diesel, planilla, utilidad, viajes
 */
const obtenerDatosCamionMes = async (placa, mes, ano, diasTrabajados) => {
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
        })
        .populate('conductorId', 'salario name lastName')
        .populate('auxiliares.auxiliarId', 'salario name lastName');

        const ingresos = viajes.reduce((sum, v) => sum + (v.montoAcordado || 0), 0);
        const cantidadViajes = viajes.length;

        // 3. DIESEL: Obtener todos los registros de diesel del camión en ese mes
        const registrosDiesel = await ResumenDiesel.find({
            CicurlationCard: camion._id,
            mes: mes,
            ano: ano
        });

        const diesel = registrosDiesel.reduce((sum, d) => sum + (d.Total || 0), 0);

        // 4. NUEVA LÓGICA DE PLANILLA: Calcular basado en viajes y motoristas
        let planilla = 0;

        console.log(`\n=== Calculando planilla para ${placa} - Mes ${mes}/${ano} ===`);
        console.log(`Total de viajes completados: ${viajes.length}`);
        console.log(`Días trabajados para cálculo: ${diasTrabajados}`);

        // Procesar cada viaje para calcular planilla
        for (const viaje of viajes) {
            let planillaViaje = 0;

            // 4.1 Obtener salario del conductor principal (usar histórico si existe)
            if (viaje.conductorId) {
                const conductor = viaje.conductorId;
                let salario = conductor.salario || 0;
                
                // PRIMERO intentar usar salario histórico
                if (viaje.salariosCargados && viaje.salariosCargados.salarioConductor) {
                    salario = viaje.salariosCargados.salarioConductor;
                    console.log(`  📊 Conductor (${conductor.name || 'N/A'} ${conductor.lastName || ''}): Usando salario histórico $${salario}`);
                }
                
                if (salario > 0) {
                    const salarioDiario = salario / diasTrabajados;
                    planillaViaje += salarioDiario;
                    console.log(`  Conductor: $${salario} / ${diasTrabajados} = $${salarioDiario.toFixed(2)}`);
                } else {
                    console.log(`  ⚠️ Conductor sin salario definido`);
                }
            }

            // 4.2 Obtener salarios de los auxiliares (usar histórico si existe)
            if (viaje.auxiliares && viaje.auxiliares.length > 0) {
                for (let idx = 0; idx < viaje.auxiliares.length; idx++) {
                    const aux = viaje.auxiliares[idx];
                    if (aux.auxiliarId) {
                        const auxiliar = aux.auxiliarId;
                        let salario = auxiliar.salario || 0;
                        
                        // PRIMERO intentar usar salario histórico
                        if (viaje.salariosCargados && 
                            viaje.salariosCargados.salariosAuxiliares && 
                            viaje.salariosCargados.salariosAuxiliares[idx]) {
                            salario = viaje.salariosCargados.salariosAuxiliares[idx].salario || 0;
                            console.log(`  📊 Auxiliar (${auxiliar.name || 'N/A'} ${auxiliar.lastName || ''}): Usando salario histórico $${salario}`);
                        }
                        
                        if (salario > 0) {
                            const salarioDiario = salario / diasTrabajados;
                            planillaViaje += salarioDiario;
                            console.log(`  Auxiliar: $${salario} / ${diasTrabajados} = $${salarioDiario.toFixed(2)}`);
                        } else {
                            console.log(`  ⚠️ Auxiliar sin salario definido`);
                        }
                    }
                }
            }

            planilla += planillaViaje;
            console.log(`  Planilla este viaje: $${planillaViaje.toFixed(2)}`);
        }

        console.log(`\nPlanilla total para ${placa}: $${planilla.toFixed(2)}`);
        console.log(`=== Fin cálculo ===\n`);

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
            const datos = await obtenerDatosCamionMes(camion.licensePlate, mesNum, anoNum, diasNum);
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

        const pdfBuffer = await generatePdfFromHtml(htmlContent, {
            serviceName: 'reporte-consolidado',
            pdfOptions: { format: 'Legal', landscape: true, printBackground: true, margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } },
            timeoutMs: 60000,
            retries: 2,
            waitUntil: 'networkidle2'
        });

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
            // Obtener días hábiles del mes desde la planilla semanal
            const diasHabilesMes = await obtenerDiasHabilesMes(mesNum, anoNum);
            console.log(`📅 Mes ${mesNum}/${anoNum}: usando ${diasHabilesMes} días hábiles`);
            
            const datosConsolidados = [];
            
            for (const camion of camiones) {
                const datos = await obtenerDatosCamionMes(camion.licensePlate, mesNum, anoNum, diasHabilesMes);
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

        browser = await launchBrowserSafe();

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
            // Obtener días hábiles del mes desde la planilla semanal
            const diasHabilesMes = await obtenerDiasHabilesMes(mes, anoNum);
            console.log(`📅 Mes ${mes}/${anoNum}: usando ${diasHabilesMes} días hábiles`);
            
            const datosConsolidados = [];
            
            for (const camion of camiones) {
                const datos = await obtenerDatosCamionMes(camion.licensePlate, mes, anoNum, diasHabilesMes);
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

        browser = await launchBrowserSafe();

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

/**
 * ENDPOINT 4: Generar PDF consolidado por rango de fechas con detalle de viajes
 * GET /api/reporte-consolidado/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&diasRango=N
 */
ReporteConsolidadoController.generarPDFRango = async (req, res) => {
    let browser;
    try {
        const { fechaInicio, fechaFin, diasRango } = req.query;

        // Validaciones
        if (!fechaInicio || !fechaFin || !diasRango) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: fechaInicio, fechaFin, diasRango'
            });
        }

        const diasNum = parseInt(diasRango);
        if (isNaN(diasNum) || diasNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'diasRango debe ser un número positivo'
            });
        }

        // Convertir fechas a objetos Date locales (evitar desfase por timezone)
        const parseDateLocal = (dateStr) => {
            const [y, m, d] = String(dateStr).split('-').map(Number);
            return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
        };

        const inicio = parseDateLocal(fechaInicio);
        const fin = parseDateLocal(fechaFin);
        fin.setHours(23, 59, 59, 999); // Final del día

        console.log(`\n=== Generando reporte consolidado por rango ===`);
        console.log(`Fecha inicio: ${inicio.toISOString()} (${fechaInicio})`);
        console.log(`Fecha fin: ${fin.toISOString()} (${fechaFin})`);
        console.log(`Días trabajados: ${diasNum}`);

        // Obtener todos los camiones
        const todosLosCamiones = await Camiones.find({}).sort({ licensePlate: 1 });
        console.log(`Total de camiones en base de datos: ${todosLosCamiones.length}`);

        if (todosLosCamiones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay camiones registrados'
            });
        }

        // Para cada camión, obtener sus viajes en el rango
        const datosCamiones = [];

        for (const camion of todosLosCamiones) {
            console.log(`\n--- Buscando viajes para camión: ${camion.licensePlate} (${camion._id}) ---`);
            
            // Primero, buscar TODOS los viajes del camión sin filtros de fecha
            const todosViajesDelCamion = await Viajes.find({
                truckId: camion._id,
                tipoViaje: 'operativo',
                'estado.actual': 'completado'
            }).select('fechaServicio montoAcordado periodoContable').sort({ fechaServicio: -1 }).limit(5);
            
            console.log(`Total viajes completados de este camión (últimos 5): ${todosViajesDelCamion.length}`);
            if (todosViajesDelCamion.length > 0) {
                console.log('Últimas fechas disponibles:');
                todosViajesDelCamion.forEach(v => {
                    if (v.fechaServicio) {
                        const fechaLocal = new Date(v.fechaServicio);
                        console.log(`  - UTC: ${v.fechaServicio.toISOString()}`);
                        console.log(`    Local: ${fechaLocal.toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })}`);
                        console.log(`    Periodo: ${v.periodoContable?.mes}/${v.periodoContable?.año} - $${v.montoAcordado || 0}`);
                    } else {
                        console.log(`  - Sin fecha - Periodo: ${v.periodoContable?.mes}/${v.periodoContable?.año} - $${v.montoAcordado || 0}`);
                    }
                });
            }
            
            console.log(`\nRango de búsqueda por fechas reales:`);
            console.log(`  Inicio: ${inicio.toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })}`);
            console.log(`  Fin: ${fin.toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })}`);

            const viajes = await Viajes.find({
                truckId: camion._id,
                tipoViaje: 'operativo',
                'estado.actual': 'completado',
                $or: [
                    { departureTime: { $gte: inicio, $lte: fin } },
                    { fechaServicio: { $gte: inicio, $lte: fin } }
                ]
            })
            .populate('conductorId', 'name lastName salario')
            .populate('auxiliares.auxiliarId', 'name lastName salario')
            .sort({ fechaServicio: 1 });
            
            console.log(`Viajes encontrados EN EL RANGO (por periodoContable): ${viajes.length}`);
            if (viajes.length > 0) {
                console.log('Fechas de viajes en rango:');
                viajes.forEach(v => {
                    if (v.fechaServicio) {
                        console.log(`  - ${v.fechaServicio.toISOString()} - $${v.montoAcordado || 0}`);
                    }
                });
            }

            // Solo incluir camiones que tuvieron viajes
            if (viajes.length > 0) {
                // Calcular totales
                const ingresos = viajes.reduce((sum, v) => sum + (v.montoAcordado || 0), 0);

                // Obtener TODOS los registros de diesel del camión en el rango de fechas
                // Buscar registros donde la fecha (o fechaHora) esté dentro del rango
                const todosRegistrosDiesel = await ResumenDiesel.find({
                    CicurlationCard: camion._id,
                    $or: [
                        { fecha: { $gte: inicio, $lte: fin } },
                        { fechaHora: { $gte: inicio, $lte: fin } }
                    ]
                });

                const dieselTotal = todosRegistrosDiesel.reduce((sum, d) => sum + (d.Total || 0), 0);
                console.log(`Diesel encontrado para ${camion.licensePlate}: $${dieselTotal.toFixed(2)}`);

                // Calcular planilla total (suma de planillas de cada viaje)
                let planillaTotal = 0;
                const viajesDetalle = [];

                for (const viaje of viajes) {
                    let planillaViaje = 0;
                    const personal = [];

                    // Calcular planilla del conductor
                    if (viaje.conductorId) {
                        // PRIMERO intentar usar salario histórico, si no, usar salario actual
                        let salario = viaje.conductorId.salario || 0;
                        if (viaje.salariosCargados && viaje.salariosCargados.salarioConductor) {
                            salario = viaje.salariosCargados.salarioConductor;
                            console.log(`📊 Usando salario histórico para conductor ${viaje.conductorId.name}: $${salario}`);
                        }
                        const salarioDiario = salario / diasNum;
                        planillaViaje += salarioDiario;
                        personal.push({
                            rol: 'Motorista',
                            nombre: `${viaje.conductorId.name || ''} ${viaje.conductorId.lastName || ''}`.trim() || 'N/A',
                            salarioDiario: salarioDiario
                        });
                    }

                    // Calcular planilla de auxiliares
                    if (viaje.auxiliares && viaje.auxiliares.length > 0) {
                        for (let idx = 0; idx < viaje.auxiliares.length; idx++) {
                            const aux = viaje.auxiliares[idx];
                            if (aux.auxiliarId) {
                                // PRIMERO intentar usar salario histórico, si no, usar salario actual
                                let salario = aux.auxiliarId.salario || 0;
                                if (viaje.salariosCargados && 
                                    viaje.salariosCargados.salariosAuxiliares && 
                                    viaje.salariosCargados.salariosAuxiliares[idx]) {
                                    salario = viaje.salariosCargados.salariosAuxiliares[idx].salario || 0;
                                    console.log(`📊 Usando salario histórico para auxiliar ${aux.auxiliarId.name}: $${salario}`);
                                }
                                const salarioDiario = salario / diasNum;
                                planillaViaje += salarioDiario;
                                personal.push({
                                    rol: 'Auxiliar',
                                    nombre: `${aux.auxiliarId.name || ''} ${aux.auxiliarId.lastName || ''}`.trim() || 'N/A',
                                    salarioDiario: salarioDiario
                                });
                            }
                        }
                    }

                    planillaTotal += planillaViaje;

                    // Buscar diesel del día específico del viaje (comparar solo fechas, no hora)
                    let dieselDelDia = 0;
                    let infoGasolina = null;
                    
                    if (viaje.fechaServicio) {
                        const fechaViaje = new Date(viaje.fechaServicio);
                        const diaViaje = fechaViaje.getDate();
                        const mesViaje = fechaViaje.getMonth() + 1;
                        const anoViaje = fechaViaje.getFullYear();

                        // Tomar TODOS los registros de diesel de ese día
                        const registrosDia = todosRegistrosDiesel.filter(d => {
                            // Usar 'fecha' primero, luego 'fechaHora' como fallback
                            const fechaDiesel = new Date(d.fecha || d.fechaHora);
                            const diaDiesel = fechaDiesel.getDate();
                            const mesDiesel = fechaDiesel.getMonth() + 1;
                            const anoDiesel = fechaDiesel.getFullYear();
                            
                            return diaDiesel === diaViaje && mesDiesel === mesViaje && anoDiesel === anoViaje;
                        });
                        
                        if (registrosDia.length > 0) {
                            dieselDelDia = registrosDia.reduce((acc, d) => acc + (d.Total || 0), 0);
                            const galonesDia = registrosDia.reduce((acc, d) => acc + (d.Galones || 0), 0);
                            // Usar 'fecha' primero, luego 'fechaHora' como fallback
                            const fechaGasolina = new Date(registrosDia[0].fecha || registrosDia[0].fechaHora);
                            infoGasolina = {
                                hora: fechaGasolina.toLocaleTimeString('es-SV', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                    timeZone: 'America/El_Salvador'
                                }),
                                galones: galonesDia,
                                total: dieselDelDia
                            };
                        }
                    }

                    viajesDetalle.push({
                        fecha: viaje.fechaServicio || new Date(viaje.periodoContable.año, viaje.periodoContable.mes - 1, 1),
                        periodo: `${viaje.periodoContable?.mes}/${viaje.periodoContable?.año}`,
                        monto: viaje.montoAcordado || 0,
                        planilla: planillaViaje,
                        diesel: dieselDelDia,
                        personal: personal,
                        tieneDiesel: dieselDelDia > 0,
                        infoGasolina: infoGasolina,
                        departureTime: viaje.departureTime
                    });
                }

                // Agrupar viajes por fecha (día)
                const viajesPorDia = {};
                viajesDetalle.forEach(viaje => {
                    const fechaViaje = new Date(viaje.departureTime || viaje.fecha);
                    const keyFecha = fechaViaje.toLocaleDateString('es-SV', {
                        timeZone: 'America/El_Salvador'
                    });
                    
                    if (!viajesPorDia[keyFecha]) {
                        viajesPorDia[keyFecha] = [];
                    }
                    viajesPorDia[keyFecha].push(viaje);
                });

                // NUEVO: También agrupar registros de diesel por fecha
                const dieselPorDia = {};
                todosRegistrosDiesel.forEach(diesel => {
                    // Usar 'fecha' primero, luego 'fechaHora' como fallback
                    const fechaDiesel = new Date(diesel.fecha || diesel.fechaHora);
                    const keyFecha = fechaDiesel.toLocaleDateString('es-SV', {
                        timeZone: 'America/El_Salvador'
                    });
                    
                    if (!dieselPorDia[keyFecha]) {
                        dieselPorDia[keyFecha] = [];
                    }
                    dieselPorDia[keyFecha].push(diesel);
                });

                // Combinar fechas de viajes y diesel
                const todasLasFechas = new Set([
                    ...Object.keys(viajesPorDia),
                    ...Object.keys(dieselPorDia)
                ]);

                // Convertir a array y ordenar por fecha
                const diasConViajes = Array.from(todasLasFechas)
                    .map(fecha => {
                        const viajesDelDia = viajesPorDia[fecha] || [];
                        const dieselDelDia = dieselPorDia[fecha] || [];
                        
                        return {
                            fecha,
                            viajes: viajesDelDia.sort((a, b) => {
                                const horaA = new Date(a.departureTime || a.fecha).getTime();
                                const horaB = new Date(b.departureTime || b.fecha).getTime();
                                return horaA - horaB;
                            }),
                            registrosDiesel: dieselDelDia
                        };
                    })
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                datosCamiones.push({
                    placa: camion.licensePlate,
                    cantidadViajes: viajes.length,
                    ingresos: ingresos,
                    diesel: dieselTotal,
                    planilla: planillaTotal,
                    utilidadBruta: ingresos - dieselTotal - planillaTotal,
                    viajes: viajesDetalle,
                    diasConViajes: diasConViajes
                });
            }
        }

        console.log(`\n=== RESUMEN DE BÚSQUEDA ===`);
        console.log(`Camiones con viajes en el rango: ${datosCamiones.length}`);
        console.log(`Placas encontradas: ${datosCamiones.map(c => c.placa).join(', ')}`);

        if (datosCamiones.length === 0) {
            console.log('⚠️ No se encontraron viajes en el rango especificado');
            return res.status(404).json({
                success: false,
                message: 'No se encontraron viajes en el rango de fechas especificado'
            });
        }

        // Calcular totales generales
        const totales = datosCamiones.reduce((acc, c) => ({
            viajes: acc.viajes + c.cantidadViajes,
            ingresos: acc.ingresos + c.ingresos,
            diesel: acc.diesel + c.diesel,
            planilla: acc.planilla + c.planilla,
            utilidadBruta: acc.utilidadBruta + c.utilidadBruta
        }), { viajes: 0, ingresos: 0, diesel: 0, planilla: 0, utilidadBruta: 0 });

        // Convertir logo a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Formatear fechas para el título (timezone El Salvador)
        const fechaInicioFormato = inicio.toLocaleDateString('es-SV', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'America/El_Salvador'
        });
        const fechaFinFormato = fin.toLocaleDateString('es-SV', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'America/El_Salvador'
        });

        // Generar HTML
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Consolidado por Rango</title>
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

        .camion-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .camion-title {
            background: #34353A;
            color: white;
            padding: 6px 10px;
            margin-bottom: 5px;
            font-size: 10px;
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

        .text-right {
            text-align: right;
        }

        .personal-list {
            font-size: 7px;
            line-height: 1.4;
            text-align: left;
        }

        .personal-item {
            margin-bottom: 2px;
        }

        .rol-badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-weight: bold;
            margin-right: 3px;
            font-size: 6px;
        }

        .motorista {
            background: #5F8EAD;
            color: white;
        }

        .auxiliar {
            background: #5D9646;
            color: white;
        }

        .col-monto {
            font-weight: 600;
            color: #5F8EAD;
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
        <div class="subtitle">${fechaInicioFormato} - ${fechaFinFormato}</div>
    </div>

    ${datosCamiones.map(camion => `
        <div class="camion-section">
            <div class="camion-title">PLACA: ${camion.placa} | VIAJES: ${camion.cantidadViajes} | INGRESOS: $${camion.ingresos.toFixed(2)} | DIESEL: $${camion.diesel.toFixed(2)} | PLANILLA: $${camion.planilla.toFixed(2)} | UTILIDAD: $${camion.utilidadBruta.toFixed(2)}</div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 18%">FECHA Y HORA</th>
                        <th style="width: 35%">PERSONAL ASIGNADO</th>
                        <th style="width: 12%">INGRESO</th>
                        <th style="width: 12%">DIESEL</th>
                        <th style="width: 12%">PLANILLA DÍA</th>
                        <th style="width: 11%">UTILIDAD</th>
                    </tr>
                </thead>
                <tbody>
                    ${camion.diasConViajes.map(dia => {
                        // Acumular en centavos y dividir al final para evitar errores de precisión
                        const ingresosDiaCentavos = dia.viajes.reduce((acc, v) => acc + Math.round((v.monto || 0) * 100), 0);
                        const ingresosDia = ingresosDiaCentavos / 100;
                        
                        const planillaDiaCentavos = dia.viajes.reduce((acc, v) => acc + Math.round((v.planilla || 0) * 100), 0);
                        const planillaDia = planillaDiaCentavos / 100;
                        
                        // Calcular diesel del día: PRIMERO intentar desde registros, si no, sumar de los viajes
                        let dieselDia = 0;
                        let infoGasolinaDelDia = null;
                        
                        if (dia.registrosDiesel && dia.registrosDiesel.length > 0) {
                            const dieselDiaCentavos = dia.registrosDiesel.reduce((acc, d) => acc + Math.round((d.Total || 0) * 100), 0);
                            dieselDia = dieselDiaCentavos / 100;
                            const galonesDiaCentavos = dia.registrosDiesel.reduce((acc, d) => acc + Math.round((d.Galones || 0) * 100), 0);
                            const galonesDia = galonesDiaCentavos / 100;
                            // Usar 'fecha' primero, luego 'fechaHora' como fallback
                            const fechaGasolina = new Date(dia.registrosDiesel[0].fecha || dia.registrosDiesel[0].fechaHora);
                            infoGasolinaDelDia = {
                                hora: fechaGasolina.toLocaleTimeString('es-SV', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                    timeZone: 'America/El_Salvador'
                                }),
                                galones: galonesDia,
                                total: dieselDia
                            };
                        } else {
                            // Si no hay registros de diesel directos, sumar el diesel de todos los viajes del día
                            const dieselDiaCentavos = dia.viajes.reduce((acc, v) => acc + Math.round((v.diesel || 0) * 100), 0);
                            dieselDia = dieselDiaCentavos / 100;
                            // Buscar información de gasolina del primer viaje que la tenga
                            const viajeConGasolina = dia.viajes.find(v => v.infoGasolina);
                            if (viajeConGasolina) {
                                infoGasolinaDelDia = viajeConGasolina.infoGasolina;
                            }
                        }
                        
                        const utilidadDia = ingresosDia - dieselDia - planillaDia;

                        // Si hay viajes ese día
                        if (dia.viajes.length > 0) {
                            const filasViajes = dia.viajes.map((viaje, idx) => {
                                const utilidadViaje = viaje.monto - viaje.diesel - viaje.planilla;
                                const fechaViaje = new Date(viaje.departureTime || viaje.fecha);
                                
                                const fechaFormateada = fechaViaje.toLocaleDateString('es-SV', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'America/El_Salvador'
                                });
                                
                                const horaFormateada = fechaViaje.toLocaleTimeString('es-SV', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                    timeZone: 'America/El_Salvador'
                                });

                                const dieselCell = idx === 0
                                    ? `<td class="col-monto" rowspan="${dia.viajes.length}">${dieselDia > 0 ? `<strong style="color: #5D9646;">$${dieselDia.toFixed(2)}</strong>${infoGasolinaDelDia ? `<br/><small>${infoGasolinaDelDia.galones || 0} gal</small>` : ''}` : '-'}</td>`
                                    : '';

                                return `
                                <tr>
                                    <td><strong>${fechaFormateada}</strong><br/>${horaFormateada}</td>
                                    <td>
                                        <div class="personal-list">
                                            ${viaje.personal.map(p => `
                                                <div class="personal-item">
                                                    <span class="rol-badge ${p.rol.toLowerCase()}">${p.rol}</span>
                                                    <strong>${p.nombre}</strong> - $${p.salarioDiario.toFixed(2)}/día
                                                </div>
                                            `).join('')}
                                        </div>
                                    </td>
                                    <td class="col-monto">$${viaje.monto.toFixed(2)}</td>
                                    ${dieselCell}
                                    <td class="col-monto">$${viaje.planilla.toFixed(2)}</td>
                                    <td class="col-monto ${utilidadViaje >= 0 ? 'positivo' : 'negativo'}">
                                        $${utilidadViaje.toFixed(2)}
                                    </td>
                                </tr>
                                `;
                            }).join('');

                            const filaResumen = `
                                <tr style="background: #E8F4FF; font-weight: bold;">
                                    <td colspan="2"></td>
                                    <td class="col-monto">$${ingresosDia.toFixed(2)}</td>
                                    <td class="col-monto"><strong style="color: #5D9646;">$${dieselDia.toFixed(2)}</strong></td>
                                    <td class="col-monto">$${planillaDia.toFixed(2)}</td>
                                    <td class="col-monto ${utilidadDia >= 0 ? 'positivo' : 'negativo'}">$${utilidadDia.toFixed(2)}</td>
                                </tr>`;

                            return filasViajes + filaResumen;
                        } else if (dia.registrosDiesel && dia.registrosDiesel.length > 0) {
                            // Si NO hay viajes pero SÍ hay registros de diesel ese día
                            // Usar 'fecha' primero, luego 'fechaHora' como fallback
                            const fechaPrimera = new Date(dia.registrosDiesel[0].fecha || dia.registrosDiesel[0].fechaHora);
                            const fechaFormateada = fechaPrimera.toLocaleDateString('es-SV', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                timeZone: 'America/El_Salvador'
                            });

                            return `
                                <tr style="background: #FFF8DC;">
                                    <td><strong>${fechaFormateada}</strong><br/><em>Solo carga de combustible</em></td>
                                    <td style="text-align: center; font-style: italic; color: #666;">Sin viajes registrados</td>
                                    <td class="col-monto">-</td>
                                    <td class="col-monto" style="background: #E8F5E9;"><strong style="color: #5D9646;">$${dieselDia.toFixed(2)}</strong><br/><small>${infoGasolinaDelDia.galones || 0} gal</small></td>
                                    <td class="col-monto">-</td>
                                    <td class="col-monto">-</td>
                                </tr>`;
                        }
                        
                        return '';
                    }).join('')}
                    <tr style="background: #34353A; color: white; font-weight: bold; font-size: 9px;">
                        <td colspan="2" style="text-align: center; padding: 10px; border: 2px solid #5D9646;">TOTAL CAMIÓN</td>
                        <td style="padding: 10px; border: 2px solid #5D9646;">$${camion.ingresos.toFixed(2)}</td>
                        <td style="padding: 10px; border: 2px solid #5D9646;">$${camion.diesel.toFixed(2)}</td>
                        <td style="padding: 10px; border: 2px solid #5D9646;">$${camion.planilla.toFixed(2)}</td>
                        <td style="padding: 10px; border: 2px solid #5D9646; ${camion.utilidadBruta >= 0 ? 'color: #5D9646;' : 'color: #ff6b6b;'}">$${camion.utilidadBruta.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `).join('')}

    <table>
        <tr class="total-row">
            <td style="width: 15%"><strong>TOTALES</strong></td>
            <td style="width: 30%"><strong>Viajes: ${totales.viajes}</strong></td>
            <td style="width: 12%"><strong>$${totales.ingresos.toFixed(2)}</strong></td>
            <td style="width: 12%"><strong>$${totales.diesel.toFixed(2)}</strong></td>
            <td style="width: 12%"><strong>$${totales.planilla.toFixed(2)}</strong></td>
            <td style="width: 11%"><strong>$${totales.utilidadBruta.toFixed(2)}</strong></td>
        </tr>
    </table>

    <div class="footer">
        <p>Documento generado el ${new Date().toLocaleDateString('es-SV')} a las ${new Date().toLocaleTimeString('es-SV')}</p>
        <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
        <p>Días trabajados para cálculo de planilla: ${diasNum} días</p>
    </div>
</body>
</html>
        `;

        // Generar PDF con Puppeteer
        browser = await launchBrowserSafe();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();

        const nombreArchivo = `resumen-consolidado-${fechaInicio}-${fechaFin}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF por rango:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReporteConsolidadoController;