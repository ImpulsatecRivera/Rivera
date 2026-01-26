import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  RefreshCw,
  Truck,
  User,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  Edit2,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";
import { api } from "../../Context/authContext";

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

const parseDateLocal = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("T")[0].split("-");
  if (!year || !month || !day) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const formatearFechaCompleta = (fecha) => {
  if (!fecha) return "N/A";
  const d = typeof fecha === "string" ? parseDateLocal(fecha) : new Date(fecha);
  if (!d || Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

// Función para formatear hora de salida
const formatearHoraSalida = (viaje) => {
  const horaSalida = viaje?.horaSalida || viaje?.hora_salida || viaje?.hora || viaje?.departureTime;
  
  if (!horaSalida) return "N/A";
  
  if (typeof horaSalida === 'string' && horaSalida.includes(':')) {
    return horaSalida;
  }
  
  try {
    const fecha = new Date(horaSalida);
    if (!isNaN(fecha.getTime())) {
      return fecha.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      });
    }
  } catch (e) {
    console.error('Error formateando hora:', e);
  }
  
  return horaSalida.toString();
};

// Función para obtener la placa del camión
// En la función obtenerPlacaCamion, cambia a esto:

const obtenerPlacaCamion = (viaje) => {
  console.log('=== DEBUG FINAL ===');
  console.log('Viaje completo:', JSON.stringify(viaje, null, 2));
  console.log('viaje.placa:', viaje?.placa);
  console.log('==================');
  
  return viaje?.placa || "Sin placa";
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

    const url = `${PROGRAMACION_ENDPOINT}/${fecha}`;
    console.log('🌐 URL COMPLETA QUE ESTOY LLAMANDO:', url);
    console.log('🌐 config.api.API_URL:', config.api.API_URL);
    console.log('🌐 PROGRAMACION_ENDPOINT:', PROGRAMACION_ENDPOINT);

    const response = await api.get(`${PROGRAMACION_ENDPOINT}/${fecha}`);
    const data = response.data?.data || {};
    const prog = data?.programacion || [];

    setProgramacion(Array.isArray(prog) ? prog : []);
    setFechaInfo(data?.fecha || "");
    setTotalViajes(data?.totalViajes || 0);
    setTotalClientes(data?.totalClientes || 0);
  } catch (e) {
    setError(e.response?.data?.message || e.message || "Error al cargar");
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

  const handleDownloadReporte = async () => {
    if (!selectedDate) {
      Swal.fire({
        icon: "warning",
        title: "Fecha requerida",
        text: "Selecciona una fecha para descargar el reporte",
      });
      return;
    }

    try {
      const url = `${config.api.API_URL}/reportes-directos/diario/${selectedDate}`;
      const response = await api.get(url, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `reporte-diario-viajes-${selectedDate}.pdf`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      Swal.fire({
        icon: "success",
        title: "Descarga exitosa",
        text: "El reporte diario se ha descargado correctamente",
        timer: 2000,
      });
    } catch (error) {
      console.error("Error descargando reporte:", error);
      const isNoData = error.response?.status === 404;
      Swal.fire({
        icon: isNoData ? "warning" : "error",
        title: isNoData ? "Sin datos" : "Error",
        text: error.response?.data?.message || "No se pudo descargar el reporte",
      });
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
        await api.put(`${COMPLETAR_UNO_ENDPOINT}/${viajeId}`, {
          observacion: "Viaje completado desde programación",
        });

        await Swal.fire({
          title: "¡Completado!",
          text: "Viaje marcado como completado",
          icon: "success",
          timer: 1500,
        });
      } else {
        await api.patch(`${ACTUALIZAR_ESTADO_ENDPOINT}/${viajeId}`, {
          estado: nuevoEstado,
        });

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
    if (e === "pendiente") return ["en_curso", "completado", "cancelado"];
    if (e === "en_curso" || e === "en curso") return ["completado"];
    if (e === "completado") return [];
    if (e === "cancelado") return [];
    return ["pendiente", "en_curso", "completado", "cancelado"];
  };

  const cerrarModalEstado = () => {
    setEditandoEstado(null);
  };

  const viajesPorTipo = useMemo(() => {
    const grupos = {
      ruta: [],
      descarga: [],
      descargaTransito: [],
      descargaSanMiguel: [],
    };

    programacion.forEach((clienteGroup) => {
      const nombreCliente = clienteGroup?.cliente || "Cliente N/A";
      const viajes = clienteGroup?.viajes || [];

      viajes.forEach((viaje) => {
        const ruta = (viaje?.ruta || "").toLowerCase();
        const viajeConCliente = {
          ...viaje,
          clienteNombre: nombreCliente,
        };

        if (ruta.includes("ruta") || ruta.includes("diaya")) {
          grupos.ruta.push(viajeConCliente);
        } else if (ruta.includes("descarga") && ruta.includes("transito")) {
          grupos.descargaTransito.push(viajeConCliente);
        } else if (ruta.includes("descarga") && ruta.includes("san miguel")) {
          grupos.descargaSanMiguel.push(viajeConCliente);
        } else if (ruta.includes("descarga")) {
          grupos.descarga.push(viajeConCliente);
        } else {
          grupos.ruta.push(viajeConCliente);
        }
      });
    });

    const agruparPorCliente = (viajes) => {
      const clientesMap = {};
      
      viajes.forEach((viaje) => {
        const cliente = viaje.clienteNombre;
        if (!clientesMap[cliente]) {
          clientesMap[cliente] = [];
        }
        clientesMap[cliente].push(viaje);
      });

      Object.keys(clientesMap).forEach((cliente) => {
        clientesMap[cliente].sort((a, b) => {
          const horaA = formatearHoraSalida(a);
          const horaB = formatearHoraSalida(b);
          return horaA.localeCompare(horaB);
        });
      });

      return clientesMap;
    };

    return {
      ruta: agruparPorCliente(grupos.ruta),
      descarga: agruparPorCliente(grupos.descarga),
      descargaTransito: agruparPorCliente(grupos.descargaTransito),
      descargaSanMiguel: agruparPorCliente(grupos.descargaSanMiguel),
    };
  }, [programacion]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/viajesInternos")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                Programación {formatearFechaCompleta(selectedDate)}
              </h1>
              <p className="text-gray-600">Vista tipo pizarra</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Actualizar
              </button>

              <button
                onClick={handleDownloadReporte}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={18} />
                Reporte Diario
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border-4 border-gray-300">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando programación...</p>
          </div>
        )}

        {/* Pizarra Digital */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 border-8 border-gray-400" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}>
            {/* Título */}
            <div className="mb-8 pb-4 border-b-4 border-red-600">
              <h2 className="text-4xl sm:text-5xl font-bold text-red-600 text-center" style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}>
                Programicio {formatearFechaCompleta(selectedDate)}
              </h2>
            </div>

            {programacion.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-2xl font-semibold">
                  No hay viajes programados
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* RUTA */}
                {Object.keys(viajesPorTipo.ruta).length > 0 && (
                  <div>
                    <div className="mb-4 pb-2 border-b-4 border-blue-600">
                      <h3 className="text-4xl font-bold text-blue-600 flex items-center gap-2">
                        <span>RUTA:</span>
                        <span className="text-2xl text-blue-500">→</span>
                      </h3>
                    </div>
                    
                    {Object.entries(viajesPorTipo.ruta).map(([cliente, viajes]) => (
                      <div key={cliente} className="mb-6 pl-4">
                        <div className="mb-2">
                          <h4 className="text-2xl font-bold text-gray-800 underline decoration-blue-400 decoration-2">
                            {cliente}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 pl-4">
                         

{viajes.map((viaje, idx) => {
  const placa = obtenerPlacaCamion(viaje);
  
  // 🔥 NUEVO: Obtener auxiliares
  const auxiliares = viaje?.auxiliares || [];
  const nombresConductor = viaje?.conductor || "Sin conductor";
  
  return (
    <div 
      key={viaje?.id || idx} 
      className="flex items-center gap-3 text-xl font-semibold text-gray-800 group hover:bg-blue-50 p-2 rounded transition-colors"
    >
      <span className="text-blue-600 font-mono">{placa}</span>
      <span className="text-gray-600">{formatearHoraSalida(viaje)}</span>
      
      {/* 🔥 CONDUCTOR + AUXILIARES */}
      <div className="flex flex-col gap-0.5">
        <span className="text-gray-900">{nombresConductor}</span>
        {auxiliares.length > 0 && (
          <span className="text-sm text-green-700 italic">
            + {auxiliares.map(aux => aux.nombre || aux.name || 'Aux').join(', ')}
          </span>
        )}
      </div>
      
      <span className="text-sm text-gray-500">{viaje?.destino || ""}</span>
      
      <button
        onClick={() => handleCambiarEstado(viaje, cliente)}
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 size={16} className="text-blue-600" />
      </button>
    </div>
  );
})}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DESCARGA */}
                {Object.keys(viajesPorTipo.descarga).length > 0 && (
                  <div>
                    <div className="mb-4 pb-2 border-b-4 border-red-600">
                      <h3 className="text-4xl font-bold text-red-600">DESCARGA</h3>
                    </div>
                    
                    {Object.entries(viajesPorTipo.descarga).map(([cliente, viajes]) => (
                      <div key={cliente} className="mb-6 pl-4">
                        <div className="mb-2">
                          <h4 className="text-2xl font-bold text-gray-800 underline decoration-red-400 decoration-2">
                            {cliente}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 pl-4">
                          {viajes.map((viaje, idx) => {
                            const placa = obtenerPlacaCamion(viaje);
                            
                            return (
                              <div 
                                key={viaje?.id || idx} 
                                className="flex items-center gap-3 text-xl font-semibold text-gray-800 group hover:bg-red-50 p-2 rounded transition-colors"
                              >
                                <span className="text-red-600 font-mono">{placa}</span>
                                <span className="text-gray-600">{formatearHoraSalida(viaje)}</span>
                                <span>{viaje?.conductor || "Sin conductor"}</span>
                                <span className="text-sm text-gray-500">{viaje?.destino || ""}</span>
                                
                                <button
                                  onClick={() => handleCambiarEstado(viaje, cliente)}
                                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DESCARGA/TRANSITO */}
                {Object.keys(viajesPorTipo.descargaTransito).length > 0 && (
                  <div>
                    <div className="mb-4 pb-2 border-b-4 border-green-600">
                      <h3 className="text-4xl font-bold text-green-600">DESCARGA/TRANSITO</h3>
                    </div>
                    
                    {Object.entries(viajesPorTipo.descargaTransito).map(([cliente, viajes]) => (
                      <div key={cliente} className="mb-6 pl-4">
                        <div className="mb-2">
                          <h4 className="text-2xl font-bold text-gray-800 underline decoration-green-400 decoration-2">
                            {cliente}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 pl-4">
                          {viajes.map((viaje, idx) => {
                            const placa = obtenerPlacaCamion(viaje);
                            
                            return (
                              <div 
                                key={viaje?.id || idx} 
                                className="flex items-center gap-3 text-xl font-semibold text-gray-800 group hover:bg-green-50 p-2 rounded transition-colors"
                              >
                                <span className="text-green-600 font-mono">{placa}</span>
                                <span className="text-gray-600">{formatearHoraSalida(viaje)}</span>
                                <span>{viaje?.conductor || "Sin conductor"}</span>
                                <span className="text-sm text-gray-500">{viaje?.destino || ""}</span>
                                
                                <button
                                  onClick={() => handleCambiarEstado(viaje, cliente)}
                                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 size={16} className="text-green-600" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DESCARGA/SAN MIGUEL */}
                {Object.keys(viajesPorTipo.descargaSanMiguel).length > 0 && (
                  <div>
                    <div className="mb-4 pb-2 border-b-4 border-purple-600">
                      <h3 className="text-4xl font-bold text-purple-600">DESCARGA/SAN MIGUEL</h3>
                    </div>
                    
                    {Object.entries(viajesPorTipo.descargaSanMiguel).map(([cliente, viajes]) => (
                      <div key={cliente} className="mb-6 pl-4">
                        <div className="mb-2">
                          <h4 className="text-2xl font-bold text-gray-800 underline decoration-purple-400 decoration-2">
                            {cliente}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 pl-4">
                          {viajes.map((viaje, idx) => {
                            const placa = obtenerPlacaCamion(viaje);
                            
                            return (
                              <div 
                                key={viaje?.id || idx} 
                                className="flex items-center gap-3 text-xl font-semibold text-gray-800 group hover:bg-purple-50 p-2 rounded transition-colors"
                              >
                                <span className="text-purple-600 font-mono">{placa}</span>
                                <span className="text-gray-600">{formatearHoraSalida(viaje)}</span>
                                <span>{viaje?.conductor || "Sin conductor"}</span>
                                <span className="text-sm text-gray-500">{viaje?.destino || ""}</span>
                                
                                <button
                                  onClick={() => handleCambiarEstado(viaje, cliente)}
                                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 size={16} className="text-purple-600" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Cambiar Estado */}
      {editandoEstado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cambiar Estado</h3>
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
                      No se puede cambiar el estado actual: <span className="text-blue-600">{getEstadoConfig(estadoActual).label}</span>
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

                    return (
                      <button
                        key={estado.value}
                        onClick={() => confirmarCambioEstado(estado.value)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-400"
                      >
                        <Icono size={20} />
                        <span>{estado.label}</span>
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