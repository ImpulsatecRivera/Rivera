import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Save, AlertCircle, Fuel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../../config";

const AgregarDiesel = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [camiones, setCamiones] = useState([]);

  const ESTADOS = {
    PENDIENTE: "Pendiente",
    COMPLETADO: "Completado",
  };

  // ✅ Guardamos EL ID del camión en CicurlationCard
  const [formData, setFormData] = useState({
    fecha: "",
    CicurlationCard: "", // ✅ _id del camión
    Galones: "",
    precioGalon: "",
    Total: "",
    estado: ESTADOS.PENDIENTE, // ✅ por defecto
  });

  // ✅ Fecha de hoy en formato YYYY-MM-DD (LOCAL)
  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    fetchCamiones();
  }, []);

  const fetchCamiones = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/camiones`);
      const result = await response.json().catch(() => ({}));
      setCamiones(result.data || []);
    } catch (err) {
      console.error("Error al cargar camiones:", err);
    }
  };

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
  };

  // ✅ si hay precio por galón, calculamos el total
  const totalCalculado = useMemo(() => {
    const gal = toNumber(formData.Galones);
    const precio = toNumber(formData.precioGalon);
    if (gal > 0 && precio > 0) return gal * precio;
    return toNumber(formData.Total);
  }, [formData.Galones, formData.precioGalon, formData.Total]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ FECHA: solo permitir pasado o hoy
    if (name === "fecha") {
      const today = getTodayISO();
      if (value && value > today) {
        setError("No se permiten fechas futuras. Solo fechas pasadas o el día de hoy.");
        return;
      }
      if (error) setError(null);
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // permitir strings en inputs numéricos para que el usuario pueda borrar
    if (["Galones", "precioGalon", "Total"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fecha) return setError("La fecha es requerida");
    if (formData.fecha > getTodayISO()) return setError("La fecha no puede ser a futuro (solo hoy o fechas pasadas).");
    if (!formData.CicurlationCard) return setError("Debe seleccionar un camión");
    if (toNumber(formData.Galones) <= 0) return setError("Los galones deben ser mayores que 0");
    if (totalCalculado <= 0) return setError("El total debe ser mayor que 0 (o ingresa el precio por galón)");

    try {
      setLoading(true);
      setError(null);

      // ✅ Backend espera Galones/Total/CicurlationCard
      // ✅ estado por defecto: Pendiente
      const payload = {
        fecha: formData.fecha,
        Galones: toNumber(formData.Galones),
        Total: totalCalculado,
        CicurlationCard: formData.CicurlationCard,
        estado: ESTADOS.PENDIENTE, // ✅ SIEMPRE pendiente al crear
      };

      const response = await fetch(`${config.api.API_URL}/resumen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Error al crear el registro de diésel");
      }

      navigate("/diesel");
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Nuevo Registro de Diésel</h1>
              <p className="text-gray-600">Registra una carga de combustible para tu flota</p>

              {/* ✅ Muestra el estado, pero no se edita */}
              <span className="inline-flex mt-2 items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Estado: {ESTADOS.PENDIENTE}
              </span>
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

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={22} />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  max={getTodayISO()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Camión / Placa *</label>
                <select
                  name="CicurlationCard"
                  value={formData.CicurlationCard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar camión...</option>
                  {camiones.map((camion) => (
                    <option key={camion._id} value={camion._id}>
                      {camion.licensePlate} - {camion.brand} {camion.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Galones *</label>
                <input
                  type="number"
                  name="Galones"
                  value={formData.Galones}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 35.50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por Galón</label>
                <input
                  type="number"
                  name="precioGalon"
                  value={formData.precioGalon}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 4.20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total *{" "}
                  <span className="text-gray-400 font-medium">
                    (si ingresas precio por galón se calcula automáticamente)
                  </span>
                </label>
                <input
                  type="number"
                  name="Total"
                  value={formData.Total}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 149.10"
                  disabled={toNumber(formData.precioGalon) > 0}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    toNumber(formData.precioGalon) > 0 ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold">Total del Registro</span>
              <span className="text-white text-4xl font-bold">{formatearMoneda(totalCalculado)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/diesel")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Diésel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarDiesel;
