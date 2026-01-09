import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  Truck,
  Fuel,
  DollarSign,
  Loader2,
  AlertCircle,
  Droplets,
} from "lucide-react";
import { config } from "../../config";

const DieselDetailModal = ({ dieselId, isOpen, onClose }) => {
  const [diesel, setDiesel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickFecha = (row) =>
    row?.fecha || row?.date || row?.createdAt || row?.fecha_diesel;

  const pickPlaca = (row) =>
    row?.CicurlationCard?.licensePlate ||
    row?.CicurlationCard?.placa ||
    row?.placa ||
    row?.licensePlate ||
    "N/A";

  const pickGalones = (row) =>
    row?.Galones ?? row?.galones ?? row?.gallons ?? row?.cantidad_galones ?? 0;

  const pickTotal = (row) =>
    row?.Total ?? row?.total ?? row?.monto ?? row?.amount ?? row?.costo_total ?? 0;

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
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

  useEffect(() => {
    if (isOpen && dieselId) {
      fetchDieselById(dieselId);
    }
  }, [isOpen, dieselId]);

  const fetchDieselById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.api.API_URL}/resumen`);
      if (!response.ok) throw new Error("Error al cargar el registro de diésel");

      const result = await response.json().catch(() => ({}));
      const rows = result.data || (Array.isArray(result) ? result : []);

      const found = rows.find((r) => String(r?._id || r?.id) === String(id));
      if (!found) throw new Error("No se encontró el registro de diésel");

      const fechaRaw = pickFecha(found);
      const fechaObj = parseLocalDate(fechaRaw);

      setDiesel({
        _id: found._id || found.id,
        fecha: fechaRaw,
        mes: found.mes || (fechaObj ? fechaObj.getMonth() + 1 : undefined),
        ano: found.ano || (fechaObj ? fechaObj.getFullYear() : undefined),
        placa: pickPlaca(found),
        galones: toNumber(pickGalones(found)),
        total: toNumber(pickTotal(found)),
      });
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = parseLocalDate(fecha);
    if (!date || Number.isNaN(date.getTime())) return String(fecha);

    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const precioPorGalon = useMemo(() => {
    if (!diesel) return 0;
    if (diesel.galones <= 0) return 0;
    return diesel.total / diesel.galones;
  }, [diesel]);

  const getHeaderColor = () => "from-[#34353A] to-[#5F8EAD]";

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mb-4" />
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
                onClick={() => fetchDieselById(dieselId)}
                className="px-6 py-2 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl hover:opacity-90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : diesel ? (
            <>
              {/* Header - SOLO COLORES CAMBIADOS */}
              <div className={`bg-gradient-to-r ${getHeaderColor()} px-8 py-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white bg-opacity-30 p-2 rounded-xl backdrop-blur-sm border border-white border-opacity-40">
                        <Fuel className="text-white drop-shadow-lg" size={24} />
                      </div>
                      <span className="text-white text-sm font-black px-4 py-1.5 bg-white bg-opacity-30 rounded-lg backdrop-blur-sm border border-white border-opacity-40 drop-shadow-lg">
                        Registro de Diésel
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      Detalle de Diésel
                    </h2>
                    <p className="text-white font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      ID: {String(diesel._id || "").slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="bg-white bg-opacity-30 hover:bg-opacity-40 p-2 rounded-xl transition-all backdrop-blur-sm border border-white border-opacity-40"
                  >
                    <X className="text-white drop-shadow-lg" size={24} />
                  </button>
                </div>
              </div>

              {/* Content - SOLO COLORES CAMBIADOS */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6">
                {/* Fecha + Camión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD] shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#5F8EAD] bg-opacity-20 p-2.5 rounded-xl">
                        <Calendar className="text-[#5F8EAD]" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Fecha</p>
                        <p className="text-[#34353A] font-bold capitalize">{formatearFecha(diesel.fecha)}</p>
                        <p className="text-[#5F8EAD] text-sm font-medium mt-1">
                          {diesel.mes && diesel.ano ? `${diesel.mes}/${diesel.ano}` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646] shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#5D9646] bg-opacity-20 p-2.5 rounded-xl">
                        <Truck className="text-[#5D9646]" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Camión</p>
                        <p className="text-[#34353A] font-bold">{diesel.placa || "N/A"}</p>
                        <p className="text-[#5D9646] text-sm font-medium mt-1">Placa registrada</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Galones + Precio/galón */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646] shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#5D9646] bg-opacity-20 p-2.5 rounded-xl">
                        <Droplets className="text-[#5D9646]" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Galones</p>
                        <p className="text-[#34353A] font-bold text-2xl">{diesel.galones.toFixed(2)}</p>
                        <p className="text-[#5D9646] text-sm font-medium mt-1">Cantidad cargada</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD] shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#5F8EAD] bg-opacity-20 p-2.5 rounded-xl">
                        <DollarSign className="text-[#5F8EAD]" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Precio/galón</p>
                        <p className="text-[#34353A] font-bold text-xl">{formatearMoneda(precioPorGalon)}</p>
                        <p className="text-[#5F8EAD] text-sm font-medium mt-1">Estimado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-30 p-3 rounded-xl backdrop-blur-sm">
                        <DollarSign className="text-white drop-shadow-lg" size={28} />
                      </div>
                      <div>
                        <p className="text-white text-opacity-90 text-sm font-semibold drop-shadow-md">Total del Registro</p>
                        <p className="text-white text-4xl font-black drop-shadow-lg">{formatearMoneda(diesel.total)}</p>
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

export default DieselDetailModal;