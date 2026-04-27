import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  Truck,
  User,
  Users,
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle,
  ClipboardList,
  FileText,
} from "lucide-react";
import { api } from "../../Context/authContext";

const ViajeOperativoDetailModal = ({ viajeId, isOpen, onClose }) => {
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && viajeId) {
      fetchViajeById(viajeId);
    }
  }, [isOpen, viajeId]);

  const fetchViajeById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/viajes/${encodeURIComponent(id)}`);
      const data = response.data?.data || response.data;

      if (!data) throw new Error("Viaje no encontrado");

      setViaje(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cargar el detalle del viaje"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearMoneda = (n) =>
    new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(n || 0);

  const auxiliares = useMemo(() => {
    const list = Array.isArray(viaje?.auxiliares) ? viaje.auxiliares : [];
    return list
      .map((a) => a?.auxiliarId)
      .filter(Boolean)
      .map((a) =>
        `${a.name || a.nombre || ""} ${a.lastName || a.apellido || ""}`.trim()
      )
      .filter(Boolean);
  }, [viaje]);

  if (!isOpen) return null;

  const cliente = viaje?.clienteNombre || viaje?.clienteOperativo?.nombre || "N/A";
  const rutaCompleta =
    viaje?.rutaDirecta?.rutaCompleta || viaje?.rutaCompleta || "N/A";
  const origen = viaje?.rutaDirecta?.origen?.nombre || viaje?.rutaOrigen || "N/A";
  const destino =
    viaje?.rutaDirecta?.destino?.nombre || viaje?.rutaDestino || "N/A";
  const estado = viaje?.estado?.actual || viaje?.estado || "pendiente";
  const metodoPago =
    viaje?.metodoPago || viaje?.facturacion?.metodoPago || "N/A";
  const esViajeExtra = viaje?.esViajeExtra === true;
  const montosExtraPersonal = Array.isArray(viaje?.montosExtraPersonal)
    ? viaje.montosExtraPersonal
    : [];
  const participantesExtras = montosExtraPersonal.map((item) => {
    const empleadoRaw = item?.empleadoId;
    const empleadoId = String(empleadoRaw?._id || empleadoRaw?.id || empleadoRaw || "");
    if (!empleadoId) return null;

    let nombre = empleadoRaw?.name || empleadoRaw?.nombre || `Empleado ${empleadoId.slice(-6)}`;

    if (viaje?.conductorId && String(viaje.conductorId._id || viaje.conductorId.id || viaje.conductorId) === empleadoId) {
      nombre = `${viaje.conductorId.name || viaje.conductorId.nombre || ""} ${viaje.conductorId.lastName || viaje.conductorId.apellido || ""}`.trim() || "Motorista";
    } else if (Array.isArray(viaje?.auxiliares)) {
      const auxiliarEncontrado = viaje.auxiliares.find((aux) => {
        const auxId = aux?.auxiliarId;
        return auxId && String(auxId._id || auxId.id || auxId) === empleadoId;
      });

      if (auxiliarEncontrado?.auxiliarId) {
        const auxId = auxiliarEncontrado.auxiliarId;
        nombre = `${auxId.name || auxId.nombre || ""} ${auxId.lastName || auxId.apellido || ""}`.trim() || "Auxiliar";
      }
    }

    const monto = Number(item?.monto || 0);

    return {
      id: empleadoId,
      nombre,
      monto,
      asignado: monto > 0,
    };
  }).filter(Boolean);
  let resumenMontoExtra = 'Este viaje no fue marcado como extra';
  if (esViajeExtra) {
    resumenMontoExtra = montosExtraPersonal.length > 0
      ? `Total extra distribuido en ${montosExtraPersonal.length} empleado(s)`
      : 'Monto seleccionado para planilla semanal';
  }
  const montoExtraViaje = montosExtraPersonal.length > 0
    ? montosExtraPersonal.reduce((sum, item) => sum + Number(item?.monto || 0), 0)
    : Number(viaje?.cantidadViajesExtra || 0);
  const camion =
    viaje?.truckId?.licensePlate ||
    viaje?.truckId?.placa ||
    viaje?.truck?.licensePlate ||
    viaje?.truck?.placa ||
    "N/A";
  const motorista = viaje?.conductorId
    ? `${viaje.conductorId.name || viaje.conductorId.nombre || ""} ${
        viaje.conductorId.lastName || viaje.conductorId.apellido || ""
      }`.trim()
    : "N/A";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] px-8 py-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="text-white" />
                <span className="text-white font-black">Detalle del Viaje</span>
              </div>
              <h2 className="text-3xl font-black text-white">Viaje Operativo</h2>
            </div>

            <button onClick={onClose}>
              <X className="text-white" size={26} />
            </button>
          </div>

          <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#5F8EAD]" size={40} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-red-800 font-semibold">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {viaje && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        ID de Viaje
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">
                      {viaje?._id || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Referencia: {viaje?.numeroViajeGlobal || viaje?.codigoProgramacion || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-[#5D9646]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Cliente
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">{cliente}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        FECHA DE CARGA
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">
                      {formatearFechaHora(viaje?.departureTime)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-[#5D9646]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Ruta
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">{rutaCompleta}</p>
                    <p className="text-sm text-gray-600">
                      {origen} → {destino}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Monto
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">
                      {formatearMoneda(viaje?.montoAcordado)}
                    </p>
                    <p className="text-sm text-gray-600">Método: {metodoPago}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="text-[#5D9646]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Camión
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">{camion}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`bg-white rounded-2xl p-5 border-2 ${esViajeExtra ? 'border-emerald-500' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className={esViajeExtra ? 'text-emerald-600' : 'text-gray-500'} size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Viaje Extra
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${esViajeExtra ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {esViajeExtra ? 'Sí' : 'No'}
                    </p>
                  </div>

                  <div className={`bg-white rounded-2xl p-5 border-2 ${esViajeExtra ? 'border-emerald-500' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className={esViajeExtra ? 'text-emerald-600' : 'text-gray-500'} size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Monto Extra
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${esViajeExtra ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {esViajeExtra ? formatearMoneda(montoExtraViaje) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {resumenMontoExtra}
                    </p>
                  </div>
                </div>

                {esViajeExtra && (
                  <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="text-emerald-600" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Distribución por trabajador
                      </p>
                    </div>

                    {participantesExtras.length > 0 ? (
                      <div className="space-y-3">
                        {participantesExtras.map((persona) => (
                          <div key={persona.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
                            <div>
                              <p className="font-semibold text-[#34353A]">{persona.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {persona.asignado ? 'Monto asignado' : 'Sin monto extra asignado'}
                              </p>
                            </div>
                            <div className={`text-right font-bold ${persona.asignado ? 'text-emerald-700' : 'text-amber-600'}`}>
                              {formatearMoneda(persona.monto)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No hay montos extra individuales registrados para este viaje.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Motorista
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">{motorista}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-[#5D9646]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Auxiliares
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">
                      {auxiliares.length > 0 ? auxiliares.join(", ") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Estado
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">{estado}</p>
                  </div>
                </div>

                {(viaje?.observaciones || viaje?.condiciones?.observaciones) && (
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="text-[#5F8EAD]" size={20} />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Observaciones
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {viaje?.observaciones || viaje?.condiciones?.observaciones}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViajeOperativoDetailModal;
