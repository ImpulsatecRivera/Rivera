import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, Download, ChevronDown, AlertCircle, CheckCircle, Calendar, User } from "lucide-react";

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function joinUrl(base, path) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

// ✅ si apiUrl viene con /api o sin /api, funciona igual
function getBaseReportes(apiUrl) {
  const base = String(apiUrl || "").replace(/\/+$/, "");
  const hasApi = /\/api(\/)?$/.test(base) || base.includes("/api/");
  const withApi = hasApi ? base : `${base}/api`;
  return joinUrl(withApi, "reporteviaje"); // => .../api/reporteviaje
}

export default function ReportesViajesInternosModal({ isOpen, onClose, apiUrl }) {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [ano, setAno] = useState(String(now.getFullYear()));

  const [reporteId, setReporteId] = useState("");
  const [clientesMes, setClientesMes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [generando, setGenerando] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: "", title: "", message: "", details: [] });

  const yearsOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => String(y - i));
  }, []);

  const showCustomAlert = (type, title, message, details = []) => {
    setAlertData({ type, title, message, details });
    setShowAlert(true);
  };

  // ✅ BASE REAL
  const baseReportes = useMemo(() => getBaseReportes(apiUrl), [apiUrl]);

  const cargarClientesMes = useCallback(async () => {
    setLoadingClientes(true);
    setReporteId("");
    try {
      const mesNum = Number(mes);
      const anoNum = Number(ano);

      const url = joinUrl(baseReportes, `clientes-mes/${mesNum}/${anoNum}`);
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        showCustomAlert("error", "No se pudieron cargar los clientes", j?.message || `Error HTTP ${res.status}`);
        setClientesMes([]);
        return;
      }

      const json = await res.json().catch(() => ({}));
      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

      setClientesMes(rows);
    } catch {
      showCustomAlert("error", "No se pudieron cargar los clientes", "Error de red.");
      setClientesMes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, [mes, ano, baseReportes]);

  useEffect(() => {
    if (!isOpen) return;
    cargarClientesMes();
  }, [isOpen, mes, ano, cargarClientesMes]);

  const isButtonDisabled = () => {
    if (generando) return true;
    if (!mes || !ano) return true;
    if (!reporteId) return true;
    return false;
  };

  // ✅ FIX POPUP BLOQUEADO: abre ventana "ya" (en el click), luego fetch y la llenas
  const abrirPDF = async () => {
    // abrir SINCRÓNICO (para que el navegador no bloquee)
    const win = window.open("about:blank", "_blank", "noopener,noreferrer");
    if (!win) {
      showCustomAlert("error", "Popup bloqueado", "Permite ventanas emergentes y vuelve a intentar.");
      return;
    }

    setGenerando(true);
    try {
      const pdfUrl = joinUrl(baseReportes, `pdf-individual/${encodeURIComponent(reporteId)}`);

      const res = await fetch(pdfUrl, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/pdf" },
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        win.close();
        showCustomAlert("error", "No se pudo abrir el PDF", j?.message || `Error HTTP ${res.status}`, [
          "Confirma que exista: GET /api/reporteviaje/pdf-individual/:id",
          "Ese :id debe ser el _id del reporte (ViajesPorClientes).",
        ]);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // manda la pestaña a mostrar el PDF
      win.location.href = blobUrl;

      // limpieza
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

      showCustomAlert("success", "¡Reporte generado!", "Se abrió el PDF del cliente en una nueva pestaña.");
    } catch {
      win.close();
      showCustomAlert("error", "Error", "Ocurrió un problema al abrir el PDF.");
    } finally {
      setGenerando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <User className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generar Reporte</h2>
                <p className="text-indigo-100 text-sm">PDF por Cliente (Mensual)</p>
              </div>
            </div>

            <button type="button" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Periodo</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Mes
                  </div>
                  <div className="relative">
                    <select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      {MESES.map((m) => (
                        <option key={m.value} value={String(m.value)}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Año</div>
                  <div className="relative">
                    <select
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      {yearsOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                *El selector se llena con los reportes ya generados en <b>ViajesPorClientes</b>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
              <div className="relative">
                <select
                  value={reporteId}
                  onChange={(e) => setReporteId(e.target.value)}
                  disabled={loadingClientes}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="">{loadingClientes ? "Cargando..." : "Seleccionar cliente..."}</option>

                  {clientesMes.map((c) => {
                    const id = c?._id || c?.id; // ✅ tolera ambos
                    const nombre = c?.clienteNombre || c?.cliente?.nombre || "Cliente";
                    const totalViajes = Number(c?.totalViajes || 0);
                    const montoTotal = Number(c?.montoTotalGeneral ?? c?.montoTotal ?? 0).toFixed(2);

                    if (!id) return null;

                    return (
                      <option key={id} value={id}>
                        {nombre} — {totalViajes} viajes — ${montoTotal}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {!loadingClientes && clientesMes.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  No hay reportes generados para ese mes/año. Genera los reportes primero en backend.
                </p>
              )}

              {/* ayuda rápida para depurar base */}
              <p className="text-[11px] text-gray-400 mt-2">Base: {baseReportes}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold">
              Cancelar
            </button>

            <button
              type="button"
              onClick={abrirPDF}
              disabled={isButtonDisabled()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Abriendo...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Abrir PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div
              className={`px-6 py-8 ${
                alertData.type === "success"
                  ? "bg-gradient-to-br from-green-50 to-emerald-50"
                  : alertData.type === "error"
                  ? "bg-gradient-to-br from-red-50 to-rose-50"
                  : "bg-gradient-to-br from-amber-50 to-yellow-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    alertData.type === "success" ? "bg-green-100" : alertData.type === "error" ? "bg-red-100" : "bg-amber-100"
                  }`}
                >
                  {alertData.type === "success" ? (
                    <CheckCircle className="text-green-600" size={32} />
                  ) : (
                    <AlertCircle className={alertData.type === "error" ? "text-red-600" : "text-amber-600"} size={32} />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{alertData.title}</h3>
                <p className="text-gray-600 text-sm">{alertData.message}</p>

                {Array.isArray(alertData.details) && alertData.details.length > 0 && (
                  <ul className="text-left text-xs text-gray-600 mt-3 list-disc pl-5">
                    {alertData.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className={`w-full py-3 rounded-xl font-semibold text-white ${
                  alertData.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : alertData.type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
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
