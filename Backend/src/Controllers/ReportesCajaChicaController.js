// =====================================================
// CONTROLADOR DE REPORTES DE CAJA CHICA
// =====================================================
// Descripción: Este controlador maneja la generación de PDFs para
// los diferentes tipos de reportes de caja chica.
//
// Tecnologías utilizadas:
// - Puppeteer: Para generar PDFs desde HTML
// - Mongoose: Para consultas a la base de datos
//
// Tipos de reportes disponibles:
// 1. Individual: Comprobante de un movimiento específico
// 2. Consolidado: Todos los movimientos históricos
// 3. Mensual: Movimientos de un mes específico
// 4. Comparativo: Múltiples meses seleccionados
// 5. Diario: Movimientos de un día específico
// 6. Rango de Fechas: Período personalizado
//
// Patrón de diseño:
// - Todos los reportes siguen un diseño tradicional tipo contable
// - Bordes negros sólidos, sin gradientes ni colores modernos
// - Optimizado para impresión (ahorro de tinta)
//
// Manejo especial:
// - employeeId puede ser el string 'admin' o un ObjectId
// - Se hace populate manual solo para ObjectIds válidos
// - Evita errores "Cast to ObjectId failed"
// =====================================================

import CajaChica from '../Models/CajaChica.js';
import puppeteer from 'puppeteer';

const ReportesCajaChicaController = {};

// =====================================================
// FUNCIÓN AUXILIAR: Obtener nombre del mes en español
// =====================================================
// Convierte número de mes (1-12) a nombre en español
// Parámetro: mes (number) - Número del 1 al 12
// Retorna: (string) - Nombre del mes o 'Mes Inválido'
// Ejemplo: obtenerNombreMes(12) -> 'Diciembre'
// =====================================================
function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes Inválido';
}

// =====================================================
// 1. PDF REPORTE INDIVIDUAL DE MOVIMIENTO
// =====================================================
// Genera un PDF con los detalles completos de un movimiento
// específico de caja chica (ingreso o egreso)
//
// Parámetros:
//   - req.params.id: ObjectId del movimiento
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 404: Movimiento no encontrado
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Tabla con información del movimiento
//   - Balance anterior y actual
//   - Empleado responsable
//   - Fecha, hora y descripción
//   - Comprobante (si existe)
//
// Uso típico:
//   GET /api/reportes-caja-chica/individual/507f1f77bcf86cd799439011
// =====================================================
ReportesCajaChicaController.generarPDFIndividual = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;
        
        // PASO 1: Buscar el movimiento SIN populate inicial
        // Importante: No usar .populate() directamente porque employeeId
        // puede ser el string 'admin' en lugar de un ObjectId
        const movimiento = await CajaChica.findById(id);

        if (!movimiento) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado'
            });
        }

        // PASO 2: Hacer populate manual SOLO si NO es 'admin' y es un ObjectId válido
        // Esto evita el error "Cast to ObjectId failed for value 'admin'"
        if (movimiento.employeeId !== 'admin' && movimiento.employeeId) {
            try {
                // Validar que sea un ObjectId válido (24 caracteres hexadecimales)
                if (movimiento.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                    await movimiento.populate('employeeId', 'name email');
                }
            } catch (error) {
                console.log('Error en populate:', error);
            }
        }

        // PASO 3: Determinar el nombre del empleado para mostrar
        const empleado = movimiento.employeeId === 'admin' 
            ? 'Administrador' 
            : movimiento.employeeId?.name || 'N/A';

        const tipoOperacion = movimiento.type === 'income' ? 'INGRESO' : 'EGRESO';

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 11px;
                }
                .stats-row:last-child {
                    border-bottom: none;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #000;
                }
                thead {
                    background: #000;
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #000;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    font-size: 11px;
                    background: #fff;
                }
                .col-label {
                    width: 200px;
                    font-weight: bold;
                    text-align: left;
                    padding-left: 15px;
                }
                .col-value {
                    text-align: left;
                    padding-left: 15px;
                }
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #000;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="subtitle">COMPROBANTE DE ${tipoOperacion}</div>
                <div class="balance-info">$ ${movimiento.currentBalance.toFixed(2)}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span>BALANCE ANTERIOR:</span>
                    <span>$ ${movimiento.previousBalance.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>MONTO DE ${tipoOperacion}:</span>
                    <span>$ ${movimiento.amount.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE ACTUAL:</span>
                    <span>$ ${movimiento.currentBalance.toFixed(2)}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-label">DETALLE</th>
                        <th class="col-value">INFORMACIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="col-label">FECHA:</td>
                        <td class="col-value">${new Date(movimiento.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }).toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">HORA:</td>
                        <td class="col-value">${new Date(movimiento.date).toLocaleTimeString('es-ES')}</td>
                    </tr>
                    <tr>
                        <td class="col-label">EMPLEADO:</td>
                        <td class="col-value">${empleado.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">TIPO DE OPERACIÓN:</td>
                        <td class="col-value">${tipoOperacion}</td>
                    </tr>
                    <tr>
                        <td class="col-label">DESCRIPCIÓN:</td>
                        <td class="col-value">${movimiento.reason.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td class="col-label">ID DE MOVIMIENTO:</td>
                        <td class="col-value">${movimiento._id}</td>
                    </tr>
                    ${movimiento.voucher ? `
                    <tr>
                        <td class="col-label">COMPROBANTE:</td>
                        <td class="col-value">ADJUNTO</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>

            <div class="footer-section">
                <div>BALANCE ACTUAL DE CAJA CHICA</div>
                <div class="balance-final">$ ${movimiento.currentBalance.toFixed(2)}</div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        // PASO 4: Generar el PDF usando Puppeteer
        // - headless: 'new' usa la nueva versión de Chrome headless
        // - args: parámetros necesarios para entornos Docker/Linux
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Crear una nueva página y cargar el HTML
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generar el PDF con formato A4 y márgenes de 20px
        // printBackground: true asegura que los estilos de fondo se impriman
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // PASO 5: Configurar headers y enviar el PDF al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-${tipoOperacion.toLowerCase()}-${Date.now()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        // Asegurar que el navegador se cierre incluso si hay error
        if (browser) await browser.close();
        console.error('Error al generar PDF individual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// =====================================================
// 2. PDF CONSOLIDADO - Todos los movimientos
// =====================================================
// Genera un PDF con TODOS los movimientos de caja chica
// registrados en el sistema, ordenados por fecha (más recientes primero)
//
// Parámetros: Ninguno
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 404: No hay movimientos registrados
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Tabla completa con todos los movimientos
//   - Total de ingresos y egresos
//   - Balance actual
//   - Cantidad de movimientos por tipo
//   - Formato landscape (horizontal) para mejor visualización
//
// Uso típico:
//   GET /api/reportes-caja-chica/todos
//
// Ideal para:
//   - Auditorías completas
//   - Revisión histórica total
//   - Análisis general de caja chica
// =====================================================
ReportesCajaChicaController.generarPDFTodosMovimientos = async (req, res) => {
    let browser;
    try {
        // PASO 1: Buscar todos los movimientos SIN populate inicial
        // Ordenar por fecha descendente (más recientes primero)
        const movimientos = await CajaChica.find()
            .sort({ date: -1, createdAt: -1 });
        
        // PASO 2: Hacer populate manual SOLO para ObjectIds válidos
        // Se usa Promise.all para procesar todos en paralelo (más rápido)
        await Promise.all(
            movimientos.map(async (movement) => {
                if (movement.employeeId !== 'admin' && movement.employeeId) {
                    try {
                        // Validar que sea un ObjectId válido antes de hacer populate
                        if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                            await movement.populate('employeeId', 'name email');
                        }
                    } catch (error) {
                        console.log('Error en populate:', error);
                    }
                }
            })
        );

        if (!movimientos || movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay movimientos registrados en caja chica'
            });
        }

        // Calcular estadísticas
        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        const balanceFinal = movimientos[0].currentBalance;
        const cantidadIngresos = movimientos.filter(m => m.type === 'income').length;
        const cantidadEgresos = movimientos.filter(m => m.type === 'expense').length;

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 11px;
                }
                .stats-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #000;
                }
                thead {
                    background: #000;
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #000;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    font-size: 11px;
                    background: #fff;
                }
                .col-numero {
                    width: 40px;
                    text-align: center;
                    font-weight: bold;
                }
                .col-fecha {
                    width: 90px;
                    text-align: center;
                }
                .col-tipo {
                    width: 80px;
                    text-align: center;
                }
                .col-gastos {
                    text-align: left;
                    padding-left: 15px;
                }
                .col-monto {
                    width: 100px;
                    text-align: right;
                    font-weight: bold;
                    padding-right: 15px;
                }
                .tipo-egreso {
                    color: #000;
                }
                .tipo-ingreso {
                    color: #000;
                    font-weight: bold;
                }
                .total-row {
                    background: #e8e8e8 !important;
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #000;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="balance-info">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span>TOTAL INGRESOS:</span>
                    <span>$ ${totalIngresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL EGRESOS:</span>
                    <span>$ ${totalEgresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>MOVIMIENTOS TOTALES:</span>
                    <span>${movimientos.length}</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE ACTUAL:</span>
                    <span>$ ${balanceFinal.toFixed(2)}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-gastos">GASTOS / DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${movimientos.map((m, index) => {
                        const tipo = m.type === 'income' ? 'INGRESO' : 'EGRESO';
                        const tipoClass = m.type === 'income' ? 'tipo-ingreso' : 'tipo-egreso';
                        
                        return `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-fecha">${new Date(m.date).toLocaleDateString('es-ES')}</td>
                                <td class="col-tipo ${tipoClass}">${tipo}</td>
                                <td class="col-gastos">${m.reason.toUpperCase()}</td>
                                <td class="col-monto">$ ${m.amount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL:</td>
                        <td class="col-monto">$ ${totalEgresos.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-section">
                <div>FALTANTE/SOBRANTE CAJA CHICA</div>
                <div class="balance-final">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
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
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-consolidado-${Date.now()}.pdf"`);
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

// =====================================================
// 3. PDF REPORTE MENSUAL SIMPLE
// =====================================================
// 3. PDF REPORTE MENSUAL SIMPLE
// =====================================================
// Genera un PDF con los movimientos de un mes específico
//
// Parámetros:
//   - req.params.mes: Número del mes (1-12)
//   - req.params.ano: Año (ej: 2025)
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 400: Mes inválido
//   - Error 404: No hay movimientos para ese mes
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Estadísticas del mes (ingresos, egresos)
//   - Balance inicial y final del mes
//   - Variación del mes
//   - Tabla detallada de todos los movimientos
//   - Fila de total al final
//
// Uso típico:
//   GET /api/reportes-caja-chica/mensual-simple/12/2025
//
// Ideal para:
//   - Cierres mensuales
//   - Reportes contables mensuales
//   - Análisis de un mes específico
// =====================================================
ReportesCajaChicaController.generarPDFMensualSimple = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);

        // PASO 1: Validar que el mes esté en rango válido
        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido. Debe estar entre 1 y 12'
            });
        }

        // PASO 2: Construir rango de fechas para el mes completo
        // fechaInicio: Primer día del mes a las 00:00:00
        // fechaFin: Último día del mes a las 23:59:59
        const fechaInicio = new Date(anoNum, mesNum - 1, 1);
        const fechaFin = new Date(anoNum, mesNum, 0, 23, 59, 59);

        // PASO 3: Buscar movimientos del mes SIN populate inicial
        // Ordenar por fecha ascendente (cronológico) para el reporte
        const movimientos = await CajaChica.find({
            date: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        })
        .sort({ date: 1 });

        // PASO 4: Hacer populate manual SOLO para ObjectIds válidos
        await Promise.all(
            movimientos.map(async (movement) => {
                if (movement.employeeId !== 'admin' && movement.employeeId) {
                    try {
                        if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                            await movement.populate('employeeId', 'name email');
                        }
                    } catch (error) {
                        console.log('Error en populate:', error);
                    }
                }
            })
        );

        if (!movimientos || movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay movimientos para ${obtenerNombreMes(mesNum)} ${anoNum}`
            });
        }

        // PASO 5: Calcular estadísticas del mes
        // Total de ingresos: sumar todos los movimientos type='income'
        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        // Total de egresos: sumar todos los movimientos type='expense'
        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        // Balance inicial: previousBalance del primer movimiento del mes
        const balanceInicial = movimientos[0].previousBalance;
        // Balance final: currentBalance del último movimiento del mes
        const balanceFinal = movimientos[movimientos.length - 1].currentBalance;
        const variacion = balanceFinal - balanceInicial;

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 8px;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 11px;
                }
                .stats-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 12px;
                    margin-top: 10px;
                    padding-top: 15px;
                    border-top: 2px solid #000;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                }
                .variacion-box .value {
                    font-size: 18px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #000;
                }
                thead {
                    background: #000;
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #000;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    font-size: 11px;
                    background: #fff;
                }
                .col-numero {
                    width: 40px;
                    text-align: center;
                    font-weight: bold;
                }
                .col-fecha {
                    width: 90px;
                    text-align: center;
                }
                .col-tipo {
                    width: 80px;
                    text-align: center;
                }
                .col-gastos {
                    text-align: left;
                    padding-left: 15px;
                }
                .col-monto {
                    width: 100px;
                    text-align: right;
                    font-weight: bold;
                    padding-right: 15px;
                }
                .total-row {
                    background: #e8e8e8 !important;
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #000;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="subtitle">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</div>
                <div class="balance-info">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span>BALANCE INICIAL:</span>
                    <span>$ ${balanceInicial.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL INGRESOS:</span>
                    <span>$ ${totalIngresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL EGRESOS:</span>
                    <span>$ ${totalEgresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE FINAL:</span>
                    <span>$ ${balanceFinal.toFixed(2)}</span>
                </div>
            </div>

            <div class="variacion-box">
                <div class="label">VARIACIÓN DEL MES</div>
                <div class="value" style="color: ${variacion >= 0 ? '#000' : '#000'}">
                    ${variacion >= 0 ? '+' : ''} $ ${variacion.toFixed(2)}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-gastos">GASTOS / DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${movimientos.map((m, index) => {
                        const tipo = m.type === 'income' ? 'INGRESO' : 'EGRESO';
                        
                        return `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-fecha">${new Date(m.date).toLocaleDateString('es-ES')}</td>
                                <td class="col-tipo">${tipo}</td>
                                <td class="col-gastos">${m.reason.toUpperCase()}</td>
                                <td class="col-monto">$ ${m.amount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL:</td>
                        <td class="col-monto">$ ${totalEgresos.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-section">
                <div>FALTANTE/SOBRANTE CAJA CHICA</div>
                <div class="balance-final">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-${obtenerNombreMes(mesNum).toLowerCase()}-${anoNum}.pdf"`);
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
// =====================================================
// 4. PDF REPORTE COMPARATIVO DE MÚLTIPLES MESES
// =====================================================
// Genera un PDF comparando varios meses seleccionados
// Muestra estadísticas individuales de cada mes y totales generales
//
// Parámetros:
//   - req.body.meses: Array de meses a comparar [1, 3, 6, 12]
//   - req.body.ano: Año común para todos los meses
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 400: Array de meses inválido o vacío
//   - Error 404: No hay movimientos para los meses seleccionados
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Sección individual para cada mes con sus estadísticas
//   - Ingresos, egresos y neto por mes
//   - Resumen general consolidado al final
//   - Comparación visual entre períodos
//
// Uso típico:
//   POST /api/reportes-caja-chica/mensual-multiple
//   Body: { "meses": [10, 11, 12], "ano": 2025 }
//
// Ideal para:
//   - Análisis trimestral
//   - Comparativas mensuales
//   - Identificar tendencias
// =====================================================
ReportesCajaChicaController.generarPDFMultiplesMeses = async (req, res) => {
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

        // Agrupar datos por mes
        const porMes = {};
        let totalGeneralIngresos = 0;
        let totalGeneralEgresos = 0;

        for (const mesNum of mesesValidos) {
            const fechaInicio = new Date(anoNum, mesNum - 1, 1);
            const fechaFin = new Date(anoNum, mesNum, 0, 23, 59, 59);

            // Buscar movimientos SIN populate inicial
            const movimientos = await CajaChica.find({
                date: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });

            // Hacer populate manual SOLO para ObjectIds válidos
            await Promise.all(
                movimientos.map(async (movement) => {
                    if (movement.employeeId !== 'admin' && movement.employeeId) {
                        try {
                            if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                                await movement.populate('employeeId', 'name email');
                            }
                        } catch (error) {
                            console.log('Error en populate:', error);
                        }
                    }
                })
            );

            const ingresos = movimientos
                .filter(m => m.type === 'income')
                .reduce((sum, m) => sum + m.amount, 0);

            const egresos = movimientos
                .filter(m => m.type === 'expense')
                .reduce((sum, m) => sum + m.amount, 0);

            totalGeneralIngresos += ingresos;
            totalGeneralEgresos += egresos;

            porMes[mesNum] = {
                nombre: obtenerNombreMes(mesNum),
                movimientos: movimientos.length,
                ingresos,
                egresos,
                neto: ingresos - egresos
            };
        }

        // Generar HTML para cada mes
        const mesesHTML = mesesValidos.map(mesNum => {
            const datos = porMes[mesNum];
            
            return `
                <div class="mes-section">
                    <div class="mes-header">
                        <h2>${datos.nombre.toUpperCase()} ${anoNum}</h2>
                    </div>
                    <table class="mes-table">
                        <tbody>
                            <tr>
                                <td class="label">INGRESOS:</td>
                                <td class="value">$ ${datos.ingresos.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="label">EGRESOS:</td>
                                <td class="value">$ ${datos.egresos.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="label">NETO:</td>
                                <td class="value"><strong>$ ${datos.neto.toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                                <td class="label">MOVIMIENTOS:</td>
                                <td class="value">${datos.movimientos}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                }
                .mes-section {
                    margin-bottom: 25px;
                    background: #f5f5f5;
                    padding: 20px;
                    border: 2px solid #000;
                }
                .mes-header {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #000;
                    text-align: center;
                }
                .mes-header h2 {
                    font-size: 18px;
                    font-weight: bold;
                }
                .mes-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    border: 2px solid #000;
                }
                .mes-table td {
                    padding: 10px 15px;
                    border: 1px solid #000;
                    font-size: 12px;
                }
                .mes-table .label {
                    font-weight: bold;
                    width: 150px;
                }
                .mes-table .value {
                    text-align: right;
                }
                .resumen-final {
                    background: #f9f9f9;
                    padding: 20px;
                    border: 3px solid #000;
                    text-align: center;
                    margin-top: 30px;
                }
                .resumen-final h3 {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .total-table {
                    width: 100%;
                    margin-top: 15px;
                    border-collapse: collapse;
                    background: #fff;
                    border: 2px solid #000;
                }
                .total-table td {
                    padding: 12px 15px;
                    border: 1px solid #000;
                    font-size: 13px;
                }
                .total-table .label {
                    font-weight: bold;
                    width: 250px;
                }
                .total-table .value {
                    text-align: right;
                    font-weight: bold;
                    font-size: 12px;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="subtitle">REPORTE COMPARATIVO - ${mesesValidos.map(m => obtenerNombreMes(m)).join(', ').toUpperCase()} ${anoNum}</div>
            </div>

            ${mesesHTML}

            <div class="resumen-final">
                <h3>Resumen General</h3>
                <table class="total-table">
                    <tbody>
                        <tr>
                            <td class="label">TOTAL INGRESOS:</td>
                            <td class="value">$ ${totalGeneralIngresos.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td class="label">TOTAL EGRESOS:</td>
                            <td class="value">$ ${totalGeneralEgresos.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td class="label">BALANCE NETO:</td>
                            <td class="value">$ ${(totalGeneralIngresos - totalGeneralEgresos).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td class="label">MESES INCLUIDOS:</td>
                            <td class="value">${mesesValidos.length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
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

        const nombresMeses = mesesValidos.map(m => obtenerNombreMes(m)).join('-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-comparativo-${nombresMeses}-${anoNum}.pdf"`);
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
// =====================================================
// 5. PDF REPORTE DE UN SOLO DÍA (DIARIO)
// =====================================================
// Genera un PDF con todos los movimientos de un día específico
// Incluye la HORA de cada transacción
//
// Parámetros:
//   - req.params.fecha: Fecha en formato YYYY-MM-DD
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 400: Formato de fecha inválido
//   - Error 404: No hay movimientos para ese día
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Tabla con columna de HORA (HH:MM)
//   - Balance inicial y final del día
//   - Variación del día
//   - Fecha completa con día de la semana
//
// Uso típico:
//   GET /api/reportes-caja-chica/diario/2025-12-12
//
// Ideal para:
//   - Cierre de caja diario
//   - Cuadre de turno
//   - Verificación de movimientos del día
//
// Nota: La hora se toma del campo 'date' del movimiento
// =====================================================
ReportesCajaChicaController.generarPDFDiario = async (req, res) => {
    let browser;
    try {
        const { fecha } = req.params; // formato: YYYY-MM-DD

        // Validar formato de fecha
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD'
            });
        }

        // Construir rango de fechas para el día completo
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        // Buscar movimientos SIN populate inicial
        const movimientos = await CajaChica.find({
            date: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        }).sort({ date: 1, createdAt: 1 });

        // Hacer populate manual SOLO para ObjectIds válidos
        await Promise.all(
            movimientos.map(async (movement) => {
                if (movement.employeeId !== 'admin' && movement.employeeId) {
                    try {
                        if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                            await movement.populate('employeeId', 'name email');
                        }
                    } catch (error) {
                        console.log('Error en populate:', error);
                    }
                }
            })
        );

        if (!movimientos || movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay movimientos para el día ${fechaObj.toLocaleDateString('es-ES')}`
            });
        }

        // Calcular estadísticas del día
        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        const balanceInicial = movimientos[0].previousBalance;
        const balanceFinal = movimientos[movimientos.length - 1].currentBalance;
        const variacion = balanceFinal - balanceInicial;

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 8px;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 11px;
                }
                .stats-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 12px;
                    margin-top: 10px;
                    padding-top: 15px;
                    border-top: 2px solid #000;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                }
                .variacion-box .value {
                    font-size: 18px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #000;
                }
                thead {
                    background: #000;
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #000;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    font-size: 11px;
                    background: #fff;
                }
                .col-numero {
                    width: 40px;
                    text-align: center;
                    font-weight: bold;
                }
                .col-hora {
                    width: 80px;
                    text-align: center;
                }
                .col-tipo {
                    width: 80px;
                    text-align: center;
                }
                .col-gastos {
                    text-align: left;
                    padding-left: 15px;
                }
                .col-monto {
                    width: 100px;
                    text-align: right;
                    font-weight: bold;
                    padding-right: 15px;
                }
                .total-row {
                    background: #e8e8e8 !important;
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #000;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="subtitle">REPORTE DIARIO - ${fechaObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</div>
                <div class="balance-info">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span>BALANCE INICIAL:</span>
                    <span>$ ${balanceInicial.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL INGRESOS:</span>
                    <span>$ ${totalIngresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL EGRESOS:</span>
                    <span>$ ${totalEgresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE FINAL:</span>
                    <span>$ ${balanceFinal.toFixed(2)}</span>
                </div>
            </div>

            <div class="variacion-box">
                <div class="label">VARIACIÓN DEL DÍA</div>
                <div class="value" style="color: ${variacion >= 0 ? '#000' : '#000'}">
                    ${variacion >= 0 ? '+' : ''} $ ${variacion.toFixed(2)}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-hora">HORA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-gastos">GASTOS / DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${movimientos.map((m, index) => {
                        const tipo = m.type === 'income' ? 'INGRESO' : 'EGRESO';
                        const hora = new Date(m.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        
                        return `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-hora">${hora}</td>
                                <td class="col-tipo">${tipo}</td>
                                <td class="col-gastos">${m.reason.toUpperCase()}</td>
                                <td class="col-monto">$ ${m.amount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL:</td>
                        <td class="col-monto">$ ${totalEgresos.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-section">
                <div>FALTANTE/SOBRANTE CAJA CHICA</div>
                <div class="balance-final">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-diario-${fecha}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF diario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

// =====================================================
// =====================================================
// 6. PDF REPORTE POR RANGO DE FECHAS (SEMANAL O PERSONALIZADO)
// =====================================================
// Genera un PDF con movimientos entre dos fechas específicas
// SIN límite de días - puede cruzar meses y años
//
// Parámetros:
//   - req.body.fechaInicio: Fecha inicial en formato YYYY-MM-DD
//   - req.body.fechaFin: Fecha final en formato YYYY-MM-DD
//
// Respuesta:
//   - Éxito: PDF descargable
//   - Error 400: Formato de fecha inválido o fechaInicio > fechaFin
//   - Error 404: No hay movimientos en ese rango
//   - Error 500: Error al generar PDF
//
// Características del reporte:
//   - Calcula automáticamente días del período
//   - Muestra si es SEMANAL (≤7 días) o RANGO DE FECHAS
//   - Balance inicial y final del período
//   - Variación total del período
//   - Tabla completa con todos los movimientos
//
// Ejemplos de uso:
//   - Semanal: { "fechaInicio": "2025-12-01", "fechaFin": "2025-12-07" }
//   - Quincenal: { "fechaInicio": "2025-12-01", "fechaFin": "2025-12-15" }
//   - Cruzando meses: { "fechaInicio": "2024-11-01", "fechaFin": "2025-01-02" }
//
// Ideal para:
//   - Reportes semanales
//   - Períodos personalizados
//   - Rangos que cruzan meses
//
// Nota: NO hay límite de días, a diferencia de otras implementaciones
// =====================================================
ReportesCajaChicaController.generarPDFRangoFechas = async (req, res) => {
    let browser;
    try {
        const { fechaInicio, fechaFin } = req.body;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar fechaInicio y fechaFin en formato YYYY-MM-DD'
            });
        }

        // Validar formato de fechas
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD'
            });
        }

        if (inicio > fin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        // Calcular diferencia en días
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Ajustar horas para cubrir todo el día
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);

        // Buscar movimientos SIN populate inicial
        const movimientos = await CajaChica.find({
            date: {
                $gte: inicio,
                $lte: fin
            }
        }).sort({ date: 1, createdAt: 1 });

        // Hacer populate manual SOLO para ObjectIds válidos
        await Promise.all(
            movimientos.map(async (movement) => {
                if (movement.employeeId !== 'admin' && movement.employeeId) {
                    try {
                        if (movement.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                            await movement.populate('employeeId', 'name email');
                        }
                    } catch (error) {
                        console.log('Error en populate:', error);
                    }
                }
            })
        );

        if (!movimientos || movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay movimientos entre ${inicio.toLocaleDateString('es-ES')} y ${fin.toLocaleDateString('es-ES')}`
            });
        }

        // Calcular estadísticas del período
        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        const balanceInicial = movimientos[0].previousBalance;
        const balanceFinal = movimientos[movimientos.length - 1].currentBalance;
        const variacion = balanceFinal - balanceInicial;

        // Determinar si es semanal o rango personalizado
        const tipoReporte = diffDays <= 7 ? 'SEMANAL' : 'RANGO DE FECHAS';

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
                    font-family: Arial, 'Courier New', monospace;
                    padding: 30px;
                    color: #000;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                }
                .header .subtitle {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                }
                .header .periodo {
                    font-size: 12px;
                    margin-top: 5px;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #000;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ccc;
                    font-size: 11px;
                }
                .stats-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 12px;
                    margin-top: 10px;
                    padding-top: 15px;
                    border-top: 2px solid #000;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                }
                .variacion-box .value {
                    font-size: 18px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #000;
                }
                thead {
                    background: #000;
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #000;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    font-size: 11px;
                    background: #fff;
                }
                .col-numero {
                    width: 40px;
                    text-align: center;
                    font-weight: bold;
                }
                .col-fecha {
                    width: 90px;
                    text-align: center;
                }
                .col-tipo {
                    width: 80px;
                    text-align: center;
                }
                .col-gastos {
                    text-align: left;
                    padding-left: 15px;
                }
                .col-monto {
                    width: 100px;
                    text-align: right;
                    font-weight: bold;
                    padding-right: 15px;
                }
                .total-row {
                    background: #e8e8e8 !important;
                    font-weight: bold;
                    font-size: 13px;
                }
                .footer-section {
                    font-size: 11px;
                    margin-top: 20px;
                    padding: 12px;
                    background: #f9f9f9;
                    border: 2px solid #000;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #000;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CAJA CHICA</h1>
                <div class="subtitle">REPORTE ${tipoReporte}</div>
                <div class="periodo">${inicio.toLocaleDateString('es-ES')} - ${fin.toLocaleDateString('es-ES')}</div>
                <div class="balance-info">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="stats-summary">
                <div class="stats-row">
                    <span>DÍAS DEL PERÍODO:</span>
                    <span>${diffDays + 1} días</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE INICIAL:</span>
                    <span>$ ${balanceInicial.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL INGRESOS:</span>
                    <span>$ ${totalIngresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>TOTAL EGRESOS:</span>
                    <span>$ ${totalEgresos.toFixed(2)}</span>
                </div>
                <div class="stats-row">
                    <span>BALANCE FINAL:</span>
                    <span>$ ${balanceFinal.toFixed(2)}</span>
                </div>
            </div>

            <div class="variacion-box">
                <div class="label">VARIACIÓN DEL PERÍODO</div>
                <div class="value" style="color: ${variacion >= 0 ? '#000' : '#000'}">
                    ${variacion >= 0 ? '+' : ''} $ ${variacion.toFixed(2)}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-numero">#</th>
                        <th class="col-fecha">FECHA</th>
                        <th class="col-tipo">TIPO</th>
                        <th class="col-gastos">GASTOS / DESCRIPCIÓN</th>
                        <th class="col-monto">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${movimientos.map((m, index) => {
                        const tipo = m.type === 'income' ? 'INGRESO' : 'EGRESO';
                        
                        return `
                            <tr>
                                <td class="col-numero">${index + 1}</td>
                                <td class="col-fecha">${new Date(m.date).toLocaleDateString('es-ES')}</td>
                                <td class="col-tipo">${tipo}</td>
                                <td class="col-gastos">${m.reason.toUpperCase()}</td>
                                <td class="col-monto">$ ${m.amount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL:</td>
                        <td class="col-monto">$ ${totalEgresos.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-section">
                <div>FALTANTE/SOBRANTE CAJA CHICA</div>
                <div class="balance-final">$ ${balanceFinal.toFixed(2)}</div>
            </div>

            <div class="footer-info">
                <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
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
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-${tipoReporte.toLowerCase().replace(/ /g, '-')}-${fechaInicio}-${fechaFin}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF por rango de fechas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReportesCajaChicaController;

// =====================================================
// NOTAS FINALES Y MEJORES PRÁCTICAS
// =====================================================
//
// 1. MANEJO DE employeeId:
//    - Siempre verificar si es "admin" antes de hacer populate
//    - Usar regex para validar ObjectIds: /^[0-9a-fA-F]{24}$/
//    - Hacer populate manual, NO en la query principal
//
// 2. GENERACIÓN DE PDFs:
//    - Usar Puppeteer con headless: "new"
//    - Siempre cerrar el browser en el finally/catch
//    - printBackground: true para estilos
//    - Formato A4 con márgenes de 15-20px
//
// 3. DISEÑO DE REPORTES:
//    - Estilo tradicional tipo contable (blanco y negro)
//    - Bordes negros sólidos, sin gradientes
//    - Optimizado para impresión (ahorro de tinta)
//    - Texto en mayúsculas para secciones principales
//
// 4. VALIDACIONES:
//    - Siempre validar parámetros de entrada
//    - Retornar mensajes descriptivos en errores
//    - Usar códigos HTTP apropiados (400, 404, 500)
//
// 5. RENDIMIENTO:
//    - Usar Promise.all para populate paralelo
//    - Ordenar en la query de MongoDB (.sort())
//    - Filtrar en memoria solo cuando sea necesario
//
// 6. MANTENIMIENTO:
//    - Cada reporte es independiente (fácil modificación)
//    - Estilos CSS inline para compatibilidad
//    - Comentarios descriptivos en cada sección
//
// =====================================================