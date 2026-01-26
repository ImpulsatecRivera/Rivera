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

// Detectar entorno de ejecución
const IS_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatearFechaString = (fechaStr) => {
  const [year, month, day] = fechaStr.split('-');
  return `${day}/${month}/${year}`;
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

const generarHTMLConsolidado = (titulo, columnas, clientesData, landscape = false, comparativo = false) => {
  const logoBase64 = convertirImagenABase64(RUTA_LOGO);
  const fontSize = columnas.length > 20 ? '7px' : columnas.length > 15 ? '8px' : '10px';
  const cellPadding = columnas.length > 20 ? '3px' : columnas.length > 15 ? '4px' : '6px';
  const headerFontSize = columnas.length > 20 ? '7px' : columnas.length > 15 ? '8px' : '9px';
  const bodyClass = comparativo ? 'comparativo' : '';

  return `
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
      background: #FFFFFF;
      color: #34353A;
    }
    
    /* HEADER */
    .main-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #5F8EAD;
    }
    .logo-container {
      margin-bottom: 8px;
    }
    .logo-container img {
      max-width: 180px;
      height: auto;
    }
    .main-header h1 {
      color: #34353A;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .main-header .periodo {
      color: #34353A;
      font-size: 10px;
      font-weight: 600;
      margin-top: 6px;
    }
    
    .content {
      padding: 0 10px 10px 10px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: ${fontSize}; 
      background: #FFFFFF;
      margin-bottom: 15px;
    }
    th, td { 
      border: 1px solid #5F8EAD; 
      padding: ${cellPadding}; 
      text-align: center; 
    }
    th { 
      background: #34353A; 
      color: #FFFFFF;
      font-weight: 600; 
      border-bottom: 1px solid #5F8EAD;
      font-size: ${headerFontSize};
    }
    th.cliente-cell {
      color: white;
    }
    .cliente-cell { 
      text-align: left; 
      font-weight: bold; 
      min-width: 100px; 
      max-width: 150px;
      font-size: 9px;
      background: #f9fafb;
      color: #111;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { 
      background: #5D9646; 
      color: #FFFFFF;
      font-weight: bold; 
    }
    .total-row .text-right {
      color: #FFFFFF;
    }
    .total-row .cliente-cell {
      background: #5D9646;
      color: white;
    }
    .periodo-header { font-size: ${headerFontSize}; }
    .total-cell { 
      font-weight: bold; 
      font-size: ${fontSize === '7px' ? '8px' : '10px'}; 
    }
    
    .footer {
      margin-top: 20px;
      padding: 10px;
      border-top: 2px solid #5D9646;
      text-align: center;
      font-size: 8px;
    }
    .footer p {
      color: #5F8EAD;
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
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
    </div>
    <h1>Consolidado de Viajes</h1>
    <div class="periodo">${titulo}</div>
  </div>

  <div class="content">
    <table>
      <thead>
        <tr>
          <th rowspan="2" class="cliente-cell">CLIENTE</th>
          ${columnas.map(col => `<th colspan="2" class="periodo-header">${col.label}</th>`).join('')}
          <th rowspan="2" class="total-cell">TOTAL VIAJES</th>
          <th rowspan="2" class="total-cell">TOTAL MONTO</th>
        </tr>
        <tr>
          ${columnas.map(col => `<th>VIAJES</th><th>MONTO</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${clientesData.map(cliente => `
          <tr>
            <td class="cliente-cell">${cliente.cliente}</td>
            ${cliente.columnas.map(col => `
              <td style="text-align:center">${col.viajes || 0}</td>
              <td class="text-right">${col.monto > 0 ? `$${col.monto.toFixed(2)}` : '$ 0.00'}</td>
            `).join('')}
            <td class="text-center total-cell">${cliente.totalViajes}</td>
            <td class="text-right total-cell">$${cliente.totalPeriodo.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td class="cliente-cell">TOTAL</td>
          ${columnas.map((_, colIndex) => {
    const totalViajesCol = clientesData.reduce((sum, c) => sum + (c.columnas[colIndex]?.viajes || 0), 0);
    const totalMontoCol = clientesData.reduce((sum, c) => sum + (c.columnas[colIndex]?.monto || 0), 0);
    return `<td style="text-align:center">${totalViajesCol}</td><td class="text-right">$${totalMontoCol > 0 ? totalMontoCol.toFixed(2) : '$ 0.00'}</td>`;
  }).join('')}
          <td class="text-center total-cell">${clientesData.reduce((sum, c) => sum + c.totalViajes, 0)}</td>
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
// =====================================================
// 📄 MÉTODO PRINCIPAL - REEMPLAZAR COMPLETO
// =====================================================

ReportesViajesDirecto.generarPDFConsolidadoPeriodo = async (req, res) => {
  let browser;
  try {
    const { periodo, ano, mes, trimestre, semana, semestre, fechaInicio, fechaFin } = req.query;

    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el parámetro: periodo",
      });
    }

    console.log(`📊 Generando PDF Consolidado: ${periodo.toUpperCase()}`);

    let datos, titulo, columnas, landscape = true;
    let usaRangoPersonalizado = false;

    switch (periodo.toLowerCase()) {
      case 'semanal':
        // ✅ NUEVO: Soporte para rango de fechas personalizado
        if (fechaInicio && fechaFin) {
          // Validar formato de fechas
          if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
            return res.status(400).json({
              success: false,
              message: "Las fechas deben tener formato YYYY-MM-DD",
            });
          }

          // Crear fechas en zona horaria local (NO UTC)
          const [yInicio, mInicio, dInicio] = fechaInicio.split('-');
          const [yFin, mFin, dFin] = fechaFin.split('-');

          const inicio = new Date(parseInt(yInicio), parseInt(mInicio) - 1, parseInt(dInicio), 0, 0, 0, 0);
          const fin = new Date(parseInt(yFin), parseInt(mFin) - 1, parseInt(dFin), 23, 59, 59, 999);

          console.log('🔍 DEBUG - Fechas de búsqueda:');
          console.log('   📅 Inicio:', inicio.toLocaleString('es-ES', { timeZone: 'America/El_Salvador' }));
          console.log('   📅 Fin:', fin.toLocaleString('es-ES', { timeZone: 'America/El_Salvador' }));

          // Validar que fechaFin >= fechaInicio
          if (fin < inicio) {
            return res.status(400).json({
              success: false,
              message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
            });
          }

          // Obtener datos por rango de fechas
          datos = await ViajesModel.obtenerConsolidadoPorRango(inicio, fin);
          
          console.log('📊 DEBUG - Datos obtenidos:');
          console.log('   Total clientes:', datos.length);
          if (datos.length > 0) {
            console.log('   Ejemplo primer cliente:', datos[0]._id);
            console.log('   Períodos del primer cliente:', datos[0].periodos?.length || 0);
            if (datos[0].periodos && datos[0].periodos.length > 0) {
              console.log('   Ejemplo período:', datos[0].periodos[0]);
            }
          }
          
          // Calcular días entre fechas
// Normalizar a medianoche para evitar errores por horas
const inicioDia = new Date(inicio);
inicioDia.setHours(0,0,0,0);

const finDia = new Date(fin);
finDia.setHours(0,0,0,0);

// Diferencia real de días inclusiva
const diasDiferencia =
  Math.round((finDia - inicioDia) / (1000 * 60 * 60 * 24)) + 1;
          
          const anoNum = parseInt(yInicio);
          
          // Formatear fechas para el título
          const formatoTitulo = (f) => {
            const [y, m, d] = f.split('-');
            return `${d}/${m}/${y}`;
          };
          
          titulo = `REPORTE SEMANAL PERSONALIZADO ${anoNum}<br><span style="font-size: 14px;">(${formatoTitulo(fechaInicio)} al ${formatoTitulo(fechaFin)})</span>`;
          columnas = generarColumnasDiasRango(diasDiferencia, inicio);
          
          console.log('📅 DEBUG - Columnas generadas:');
          console.log('   Total columnas:', columnas.length);
          if (columnas.length > 0) {
            console.log('   Primera columna:', columnas[0]);
            console.log('   Última columna:', columnas[columnas.length - 1]);
          }
          
          landscape = diasDiferencia > 7;
          usaRangoPersonalizado = true;
        } else {
          // Sistema original por número de semana
          if (!ano || !mes || !semana) {
            return res.status(400).json({
              success: false,
              message: "Para reporte semanal se requieren: ano, mes, semana O fechaInicio y fechaFin (formato YYYY-MM-DD)",
            });
          }
          
          const anoNum = parseInt(ano);
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
          const fechaInicioSemana = obtenerFechaInicioSemana(anoNum, mesNumSemanal, semanaNum);
          const fechaFinSemana = obtenerFechaFinSemana(anoNum, mesNumSemanal, semanaNum);
          titulo = `SEMANA ${semanaNum} - ${obtenerNombreMes(mesNumSemanal)} ${anoNum}<br><span style="font-size: 14px;">(${formatearFecha(fechaInicioSemana)} al ${formatearFecha(fechaFinSemana)})</span>`;
          columnas = generarColumnasDias(7, fechaInicioSemana);
          landscape = false;
        }
        break;

      case 'mensual':
        if (!ano || !mes) {
          return res.status(400).json({
            success: false,
            message: "Para reporte mensual se requieren: ano, mes",
          });
        }
        const anoNum = parseInt(ano);
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
        if (!ano || !trimestre) {
          return res.status(400).json({
            success: false,
            message: "Para reporte trimestral se requieren: ano, trimestre (1-4)",
          });
        }
        const anoTrim = parseInt(ano);
        const trimestreNum = parseInt(trimestre);

        if (trimestreNum < 1 || trimestreNum > 4) {
          return res.status(400).json({
            success: false,
            message: "El trimestre debe estar entre 1 y 4",
          });
        }

        datos = await ViajesModel.obtenerConsolidadoTrimestral(anoTrim, trimestreNum);
        const mesesTrimestre = obtenerMesesTrimestre(trimestreNum);
        titulo = `TRIMESTRE ${trimestreNum} (${mesesTrimestre.join('-')}) ${anoTrim}`;
        columnas = generarColumnasMeses(3, (trimestreNum - 1) * 3 + 1);
        landscape = false;
        break;

      case 'semestral':
        if (!ano) {
          return res.status(400).json({
            success: false,
            message: "Para reporte semestral se requiere: ano",
          });
        }
        const anoSem = parseInt(ano);
        const semestreNum = parseInt(semestre || 1);

        if (semestreNum < 1 || semestreNum > 2) {
          return res.status(400).json({
            success: false,
            message: "El semestre debe ser 1 o 2",
          });
        }

        datos = await ViajesModel.obtenerConsolidadoSemestral(anoSem, semestreNum);
        titulo = `${semestreNum === 1 ? 'PRIMER' : 'SEGUNDO'} SEMESTRE ${anoSem}`;
        columnas = generarColumnasMeses(6, semestreNum === 1 ? 1 : 7);
        landscape = true;
        break;

      case '9meses':
        if (!ano) {
          return res.status(400).json({
            success: false,
            message: "Para reporte de 9 meses se requiere: ano",
          });
        }
        const ano9m = parseInt(ano);
        datos = await ViajesModel.obtenerConsolidado9Meses(ano9m);
        titulo = `PRIMEROS 9 MESES - ${ano9m}`;
        columnas = generarColumnasMeses(9, 1);
        landscape = true;
        break;

      case 'anual':
        if (!ano) {
          return res.status(400).json({
            success: false,
            message: "Para reporte anual se requiere: ano",
          });
        }
        const anoAnual = parseInt(ano);
        datos = await ViajesModel.obtenerConsolidadoAnual(anoAnual);
        titulo = `AÑO ${anoAnual}`;
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

    console.log('🔄 DEBUG - Procesando datos de clientes...');
    
    // Procesar datos según el tipo de agrupación
    const clientesData = usaRangoPersonalizado 
      ? procesarDatosClientesRango(datos, columnas)
      : procesarDatosClientes(datos, columnas);
    
    console.log('✅ DEBUG - Datos procesados:');
    console.log('   Total clientes procesados:', clientesData.length);
    if (clientesData.length > 0) {
      console.log('   Ejemplo cliente:', {
        nombre: clientesData[0].cliente,
        columnas: clientesData[0].columnas?.length,
        totalViajes: clientesData[0].totalViajes,
        totalMonto: clientesData[0].totalPeriodo
      });
    }
    
    const comparativo = periodo.toLowerCase() === 'semanal';
    const htmlContent = generarHTMLConsolidado(titulo, columnas, clientesData, landscape, comparativo);

    browser = await puppeteer.launch(PUPPETEER_CONFIG());

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: landscape,
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await browser.close();

    let filename = `consolidado-${periodo}`;
    if (fechaInicio && fechaFin) {
      filename += `-${fechaInicio}_${fechaFin}`;
    } else {
      if (ano) filename += `-${ano}`;
      if (mes) filename += `-mes${mes}`;
      if (semana) filename += `-sem${semana}`;
      if (trimestre) filename += `-t${trimestre}`;
      if (semestre) filename += `-s${semestre}`;
    }
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
// 🆕 FUNCIONES AUXILIARES - AGREGAR AL FINAL DEL ARCHIVO
// (Antes de: export default ReportesViajesDirecto;)
// =====================================================

/**
 * Genera columnas para un rango de fechas personalizado
 * ✅ VERSIÓN CORREGIDA CON DEBUG
 */
function generarColumnasDiasRango(dias, fechaInicio) {
  console.log('📅 Generando columnas para rango personalizado...');
  console.log('   Días a generar:', dias);
  console.log('   Fecha inicio:', fechaInicio);
  
  const columnas = [];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + i);
    
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    const diaSemana = fecha.getDay();
    
    // ✅ Formato: "2026-1-12" (sin ceros, igual que MongoDB)
    const fechaKey = `${año}-${mes}-${dia}`;
    
    columnas.push({
      key: fechaKey,
      id: fechaKey,
      label: `${diasSemana[diaSemana]} ${dia}`,
      sublabel: `${dia}/${mes}`,
      tipo: 'dia',
      fecha: new Date(fecha)
    });
    
    if (i < 3 || i >= dias - 3) {
      console.log(`   Columna ${i + 1}: ${fechaKey} -> ${diasSemana[diaSemana]} ${dia}`);
    } else if (i === 3) {
      console.log('   ... (columnas intermedias) ...');
    }
  }
  
  return columnas;
}

/**
 * Procesa datos de clientes para rangos personalizados
 * ✅ VERSIÓN CORREGIDA CON DEBUG
 */
function procesarDatosClientesRango(datos, columnas) {
  console.log('🔄 Procesando datos de clientes para rango personalizado...');
  console.log('   Total clientes recibidos:', datos.length);
  console.log('   Total columnas:', columnas.length);
  
  const clientesMap = new Map();
  
  datos.forEach((item, index) => {
    const cliente = item._id;
    
    if (index === 0) {
      console.log(`\n   📋 Procesando cliente ejemplo: ${cliente}`);
    }
    
    if (!clientesMap.has(cliente)) {
      clientesMap.set(cliente, {
        nombre: cliente,
        periodos: new Map(),
        totales: { viajes: 0, monto: 0 }
      });
    }
    
    const clienteData = clientesMap.get(cliente);
    
    if (item.periodos && Array.isArray(item.periodos)) {
      item.periodos.forEach((p, idx) => {
        // ✅ p.fecha viene como "2026-1-12" directamente de MongoDB
        const fechaKey = p.fecha;
        
        if (index === 0 && idx < 3) {
          console.log(`      Período ${idx + 1}: ${fechaKey} -> ${p.viajes} viajes, $${p.monto}`);
        }
        
        clienteData.periodos.set(fechaKey, {
          viajes: p.viajes,
          monto: p.monto
        });
        
        clienteData.totales.viajes += p.viajes;
        clienteData.totales.monto += p.monto;
      });
    }
  });
  
  // Convertir a array y mapear con columnas
  const resultado = [];
  
  clientesMap.forEach((clienteData, nombreCliente) => {
    const columnasArray = [];
    let encontrados = 0;
    
    columnas.forEach((col, idx) => {
      const key = col.id;
      const datos = clienteData.periodos.get(key);
      
      if (datos && datos.viajes > 0) {
        encontrados++;
        if (encontrados <= 3) {
          console.log(`      ✓ Columna ${idx + 1} (${key}): ${datos.viajes} viajes`);
        }
      }
      
      columnasArray.push({
        periodo: col.key || col.id,
        viajes: datos?.viajes || 0,
        monto: datos?.monto || 0
      });
    });
    
    resultado.push({
      cliente: nombreCliente,
      columnas: columnasArray,
      totalPeriodo: clienteData.totales.monto,
      totalViajes: clienteData.totales.viajes
    });
    
    console.log(`   Cliente: ${nombreCliente} -> Total: ${clienteData.totales.viajes} viajes, $${clienteData.totales.monto.toFixed(2)}`);
  });
  
  console.log(`\n✅ Procesamiento completado: ${resultado.length} clientes`);
  
  return resultado.sort((a, b) => a.cliente.localeCompare(b.cliente));
}
// =====================================================
// 🆕 FUNCIONES AUXILIARES PARA RANGO PERSONALIZADO
// =====================================================

/**
 * Genera columnas para un rango de fechas personalizado
 
// =====================================================
// 🆕 FUNCIONES AUXILIARES PARA RANGO PERSONALIZADO
// =====================================================

/**
 * Genera columnas para un rango de fechas personalizado
 */


/**
 * Procesa datos de clientes para rangos personalizados
 * Convierte el formato de fecha "YYYY-M-D" a estructura procesable
 */


/**
 * Formatea una fecha desde string YYYY-MM-DD a DD/MM/YYYY
 */


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
    overallStart.setHours(0, 0, 0, 0);
    const overallEnd = new Date(weeks[weeks.length - 1].end);
    overallEnd.setHours(23, 59, 59, 999);

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
      return `DEL ${s.getDate()}/${s.getMonth() + 1} AL ${e.getDate()}/${e.getMonth() + 1}`;
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
    
    .main-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #5F8EAD;
    }
    
    .main-header .logo-container {
      margin-bottom: 8px;
    }
    
    .main-header .logo-container img {
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
    
    .main-header .periodo {
      font-size: 10px;
      color: #34353A;
      margin-top: 6px;
    }
    
    .content { 
      padding: 0 10px 10px 10px; 
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
    
    th.top { font-size: 9px; }
    th.sub { font-size: 8px; }
    
    .cell-cliente { text-align: left; padding-left: 10px; font-weight: 700; color: #111; }
    .cell-numero { text-align: center; font-weight: 700; }
    .cell-total { text-align: right; font-weight: 700; padding-right: 10px; color: #5D9646; }
    .total-row { background: #5D9646; color: white; font-weight: bold; }
    
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
  <div class="main-header">
    <div class="logo-container">
      ${logoBase64 ? `<img src=\"${logoBase64}\" alt=\"Rivera Logo\" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
    </div>
    <h1>CUADRO COMPARATIVO DE VIAJES DEL MES DE ${obtenerNombreMes(mesNum)} ${anoNum}</h1>
    <div class="periodo">Periodo: ${formatearFecha(weeks[0].start)} — ${formatearFecha(weeks[weeks.length - 1].end)}</div>
  </div>
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>CLIENTE</th>
          ${weekHeadersTop}
          <th>TOTAL</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          ${weekHeadersBottom}
          <th></th>
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
    <div class="footer">
      <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
      <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch(PUPPETEER_CONFIG());
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

    browser = await puppeteer.launch(PUPPETEER_CONFIG());

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

    browser = await puppeteer.launch(PUPPETEER_CONFIG());
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
// 📄 PDF X2: COMPARATIVO ANUAL POR CLIENTE — SOLO EFECTIVO
// =====================================================
ReportesViajesDirecto.generarPDFComparativoEfectivo = async (req, res) => {
  let browser;
  try {
    const { ano } = req.params;
    const anoNum = ano ? parseInt(ano) : new Date().getFullYear();
    if (isNaN(anoNum) || anoNum < 2000) {
      return res.status(400).json({ success: false, message: 'Año inválido' });
    }

    console.log(`📊 Generando PDF Comparativo Efectivo - Año: ${anoNum}`);

    // Rango de fechas: desde 1ero de enero hasta 31 de diciembre (o hasta hoy si el año es el actual)
    const start = new Date(anoNum, 0, 1, 0, 0, 0, 0);
    let end = new Date(anoNum, 11, 31, 23, 59, 59, 999);
    const now = new Date();
    if (anoNum === now.getFullYear()) {
      end = now;
    }

    // Buscar viajes completados del año (por departureTime o periodoContable)
    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      $or: [
        { departureTime: { $gte: start, $lte: end } },
        { 'periodoContable.año': anoNum }
      ]
    }).lean();

    if (!viajes || viajes.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron viajes para el año especificado' });
    }

    // Normalizador método de pago
    const normalizarMetodo = (m) => {
      if (!m) return 'efectivo';
      const mm = m.toString().toLowerCase();
      if (mm.includes('efect')) return 'efectivo';
      if (mm.includes('cheq')) return 'cheque';
      if (mm.includes('transf')) return 'transferencia';
      return 'otro';
    };

    // Preparar estructura por cliente y por mes
    const clientesMap = new Map();

    // Totales por mes (1..12)
    const totalesMes = Array.from({ length: 12 }, () => ({ viajes: 0, monto: 0 }));

    const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    viajes.forEach(v => {
      const metodo = normalizarMetodo(v.facturacion && v.facturacion.metodoPago);
      if (metodo !== 'efectivo') return; // solo efectivo

      // Determinar mes del viaje: prefer departureTime, si no, periodoContable.mes
      let mes = null;
      if (v.departureTime) {
        const d = new Date(v.departureTime);
        if (!isNaN(d)) mes = d.getMonth() + 1;
      }
      if (!mes && v.periodoContable && v.periodoContable.mes) mes = v.periodoContable.mes;
      if (!mes) return; // sin mes
      if (mes < 1 || mes > 12) return;

      const cliente = v.clienteNombre || (v.clienteOperativo && v.clienteOperativo.nombreComercial) || 'SIN CLIENTE';
      const monto = v.montoAcordado || v.facturacion?.montoTotal || 0;

      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          meses: Array.from({ length: 12 }, () => ({ viajes: 0, monto: 0 })),
          totalViajes: 0,
          totalMonto: 0
        });
      }

      const data = clientesMap.get(cliente);
      data.meses[mes - 1].viajes += 1;
      data.meses[mes - 1].monto += monto;
      data.totalViajes += 1;
      data.totalMonto += monto;

      totalesMes[mes - 1].viajes += 1;
      totalesMes[mes - 1].monto += monto;
    });

    // Si no hay clientes con efectivo
    if ([...clientesMap.values()].every(c => c.totalViajes === 0)) {
      return res.status(404).json({ success: false, message: 'No se encontraron viajes en efectivo para el año especificado' });
    }

    // Ordenar clientes por monto total descendente
    const clientes = [...clientesMap.entries()].sort((a, b) => b[1].totalMonto - a[1].totalMonto);

    // Mostrar solo meses que tengan registros (efectivo)
    const displayedMonthIndices = totalesMes
      .map((t, i) => (t.viajes > 0 ? i : -1))
      .filter(i => i >= 0);

    if (displayedMonthIndices.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay meses con registros de efectivo para el año especificado' });
    }

    // Generar filas HTML
    let filasHTML = '';
    let idx = 1;
    const formatoMonto = (m) => `$ ${m.toFixed(2)}`;

    clientes.forEach(([clienteNombre, data]) => {
      filasHTML += `<tr>`;
      filasHTML += `<td style="text-align:center">${idx}</td>`;
      filasHTML += `<td style="text-align:left; padding-left:12px; font-weight:600">${clienteNombre}</td>`;
      // Mostrar solo meses que tengan datos (displayedMonthIndices)
      for (const mi of displayedMonthIndices) {
        const v = data.meses[mi]?.viajes || 0;
        const mo = data.meses[mi]?.monto || 0;
        filasHTML += `<td style="text-align:center">${v}</td>`;
        filasHTML += `<td style="text-align:right">${mo > 0 ? formatoMonto(mo) : '$ 0.00'}</td>`;
      }
      filasHTML += `<td style="text-align:center; font-weight:700">${data.totalViajes}</td>`;
      filasHTML += `<td style="text-align:right; font-weight:700">${formatoMonto(data.totalMonto)}</td>`;
      filasHTML += `</tr>`;
      idx += 1;
    });

    // Construir header dinámico para meses (mostrar solo meses con datos)
    let headerMonthsTop = `<th rowspan="2">#</th><th rowspan="2">CLIENTE</th>`;
    for (const mi of displayedMonthIndices) {
      const monthName = mesesNombres[mi].toUpperCase();
      headerMonthsTop += `<th colspan="2">${monthName}</th>`;
    }
    headerMonthsTop += `<th rowspan="2">TOTAL VIAJES</th><th rowspan="2">TOTAL MONTO</th>`;

    let headerMonthsSub = '';
    for (const _ of displayedMonthIndices) {
      headerMonthsSub += `<th>VIAJES</th><th>MONTO</th>`;
    }

    // Totales generales (solo meses mostrados)
    let totalesRow = `<tr style="background:#e8f4e8; font-weight:700">`;
    totalesRow += `<td colspan="2" style="text-align:left; padding-left:12px">TOTAL</td>`;
    for (const mi of displayedMonthIndices) {
      totalesRow += `<td style="text-align:center">${totalesMes[mi].viajes}</td>`;
      totalesRow += `<td style="text-align:right">${totalesMes[mi].monto > 0 ? formatoMonto(totalesMes[mi].monto) : '$ 0.00'}</td>`;
    }
    const totalViajesGeneral = totalesMes.reduce((s, t) => s + t.viajes, 0);
    const totalMontoGeneral = totalesMes.reduce((s, t) => s + t.monto, 0);
    totalesRow += `<td style="text-align:center">${totalViajesGeneral}</td>`;
    totalesRow += `<td style="text-align:right">${formatoMonto(totalMontoGeneral)}</td>`;
    totalesRow += `</tr>`;

    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

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
      font-size: 10px;
      padding: 10px;
      color: #34353A;
    }
    
    .main-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #5F8EAD;
    }
    
    .main-header .logo-container {
      margin-bottom: 8px;
    }
    
    .main-header .logo-container img {
      max-width: 180px;
      height: auto;
    }
    
    h2 {
      text-align: center;
      font-size: 12px;
      margin-bottom: 5px;
      font-weight: bold;
      color: #34353A;
    }
    
    .main-header .periodo {
      font-size: 10px;
      color: #34353A;
      margin-top: 6px;
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
    
    tbody tr:nth-child(even) { background: #fafafa; }
    
    .total-row { background: #5D9646; color: white; font-weight: bold; }
    
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
  <div class="main-header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
    </div>
    <h2>CUADRO COMPARATIVO - VIAJES EN EFECTIVO (${anoNum})</h2>
    <div class="periodo">Periodo: ${formatearFecha(start)} — ${formatearFecha(end)}</div>
  </div>

  <table>
    <thead>
      <tr>${headerMonthsTop}</tr>
      <tr>${headerMonthsSub}</tr>
    </thead>
    <tbody>
      ${filasHTML}
      ${totalesRow}
    </tbody>
  </table>

  <div class="footer">
    <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
    <p><strong>Rivera Distribuidora y Transportes</strong> - Sistema de Gestión © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch(PUPPETEER_CONFIG());
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' } });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=comparativo-efectivo-${anoNum}.pdf`);
    res.send(pdfBuffer);

    console.log('✅ PDF Comparativo Efectivo generado exitosamente');

  } catch (error) {
    if (browser) await browser.close();
    console.error('❌ Error al generar PDF Comparativo Efectivo:', error);
    res.status(500).json({ success: false, message: 'Error al generar el PDF comparativo', error: error.message });
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
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
    }
    .header .logo-container img {
      max-width: 120px;
      height: auto;
      background: white;
      padding: 2px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .header h1 {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 3px;
      margin-bottom: 4px;
      color: #34353A;
    }
    .header .subtitle {
      font-size: 10px;
      font-weight: bold;
      margin-top: 4px;
      color: #5F8EAD;
    }
    .header .total-info {
      text-align: right;
      font-size: 12px;
      font-weight: bold;
      margin-top: 6px;
      color: #5F8EAD;
    }
    
    .stats-summary {
      margin-bottom: 10px;
      padding: 6px;
      background: #f5f9fc;
      border: 2px solid #5F8EAD;
    }
    .stats-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9px;
      color: #34353A;
    }
    .stats-row:last-child {
      border-bottom: none;
    }
    
    .section-title {
      background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
      color: #fff;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 20px 0 10px 0;
      text-transform: uppercase;
    }
    
    table.info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 3px solid #34353A;
    }
    table.info-table thead {
      background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
      color: #fff;
    }
    table.info-table th {
      padding: 6px 4px;
      text-align: center;
      font-size: 9px;
      font-weight: bold;
      border: 2px solid #34353A;
      text-transform: uppercase;
    }
    table.info-table td {
      padding: 6px 8px;
      border: 1px solid #34353A;
      font-size: 8px;
      background: #fff;
      color: #34353A;
    }
    table.info-table .col-label {
      width: 200px;
      font-weight: bold;
      text-align: left;
      padding-left: 15px;
      background: #f5f5f5;
    }
    table.info-table .col-value {
      text-align: left;
      padding-left: 15px;
    }
    
    table.details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 3px solid #34353A;
    }
    table.details-table thead {
      background: linear-gradient(135deg, #5F8EAD 0%, #34353A 100%);
      color: #fff;
    }
    table.details-table th {
      padding: 8px 6px;
      text-align: center;
      font-size: 9px;
      font-weight: bold;
      border: 2px solid #34353A;
      text-transform: uppercase;
    }
    table.details-table td {
      padding: 6px 8px;
      border: 1px solid #34353A;
      font-size: 8px;
      background: #fff;
      color: #34353A;
    }
    table.details-table .text-right {
      text-align: right;
    }
    table.details-table .text-center {
      text-align: center;
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
    .footer-section .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .footer-section .stat-item {
      font-size: 9px;
      padding: 5px;
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
      ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" style="max-width:100px;height:auto;"/>` : '<p style="color:#34353A">RIVERA</p>'}
    </div>
    <h1>REPORTE DE VIAJES</h1>
    <div class="subtitle">DETALLE INDIVIDUAL POR CLIENTE</div>
    <div class="total-info">$ ${montoTotalGeneral.toFixed(2)}</div>
  </div>

  <div class="stats-summary">
    <div class="stats-row">
      <span>CLIENTE:</span>
      <span>${decodeURIComponent(clienteNombre).toUpperCase()}</span>
    </div>
    <div class="stats-row">
      <span>PERÍODO:</span>
      <span>${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</span>
    </div>
    <div class="stats-row">
      <span>TOTAL VIAJES:</span>
      <span>${totalViajes}</span>
    </div>
    <div class="stats-row">
      <span>TOTAL RUTAS:</span>
      <span>${rutasArray.length}</span>
    </div>
    <div class="stats-row">
      <span>MONTO TOTAL:</span>
      <span><strong>$ ${montoTotalGeneral.toFixed(2)}</strong></span>
    </div>
  </div>

  <div class="section-title">Información del Cliente</div>

  <table class="info-table">
    <thead>
      <tr>
        <th class="col-label">DETALLE</th>
        <th class="col-value">INFORMACIÓN</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-label">CLIENTE:</td>
        <td class="col-value">${decodeURIComponent(clienteNombre).toUpperCase()}</td>
      </tr>
      <tr>
        <td class="col-label">PERÍODO:</td>
        <td class="col-value">${obtenerNombreMes(mesNum).toUpperCase()} ${anoNum}</td>
      </tr>
      <tr>
        <td class="col-label">TOTAL DE VIAJES:</td>
        <td class="col-value">${totalViajes} VIAJES</td>
      </tr>
      <tr>
        <td class="col-label">RUTAS DIFERENTES:</td>
        <td class="col-value">${rutasArray.length} RUTAS</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Desglose de Rutas y Viajes</div>

  <table class="details-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 25%;">RUTA</th>
        <th style="width: 20%;">ORIGEN</th>
        <th style="width: 20%;">DESTINO</th>
        <th style="width: 10%;">VIAJES</th>
        <th style="width: 10%;">$/VIAJE</th>
        <th style="width: 10%;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${rutasArray.map((ruta, index) => `
        <tr>
          <td class="text-center"><strong>${index + 1}</strong></td>
          <td><strong>${ruta.rutaCompleta.toUpperCase()}</strong></td>
          <td>${ruta.origen.toUpperCase()}</td>
          <td>${ruta.destino.toUpperCase()}</td>
          <td class="text-center">${ruta.cantidadViajes}</td>
          <td class="text-right">$${ruta.montoPorViaje.toFixed(2)}</td>
          <td class="text-right"><strong>$${ruta.montoTotal.toFixed(2)}</strong></td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="footer-section">
    <div>MONTO TOTAL FACTURADO</div>
    <div class="balance-final">$ ${montoTotalGeneral.toFixed(2)}</div>
    <div class="stats-grid">
      <div class="stat-item">
        <strong>Total Viajes:</strong> ${totalViajes}
      </div>
      <div class="stat-item">
        <strong>Promedio por Viaje:</strong> $${(montoTotalGeneral / totalViajes).toFixed(2)}
      </div>
    </div>
  </div>

  <div class="footer-info">
    <p>Documento generado el ${formatearFecha(new Date())} a las ${formatearHora(new Date())}</p>
    <p>Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch(PUPPETEER_CONFIG());

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
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
      font-family: Arial, sans-serif;
      padding: 0; 
      background: #FFFFFF; 
      color: #34353A;
    }
    
    .header {
      padding: 35px;
      text-align: center;
      border-bottom: 3px solid #5F8EAD;
      margin-bottom: 30px;
    }
    .header .logo-container {
      margin-bottom: 20px;
    }
    .header .logo-container img {
      max-width: 180px;
      height: auto;
      background: white;
      padding: 10px;
      border-radius: 8px;
    }
    .header h1 { 
      color: #34353A;
      font-size: 24px; 
      font-weight: bold; 
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px; 
    }
    .header .period { 
      color: #34353A; 
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
      border: 1px solid #5F8EAD; 
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
      background: #5D9646; 
      color: #FFFFFF;
      font-weight: bold; 
    }
    .total-row .text-right {
      color: white;
    }
    .grand-total { 
      background: #5D9646; 
      color: white; 
      font-size: 15px; 
      font-weight: bold; 
      border-top: 2px solid #5D9646;
    }
    .grand-total td {
      padding: 18px;
      border: 1px solid #5F8EAD;
    }
    .grand-total .text-right {
      color: white;
    }
    .footer { 
      margin-top: 25px; 
      font-size: 11px; 
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #5D9646;
      color: #5F8EAD;
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

    browser = await puppeteer.launch(PUPPETEER_CONFIG());

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
    
    .header .year {
      font-size: 10px;
      color: #34353A;
      margin-top: 6px;
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
    
    .cliente-cell {
      text-align: left;
      padding-left: 10px;
      font-weight: 700;
      color: #111;
    }
    
    th.cliente-cell {
      color: white;
    }
    
    .mes-header {
      writing-mode: horizontal-tb;
      font-size: 9px;
    }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    
    .total-row {
      background: #5D9646;
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
    <h1>CONSOLIDADO ANUAL DE VIAJES</h1>
    <div class="year">AÑO ${anoNum}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2" class="cliente-cell">CLIENTE</th>
        ${Array(12).fill(0).map((_, i) => `<th colspan="2" class="mes-header">${obtenerNombreMes(i + 1).substring(0, 3)}</th>`).join('')}
        <th rowspan="2">TOTAL VIAJES</th>
        <th rowspan="2">TOTAL MONTO</th>
      </tr>
      <tr>
        ${Array(12).fill(0).map(() => `<th>VIAJES</th><th>MONTO</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${clientesData.map(cliente => `
        <tr>
          <td class="cliente-cell">${cliente.cliente}</td>
          ${cliente.meses.map(mes => `
            <td style="text-align:center">${mes.viajes}</td>
            <td class="text-right">${mes.monto > 0 ? `$${mes.monto.toFixed(2)}` : '$ 0.00'}</td>
          `).join('')}
          <td class="text-center">${cliente.totalViajes}</td>
          <td class="text-right"><strong>$${cliente.totalAnual.toFixed(2)}</strong></td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td>TOTAL</td>
        ${Array(12).fill(0).map((_, mesIndex) => {
      const totalViajesMes = clientesData.reduce((sum, c) => sum + (c.meses[mesIndex].viajes || 0), 0);
      const totalMontoMes = clientesData.reduce((sum, c) => sum + (c.meses[mesIndex].monto || 0), 0);
      return `<td style="text-align:center">${totalViajesMes}</td><td class="text-right">$${totalMontoMes.toFixed(2)}</td>`;
    }).join('')}
        <td class="text-center">${clientesData.reduce((sum, c) => sum + c.totalViajes, 0)}</td>
        <td class="text-right">$${clientesData.reduce((sum, c) => sum + c.totalAnual, 0).toFixed(2)}</td>
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

    browser = await puppeteer.launch(PUPPETEER_CONFIG());

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

ReportesViajesDirecto.generarPDFDiario = async (req, res) => {
  let browser;
  try {
    const { fecha } = req.params;

    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({ success: false, message: 'Formato de fecha inválido. Usa YYYY-MM-DD (ej: 2025-01-25)' });
    }

    const fechaDate = new Date(fecha + 'T00:00:00.000Z');
    const fechaFin = new Date(fecha + 'T23:59:59.999Z');

    console.log(`📊 Generando PDF Diario de Viajes: ${formatearFechaString(fecha)}`);

    // Obtener viajes del día
    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': 'completado',
      departureTime: { $gte: fechaDate, $lte: fechaFin }
    })
      .populate('clienteOperativo', 'nombreComercial nombreEmpresa')
      .populate('truckId', 'licensePlate placa')
      .sort({ clienteNombre: 1, departureTime: 1 })
      .lean();

    if (!viajes || viajes.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay viajes completados en la fecha indicada' });
    }

    // Agrupar por cliente
    const clientesMap = new Map();
    let totalViajesGeneral = 0;
    let totalMontoGeneral = 0;

    viajes.forEach(v => {
      const cliente = v.clienteNombre || v.clienteOperativo?.nombreComercial || 'SIN CLIENTE';
      const monto = v.montoAcordado || v.facturacion?.montoTotal || 0;

      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, { viajes: [], totalViajes: 0, totalMonto: 0 });
      }

      const data = clientesMap.get(cliente);
      data.viajes.push({
        hora: formatearHora(v.departureTime),
        placa: v.truckId?.licensePlate || v.truckId?.placa || 'SIN PLACA',
        monto: monto
      });
      data.totalViajes += 1;
      data.totalMonto += monto;
      totalViajesGeneral += 1;
      totalMontoGeneral += monto;
    });

    // Generar filas HTML
    let filasHTML = '';
    let idx = 1;
    clientesMap.forEach((data, cliente) => {
      let viajesCliente = data.viajes.map(v => 
        `<tr>
          <td style="text-align:center">${v.hora}</td>
          <td style="text-align:center">${v.placa}</td>
          <td style="text-align:right">$${v.monto.toFixed(2)}</td>
        </tr>`
      ).join('');

      filasHTML += `
        <tr>
          <td class="cell-numero" rowspan="${data.viajes.length + 1}">${idx}</td>
          <td class="cell-cliente" rowspan="${data.viajes.length + 1}">${cliente}</td>
          <td colspan="3" style="font-weight:bold; text-align:center; background-color:#f0f0f0;">Viajes del Día</td>
        </tr>
        ${viajesCliente}
        <tr style="background-color:#e0e0e0;">
          <td colspan="2" style="text-align:right; font-weight:bold;">Total Cliente:</td>
          <td style="text-align:right; font-weight:bold;">$${data.totalMonto.toFixed(2)}</td>
        </tr>
      `;
      idx++;
    });

    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

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
      font-size: 10px;
      padding: 10px;
      color: #34353A;
    }
    
    .main-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #5F8EAD;
    }
    
    .main-header .logo-container {
      margin-bottom: 8px;
    }
    
    .main-header .logo-container img {
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
    
    .main-header .periodo {
      font-size: 10px;
      color: #34353A;
      margin-top: 6px;
    }
    
    .content { 
      padding: 0 10px 10px 10px; 
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 6px;
      text-align: left;
    }
    
    th {
      background-color: #5F8EAD;
      color: white;
      font-weight: bold;
      text-align: center;
    }
    
    .cell-numero {
      width: 5%;
      text-align: center;
      font-weight: bold;
    }
    
    .cell-cliente {
      width: 25%;
      font-weight: bold;
    }
    
    .total-row {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    .total-row td {
      text-align: right;
    }
    
    .footer {
      text-align: center;
      font-size: 8px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="main-header">
    ${logoBase64 ? `<div class="logo-container"><img src="${logoBase64}" alt="Logo"></div>` : ''}
    <h1>REPORTE DIARIO DE VIAJES</h1>
    <div class="periodo">Fecha: ${formatearFechaString(fecha)}</div>
  </div>
  
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>N°</th>
          <th>CLIENTE</th>
          <th>HORA</th>
          <th>PLACA</th>
          <th>MONTO</th>
        </tr>
      </thead>
      <tbody>
        ${filasHTML}
        <tr class="total-row">
          <td colspan="4" style="text-align:right; font-weight:bold;">TOTAL GENERAL:</td>
          <td style="text-align:right; font-weight:bold;">$${totalMontoGeneral.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      Total de Viajes: ${totalViajesGeneral} | Generado el ${new Date().toLocaleString('es-ES')}
    </div>
  </div>
</body>
</html>`;

    browser = await puppeteer.launch(PUPPETEER_CONFIG());
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-diario-viajes-${fecha}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error al generar PDF Diario:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF diario",
      error: error.message,
    });
  }
};

export default ReportesViajesDirecto;