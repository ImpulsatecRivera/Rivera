/**
 * Controlador para generar reportes PDF de planillas semanales
 * Colores personalizados: #5F8EAD (azul), #5D9646 (verde), #34353A (gris oscuro)
 */

import puppeteer from 'puppeteer';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import { isValidObjectId } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';

const ReportesPlanillaSemanalController = {};

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para convertir imagen a base64
const convertirImagenABase64 = (rutaImagen) => {
    try {
        console.log('Intentando leer imagen desde:', rutaImagen);
        
        if (!fs.existsSync(rutaImagen)) {
            console.error('La imagen no existe en la ruta:', rutaImagen);
            console.log('Contenido del directorio padre:');
            const dirPadre = path.dirname(rutaImagen);
            if (fs.existsSync(dirPadre)) {
                console.log(fs.readdirSync(dirPadre));
            }
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
// Detectar entorno de ejecución
const IS_RENDER = process.env.RENDER === 'true';
const IS_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// OPCIÓN 1: Desde la raíz del proyecto (RECOMENDADO)
// Asumiendo que ejecutas el servidor desde C:\Users\djpoc\Desktop\Rivera\Backend
const RUTA_LOGO = path.join(process.cwd(), 'src', 'imagenes', 'imagen_15.png');

const PUPPETEER_CONFIG = () => {
    if (IS_RENDER || IS_CLOUD_RUN) {
        // Configuración para producción - dejar que Puppeteer encuentre Chrome automáticamente
        console.log('🚀 Usando configuración de producción (auto-detect Chrome)');
        return {
            headless: 'new',
            // NO especificar executablePath - Puppeteer lo buscará automáticamente
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-web-resources'
            ]
        };
    } else {
        // Configuración para desarrollo local
        console.log('🚀 Usando configuración de desarrollo local');
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
        serviceName: 'reportes-planilla-semanal',
        primaryConfig: PUPPETEER_CONFIG()
    });
};

// OPCIÓN 2: Si no funciona la opción 1, usa ruta absoluta directa:
// const RUTA_LOGO = 'C:\\Users\\djpoc\\Desktop\\Rivera\\Backend\\src\\imagenes\\imagen_15.png';

// OPCIÓN 3: Si el controlador está en Backend/src/Controllers/
// const RUTA_LOGO = path.join(__dirname, '..', 'imagenes', 'imagen_15.png');

const redondearDinero = (valor) => {
    return Math.round(valor * 100) / 100;
};

const formatearFecha = (fecha) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const f = new Date(fecha);
    return `${f.getDate()} de ${meses[f.getMonth()]} ${f.getFullYear()}`;
};

const formatearRangoFechas = (inicio, fin) => {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    const diaInicio = fechaInicio.getDate();
    const diaFin = fechaFin.getDate();
    const mesInicio = meses[fechaInicio.getMonth()];
    const mesFin = meses[fechaFin.getMonth()];
    const anioInicio = fechaInicio.getFullYear();
    const anioFin = fechaFin.getFullYear();

    // Mismo mes y mismo año: formato compacto
    if (fechaInicio.getMonth() === fechaFin.getMonth() && anioInicio === anioFin) {
        return `DEL ${diaInicio} AL ${diaFin} DE ${mesInicio} ${anioInicio}`;
    }

    // Mismo año pero meses distintos
    if (anioInicio === anioFin) {
        return `DEL ${diaInicio} DE ${mesInicio} AL ${diaFin} DE ${mesFin} ${anioInicio}`;
    }

    // Diferente año
    return `DEL ${diaInicio} DE ${mesInicio} ${anioInicio} AL ${diaFin} DE ${mesFin} ${anioFin}`;
};

const normalizarTexto = (texto) => {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')          // eliminar acentos
        .replace(/[^A-Za-z0-9 ]+/g, '')             // eliminar caracteres no alfanuméricos
        .replace(/\s+/g, ' ')                      // normalizar espacios
        .trim()
        .toUpperCase();
};

// Parsear valores monetarios tolerantes a formatos: numbers, strings con '$', comas, espacios
const parseCurrency = (val) => {
    if (val === null || typeof val === 'undefined') return 0;
    if (typeof val === 'number' && !isNaN(val)) return val;
    try {
        let s = String(val).trim();
        // eliminar signos de moneda y espacios
        s = s.replace(/[^0-9,.-]+/g, '');
        // si usa coma como separador decimal (ej "25,00"), convertir a punto
        const commaCount = (s.match(/,/g) || []).length;
        const dotCount = (s.match(/\./g) || []).length;
        if (commaCount > 0 && dotCount === 0) {
            s = s.replace(/,/g, '.');
        } else if (commaCount > 0 && dotCount > 0 && s.indexOf(',') > s.indexOf('.')) {
            // caso "1.234,56" -> eliminar puntos de miles y cambiar coma por punto
            s = s.replace(/\./g, '').replace(/,/g, '.');
        } else {
            // eliminar comas sobrantes
            s = s.replace(/,/g, '');
        }

        const n = Number(s);
        return isNaN(n) ? 0 : n;
    } catch (e) {
        return 0;
    }
};

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

        // Validar que la planilla tenga los datos necesarios
        if (!planilla.empleados || !Array.isArray(planilla.empleados) || planilla.empleados.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La planilla no tiene empleados'
            });
        }

        if (!planilla.totales) {
            return res.status(400).json({
                success: false,
                message: 'La planilla no tiene datos de totales'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLSemanalDetallado(planilla, logoBase64);

        browser = await launchBrowserSafe();

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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=planilla-semanal-${formatearFecha(planilla.fechaInicio)}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF semanal detallado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

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

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLMensual(planillas, mesNum, anoNum, logoBase64);

        browser = await launchBrowserSafe();

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

// Reporte mensual solo de viáticos (viajes extra)
ReportesPlanillaSemanalController.generarPDFMensualViaticos = async (req, res) => {
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

        const planillas = await PlanillaSemanal.find({
            fechaInicio: {
                $gte: new Date(anoNum, mesNum - 1, 1),
                $lt: new Date(anoNum, mesNum, 1)
            }
        }).sort({ fechaInicio: 1 });

        console.log(`Reporte mensual viáticos: mes=${mesNum} año=${anoNum}. Planillas encontradas: ${planillas.length}`);
        planillas.forEach((p, index) => {
            console.log(`  Planilla ${index + 1}: id=${p._id}, fechaInicio=${p.fechaInicio?.toISOString() || 'n/a'}, empleados=${(p.empleados || []).length}`);
        });

        if (!planillas || planillas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron planillas para este mes'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLMensualViaticos(planillas, mesNum, anoNum, logoBase64);

        browser = await launchBrowserSafe();

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

        const nombreMes = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][mesNum - 1];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viaticos-extra-${nombreMes}-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF mensual de viáticos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte mensual de viáticos',
            error: error.message
        });
    }
};

// Reporte consolidado de múltiples meses solo viáticos
ReportesPlanillaSemanalController.generarPDFMultiMesViaticos = async (req, res) => {
    let browser;
    try {
        const { meses, ano } = req.body;

        if (!Array.isArray(meses) || meses.length === 0 || meses.length > 9) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar entre 1 y 9 meses'
            });
        }

        const mesesValidos = meses.every(m => m >= 1 && m <= 12);
        if (!mesesValidos) {
            return res.status(400).json({
                success: false,
                message: 'Todos los meses deben estar entre 1 y 12'
            });
        }

        const anoNum = parseInt(ano);
        const planillasPorMes = [];

        for (const mes of meses) {
            const planillas = await PlanillaSemanal.find({
                fechaInicio: {
                    $gte: new Date(anoNum, mes - 1, 1),
                    $lt: new Date(anoNum, mes, 1)
                }
            }).sort({ fechaInicio: 1 });

            planillasPorMes.push({ mes, planillas });
        }

        const hayPlanillas = planillasPorMes.some(p => p.planillas && p.planillas.length > 0);
        if (!hayPlanillas) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron planillas en los meses seleccionados'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLMultiMesViaticos(planillasPorMes, anoNum, logoBase64);

        browser = await launchBrowserSafe();
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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viaticos-extra-multimes-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF multi-mes de viáticos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte multi-mes de viáticos',
            error: error.message
        });
    }
};

// Reporte anual solo viáticos
ReportesPlanillaSemanalController.generarPDFAnualViaticos = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        const planillasPorMes = [];

        for (let mes = 1; mes <= 12; mes++) {
            const planillas = await PlanillaSemanal.find({
                fechaInicio: {
                    $gte: new Date(anoNum, mes - 1, 1),
                    $lt: new Date(anoNum, mes, 1)
                }
            }).sort({ fechaInicio: 1 });

            planillasPorMes.push({ mes, planillas });
        }

        const hayPlanillas = planillasPorMes.some(p => p.planillas && p.planillas.length > 0);
        if (!hayPlanillas) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron planillas para este año'
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLMultiMesViaticos(planillasPorMes, anoNum, logoBase64, true);

        browser = await launchBrowserSafe();
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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=viaticos-extra-anual-${anoNum}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF anual de viáticos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte anual de viáticos',
            error: error.message
        });
    }
};

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

        const mesesValidos = meses.every(m => m >= 1 && m <= 12);
        if (!mesesValidos) {
            return res.status(400).json({
                success: false,
                message: 'Todos los meses deben estar entre 1 y 12'
            });
        }

        const anoNum = parseInt(ano);
        const planillasPorMes = [];

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

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLMultiMes(planillasPorMes, anoNum, logoBase64);

        browser = await launchBrowserSafe();

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

ReportesPlanillaSemanalController.generarPDFAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const anoNum = parseInt(ano);

        const planillasPorMes = [];

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

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);
        const html = generarHTMLAnual(planillasPorMes, anoNum, logoBase64);

        browser = await launchBrowserSafe();

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

function generarHTMLSemanalDetallado(planilla, logoBase64) {
    try {
        // Validaciones de datos
        if (!planilla.empleados || !Array.isArray(planilla.empleados)) {
            throw new Error('Datos de empleados no válidos');
        }

        if (!planilla.totales) {
            throw new Error('Datos de totales no válidos');
        }

        const titulo = `PLANILLA SEMANAL, VIÁTICOS Y ANTICIPO ${formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin)}`;
        
        const diasFechas = {};
        if (planilla.empleados.length > 0 && planilla.empleados[0].dias && Array.isArray(planilla.empleados[0].dias) && planilla.empleados[0].dias.length > 0) {
            planilla.empleados[0].dias.forEach(d => {
                const fecha = new Date(d.fecha);
                diasFechas[d.dia] = fecha.getDate();
            });
        }

        let filasEmpleados = '';
        let numeroEmpleado = 1;

        planilla.empleados.forEach(emp => {
            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            
            const datosDias = {};
            if (emp.dias && Array.isArray(emp.dias)) {
                emp.dias.forEach(d => {
                    datosDias[d.dia] = d;
                });
            }

            const totalBase = parseCurrency(emp.totalBase || 0);
            const totalViaticos = parseCurrency(emp.totalViaticos || emp.viaticos || 0);
            const anticipos = parseCurrency(emp.anticipos || 0);
            const totalDescuentos = parseCurrency(emp.totalDescuentos || 0);
            const totalAPagar = parseCurrency(emp.totalAPagar || 0);

            filasEmpleados += `
                <tr>
                    <td>${numeroEmpleado}</td>
                    <td style="text-align: left;">${emp.nombreCompleto || 'N/A'}</td>
            `;

            dias.forEach(dia => {
                const dato = datosDias[dia] || { base: 0, viaticos: 0 };
                const base = dato.base || 0;
                const viaticos = dato.viaticos || 0;

                filasEmpleados += `
                    <td>$ ${base > 0 ? base.toFixed(2) : '-'}</td>
                    <td>$ ${viaticos > 0 ? viaticos.toFixed(2) : '-'}</td>
                `;
            });

            filasEmpleados += `
                    <td style="background-color: #e8f4e8;">$ ${totalBase.toFixed(2)}</td>
                    <td style="background-color: #e8f4e8;">$ ${totalViaticos.toFixed(2)}</td>
                    <td>$ ${anticipos > 0 ? anticipos.toFixed(2) : '-'}</td>
                    <td>$ ${totalDescuentos > 0 ? totalDescuentos.toFixed(2) : '-'}</td>
                    <td style="background-color: #e8f4e8; font-weight: bold;">$ ${totalAPagar.toFixed(2)}</td>
                </tr>
            `;

            numeroEmpleado++;
        });

        const totales = planilla.totales;
        const filaTotales = `
            <tr style="font-weight: bold; background-color: #5D9646; color: white;">
                <td colspan="2">TOTAL</td>
                <td colspan="12"></td>
                <td>$ ${(totales.totalBase || 0).toFixed(2)}</td>
                <td>$ ${(totales.totalViaticos || 0).toFixed(2)}</td>
                <td>$ ${(totales.totalAnticipos || 0).toFixed(2)}</td>
                <td>$ ${(totales.totalDescuentos || 0).toFixed(2)}</td>
                <td>$ ${(totales.totalAPagar || 0).toFixed(2)}</td>
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
                        color: #34353A;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 3px solid #5F8EAD;
                    }
                    
                    .header .logo-container {
                        margin-bottom: 10px;
                    }
                    
                    .header .logo-container img {
                        max-width: 200px;
                        height: auto;
                    }
                    
                    h1 {
                        font-size: 11px;
                        margin-bottom: 5px;
                        font-weight: bold;
                        color: #34353A;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #5F8EAD;
                        padding: 4px 2px;
                        text-align: center;
                        font-size: 8px;
                    }
                    
                    th {
                        background-color: #34353A;
                        color: white;
                        font-weight: bold;
                        font-size: 7px;
                    }
                    
                    .header-dia {
                        background-color: #5F8EAD;
                        color: white;
                        font-size: 7px;
                        font-weight: bold;
                    }
                    
                    .footer {
                        margin-top: 20px;
                        font-size: 8px;
                        text-align: center;
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
                    <h1>${titulo}</h1>
                </div>
                
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
                            <th rowspan="2" style="background-color: #5D9646;">BASE</th>
                            <th rowspan="2" style="background-color: #5D9646;">VIÁTICOS</th>
                            <th rowspan="2">ANTICIPO</th>
                            <th rowspan="2">DESCUENTO-<br/>FALTAS</th>
                            <th rowspan="2" style="background-color: #5D9646;">TOTAL A PAGAR</th>
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
                
                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
                </div>
            </body>
            </html>
        `;
    } catch (error) {
        console.error('Error en generarHTMLSemanalDetallado:', error);
        throw error;
    }
}

function generarHTMLMensual(planillas, mes, ano, logoBase64) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const titulo = `PLANILLA DE EXTRA ${meses[mes - 1]} ${ano}`;

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
                total: parseCurrency(emp.totalAPagar || emp.totalSalarioMasViaticos || 0)
            });
        });
    });

    let filasEmpleados = '';
    let numeroEmpleado = 1;
    const maxSemanas = planillas.length;

    empleadosMap.forEach((data, empleadoId) => {
        let totalEmpleado = 0;
        let columnasSemanales = '';

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
                <td style="text-align: left; padding-left: 10px;">${data.nombreCompleto}</td>
                ${columnasSemanales}
                <td style="font-weight: bold; background-color: #e8f4e8;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

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

    let headersSemanales = '';
    planillas.forEach((planilla, index) => {
        headersSemanales += `<th style="background-color: #5F8EAD; color: white;">${formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin)}</th>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #5D9646; color: white;">
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
                    font-size: 10px;
                    padding: 10px;
                    color: #34353A;
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
                    max-width: 180px;
                    height: auto;
                }
                
                h1 {
                    text-align: center;
                    font-size: 12px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #34353A;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                
                th, td {
                    border: 1px solid #5F8EAD;
                    padding: 5px 3px;
                    text-align: center;
                    font-size: 9px;
                }
                
                th {
                    background-color: #34353A;
                    color: white;
                    font-weight: bold;
                    font-size: 8px;
                }
                
                .footer {
                    margin-top: 20px;
                    font-size: 8px;
                    text-align: center;
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
                <h1>${titulo}</h1>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersSemanales}
                        <th style="background-color: #5D9646;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

// Variante mensual que consolida solo viáticos por semana
function generarHTMLMensualViaticos(planillas, mes, ano, logoBase64) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const titulo = `VIÁTICOS DE EXTRA ${meses[mes - 1]} ${ano}`;

    const rangosSemanas = planillas.map(planilla => formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin));
    const empleadosMap = new Map();
    const nombresDuplicados = new Map();

    console.log(`generarHTMLMensualViaticos: construyendo reporte para mes=${mes} año=${ano}. Planillas=${planillas.length}`);
    planillas.forEach((planilla, planillaIndex) => {
        const rango = formatearRangoFechas(planilla.fechaInicio, planilla.fechaFin);
        console.log(`  planilla[${planillaIndex}] rango=${rango} empleados=${(planilla.empleados || []).length}`);
        planilla.empleados.forEach(emp => {
            const empleadoId = emp.empleadoId ? emp.empleadoId.toString() : 'sin-id';
            const nombreOriginal = String(emp.nombreCompleto || 'SIN NOMBRE').trim();
            const nombreNormalizado = normalizarTexto(nombreOriginal);
            // Usar empleadoId como clave única cuando esté disponible, sino usar nombre normalizado
            const key = empleadoId !== 'sin-id' ? empleadoId : nombreNormalizado;

            if (!nombresDuplicados.has(nombreNormalizado)) {
                nombresDuplicados.set(nombreNormalizado, new Set());
            }
            nombresDuplicados.get(nombreNormalizado).add(empleadoId);

            if (!empleadosMap.has(key)) {
                empleadosMap.set(key, {
                    empleadoId,
                    nombreCompleto: nombreOriginal,
                    totalesPorSemana: new Map()
                });
            }

            // Determinar monto de viáticos para esta planilla/empleado con múltiples fallbacks
            let viaticosEmpleado = 0;
            let fuenteViaticos = 'ninguna';
            try {
                if (emp && typeof emp.totalViaticos !== 'undefined' && emp.totalViaticos !== null) {
                    viaticosEmpleado = parseCurrency(emp.totalViaticos);
                    fuenteViaticos = 'totalViaticos';
                } else if (emp && typeof emp.viaticos !== 'undefined' && emp.viaticos !== null) {
                    viaticosEmpleado = parseCurrency(emp.viaticos);
                    fuenteViaticos = 'viaticos';
                } else if (emp && typeof emp.viatico !== 'undefined' && emp.viatico !== null) {
                    viaticosEmpleado = parseCurrency(emp.viatico);
                    fuenteViaticos = 'viatico';
                } else if (Array.isArray(emp.dias) && emp.dias.length > 0) {
                    // Sumar variantes de viáticos en cada día
                    viaticosEmpleado = emp.dias.reduce((s, d) => {
                        const v = parseCurrency(d.viaticos ?? d.viatico ?? d.viaticoDiario ?? 0);
                        return s + v;
                    }, 0);
                    fuenteViaticos = 'dias';
                }

                // Si aún es 0, buscar cualquier campo con 'viatic' en el nombre
                if ((!viaticosEmpleado || viaticosEmpleado === 0) && emp && typeof emp === 'object') {
                    for (const k of Object.keys(emp)) {
                        if (/viatic/i.test(k)) {
                            const val = parseCurrency(emp[k]);
                            if (val !== 0) {
                                viaticosEmpleado = val;
                                fuenteViaticos = `campo:${k}`;
                                break;
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn(`No se pudo calcular viáticos para empleado ${nombreOriginal}:`, err.message || err);
                viaticosEmpleado = 0;
                fuenteViaticos = 'error';
            }

            const empleadoData = empleadosMap.get(key);
            const montoActual = empleadoData.totalesPorSemana.get(rango) || 0;
            const nuevoMonto = montoActual + viaticosEmpleado;
            empleadoData.totalesPorSemana.set(rango, nuevoMonto);
            console.log(`    empleado=${nombreOriginal} id=${empleadoId} semana=${rango} monto=${viaticosEmpleado} acumulado=${nuevoMonto} (fuente=${fuenteViaticos})`);
        });
    });

    nombresDuplicados.forEach((ids, nombre) => {
        if (ids.size > 1) {
            console.log(`  [DUPLICADO] nombre='${nombre}' tiene ${ids.size} IDs distintos: ${Array.from(ids).join(', ')}`);
        }
    });

    // Fusionar empleados que comparten el mismo nombre normalizado (sumar totales por semana)
    const empleadosFusionados = new Map();
    empleadosMap.forEach((data, key) => {
        const nombreNorm = normalizarTexto(data.nombreCompleto || '');
        if (!empleadosFusionados.has(nombreNorm)) {
            empleadosFusionados.set(nombreNorm, {
                nombreCompleto: data.nombreCompleto,
                empleadoIds: new Set(),
                totalesPorSemana: new Map()
            });
        }

        const target = empleadosFusionados.get(nombreNorm);
        if (data.empleadoId) target.empleadoIds.add(data.empleadoId);

        data.totalesPorSemana.forEach((monto, rango) => {
            const existente = target.totalesPorSemana.get(rango) || 0;
            target.totalesPorSemana.set(rango, existente + monto);
        });
    });

    // Log resumen de fusión cuando se detectaron múltiples IDs por nombre
    empleadosFusionados.forEach((v, nombre) => {
        if (v.empleadoIds.size > 1) {
            console.log(`  [FUSIONADO] nombre='${nombre}' IDs: ${Array.from(v.empleadoIds).join(', ')} -> fila única`);
        }
    });

    let filasEmpleados = '';
    let numeroEmpleado = 1;

    // Ahora iterar sobre empleados ya fusionados por nombre
    empleadosFusionados.forEach((data) => {
        let totalEmpleado = 0;
        let columnasSemanales = '';

        rangosSemanas.forEach((rango) => {
                const monto = data.totalesPorSemana.get(rango) || 0;
            totalEmpleado += monto;
            columnasSemanales += `<td>${monto > 0 ? `$ ${monto.toFixed(2)}` : '$ -'}</td>`;
        });

        filasEmpleados += `
            <tr>
                <td>${numeroEmpleado}</td>
                <td style="text-align: left; padding-left: 10px;">${data.nombreCompleto}</td>
                ${columnasSemanales}
                <td style="font-weight: bold; background-color: #e8f4e8;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    let totalesPorSemana = '';
    let totalGeneral = 0;

    rangosSemanas.forEach((rango) => {
        let totalSemana = 0;
        empleadosMap.forEach((data) => {
            totalSemana += data.totalesPorSemana.get(rango) || 0;
        });

        totalGeneral += totalSemana;
        totalesPorSemana += `<td style="font-weight: bold;">$ ${totalSemana.toFixed(2)}</td>`;
    });

    let headersSemanales = '';
    rangosSemanas.forEach((rango) => {
        headersSemanales += `<th style="background-color: #5F8EAD; color: white;">${rango}</th>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #5D9646; color: white;">
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
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 10px; padding: 10px; color: #34353A; }
                .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #5F8EAD; }
                .header .logo-container { margin-bottom: 8px; }
                .header .logo-container img { max-width: 180px; height: auto; }
                h1 { text-align: center; font-size: 12px; margin-bottom: 5px; font-weight: bold; color: #34353A; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #5F8EAD; padding: 5px 3px; text-align: center; font-size: 9px; }
                th { background-color: #34353A; color: white; font-weight: bold; font-size: 8px; }
                .footer { margin-top: 20px; font-size: 8px; text-align: center; color: #5F8EAD; border-top: 2px solid #5D9646; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>${titulo}</h1>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersSemanales}
                        <th style="background-color: #5D9646;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

function generarHTMLMultiMes(planillasPorMes, ano, logoBase64) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    const mesesIncluidos = planillasPorMes.map(p => meses[p.mes - 1]).join(', ');
    const titulo = `PLANILLA CONSOLIDADA ${mesesIncluidos} ${ano}`;

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

                empleadoData.meses.set(mes, empleadoData.meses.get(mes) + parseCurrency(emp.totalAPagar || emp.totalSalarioMasViaticos || 0));
            });
        });
    });

    let filasEmpleados = '';
    let numeroEmpleado = 1;
    let totalesPorMes = new Map();

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
                <td style="text-align: left; padding-left: 10px;">${data.nombreCompleto}</td>
                ${columnasMeses}
                <td style="font-weight: bold; background-color: #e8f4e8;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    let headersMeses = '';
    planillasPorMes.forEach(({ mes }) => {
        headersMeses += `<th style="background-color: #5F8EAD; color: white;">${meses[mes - 1]}</th>`;
    });

    let columnaTotales = '';
    let granTotal = 0;

    planillasPorMes.forEach(({ mes }) => {
        const total = totalesPorMes.get(mes);
        granTotal += total;
        columnaTotales += `<td style="font-weight: bold;">$ ${total.toFixed(2)}</td>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #5D9646; color: white;">
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
                    font-size: 10px;
                    padding: 10px;
                    color: #34353A;
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
                    max-width: 180px;
                    height: auto;
                }
                
                h1 {
                    text-align: center;
                    font-size: 12px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #34353A;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                
                th, td {
                    border: 1px solid #5F8EAD;
                    padding: 5px 3px;
                    text-align: center;
                    font-size: 9px;
                }
                
                th {
                    background-color: #34353A;
                    color: white;
                    font-weight: bold;
                }
                
                .footer {
                    margin-top: 20px;
                    font-size: 8px;
                    text-align: center;
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
                <h1>${titulo}</h1>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersMeses}
                        <th style="background-color: #5D9646;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

// Consolidado multi-mes solo de viáticos (sirve también para anual usando esAnual=true)
function generarHTMLMultiMesViaticos(planillasPorMes, ano, logoBase64, esAnual = false) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    const mesesIncluidos = esAnual
        ? 'ENERO A DICIEMBRE'
        : planillasPorMes.map(p => meses[p.mes - 1]).join(', ');

    const titulo = esAnual
        ? `VIÁTICOS CONSOLIDADOS AÑO ${ano}`
        : `VIÁTICOS CONSOLIDADOS ${mesesIncluidos} ${ano}`;

    const empleadosMap = new Map();

    const nombresDuplicados = new Map();

    planillasPorMes.forEach(({ mes, planillas }) => {
        planillas.forEach(planilla => {
            planilla.empleados.forEach(emp => {
                const empleadoId = emp.empleadoId ? emp.empleadoId.toString() : 'sin-id';
                const nombreOriginal = String(emp.nombreCompleto || 'SIN NOMBRE').trim();
                const nombreNormalizado = normalizarTexto(nombreOriginal);
                const key = nombreNormalizado;

                if (!nombresDuplicados.has(nombreNormalizado)) {
                    nombresDuplicados.set(nombreNormalizado, new Set());
                }
                nombresDuplicados.get(nombreNormalizado).add(empleadoId);

                if (!empleadosMap.has(key)) {
                    empleadosMap.set(key, {
                        nombreCompleto: nombreOriginal,
                        meses: new Map()
                    });
                }

                const empleadoData = empleadosMap.get(key);
                if (!empleadoData.meses.has(mes)) {
                    empleadoData.meses.set(mes, 0);
                }

                const montoActual = empleadoData.meses.get(mes);
                empleadoData.meses.set(mes, montoActual + (emp.totalViaticos || 0));
            });
        });
    });

    nombresDuplicados.forEach((ids, nombre) => {
        if (ids.size > 1) {
            console.log(`  [DUPLICADO] nombre='${nombre}' tiene ${ids.size} IDs distintos: ${Array.from(ids).join(', ')}`);
        }
    });

    let filasEmpleados = '';
    let numeroEmpleado = 1;
    let totalesPorMes = new Map();

    planillasPorMes.forEach(({ mes }) => {
        totalesPorMes.set(mes, 0);
    });

    empleadosMap.forEach((data) => {
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
                <td style="text-align: left; padding-left: 10px;">${data.nombreCompleto}</td>
                ${columnasMeses}
                <td style="font-weight: bold; background-color: #e8f4e8;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    let headersMeses = '';
    planillasPorMes.forEach(({ mes }) => {
        headersMeses += `<th style="background-color: #5F8EAD; color: white;">${meses[mes - 1]}</th>`;
    });

    let columnaTotales = '';
    let granTotal = 0;

    planillasPorMes.forEach(({ mes }) => {
        const total = totalesPorMes.get(mes) || 0;
        granTotal += total;
        columnaTotales += `<td style="font-weight: bold;">$ ${total.toFixed(2)}</td>`;
    });

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #5D9646; color: white;">
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
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 10px; padding: 10px; color: #34353A; }
                .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #5F8EAD; }
                .header .logo-container { margin-bottom: 8px; }
                .header .logo-container img { max-width: 180px; height: auto; }
                h1 { text-align: center; font-size: 12px; margin-bottom: 5px; font-weight: bold; color: #34353A; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #5F8EAD; padding: 5px 3px; text-align: center; font-size: 9px; }
                th { background-color: #34353A; color: white; font-weight: bold; }
                .footer { margin-top: 20px; font-size: 8px; text-align: center; color: #5F8EAD; border-top: 2px solid #5D9646; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>${titulo}</h1>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersMeses}
                        <th style="background-color: #5D9646;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

function generarHTMLAnual(planillasPorMes, ano, logoBase64) {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const titulo = `PLANILLA ANUAL ${ano}`;

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

    let filasEmpleados = '';
    let numeroEmpleado = 1;
    let totalesPorMes = new Map();

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
                <td style="text-align: left; padding-left: 8px;">${data.nombreCompleto}</td>
                ${columnasMeses}
                <td style="font-weight: bold; background-color: #e8f4e8;">$ ${totalEmpleado.toFixed(2)}</td>
            </tr>
        `;

        numeroEmpleado++;
    });

    let headersMeses = '';
    meses.forEach(mes => {
        headersMeses += `<th style="background-color: #5F8EAD; color: white;">${mes.substring(0, 3)}</th>`;
    });

    let columnaTotales = '';
    let granTotal = 0;

    for (let mes = 1; mes <= 12; mes++) {
        const total = totalesPorMes.get(mes);
        granTotal += total;
        columnaTotales += `<td style="font-weight: bold;">$ ${total.toFixed(2)}</td>`;
    }

    const filaTotales = `
        <tr style="font-weight: bold; background-color: #5D9646; color: white;">
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
                    font-size: 8px;
                    padding: 10px;
                    color: #34353A;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 3px solid #5F8EAD;
                }
                
                .header .logo-container {
                    margin-bottom: 6px;
                }
                
                .header .logo-container img {
                    max-width: 160px;
                    height: auto;
                }
                
                h1 {
                    text-align: center;
                    font-size: 11px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #34353A;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                
                th, td {
                    border: 1px solid #5F8EAD;
                    padding: 3px 2px;
                    text-align: center;
                    font-size: 7px;
                }
                
                th {
                    background-color: #34353A;
                    color: white;
                    font-weight: bold;
                }
                
                .footer {
                    margin-top: 15px;
                    font-size: 7px;
                    text-align: center;
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
                <h1>${titulo}</h1>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOMBRE</th>
                        ${headersMeses}
                        <th style="background-color: #5D9646;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasEmpleados}
                    ${filaTotales}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

export default ReportesPlanillaSemanalController;