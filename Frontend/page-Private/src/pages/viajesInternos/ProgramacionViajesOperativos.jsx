import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  RefreshCw,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Pause,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";

const PROGRAMACION_ENDPOINT = `${config.api.API_URL}/viajes-operativos/programacion`;
const COMPLETAR_UNO_ENDPOINT = `${config.api.API_URL}/viajes-operativos/completar`;
const ACTUALIZAR_ESTADO_ENDPOINT = `${config.api.API_URL}/viajes-operativos/actualizar-estado`;

const ESTADOS_DISPONIBLES = [
  { value: "pendiente", label: "Pendiente", icon: Clock, color: "yellow" },
  { value: "en_curso", label: "En Curso", icon: PlayCircle, color: "blue" },
  { value: "completado", label: "Completado", icon: CheckCircle, color: "green" },
  { value: "cancelado", label: "Cancelado", icon: XCircle, color: "red" },
];

const normalize = (v) => String(v ?? "").trim().toLowerCase();

const getEstadoConfig = (estado) => {
  const e = normalize(estado);
  if (e === "completado") return ESTADOS_DISPONIBLES[2];
  if (e === "en_curso" || e === "en curso") return ESTADOS_DISPONIBLES[1];
  if (e === "cancelado") return ESTADOS_DISPONIBLES[3];
  return ESTADOS_DISPONIBLES[0];
};

const getEstadoBadgeClass = (color) => {
  if (color === "green") return "bg-[#5D9646] bg-opacity-20 text-[#5D9646] border-2 border-[#5D9646]";
  if (color === "blue") return "bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] border-2 border-[#5F8EAD]";
  if (color === "red") return "bg-red-50 text-red-700 border-2 border-red-200";
  return "bg-yellow-50 text-yellow-800 border-2 border-yellow-200";
};

const parseDateLocal = (dateString) => {
  // Parsea fecha en formato YYYY-MM-DD o ISO como fecha local, no UTC
  if (!dateString) return null;
  const [year, month, day] = dateString.split("T")[0].split("-");
  if (!year || !month || !day) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const formatearHora = (fecha) => {
  if (!fecha) return "N/A";
  const d = typeof fecha === "string" ? parseDateLocal(fecha) : new Date(fecha);
  if (!d || Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const formatearFechaCompleta = (fecha) => {
  if (!fecha) return "N/A";
  const d = typeof fecha === "string" ? parseDateLocal(fecha) : new Date(fecha);
  if (!d || Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProgramacionViajesOperativos() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [programacion, setProgramacion] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [fechaInfo, setFechaInfo] = useState("");
  const [totalViajes, setTotalViajes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);

  const [editandoEstado, setEditandoEstado] = useState(null);

  const todayISO = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  useEffect(() => {
    setSelectedDate(todayISO);
  }, [todayISO]);

  useEffect(() => {
    if (selectedDate) {
      fetchProgramacion(selectedDate);
    }
  }, [selectedDate]);

  const fetchProgramacion = async (fecha) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${PROGRAMACION_ENDPOINT}/${fecha}`, {
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false)
        throw new Error(json?.message || "Error al cargar programación");

      const data = json?.data || {};
      const prog = data?.programacion || [];
      
      setProgramacion(Array.isArray(prog) ? prog : []);
      setFechaInfo(data?.fecha || "");
      setTotalViajes(data?.totalViajes || 0);
      setTotalClientes(data?.totalClientes || 0);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setProgramacion([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedDate) {
      fetchProgramacion(selectedDate);
    }
  };

  const handleCambiarEstado = (viaje, clienteNombre) => {
    setEditandoEstado({ viaje, clienteNombre });
  };

  const confirmarCambioEstado = async (nuevoEstado) => {
    if (!editandoEstado) return;

    const { viaje } = editandoEstado;
    const viajeId = viaje?.id || viaje?._id;

    if (!viajeId) {
      Swal.fire({ icon: "error", title: "Error", text: "No se encontró el ID del viaje" });
      setEditandoEstado(null);
      return;
    }

    try {
      if (nuevoEstado === "completado") {
        const res = await fetch(`${COMPLETAR_UNO_ENDPOINT}/${viajeId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            observacion: "Viaje completado desde programación",
          }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json?.success === false)
          throw new Error(json?.message || "Error al completar");

        await Swal.fire({
          title: "¡Completado!",
          text: "Viaje marcado como completado",
          icon: "success",
          timer: 1500,
        });
      } else {
        const res = await fetch(`${ACTUALIZAR_ESTADO_ENDPOINT}/${viajeId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json?.success === false)
          throw new Error(json?.message || "Error al actualizar estado");

        await Swal.fire({
          title: "¡Actualizado!",
          text: `Estado cambiado a ${getEstadoConfig(nuevoEstado).label}`,
          icon: "success",
          timer: 1500,
        });
      }

      setEditandoEstado(null);
      handleRefresh();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const getEstadosPermitidos = (estadoActual) => {
    const e = normalize(estadoActual);

    if (e === "pendiente") {
      return ["en_curso", "completado", "cancelado"];
    }

    if (e === "en_curso" || e === "en curso") {
      return ["completado"];
    }

    if (e === "completado") {
      return [];
    }

    if (e === "cancelado") {
      return [];
    }

    return ["pendiente", "en_curso", "completado", "cancelado"];
  };

  const cerrarModalEstado = () => {
    setEditandoEstado(null);
  };

  const viajesPorHora = useMemo(() => {
    const grupos = {};

    programacion.forEach((clienteGroup) => {
      const viajes = clienteGroup?.viajes || [];

      viajes.forEach((viaje) => {
        const hora = viaje?.hora || "00:00";
        const horaKey = hora.substring(0, 2);

        if (!grupos[horaKey]) {
          grupos[horaKey] = [];
        }

        grupos[horaKey].push({
          ...viaje,
          clienteNombre: clienteGroup?.cliente || "N/A",
        });
      });
    });

    return grupos;
  }, [programacion]);

  const horasOrdenadas = useMemo(() => {
    return Object.keys(viajesPorHora).sort();
  }, [viajesPorHora]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - COLORES CAMBIADOS */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/viajesInternos")}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Viajes Operativos
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-1">
                Programación del Día
              </h1>
              <p className="text-gray-600">Vista tipo pizarra de viajes operativos</p>
            </div>
          </div>
        </div>

        {/* Selector de Fecha + Estadísticas - COLORES CAMBIADOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Seleccionar Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="mt-7 px-4 py-3 bg-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#5F8EAD]">{totalViajes}</p>
                <p className="text-sm text-gray-600 font-medium">Viajes</p>
              </div>

              <div className="h-12 w-px bg-gray-300"></div>

              <div className="text-center">
                <p className="text-3xl font-bold text-[#5D9646]">{totalClientes}</p>
                <p className="text-sm text-gray-600 font-medium">Clientes</p>
              </div>
            </div>
          </div>

          {fechaInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-[#34353A] font-semibold">
                📅 {formatearFechaCompleta(selectedDate)}
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando programación...</p>
          </div>
        )}

        {/* Programación - COLORES CAMBIADOS */}
        {!loading && !error && (
          <>
            {horasOrdenadas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg">
                  No hay viajes programados para esta fecha
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {horasOrdenadas.map((horaKey) => {
                  const viajesHora = viajesPorHora[horaKey];

                  return (
                    <div key={horaKey} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <Clock className="text-[#5F8EAD]" size={24} />
                        <h3 className="text-2xl font-bold text-[#34353A]">
                          {horaKey}:00 hrs
                        </h3>
                        <span className="ml-auto bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] px-3 py-1 rounded-full text-sm font-semibold">
                          {viajesHora.length} viajes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viajesHora.map((viaje, idx) => {
                          const estadoConfig = getEstadoConfig(viaje?.estado);
                          const IconoEstado = estadoConfig.icon;

                          return (
                            <div
                              key={viaje?.id || idx}
                              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    {viaje?.codigo || "N/A"}
                                  </p>
                                  <h4 className="text-lg font-bold text-[#34353A]">
                                    {viaje?.clienteNombre}
                                  </h4>
                                </div>

                                <button
                                  onClick={() =>
                                    handleCambiarEstado(viaje, viaje?.clienteNombre)
                                  }
                                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getEstadoBadgeClass(
                                    estadoConfig.color
                                  )} hover:opacity-80 transition-opacity cursor-pointer`}
                                >
                                  <IconoEstado size={14} />
                                  {estadoConfig.label}
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock size={16} className="text-gray-400" />
                                  <span className="font-semibold">{viaje?.hora}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <MapPin size={16} className="text-gray-400" />
                                  <span className="font-medium">{viaje?.ruta || "N/A"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <User size={16} className="text-gray-400" />
                                  <span>{viaje?.conductor || "N/A"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Truck size={16} className="text-gray-400" />
                                  <span>{viaje?.camion || "N/A"}</span>
                                </div>

                                <div className="pt-2 mt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    Destino: <span className="font-semibold">{viaje?.destino || "N/A"}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Cambiar Estado - COLORES CAMBIADOS */}
      {editandoEstado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-[#34353A] mb-2">Cambiar Estado</h3>
            <p className="text-gray-600 mb-6">
              {editandoEstado.clienteNombre} - {editandoEstado.viaje?.ruta}
            </p>

            {(() => {
              const estadoActual = editandoEstado.viaje?.estado || "pendiente";
              const estadosPermitidos = getEstadosPermitidos(estadoActual);

              if (estadosPermitidos.length === 0) {
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                    <p className="text-gray-700 text-center font-semibold">
                      No se puede cambiar el estado actual: <span className="text-[#5F8EAD]">{getEstadoConfig(estadoActual).label}</span>
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 mb-6">
                  {ESTADOS_DISPONIBLES.filter((estado) =>
                    estadosPermitidos.includes(estado.value)
                  ).map((estado) => {
                    const Icono = estado.icon;
                    const esActual = normalize(estado.value) === normalize(estadoActual);

                    return (
                      <button
                        key={estado.value}
                        onClick={() => confirmarCambioEstado(estado.value)}
                        disabled={esActual}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                          esActual
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : `${getEstadoBadgeClass(estado.color)} hover:shadow-md cursor-pointer`
                        }`}
                      >
                        <Icono size={20} />
                        <span>{estado.label}</span>
                        {esActual && (
                          <span className="ml-auto text-xs">(Estado actual)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            <button
              onClick={cerrarModalEstado}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}