import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";

// ✅ Modales
import DieselDetailModal from "./DieselDetailModal";
import ReportesDieselModal from "./ReportesDieselModal";

// Endpoints correctos según tu backend:
const DIESEL_ENDPOINT = `${config.api.API_URL}/resumen`;
const DIESEL_REPORTE_ENDPOINT = `${config.api.API_URL}/resumenReporte`;

const PantallaPrincipalDiesel = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [diesel, setDiesel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Estados del modal detalle
  const [selectedDieselId, setSelectedDieselId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Estados del modal reportes
  const [isReportesModalOpen, setIsReportesModalOpen] = useState(false);

  const itemsPerPage = 8;

  // ===== Helpers para soportar distintos nombres de campos =====
  const pickFecha = (row) => row?.fecha || row?.date || row?.createdAt || row?.fecha_diesel;

  const pickGalones = (row) => row?.Galones ?? row?.galones ?? row?.gallons ?? row?.cantidad_galones ?? 0;

  const pickTotal = (row) => row?.Total ?? row?.total ?? row?.monto ?? row?.amount ?? row?.costo_total ?? 0;

  const pickPlaca = (row) =>
    row?.CicurlationCard?.licensePlate ||
    row?.CicurlationCard?.placa ||
    row?.placa ||
    row?.licensePlate ||
    row?.ciculatioCard?.licensePlate ||
    row?.camion?.placa ||
    row?.truck?.licensePlate ||
    "N/A";

  // ✅ (1) FECHA SIN DESFASE (ARREGLA EL 12 -> 11)
  const parseLocalDate = (fecha) => {
    if (!fecha) return null;

    // soporta "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss..."
    const base = String(fecha).split("T")[0];
    const parts = base.split("-");
    if (parts.length !== 3) return null;

    const [y, m, d] = parts.map((x) => Number(x));
    if (!y || !m || !d) return null;

    // 👇 fecha en HORA LOCAL (no UTC)
    return new Date(y, m - 1, d);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";

    const date = parseLocalDate(fecha);
    if (!date || Number.isNaN(date.getTime())) return String(fecha);

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  };

  const formatearNumero = (n) => {
    const num = Number(n || 0);
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ===== Fetch =====
  useEffect(() => {
    fetchDiesel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDiesel = async () => {
    try {
      setLoading(true);

      const res = await fetch(DIESEL_ENDPOINT);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json?.message || "Error al cargar los registros de diésel");

      const rows = json.data || (Array.isArray(json) ? json : []);
      setDiesel(rows);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      html: `<div style="text-align:center;padding:20px 10px;">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#fee2e2 0%,#fecaca 100%);margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
          <svg width="40" height="40" fill="none" stroke="#ef4444" stroke-width="2.5">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h2 style="font-size:28px;font-weight:700;margin:0 0 12px 0;">¿Eliminar registro?</h2>
        <p style="color:#6b7280;">Esta acción no se puede deshacer</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;

    try {
      const id = row?._id || row?.id;
      if (!id) throw new Error("No se encontró el ID del registro");

      const res = await fetch(`${DIESEL_ENDPOINT}/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Error al eliminar");

      await Swal.fire({
        title: "¡Eliminado!",
        text: "Registro eliminado exitosamente",
        icon: "success",
        timer: 2000,
      });

      fetchDiesel();
    } catch (e) {
      Swal.fire({ title: "Error", text: e.message, icon: "error" });
    }
  };

  const openDetail = (id) => {
    if (!id) return;
    setSelectedDieselId(id);
    setIsModalOpen(true);
  };

  // ===== Filtro + orden =====
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return diesel;

    return diesel.filter((row) => {
      const placa = String(pickPlaca(row)).toLowerCase();
      const fechaTxt = String(formatearFecha(pickFecha(row))).toLowerCase();
      return placa.includes(s) || fechaTxt.includes(s);
    });
  }, [diesel, searchTerm]);

  // ✅ (2) ORDEN SIN DESFASE (usa parseLocalDate)
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const da = parseLocalDate(pickFecha(a));
      const db = parseLocalDate(pickFecha(b));
      const ta = da && !Number.isNaN(da.getTime()) ? da.getTime() : 0;
      const tb = db && !Number.isNaN(db.getTime()) ? db.getTime() : 0;
      return sortBy === "newest" ? tb - ta : ta - tb;
    });
    return arr;
  }, [filtered, sortBy]);

  // ===== Paginación =====
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = sorted.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando registros de diésel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar los datos</p>
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchDiesel} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalGeneral = sorted.reduce((acc, row) => acc + Number(pickTotal(row) || 0), 0);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Diésel</h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-indigo-600 text-base font-semibold">Total: {diesel.length} registros</p>
            <p className="text-gray-700 font-semibold">
              Total general (filtrado): <span className="text-gray-900">{formatearMoneda(totalGeneral)}</span>
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por placa o fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                </select>
              </div>

              <button
                onClick={() => setIsReportesModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 font-semibold shadow-lg transition-all"
              >
                <Download size={18} />
                Generar Reportes
              </button>

              <button
                onClick={() => navigate("/diesel/agregar")}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg"
              >
                <Plus size={20} />
                Agregar Diésel
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">#</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Fecha</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm">Placa</th>
                  <th className="text-right py-5 px-6 text-gray-500 font-semibold text-sm">Galones</th>
                  <th className="text-right py-5 px-6 text-gray-500 font-semibold text-sm">Total</th>
                  <th className="text-center py-5 px-6 text-gray-500 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, idx) => {
                  const id = row?._id || row?.id;
                  const fecha = pickFecha(row);
                  const placa = pickPlaca(row);
                  const galones = pickGalones(row);
                  const total = pickTotal(row);

                  return (
                    <tr
                      key={id || idx}
                      onClick={() => openDetail(id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-5 px-6 text-gray-700 font-semibold">{startIndex + idx + 1}</td>
                      <td className="py-5 px-6 text-gray-900 font-semibold">{formatearFecha(fecha)}</td>
                      <td className="py-5 px-6 text-gray-600">{placa}</td>
                      <td className="py-5 px-6 text-right text-gray-900 font-semibold">{formatearNumero(galones)}</td>
                      <td className="py-5 px-6 text-right font-bold text-gray-900">{formatearMoneda(total)}</td>

                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(`${DIESEL_REPORTE_ENDPOINT}/individual/${id}`, "_blank")}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            onClick={() => navigate(`/diesel/editar/${id}`)}
                            className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(row)}
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
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No hay registros para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer paginación */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando {sorted.length === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, sorted.length)} de{" "}
              {sorted.length} registros
            </p>

            <div className="flex items-center gap-2">
              <button
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
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
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

      {/* ✅ Modal Detalle Diesel */}
      <DieselDetailModal dieselId={selectedDieselId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ✅ Modal Reportes Diesel */}
      <ReportesDieselModal
        isOpen={isReportesModalOpen}
        onClose={() => setIsReportesModalOpen(false)}
        apiUrl={config.api.API_URL}
      />
    </div>
  );
};

export default PantallaPrincipalDiesel;
