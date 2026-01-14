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

  // =========================
  // HELPERS
  // =========================
  const pickFecha = (row) =>
    row?.fecha || row?.date || row?.createdAt || row?.fecha_diesel;

  const pickPlaca = (row) =>
    row?.CicurlationCard?.licensePlate ||
    row?.CicurlationCard?.placa ||
    row?.placa ||
    row?.licensePlate ||
    "N/A";

  const pickGalones = (row) =>
    row?.Galones ?? row?.galones ?? row?.gallons ?? 0;

  const pickTotal = (row) =>
    row?.Total ?? row?.total ?? row?.monto ?? 0;

  const parseLocalDate = (fecha) => {
    if (!fecha) return null;
    const base = String(fecha).split("T")[0];
    const [y, m, d] = base.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    if (isOpen && dieselId) {
      fetchDieselById(dieselId);
    }
  }, [isOpen, dieselId]);

  const fetchDieselById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${config.api.API_URL}/resumen`, { credentials: 'include' });
      const json = await res.json();

      const found = json.data.find(
        (r) => String(r._id) === String(id)
      );

      if (!found) throw new Error("Registro no encontrado");

      const fechaRaw = pickFecha(found);
      const fechaObj = parseLocalDate(fechaRaw);

      setDiesel({
        _id: found._id,
        fecha: fechaRaw,
        mes: found.mes || (fechaObj ? fechaObj.getMonth() + 1 : null),
        ano: found.ano || (fechaObj ? fechaObj.getFullYear() : null),
        placa: pickPlaca(found),
        galones: Number(pickGalones(found)),
        total: Number(pickTotal(found)),
        comprobante: found.comprobante || null, // ✅ URL COMPLETA
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORMATTERS
  // =========================
  const formatearFecha = (fecha) => {
    const date = parseLocalDate(fecha);
    if (!date) return "N/A";
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearMoneda = (n) =>
    new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(n || 0);

  const precioPorGalon = useMemo(() => {
    if (!diesel || diesel.galones <= 0) return 0;
    return diesel.total / diesel.galones;
  }, [diesel]);

  if (!isOpen) return null;

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] px-8 py-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Fuel className="text-white" />
                <span className="text-white font-black">
                  Registro de Diésel
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">
                Detalle de Diésel
              </h2>
            </div>

            <button onClick={onClose}>
              <X className="text-white" size={26} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">

            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#5F8EAD]" />
              </div>
            )}

            {error && (
              <div className="text-center text-red-600">{error}</div>
            )}

            {diesel && (
              <>
                {/* FECHA & CAMIÓN */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <Calendar className="text-[#5F8EAD]" />
                    <p className="font-bold">{formatearFecha(diesel.fecha)}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <Truck className="text-[#5D9646]" />
                    <p className="font-bold">{diesel.placa}</p>
                  </div>
                </div>

                {/* GALONES & PRECIO */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5D9646]">
                    <Droplets className="text-[#5D9646]" />
                    <p className="text-2xl font-bold">
                      {diesel.galones.toFixed(2)} gal
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <DollarSign className="text-[#5F8EAD]" />
                    <p className="text-xl font-bold">
                      {formatearMoneda(precioPorGalon)}
                    </p>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-2xl p-6 text-white">
                  <p className="text-sm">Total</p>
                  <p className="text-4xl font-black">
                    {formatearMoneda(diesel.total)}
                  </p>
                </div>

                {/* 🧾 COMPROBANTE (MISMO ESTILO DE CARD) */}
                {diesel.comprobante && (
                  <div className="bg-white rounded-2xl p-5 border-2 border-[#5F8EAD]">
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                      Comprobante
                    </p>

                    <img
                      src={diesel.comprobante}
                      alt="Comprobante"
                      className="w-full max-h-[400px] object-contain rounded-xl"
                    />
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

export default DieselDetailModal;
