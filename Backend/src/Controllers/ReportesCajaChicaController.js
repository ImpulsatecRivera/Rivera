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
// - Diseño con colores corporativos de Rivera Transportes
// - Logo corporativo integrado
// - Colores: #5F8EAD (azul), #5D9646 (verde), #34353A (gris oscuro)
// - Optimizado para impresión
//
// Manejo especial:
// - employeeId puede ser el string 'admin' o un ObjectId
// - Se hace populate manual solo para ObjectIds válidos
// - Evita errores "Cast to ObjectId failed"
// =====================================================

import CajaChica from '../Models/CajaChica.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RUTA_LOGO = path.join(__dirname, '..', 'imagenes', 'imagen_15.png');

// Función para convertir imagen a base64 (reutilizable en reportes)
const convertirImagenABase64 = (rutaImagen) => {
    try {
        if (!fs.existsSync(rutaImagen)) {
            console.error('La imagen no existe en la ruta:', rutaImagen);
            return null;
        }
        const imagen = fs.readFileSync(rutaImagen);
        const base64 = imagen.toString('base64');
        const ext = path.extname(rutaImagen).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('Error al convertir imagen a base64:', error);
        return null;
    }
};

// Cargar logo una vez
const logoBase64 = convertirImagenABase64(RUTA_LOGO);

const ReportesCajaChicaController = {};

// =====================================================
// FUNCIÓN AUXILIAR: Obtener nombre del mes en español
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
ReportesCajaChicaController.generarPDFIndividual = async (req, res) => {
    let browser;
    try {
        const { id } = req.params;
        
        const movimiento = await CajaChica.findById(id);

        if (!movimiento) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado'
            });
        }

        if (movimiento.employeeId !== 'admin' && movimiento.employeeId) {
            try {
                if (movimiento.employeeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                    await movimiento.populate('employeeId', 'name email');
                }
            } catch (error) {
                console.log('Error en populate:', error);
            }
        }

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-container img {
                    max-width: 160px;
                    height: auto;
                    background: white;
                    padding: 4px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }
                .header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    margin-bottom: 5px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 6px;
                    color: #5F8EAD;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 12px;
                    padding: 8px;
                    background: #f5f9fc;
                    border: 2px solid #5F8EAD;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 10px;
                    color: #34353A;
                }
                .stats-row:last-child {
                    border-bottom: none;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                th {
                    padding: 8px 6px;
                    text-align: center;
                    font-size: 10px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                td {
                    padding: 6px 6px;
                    border: 1px solid #34353A;
                    font-size: 9px;
                    background: #fff;
                    color: #34353A;
                }
                .col-label {
                    width: 200px;
                    font-weight: bold;
                    text-align: left;
                    padding-left: 15px;
                    background: #f5f5f5;
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
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="caja-chica-${tipoOperacion.toLowerCase()}-${Date.now()}.pdf"`);
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

// =====================================================
// 2. PDF CONSOLIDADO - Todos los movimientos
// =====================================================
ReportesCajaChicaController.generarPDFTodosMovimientos = async (req, res) => {
    let browser;
    try {
        const movimientos = await CajaChica.find()
            .sort({ date: -1, createdAt: -1 });
        
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
                message: 'No hay movimientos registrados en caja chica'
            });
        }

        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        const balanceFinal = movimientos[0].currentBalance;

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 3px solid #5F8EAD;
                    padding-bottom: 12px;
                }
                .header .logo-container {
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-container img {
                    max-width: 160px;
                    height: auto;
                    background: white;
                    padding: 6px;
                    border-radius: 4px;
                }
                .header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    margin-bottom: 4px;
                    color: #34353A;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 13px;
                    font-weight: bold;
                    margin-top: 6px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 12px;
                    padding: 8px;
                    background: #f5f9fc;
                    border: 2px solid #5F8EAD;
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 10px;
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
                    border: 3px solid #34353A;
                }
                thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #34353A;
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
                    color: #34353A;
                }
                .tipo-ingreso {
                    color: #5D9646;
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
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
                        <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL EGRESOS:</td>
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
ReportesCajaChicaController.generarPDFMensualSimple = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);

        if (mesNum < 1 || mesNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes inválido. Debe estar entre 1 y 12'
            });
        }

        const fechaInicio = new Date(anoNum, mesNum - 1, 1);
        const fechaFin = new Date(anoNum, mesNum, 0, 23, 59, 59);

        const movimientos = await CajaChica.find({
            date: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        })
        .sort({ date: 1 });

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-svg {
                    width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                    color: #5F8EAD;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 8px;
                    color: #34353A;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #34353A;
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
                    border-top: 2px solid #34353A;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #34353A;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #34353A;
                }
                .variacion-box .value {
                    font-size: 18px;
                    color: ${variacion >= 0 ? '#5D9646' : '#991b1b'};
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #34353A;
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
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
                <div class="value">
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
// 4. PDF REPORTE COMPARATIVO DE MÚLTIPLES MESES
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

        const porMes = {};
        let totalGeneralIngresos = 0;
        let totalGeneralEgresos = 0;

        for (const mesNum of mesesValidos) {
            const fechaInicio = new Date(anoNum, mesNum - 1, 1);
            const fechaFin = new Date(anoNum, mesNum, 0, 23, 59, 59);

            const movimientos = await CajaChica.find({
                date: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-svg {
                    width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                    color: #5F8EAD;
                }
                .header .subtitle {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                    color: #34353A;
                }
                .mes-section {
                    margin-bottom: 25px;
                    background: #f5f5f5;
                    padding: 20px;
                    border: 2px solid #34353A;
                }
                .mes-header {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #5F8EAD;
                    text-align: center;
                }
                .mes-header h2 {
                    font-size: 18px;
                    font-weight: bold;
                    color: #5F8EAD;
                }
                .mes-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    border: 2px solid #34353A;
                }
                .mes-table td {
                    padding: 10px 15px;
                    border: 1px solid #34353A;
                    font-size: 12px;
                }
                .mes-table .label {
                    font-weight: bold;
                    width: 150px;
                    background: #f5f5f5;
                }
                .mes-table .value {
                    text-align: right;
                }
                .resumen-final {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    padding: 20px;
                    border: 3px solid #34353A;
                    text-align: center;
                    margin-top: 30px;
                    color: #fff;
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
                    border: 2px solid #34353A;
                }
                .total-table td {
                    padding: 12px 15px;
                    border: 1px solid #34353A;
                    font-size: 13px;
                    color: #34353A;
                }
                .total-table .label {
                    font-weight: bold;
                    width: 250px;
                    background: #f5f5f5;
                }
                .total-table .value {
                    text-align: right;
                    font-weight: bold;
                    font-size: 14px;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
// 5. PDF REPORTE DE UN SOLO DÍA (DIARIO)
// =====================================================
ReportesCajaChicaController.generarPDFDiario = async (req, res) => {
    let browser;
    try {
        const { fecha } = req.params;

        // Función para parsear fechas correctamente sin dependencia de zona horaria
        const parseDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return new Date(year, month - 1, day);
        };

        const fechaObj = parseDate(fecha);
        if (isNaN(fechaObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD'
            });
        }

        const fechaInicio = parseDate(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        
        const fechaFin = parseDate(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        const movimientos = await CajaChica.find({
            date: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        }).sort({ date: 1, createdAt: 1 });

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-svg {
                    width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                    color: #5F8EAD;
                }
                .header .subtitle {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 8px;
                    color: #34353A;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #34353A;
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
                    border-top: 2px solid #34353A;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #34353A;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #34353A;
                }
                .variacion-box .value {
                    font-size: 18px;
                    color: ${variacion >= 0 ? '#5D9646' : '#991b1b'};
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #34353A;
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
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
                <div class="value">
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
// 6. PDF REPORTE POR RANGO DE FECHAS
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

        // Función para parsear fechas correctamente sin dependencia de zona horaria
        const parseDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return new Date(year, month - 1, day);
        };

        const inicio = parseDate(fechaInicio);
        const fin = parseDate(fechaFin);

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

        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);

        const movimientos = await CajaChica.find({
            date: {
                $gte: inicio,
                $lte: fin
            }
        }).sort({ date: 1, createdAt: 1 });

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

        const totalIngresos = movimientos
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);

        const totalEgresos = movimientos
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);

        const balanceInicial = movimientos[0].previousBalance;
        const balanceFinal = movimientos[movimientos.length - 1].currentBalance;
        const variacion = balanceFinal - balanceInicial;

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
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #34353A;
                    padding-bottom: 15px;
                }
                .header .logo-container {
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: center;
                }
                .header .logo-svg {
                    width: 200px;
                    height: auto;
                }
                .header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin-bottom: 5px;
                    color: #5F8EAD;
                }
                .header .subtitle {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 8px;
                    color: #34353A;
                }
                .header .periodo {
                    font-size: 12px;
                    margin-top: 5px;
                    color: #34353A;
                }
                .header .balance-info {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                    color: #5F8EAD;
                }
                .stats-summary {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 2px solid #34353A;
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
                    border-top: 2px solid #34353A;
                }
                .variacion-box {
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background: #f9f9f9;
                    border: 2px solid #34353A;
                    font-weight: bold;
                }
                .variacion-box .label {
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #34353A;
                }
                .variacion-box .value {
                    font-size: 18px;
                    color: ${variacion >= 0 ? '#5D9646' : '#991b1b'};
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 3px solid #34353A;
                }
                thead {
                    background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
                    color: #fff;
                }
                th {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid #34353A;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 8px;
                    border: 1px solid #34353A;
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
                    border: 2px solid #34353A;
                    text-align: center;
                }
                .footer-section .balance-final {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 8px 0;
                    padding: 10px;
                    background: #fff;
                    border: 2px solid #5F8EAD;
                    color: #5F8EAD;
                }
                .footer-info {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #34353A;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:140px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
                </div>
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
                <div class="value">
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