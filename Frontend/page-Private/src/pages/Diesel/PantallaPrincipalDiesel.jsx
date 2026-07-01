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
  Check,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";
import { usePermissions } from "../../hooks/usePermissions";
import { ProtectedAction, RoleBadge } from "../../components/Auth";
import { api } from "../../Context/authContext";

import DieselDetailModal from "./DieselDetailModal";
import ReportesDieselModal from "./ReportesDieselModal";

import { useTutorial } from '../../hooks/useTutorial';
import '../../styles/tutorial-global.css';
import { HelpCircle } from 'lucide-react';

const DIESEL_ENDPOINT = `${config.api.API_URL}/resumen`;
const DIESEL_REPORTE_ENDPOINT = `${config.api.API_URL}/resumenReporte`;

const PantallaPrincipalDiesel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canEdit, canDelete } = usePermissions();

  const { startTutorial, hasCompleted } = useTutorial('diesel');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [diesel, setDiesel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const ESTADOS = {
    TODOS: "Todos",
    PENDIENTE: "Pendiente",
    COMPLETADO: "Completado",
  };
  const [estadoFiltro, setEstadoFiltro] = useState(ESTADOS.TODOS);

  const [selectedDieselId, setSelectedDieselId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isReportesModalOpen, setIsReportesModalOpen] = useState(false);

  const itemsPerPage = 8;

  const pickFecha = (row) => row?.fecha || row?.date || row?.createdAt || row?.fecha_diesel;

  const pickGalones = (row) =>
    row?.Galones ?? row?.galones ?? row?.gallons ?? row?.cantidad_galones ?? 0;

  const pickTotal = (row) =>
    row?.Total ?? row?.total ?? row?.monto ?? row?.amount ?? row?.costo_total ?? 0;

  const pickPlaca = (row) =>
    row?.CicurlationCard?.licensePlate ||
    row?.CicurlationCard?.placa ||
    row?.placa ||
    row?.licensePlate ||
    row?.ciculatioCard?.licensePlate ||
    row?.camion?.placa ||
    row?.truck?.licensePlate ||
    "N/A";

  const pickEstado = (row) => row?.estado || row?.Estado || row?.status || row?.Status || "Pendiente";

  // ✅ NUEVO: Helper para obtener número de marchamo
  const pickMarchamo = (row) => row?.numeroMarchamo || null;

  const normalize = (v) => String(v || "").trim().toLowerCase();

  const canonEstado = (row) => {
    const e = normalize(pickEstado(row));
    if (["completado", "completo", "completed", "done", "finalizado"].includes(e)) return ESTADOS.COMPLETADO;
    return ESTADOS.PENDIENTE;
  };

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
    if (!fecha) return "N/A";
    const date = parseLocalDate(fecha);
    if (!date || Number.isNaN(date.getTime())) return String(fecha);
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
  };

  const formatearNumero = (n) => {
    const num = Number(n || 0);
    return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const fetchDiesel = async () => {
    try {
      setLoading(true);

      const res = await api.get(`${config.api.API_URL}/resumen`);

      setDiesel(res.data?.data || []);
      setError(null);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Error al cargar los registros de diésel"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiesel();
  }, [location.key]);

  const handleDelete = async (row) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      const id = row?._id || row?.id;
      if (!id) throw new Error("No se encontró el ID del registro");

      await api.delete(`${config.api.API_URL}/resumen/${id}`);

      await Swal.fire({
        title: "¡Eliminado!",
        text: "Registro eliminado exitosamente",
        icon: "success",
        timer: 2000,
      });

      fetchDiesel();
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e.response?.data?.message || e.message,
        icon: "error",
      });
    }
  };

  const descargarReporteIndividual = async (id) => {
    // Mostrar alerta de procesando
    Swal.fire({
      title: 'Procesando...',
      html: '<div style="text-align: center;"><div style="border: 4px solid #f3f3f3; border-top: 4px solid #5F8EAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div><p style="margin-top: 10px; color: #666;">Generando reporte, por favor espera</p></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
    });

    try {
      const response = await api.get(`${DIESEL_REPORTE_ENDPOINT}/individual/${id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-diesel-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mostrar alerta de éxito
      Swal.fire({
        icon: 'success',
        title: 'Reporte generado',
        html: `<p style="color: #666;"><strong>Reporte Individual</strong></p><p style="color: #999; font-size: 14px;">reporte-diesel-${id}.pdf</p>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#5F8EAD',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error descargando reporte:', error);
      
      let errorMessage = 'No se pudo generar el reporte. Intenta nuevamente.';
      let errorDetails = '';
      
      const showError = (msg, details = '') => {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar reporte',
          html: `<p style="color: #666;">${msg}</p>${details}`,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#5F8EAD'
        });
      };

      if (error.response) {
        if (error.response.status === 404 || error.response.status === 400) {
          if (error.response.data instanceof Blob) {
            error.response.data.text().then(text => {
              try {
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || 'No se pudo generar el reporte';
                if (error.response.status) {
                  errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
                }
                showError(errorMessage, errorDetails);
              } catch (e) {
                errorMessage = 'No se pudo generar el reporte';
                showError(errorMessage);
              }
            });
            return;
          } else if (typeof error.response.data === 'object') {
            errorMessage = error.response.data.message || 'No se pudo generar el reporte';
          }
        } else {
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
        
        if (error.response.status) {
          errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage, errorDetails);
    }
  };

  const marcarComoCompletado = async (row) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar como completado?',
      text: 'Una vez completado, no se podrá editar',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      const id = row?._id || row?.id;
      if (!id) throw new Error("No se encontró el ID del registro");

      await api.put(`${config.api.API_URL}/resumen/${id}`, {
        estado: "completado"
      });

      await Swal.fire({
        title: "¡Completado!",
        text: "Registro marcado como completado exitosamente",
        icon: "success",
        timer: 2000,
        confirmButtonColor: "#5F8EAD",
      });

      fetchDiesel();
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e.response?.data?.message || e.message,
        icon: "error",
        confirmButtonColor: "#5F8EAD",
      });
    }
  };

  const openDetail = (id) => {
    if (!id) return;
    setSelectedDieselId(id);
    setIsModalOpen(true);
  };

  const stats = useMemo(() => {
    const pendientes = diesel.filter((r) => canonEstado(r) === ESTADOS.PENDIENTE);
    const completados = diesel.filter((r) => canonEstado(r) === ESTADOS.COMPLETADO);
    return {
      pendientesCount: pendientes.length,
      completadosCount: completados.length,
      totalPend: pendientes.reduce((acc, r) => acc + Number(pickTotal(r) || 0), 0),
      totalComp: completados.reduce((acc, r) => acc + Number(pickTotal(r) || 0), 0),
    };
  }, [diesel]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return diesel.filter((row) => {
      const estadoOk = estadoFiltro === ESTADOS.TODOS || canonEstado(row) === estadoFiltro;
      if (!estadoOk) return false;

      if (!s) return true;
      const placa = String(pickPlaca(row)).toLowerCase();
      const fechaTxt = String(formatearFecha(pickFecha(row))).toLowerCase();
      const marchamo = String(pickMarchamo(row) || "").toLowerCase(); // ✅ NUEVO: Buscar por marchamo
      return placa.includes(s) || fechaTxt.includes(s) || marchamo.includes(s);
    });
  }, [diesel, searchTerm, estadoFiltro]);

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

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = sorted.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm, sortBy, estadoFiltro]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
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
          <button
            onClick={fetchDiesel}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-lg hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalGeneral = sorted.reduce((acc, row) => acc + Number(pickTotal(row) || 0), 0);

  const estadoBadge = (estado) => {
    const e = normalize(estado);
    if (e === "completado") return "bg-[#5D9646] bg-opacity-20 text-[#5D9646] border-2 border-[#5D9646]";
    return "bg-yellow-50 text-yellow-800 border-2 border-yellow-200";
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#34353A] mb-2">Diésel</h1>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <p className="text-[#5F8EAD] text-base font-semibold">Total: {diesel.length} registros</p>
              <RoleBadge />
            </div>
            <p className="text-gray-700 font-semibold">
              Total general (filtrado): <span className="text-[#34353A]">{formatearMoneda(totalGeneral)}</span>
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setEstadoFiltro(ESTADOS.TODOS)}
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-colors ${
                estadoFiltro === ESTADOS.TODOS
                  ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white border-[#5F8EAD]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todos ({diesel.length})
            </button>

            <button
              onClick={() => setEstadoFiltro(ESTADOS.PENDIENTE)}
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-colors ${
                estadoFiltro === ESTADOS.PENDIENTE
                  ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white border-[#5F8EAD]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Pendiente ({stats.pendientesCount}) · {formatearMoneda(stats.totalPend)}
            </button>

            <button
              onClick={() => setEstadoFiltro(ESTADOS.COMPLETADO)}
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-colors ${
                estadoFiltro === ESTADOS.COMPLETADO
                  ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white border-[#5F8EAD]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Completado ({stats.completadosCount}) · {formatearMoneda(stats.totalComp)}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por placa, fecha o marchamo..." // ✅ ACTUALIZADO
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD]"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#5F8EAD]"
                >
                  <option value="newest">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                </select>
              </div>

              <button
                onClick={startTutorial}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#5F8EAD] text-[#5F8EAD] rounded-xl hover:bg-[#5F8EAD] hover:text-white font-bold shadow-lg transition-all transform hover:scale-105"
              >
                <HelpCircle size={18} />
                <span>Tutorial</span>
                {!hasCompleted && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    !
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsReportesModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5F8EAD] to-[#34353A] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg transition-all"
              >
                <Download size={18} />
                Generar Reportes
              </button>

              <ProtectedAction action="create">
                <button
                  onClick={() => navigate("/diesel/agregar")}
                  className="flex items-center gap-2 px-5 py-3 bg-[#5D9646] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg"
                >
                  <Plus size={20} />
                  Agregar Diésel
                </button>
              </ProtectedAction>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] border-b-2 border-[#5D9646]">
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">#</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Fecha</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Placa</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Marchamo</th> {/* ✅ NUEVA COLUMNA */}
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Estado</th>
                  <th className="text-right py-5 px-6 text-white font-semibold text-sm">Galones</th>
                  <th className="text-right py-5 px-6 text-white font-semibold text-sm">Total</th>
                  <th className="text-center py-5 px-6 text-white font-semibold text-sm">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, idx) => {
                  const id = row?._id || row?.id;
                  const fecha = pickFecha(row);
                  const placa = pickPlaca(row);
                  const galones = pickGalones(row);
                  const total = pickTotal(row);
                  const estado = canonEstado(row);
                  const marchamo = pickMarchamo(row); // ✅ NUEVO
                  const isCompletado = estado === ESTADOS.COMPLETADO;

                  return (
                    <tr
                      key={id || idx}
                      onClick={() => openDetail(id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-5 px-6 text-gray-700 font-semibold">{startIndex + idx + 1}</td>
                      <td className="py-5 px-6 text-[#34353A] font-semibold">{formatearFecha(fecha)}</td>
                      <td className="py-5 px-6 text-gray-600">{placa}</td>

                      {/* ✅ NUEVA CELDA: Marchamo */}
                      <td className="py-5 px-6 text-gray-600">
                        {marchamo ? (
                          <span className="inline-flex px-2 py-1 bg-[#5F8EAD] bg-opacity-10 text-[#5F8EAD] rounded-lg text-xs font-semibold">
                            {marchamo}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin marchamo</span>
                        )}
                      </td>

                      <td className="py-5 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge(estado)}`}>
                          {estado}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right text-[#34353A] font-semibold">{formatearNumero(galones)}</td>
                      <td className="py-5 px-6 text-right font-bold text-[#34353A]">{formatearMoneda(total)}</td>

                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => descargarReporteIndividual(id)}
                            className="p-2 rounded-lg bg-[#5F8EAD] bg-opacity-20 hover:bg-[#5F8EAD] hover:bg-opacity-30 text-[#5F8EAD] transition-all hover:scale-110"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>

                          {!isCompletado && (
                            <>
                              <ProtectedAction action="edit">
                                <button
                                  onClick={() => navigate(`/diesel/editar/${id}`)}
                                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all hover:scale-110"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                              </ProtectedAction>

                              <ProtectedAction action="edit">
                                <button
                                  onClick={() => marcarComoCompletado(row)}
                                  className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 transition-all hover:scale-110"
                                  title="Marcar como completado"
                                >
                                  <Check size={18} />
                                </button>
                              </ProtectedAction>
                            </>
                          )}

                          <ProtectedAction action="delete">
                            <button
                              onClick={() => handleDelete(row)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all hover:scale-110"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </ProtectedAction>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500"> {/* ✅ ACTUALIZADO colSpan a 8 */}
                      No hay registros para mostrar.
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
                      currentPage === page ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white" : "text-gray-700 hover:bg-gray-100"
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

      <DieselDetailModal dieselId={selectedDieselId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ReportesDieselModal isOpen={isReportesModalOpen} onClose={() => setIsReportesModalOpen(false)} apiUrl={config.api.API_URL} />
    </div>
  );
};

export default PantallaPrincipalDiesel;