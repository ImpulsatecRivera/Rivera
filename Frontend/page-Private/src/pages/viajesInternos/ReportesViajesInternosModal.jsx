import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  Download,
  User,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const normalize = (v) => String(v ?? "").trim().toLowerCase();

const parseDateSafe = (v) => {
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d;

  const base = String(v ?? "").split("T")[0];
  const parts = base.split("-");
  if (parts.length !== 3) return null;
  const [y, m, dd] = parts.map((x) => Number(x));
  if (!y || !m || !dd) return null;

  const d2 = new Date(y, m - 1, dd);
  return Number.isNaN(d2.getTime()) ? null : d2;
};

const formatearMoneda = (cantidad) => {
  const n = Number(cantidad || 0);
  return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
};

const formatearFecha = (fecha) => {
  const d = parseDateSafe(fecha);
  if (!d) return fecha ? String(fecha) : "N/A";
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
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
    if (!map.has(key)) map.set(key, { id: key, nombre, telefono });
  });

  return Array.from(map.values());
}

function openPrintReport({ title, rows }) {
  const totalMonto = (rows || []).reduce((acc, r) => acc + Number(r?.monto || 0), 0);

  const byEstado = new Map();
  (rows || []).forEach((r) => {
    const est = String(r?.estado || "PENDIENTE");
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
      const estado = r?.estado || "PENDIENTE";
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

async function fetchViajesFallback(apiUrl) {
  const res = await fetch(`${apiUrl}/viajesinternos`, { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  const rows = json?.data || (Array.isArray(json) ? json : []);
  return Array.isArray(rows) ? rows : [];
}

async function tryOpenPdf(urls = []) {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/pdf" },
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (res.ok && (ct.includes("application/pdf") || ct.includes("application/octet-stream"))) {
        window.open(url, "_blank", "noopener,noreferrer");
        return { ok: true, used: url };
      }
      if (res.status === 404) {
        const j = await res.json().catch(() => ({}));
        return { ok: false, notFound: true, message: j?.message || "Sin datos" };
      }
    } catch {
      // seguimos
    }
  }
  return { ok: false };
}

export default function ReportesViajesInternosModal({ isOpen, onClose, apiUrl, viajes = [] }) {
  const [tipoReporte, setTipoReporte] = useState("todos"); // todos | cliente
  const [clienteId, setClienteId] = useState("");

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [generando, setGenerando] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: "", title: "", message: "", details: [] });

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
      const fromViajes = buildClientesFromViajes(viajes);
      setClientes(fromViajes);

      const res = await fetch(`${apiUrl}/clientes`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const rows = json?.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(rows)) {
          const mapped = rows.map((c) => ({
            id: c?._id || c?.id || "",
            nombre: c?.clienteNombre || c?.nombre || c?.name || "",
            telefono: c?.clienteTelefono || c?.telefono || c?.phone || "",
          }));

          const merged = new Map();
          [...fromViajes, ...mapped].forEach((c) => {
            const key = String(c?.id || `${c.nombre}|${c.telefono}`);
            if (!c?.nombre) return;
            if (!merged.has(key)) merged.set(key, c);
          });

          setClientes(Array.from(merged.values()));
        }
      }
    } catch {
      // fallback
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
    if (tipoReporte === "cliente" && !clienteId) return true;
    return false;
  };

  const getAllRows = async () => {
    if (Array.isArray(viajes) && viajes.length) return viajes;
    return await fetchViajesFallback(apiUrl);
  };

  const filtrarPorCliente = (rows, selected) => {
    const selN = normalize(selected?.nombre);
    const selT = normalize(selected?.telefono);

    return (rows || []).filter((v) => {
      const n = normalize(v?.clienteNombre || v?.cliente?.nombre || v?.clienteId?.nombre || "");
      const t = normalize(v?.clienteTelefono || v?.cliente?.telefono || v?.clienteId?.telefono || "");
      if (selT) return n === selN && t === selT;
      return n === selN;
    });
  };

  const generarReporte = async () => {
    setGenerando(true);
    try {
      // === TODOS ===
      if (tipoReporte === "todos") {
        const pdfCandidates = [
          `${apiUrl}/viajesinternos/reporte/todos`,
          `${apiUrl}/viajesinternos/reportes/todos`,
        ];

        const r = await tryOpenPdf(pdfCandidates);
        if (r.ok) {
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert("success", "¡Reporte generado!", "El reporte consolidado se abrió en una nueva pestaña.");
          }, 700);
          return;
        }

        const rows = await getAllRows();
        const opened = openPrintReport({ title: "Reporte - Viajes Internos (Consolidado)", rows });
        if (!opened) {
          setGenerando(false);
          showCustomAlert("error", "Popup bloqueado", "Tu navegador bloqueó la ventana. Habilita popups e intenta de nuevo.");
          return;
        }

        setTimeout(() => {
          setGenerando(false);
          showCustomAlert("success", "Reporte listo", "Se abrió un reporte imprimible (puedes Guardar como PDF).");
        }, 700);
        return;
      }

      // === CLIENTE ===
      const selected = clientesOptions.find((c) => String(c.id) === String(clienteId));
      if (!selected) {
        setGenerando(false);
        showCustomAlert("warning", "Cliente no seleccionado", "Selecciona un cliente válido.");
        return;
      }

      const cid = encodeURIComponent(String(selected.id));
      const pdfCandidates = [
        `${apiUrl}/viajesinternos/reporte/cliente/${cid}`,
        `${apiUrl}/viajesinternos/reportes/cliente/${cid}`,
      ];

      const r = await tryOpenPdf(pdfCandidates);
      if (r.ok) {
        setTimeout(() => {
          setGenerando(false);
          showCustomAlert("success", "¡Reporte generado!", `El reporte del cliente se abrió: ${selected.nombre}`);
        }, 700);
        return;
      }

      const all = await getAllRows();
      const rows = filtrarPorCliente(all, selected);

      if (!rows.length) {
        setGenerando(false);
        showCustomAlert(
          "info",
          "Sin datos disponibles",
          `No hay viajes internos para el cliente: ${selected.nombre}.`,
          ["Intenta con otro cliente", "O revisa nombres/teléfonos guardados"]
        );
        return;
      }

      const opened = openPrintReport({
        title: `Reporte - Viajes Internos (Cliente: ${selected.nombre})`,
        rows,
      });

      if (!opened) {
        setGenerando(false);
        showCustomAlert("error", "Popup bloqueado", "Tu navegador bloqueó la ventana. Habilita popups e intenta de nuevo.");
        return;
      }

      setTimeout(() => {
        setGenerando(false);
        showCustomAlert("success", "Reporte listo", "Se abrió un reporte imprimible (puedes Guardar como PDF).");
      }, 700);
    } catch (error) {
      setGenerando(false);
      showCustomAlert(
        "error",
        "Error al generar reporte",
        "Ocurrió un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        ["Verifica tu conexión a internet", "Si el problema persiste, contacta al administrador"]
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generar Reportes</h2>
                <p className="text-indigo-100 text-sm">Viajes Internos</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Tipo */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</label>

              {/* ✅ SOLO 2 OPCIONES */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTipoReporte("todos")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === "todos"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Todos</div>
                  <div className="text-xs text-gray-500 mt-1">Consolidado</div>
                </button>

                <button
                  onClick={() => setTipoReporte("cliente")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === "cliente"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <User className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Cliente</div>
                  <div className="text-xs text-gray-500 mt-1">Filtrado</div>
                </button>
              </div>
            </div>

            {tipoReporte === "todos" && (
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <FileText className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Consolidado</h3>
                    <p className="text-sm text-indigo-700">
                      Se generará un reporte con todos los viajes internos registrados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tipoReporte === "cliente" && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                  <div className="flex items-start gap-3">
                    <User className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-1">Reporte por Cliente</h3>
                      <p className="text-sm text-indigo-700">
                        Genera un reporte filtrado por cliente (si no hay PDF, abre versión imprimible).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                  <div className="relative">
                    <select
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      disabled={loadingClientes}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
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
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    *Si /clientes falla, la lista se arma desde los viajes internos guardados.
                  </p>
                </div>
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
              onClick={generarReporte}
              disabled={isButtonDisabled()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 transition-all"
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

      {/* Custom Alert */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
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

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
}
