import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Save, Fuel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from '../../Context/authContext';
import Swal from 'sweetalert2'; // ✅ IMPORTAR

const AgregarDiesel = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [camiones, setCamiones] = useState([]);

  const ESTADOS = {
    PENDIENTE: "Pendiente",
    COMPLETADO: "Completado",
  };

  const [formData, setFormData] = useState({
    fecha: "",
    CicurlationCard: "",
    Galones: "",
    precioGalon: "",
    Total: "",
    numeroMarchamo: "", // ✅ NUEVO
    estado: ESTADOS.PENDIENTE,
  });

  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeDateToISO = (dateStr) => {
    if (!dateStr) return null;
    // Para date, el formato es "YYYY-MM-DD"
    const localDate = new Date(dateStr + "T00:00:00");
    return localDate.toISOString();
  };

  useEffect(() => {
    fetchCamiones();
  }, []);

  const fetchCamiones = async () => {
    try {
      const { data } = await api.get('/camiones');
      setCamiones(data?.data || []);
    } catch (err) {
      console.error("Error al cargar camiones:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar camiones',
        text: 'No se pudieron cargar los camiones. Por favor recarga la página.',
        confirmButtonColor: '#5F8EAD'
      });
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

  const totalCalculado = useMemo(() => {
    const gal = toNumber(formData.Galones);
    const precio = toNumber(formData.precioGalon);
    if (gal > 0 && precio > 0) return gal * precio;
    return toNumber(formData.Total);
  }, [formData.Galones, formData.precioGalon, formData.Total]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      const today = getTodayISO();
      if (value && value > today) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha no válida',
          text: 'No se permiten fechas futuras. Solo fechas pasadas o el día de hoy.',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (["Galones", "precioGalon", "Total"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // ✅ Validaciones con SweetAlert
    if (!formData.fecha) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'La fecha es requerida',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    if (formData.fecha > getTodayISO()) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha no válida',
        text: 'La fecha no puede ser a futuro (solo hoy o fechas pasadas).',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    if (toNumber(formData.Galones) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Galones inválidos',
        text: 'Los galones deben ser mayores que 0',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    if (totalCalculado <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Total inválido',
        text: 'El total debe ser mayor que 0',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    // ✅ Confirmación antes de guardar
    const confirmResult = await Swal.fire({
      title: '¿Crear registro de diésel?',
      html: `Se creará un nuevo registro con estado <strong>Pendiente</strong><br><br>Total: <strong>${formatearMoneda(totalCalculado)}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoading(true);

      // ✅ Mostrar loading
      Swal.fire({
        title: 'Creando registro...',
        html: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const payload = {
        fecha: normalizeDateToISO(formData.fecha),
        Galones: toNumber(formData.Galones),
        Total: totalCalculado,
        CicurlationCard: formData.CicurlationCard,
        numeroMarchamo: formData.numeroMarchamo.trim() || null, // ✅ NUEVO
        estado: ESTADOS.PENDIENTE,
      };

      console.log('📤 Enviando payload:', payload);
      console.log('📅 Fecha original:', formData.fecha);
      console.log('📅 Fecha convertida:', payload.fecha);
      console.log('📋 Número de marchamo:', payload.numeroMarchamo);

      await api.post('/resumen', payload);

      // ✅ Alert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        html: `✅ Registro de diésel creado exitosamente<br><br><small>Total: ${formatearMoneda(totalCalculado)}</small>`,
        confirmButtonColor: '#5D9646',
        timer: 3000,
        timerProgressBar: true
      });

      navigate("/diesel");

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error al crear registro',
        text: err.response?.data?.message || "Error al crear el registro de diésel",
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    const hayDatos =
      formData.fecha ||
      formData.CicurlationCard ||
      formData.Galones ||
      formData.precioGalon ||
      formData.Total ||
      formData.numeroMarchamo;

    if (!hayDatos) {
      navigate("/diesel");
      return;
    }

    const result = await Swal.fire({
      title: '¿Cancelar creación?',
      text: "Los datos ingresados se perderán",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar editando'
    });

    if (result.isConfirmed) {
      navigate("/diesel");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleCancelar}
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
              <h1 className="text-4xl font-bold text-[#34353A] mb-1">Nuevo Registro de Diésel</h1>
              <p className="text-gray-600">Registra una carga de combustible para tu flota</p>

              <span className="inline-flex mt-2 items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Estado: {ESTADOS.PENDIENTE}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Calendar className="text-[#5F8EAD]" size={22} />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  max={getTodayISO()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Camión */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">Camión / Placa *</label>
                <select
                  name="CicurlationCard"
                  value={formData.CicurlationCard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">Seleccionar camión...</option>
                  {camiones.map((camion) => (
                    <option key={camion._id} value={camion._id}>
                      {camion.licensePlate} - {camion.brand} {camion.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ NUEVO: Número de Marchamo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Número de Marchamo
                  <span className="text-gray-400 font-normal text-xs ml-2">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="numeroMarchamo"
                  value={formData.numeroMarchamo}
                  onChange={handleInputChange}
                  placeholder="Ej: M-12345-2024"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Galones */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">Galones *</label>
                <input
                  type="number"
                  name="Galones"
                  value={formData.Galones}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 35.50"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Precio por Galón */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">Precio por Galón</label>
                <input
                  type="number"
                  name="precioGalon"
                  value={formData.precioGalon}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 4.20"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Total */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
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
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                    toNumber(formData.precioGalon) > 0 ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold">Total del Registro</span>
              <span className="text-white text-4xl font-bold">{formatearMoneda(totalCalculado)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelar}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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