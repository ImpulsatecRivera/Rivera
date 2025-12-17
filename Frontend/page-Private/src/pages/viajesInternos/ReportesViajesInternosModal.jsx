import React, { useEffect, useMemo, useState } from "react";
import { X, FileText, Download, User, AlertCircle, CheckCircle } from "lucide-react";

const normalize = (v) => String(v ?? "").trim().toLowerCase();

const parseLocalDate = (fecha) => {
  if (!fecha) return null;
  const base = String(fecha).split("T")[0];
  const parts = base.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatearFecha = (fecha) => {
  const d = parseLocalDate(fecha);
  if (!d || Number.isNaN(d.getTime())) return fecha ? String(fecha) : "N/A";
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
};

const formatearMoneda = (cantidad) => {
  const n = Number(cantidad || 0);
  return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
};

function buildClientesFromViajes(viajes = []) {
  const map = new Map();

  (viajes || []).forEach((v) => {
    const nombre = String(v?.clienteNombre || v?.cliente?.nombre || v?.clienteId?.nombre || "").trim();
    const telefono = String(v?.clienteTelefono || v?.cliente?.telefono || v?.clienteId?.telefono || "").trim();

    const id =
      v?.clienteId?._id ||
      v?.clienteId ||
      v?.cliente?._id ||
      v?.cliente?.id ||
      (nombre ? `${nombre}|${telefono}` : "");

    if (!nombre) return;

    const key = String(id || `${nombre}|${telefono}`);
    if (!map.has(key)) {
      map.set(key, { id: key, nombre, telefono });
    }
  });

  return Array.from(map.values());
}

function openPrintReport({ title, rows }) {
  const totalMonto = (rows || []).reduce((acc, r) => acc + Number(r?.monto || 0), 0);

  const byEstado = new Map();
  (rows || []).forEach((r) => {
    const est = String(r?.estado || "Pendiente");
    byEstado.set(est, (byEstado.get(est) || 0) + 1);
  });

  const estadoHtml = Array.from(byEstado.entries())
    .map(([k, v]) => `<div class="pill"><b>${k}:</b> ${v}</div>`)
    .join("");

  const tableRows = (rows || [])
    .map((r) => {
      const fecha = r?.fecha || r?.createdAt;
      const cliente = r?.clienteNombre || r?.cliente?.nombre || r?.clienteId?.nombre || "N/A";
      const origen = r?.origen?.texto || "N/A";
      const destino = r?.destino?.texto || "N/A";
      const estado = r?.estado || "Pendiente";
      const monto = formatearMoneda(r?.monto || 0);

      return `
        <tr>
          <td>${formatearFecha(fecha)}</td>
          <td>${cliente}</td>
          <td>${origen}</td>
          <td>${destino}</td>
          <td>${estado}</td>
          <td style="text-align:right">${monto}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
  <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
        h1 { margin:0; font-size: 22px; }
        .muted { color:#555; font-size: 12px; margin-top:6px; }
        .summary { margin-top:16px; display:flex; gap:10px; flex-wrap:wrap; }
        .pill { background:#f3f4f6; border:1px solid #e5e7eb; padding:8px 10px; border-radius:999px; font-size:12px; }
        .totals { margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap; }
        table { width:100%; border-collapse: collapse; margin-top: 18px; }
        th, td { border-bottom:1px solid #e5e7eb; padding:10px 8px; font-size: 12px; vertical-align: top; }
        th { text-align:left; background:#fafafa; }
        .btn { margin-top:18px; background:#4f46e5; color:white; border:none; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:700; }
        @media print { .btn { display:none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${title}</h1>
          <div class="muted">Generado: ${new Date().toLocaleString("es-ES")}</div>
        </div>
        <button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button>
      </div>

      <div class="totals">
        <div class="pill"><b>Total viajes:</b> ${(rows || []).length}</div>
        <div class="pill"><b>Total monto:</b> ${formatearMoneda(totalMonto)}</div>
      </div>

      <div class="summary">${estadoHtml}</div>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Estado</th>
            <th style="text-align:right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || `<tr><td colspan="6" style="text-align:center;color:#666;padding:20px">Sin registros</td></tr>`}
        </tbody>
      </table>
    </body>
  </html>
  `;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

async function tryOpenPdfFromEndpoints(endpoints = []) {
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/pdf" },
      });

      // Si responde OK y parece PDF, abrimos la URL directa en nueva pestaña
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (res.ok && (ct.includes("application/pdf") || ct.includes("application/octet-stream"))) {
        window.open(url, "_blank", "noopener,noreferrer");
        return { ok: true, used: url };
      }

      // Si devuelve JSON con data, lo usamos como fallback de datos
      if (res.ok && ct.includes("application/json")) {
        const json = await res.json().catch(() => ({}));
        const rows = json?.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(rows) && rows.length >= 0) {
          return { ok: false, jsonRows: rows, used: url };
        }
      }
    } catch (_) {
      // seguimos probando
    }
  }

  return { ok: false };
}

export default function ReportesViajesInternosModal({ isOpen, onClose, apiUrl, viajes = [] }) {
  const [tipo, setTipo] = useState("general"); // general | cliente
  const [clienteId, setClienteId] = useState("");

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [generando, setGenerando] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: "", title: "", message: "", details: [] });

  const VIAJES_ENDPOINT = `${apiUrl}/viajesinternos`;
  const CLIENTES_ENDPOINT = `${apiUrl}/clientes`;

  const clientesOptions = useMemo(() => {
    const base = clientes.length ? clientes : buildClientesFromViajes(viajes);
    const uniq = new Map();
    base.forEach((c) => {
      const id = String(c?.id || c?._id || "");
      const nombre = String(c?.nombre || c?.clienteNombre || "").trim();
      const telefono = String(c?.telefono || c?.clienteTelefono || "").trim();
      if (!nombre) return;
      const key = id || `${nombre}|${telefono}`;
      if (!uniq.has(key)) uniq.set(key, { id: key, nombre, telefono, label: telefono ? `${nombre} - ${telefono}` : nombre });
    });
    return Array.from(uniq.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientes, viajes]);

  const showCustomAlert = (type, title, message, details = []) => {
    setAlertData({ type, title, message, details });
    setShowAlert(true);
  };

  const loadClientes = async () => {
    setLoadingClientes(true);
    try {
      // 1) Armamos desde viajes actuales (por si /clientes falla)
      const fromViajes = buildClientesFromViajes(viajes);
      setClientes(fromViajes);

      // 2) Intentamos /clientes (si existe)
      const res = await fetch(CLIENTES_ENDPOINT, { credentials: "include" });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const rows = json?.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(rows)) {
          const mapped = rows.map((c) => ({
            id: c?._id || c?.id || "",
            nombre: c?.clienteNombre || c?.nombre || c?.name || "",
            telefono: c?.clienteTelefono || c?.telefono || c?.phone || "",
          }));
          // merge
          const merged = new Map();
          [...fromViajes, ...mapped].forEach((c) => {
            const key = String(c?.id || `${c.nombre}|${c.telefono}`);
            if (!c?.nombre) return;
            if (!merged.has(key)) merged.set(key, c);
          });
          setClientes(Array.from(merged.values()));
        }
      }
    } catch (_) {
      // si falla, nos quedamos con el fallback
    } finally {
      setLoadingClientes(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isButtonDisabled = () => {
    if (generando) return true;
    if (tipo === "cliente" && !clienteId) return true;
    return false;
  };

  const getRowsForFallback = async () => {
    if (Array.isArray(viajes) && viajes.length) return viajes;
    const res = await fetch(VIAJES_ENDPOINT, { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    const rows = json?.data || (Array.isArray(json) ? json : []);
    return Array.isArray(rows) ? rows : [];
  };

  const generar = async () => {
    setGenerando(true);
    try {
      // ⚠️ OJO: NO usamos /api/reporte (eso es mantenimientos)

      if (tipo === "general") {
        const candidates = [
          // si ya tienes endpoints específicos en backend, ponlos aquí primero:
          `${apiUrl}/viajesinternos/reportes/todos`,
          `${apiUrl}/viajesinternos/reporte/todos`,
          `${apiUrl}/reporteviaje/todos`,
          `${apiUrl}/reporteviaje/todos-viajesinternos`,
        ];

        const r = await tryOpenPdfFromEndpoints(candidates);
        if (r.ok) {
          showCustomAlert("success", "¡Reporte generado!", "Se abrió el PDF del reporte general.");
          return;
        }

        // Fallback (si no existe endpoint PDF): reporte imprimible
        const rows = r.jsonRows ?? (await getRowsForFallback());
        const opened = openPrintReport({ title: "Reporte - Viajes Internos (General)", rows });
        if (!opened) {
          showCustomAlert("error", "Popup bloqueado", "Tu navegador bloqueó la ventana. Habilita popups e intenta de nuevo.");
          return;
        }
        showCustomAlert("success", "Reporte listo", "Se abrió un reporte imprimible (puedes Guardar como PDF).");
        return;
      }

      // Por Cliente
      const selected = clientesOptions.find((c) => String(c.id) === String(clienteId));
      if (!selected) {
        showCustomAlert("warning", "Cliente no seleccionado", "Selecciona un cliente válido.");
        return;
      }

      const cid = encodeURIComponent(String(selected.id));
      const candidates = [
        `${apiUrl}/viajesinternos/reportes/cliente/${cid}`,
        `${apiUrl}/viajesinternos/reporte/cliente/${cid}`,
        `${apiUrl}/reporteviaje/cliente/${cid}`,
        `${apiUrl}/reporteviaje/${cid}`,
        `${apiUrl}/ViajesxClientes/${cid}`,
        `${apiUrl}/ViajesxClientes?clienteId=${cid}`,
      ];

      const r = await tryOpenPdfFromEndpoints(candidates);
      if (r.ok) {
        showCustomAlert("success", "¡Reporte generado!", `Se abrió el PDF del cliente: ${selected.nombre}`);
        return;
      }

      // Fallback con data (json) o filtrando viajes internos
      let rows = r.jsonRows;
      if (!rows) {
        const all = await getRowsForFallback();
        rows = all.filter((v) => {
          const n = normalize(v?.clienteNombre || v?.cliente?.nombre || v?.clienteId?.nombre || "");
          const t = normalize(v?.clienteTelefono || v?.cliente?.telefono || v?.clienteId?.telefono || "");
          const selN = normalize(selected.nombre);
          const selT = normalize(selected.telefono);

          // match por nombre (y si hay teléfono, lo usamos como extra)
          if (selT) return n === selN && t === selT;
          return n === selN;
        });
      }

      const opened = openPrintReport({
        title: `Reporte - Viajes Internos (Cliente: ${selected.nombre})`,
        rows: Array.isArray(rows) ? rows : [],
      });

      if (!opened) {
        showCustomAlert("error", "Popup bloqueado", "Tu navegador bloqueó la ventana. Habilita popups e intenta de nuevo.");
        return;
      }
      showCustomAlert("success", "Reporte listo", "Se evidentó un reporte imprimible (puedes Guardar como PDF).");
    } catch (e) {
      showCustomAlert("error", "Error", e.message || "No se pudo generar el reporte");
    } finally {
      setGenerando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reportes - Viajes Internos</h2>
                <p className="text-indigo-100 text-sm">Selecciona el tipo de reporte</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Tipo */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTipo("general")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipo === "general"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">General</div>
                  <div className="text-xs text-gray-500 mt-1">Todos los viajes</div>
                </button>

                <button
                  onClick={() => setTipo("cliente")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipo === "cliente"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <User className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Por Cliente</div>
                  <div className="text-xs text-gray-500 mt-1">Filtrado</div>
                </button>
              </div>
            </div>

            {tipo === "cliente" && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  disabled={loadingClientes}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">
                    {loadingClientes ? "Cargando clientes..." : "Seleccionar cliente..."}
                  </option>
                  {clientesOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-2">
                  *Si tu backend no devuelve clientes, se arma la lista desde los viajes internos guardados.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={generar}
              disabled={isButtonDisabled()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div
              className={`px-6 py-8 ${
                alertData.type === "success"
                  ? "bg-gradient-to-br from-green-50 to-emerald-50"
                  : alertData.type === "error"
                  ? "bg-gradient-to-br from-red-50 to-rose-50"
                  : alertData.type === "warning"
                  ? "bg-gradient-to-br from-amber-50 to-yellow-50"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    alertData.type === "success"
                      ? "bg-green-100"
                      : alertData.type === "error"
                      ? "bg-red-100"
                      : alertData.type === "warning"
                      ? "bg-amber-100"
                      : "bg-blue-100"
                  }`}
                >
                  {alertData.type === "success" ? (
                    <CheckCircle className="text-green-600" size={32} />
                  ) : (
                    <AlertCircle
                      className={
                        alertData.type === "error"
                          ? "text-red-600"
                          : alertData.type === "warning"
                          ? "text-amber-600"
                          : "text-blue-600"
                      }
                      size={32}
                    />
                  )}
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    alertData.type === "success"
                      ? "text-green-900"
                      : alertData.type === "error"
                      ? "text-red-900"
                      : alertData.type === "warning"
                      ? "text-amber-900"
                      : "text-blue-900"
                  }`}
                >
                  {alertData.title}
                </h3>
                <p className="text-gray-600 text-sm">{alertData.message}</p>
              </div>
            </div>

            {!!alertData.details?.length && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <ul className="space-y-2">
                  {alertData.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <button
                onClick={() => setShowAlert(false)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  alertData.type === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : alertData.type === "error"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : alertData.type === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
