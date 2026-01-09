import ViajesModel from "../Models/Viajes.js";
import ClientesModel from "../Models/Clientes.js";
import puppeteer from "puppeteer";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const ReportesViajesDirecto = {};

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

// ===== NUEVAS FUNCIONES AUXILIARES PARA PERÍODOS =====

const obtenerDiasDelMes = (ano, mes) => {
  return new Date(ano, mes, 0).getDate();
};

const obtenerMesesTrimestre = (trimestre) => {
  const meses = [
    ['ENE', 'FEB', 'MAR'],
    ['ABR', 'MAY', 'JUN'],
    ['JUL', 'AGO', 'SEP'],
    ['OCT', 'NOV', 'DIC']
  ];
  return meses[trimestre - 1];
};

const obtenerFechaInicioSemana = (ano, mes, semana) => {
  const primerDia = new Date(ano, mes - 1, 1);
  const diaInicio = 1 + ((semana - 1) * 7);
  return new Date(ano, mes - 1, diaInicio);
};

const obtenerFechaFinSemana = (ano, mes, semana) => {
  const fechaInicio = obtenerFechaInicioSemana(ano, mes, semana);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaInicio.getDate() + 6);
  
  const ultimoDiaMes = obtenerDiasDelMes(ano, mes);
  if (fechaFin.getDate() > ultimoDiaMes || fechaFin.getMonth() !== mes - 1) {
    return new Date(ano, mes - 1, ultimoDiaMes);
  }
  return fechaFin;
};

const generarColumnasMeses = (cantidad, mesInicio) => {
  const columnas = [];
  for (let i = 0; i < cantidad; i++) {
    const mesNum = ((mesInicio - 1 + i) % 12) + 1;
    columnas.push({
      key: mesNum,
      label: obtenerNombreMes(mesNum).substring(0, 3),
      tipo: 'mes'
    });
  }
  return columnas;
};

const generarColumnasDias = (cantidad, fechaInicio) => {
  const columnas = [];
  const fecha = new Date(fechaInicio);
  
  for (let i = 0; i < cantidad; i++) {
    const diaActual = new Date(fecha);
    diaActual.setDate(fecha.getDate() + i);
    
    columnas.push({
      key: diaActual.getDate(),
      label: `${diaActual.getDate()}`,
      tipo: 'dia',
      fecha: diaActual
    });
  }
  return columnas;
};

const procesarDatosClientes = (datos, columnas) => {
  return datos.map(cliente => {
    const columnasArray = columnas.map(col => {
      let periodoData;
      
      if (col.tipo === 'mes') {
        periodoData = cliente.periodos?.find(p => p.mes === col.key);
      } else if (col.tipo === 'dia') {
        periodoData = cliente.periodos?.find(p => p.dia === col.key);
      }
      
      return {
        periodo: col.key,
        viajes: periodoData?.viajes || 0,
        monto: periodoData?.monto || 0
      };
    });

    const totalPeriodo = columnasArray.reduce((sum, p) => sum + p.monto, 0);
    const totalViajes = columnasArray.reduce((sum, p) => sum + p.viajes, 0);

    return {
      cliente: cliente._id,
      columnas: columnasArray,
      totalPeriodo,
      totalViajes
    };
  });
};

const generarHTMLConsolidado = (titulo, columnas, clientesData, landscape = true) => {
  const logoBase64 = convertirImagenABase64(RUTA_LOGO);
  const fontSize = columnas.length > 20 ? '7px' : columnas.length > 15 ? '8px' : '10px';
  const cellPadding = columnas.length > 20 ? '3px' : columnas.length > 15 ? '4px' : '6px';
  const headerFontSize = columnas.length > 20 ? '7px' : columnas.length > 15 ? '8px' : '9px';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
      padding: 0;
      background: #FFFFFF;
      color: #34353A;
    }
    
    /* HEADER */
    .main-header {
      background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 5px solid #5D9646;
      margin-bottom: 25px;
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo-container img {
      width: 180px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .main-header h1 {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 300;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .main-header .periodo {
      color: #5D9646;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .content {
      padding: 0 20px 20px 20px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: ${fontSize}; 
      background: #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td { 
      border: 1px solid #e5e7eb; 
      padding: ${cellPadding}; 
      text-align: center; 
    }
    th { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: 600; 
      border-bottom: 3px solid #5D9646;
    }
    .cliente-cell { 
      text-align: left; 
      font-weight: bold; 
      min-width: ${landscape ? '100px' : '120px'}; 
      max-width: ${landscape ? '150px' : '180px'};
      font-size: ${landscape ? '9px' : '10px'};
      background: #f9fafb;
    }
    .text-right { text-align: right; }
    .total-row { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: bold; 
    }
    .total-row .text-right {
      color: #5D9646;
    }
    .periodo-header { font-size: ${headerFontSize}; }
    .total-cell { 
      font-weight: bold; 
      font-size: ${fontSize === '7px' ? '8px' : '10px'}; 
    }
    
    .footer {
      margin-top: 20px;
      padding: 20px;
      border-top: 3px solid #34353A;
      text-align: center;
    }
    .footer p {
      color: #6b7280;
      font-size: 10px;
      margin: 3px 0;
    }
    .footer .company {
      color: #34353A;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="main-header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Consolidado de Viajes</h1>
    <div class="periodo">${titulo}</div>
  </div>

  <div class="content">
    <table>
      <thead>
        <tr>
          <th class="cliente-cell">CLIENTE</th>
          ${columnas.map(col => `<th class="periodo-header">${col.label}</th>`).join('')}
          <th class="total-cell">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${clientesData.map(cliente => `
          <tr>
            <td class="cliente-cell">${cliente.cliente}</td>
            ${cliente.columnas.map(col => `
              <td class="text-right">${col.monto > 0 ? `$${col.monto.toFixed(0)}` : '-'}</td>
            `).join('')}
            <td class="text-right total-cell">$${cliente.totalPeriodo.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td class="cliente-cell">TOTAL</td>
          ${columnas.map((_, colIndex) => {
            const totalCol = clientesData.reduce((sum, c) => sum + c.columnas[colIndex].monto, 0);
            return `<td class="text-right">$${totalCol > 0 ? totalCol.toFixed(0) : '-'}</td>`;
          }).join('')}
          <td class="text-right total-cell">$${clientesData.reduce((sum, c) => sum + c.totalPeriodo, 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p><strong>Generado:</strong> ${formatearFecha(new Date())} a las ${formatearHora(new Date())}</p>
      <p class="company">Rivera Distribuidora y Transportes</p>
      <p>Total clientes: ${clientesData.length} | Total viajes: ${clientesData.reduce((sum, c) => sum + c.totalViajes, 0)}</p>
    </div>
  </div>
</body>
</html>
`;
};

// =====================================================
// 📊 NUEVO: PDF CONSOLIDADO POR PERÍODO (UNIVERSAL)
// Soporta: semanal, mensual, trimestral, semestral, 9meses, anual
// =====================================================
ReportesViajesDirecto.generarPDFConsolidadoPeriodo = async (req, res) => {
  let browser;
  try {
    const { periodo, ano, mes, trimestre, semana, semestre } = req.query;

    if (!periodo || !ano) {
      return res.status(400).json({
        success: false,
        message: "Se requieren los parámetros: periodo y ano",
      });
    }

    const anoNum = parseInt(ano);
    console.log(`📊 Generando PDF Consolidado: ${periodo.toUpperCase()} - ${ano}`);

    let datos, titulo, columnas, landscape = true;

    switch (periodo.toLowerCase()) {
      case 'semanal':
        if (!mes || !semana) {
          return res.status(400).json({
            success: false,
            message: "Para reporte semanal se requieren: ano, mes, semana",
          });
        }
        const mesNumSemanal = parseInt(mes);
        const semanaNum = parseInt(semana);
        
        if (mesNumSemanal < 1 || mesNumSemanal > 12) {
          return res.status(400).json({
            success: false,
            message: "El mes debe estar entre 1 y 12",
          });
        }
        
        if (semanaNum < 1 || semanaNum > 5) {
          return res.status(400).json({
            success: false,
            message: "La semana debe estar entre 1 y 5",
          });
        }
        
        datos = await ViajesModel.obtenerConsolidadoSemanal(anoNum, mesNumSemanal, semanaNum);
        const fechaInicio = obtenerFechaInicioSemana(anoNum, mesNumSemanal, semanaNum);
        const fechaFin = obtenerFechaFinSemana(anoNum, mesNumSemanal, semanaNum);
        titulo = `SEMANA ${semanaNum} - ${obtenerNombreMes(mesNumSemanal)} ${anoNum}<br><span style="font-size: 14px;">(${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)})</span>`;
        columnas = generarColumnasDias(7, fechaInicio);
        landscape = false;
        break;

      case 'mensual':
        if (!mes) {
          return res.status(400).json({
            success: false,
            message: "Para reporte mensual se requieren: ano, mes",
          });
        }
        const mesNumMensual = parseInt(mes);
        
        if (mesNumMensual < 1 || mesNumMensual > 12) {
          return res.status(400).json({
            success: false,
            message: "El mes debe estar entre 1 y 12",
          });
        }
        
        datos = await ViajesModel.obtenerConsolidadoMensual(anoNum, mesNumMensual);
        titulo = `${obtenerNombreMes(mesNumMensual)} ${anoNum}`;
        const diasDelMes = obtenerDiasDelMes(anoNum, mesNumMensual);
        columnas = generarColumnasDias(diasDelMes, new Date(anoNum, mesNumMensual - 1, 1));
        landscape = true;
        break;

      case 'trimestral':
        if (!trimestre) {
          return res.status(400).json({
            success: false,
            message: "Para reporte trimestral se requieren: ano, trimestre (1-4)",
          });
        }
        const trimestreNum = parseInt(trimestre);
        
        if (trimestreNum < 1 || trimestreNum > 4) {
          return res.status(400).json({
            success: false,
            message: "El trimestre debe estar entre 1 y 4",
          });
        }
        
        datos = await ViajesModel.obtenerConsolidadoTrimestral(anoNum, trimestreNum);
        const mesesTrimestre = obtenerMesesTrimestre(trimestreNum);
        titulo = `TRIMESTRE ${trimestreNum} (${mesesTrimestre.join('-')}) ${anoNum}`;
        columnas = generarColumnasMeses(3, (trimestreNum - 1) * 3 + 1);
        landscape = false;
        break;

      case 'semestral':
        const semestreNum = parseInt(semestre || 1);
        
        if (semestreNum < 1 || semestreNum > 2) {
          return res.status(400).json({
            success: false,
            message: "El semestre debe ser 1 o 2",
          });
        }
        
        datos = await ViajesModel.obtenerConsolidadoSemestral(anoNum, semestreNum);
        titulo = `${semestreNum === 1 ? 'PRIMER' : 'SEGUNDO'} SEMESTRE ${anoNum}`;
        columnas = generarColumnasMeses(6, semestreNum === 1 ? 1 : 7);
        landscape = true;
        break;

      case '9meses':
        datos = await ViajesModel.obtenerConsolidado9Meses(anoNum);
        titulo = `PRIMEROS 9 MESES - ${anoNum}`;
        columnas = generarColumnasMeses(9, 1);
        landscape = true;
        break;

      case 'anual':
        datos = await ViajesModel.obtenerConsolidadoAnual(anoNum);
        titulo = `AÑO ${anoNum}`;
        columnas = generarColumnasMeses(12, 1);
        landscape = true;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Período no válido. Opciones: semanal, mensual, trimestral, semestral, 9meses, anual`,
        });
    }

    if (!datos || datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes completados en el período seleccionado`,
      });
    }

    const clientesData = procesarDatosClientes(datos, columnas);
    const htmlContent = generarHTMLConsolidado(titulo, columnas, clientesData, landscape);

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: landscape,
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await browser.close();

    let filename = `consolidado-${periodo}-${anoNum}`;
    if (mes) filename += `-mes${mes}`;
    if (semana) filename += `-sem${semana}`;
    if (trimestre) filename += `-t${trimestre}`;
    if (semestre) filename += `-s${semestre}`;
    filename += '.pdf';

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(pdfBuffer);

    console.log(`✅ PDF Consolidado ${periodo} generado exitosamente`);

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
// 📄 PDF 1: RESUMEN MENSUAL (nuevo: semanas Tue-Sun)
// =====================================================
ReportesViajesDirecto.generarPDFResumenMensualV2 = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    // Validación de parámetros
    if (!mes || !ano || isNaN(mesNum) || isNaN(anoNum)) {
      return res.status(400).json({ success: false, message: 'Parámetros inválidos. Usa /resumen-mes/:mes/:ano (ej: /resumen-mes/10/2025)' });
    }

    console.log(`📊 Generando PDF Resumen Mensual V2 (semanas Tue-Sun): ${obtenerNombreMes(mesNum)} ${anoNum}`);

    // Encontrar primer martes del mes
    const firstOfMonth = new Date(anoNum, mesNum - 1, 1);
    let firstTuesday = new Date(firstOfMonth);
    let attempts = 0;
    while (firstTuesday.getDay() !== 2 && attempts < 10) {
      firstTuesday.setDate(firstTuesday.getDate() + 1);
      attempts++;
    }
    if (firstTuesday.getDay() !== 2) return res.status(500).json({ success: false, message: 'No se pudo determinar el primer martes del mes' });

    // Último día del mes (límite en la hora final)
    const lastDayOfMonthDate = new Date(anoNum, mesNum - 1, new Date(anoNum, mesNum, 0).getDate(), 23, 59, 59, 999);

    // Construir semanas (Tuesday -> Sunday). Incluir semanas cuya fecha de inicio (martes) esté dentro del mes
    const weeks = [];
    let start = new Date(firstTuesday);
    while (start <= lastDayOfMonthDate) {
      const end = new Date(start);
      end.setDate(start.getDate() + 5); // Tue..Sun
      weeks.push({ start: new Date(start), end: new Date(end) });
      start = new Date(start);
      start.setDate(start.getDate() + 7);
    }

    if (weeks.length === 0) {
      return res.status(404).json({ success: false, message: 'No se pudieron construir las semanas para el mes indicado' });
    }

    // Rango total a consultar: desde inicio del primer martes (00:00) hasta fin del último domingo (23:59:59.999)
    const overallStart = new Date(weeks[0].start);
    overallStart.setHours(0,0,0,0);
    const overallEnd = new Date(weeks[weeks.length - 1].end);
    overallEnd.setHours(23,59,59,999);

    // Obtener viajes en el rango completo
    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      departureTime: { $gte: overallStart, $lte: overallEnd }
    })
      .populate('clienteOperativo', 'nombreComercial nombreEmpresa')
      .populate('truckId', 'licensePlate placa')
      .sort({ clienteNombre: 1, departureTime: 1 })
      .lean();

    if (!viajes || viajes.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay viajes en el periodo indicado' });
    }

    const clientesMap = new Map();
    let totalViajesGeneral = 0;
    let totalMontoGeneral = 0;

    viajes.forEach(v => {
      const cliente = v.clienteNombre || v.clienteOperativo?.nombreComercial || 'SIN CLIENTE';
      const fecha = new Date(v.departureTime);
      const monto = v.montoAcordado || v.facturacion?.montoTotal || 0;

      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, { semanas: weeks.map(() => ({ viajes: 0, monto: 0 })), totalViajes: 0, totalMonto: 0 });
      }

      const data = clientesMap.get(cliente);
      // asignar a semana
      for (let i = 0; i < weeks.length; i++) {
        const w = weeks[i];
        if (fecha >= w.start && fecha <= w.end) {
          data.semanas[i].viajes += 1;
          data.semanas[i].monto += monto;
          break;
        }
      }
      data.totalViajes += 1;
      data.totalMonto += monto;
      totalViajesGeneral += 1;
      totalMontoGeneral += monto;
    });

    // filas
    let filasHTML = '';
    let idx = 1;
    clientesMap.forEach((data, cliente) => {
      let cols = '';
      for (let i = 0; i < weeks.length; i++) {
        const s = data.semanas[i];
        // mostrar 0 y $0.00 en lugar de '-'
        cols += `<td style=\"text-align:center\">${s.viajes}</td>`;
        cols += `<td style=\"text-align:right\">$${s.monto.toFixed(2)}</td>`;
      }
      filasHTML += `
        <tr>
          <td class="cell-numero">${idx}</td>
          <td class="cell-cliente">${cliente}</td>
          ${cols}
          <td class="cell-total">$ ${data.totalMonto.toFixed(2)}</td>
        </tr>
      `;
      idx++;
    });

    const formatWeekLabel = (s, e) => {
      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `DEL ${s.getDate()} AL ${e.getDate()} DE ${obtenerNombreMes(s.getMonth() + 1)} ${s.getFullYear()}`;
      }
      return `DEL ${s.getDate()}/${s.getMonth()+1} AL ${e.getDate()}/${e.getMonth()+1}`;
    };

    const weekHeadersTop = weeks.map(w => `<th colspan=\"2\">${formatWeekLabel(w.start, w.end)}</th>`).join('');

    const weekHeadersBottom = weeks.map(() => `<th>VIAJES</th><th>MONTO</th>`).join('');

    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; background: #FFFFFF; color: #34353A; }
    .main-header { background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%); padding: 20px; text-align: center; border-bottom: 5px solid #5D9646; margin-bottom: 12px; }
    .logo-container img { width: 140px; height: auto; background: white; padding: 6px; border-radius: 6px; }
    .main-header h1 { color: #FFFFFF; font-size: 18px; font-weight: 600; text-transform: uppercase; }
    .main-header .periodo { color: #5D9646; font-size: 12px; font-weight: 700; margin-top: 6px; }
    .content { padding: 0 12px 18px 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: center; }
    th.top { background: #34353A; color: #FFFFFF; font-weight: 700; font-size: 11px; }
    th.sub { background: #5D9646; color: #FFFFFF; font-weight: 700; font-size: 10px; }
    .cell-cliente { text-align: left; padding-left: 10px; font-weight: 700; min-width: 140px; }
    .cell-numero { text-align: center; font-weight: 700; width: 4%; }
    .cell-total { text-align: right; font-weight: 700; padding-right: 10px; background: #f9fafb; color: #5D9646; }
    .total-row { background: #34353A; color: #FFFFFF; font-weight: 700; }
    .footer { margin-top: 10px; padding: 10px; border-top: 3px solid #34353A; text-align: center; font-size: 11px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="main-header">
    <div class="logo-container">${logoBase64 ? `<img src=\"${logoBase64}\" alt=\"Rivera\" />` : '<p style=\"color:white\">RIVERA</p>'}</div>
    <h1>CUADRO COMPARATIVO DE VIAJES DEL MES DE ${obtenerNombreMes(mesNum)} ${anoNum}</h1>
    <div class="periodo">Periodo: ${formatearFecha(weeks[0].start)} — ${formatearFecha(weeks[weeks.length - 1].end)}</div>
  </div>
  <div class="content">
    <table>
      <thead>
        <tr>
          <th class="top">#</th>
          <th class="top">CLIENTE</th>
          ${weekHeadersTop}
          <th class="top">TOTAL</th>
        </tr>
        <tr>
          <th class="sub"></th>
          <th class="sub"></th>
          ${weekHeadersBottom}
          <th class="sub"></th>
        </tr>
      </thead>
      <tbody>
        ${filasHTML}
        <tr class="total-row">
          <td colspan="2">TOTAL</td>
          ${weeks.map((_, i) => {
            const totalV = [...clientesMap.values()].reduce((s, c) => s + (c.semanas[i]?.viajes || 0), 0);
            const totalM = [...clientesMap.values()].reduce((s, c) => s + (c.semanas[i]?.monto || 0), 0);
            return `<td style=\"text-align:center\">${totalV}</td><td style=\"text-align:right\">$${totalM.toFixed(2)}</td>`;
          }).join('')}
          <td style=\"text-align:right\">$ ${totalMontoGeneral.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">Generado: ${formatearFecha(new Date())} - Rivera Distribuidora y Transportes</div>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" } });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=resumen-viajes-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`);
    res.send(pdfBuffer);

    console.log("✅ PDF Resumen Mensual V2 (semanas Tue-Sun) generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Resumen Mensual V2:", error);
    res.status(500).json({ success: false, message: "Error al generar el PDF V2", error: error.message });
  }
};
ReportesViajesDirecto.generarPDFResumenMensual = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

    console.log(`📊 Generando PDF Resumen Mensual: ${obtenerNombreMes(mesNum)} ${anoNum}`);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: "Mes inválido. Debe estar entre 1 y 12",
      });
    }

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

      filasHTML += `
        <tr>
          <td rowspan="${rutasArray.length}" class="cell-numero">${numeroCliente}</td>
          <td class="cell-cliente">${rutasArray[0].rutaCompleta}</td>
          <td class="cell-viajes">${rutasArray[0].cantidadViajes}</td>
          <td class="cell-monto">$ ${rutasArray[0].montoTotal.toFixed(2)}</td>
          <td rowspan="${rutasArray.length}" class="cell-total">$ ${totalMontoCliente.toFixed(2)}</td>
        </tr>
      `;

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
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      padding: 0; 
      background: #FFFFFF; 
      color: #34353A;
    }
    
    .header {
      background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
      padding: 35px;
      text-align: center;
      border-bottom: 5px solid #5D9646;
      margin-bottom: 30px;
    }
    .header .logo-container {
      margin-bottom: 20px;
    }
    .header .logo-container img {
      width: 200px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .header h1 { 
      color: #FFFFFF; 
      font-size: 26px; 
      font-weight: 300; 
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px; 
    }
    .header .period { 
      color: #5D9646; 
      font-size: 22px; 
      font-weight: 600; 
    }
    
    .content {
      padding: 0 30px 30px 30px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 25px;
    }
    th, td { 
      border: 1px solid #e5e7eb; 
      padding: 12px; 
      text-align: center; 
    }
    th { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: 600; 
      font-size: 13px; 
      text-transform: uppercase;
      border-bottom: 3px solid #5D9646;
    }
    td { font-size: 13px; }
    .cell-numero { 
      width: 5%; 
      font-weight: bold; 
      vertical-align: middle; 
      background: #f9fafb;
    }
    .cell-cliente { 
      width: 40%; 
      text-align: left; 
      padding-left: 15px; 
      font-weight: 600; 
    }
    .cell-viajes { width: 12%; color: #5F8EAD; font-weight: 600; }
    .cell-monto { 
      width: 18%; 
      text-align: right; 
      padding-right: 15px; 
      color: #5F8EAD;
      font-weight: 600;
    }
    .cell-total { 
      width: 25%; 
      text-align: right; 
      padding-right: 15px; 
      font-weight: bold; 
      vertical-align: middle; 
      background: #f9fafb;
      color: #5D9646;
    }
    .total-row { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: bold; 
      font-size: 15px; 
    }
    .total-row td { 
      padding: 15px 12px; 
      border-color: #34353A;
    }
    .total-row .cell-monto,
    .total-row .cell-total {
      color: #5D9646;
    }
    
    .footer { 
      margin-top: 25px; 
      padding: 20px 30px;
      border-top: 3px solid #34353A;
      text-align: center;
    }
    .footer .nota { 
      font-weight: 600; 
      font-size: 13px; 
      color: #34353A;
      margin-bottom: 5px;
    }
    .footer .detalle { 
      font-size: 12px; 
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Resumen de Viajes por Cliente</h1>
    <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
  </div>

  <div class="content">
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
          <td class="cell-monto">$ ${totalMontoGeneral.toFixed(2)}</td>
          <td class="cell-total">$ ${totalMontoGeneral.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div class="nota">NOTA:</div>
      <div class="detalle">PRECIO SIN IVA</div>
      <div class="detalle" style="margin-top: 10px;">Generado: ${formatearFecha(new Date())} - Rivera Distribuidora y Transportes</div>
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
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
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
// 📄 PDF X: RESUMEN POR MÉTODO DE PAGO (Efectivo | Cheque | Transferencia)
// =====================================================
ReportesViajesDirecto.generarPDFResumenPorMetodoPago = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    console.log(`📊 Generando PDF Resumen por Método de Pago: ${obtenerNombreMes(mesNum)} ${anoNum}`);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ success: false, message: "Mes inválido" });
    }

    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      'periodoContable.año': anoNum,
      'periodoContable.mes': mesNum
    }).lean();

    if (!viajes || viajes.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron viajes para el periodo especificado' });
    }

    // Agregar datos por cliente y por método
    const clientesMap = new Map();

    const normalizarMetodo = (m) => {
      if (!m) return 'efectivo';
      const mm = m.toString().toLowerCase();
      if (mm.includes('efect')) return 'efectivo';
      if (mm.includes('cheq')) return 'cheque';
      if (mm.includes('transf')) return 'transferencia';
      return 'otro';
    };

    let totalViajesGeneral = 0;
    let totalMontoGeneral = 0;

    viajes.forEach(viaje => {
      const cliente = viaje.clienteNombre || (viaje.clienteOperativo && viaje.clienteOperativo.nombreComercial) || 'SIN CLIENTE';
      const metodo = normalizarMetodo(viaje.facturacion && viaje.facturacion.metodoPago);
      const monto = viaje.montoAcordado || viaje.facturacion?.montoTotal || 0;

      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          efectivo: { viajes: 0, monto: 0 },
          cheque: { viajes: 0, monto: 0 },
          transferencia: { viajes: 0, monto: 0 },
          otro: { viajes: 0, monto: 0 },
          totalViajes: 0,
          totalMonto: 0
        });
      }

      const data = clientesMap.get(cliente);
      data[metodo].viajes += 1;
      data[metodo].monto += monto;
      data.totalViajes += 1;
      data.totalMonto += monto;

      totalViajesGeneral += 1;
      totalMontoGeneral += monto;
    });

    // Generar filas HTML
    let filasHTML = '';
    let numero = 1;

    clientesMap.forEach((data, clienteNombre) => {
      const formato = (v, m) => (v > 0 ? `${v} / $${m.toFixed(2)}` : '-');

      filasHTML += `
        <tr>
          <td>#${numero}</td>
          <td style="text-align:left; padding-left:15px; font-weight:600">${clienteNombre}</td>
          <td style="text-align:center">${data.totalViajes}</td>
          <td style="text-align:right">${formato(data.efectivo.viajes, data.efectivo.monto)}</td>
          <td style="text-align:right">${formato(data.cheque.viajes, data.cheque.monto)}</td>
          <td style="text-align:right">${formato(data.transferencia.viajes, data.transferencia.monto)}</td>
          <td style="text-align:right">${formato(data.otro.viajes, data.otro.monto)}</td>
          <td style="text-align:right; font-weight:600">$ ${data.totalMonto.toFixed(2)}</td>
        </tr>
      `;

      numero += 1;
    });

    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; background: #FFFFFF; color: #34353A; }
    .header { background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%); padding: 35px; text-align: center; border-bottom: 5px solid #5D9646; margin-bottom: 30px; }
    .header .logo-container { margin-bottom: 20px; }
    .header .logo-container img { width: 200px; height: auto; background: white; padding: 10px; border-radius: 8px; }
    .header h1 { color: #FFFFFF; font-size: 22px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .header .period { color: #5D9646; font-size: 18px; font-weight: 600; }
    .content { padding: 0 30px 30px 30px; }
    table { width: 100%; border-collapse: collapse; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 25px; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: center; }
    th { background: #34353A; color: #FFFFFF; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 3px solid #5D9646; }
    .cell-cliente { text-align: left; padding-left: 15px; font-weight: 600; }
    .cell-monto { text-align: right; color: #5F8EAD; font-weight: 600; }
    .total-row { background: #34353A; color: #FFFFFF; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Resumen de Viajes por Método de Pago</h1>
    <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
  </div>

  <div class="content">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>CLIENTE</th>
          <th>VIAJES</th>
          <th>EFECTIVO<br>(viajes / monto)</th>
          <th>CHEQUE<br>(viajes / monto)</th>
          <th>TRANSFERENCIA<br>(viajes / monto)</th>
          <th>OTRO<br>(viajes / monto)</th>
          <th>MONTO TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${filasHTML}
        <tr class="total-row">
          <td colspan="2">TOTAL</td>
          <td>${totalViajesGeneral}</td>
          <td class="cell-monto">$${[...clientesMap.values()].reduce((s, c) => s + c.efectivo.monto, 0).toFixed(2)}</td>
          <td class="cell-monto">$${[...clientesMap.values()].reduce((s, c) => s + c.cheque.monto, 0).toFixed(2)}</td>
          <td class="cell-monto">$${[...clientesMap.values()].reduce((s, c) => s + c.transferencia.monto, 0).toFixed(2)}</td>
          <td class="cell-monto">$${[...clientesMap.values()].reduce((s, c) => s + c.otro.monto, 0).toFixed(2)}</td>
          <td class="cell-monto">$ ${totalMontoGeneral.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div class="detalle">Generado: ${formatearFecha(new Date())} - Rivera Distribuidora y Transportes</div>
    </div>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" } });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=resumen-viajes-metodo-${obtenerNombreMes(mesNum)}-${anoNum}.pdf`);
    res.send(pdfBuffer);

    console.log("✅ PDF Resumen por Método de Pago generado exitosamente");

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Resumen por Método:", error);
    res.status(500).json({ success: false, message: "Error al generar el PDF por método", error: error.message });
  }
};

// =====================================================
// 📄 PDF 2: INDIVIDUAL POR CLIENTE (Detallado)
// =====================================================
ReportesViajesDirecto.generarPDFClienteIndividual = async (req, res) => {
  let browser;
  try {
    const { clienteNombre, mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

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
    body { 
      font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; 
      padding:0; 
      color:#34353A; 
      background:#FFFFFF; 
    }
    
    .header {
      background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 5px solid #5D9646;
      margin-bottom: 35px;
    }
    .header .logo-container {
      margin-bottom: 20px;
    }
    .header .logo-container img {
      width: 200px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .header h1 { 
      color: #FFFFFF; 
      font-size: 28px; 
      margin-bottom: 8px; 
      font-weight: 300; 
      text-transform: uppercase; 
      letter-spacing: 2px;
    }
    .header .subtitle { 
      color: rgba(255, 255, 255, 0.9); 
      font-size: 16px; 
      font-weight: 300; 
    }
    
    .container { 
      padding: 0 40px 40px 40px; 
    }
    
    .section { 
      margin-bottom:30px; 
      background:#f8fafc; 
      padding:25px; 
      border-radius:8px; 
      border-left:5px solid #5F8EAD; 
    }
    .section-title { 
      color:#5F8EAD; 
      font-size:18px; 
      font-weight:700; 
      margin-bottom:15px; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-grid { 
      display:grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap:15px; 
      margin-top:10px; 
    }
    .info-item { 
      background:white; 
      padding:15px; 
      border-radius:6px; 
      border:1px solid #e2e8f0; 
    }
    .info-item label { 
      display:block; 
      font-weight:600; 
      color:#5F8EAD; 
      font-size:11px; 
      margin-bottom:8px; 
      text-transform:uppercase; 
      letter-spacing: 1px;
    }
    .info-item .value { 
      color:#34353A; 
      font-size:15px; 
      font-weight:500; 
    }
    table { 
      width:100%; 
      border-collapse:collapse; 
      margin-top:15px; 
      background:white; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    thead { 
      background:#34353A; 
      color:white; 
    }
    th { 
      padding:14px; 
      text-align:left; 
      font-weight:600; 
      font-size:12px; 
      text-transform:uppercase; 
      border-bottom: 3px solid #5D9646;
    }
    td { 
      padding:14px; 
      border-bottom:1px solid #e2e8f0; 
      font-size:13px; 
    }
    tbody tr:hover {
      background: #f9fafb;
    }
    .text-right { text-align:right; }
    .total-section { 
      margin-top:25px; 
      background:#34353A; 
      color:white; 
      padding:25px; 
      border-radius:8px; 
      border-top: 5px solid #5D9646;
    }
    .total-grid { 
      display:grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap:20px; 
    }
    .total-item { 
      text-align:center; 
      padding: 15px;
      background: rgba(95, 142, 173, 0.15);
      border-radius: 4px;
    }
    .total-item label { 
      font-size:12px; 
      opacity:0.9; 
      margin-bottom:8px; 
      display: block;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .total-item .value { 
      font-size:24px; 
      font-weight:700; 
    }
    .total-item:last-child .value {
      color: #5D9646;
    }
    .footer { 
      margin-top:35px; 
      text-align:center; 
      color:#6b7280; 
      font-size:11px; 
      border-top:3px solid #34353A; 
      padding-top:20px; 
    }
    .footer p {
      margin: 4px 0;
    }
    .footer .company {
      color: #34353A;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Reporte de Viajes</h1>
    <p class="subtitle">Detalle Individual por Cliente</p>
  </div>

  <div class="container">
    <div class="section">
      <h2 class="section-title">Información del Cliente</h2>
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
      <h2 class="section-title">Rutas y Viajes</h2>
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
            <label>Monto Total</label>
            <div class="value">$${montoTotalGeneral.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Documento generado el ${formatearFecha(new Date())} a las ${formatearHora(new Date())}</p>
      <p class="company">Rivera Distribuidora y Transportes</p>
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
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
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
// 📄 PDF 3: RESUMEN CON CRÉDITO FISCAL
// =====================================================
ReportesViajesDirecto.generarPDFCreditoFiscal = async (req, res) => {
  let browser;
  try {
    const { mes, ano } = req.params;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

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
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      padding: 0; 
      background: #FFFFFF; 
      color: #34353A;
    }
    
    .header {
      background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
      padding: 35px;
      text-align: center;
      border-bottom: 5px solid #5D9646;
      margin-bottom: 30px;
    }
    .header .logo-container {
      margin-bottom: 20px;
    }
    .header .logo-container img {
      width: 200px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .header h1 { 
      color: #FFFFFF;
      font-size: 24px; 
      font-weight: 300; 
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px; 
    }
    .header .period { 
      color: #5D9646; 
      font-size: 20px; 
      font-weight: 600; 
    }
    
    .content {
      padding: 0 30px 30px 30px;
    }
    
    .section { 
      margin-bottom: 30px; 
    }
    .section-title { 
      background: #5F8EAD; 
      color: white; 
      padding: 12px 20px; 
      font-size: 15px; 
      font-weight: bold; 
      margin-bottom: 15px; 
      text-transform: uppercase;
      letter-spacing: 1px;
      border-left: 5px solid #5D9646;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px; 
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td { 
      border: 1px solid #e5e7eb; 
      padding: 12px; 
      text-align: left; 
      font-size: 13px; 
    }
    th { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: 600; 
      text-transform: uppercase;
      border-bottom: 3px solid #5D9646;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: bold; 
    }
    .total-row .text-right {
      color: #5D9646;
    }
    .grand-total { 
      background: #34353A; 
      color: white; 
      font-size: 15px; 
      font-weight: bold; 
      border-top: 3px solid #5D9646;
    }
    .grand-total td {
      padding: 18px;
    }
    .grand-total .text-right {
      color: #5D9646;
    }
    .footer { 
      margin-top: 25px; 
      font-size: 11px; 
      text-align: center;
      padding-top: 20px;
      border-top: 3px solid #34353A;
      color: #6b7280;
    }
    .footer .company {
      color: #34353A;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Resumen de Viajes por Cliente</h1>
    <div class="period">${obtenerNombreMes(mesNum)} ${anoNum}</div>
  </div>

  <div class="content">
    ${contribuyentes.length > 0 ? `
    <div class="section">
      <div class="section-title">Crédito Fiscal (Contribuyentes)</div>
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
      <div class="section-title">Consumidor Final</div>
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
      <p class="company">Rivera Distribuidora y Transportes</p>
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
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
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
// 📄 PDF 4: CONSOLIDADO ANUAL
// =====================================================
ReportesViajesDirecto.generarPDFConsolidadoAnual = async (req, res) => {
  let browser;
  try {
    const { ano } = req.params;
    const anoNum = parseInt(ano);
    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

    console.log(`📊 Generando PDF Consolidado Anual: ${anoNum}`);

    const datos = await ViajesModel.obtenerConsolidadoAnual(anoNum);

    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes completados en ${anoNum}`,
      });
    }

    const clientesData = datos.map(cliente => {
      const mesesArray = Array(12).fill(null).map((_, index) => {
        const mesData = cliente.periodos?.find(m => m.mes === (index + 1));
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
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      padding: 0; 
      background: #FFFFFF; 
      color: #34353A;
    }
    
    .header {
      background: linear-gradient(135deg, #34353A 0%, #5F8EAD 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 5px solid #5D9646;
      margin-bottom: 25px;
    }
    .header .logo-container {
      margin-bottom: 20px;
    }
    .header .logo-container img {
      width: 180px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .header h1 { 
      color: #FFFFFF;
      font-size: 22px; 
      font-weight: 300; 
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header .year { 
      color: #5D9646; 
      font-size: 18px; 
      font-weight: 600; 
      margin-top: 8px;
    }
    
    .content {
      padding: 0 20px 20px 20px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 10px; 
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td { 
      border: 1px solid #e5e7eb; 
      padding: 8px; 
      text-align: center; 
    }
    th { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: 600; 
      border-bottom: 3px solid #5D9646;
    }
    .cliente-cell { 
      text-align: left; 
      font-weight: bold; 
      min-width: 120px; 
      background: #f9fafb;
    }
    .text-right { text-align: right; }
    .total-row { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: bold; 
    }
    .total-row .text-right {
      color: #5D9646;
    }
    .mes-header { 
      writing-mode: horizontal-tb; 
      font-size: 9px; 
    }
    
    .footer {
      margin-top: 20px;
      padding: 15px 20px;
      border-top: 3px solid #34353A;
      text-align: center;
    }
    .footer p {
      color: #6b7280;
      font-size: 10px;
      margin: 3px 0;
    }
    .footer .company {
      color: #34353A;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p style="color: white;">RIVERA</p>'}
    </div>
    <h1>Consolidado Anual de Viajes</h1>
    <div class="year">AÑO ${anoNum}</div>
  </div>

  <div class="content">
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

    <div class="footer">
      <p><strong>Generado:</strong> ${formatearFecha(new Date())} - Total clientes: ${clientesData.length}</p>
      <p class="company">Rivera Distribuidora y Transportes</p>
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
      landscape: true,
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
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