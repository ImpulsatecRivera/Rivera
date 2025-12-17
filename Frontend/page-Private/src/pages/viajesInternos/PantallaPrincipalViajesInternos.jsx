import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";

import ViajeInternoDetailModal from "./ViajeInternoDetailModal";
import ReportesViajesInternosModal from "./ReportesViajesInternosModal";

const VIAJES_ENDPOINT = `${config.api.API_URL}/viajesinternos`;

const ESTADOS = {
  TODOS: "Todos",
  PENDIENTE: "Pendiente",
  EN_RUTA: "En ruta",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

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

const getRawEstado = (row) => {
  const raw =
    row?.estado ??
    row?.Estado ??
    row?.status ??
    row?.Status ??
    row?.estatus ??
    row?.Estatus ??
    row?.estadoViaje ??
    row?.estado_viaje ??
    row?.estadoViajeInterno ??
    row?.state ??
    row?.State ??
    null;

  if (raw && typeof raw === "object") {
    return raw?.nombre ?? raw?.name ?? raw?.label ?? raw?.estado ?? raw?.status ?? raw?.value ?? null;
  }

  return raw;
};

const canonEstado = (row) => {
  const raw = getRawEstado(row) ?? "PENDIENTE";
  const e = normalize(raw);

  if (["completado", "completed", "done", "finalizado", "terminado"].includes(e)) return ESTADOS.COMPLETADO;
  if (["en ruta", "en_ruta", "enruta", "in_route", "ruta"].includes(e)) return ESTADOS.EN_RUTA;
  if (["cancelado", "canceled", "cancelled", "anulado"].includes(e)) return ESTADOS.CANCELADO;

  return ESTADOS.PENDIENTE;
};

const estadoBadgeClass = (estado) => {
  const e = normalize(estado);
  if (e === "completado") return "bg-green-50 text-green-700 border border-green-200";
  if (e === "en ruta") return "bg-blue-50 text-blue-700 border border-blue-200";
  if (e === "cancelado") return "bg-red-50 text-red-700 border border-red-200";
  return "bg-yellow-50 text-yellow-800 border border-yellow-200";
};

export default function PantallaPrincipalViajesInternos() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viajes, setViajes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(ESTADOS.TODOS);

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  // ✅ Modal reportes (sin ruta)
  const [isReportesOpen, setIsReportesOpen] = useState(false);

  const fetchViajes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(VIAJES_ENDPOINT, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Error al cargar los viajes internos");

      const rows = json?.data || (Array.isArray(json) ? json : []);
      setViajes(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const openDetail = (row) => {
    const id = row?._id || row?.id;
    if (!id) return;
    setDetailId(String(id));
    setIsDetailOpen(true);
  };

  const handleEdit = (e, row) => {
    e.stopPropagation();
    const id = row?._id || row?.id;

    if (!id) {
      Swal.fire({ icon: "error", title: "Error", text: "No se encontró el ID del viaje para editar." });
      return;
    }

    navigate(`/viajesInternos/editar/${String(id)}`);
  };

  const handleDelete = async (e, row) => {
    e.stopPropagation();

    const id = row?._id || row?.id;
    if (!id) return;

    const result = await Swal.fire({
      title: "¿Eliminar viaje interno?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${VIAJES_ENDPOINT}/${id}?eliminarPermanente=true`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.message || "Error al eliminar");

      await Swal.fire({ title: "¡Eliminado!", text: "Viaje eliminado", icon: "success", timer: 1500 });
      fetchViajes();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return viajes.filter((row) => {
      const est = canonEstado(row);
      const estadoOk = estadoFiltro === ESTADOS.TODOS || est === estadoFiltro;
      if (!estadoOk) return false;

      if (!s) return true;

      const fecha = row?.fecha || row?.createdAt;
      const cliente = row?.clienteNombre || row?.cliente?.nombre || row?.clienteId?.nombre || "";
      const origen = row?.origen?.texto || "";
      const destino = row?.destino?.texto || "";

      return (
        String(formatearFecha(fecha)).toLowerCase().includes(s) ||
        String(cliente).toLowerCase().includes(s) ||
        String(origen).toLowerCase().includes(s) ||
        String(destino).toLowerCase().includes(s)
      );
    });
  }, [viajes, searchTerm, estadoFiltro]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const fa = a?.fecha || a?.createdAt;
      const fb = b?.fecha || b?.createdAt;

      const ta = !Number.isNaN(new Date(fa).getTime())
        ? new Date(fa).getTime()
        : (parseLocalDate(fa)?.getTime() || 0);

      const tb = !Number.isNaN(new Date(fb).getTime())
        ? new Date(fb).getTime()
        : (parseLocalDate(fb)?.getTime() || 0);

      return sortBy === "newest" ? tb - ta : ta - tb;
    });
    return arr;
  }, [filtered, sortBy]);

  useEffect(() => setCurrentPage(1), [searchTerm, estadoFiltro, sortBy]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = sorted.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando viajes internos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchViajes} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tabs = [ESTADOS.TODOS, ESTADOS.PENDIENTE, ESTADOS.EN_RUTA, ESTADOS.COMPLETADO, ESTADOS.CANCELADO];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Viajes Internos</h1>
            <p className="text-gray-500">Gestión de viajes internos</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* ✅ Reportes abre modal (NO ruta) */}
            <button
              type="button"
              onClick={() => setIsReportesOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 font-semibold shadow-sm"
            >
              <BarChart3 size={20} />
              Reportes
            </button>

            <button
              type="button"
              onClick={() => navigate("/viajesInternos/agregar")}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg"
            >
              <Plus size={20} />
              Agregar Viaje
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {tabs.map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setEstadoFiltro(est)}
              className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${
                estadoFiltro === est
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md mb-6 mt-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente, origen, destino o fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">#</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Fecha</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Cliente</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Origen</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Destino</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Estado</th>
                  <th className="text-right py-5 px-6 text-gray-500 font-semibold text-sm">Monto</th>
                  <th className="text-center py-5 px-6 text-gray-500 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, idx) => {
                  const id = row?._id || row?.id;
                  const fecha = row?.fecha || row?.createdAt;

                  const cliente = row?.clienteNombre || row?.cliente?.nombre || row?.clienteId?.nombre || "N/A";
                  const origen = row?.origen?.texto || "N/A";
                  const destino = row?.destino?.texto || "N/A";

                  const estado = canonEstado(row);
                  const monto = row?.monto ?? 0;

                  const esCompletado = normalize(estado) === "completado";

                  return (
                    <tr
                      key={String(id || idx)}
                      onClick={() => openDetail(row)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-5 px-6 text-gray-700 font-semibold">{startIndex + idx + 1}</td>
                      <td className="py-5 px-6 text-gray-900 font-semibold">{formatearFecha(fecha)}</td>
                      <td className="py-5 px-6 text-gray-700">{cliente}</td>
                      <td className="py-5 px-6 text-gray-700">{origen}</td>
                      <td className="py-5 px-6 text-gray-700">{destino}</td>

                      <td className="py-5 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${estadoBadgeClass(estado)}`}>
                          {estado}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right font-bold text-gray-900">
                        {formatearMoneda(monto)}
                      </td>

                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetail(row)}
                            className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title="Ver"
                          >
                            <Eye size={18} />
                          </button>

                          {!esCompletado && (
                            <button
                              type="button"
                              onClick={(e) => handleEdit(e, row)}
                              className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, row)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500">
                      No hay viajes internos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando {sorted.length === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, sorted.length)} de {sorted.length} registros
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === page ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ViajeInternoDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        viajeId={detailId}
      />

      {/* ✅ Modal de reportes */}
      <ReportesViajesInternosModal
        isOpen={isReportesOpen}
        onClose={() => setIsReportesOpen(false)}
        apiUrl={config.api.API_URL}
        viajes={viajes}
      />
    </div>
  );
}
