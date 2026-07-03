#!/usr/bin/env node
/*
  diagnose_viaticos.js
  Uso: desde la raíz del proyecto (Rivera), ejecutar:
    node Backend/scripts/diagnose_viaticos.js --mes 6 --ano 2026 --tipo semanal
  Parámetros:
    --mes N      (1-12) requerido
    --ano YYYY   requerido
    --tipo       'semanal' | 'quincenal' | 'all' (default 'all')
    --uri        MongoDB connection string (opcional, usa MONGODB_URI o mongodb://localhost:27017/Rivera)

  Salida: JSON con diagnóstico por planilla y empleado impreso en consola.
*/

import { MongoClient, ObjectId } from 'mongodb';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--mes') out.mes = Number(args[++i]);
    else if (a === '--ano') out.ano = Number(args[++i]);
    else if (a === '--tipo') out.tipo = args[++i];
    else if (a === '--uri') out.uri = args[++i];
  }
  out.tipo = out.tipo || 'all';
  return out;
}

const normalizarTexto = (texto) => String(texto || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Za-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

const parseCurrency = (val) => {
  if (val === null || typeof val === 'undefined') return 0;
  if (typeof val === 'number' && !isNaN(val)) return val;
  try {
    let s = String(val).trim();
    s = s.replace(/[^0-9,.-]+/g, '');
    const commaCount = (s.match(/,/g) || []).length;
    const dotCount = (s.match(/\./g) || []).length;
    if (commaCount > 0 && dotCount === 0) s = s.replace(/,/g, '.');
    else if (commaCount > 0 && dotCount > 0 && s.indexOf(',') > s.indexOf('.')) s = s.replace(/\./g, '').replace(/,/g, '.');
    else s = s.replace(/,/g, '');
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  } catch (e) {
    return 0;
  }
};

async function run() {
  const { mes, ano, tipo, uri } = parseArgs();
  if (!mes || !ano) {
    console.error('Faltan parámetros. Ej: --mes 6 --ano 2026');
    process.exit(1);
  }

  const MONGO_URI = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/Rivera';
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db();

    const results = [];

    if (tipo === 'all' || tipo === 'semanal') {
      // Planillas semanales por rango fechas
      const start = new Date(ano, mes - 1, 1);
      const end = new Date(ano, mes, 1);
      const planillas = await db.collection('PlanillaSemanal').find({ fechaInicio: { $gte: start, $lt: end } }).sort({ fechaInicio: 1 }).toArray();

      for (const p of planillas) {
        const rangoLabel = (p.fechaInicio && p.fechaFin) ? `DEL ${new Date(p.fechaInicio).getDate()} AL ${new Date(p.fechaFin).getDate()} DE ${new Date(p.fechaInicio).toLocaleString('es-ES', { month: 'long' }).toUpperCase()} ${new Date(p.fechaInicio).getFullYear()}` : 'RANGO';
        const planillaReport = { tipo: 'semanal', id: String(p._id), rango: rangoLabel, empleados: [] };

        for (const emp of (p.empleados || [])) {
          const empleadoId = emp.empleadoId ? String(emp.empleadoId) : 'sin-id';
          const nombre = emp.nombreCompleto || '';
          const parsedTotalViaticos = parseCurrency(emp.totalViaticos);
          const parsedViaticosField = parseCurrency(emp.viaticos);
          const diasSum = Array.isArray(emp.dias) ? emp.dias.reduce((s, d) => s + parseCurrency(d.viaticos ?? d.viatico ?? d.viaticoDiario ?? 0), 0) : 0;

          // buscar otros campos que contengan viatic
          const otherFields = {};
          Object.keys(emp || {}).forEach(k => {
            if (/viatic/i.test(k) && !['totalViaticos','viaticos','viatico'].includes(k)) {
              otherFields[k] = parseCurrency(emp[k]);
            }
          });

          let reason = 'no_viaticos';
          let source = 'ninguna';
          if (parsedTotalViaticos && parsedTotalViaticos !== 0) { reason = 'totalViaticos'; source = 'totalViaticos'; }
          else if (parsedViaticosField && parsedViaticosField !== 0) { reason = 'viaticos_field'; source = 'viaticos'; }
          else if (diasSum && diasSum !== 0) { reason = 'viaticos_en_dias'; source = 'dias'; }
          else {
            for (const k of Object.keys(otherFields)) {
              if (otherFields[k] && otherFields[k] !== 0) { reason = `campo:${k}`; source = `campo:${k}`; break; }
            }
          }

          planillaReport.empleados.push({ empleadoId, nombre, raw: { totalViaticos: emp.totalViaticos, viaticos: emp.viaticos }, parsed: { totalViaticos: parsedTotalViaticos, viaticos: parsedViaticosField, diasSum }, otherFields, reason, source });
        }

        results.push(planillaReport);
      }
    }

    if (tipo === 'all' || tipo === 'quincenal') {
      // Planillas quincenales por mes/año
      const planillas = await db.collection('PlanillaQuincenal').find({ mes: mes, año: ano }).sort({ quincena: 1 }).toArray();
      for (const p of planillas) {
        const rangoLabel = p.descripcion || (`Quincena ${p.quincena} ${p.mes}/${p.año}`);
        const planillaReport = { tipo: 'quincenal', id: String(p._id), rango: rangoLabel, empleados: [] };

        for (const emp of (p.empleados || [])) {
          const empleadoId = emp.empleadoId ? String(emp.empleadoId) : 'sin-id';
          const nombre = emp.nombreCompleto || '';
          const parsedTotalViaticos = parseCurrency(emp.totalViaticos);
          const parsedViaticosField = parseCurrency(emp.viaticos);
          const diasSum = Array.isArray(emp.dias) ? emp.dias.reduce((s, d) => s + parseCurrency(d.viaticos ?? d.viatico ?? d.viaticoDiario ?? 0), 0) : 0;

          const otherFields = {};
          Object.keys(emp || {}).forEach(k => {
            if (/viatic/i.test(k) && !['totalViaticos','viaticos','viatico'].includes(k)) {
              otherFields[k] = parseCurrency(emp[k]);
            }
          });

          let reason = 'no_viaticos';
          let source = 'ninguna';
          if (parsedTotalViaticos && parsedTotalViaticos !== 0) { reason = 'totalViaticos'; source = 'totalViaticos'; }
          else if (parsedViaticosField && parsedViaticosField !== 0) { reason = 'viaticos_field'; source = 'viaticos'; }
          else if (diasSum && diasSum !== 0) { reason = 'viaticos_en_dias'; source = 'dias'; }
          else {
            for (const k of Object.keys(otherFields)) {
              if (otherFields[k] && otherFields[k] !== 0) { reason = `campo:${k}`; source = `campo:${k}`; break; }
            }
          }

          planillaReport.empleados.push({ empleadoId, nombre, raw: { totalViaticos: emp.totalViaticos, viaticos: emp.viaticos }, parsed: { totalViaticos: parsedTotalViaticos, viaticos: parsedViaticosField, diasSum }, otherFields, reason, source });
        }

        results.push(planillaReport);
      }
    }

    // Detección de nombres duplicados global
    const nameMap = new Map();
    results.forEach(p => {
      p.empleados.forEach(e => {
        const nameNorm = normalizarTexto(e.nombre || '');
        if (!nameMap.has(nameNorm)) nameMap.set(nameNorm, new Set());
        if (e.empleadoId) nameMap.get(nameNorm).add(e.empleadoId);
      });
    });
    const duplicates = [];
    nameMap.forEach((ids, name) => {
      if (ids.size > 1) duplicates.push({ name, ids: Array.from(ids) });
    });

    const report = { mes, ano, tipo, generatedAt: new Date().toISOString(), planillas: results, duplicates };
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
