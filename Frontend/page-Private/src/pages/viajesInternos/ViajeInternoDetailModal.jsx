import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Phone,
  BadgeCheck,
  BadgeX,
  Truck,
  FileText,
  Loader2,
  AlertCircle,
  Route,
} from "lucide-react";
import { config } from "../../config";

const ViajeInternoDetailModal = ({ viajeId, isOpen, onClose }) => {
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = useMemo(
    () => `${config.api.API_URL}/viajesinternos/${viajeId}`,
    [viajeId]
  );

  useEffect(() => {
    if (isOpen && viajeId) fetchViajeById(viajeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, viajeId]);

  const fetchViajeById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.api.API_URL}/viajesinternos/${id}`);
      if (!response.ok) throw new Error("Error al cargar el viaje interno");

      const result = await response.json().catch(() => ({}));
      const data = result?.data || result;

      if (!data || typeof data !== "object") throw new Error("Respuesta inválida del servidor");
      setViaje(data);
    } catch (err) {
      setError(err.message || "Error al cargar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return String(fecha);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    return String(hora);
  };

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
  };

  const getEstadoMeta = (estadoRaw) => {
    const e = String(estadoRaw || "PENDIENTE").toUpperCase();
    if (e === "COMPLETADO") return { label: "Completado", grad: "from-emerald-600 to-teal-600" };
    if (e === "CANCELADO") return { label: "Cancelado", grad: "from-red-600 to-pink-600" };
    return { label: "Pendiente", grad: "from-indigo-600 to-purple-600" };
  };

  if (!isOpen) return null;

  const estadoMeta = getEstadoMeta(viaje?.estado);

  const clienteNombre = viaje?.clienteNombre || "N/A";
  const clienteTelefono = viaje?.clienteTelefono || "N/A";

  const fecha = viaje?.fecha || viaje?.createdAt;
  const hora = formatearHora(viaje?.hora);

  const origen = viaje?.origen?.texto || "N/A";
  const destino = viaje?.destino?.texto || "N/A";

  const monto = viaje?.monto ?? 0;

  const pagado = !!viaje?.pagado;
  const metodoPago = viaje?.metodoPago || "N/A";
  const tipoServicio = viaje?.tipoServicio || "N/A";
  const pasajeros = viaje?.pasajeros ?? 1;

  const vehiculo = viaje?.conductor?.vehiculo || "N/A";
  const conductor = viaje?.conductor?.nombre || "N/A";

  const notas = viaje?.notas || "";
  const referencias = viaje?.referencias || "";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600 font-medium">Cargando detalles...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchViajeById(viajeId)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : viaje ? (
            <>
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${estadoMeta.grad} px-8 py-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white bg-opacity-20 p-2 rounded-xl backdrop-blur-sm">
                        <Route className="text-white" size={24} />
                      </div>
                      <span className="text-white text-sm font-semibold px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                        Estado: {estadoMeta.label}
                      </span>
                      {pagado ? (
                        <span className="text-white text-sm font-semibold px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center gap-2">
                          <BadgeCheck size={16} />
                          Pagado
                        </span>
                      ) : (
                        <span className="text-white text-sm font-semibold px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center gap-2">
                          <BadgeX size={16} />
                          No pagado
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-1">Detalle de Viaje Interno</h2>
                    <p className="text-white text-opacity-80 text-sm">
                      ID: {(viaje?._id || "").slice(-8).toUpperCase()} • Viaje: {viaje?.viajeId || "N/A"}
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-xl transition-all backdrop-blur-sm"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Cliente */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 p-2.5 rounded-xl">
                        <User className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Cliente</p>
                        <p className="text-gray-900 font-bold">{clienteNombre}</p>
                        <p className="text-indigo-600 text-sm font-medium mt-1 flex items-center gap-2">
                          <Phone size={16} />
                          {clienteTelefono}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2.5 rounded-xl">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Fecha</p>
                        <p className="text-gray-900 font-bold capitalize">{formatearFecha(fecha)}</p>
                        {hora ? (
                          <p className="text-blue-600 text-sm font-medium mt-1">Hora: {hora}</p>
                        ) : (
                          <p className="text-blue-600 text-sm font-medium mt-1">Hora: N/A</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Origen */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-100 p-2.5 rounded-xl">
                        <MapPin className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Origen</p>
                        <p className="text-gray-900 font-bold">{origen}</p>
                        {viaje?.origen?.esRecurrente ? (
                          <p className="text-emerald-700 text-sm font-medium mt-1">Recurrente</p>
                        ) : (
                          <p className="text-emerald-700 text-sm font-medium mt-1">Esporádico</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2.5 rounded-xl">
                        <MapPin className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Destino</p>
                        <p className="text-gray-900 font-bold">{destino}</p>
                        {viaje?.destino?.esRecurrente ? (
                          <p className="text-orange-700 text-sm font-medium mt-1">Recurrente</p>
                        ) : (
                          <p className="text-orange-700 text-sm font-medium mt-1">Esporádico</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info secundaria */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Monto */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2.5 rounded-xl">
                        <DollarSign className="text-gray-700" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Monto</p>
                        <p className="text-gray-900 font-bold text-xl">{formatearMoneda(monto)}</p>
                        <p className="text-gray-600 text-sm font-medium mt-1">Pago: {metodoPago}</p>
                      </div>
                    </div>
                  </div>

                  {/* Servicio */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2.5 rounded-xl">
                        <Route className="text-gray-700" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Servicio</p>
                        <p className="text-gray-900 font-bold">{tipoServicio}</p>
                        <p className="text-gray-600 text-sm font-medium mt-1">Pasajeros: {pasajeros}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conductor/Vehículo */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2.5 rounded-xl">
                        <Truck className="text-gray-700" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Vehículo</p>
                        <p className="text-gray-900 font-bold">{vehiculo}</p>
                        <p className="text-gray-600 text-sm font-medium mt-1">Conductor: {conductor}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas / Referencias */}
                {(notas || referencias) && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-200 p-2 rounded-xl">
                        <FileText className="text-gray-700" size={20} />
                      </div>
                      <div className="w-full">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                          Notas y referencias
                        </p>
                        {notas && (
                          <div className="mb-3">
                            <p className="text-gray-700 font-semibold text-sm mb-1">Notas</p>
                            <p className="text-gray-800 leading-relaxed">{notas}</p>
                          </div>
                        )}
                        {referencias && (
                          <div>
                            <p className="text-gray-700 font-semibold text-sm mb-1">Referencias</p>
                            <p className="text-gray-800 leading-relaxed">{referencias}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer monto grande */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <DollarSign className="text-white" size={28} />
                      </div>
                      <div>
                        <p className="text-white text-opacity-90 text-sm font-medium">Total del Viaje</p>
                        <p className="text-white text-4xl font-bold">{formatearMoneda(monto)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ViajeInternoDetailModal;
