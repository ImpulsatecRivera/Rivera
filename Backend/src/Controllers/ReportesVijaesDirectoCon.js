import ViajesModel from "../Models/Viajes.js";
import ClientesModel from "../Models/Clientes.js";
import puppeteer from "puppeteer";
import mongoose from "mongoose";

const ReportesViajesDirecto = {};

// =====================================================
// 🛠️ FUNCIONES AUXILIARES
// =====================================================

const obtenerNombreMes = (mes) => {
  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
  ];
  return meses[mes - 1] || "MES INVÁLIDO";
};

const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatearHora = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// =====================================================
// 📊 GET: OBTENER CLIENTES CON VIAJES DEL MES
// =====================================================
ReportesViajesDirecto.obtenerClientesMes = async (req, res) => {
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: "Mes inválido. Debe estar entre 1 y 12",
      });
    }

    // Usar el período contable del modelo
    const clientes = await ViajesModel.aggregate([
      {
        $match: {
          tipoViaje: 'operativo',
          'estado.actual': 'completado',
          'periodoContable.año': anoNum,
          'periodoContable.mes': mesNum
        },
      },
      {
        $group: {
          _id: "$clienteNombre",
          totalViajes: { $sum: 1 },
          montoTotal: { $sum: "$montoAcordado" },
          montoSinIVA: { $sum: "$facturacion.montoSinIVA" },
          iva: { $sum: "$facturacion.iva" }
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json({
      success: true,
      count: clientes.length,
      data: clientes.map((c) => ({
        clienteNombre: c._id,
        totalViajes: c.totalViajes,
        montoTotal: c.montoTotal,
        montoSinIVA: c.montoSinIVA,
        iva: c.iva
      })),
      message: `${clientes.length} clientes con viajes en ${obtenerNombreMes(mesNum)} ${anoNum}`
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

// =====================================================
// 📄 PDF 1: RESUMEN MENSUAL (Imagen 3)
// Formato: # | CLIENTE | VIAJES | MONTO POR VIAJES | MONTO TOTAL
// Nota: PRECIO SIN IVA
// =====================================================
ReportesViajesDirecto.generarPDFResumenMensual = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    console.log(`📊 Generando PDF Resumen Mensual: ${obtenerNombreMes(mesNum)} ${anoNum}`);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: "Mes inválido. Debe estar entre 1 y 12",
      });
    }

    // 🚛 OBTENER VIAJES OPERATIVOS COMPLETADOS DEL MES
    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      'periodoContable.año': anoNum,
      'periodoContable.mes': mesNum
    })
      .populate('clienteOperativo', 'nombreComercial nombreEmpresa')
      .populate('truckId', 'licensePlate placa')
      .sort({ clienteNombre: 1, 'rutaDirecta.rutaCompleta': 1 })
      .lean();

    console.log(`✅ Encontrados ${viajes.length} viajes completados`);

    if (viajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes completados en ${obtenerNombreMes(mesNum)} ${anoNum}`,
      });
    }

    // 📊 AGRUPAR POR CLIENTE Y RUTA
    const clientesMap = new Map();

    viajes.forEach((viaje) => {
      const clienteNombre = viaje.clienteNombre || 
                           viaje.clienteOperativo?.nombreComercial || 
                           viaje.clienteOperativo?.nombreEmpresa || 
                           'CLIENTE SIN NOMBRE';
      
      const rutaCompleta = viaje.rutaDirecta?.rutaCompleta || 'RUTA NO ESPECIFICADA';

      if (!clientesMap.has(clienteNombre)) {
        clientesMap.set(clienteNombre, new Map());
      }

      const rutasCliente = clientesMap.get(clienteNombre);

      if (!rutasCliente.has(rutaCompleta)) {
        rutasCliente.set(rutaCompleta, {
          rutaCompleta,
          cantidadViajes: 0,
          montoPorViaje: viaje.montoAcordado || 0,
          montoTotal: 0,
        });
      }

      const ruta = rutasCliente.get(rutaCompleta);
      ruta.cantidadViajes++;
      ruta.montoTotal += (viaje.montoAcordado || 0);
    });

    // 📝 GENERAR HTML
    let totalViajesGeneral = 0;
    let totalMontoGeneral = 0;
    let numeroCliente = 1;
    let filasHTML = "";

    clientesMap.forEach((rutas, clienteNombre) => {
      const rutasArray = Array.from(rutas.values());
      const totalViajesCliente = rutasArray.reduce((sum, r) => sum + r.cantidadViajes, 0);
      const totalMontoCliente = rutasArray.reduce((sum, r) => sum + r.montoTotal, 0);

      totalViajesGeneral += totalViajesCliente;
      totalMontoGeneral += totalMontoCliente;

      // Primera fila del cliente con rowspan
      filasHTML += `
        <tr>
          <td rowspan="${rutasArray.length}" class="cell-numero">${numeroCliente}</td>
          <td class="cell-cliente">${rutasArray[0].rutaCompleta}</td>
          <td class="cell-viajes">${rutasArray[0].cantidadViajes}</td>
          <td class="cell-monto">$ ${rutasArray[0].montoTotal.toFixed(2)}</td>
          <td rowspan="${rutasArray.length}" class="cell-total">$ ${totalMontoCliente.toFixed(2)}</td>
        </tr>
      `;

      // Filas adicionales de rutas
      for (let i = 1; i < rutasArray.length; i++) {
        filasHTML += `
          <tr>
            <td class="cell-cliente">${rutasArray[i].rutaCompleta}</td>
            <td class="cell-viajes">${rutasArray[i].cantidadViajes}</td>
            <td class="cell-monto">$ ${rutasArray[i].montoTotal.toFixed(2)}</td>
          </tr>
        `;
      }

      numeroCliente++;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
    .header .period { font-size: 20px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
    th { background: #d3d3d3; font-weight: bold; font-size: 14px; }
    td { font-size: 13px; }
    .cell-numero { width: 5%; font-weight: bold; vertical-align: middle; }
    .cell-cliente { width: 40%; text-align: left; padding-left: 15px; font-weight: bold; }
    .cell-viajes { width: 12%; }
    .cell-monto { width: 18%; text-align: right; padding-right: 15px; }
    .cell-total { width: 25%; text-align: right; padding-right: 15px; font-weight: bold; vertical-align: middle; }
    .total-row { background: #e8e8e8; font-weight: bold; font-size: 14px; }
    .total-row td { padding: 12px 8px; }
    .footer { margin-top: 20px; }
    .footer .nota { font-weight: bold; font-size: 13px; }
    .footer .detalle { font-size: 12px; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RESUMEN DE VIAJES POR CLIENTE</h1>
    <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>CLIENTE</th>
        <th>VIAJES</th>
        <th>MONTO POR<br>VIAJES</th>
        <th>MONTO TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${filasHTML}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td>${totalViajesGeneral}</td>
        <td>$ ${totalMontoGeneral.toFixed(2)}</td>
        <td>$ ${totalMontoGeneral.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div class="nota">NOTA:</div>
    <div class="detalle">PRECIO SIN IVA</div>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15px", right: "15px", bottom: "15px", left: "15px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=resumen-viajes-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`
    );
    res.send(pdfBuffer);

    console.log("✅ PDF Resumen Mensual generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Resumen Mensual:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF",
      error: error.message,
    });
  }
};

// =====================================================
// 📄 PDF 2: INDIVIDUAL POR CLIENTE (Detallado)
// Muestra todos los viajes de un cliente específico
// =====================================================
ReportesViajesDirecto.generarPDFClienteIndividual = async (req, res) => {
  let browser;
  try {
    const { clienteNombre, mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    console.log(`📊 Generando PDF Individual: ${clienteNombre} - ${obtenerNombreMes(mesNum)} ${anoNum}`);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: "Mes inválido",
      });
    }

    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      clienteNombre: decodeURIComponent(clienteNombre),
      'estado.actual': 'completado',
      'periodoContable.año': anoNum,
      'periodoContable.mes': mesNum
    })
      .populate('truckId', 'licensePlate placa brand model marca modelo')
      .populate('conductorId', 'name nombre')
      .sort({ departureTime: 1 })
      .lean();

    console.log(`✅ Encontrados ${viajes.length} viajes para ${clienteNombre}`);

    if (viajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron viajes para este cliente",
      });
    }

    // 📊 AGRUPAR POR RUTA
    const rutasMap = new Map();

    viajes.forEach((viaje) => {
      const rutaCompleta = viaje.rutaDirecta?.rutaCompleta || 'N/A';

      if (!rutasMap.has(rutaCompleta)) {
        rutasMap.set(rutaCompleta, {
          rutaCompleta,
          origen: viaje.rutaDirecta?.origen?.nombre || 'N/A',
          destino: viaje.rutaDirecta?.destino?.nombre || 'N/A',
          cantidadViajes: 0,
          montoPorViaje: viaje.montoAcordado || 0,
          montoTotal: 0,
          viajes: []
        });
      }

      const ruta = rutasMap.get(rutaCompleta);
      ruta.cantidadViajes++;
      ruta.montoTotal += (viaje.montoAcordado || 0);
      ruta.viajes.push(viaje);
    });

    const rutasArray = Array.from(rutasMap.values());
    const totalViajes = viajes.length;
    const montoTotalGeneral = viajes.reduce((sum, v) => sum + (v.montoAcordado || 0), 0);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Arial', sans-serif; padding:30px; color:#1e293b; background:#fff; }
    .container { background:white; padding:30px; }
    .header { text-align:center; margin-bottom:30px; border-bottom:3px solid #2563eb; padding-bottom:20px; }
    .header h1 { color:#2563eb; font-size:28px; margin-bottom:8px; font-weight:700; text-transform:uppercase; }
    .header .subtitle { color:#64748b; font-size:16px; font-weight:500; }
    .section { margin-bottom:30px; background:#f8fafc; padding:20px; border-radius:8px; border-left:4px solid #2563eb; }
    .section-title { color:#2563eb; font-size:18px; font-weight:700; margin-bottom:15px; }
    .info-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:15px; margin-top:10px; }
    .info-item { background:white; padding:12px; border-radius:6px; border:1px solid #e2e8f0; }
    .info-item label { display:block; font-weight:600; color:#64748b; font-size:11px; margin-bottom:6px; text-transform:uppercase; }
    .info-item .value { color:#1e293b; font-size:14px; font-weight:500; }
    table { width:100%; border-collapse:collapse; margin-top:15px; background:white; }
    thead { background:#2563eb; color:white; }
    th { padding:12px; text-align:left; font-weight:600; font-size:12px; text-transform:uppercase; }
    td { padding:12px; border-bottom:1px solid #e2e8f0; font-size:13px; }
    .text-right { text-align:right; }
    .total-section { margin-top:25px; background:#2563eb; color:white; padding:20px; border-radius:8px; }
    .total-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:15px; }
    .total-item { text-align:center; }
    .total-item label { font-size:11px; opacity:0.9; margin-bottom:6px; }
    .total-item .value { font-size:22px; font-weight:700; }
    .footer { margin-top:30px; text-align:center; color:#64748b; font-size:10px; border-top:2px solid #e2e8f0; padding-top:15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Reporte de Viajes</h1>
      <p class="subtitle">Detalle Individual por Cliente</p>
    </div>

    <div class="section">
      <h2 class="section-title">📊 Información del Cliente</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Cliente</label>
          <div class="value">${decodeURIComponent(clienteNombre)}</div>
        </div>
        <div class="info-item">
          <label>Período</label>
          <div class="value">${obtenerNombreMes(mesNum)} ${anoNum}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🛣️ Rutas y Viajes</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Ruta</th>
            <th>Origen</th>
            <th>Destino</th>
            <th class="text-right">Viajes</th>
            <th class="text-right">$ por Viaje</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rutasArray.map((ruta, index) => `
            <tr>
              <td><strong>${index + 1}</strong></td>
              <td><strong>${ruta.rutaCompleta}</strong></td>
              <td>${ruta.origen}</td>
              <td>${ruta.destino}</td>
              <td class="text-right">${ruta.cantidadViajes}</td>
              <td class="text-right">$${ruta.montoPorViaje.toFixed(2)}</td>
              <td class="text-right"><strong>$${ruta.montoTotal.toFixed(2)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-grid">
          <div class="total-item">
            <label>Total de Viajes</label>
            <div class="value">${totalViajes}</div>
          </div>
          <div class="total-item">
            <label>💵 Monto Total</label>
            <div class="value">$${montoTotalGeneral.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Documento generado el ${formatearFecha(new Date())} a las ${formatearHora(new Date())}</p>
      <p>Sistema de Gestión de Viajes Operativos</p>
    </div>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=viajes-${decodeURIComponent(clienteNombre)}-${mesNum}-${anoNum}.pdf`
    );
    res.send(pdfBuffer);

    console.log("✅ PDF Individual generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Individual:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF",
      error: error.message,
    });
  }
};

// =====================================================
// 📄 PDF 3: RESUMEN CON CRÉDITO FISCAL (Imagen 2)
// Incluye separación de crédito fiscal y consumidor final
// =====================================================
ReportesViajesDirecto.generarPDFCreditoFiscal = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    console.log(`📊 Generando PDF Crédito Fiscal: ${obtenerNombreMes(mesNum)} ${anoNum}`);

    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      'periodoContable.año': anoNum,
      'periodoContable.mes': mesNum
    })
      .populate('clienteOperativo', 'nombreComercial nombreEmpresa')
      .sort({ clienteNombre: 1 })
      .lean();

    if (viajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes completados en ${obtenerNombreMes(mesNum)} ${anoNum}`,
      });
    }

    // 📊 AGRUPAR POR CLIENTE Y TIPO DE CONSUMIDOR
    const clientesMap = new Map();

    viajes.forEach((viaje) => {
      const clienteNombre = viaje.clienteNombre || 
                           viaje.clienteOperativo?.nombreComercial || 
                           'CLIENTE';
      
      if (!clientesMap.has(clienteNombre)) {
        clientesMap.set(clienteNombre, {
          cliente: clienteNombre,
          totalViajes: 0,
          montoSinIVA: 0,
          iva: 0,
          montoTotal: 0,
          tipoConsumidor: viaje.facturacion?.tipoConsumidor || 'contribuyente'
        });
      }

      const cliente = clientesMap.get(clienteNombre);
      cliente.totalViajes++;
      cliente.montoSinIVA += (viaje.facturacion?.montoSinIVA || 0);
      cliente.iva += (viaje.facturacion?.iva || 0);
      cliente.montoTotal += (viaje.facturacion?.montoTotal || viaje.montoAcordado || 0);
    });

    const clientesArray = Array.from(clientesMap.values());
    
    // Separar por tipo de consumidor
    const contribuyentes = clientesArray.filter(c => c.tipoConsumidor === 'contribuyente');
    const consumidoresFinales = clientesArray.filter(c => c.tipoConsumidor === 'consumidor_final');

    const totalCreditoFiscal = contribuyentes.reduce((sum, c) => sum + c.montoTotal, 0);
    const totalConsumidorFinal = consumidoresFinales.reduce((sum, c) => sum + c.montoTotal, 0);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; background: #fff; }
    .header { text-align: center; margin-bottom: 25px; }
    .header h1 { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
    .header .period { font-size: 18px; font-weight: bold; color: #2563eb; }
    .section { margin-bottom: 25px; }
    .section-title { background: #2563eb; color: white; padding: 10px; font-size: 14px; font-weight: bold; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
    th { background: #d3d3d3; font-weight: bold; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { background: #e8e8e8; font-weight: bold; }
    .grand-total { background: #2563eb; color: white; font-size: 14px; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RESUMEN DE VIAJES POR CLIENTE</h1>
    <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
  </div>

  ${contribuyentes.length > 0 ? `
  <div class="section">
    <div class="section-title">CRÉDITO FISCAL (CONTRIBUYENTES)</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>CLIENTE</th>
          <th class="text-center">VIAJES</th>
          <th class="text-right">MONTO SIN IVA</th>
          <th class="text-right">IVA (13%)</th>
          <th class="text-right">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${contribuyentes.map((c, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td>${c.cliente}</td>
            <td class="text-center">${c.totalViajes}</td>
            <td class="text-right">$ ${c.montoSinIVA.toFixed(2)}</td>
            <td class="text-right">$ ${c.iva.toFixed(2)}</td>
            <td class="text-right">$ ${c.montoTotal.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">TOTAL CRÉDITO FISCAL</td>
          <td class="text-right">$ ${contribuyentes.reduce((s, c) => s + c.montoSinIVA, 0).toFixed(2)}</td>
          <td class="text-right">$ ${contribuyentes.reduce((s, c) => s + c.iva, 0).toFixed(2)}</td>
          <td class="text-right">$ ${totalCreditoFiscal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  ${consumidoresFinales.length > 0 ? `
  <div class="section">
    <div class="section-title">CONSUMIDOR FINAL</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>CLIENTE</th>
          <th class="text-center">VIAJES</th>
          <th class="text-right">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${consumidoresFinales.map((c, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td>${c.cliente}</td>
            <td class="text-center">${c.totalViajes}</td>
            <td class="text-right">$ ${c.montoTotal.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">TOTAL CONSUMIDOR FINAL</td>
          <td class="text-right">$ ${totalConsumidorFinal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <table>
    <tr class="grand-total">
      <td>TOTAL GENERAL</td>
      <td class="text-right">CRÉDITO FISCAL: $ ${totalCreditoFiscal.toFixed(2)}</td>
      <td class="text-right">CONSUMIDOR FINAL: $ ${totalConsumidorFinal.toFixed(2)}</td>
    </tr>
  </table>

  <div class="footer">
    <p><strong>NOTA:</strong> Documento generado el ${formatearFecha(new Date())}</p>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15px", right: "15px", bottom: "15px", left: "15px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=credito-fiscal-${mesNum}-${anoNum}.pdf`
    );
    res.send(pdfBuffer);

    console.log("✅ PDF Crédito Fiscal generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Crédito Fiscal:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF",
      error: error.message,
    });
  }
};

// =====================================================
// 📄 PDF 4: CONSOLIDADO ANUAL (Imagen 4 - Landscape)
// Muestra todos los meses del año en formato horizontal
// =====================================================
ReportesViajesDirecto.generarPDFConsolidadoAnual = async (req, res) => {
  let browser;
  try {
    const { ano } = req.params;
    const anoNum = parseInt(ano);

    console.log(`📊 Generando PDF Consolidado Anual: ${anoNum}`);

    // Obtener datos usando el método estático del modelo
    const datos = await ViajesModel.obtenerConsolidadoAnual(anoNum);

    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes completados en ${anoNum}`,
      });
    }

    // Crear matriz de 12 meses para cada cliente
    const clientesData = datos.map(cliente => {
      const mesesArray = Array(12).fill(null).map((_, index) => {
        const mesData = cliente.meses.find(m => m.mes === (index + 1));
        return {
          mes: index + 1,
          viajes: mesData?.viajes || 0,
          monto: mesData?.monto || 0
        };
      });

      const totalAnual = mesesArray.reduce((sum, m) => sum + m.monto, 0);
      const totalViajes = mesesArray.reduce((sum, m) => sum + m.viajes, 0);

      return {
        cliente: cliente._id,
        meses: mesesArray,
        totalAnual,
        totalViajes
      };
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 18px; font-weight: bold; }
    .header .year { font-size: 16px; color: #2563eb; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #000; padding: 6px; text-align: center; }
    th { background: #d3d3d3; font-weight: bold; }
    .cliente-cell { text-align: left; font-weight: bold; min-width: 120px; }
    .text-right { text-align: right; }
    .total-row { background: #e8e8e8; font-weight: bold; }
    .mes-header { writing-mode: horizontal-tb; font-size: 9px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONSOLIDADO ANUAL DE VIAJES</h1>
    <div class="year">AÑO ${anoNum}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="cliente-cell">CLIENTE</th>
        ${Array(12).fill(0).map((_, i) => `<th class="mes-header">${obtenerNombreMes(i + 1).substring(0, 3)}</th>`).join('')}
        <th>TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${clientesData.map(cliente => `
        <tr>
          <td class="cliente-cell">${cliente.cliente}</td>
          ${cliente.meses.map(mes => `
            <td class="text-right">${mes.monto > 0 ? `$${mes.monto.toFixed(0)}` : '-'}</td>
          `).join('')}
          <td class="text-right"><strong>$${cliente.totalAnual.toFixed(2)}</strong></td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td>TOTAL</td>
        ${Array(12).fill(0).map((_, mesIndex) => {
          const totalMes = clientesData.reduce((sum, c) => sum + c.meses[mesIndex].monto, 0);
          return `<td class="text-right">$${totalMes.toFixed(0)}</td>`;
        }).join('')}
        <td class="text-right">$${clientesData.reduce((sum, c) => sum + c.totalAnual, 0).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 15px; font-size: 10px;">
    <p><strong>Generado:</strong> ${formatearFecha(new Date())} - Total clientes: ${clientesData.length}</p>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true, // ← HORIZONTAL
      printBackground: true,
      margin: { top: "15px", right: "15px", bottom: "15px", left: "15px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=consolidado-anual-${anoNum}.pdf`
    );
    res.send(pdfBuffer);

    console.log("✅ PDF Consolidado Anual generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Consolidado:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF consolidado",
      error: error.message,
    });
  }
};

export default ReportesViajesDirecto;