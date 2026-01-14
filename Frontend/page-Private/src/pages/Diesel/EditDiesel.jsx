import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, AlertCircle, Fuel } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { config } from "../../config";

const DIESEL_ENDPOINT = `${config.api.API_URL}/resumen`;
const CAMIONES_ENDPOINT = `${config.api.API_URL}/camiones`;

const ESTADOS = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
};

const toISODate = (dateLike) => {
  if (!dateLike) return "";

  if (typeof dateLike === "string") {
    const s = dateLike.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export default function EditDiesel() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [camiones, setCamiones] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    CicurlationCard: "",
    Galones: "",
    Total: "",
    estado: ESTADOS.PENDIENTE,
  });

  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeEstado = (v) => String(v || "").trim().toLowerCase();
  const canonEstado = (v) => (normalizeEstado(v) === "completado" ? ESTADOS.COMPLETADO : ESTADOS.PENDIENTE);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const resCam = await fetch(CAMIONES_ENDPOINT, { credentials: 'include' });
        const jsonCam = await resCam.json().catch(() => ({}));
        const camRows = jsonCam.data || (Array.isArray(jsonCam) ? jsonCam : []);
        setCamiones(camRows);

      const res = await fetch(DIESEL_ENDPOINT, { credentials: 'include' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Error al cargar diésel");

        const rows = json.data || (Array.isArray(json) ? json : []);
        const found = rows.find((r) => String(r?._id || r?.id) === String(id));
        if (!found) throw new Error("No se encontró el registro de diésel");

        const fecha = found.fecha || found.date || found.createdAt || found.fecha_diesel;

        const cic =
          (typeof found.CicurlationCard === "object" && found.CicurlationCard?._id) ||
          found.CicurlationCard ||
          "";

        const estadoBD = canonEstado(found.estado || found.Estado || found.status);

        setFormData({
          fecha: toISODate(fecha),
          CicurlationCard: cic,
          Galones: String(found.Galones ?? found.galones ?? 0),
          Total: String(found.Total ?? found.total ?? 0),
          estado: estadoBD,
        });

        setIsLocked(estadoBD === ESTADOS.COMPLETADO);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const precioPorGalon = useMemo(() => {
    const g = toNumber(formData.Galones);
    const t = toNumber(formData.Total);
    if (g <= 0) return 0;
    return t / g;
  }, [formData.Galones, formData.Total]);

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
  };

  const handleChange = (e) => {
    if (isLocked) return;

    const { name, value } = e.target;

    if (name === "fecha") {
      const today = getTodayISO();
      if (value && value > today) {
        setError("No se permiten fechas futuras. Solo fechas pasadas o el día de hoy.");
        return;
      }
      if (error) setError(null);
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isLocked) {
        throw new Error("Este registro ya está completado y no se puede editar.");
      }

      setSaving(true);
      setError(null);

      if (!formData.fecha) throw new Error("La fecha es requerida");
      if (formData.fecha > getTodayISO()) throw new Error("La fecha no puede ser a futuro.");
      if (!formData.CicurlationCard) throw new Error("Debe seleccionar un camión");
      if (toNumber(formData.Galones) <= 0) throw new Error("Los galones deben ser mayores que 0");
      if (toNumber(formData.Total) <= 0) throw new Error("El total debe ser mayor que 0");

      const payload = {
        fecha: formData.fecha,
        Galones: toNumber(formData.Galones),
        Total: toNumber(formData.Total),
        CicurlationCard: formData.CicurlationCard,
        estado: formData.estado,
      };

      const res = await fetch(`${DIESEL_ENDPOINT}/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.message || "Error al actualizar");

      navigate("/diesel");
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#5F8EAD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando diésel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/diesel")}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Diésel
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Fuel className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#34353A] mb-1">Editar Diésel</h1>
              <p className="text-gray-600">Actualiza los datos del registro</p>

              {isLocked && (
                <p className="mt-2 text-sm font-semibold text-[#5D9646] bg-[#5D9646] bg-opacity-10 border-2 border-[#5D9646] inline-block px-3 py-1 rounded-xl">
                  ✅ Este registro está COMPLETADO y ya no se puede editar.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                max={getTodayISO()}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Camión / Placa</label>
              <select
                name="CicurlationCard"
                value={formData.CicurlationCard}
                onChange={handleChange}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Seleccionar camión...</option>
                {camiones.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.licensePlate} - {c.brand} {c.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Estado del registro</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value={ESTADOS.PENDIENTE}>🟡 Pendiente</option>
                <option value={ESTADOS.COMPLETADO}>🟢 Completado</option>
              </select>

              {!isLocked && formData.estado === ESTADOS.COMPLETADO && (
                <p className="text-xs text-gray-500 mt-2">
                  Al guardar como <b>Completado</b>, ya no podrás editar este registro después.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Galones</label>
              <input
                type="number"
                name="Galones"
                value={formData.Galones}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Total (USD)</label>
              <input
                type="number"
                name="Total"
                value={formData.Total}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />

              <p className="text-xs text-gray-500 mt-2">
                Precio aproximado por galón: <b>{formatearMoneda(precioPorGalon)}</b>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/diesel")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving || isLocked}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}