import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  Calendar,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";
import ReportesViajesOperativosModal from "./ReportesViajesInternosModal";
import { api } from "../../Context/authContext";
import ViajeOperativoDetailModal from "./ViajeOperativoDetailModal";

import { useTutorial } from '../../hooks/useTutorial';
import '../../styles/tutorial-global.css';
import { HelpCircle } from 'lucide-react';

const ESTADOS = {
  TODOS: "Todos",
  PENDIENTE: "Pendiente",
  EN_CURSO: "En Curso",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const normalize = (v) => String(v ?? "").trim().toLowerCase();

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha ? String(fecha) : "N/A";
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatearMoneda = (cantidad) => {
  const n = Number(cantidad || 0);
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
};

const getRawEstado = (row) => {
  const raw = row?.estado?.actual ?? row?.estado ?? row?.status ?? row?.estatus ?? null;

  if (raw && typeof raw === "object") {
    return raw?.nombre ?? raw?.name ?? raw?.label ?? raw?.actual ?? null;
  }

  return raw;
};

const canonEstado = (row) => {
  const raw = getRawEstado(row) ?? "PENDIENTE";
  const e = normalize(raw);

  if (["cancelado", "canceled", "cancelled", "anulado"].includes(e)) return ESTADOS.CANCELADO;
  if (["completado", "completed", "done", "finalizado", "terminado"].includes(e))
    return ESTADOS.COMPLETADO;
  if (["en_curso", "en curso", "enruta", "en_ruta", "en ruta", "in_route"].includes(e))
    return ESTADOS.EN_CURSO;

  return ESTADOS.PENDIENTE;
};

const estadoBadgeClass = (estado) => {
  const e = normalize(estado);
  if (e === "completado") return "bg-[#5D9646] bg-opacity-20 text-[#5D9646] border-2 border-[#5D9646]";
  if (e === "en curso") return "bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] border-2 border-[#5F8EAD]";
  if (e === "cancelado") return "bg-red-50 text-red-700 border-2 border-red-200";
  return "bg-yellow-50 text-yellow-800 border-2 border-yellow-200";
};

export default function PantallaPrincipalViajesOperativos() {
  const navigate = useNavigate();

  const { startTutorial, hasCompleted } = useTutorial('viajesInternos');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viajes, setViajes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(ESTADOS.TODOS);

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isReportesOpen, setIsReportesOpen] = useState(false);
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchViajes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get('/viajes-operativos/listar');
      const rows = data?.data || (Array.isArray(data) ? data : []);
      setViajes(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const handleCompletarTodos = async () => {
    const result = await Swal.fire({
      title: "¿Completar todos los viajes operativos?",
      text: "Se marcarán como completados todos los viajes pendientes o en curso",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, completar todos",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#5D9646",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await api.put('/viajes-operativos/completar-todos');

      if (!data?.success) {
        throw new Error(data?.message || "Error al completar viajes");
      }

      await Swal.fire({
        title: "¡Completados!",
        text: data?.message || "Viajes completados exitosamente",
        icon: "success",
        timer: 2000,
      });

      fetchViajes();
    } catch (err) {
      Swal.fire({ 
        title: "Error", 
        text: err.response?.data?.message || err.message, 
        icon: "error" 
      });
    }
  };

  const handleCompletarUno = async (e, row) => {
    e.stopPropagation();

    const id = row?._id || row?.id;
    if (!id) return;

    const result = await Swal.fire({
      title: "¿Completar este viaje?",
      text: `Se marcará como completado: ${row?.rutaDirecta?.rutaCompleta || "Viaje"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, completar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#5D9646",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await api.put(`/viajes-operativos/completar/${id}`, {
        observacion: "Viaje completado manualmente desde el panel",
      });

      if (!data?.success) {
        throw new Error(data?.message || "Error al completar");
      }

      await Swal.fire({
        title: "¡Completado!",
        text: "Viaje marcado como completado",
        icon: "success",
        timer: 1500,
      });

      fetchViajes();
    } catch (err) {
      Swal.fire({ 
        title: "Error", 
        text: err.response?.data?.message || err.message, 
        icon: "error" 
      });
    }
  };

  const handleDescargarPDF = async (e, row) => {
    e.stopPropagation();

    const clienteNombre = row?.clienteNombre || "";

    if (!clienteNombre) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el nombre del cliente",
      });
      return;
    }

    const fechaSalida = new Date(row?.departureTime);
    const mes = fechaSalida.getMonth() + 1;
    const año = fechaSalida.getFullYear();

    try {
      Swal.fire({
        title: "Descargando PDF...",
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const url = `/reportes-directos/individual/${encodeURIComponent(clienteNombre)}/${mes}/${año}`;
      const nombreArchivo = `reporte-${clienteNombre}-${mes}-${año}.pdf`;

      console.log("📄 Descargando PDF desde:", url);

      const response = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      Swal.close();

      await Swal.fire({
        title: "¡Descargado!",
        text: `PDF generado: ${nombreArchivo}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error descargando PDF:", error);
      Swal.close();
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message || "No se pudo generar el PDF",
        icon: "error",
      });
    }
  };

  const handleVerDetalle = (row) => {
    const id = row?._id || row?.id;
    if (!id) return;
    setSelectedViajeId(id);
    setIsDetailOpen(true);
  };

  const handleEdit = (e, row) => {
    e.stopPropagation();
    const id = row?._id || row?.id;

    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID del viaje para editar.",
      });
      return;
    }

    navigate(`/viajesOperativos/editar/${String(id)}`);
  };

  const handleOpcionesViaje = async (e, row) => {
    e.stopPropagation();

    const id = row?._id || row?.id;
    if (!id) return;

    const estado = canonEstado(row);
    const esCompletado = normalize(estado) === "completado";

    // Si está completado, solo permitir cancelar
    if (esCompletado) {
      const result = await Swal.fire({
        title: "¿Cancelar este viaje?",
        text: `Se marcará como cancelado: ${row?.rutaDirecta?.rutaCompleta || "Viaje"}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
        confirmButtonColor: "#ef4444",
      });

      if (!result.isConfirmed) return;

      try {
        const { data } = await api.patch(`/viajes-operativos/actualizar-estado/${id}`, {
          estado: "cancelado",
        });

        if (!data?.success) {
          throw new Error(data?.message || "Error al cancelar");
        }

        await Swal.fire({
          title: "¡Cancelado!",
          text: "Viaje marcado como cancelado",
          icon: "success",
          timer: 1500,
        });

        fetchViajes();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || err.message,
          icon: "error",
        });
      }
      return;
    }

    // Si NO está completado, mostrar ambas opciones
    const result = await Swal.fire({
      title: "¿Qué deseas hacer?",
      text: `Viaje: ${row?.rutaDirecta?.rutaCompleta || "N/A"}`,
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "Eliminar viaje",
      denyButtonText: "Cancelar viaje",
      confirmButtonColor: "#dc2626",
      denyButtonColor: "#ef4444",
    });

    // Si elige eliminar
    if (result.isConfirmed) {
      const confirmDelete = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará permanentemente el viaje y no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
      });

      if (!confirmDelete.isConfirmed) return;

      try {
        // Intentar eliminar con la ruta general de viajes
        const { data } = await api.delete(`/viajes/${id}`);

        if (!data?.success) {
          throw new Error(data?.message || "Error al eliminar");
        }

        await Swal.fire({
          title: "¡Eliminado!",
          text: "Viaje eliminado permanentemente",
          icon: "success",
          timer: 1500,
        });

        fetchViajes();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || err.message,
          icon: "error",
        });
      }
    }
    // Si elige cancelar
    else if (result.isDenied) {
      try {
        const { data } = await api.patch(`/viajes-operativos/actualizar-estado/${id}`, {
          estado: "cancelado",
        });

        if (!data?.success) {
          throw new Error(data?.message || "Error al cancelar");
        }

        await Swal.fire({
          title: "¡Cancelado!",
          text: "Viaje marcado como cancelado",
          icon: "success",
          timer: 1500,
        });

        fetchViajes();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || err.message,
          icon: "error",
        });
      }
    }
  };

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return viajes.filter((row) => {
      const est = canonEstado(row);
      const estadoOk = estadoFiltro === ESTADOS.TODOS || est === estadoFiltro;
      if (!estadoOk) return false;

      if (!s) return true;

      const cliente = row?.clienteNombre || "";
      const origen = row?.rutaDirecta?.origen?.nombre || "";
      const destino = row?.rutaDirecta?.destino?.nombre || "";
      const rutaCompleta = row?.rutaDirecta?.rutaCompleta || "";
      const codigo = row?.codigoProgramacion || row?.numeroViajeGlobal || "";

      return (
        String(cliente).toLowerCase().includes(s) ||
        String(origen).toLowerCase().includes(s) ||
        String(destino).toLowerCase().includes(s) ||
        String(rutaCompleta).toLowerCase().includes(s) ||
        String(codigo).toLowerCase().includes(s)
      );
    });
  }, [viajes, searchTerm, estadoFiltro]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const fa = a?.departureTime || a?.createdAt;
      const fb = b?.departureTime || b?.createdAt;

      const ta = new Date(fa).getTime() || 0;
      const tb = new Date(fb).getTime() || 0;

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
          <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando viajes operativos...</p>
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
          <button
            onClick={fetchViajes}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-lg hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tabs = [ESTADOS.TODOS, ESTADOS.PENDIENTE, ESTADOS.EN_CURSO, ESTADOS.COMPLETADO];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-bold text-[#34353A] mb-1">Viajes Operativos</h1>
            <p className="text-gray-500">Gestión de viajes operativos para clientes corporativos</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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
              onClick={() => navigate("/viajesInternos/programacion")}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 font-semibold shadow-sm"
            >
              <Calendar size={20} />
              Programación
            </button>

            <button
              onClick={startTutorial}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#5F8EAD] text-[#5F8EAD] rounded-xl hover:bg-[#5F8EAD] hover:text-white font-bold shadow-lg transition-all transform hover:scale-105"
            >
              <HelpCircle size={20} />
              <span>Tutorial</span>
              {!hasCompleted && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  !
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/viajesInternos/agregar")}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg"
            >
              <Plus size={20} />
              Programar Viaje
            </button>
          </div>
        </div>

        {/* Tabs Estados */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {tabs.map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setEstadoFiltro(est)}
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-colors ${
                estadoFiltro === est
                  ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white border-[#5F8EAD]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        {/* Búsqueda y Ordenar */}
        <div className="bg-white rounded-2xl shadow-md mb-6 mt-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por cliente, ruta, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#5F8EAD]"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] border-b-2 border-[#5D9646]">
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">#</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">
                    Código
                  </th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">
                    Cliente
                  </th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">
                    Ruta
                  </th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">
                    Salida
                  </th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">
                    Estado
                  </th>
                  <th className="text-right py-5 px-6 text-white font-semibold text-sm">
                    Monto
                  </th>
                  <th className="text-center py-5 px-6 text-white font-semibold text-sm">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, idx) => {
                  const id = row?._id || row?.id;
                  const codigo = row?.codigoProgramacion || row?.numeroViajeGlobal || "N/A";
                  const cliente = row?.clienteNombre || "N/A";
                  const ruta = row?.rutaDirecta?.rutaCompleta || "N/A";
                  const salida = row?.departureTime;
                  const estado = canonEstado(row);
                  const monto = row?.montoAcordado ?? 0;

                  const esCompletado = normalize(estado) === "completado";
                  const esCancelado = normalize(estado) === "cancelado";
                  const puedeCompletar = !esCompletado && !esCancelado;

                  return (
                    <tr
                      key={String(id || idx)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleVerDetalle(row)}
                    >
                      <td className="py-5 px-6 text-gray-700 font-semibold">
                        {startIndex + idx + 1}
                      </td>

                      <td className="py-5 px-6 text-[#34353A] font-semibold">{codigo}</td>

                      <td className="py-5 px-6 text-gray-700">{cliente}</td>
                      <td className="py-5 px-6 text-gray-700">{ruta}</td>

                      <td className="py-5 px-6 text-[#34353A] text-sm">
                        {formatearFecha(salida)}
                      </td>

                      <td className="py-5 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${estadoBadgeClass(
                            estado
                          )}`}
                        >
                          {estado}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right font-bold text-[#34353A]">
                        {formatearMoneda(monto)}
                      </td>

                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleDescargarPDF(e, row)}
                            className="p-2 rounded-lg bg-[#5F8EAD] bg-opacity-20 hover:bg-[#5F8EAD] hover:bg-opacity-30 text-[#5F8EAD] transition-colors"
                            title="Descargar Reporte PDF"
                          >
                            <Download size={18} />
                          </button>

                          {puedeCompletar && (
                            <button
                              type="button"
                              onClick={(e) => handleCompletarUno(e, row)}
                              className="p-2 rounded-lg bg-[#5D9646] bg-opacity-20 hover:bg-[#5D9646] hover:bg-opacity-30 text-[#5D9646] transition-colors"
                              title="Completar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleOpcionesViaje(e, row)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar o cancelar viaje"
                            disabled={esCancelado}
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
                      No hay viajes operativos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando {sorted.length === 0 ? 0 : startIndex + 1} a{" "}
              {Math.min(endIndex, sorted.length)} de {sorted.length} registros
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
                      currentPage === page
                        ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white"
                        : "text-gray-700 hover:bg-gray-100"
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

      <ReportesViajesOperativosModal
        isOpen={isReportesOpen}
        onClose={() => setIsReportesOpen(false)}
      />

      <ViajeOperativoDetailModal
        viajeId={selectedViajeId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}