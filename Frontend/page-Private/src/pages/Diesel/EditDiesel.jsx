import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, AlertCircle, Fuel } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { config } from "../../config";

const DIESEL_ENDPOINT = `${config.api.API_URL}/resumen`;
const CAMIONES_ENDPOINT = `${config.api.API_URL}/camiones`;

// ✅ FECHA SIN DESFASE (para input type="date")
const toISODate = (dateLike) => {
  if (!dateLike) return "";

  // Si viene como string ISO "2025-12-12T00:00:00.000Z" -> "2025-12-12"
  if (typeof dateLike === "string") {
    const s = dateLike.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    // Si viniera como "12/12/2025" u otro formato raro:
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    // Construir YYYY-MM-DD en LOCAL (sin toISOString)
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Si viene como Date
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

  const [formData, setFormData] = useState({
    fecha: "",
    CicurlationCard: "",
    Galones: "",
    Total: "",
  });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Camiones
        const resCam = await fetch(CAMIONES_ENDPOINT);
        const jsonCam = await resCam.json().catch(() => ({}));
        const camRows = jsonCam.data || (Array.isArray(jsonCam) ? jsonCam : []);
        setCamiones(camRows);

        // 2) Diesel
        const res = await fetch(DIESEL_ENDPOINT);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Error al cargar diésel");

        const rows = json.data || (Array.isArray(json) ? json : []);

        // ✅ comparar como String para evitar mismatch
        const found = rows.find((r) => String(r?._id || r?.id) === String(id));
        if (!found) throw new Error("No se encontró el registro de diésel");

        const fecha = found.fecha || found.date || found.createdAt || found.fecha_diesel;

        const cic =
          (typeof found.CicurlationCard === "object" && found.CicurlationCard?._id) ||
          found.CicurlationCard ||
          "";

        setFormData({
          fecha: toISODate(fecha), // ✅ sin desfase
          CicurlationCard: cic,
          Galones: String(found.Galones ?? found.galones ?? 0),
          Total: String(found.Total ?? found.total ?? 0),
        });
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
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!formData.fecha) throw new Error("La fecha es requerida");
      if (toNumber(formData.Galones) <= 0) throw new Error("Los galones deben ser mayores que 0");
      if (toNumber(formData.Total) <= 0) throw new Error("El total debe ser mayor que 0");

      const payload = {
        fecha: formData.fecha, // "YYYY-MM-DD"
        Galones: toNumber(formData.Galones),
        Total: toNumber(formData.Total),
      };

      const res = await fetch(`${DIESEL_ENDPOINT}/${id}`, {
        method: "PUT",
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
          <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Diésel
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Fuel className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Editar Diésel</h1>
              <p className="text-gray-600">Actualiza los datos del registro</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Camión / Placa</label>
              <select
                name="CicurlationCard"
                value={formData.CicurlationCard}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar camión...</option>
                {camiones.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.licensePlate} - {c.brand} {c.model}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-2">
                *Si quieres que el cambio de camión se guarde, hay que agregarlo en el controller PutDiesel.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Galones</label>
              <input
                type="number"
                name="Galones"
                value={formData.Galones}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total (USD)</label>
              <input
                type="number"
                name="Total"
                value={formData.Total}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
