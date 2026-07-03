// Backend/src/Controllers/ReportesVentasController.js

import VentasModel from "../Models/Ventas.js";
import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';
import { generatePdfFromHtml } from '../Utils/pdfGenerator.js';

const ReportesVentasController = {};

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores Rivera
const COLORES = {
    primary: '#5F8EAD',
    secondary: '#5D9646',
    accent: '#34353A',
    headerBg: '#f8f9fa',
    borderColor: '#dee2e6'
};

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
    serviceName: 'reportes-ventas',
    primaryConfig: PUPPETEER_CONFIG()
  });
};

/**
 * Función para obtener nombre de cliente (natural o corporativo)
 */
const getNombreCliente = (cliente) => {
    if (!cliente) return 'Cliente desconocido';

    // Cliente CORPORATIVO
    if (cliente.tipoCliente === 'corporativo') {
        return cliente.nombreComercial || cliente.nombreEmpresa || 'Empresa sin nombre';
    }

    // Cliente NATURAL
    if (cliente.tipoCliente === 'natural') {
        const firstName = cliente.firstName || cliente.firtsName || '';
        const lastName = cliente.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Cliente sin nombre';
    }

    // FALLBACK
    if (cliente.nombreEmpresa || cliente.nombreComercial) {
        return cliente.nombreComercial || cliente.nombreEmpresa;
    }

    if (cliente.firstName || cliente.firtsName) {
        const firstName = cliente.firstName || cliente.firtsName || '';
        const lastName = cliente.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Cliente sin nombre';
    }

    return 'Cliente sin nombre';
};

/**
 * REPORTE 1: INFORME VENTAS MENSUAL
 * GET /api/reportesVentas/mensual/:mes/:ano
 */
ReportesVentasController.generarPDFInformeMensual = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const { metodoPago } = req.query;

        const fechaInicio = new Date(ano, mes - 1, 1);
        const fechaFin = new Date(ano, mes, 0, 23, 59, 59);

        let filtro = {
            fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
            estado: { $ne: 'anulada' }
        };

        // Agregar filtro de método de pago si se especifica
        if (metodoPago && metodoPago !== 'todos') {
            filtro.metodoPago = metodoPago;
        }

        const ventas = await VentasModel.find(filtro)
            .populate('clienteId')
            .sort({ fechaEmision: 1 });

        if (ventas.length === 0) {
            let detalles = 'No hay ventas registradas';
            if (metodoPago && metodoPago !== 'todos') {
                detalles = `No hay ventas registradas con método de pago: ${metodoPago}`;
            }
            return res.status(404).json({
                success: false,
                message: detalles,
                details: {
                    mes,
                    ano,
                    metodoPago: metodoPago || 'todos'
                }
            });
        }

        // Convertir logo a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const totalMonto = ventas.reduce((sum, v) => sum + v.monto, 0);
        const totalIVA = ventas.reduce((sum, v) => sum + v.iva, 0);
        const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0);
        const totalCCF = ventas.filter(v => v.tipoDocumento === 'CCF').length;
        const totalCF = ventas.filter(v => v.tipoDocumento === 'CONSUMIDOR_FINAL').length;

        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${COLORES.primary};
    }
    .header .logo-container {
      margin-bottom: 10px;
    }
    .header .logo-container img {
      max-width: 180px;
      height: auto;
    }
    .header h1 {
      font-size: 20px;
      color: ${COLORES.primary};
      margin-top: 10px;
      font-weight: bold;
    }
    .header .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: ${COLORES.primary};
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid ${COLORES.borderColor};
      font-size: 11px;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    .totals-row {
      background: ${COLORES.headerBg};
      font-weight: bold;
    }
    .text-right { text-align: right; }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .badge-ccf {
      background: #e3f2fd;
      color: #1976d2;
    }
    .badge-cf {
      background: #e8f5e9;
      color: #388e3c;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid ${COLORES.borderColor};
      text-align: center;
      font-size: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
    </div>
    <h1>INFORME DE VENTAS</h1>
    <div class="subtitle">${getMesNombre(mes)} ${ano}</div>
    ${metodoPago && metodoPago !== 'todos' ? `<div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 12px;"><strong>Filtro:</strong> Método de pago: ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>N° Documento</th>
        <th>Cliente</th>
        <th>Método de Pago</th>
        <th class="text-right">Monto</th>
        <th class="text-right">IVA</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${ventas.map(v => `
        <tr>
          <td>${new Date(v.fechaEmision).toLocaleDateString('es-SV')}</td>
          <td>
            <span class="badge ${v.tipoDocumento === 'CCF' ? 'badge-ccf' : 'badge-cf'}">
              ${v.tipoDocumento === 'CCF' ? 'CCF' : 'C.F.'}
            </span>
          </td>
          <td>${v.numeroDocumento}</td>
          <td>${getNombreCliente(v.clienteId)}</td>
          <td>${v.metodoPago ? v.metodoPago.charAt(0).toUpperCase() + v.metodoPago.slice(1) : 'N/A'}</td>
          <td class="text-right">$${v.monto.toFixed(2)}</td>
          <td class="text-right">$${v.iva.toFixed(2)}</td>
          <td class="text-right">$${v.total.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr class="totals-row">
        <td colspan="5">TOTAL GENERAL</td>
        <td class="text-right">$${totalMonto.toFixed(2)}</td>
        <td class="text-right">$${totalIVA.toFixed(2)}</td>
        <td class="text-right">$${totalGeneral.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Generado el ${new Date().toLocaleString('es-SV')} | Rivera Distribuidora y Transportes
  </div>
</body>
</html>
    `;

        const pdfBuffer = await generatePdfFromHtml(html, {
          serviceName: 'reportes-ventas',
          pdfOptions: { format: 'Letter', landscape: true, printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } },
          timeoutMs: 45000,
          retries: 2,
          waitUntil: 'networkidle2'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=informe-ventas-${mes}-${ano}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * REPORTE 2: RESUMEN VENTAS MENSUAL
 * GET /api/reportesVentas/resumen-mensual/:mes/:ano
 */
ReportesVentasController.generarPDFResumenMensual = async (req, res) => {
    let browser;
    try {
        const { mes, ano } = req.params;
        const { metodoPago } = req.query;

        const fechaInicio = new Date(ano, mes - 1, 1);
        const fechaFin = new Date(ano, mes, 0, 23, 59, 59);

        let matchStage = {
            fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
            estado: { $ne: 'anulada' }
        };

        // Agregar filtro de método de pago si se especifica
        if (metodoPago && metodoPago !== 'todos') {
            matchStage.metodoPago = metodoPago;
        }

        // Contar facturas anuladas
        let countAnuladaFilter = {
            fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
            estado: 'anulada'
        };
        if (metodoPago && metodoPago !== 'todos') {
            countAnuladaFilter.metodoPago = metodoPago;
        }

        const facturaAnuladas = await VentasModel.countDocuments(countAnuladaFilter);

        // Contar todas las facturas emitidas del mes (anuladas y no anuladas)
        let countEmitidaFilter = {
            fechaEmision: { $gte: fechaInicio, $lte: fechaFin }
        };
        if (metodoPago && metodoPago !== 'todos') {
            countEmitidaFilter.metodoPago = metodoPago;
        }

        const facturaEmitidas = await VentasModel.countDocuments(countEmitidaFilter);

        const resumen = await VentasModel.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: "$clienteId",
                    cantidadFacturas: { $sum: 1 },
                    subtotal: { $sum: "$monto" },
                    totalIVA: { $sum: "$iva" },
                    totalConIVA: { $sum: "$total" }
                }
            },
            {
                $lookup: {
                    from: "Clientes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $unwind: "$cliente"
            },
            {
                $sort: { totalConIVA: -1 }
            }
        ]);

        if (resumen.length === 0) {
            let detalles = 'No hay ventas registradas en este período';
            if (metodoPago && metodoPago !== 'todos') {
                detalles = `No hay ventas registradas con método de pago: ${metodoPago}`;
            }
            return res.status(404).json({
                success: false,
                message: detalles,
                details: {
                    mes,
                    ano,
                    metodoPago: metodoPago || 'todos',
                    facturaAnuladas,
                    facturaEmitidas
                }
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        const totalGeneral = resumen.reduce((sum, r) => sum + r.totalConIVA, 0);
        const totalFacturas = resumen.reduce((sum, r) => sum + r.cantidadFacturas, 0);
        const totalSubtotal = resumen.reduce((sum, r) => sum + r.subtotal, 0);
        const totalIVA = resumen.reduce((sum, r) => sum + r.totalIVA, 0);

        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${COLORES.primary};
    }
    .header .logo-container {
      margin-bottom: 10px;
    }
    .header .logo-container img {
      max-width: 180px;
      height: auto;
    }
    .header h1 {
      font-size: 20px;
      color: ${COLORES.primary};
      margin-top: 10px;
      font-weight: bold;
    }
    .header .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: ${COLORES.primary};
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid ${COLORES.borderColor};
      font-size: 11px;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    .totals-row {
      background: ${COLORES.headerBg};
      font-weight: bold;
    }
    .summary-info {
      margin-top: 15px;
      padding: 10px;
      background: #f0f4f8;
      border-radius: 5px;
      font-size: 12px;
      display: flex;
      justify-content: center;
      gap: 30px;
    }
    .summary-info span {
      color: #333;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid ${COLORES.borderColor};
      text-align: center;
      font-size: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
    </div>
    <h1>RESUMEN DE VENTAS</h1>
    <div class="subtitle">${getMesNombre(mes)} ${ano}</div>
    ${metodoPago && metodoPago !== 'todos' ? `<div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 12px;"><strong>Filtro:</strong> Método de pago: ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</div>` : '<div style="margin-top: 10px; padding: 8px; background: #e8f5e9; border-left: 4px solid #4caf50; font-size: 12px;"><strong>Filtro:</strong> Todos los métodos de pago</div>'}
    <div class="summary-info">
      <span><strong>Cantidad de facturas anuladas:</strong> ${facturaAnuladas}</span>
      <span><strong>Cantidad de facturas emitidas:</strong> ${facturaEmitidas}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th class="text-center">Facturas</th>
        <th class="text-right">Subtotal ($)</th>
        <th class="text-right">IVA (13%)</th>
        <th class="text-right">Total con IVA</th>
      </tr>
    </thead>
    <tbody>
      ${resumen.map(r => `
        <tr>
          <td>${getNombreCliente(r.cliente)}</td>
          <td class="text-center">${r.cantidadFacturas}</td>
          <td class="text-right">$${r.subtotal.toFixed(2)}</td>
          <td class="text-right">$${r.totalIVA.toFixed(2)}</td>
          <td class="text-right">$${r.totalConIVA.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr class="totals-row">
        <td>TOTAL GENERAL</td>
        <td class="text-center">${totalFacturas}</td>
        <td class="text-right">$${totalSubtotal.toFixed(2)}</td>
        <td class="text-right">$${totalIVA.toFixed(2)}</td>
        <td class="text-right">$${totalGeneral.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Generado el ${new Date().toLocaleString('es-SV')} | Rivera Distribuidora y Transportes
  </div>
</body>
</html>
    `;

        browser = await launchBrowserSafe();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: true,
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=resumen-ventas-${mes}-${ano}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * REPORTE 3: COMPARATIVO POR CLIENTE ANUAL
 * GET /api/reportesVentas/comparativo-anual/:ano
 */
ReportesVentasController.generarPDFComparativoAnual = async (req, res) => {
    let browser;
    try {
        const { ano } = req.params;
        const { metodoPago } = req.query;

        const fechaInicio = new Date(ano, 0, 1);
        const fechaFin = new Date(ano, 11, 31, 23, 59, 59);

        let matchStage = {
            fechaEmision: { $gte: fechaInicio, $lte: fechaFin },
            estado: 'pagada' // SOLO ventas pagadas
        };

        // Agregar filtro de método de pago si se especifica
        if (metodoPago && metodoPago !== 'todos') {
            matchStage.metodoPago = metodoPago;
        }

        // Obtener SOLO ventas pagadas del año
        const comparativo = await VentasModel.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        clienteId: "$clienteId",
                        mes: { $month: "$fechaEmision" }
                    },
                    total: { $sum: "$total" }
                }
            },
            {
                $lookup: {
                    from: "Clientes",
                    localField: "_id.clienteId",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $unwind: "$cliente"
            },
            {
                $sort: { "_id.clienteId": 1, "_id.mes": 1 }
            }
        ]);

        if (comparativo.length === 0) {
            let detalles = `No hay ventas pagadas registradas en el año ${ano}`;
            if (metodoPago && metodoPago !== 'todos') {
                detalles = `No hay ventas pagadas con método de pago: ${metodoPago} en el año ${ano}`;
            }
            return res.status(404).json({
                success: false,
                message: detalles,
                details: {
                    ano,
                    metodoPago: metodoPago || 'todos'
                }
            });
        }

        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // Agrupar datos: meses como filas, clientes como columnas
        const mesesMap = {};
        const clientesSet = new Set();
        
        comparativo.forEach(item => {
            const clienteNombre = getNombreCliente(item.cliente);
            const mes = item._id.mes;
            
            clientesSet.add(clienteNombre);
            
            if (!mesesMap[mes]) {
                mesesMap[mes] = {};
            }
            mesesMap[mes][clienteNombre] = item.total;
        });

        // Convertir Set a Array ordenado
        const clientes = Array.from(clientesSet).sort();
        const meses = Object.keys(mesesMap).map(Number).sort((a, b) => a - b);

        // Generar tabla con meses en filas y clientes en columnas
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid ${COLORES.primary};
    }
    .header .logo-container {
      margin-bottom: 10px;
    }
    .header .logo-container img {
      max-width: 140px;
      height: auto;
    }
    .header h1 {
      font-size: 18px;
      color: ${COLORES.primary};
      margin-top: 8px;
      font-weight: bold;
    }
    .header .subtitle {
      font-size: 12px;
      color: #666;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 9px;
      border: 1px solid #333;
    }
    th {
      background: ${COLORES.primary};
      color: white;
      padding: 8px 6px;
      text-align: right;
      font-size: 9px;
      font-weight: bold;
      border: 1px solid #333;
    }
    th:first-child {
      text-align: left;
      background: ${COLORES.accent};
    }
    td {
      padding: 6px 6px;
      border: 1px solid #333;
      font-size: 9px;
      text-align: right;
    }
    td:first-child {
      text-align: left;
      background: #f5f5f5;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    .total-row {
      background: ${COLORES.secondary};
      color: white;
      font-weight: bold;
    }
    .total-row td {
      background: ${COLORES.secondary};
      color: white;
    }
    .total-row td:first-child {
      background: ${COLORES.accent};
      color: white;
    }
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid ${COLORES.borderColor};
      text-align: center;
      font-size: 9px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA</p>'}
    </div>
    <h1>CUADRO COMPARATIVO POR CLIENTE - ${ano}</h1>
    <div class="subtitle">Ventas Pagadas por Mes</div>
    ${metodoPago && metodoPago !== 'todos' ? `<div style="margin-top: 8px; padding: 6px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 11px;"><strong>Filtro:</strong> Método de pago: ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</div>` : '<div style="margin-top: 8px; padding: 6px; background: #e8f5e9; border-left: 4px solid #4caf50; font-size: 11px;"><strong>Filtro:</strong> Todos los métodos de pago</div>'}
  </div>

  <table>
    <thead>
      <tr>
        <th>MES</th>
        ${clientes.map(cliente => `<th>${cliente}</th>`).join('')}
        <th>TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${meses.map(mes => {
            const totalesPorCliente = {};
            let totalMes = 0;
            
            clientes.forEach(cliente => {
                const valor = mesesMap[mes][cliente] || 0;
                totalesPorCliente[cliente] = valor;
                totalMes += valor;
            });
            
            return `
        <tr>
          <td>${getMesNombre(mes)}</td>
          ${clientes.map(cliente => `
            <td>
              ${totalesPorCliente[cliente] > 0 ? '$' + totalesPorCliente[cliente].toFixed(2) : '-'}
            </td>
          `).join('')}
          <td><strong>$${totalMes.toFixed(2)}</strong></td>
        </tr>
      `;
        }).join('')}
      <tr class="total-row">
        <td>TOTAL</td>
        ${clientes.map(cliente => {
            let totalCliente = 0;
            meses.forEach(mes => {
                totalCliente += mesesMap[mes][cliente] || 0;
            });
            return `<td><strong>$${totalCliente.toFixed(2)}</strong></td>`;
        }).join('')}
        <td><strong>$${meses.reduce((sum, mes) => {
            return sum + clientes.reduce((clienteSum, cliente) => {
                return clienteSum + (mesesMap[mes][cliente] || 0);
            }, 0);
        }, 0).toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Generado el ${new Date().toLocaleString('es-SV')} | Rivera Distribuidora y Transportes
  </div>
</body>
</html>
    `;

        browser = await launchBrowserSafe();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: true,
            printBackground: true,
            margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=comparativo-anual-${ano}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

/**
 * Función para cargar venta por ID
 */
ReportesVentasController.cargarVentaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const venta = await VentasModel.findById(id);
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        console.error('Error al cargar venta:', error);
        res.status(500).json({ message: 'Error al cargar venta' });
    }
};

// Funciones auxiliares
function getMesNombre(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
}

function getMesNombreCorto(mes) {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
        'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[mes - 1];
}

export default ReportesVentasController;