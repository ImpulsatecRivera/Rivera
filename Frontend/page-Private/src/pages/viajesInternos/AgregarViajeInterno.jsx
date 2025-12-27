import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Save,
  AlertCircle,
  User,
  MapPin,
  DollarSign,
  Truck,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../../config";

// ✅ ENDPOINTS BACKEND
const VIAJES_OPERATIVOS_ENDPOINT = `${config.api.API_URL}/viajes-operativos/crear`;
const CLIENTES_ENDPOINT = `${config.api.API_URL}/clientes`;
const MOTORISTAS_ENDPOINT = `${config.api.API_URL}/motoristas`;
const CAMIONES_ENDPOINT = `${config.api.API_URL}/camiones`;

const TIPO_CARGA = [
  { value: "general", label: "General" },
  { value: "materiales_construccion", label: "Materiales de Construcción" },
  { value: "productos_agricolas", label: "Productos Agrícolas" },
  { value: "alimentos", label: "Alimentos" },
  { value: "otro", label: "Otro" },
];

// ===== Helpers =====
const getMotoristaNombre = (m) =>
  m?.nombre || m?.name || [m?.nombres, m?.apellidos].filter(Boolean).join(" ") || "Motorista";

const getCamionPlaca = (c) =>
  c?.placa || c?.licensePlate || c?.numeroPlaca || c?.placaCamion || c?.plate || "";

const getClienteNombre = (c) =>
  c?.nombreComercial || c?.nombreEmpresa || c?.nombre || c?.name || "";

export default function AgregarViajeOperativo() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Clientes Corporativos
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombreEmpresa: "",
    nombreComercial: "",
    ruc: "",
    email: "",
    phone: "",
    address: "",
  });

  // ✅ Motoristas
  const [motoristas, setMotoristas] = useState([]);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);

  // ✅ Camiones
  const [camiones, setCamiones] = useState([]);
  const [loadingCamiones, setLoadingCamiones] = useState(false);

  const [formData, setFormData] = useState({
    // Cliente
    clienteId: "",
    clienteNombre: "",

    // Recursos
    truckId: "",
    conductorId: "",

    // Código programación (opcional, se autogenera)
    codigoProgramacion: "",

    // Descripción
    tripDescription: "",

    // Fechas (salida y llegada)
    departureTime: "",
    arrivalTime: "",

    // Ruta
    rutaOrigen: "",
    rutaDestino: "",
    rutaCompleta: "",
    distanciaTotal: "",
    tiempoEstimado: "",

    // Carga
    cargaDescripcion: "",
    cargaPeso: "",
    cargaTipo: "general",

    // Monto
    montoAcordado: "",

    // Condiciones
    condiciones: {
      clima: "normal",
      trafico: "normal",
      carretera: "buena",
    },

    // Observaciones
    observaciones: "",
  });

  useEffect(() => {
    fetchClientes();
    fetchMotoristas();
    fetchCamiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Clientes Corporativos
  // =========================
  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const res = await fetch(CLIENTES_ENDPOINT);
      const json = await res.json().catch(() => ({}));
      const rows = json?.data?.clientes || json?.data || (Array.isArray(json) ? json : []);

      // Filtrar solo corporativos
      const corporativos = rows.filter((c) => c?.tipoCliente === "corporativo");
      setClientes(corporativos);
    } catch (e) {
      console.error("Error cargando clientes:", e);
    } finally {
      setLoadingClientes(false);
    }
  };

  const clientesOptions = useMemo(() => {
    return (clientes || [])
      .filter((c) => c?._id)
      .map((c) => {
        const nombre = getClienteNombre(c);
        return {
          id: c._id,
          nombre,
          label: nombre,
        };
      });
  }, [clientes]);

  const crearClienteYSeleccionar = async () => {
    const nombreEmpresa = (nuevoCliente.nombreEmpresa || "").trim();
    const nombreComercial = (nuevoCliente.nombreComercial || nombreEmpresa).trim();
    const ruc = (nuevoCliente.ruc || "").trim();
    const email = (nuevoCliente.email || "").trim();
    const phone = (nuevoCliente.phone || "").trim();
    const address = (nuevoCliente.address || "").trim();

    if (!nombreEmpresa || !ruc || !email || !phone || !address) {
      setError("Completa todos los campos obligatorios del cliente");
      return;
    }

    setCreatingCliente(true);
    setError(null);

    try {
      const payload = {
        tipoCliente: "corporativo",
        nombreEmpresa,
        nombreComercial,
        ruc,
        email,
        phone,
        address,
        terminosPago: "contado",
        limiteCredito: 0,
        estadoCorporativo: "activo",
      };

      const res = await fetch(CLIENTES_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false)
        throw new Error(json?.message || "Error al crear cliente");

      const created = json?.data?.cliente || json?.data || json;
      const newId = created?._id || created?.id;

      await fetchClientes();

      setFormData((p) => ({
        ...p,
        clienteId: newId || "",
        clienteNombre: nombreComercial,
      }));

      setNuevoCliente({
        nombreEmpresa: "",
        nombreComercial: "",
        ruc: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (e) {
      setError(e.message || "Error creando cliente");
    } finally {
      setCreatingCliente(false);
    }
  };

  // =========================
  // Motoristas
  // =========================
  const fetchMotoristas = async () => {
    try {
      setLoadingMotoristas(true);
      const res = await fetch(MOTORISTAS_ENDPOINT);
      const json = await res.json().catch(() => ({}));
      const rows = json?.data || (Array.isArray(json) ? json : []);
      setMotoristas(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error cargando motoristas:", e);
    } finally {
      setLoadingMotoristas(false);
    }
  };

  const motoristasOptions = useMemo(() => {
    return (motoristas || [])
      .filter((m) => m?._id)
      .map((m) => {
        const nombre = getMotoristaNombre(m);
        return {
          id: m._id,
          nombre,
          label: nombre,
        };
      });
  }, [motoristas]);

  // =========================
  // Camiones
  // =========================
  const fetchCamiones = async () => {
    try {
      setLoadingCamiones(true);
      const res = await fetch(CAMIONES_ENDPOINT);
      const json = await res.json().catch(() => ({}));

      const rows =
        json?.data?.camiones || json?.camiones || json?.data || (Array.isArray(json) ? json : []);

      setCamiones(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error cargando camiones:", e);
    } finally {
      setLoadingCamiones(false);
    }
  };

  const camionesOptions = useMemo(() => {
    return (camiones || [])
      .filter((c) => c?._id)
      .map((c) => {
        const placa = getCamionPlaca(c);
        return {
          id: c._id,
          placa,
          label: placa || `(Sin placa) ${String(c._id).slice(-6)}`,
        };
      });
  }, [camiones]);

  // =========================
  // Handlers
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClienteSelect = (clienteId) => {
    const found = clientesOptions.find((x) => x.id === clienteId);
    setFormData((p) => ({
      ...p,
      clienteId,
      clienteNombre: found?.nombre || p.clienteNombre,
    }));
  };

  // ✅ Auto-generar rutaCompleta
  useEffect(() => {
    if (formData.rutaOrigen && formData.rutaDestino) {
      setFormData((p) => ({
        ...p,
        rutaCompleta: `${p.rutaOrigen}/${p.rutaDestino}`,
      }));
    }
  }, [formData.rutaOrigen, formData.rutaDestino]);

  // =========================
  // Validación
  // =========================
  const validar = () => {
    if (!formData.clienteId) return "Selecciona un cliente corporativo";
    if (!formData.truckId) return "Selecciona un camión";
    if (!formData.conductorId) return "Selecciona un conductor";
    if (!formData.departureTime) return "La fecha/hora de salida es requerida";
    if (!formData.arrivalTime) return "La fecha/hora de llegada es requerida";

    const salida = new Date(formData.departureTime);
    const llegada = new Date(formData.arrivalTime);

    if (salida >= llegada) return "La salida debe ser anterior a la llegada";

    if (!formData.rutaOrigen.trim()) return "El origen es requerido";
    if (!formData.rutaDestino.trim()) return "El destino es requerido";

    const montoNum = Number(formData.montoAcordado);
    if (!formData.montoAcordado || Number.isNaN(montoNum) || montoNum <= 0)
      return "El monto debe ser mayor a 0";

    return null;
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async () => {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSend = {
        clienteId: formData.clienteId,
        clienteNombre: formData.clienteNombre,

        truckId: formData.truckId,
        conductorId: formData.conductorId,

        codigoProgramacion: formData.codigoProgramacion || undefined,

        tripDescription:
          formData.tripDescription ||
          `${formData.rutaCompleta} - ${formData.clienteNombre}`,

        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,

        rutaOrigen: formData.rutaOrigen,
        rutaDestino: formData.rutaDestino,
        rutaCompleta: formData.rutaCompleta,
        distanciaTotal: Number(formData.distanciaTotal) || 0,
        tiempoEstimado: Number(formData.tiempoEstimado) || 0,

        cargaDescripcion: formData.cargaDescripcion || "Carga general",
        cargaPeso: Number(formData.cargaPeso) || 0,
        cargaTipo: formData.cargaTipo,

        montoAcordado: Number(formData.montoAcordado),

        condiciones: formData.condiciones,
        observaciones: formData.observaciones || "",
      };

      const res = await fetch(VIAJES_OPERATIVOS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false)
        throw new Error(json?.message || "Error al crear el viaje operativo");

      navigate("/viajesInternos");
    } catch (e) {
      setError(e.message || "Error al guardar");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabsCard = "bg-gray-50 rounded-2xl p-5 border border-gray-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/viajesOperativos")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Viajes Operativos
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Plus className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Nuevo Viaje Operativo
              </h1>
              <p className="text-gray-600">Programar viaje para cliente corporativo</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Cliente Corporativo */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-indigo-600" size={22} />
              Cliente Corporativo
            </h3>

            <div className={tabsCard}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Seleccionar cliente *
              </label>
              <select
                value={formData.clienteId}
                onChange={(e) => handleClienteSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={loadingClientes}
              >
                <option value="">
                  {loadingClientes ? "Cargando clientes..." : "Seleccionar cliente..."}
                </option>
                {clientesOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Agregar nuevo cliente corporativo */}
              <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  ¿No aparece? Agregar nuevo cliente corporativo
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    value={nuevoCliente.nombreEmpresa}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, nombreEmpresa: e.target.value }))
                    }
                    placeholder="Nombre Empresa *"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={nuevoCliente.nombreComercial}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, nombreComercial: e.target.value }))
                    }
                    placeholder="Nombre Comercial (Ej: DIANA)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={nuevoCliente.ruc}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, ruc: e.target.value }))
                    }
                    placeholder="RUC/NIT *"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={nuevoCliente.email}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email *"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={nuevoCliente.phone}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Teléfono *"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={nuevoCliente.address}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Dirección *"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={crearClienteYSeleccionar}
                  disabled={creatingCliente}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {creatingCliente ? "Creando..." : "Agregar Cliente"}
                </button>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={22} />
              Fechas y Horarios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha/Hora Salida *
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha/Hora Llegada *
                </label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Ruta */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={22} />
              Ruta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  name="rutaOrigen"
                  value={formData.rutaOrigen}
                  onChange={handleInputChange}
                  placeholder="Ej: JULIO"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  name="rutaDestino"
                  value={formData.rutaDestino}
                  onChange={handleInputChange}
                  placeholder="Ej: RONALD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ruta Completa (auto)
                </label>
                <input
                  type="text"
                  value={formData.rutaCompleta}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                  placeholder="Ej: JULIO/RONALD"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distancia (km)
                </label>
                <input
                  type="number"
                  name="distanciaTotal"
                  value={formData.distanciaTotal}
                  onChange={handleInputChange}
                  placeholder="Ej: 150"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tiempo Estimado (hrs)
                </label>
                <input
                  type="number"
                  name="tiempoEstimado"
                  value={formData.tiempoEstimado}
                  onChange={handleInputChange}
                  placeholder="Ej: 9"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Carga */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="text-indigo-600" size={22} />
              Información de Carga
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  name="cargaDescripcion"
                  value={formData.cargaDescripcion}
                  onChange={handleInputChange}
                  placeholder="Ej: Carga general"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="cargaPeso"
                  value={formData.cargaPeso}
                  onChange={handleInputChange}
                  placeholder="Ej: 15000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Carga
                </label>
                <select
                  name="cargaTipo"
                  value={formData.cargaTipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIPO_CARGA.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Monto */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-indigo-600" size={22} />
              Monto Acordado
            </h3>

            <div className="relative max-w-md">
              <DollarSign
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="number"
                name="montoAcordado"
                min="0"
                step="0.01"
                value={formData.montoAcordado}
                onChange={handleInputChange}
                placeholder="Ej: 250.00"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Conductor y Vehículo */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="text-indigo-600" size={22} />
              Conductor y Vehículo
            </h3>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Motorista *
                  </label>
                  <select
                    value={formData.conductorId}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, conductorId: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    disabled={loadingMotoristas}
                  >
                    <option value="">
                      {loadingMotoristas ? "Cargando motoristas..." : "Seleccionar motorista..."}
                    </option>
                    {motoristasOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Camión *
                  </label>
                  <select
                    value={formData.truckId}
                    onChange={(e) => setFormData((p) => ({ ...p, truckId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    disabled={loadingCamiones}
                  >
                    <option value="">
                      {loadingCamiones ? "Cargando camiones..." : "Seleccionar camión..."}
                    </option>
                    {camionesOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Código Programación (Opcional) */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Código de Programación (Opcional)
            </h3>

            <input
              type="text"
              name="codigoProgramacion"
              value={formData.codigoProgramacion}
              onChange={handleInputChange}
              placeholder="Ej: C-11375 (se autogenera si se deja vacío)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Observaciones */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Observaciones</h3>

            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              placeholder="Notas adicionales del viaje..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/viajesOperativos")}
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
                  Programar Viaje
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}