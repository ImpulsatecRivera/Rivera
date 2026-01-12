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

const getMotoristaNombre = (m) =>
  m?.nombre || m?.name || [m?.nombres, m?.apellidos].filter(Boolean).join(" ") || "Motorista";

const getCamionPlaca = (c) =>
  c?.placa || c?.licensePlate || c?.numeroPlaca || c?.placaCamion || c?.plate || "";

const getClienteNombre = (c) =>
  c?.nombreComercial || c?.nombreEmpresa || c?.nombre || c?.name || "";

const getMotoristaTruckId = (m) => {
  if (!m) return "";
  if (m?.truckId) return String(m.truckId);
  if (m?.camionId) return String(m.camionId);
  if (typeof m?.truck === "string") return String(m.truck);
  if (m?.truck?._id) return String(m.truck._id);
  if (m?.camion?._id) return String(m.camion._id);

  // Heuristic: look for keys that may contain truck info (prefer nested objects)
  for (const k of Object.keys(m)) {
    if (/(camion|truck|vehiculo|vehicle)/i.test(k)) {
      const v = m[k];
      if (!v) continue;
      if (typeof v === "string" && v !== m._id && v !== m.id) return String(v);
      if (v?._id && String(v._id) !== String(m._id)) return String(v._id);
      if (v?.id && String(v.id) !== String(m._id)) return String(v.id);
    }
  }

  // Do NOT return the motorista's own _id as a truck id
  return "";
};

export default function AgregarViajeOperativo() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const [motoristas, setMotoristas] = useState([]);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);

  const [camiones, setCamiones] = useState([]);
  const [loadingCamiones, setLoadingCamiones] = useState(false);

  const [formData, setFormData] = useState({
    clienteId: "",
    clienteNombre: "",
    truckId: "",
    conductorId: "",
    codigoProgramacion: "",
    tripDescription: "",
    departureTime: "",
    arrivalTime: "",
    rutaOrigen: "",
    rutaDestino: "",
    rutaCompleta: "",
    distanciaTotal: "",
    tiempoEstimado: "",
    cargaDescripcion: "",
    cargaPeso: "",
    cargaTipo: "general",
    montoAcordado: "",
    metodoPago: "credito",
    condiciones: {
      clima: "normal",
      trafico: "normal",
      carretera: "buena",
    },
    observaciones: "",
  });

  useEffect(() => {
    fetchClientes();
    fetchMotoristas();
    fetchCamiones();
  }, []);

  useEffect(() => {
  if (formData.rutaOrigen && formData.rutaDestino) {
    setFormData((p) => ({
      ...p,
      rutaCompleta: `${formData.rutaOrigen}/${formData.rutaDestino}`,
    }));
  }
}, [formData.rutaOrigen, formData.rutaDestino]);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const res = await fetch(CLIENTES_ENDPOINT);
      const json = await res.json().catch(() => ({}));
      const rows = json?.data?.clientes || json?.data || (Array.isArray(json) ? json : []);

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
    const newId = String(created?._id || created?.id || "");

    if (!newId) throw new Error("No se pudo obtener el ID del cliente creado");

    // Recargar clientes
    await fetchClientes();

    // Seleccionar el nuevo cliente
    setFormData((p) => ({
      ...p,
      clienteId: newId,
      clienteNombre: nombreComercial,
    }));

    // Limpiar formulario
    setNuevoCliente({
      nombreEmpresa: "",
      nombreComercial: "",
      ruc: "",
      email: "",
      phone: "",
      address: "",
    });

    setError(null);
  } catch (e) {
    setError(e.message || "Error creando cliente");
  } finally {
    setCreatingCliente(false);
  }
};

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
          id: String(m._id),
          nombre,
          label: nombre,
        };
      });
  }, [motoristas]);

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
          id: String(c._id),
          placa,
          label: placa || `(Sin placa) ${String(c._id).slice(-6)}`,
        };
      });
  }, [camiones]);

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
const validar = () => {
  if (!formData.clienteId) return "Selecciona un cliente";
  if (!formData.conductorId) return "Selecciona un motorista";
  if (!formData.truckId) return "Selecciona un camión";
  if (!formData.departureTime) return "Ingresa fecha/hora de salida";
  if (!formData.arrivalTime) return "Ingresa fecha/hora de llegada";
  if (!formData.rutaOrigen) return "Ingresa origen";
  if (!formData.rutaDestino) return "Ingresa destino";
  if (!formData.montoAcordado || Number(formData.montoAcordado) <= 0)
    return "Ingresa un monto válido";
  return null;
};

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
       departureTime: new Date(formData.departureTime).toISOString(),
arrivalTime: new Date(formData.arrivalTime).toISOString(),

        rutaOrigen: formData.rutaOrigen,
        rutaDestino: formData.rutaDestino,
        rutaCompleta: formData.rutaCompleta,
        distanciaTotal: Number(formData.distanciaTotal) || 0,
        tiempoEstimado: Number(formData.tiempoEstimado) || 0,
        cargaDescripcion: formData.cargaDescripcion || "Carga general",
        cargaPeso: Number(formData.cargaPeso) || 0,
        cargaTipo: formData.cargaTipo,
        montoAcordado: Number(formData.montoAcordado),
         metodoPago: formData.metodoPago, //
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
        {/* Header - COLORES CAMBIADOS */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/viajesInternos")}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Viajes Operativos
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Plus className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-1">
                Nuevo Viaje Operativo
              </h1>
              <p className="text-gray-600">Programar viaje para cliente corporativo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Cliente Corporativo - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <User className="text-[#5F8EAD]" size={22} />
              Cliente Corporativo
            </h3>

            <div className={tabsCard}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Seleccionar cliente *
              </label>
              <select
                value={formData.clienteId}
                onChange={(e) => handleClienteSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white"
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
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                  <input
                    value={nuevoCliente.nombreComercial}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, nombreComercial: e.target.value }))
                    }
                    placeholder="Nombre Comercial (Ej: DIANA)"
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                  <input
                    value={nuevoCliente.ruc}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, ruc: e.target.value }))
                    }
                    placeholder="RUC/NIT *"
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                  <input
                    value={nuevoCliente.email}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email *"
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                  <input
                    value={nuevoCliente.phone}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Teléfono *"
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                  <input
                    value={nuevoCliente.address}
                    onChange={(e) =>
                      setNuevoCliente((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Dirección *"
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                  />
                </div>

                <button
                  type="button"
                  onClick={crearClienteYSeleccionar}
                  disabled={creatingCliente}
                  className="w-full px-4 py-2 bg-[#5D9646] text-white rounded-lg font-semibold disabled:opacity-50 hover:opacity-90"
                >
                  {creatingCliente ? "Creando..." : "Agregar Cliente"}
                </button>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Calendar className="text-[#5F8EAD]" size={22} />
              Fechas y Horarios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Fecha/Hora Salida *
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Fecha/Hora Llegada *
                </label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>
            </div>
          </div>

          {/* Ruta - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <MapPin className="text-[#5D9646]" size={22} />
              Ruta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  name="rutaOrigen"
                  value={formData.rutaOrigen}
                  onChange={handleInputChange}
                  placeholder="Ej: JULIO"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  name="rutaDestino"
                  value={formData.rutaDestino}
                  onChange={handleInputChange}
                  placeholder="Ej: RONALD"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Ruta Completa (auto)
                </label>
                <input
                  type="text"
                  value={formData.rutaCompleta}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                  placeholder="Ej: JULIO/RONALD"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Distancia (km)
                </label>
                <input
                  type="number"
                  name="distanciaTotal"
                  value={formData.distanciaTotal}
                  onChange={handleInputChange}
                  placeholder="Ej: 150"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

            <div>
  <label className="block text-sm font-semibold text-[#34353A] mb-2">
    Tiempo Estimado (HH:MM)
  </label>
  <input
    type="text"
    name="tiempoEstimado"
    value={formData.tiempoEstimado}
    onChange={(e) => {
      let val = e.target.value.replace(/[^\d:]/g, '');
      
      // Auto-agregar ":" después de 2 dígitos
      if (val.length === 2 && !val.includes(':')) {
        val = val + ':';
      }
      
      // Limitar formato HH:MM (máx 5 caracteres)
      if (val.length <= 5) {
        const parts = val.split(':');
        if (parts.length <= 2) {
          const horas = parts[0] ? parseInt(parts[0]) : 0;
          const minutos = parts[1] ? parseInt(parts[1]) : 0;
          
          // Validar rangos: horas 0-99, minutos 0-59
          if (horas <= 99 && (!parts[1] || minutos <= 59)) {
            setFormData(prev => ({ ...prev, tiempoEstimado: val }));
          }
        }
      }
    }}
    placeholder="Ej: 09:30"
    maxLength="5"
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
  />
</div>
            </div>
          </div>

          {/* Carga - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Package className="text-[#5F8EAD]" size={22} />
              Información de Carga
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  name="cargaDescripcion"
                  value={formData.cargaDescripcion}
                  onChange={handleInputChange}
                  placeholder="Ej: Carga general"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

            <div>
  <label className="block text-sm font-semibold text-[#34353A] mb-2">
    Peso (kg) - Máx: 6 digitos
  </label>
  <input
    type="number"
    name="cargaPeso"
    value={formData.cargaPeso}
    onChange={(e) => {
      const val = e.target.value;
      if (val === '' || (Number(val) >= 0 && val.length <= 6)) {
        handleInputChange(e);
      }
    }}
    placeholder="Ej: 15000"
    max="999999"
    min="0"
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
  />
</div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Tipo de Carga
                </label>
                <select
                  name="cargaTipo"
                  value={formData.cargaTipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
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

          {/* Monto - COLORES CAMBIADOS */}
          <div className="relative max-w-md">
              <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Monto acordado
                </label>
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
    onChange={(e) => {
      const val = e.target.value;
      // Permitir hasta 8 dígitos antes del decimal (99,999,999.99)
      const partes = val.split('.');
      if (val === '' || (Number(val) >= 0 && partes[0].length <= 6)) {
        handleInputChange(e);
      }
    }}
    placeholder="Ej: 250.00"
    max="99999999.99"
    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
  />
</div>
<br></br>

          {/* Método de Pago */}
<div className="mb-8">
  <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
    <DollarSign className="text-[#5F8EAD]" size={22} />
    Método de Pago
  </h3>

  <div className="max-w-md">
    <label className="block text-sm font-semibold text-[#34353A] mb-2">
      Seleccionar tipo de pago *
    </label>

    <select
      name="metodoPago"
      value={formData.metodoPago}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
                 focus:outline-none focus:ring-2 focus:ring-[#5F8EAD]
                 focus:border-[#5F8EAD] bg-white"
    >
      <option value="credito">Crédito</option>
      <option value="efectivo">Efectivo</option>
      <option value="transferencia">Transferencia</option>
      <option value="cheque">Cheque</option>
    </select>
  </div>
</div>


          {/* Conductor y Vehículo - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Truck className="text-[#5F8EAD]" size={22} />
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
                    onChange={(e) => {
                      const conductorId = String(e.target.value);
                      const motorista = (motoristas || []).find((m) => String(m._id) === conductorId);
                      const camionObj = motorista?.camion || motorista?.truck || null;

                      // Try several heuristics to detect a truck id associated to the motorista
                      let associatedTruckId = String(getMotoristaTruckId(motorista) || "") || (camionObj && (camionObj._id || camionObj.id) ? String(camionObj._id || camionObj.id) : "");

                      // If not found, scan the loaded `camiones` for any truck that references this motorista
                      if (!associatedTruckId && Array.isArray(camiones) && camiones.length > 0 && motorista) {
                        const mid = String(motorista._id || motorista.id || "");
                        for (const c of camiones) {
                          try {
                            // direct id match
                            if (String(c._id || c.id || "") === mid) {
                              associatedTruckId = String(c._id || c.id);
                              break;
                            }

                            // check common driver fields on the camion object
                            const candidateFields = ["driverId", "motoristaId", "conductorId", "assignedDriver", "motorista", "driver", "conductor"];
                            for (const f of candidateFields) {
                              const v = c[f];
                              if (!v) continue;
                              if (typeof v === "string" && String(v) === mid) {
                                associatedTruckId = String(c._id || c.id);
                                break;
                              }
                              if (typeof v === "object") {
                                if (String(v._id || v.id || "") === mid) {
                                  associatedTruckId = String(c._id || c.id);
                                  break;
                                }
                              }
                            }

                            if (associatedTruckId) break;

                            // deep scan: look for any field value equal to motorista id
                            for (const key of Object.keys(c || {})) {
                              const val = c[key];
                              if (!val) continue;
                              if (typeof val === "string" && (val === mid || val === motorista.id)) {
                                associatedTruckId = String(c._id || c.id);
                                break;
                              }
                              if (typeof val === "object") {
                                if (String(val._id || val.id || "") === mid) {
                                  associatedTruckId = String(c._id || c.id);
                                  break;
                                }
                              }
                            }

                            if (associatedTruckId) break;
                          } catch (xx) {
                            // ignore malformed camion entries
                          }
                        }
                      }

                      // Fallback: if there is exactly one camion in the system, assume it's the one
                      if (!associatedTruckId && Array.isArray(camiones) && camiones.length === 1) {
                        associatedTruckId = String(camiones[0]._id || camiones[0].id || "");
                      }

                      console.log("[DEBUG] motorista select -> conductorId:", conductorId);
                      console.log("[DEBUG] motorista object:", motorista);
                      console.log("[DEBUG] camionObj:", camionObj);
                      console.log("[DEBUG] associatedTruckId:", associatedTruckId);
                      console.log("[DEBUG] camiones currently:", (camiones || []).map((c) => ({ _id: c._id, placa: c.placa || c.plate || c.placaCamion })));

                      if (camionObj && (camionObj._id || camionObj.id || camionObj.placa || camionObj.plate)) {
                        const newCamion = {
                          ...camionObj,
                          _id: camionObj._id || camionObj.id || associatedTruckId,
                          placa: getCamionPlaca(camionObj) || camionObj.placa || camionObj.plate,
                        };
                        setCamiones((prev) => (prev.some((c) => String(c._id) === String(newCamion._id)) ? prev : [...prev, newCamion]));
                      } else if (associatedTruckId) {
                        setCamiones((prev) => (prev.some((c) => String(c._id) === associatedTruckId) ? prev : [...prev, { _id: associatedTruckId }]));
                      }

                      setFormData((p) => ({
                        ...p,
                        conductorId,
                        truckId: associatedTruckId || p.truckId,
                      }));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white"
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
    Camión * (asignado automáticamente)
  </label>
  <select
    value={formData.truckId}
    onChange={(e) => setFormData((p) => ({ ...p, truckId: e.target.value }))}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed text-gray-600"
    disabled={true}
  >
    <option value="">
      {loadingCamiones ? "Cargando camiones..." : formData.truckId ? "Camión asignado" : "Selecciona un motorista primero"}
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

          {/* Código Programación - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4">
              Código de Programación (Opcional)
            </h3>

            <input
              type="text"
              name="codigoProgramacion"
              value={formData.codigoProgramacion}
              onChange={handleInputChange}
              placeholder="Ej: C-11375 (se autogenera si se deja vacío)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
            />
          </div>

          {/* Observaciones - COLORES CAMBIADOS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4">Direccion detallada del viaje</h3>

            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              placeholder="Notas adicionales del viaje..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] resize-none"
            />
          </div>

          {/* Botones - COLORES CAMBIADOS */}
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