import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import MantenimientoCamiones from '../Models/MantenimientoCamiones.js';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import PlanillaQuincenal from '../Models/PlanillaQuincenal.js';
import ResumenDiesel from '../Models/ResumenDiesel.js';
import { launchUniversalBrowser } from '../Utils/puppeteerLauncher.js';
import { generatePdfFromHtml } from '../Utils/pdfGenerator.js';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertirImagenABase64 = (rutaImagen) => {
  try {
    if (!fs.existsSync(rutaImagen)) return null;
    const imagen = fs.readFileSync(rutaImagen);
    const base64 = imagen.toString('base64');
    const ext = path.extname(rutaImagen).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error al convertir imagen:', error);
    return null;
  }
};
// Detectar entorno de ejecución
const IS_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const RUTA_LOGO = path.join(process.cwd(), 'src', 'imagenes', 'imagen_15.png');
// Puppeteer config para Cloud Run
const PUPPETEER_CONFIG= () => {
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
    serviceName: 'reportes-gastos-mes',
    primaryConfig: PUPPETEER_CONFIG()
  });
};

const formatMoney = (n) => {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
};

// Parsear valores monetarios tolerantes a formatos: numbers, strings con '$', comas, espacios
const parseCurrency = (val) => {
  if (val === null || typeof val === 'undefined') return 0;
  if (typeof val === 'number' && !isNaN(val)) return val;
  try {
    let s = String(val).trim();
    s = s.replace(/[^0-9,.-]+/g, '');
    const commaCount = (s.match(/,/g) || []).length;
    const dotCount = (s.match(/\./g) || []).length;
    if (commaCount > 0 && dotCount === 0) {
      s = s.replace(/,/g, '.');
    } else if (commaCount > 0 && dotCount > 0 && s.indexOf(',') > s.indexOf('.')) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      s = s.replace(/,/g, '');
    }
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  } catch (e) {
    return 0;
  }
};

const getMonthRange = (mes, ano) => {
  const firstDay = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
  const lastDay = new Date(ano, mes, 0, 23, 59, 59, 999);
  return { firstDay, lastDay };
};

const getMondaysInMonth = (mes, ano) => {
  const { firstDay, lastDay } = getMonthRange(mes, ano);
  const mondays = [];
  // Start from the Monday that begins the week containing firstDay (may be in previous month)
  let d = new Date(firstDay);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() - 1);
  }
  while (d <= lastDay) {
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 5); // Saturday
    const visibleStart = start < firstDay ? new Date(firstDay) : start;
    const visibleEnd = end > lastDay ? new Date(lastDay) : end;
    if (visibleStart <= visibleEnd) {
      mondays.push({ start: new Date(visibleStart), end: new Date(visibleEnd) });
    }
    d.setDate(d.getDate() + 7);
  }
  return mondays;
};

const ReportesGastosMesController = {};

ReportesGastosMesController.generarPDFMensualConsolidado = async (req, res) => {
  try {
    const { mes, ano, cena = [], incaf = 0, renovacion = 0 } = req.body || {};
    if (!mes || !ano || mes < 1 || mes > 12) {
      return res.status(400).json({ message: 'Parámetros inválidos: mes y ano son requeridos' });
    }

    const { firstDay, lastDay } = getMonthRange(mes, ano);

    // 1) MANTENIMIENTO - suma de subTotales en el mes
    const mantos = await MantenimientoCamiones.find({ mes: mes, ano: ano }).lean();
    const mantenimientoTotal = mantos.reduce((sum, m) => {
      const detallesTotal = (m.detalles || []).reduce((s, it) => s + Number(it.subTotal || 0), 0);
      return sum + detallesTotal;
    }, 0);

    // 2) PLANILLAS SEMANALES - sumar solo días que caen dentro del mes
    const planillasSemanales = await PlanillaSemanal.find({
      fechaInicio: { $lte: lastDay },
      fechaFin: { $gte: firstDay }
    }).sort({ fechaInicio: 1 }).lean();

    const planillasSemanalesAgg = planillasSemanales.map(p => {
      const start = p.fechaInicio instanceof Date ? p.fechaInicio : new Date(p.fechaInicio);
      const end = p.fechaFin instanceof Date ? p.fechaFin : new Date(p.fechaFin);
      const visibleStart = start < firstDay ? firstDay : start;
      const visibleEnd = end > lastDay ? lastDay : end;

      // If the planilla covers the full week AND that full week is inside the requested month,
      // use the planilla's totalAPagar directly. Otherwise, sum only the días that fall inside the visible range.
      let totalSemana = 0;
      const fullyInside = (start.getTime() >= firstDay.getTime()) && (end.getTime() <= lastDay.getTime());

      if (fullyInside && p.totales && typeof p.totales.totalAPagar !== 'undefined') {
        totalSemana = parseCurrency(p.totales.totalAPagar || 0);
      } else {
        // compute total for days inside [visibleStart, visibleEnd]
        (p.empleados || []).forEach(emp => {
          // Sum days for this employee within visible range
          let empTotal = 0;
          (emp.dias || []).forEach(dia => {
            const fechaDia = new Date(dia.fecha);
            if (fechaDia >= visibleStart && fechaDia <= visibleEnd) {
              const base = parseCurrency(dia.base || 0);
              const viaticos = parseCurrency(dia.viaticos || 0);
              const descuento = parseCurrency(dia.descuentoFalta || 0) || 0;
              const falta = dia.faltaInjustificada ? descuento : 0;
              empTotal += (base + viaticos - falta);
            }
          });

          // Apply anticipos rule:
          // - If employee has weekly pay (has any base amounts OR planillaTipo === 'Semanal') and emp.anticipos > 0 => subtract anticipos
          // - Else (e.g., quincenal, no base) => add anticipos
          const anticipos = Number(emp.anticipos || 0);
          const hasBase = (emp.totalBase && Number(emp.totalBase) > 0) || ((emp.dias || []).some(d => Number(d.base || 0) > 0));
          const isSemanal = emp.planillaTipo === 'Semanal' || hasBase;

          if (anticipos !== 0) {
            if (isSemanal) {
              empTotal -= anticipos;
            } else {
              empTotal += anticipos;
            }
          }

          totalSemana += empTotal;
        });
      }

      const label = `DEL ${String(visibleStart.getDate()).padStart(2,'0')} AL ${String(visibleEnd.getDate()).padStart(2,'0')}`;
      return { id: p._id, label, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, total: totalSemana };
    });

    // 3) PLANILLAS QUINCENALES - incluir quincenas registradas para el mes
    const planillasQuincenales = await PlanillaQuincenal.find({ mes: mes, año: ano }).sort({ quincena: 1 }).lean();

    // 4) PRESTACIONES - ISSS, AFP desde quincenas (sumar totales de quincenas del mes)
    const totalISSS = planillasQuincenales.reduce((s, q) => s + parseCurrency(q.totales?.totalISSS || 0), 0);
    const totalAFP = planillasQuincenales.reduce((s, q) => s + parseCurrency(q.totales?.totalAFP || 0), 0);

    // 5) DIÉSEL - sumar ResumenDiesel.Total por mes/ano
    const resumenDiesel = await ResumenDiesel.find({ mes: mes, ano: ano }).lean();
    const dieselTotal = resumenDiesel.reduce((s, r) => s + Number(r.Total || 0), 0);

    // 6) OTROS GASTOS (CENA) - weeks (frontend may send amounts; if not, default weeks with zero)
    const semanasMes = getMondaysInMonth(mes, ano);
    const cenaMap = (cena || []).reduce((acc, it) => {
      // it: { weekStart: 'YYYY-MM-DD', amount }
      if (!it || !it.weekStart) return acc;
      acc[new Date(it.weekStart).toISOString().slice(0,10)] = Number(it.amount || 0);
      return acc;
    }, {});
    const cenaRows = semanasMes.map(w => {
      const key = w.start.toISOString().slice(0,10);
      return {
        start: w.start,
        end: w.end,
        amount: Number(cenaMap[key] || 0)
      };
    });

    const totalCena = cenaRows.reduce((s, r) => s + Number(r.amount || 0), 0);

    // 7) Renovacion y esquelas (manual)
    const renovacionAmount = Number(renovacion || 0);

    // 8) Construir HTML simple (tablas) con estilo similar a otros reportes
    const logoBase64 = convertirImagenABase64(RUTA_LOGO);

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #222; }
          .header { display:flex; align-items:center; justify-content:space-between; }
          /* Green palette to match VIAJES report */
          .title { color:#1e3a8a; font-size:18px; font-weight:700; }
          table { width:100%; border-collapse:collapse; margin-top:10px; }
          th, td { border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; }
          th { background:#5f7c8a; color:white; font-weight:700; }
          .right { text-align:right; }
          .section-title { margin-top:16px; color:#1e3a8a; font-weight:700; }
          .totals-row { background:#6b8e23; color:white; font-weight:700; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">GASTOS MES DE ${String(new Date(ano, mes-1, 1).toLocaleString('es-ES',{ month: 'long', year: 'numeric' })).toUpperCase()}</div>
            <div style="font-size:12px;color:#666;">Reporte consolidado mensual</div>
          </div>
          <div>${logoBase64 ? `<img src="${logoBase64}" width="140"/>` : ''}</div>
        </div>

        <div class="section-title">MANTENIMIENTO Y REPARACIONES</div>
        <table>
          <thead>
            <tr><th>MANTENIMIENTO CAMIONES</th><th class="right">MONTO</th></tr>
          </thead>
          <tbody>
            <tr><td>MANTENIMIENTO Y REPARACIONES</td><td class="right">$ ${formatMoney(mantenimientoTotal)}</td></tr>
            <tr><td><strong>TOTAL</strong></td><td class="right"><strong>$ ${formatMoney(mantenimientoTotal)}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">PLANILLAS (SEMANAL)</div>
        <table>
          <thead>
            <tr><th>PLANILLA SEMANAL</th><th class="right">MONTO</th></tr>
          </thead>
          <tbody>
            ${planillasSemanalesAgg.map((p, idx) => `<tr><td>${p.label}</td><td class="right">$ ${formatMoney(p.total)}</td></tr>`).join('')}
            <tr><td><strong>TOTAL</strong></td><td class="right"><strong>$ ${formatMoney(planillasSemanalesAgg.reduce((s,p)=>s+p.total,0))}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">PLANILLA QUINCENAL</div>
        <table>
          <thead>
            <tr><th>QUINCENA</th><th class="right">MONTO</th></tr>
          </thead>
          <tbody>
            ${planillasQuincenales.map(q => `<tr><td>${q.quincena === 1 ? 'PRIMERA QUINCENA' : 'SEGUNDA QUINCENA'}</td><td class="right">$ ${formatMoney(q.totales?.totalAPagar || 0)}</td></tr>`).join('')}
            <tr><td><strong>TOTAL</strong></td><td class="right"><strong>$ ${formatMoney(planillasQuincenales.reduce((s,q)=>s + Number(q.totales?.totalAPagar || 0), 0))}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">OTROS GASTOS ADMINISTRATIVOS (CENA)</div>
        <table>
          <thead>
            <tr><th>PERIODO</th><th class="right">MONTO</th></tr>
          </thead>
          <tbody>
            ${cenaRows.map((r, i) => `<tr><td>DEL ${String(r.start.getDate()).padStart(2,'0')} AL ${String(r.end.getDate()).padStart(2,'0')}</td><td class="right">$ ${formatMoney(r.amount)}</td></tr>`).join('')}
            <tr><td><strong>TOTAL</strong></td><td class="right"><strong>$ ${formatMoney(totalCena)}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">PRESTACIONES AL PERSONAL</div>
        <table>
          <thead>
            <tr><th>CONCEPTO</th><th class="right">MONTO</th></tr>
          </thead>
          <tbody>
                <tr><td>ISSS</td><td class="right">$ ${formatMoney(totalISSS)}</td></tr>
            <tr><td>INCAF</td><td class="right">$ ${formatMoney(Number(incaf || 0))}</td></tr>
            <tr><td>AFP</td><td class="right">$ ${formatMoney(totalAFP)}</td></tr>
            <tr><td><strong>TOTAL</strong></td><td class="right"><strong>$ ${formatMoney(totalISSS + Number(incaf || 0) + totalAFP)}</strong></td></tr>
          </tbody>
        </table>

        <div class="section-title">DIÉSEL</div>
        <table>
          <thead><tr><th>CONCEPTO</th><th class="right">MONTO</th></tr></thead>
          <tbody>
            <tr><td>TOTAL DIÉSEL MES</td><td class="right">$ ${formatMoney(dieselTotal)}</td></tr>
          </tbody>
        </table>

        <div class="section-title">RENOVACIÓN DE TARJETA DE CIRCULACIÓN Y PAGO DE ESQUELAS</div>
        <table>
          <thead><tr><th>CONCEPTO</th><th class="right">MONTO</th></tr></thead>
          <tbody>
            <tr><td>RENOVACIÓN / ESQUELAS</td><td class="right">$ ${formatMoney(renovacionAmount)}</td></tr>
          </tbody>
        </table>

        <h3 style="text-align:right;margin-top:14px;color:#1e3a8a;">TOTAL GASTOS DE ${String(new Date(ano, mes-1, 1).toLocaleString('es-ES',{ month: 'long', year: 'numeric' })).toUpperCase()} : $ ${formatMoney(
          mantenimientoTotal + planillasSemanalesAgg.reduce((s,p)=>s+p.total,0) + planillasQuincenales.reduce((s,q)=>s + Number(q.totales?.totalAPagar || 0), 0) + totalCena + totalISSS + Number(incaf || 0) + totalAFP + dieselTotal + renovacionAmount
        )}</h3>

      </body>
      </html>
    `;

    // Generar PDF con Puppeteer usando lanzador seguro
    const pdfBuffer = await generatePdfFromHtml(html, {
      serviceName: 'reportes-gastos-mes',
      pdfOptions: { format: 'A4', printBackground: true },
      timeoutMs: 45000,
      retries: 2,
      waitUntil: 'networkidle2'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Consolidado-Gastos-${mes}-${ano}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generar PDF mensual consolidado:', error);
    res.status(500).json({ message: 'Error generando el PDF', error: error.message });
  }
};

export default ReportesGastosMesController;