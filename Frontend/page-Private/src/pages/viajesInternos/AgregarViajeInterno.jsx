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
  TrendingUp,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../Context/authContext";

const TIPO_CARGA = [
  { value: "general", label: "General" },
  { value: "materiales_construccion", label: "Materiales de Construcción" },
  { value: "productos_agricolas", label: "Productos Agrícolas" },
  { value: "alimentos", label: "Alimentos" },
  { value: "otro", label: "Otro" },
];

const getMotoristaNombre = (m) => {
  if (!m) return "Sin motorista";
  
  // Priorizar campos name + lastName (del modelo estándar)
  const primerNombre = m?.name || m?.nombres || m?.primerNombre || m?.firstName || "";
  const apellidos = m?.lastName || m?.apellidos || m?.apellido || m?.primerApellido || "";
  
  // Si existen ambos, combinarlos
  if (primerNombre && apellidos) {
    return `${primerNombre} ${apellidos}`.trim();
  }
  
  // Si solo hay apellidos, intentar extraer nombre de otros campos
  if (apellidos && (m?.nombres || m?.primerNombre)) {
    const nombre = m?.nombres || m?.primerNombre || "";
    return `${nombre} ${apellidos}`.trim();
  }
  
  // Fallback - si solo existe nombre O apellido
  if (primerNombre) return String(primerNombre);
  if (apellidos) return String(apellidos);
  
  return m?._id ? `Motorista ${String(m._id).slice(-6)}` : "Motorista";
};

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

  for (const k of Object.keys(m)) {
    if (/(camion|truck|vehiculo|vehicle)/i.test(k)) {
      const v = m[k];
      if (!v) continue;
      if (typeof v === "string" && v !== m._id && v !== m.id) return String(v);
      if (v?._id && String(v._id) !== String(m._id)) return String(v._id);
      if (v?.id && String(v.id) !== String(m._id)) return String(v.id);
    }
  }

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

  const [rutasFrecuentesCliente, setRutasFrecuentesCliente] = useState([]);

  const [formData, setFormData] = useState({
    clienteId: "",
    clienteNombre: "",
    truckId: "",
    conductorId: "",
    auxiliares: [],
    codigoProgramacion: "",
    tripDescription: "",
    departureTime: "",
    rutaOrigen: "",
    rutaDestino: "",
    rutaCompleta: "",
    cargaDescripcion: "",
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
      const { data } = await api.get('/clientes');
      const rows = data?.data?.clientes || data?.data || (Array.isArray(data) ? data : []);
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

      const { data } = await api.post('/clientes', payload);
      const created = data?.data?.cliente || data?.data || data;
      const newId = String(created?._id || created?.id || "");

      if (!newId) throw new Error("No se pudo obtener el ID del cliente creado");

      await fetchClientes();

      setFormData((p) => ({
        ...p,
        clienteId: newId,
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

      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Error creando cliente");
    } finally {
      setCreatingCliente(false);
    }
  };

  const fetchMotoristas = async () => {
    try {
      setLoadingMotoristas(true);
      const { data } = await api.get('/motoristas');
      const rows = data?.data || (Array.isArray(data) ? data : []);
      setMotoristas(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error cargando motoristas:", e);
    } finally {
      setLoadingMotoristas(false);
    }
  };

  const motoristasPrincipalesOptions = useMemo(() => {
    return (motoristas || [])
      .filter((m) => m?._id && m?.rol === 'motorista')
      .map((m) => {
        const nombre = getMotoristaNombre(m);
        return {
          id: String(m._id),
          nombre,
          label: nombre,
        };
      });
  }, [motoristas]);

  const auxiliaresOptions = useMemo(() => {
    return (motoristas || [])
      .filter((m) => m?._id && m?.rol === 'auxiliar')
      .map((m) => {
        const nombre = getMotoristaNombre(m);
        return {
          id: String(m._id),
          nombre,
          label: nombre,
        };
      });
  }, [motoristas]);

  const rutasCompletasOptions = useMemo(() => {
    return (rutasFrecuentesCliente || []).map((r, index) => ({
      id: index,
      label: `${r.origen} → ${r.destino}`,
      origen: r.origen,
      destino: r.destino,
      vecesUsada: r.vecesUsada || 0,
    }));
  }, [rutasFrecuentesCliente]);

  const fetchCamiones = async () => {
    try {
      setLoadingCamiones(true);
      const { data } = await api.get('/camiones');
      const rows = data?.data?.camiones || data?.camiones || data?.data || (Array.isArray(data) ? data : []);
      setCamiones(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error cargando camiones:", e);
    } finally {
      setLoadingCamiones(false);
    }
  };

  const camionesOptions = useMemo(() => {
    return (camiones || [])
      .filter((c) => {
        if (!c?._id) return false;
        const estado = String(c.state || c.estado || "").toUpperCase().replace(/\s+/g, "_");
        // Excluir camiones en mantenimiento o no disponibles
        return estado !== "MANTENIMIENTO" && 
               estado !== "EN_MANTENIMIENTO" && 
               estado !== "NO_DISPONIBLE";
      })
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
    const found = clientes.find((c) => String(c._id) === clienteId);
    setFormData((p) => ({
      ...p,
      clienteId,
      clienteNombre: found?.nombreComercial || found?.nombreEmpresa || p.clienteNombre,
    }));
    setRutasFrecuentesCliente(found?.rutasFrecuentes || []);
  };

  const validar = () => {
    if (!formData.clienteId) return "Selecciona un cliente";
    if (!formData.conductorId) return "Selecciona un motorista";
    if (!formData.truckId) return "Selecciona un camión";
    if (!formData.departureTime) return "Ingresa fecha/hora de Carga";
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

      // Calcular arrivalTime automáticamente (1 día después de departureTime)
      const departureDate = new Date(formData.departureTime);
      const arrivalDate = new Date(departureDate);
      arrivalDate.setDate(arrivalDate.getDate() + 1);

      const dataToSend = {
        clienteId: formData.clienteId,
        clienteNombre: formData.clienteNombre,
        truckId: formData.truckId,
        conductorId: formData.conductorId,
        auxiliares: formData.auxiliares.map(id => ({ auxiliarId: id, rol: 'auxiliar' })),
        codigoProgramacion: formData.codigoProgramacion || undefined,
        tripDescription: formData.tripDescription || `${formData.rutaCompleta} - ${formData.clienteNombre}`,
        departureTime: departureDate.toISOString(),
        arrivalTime: arrivalDate.toISOString(), // Auto-calculado
        rutaOrigen: formData.rutaOrigen,
        rutaDestino: formData.rutaDestino,
        rutaCompleta: formData.rutaCompleta,
        distanciaTotal: 0, // Ya no se usa
        tiempoEstimado: 0, // Ya no se usa
        cargaDescripcion: formData.cargaDescripcion || "Carga general",
        cargaPeso: 0, // Ya no se usa
        cargaTipo: formData.cargaTipo,
        montoAcordado: Number(formData.montoAcordado),
        metodoPago: formData.metodoPago,
        condiciones: formData.condiciones,
        observaciones: formData.observaciones || "",
      };

      console.log('📤 Enviando payload:', dataToSend);

      const { data } = await api.post('/viajes-operativos/crear', dataToSend);

      if (!data?.success) {
        throw new Error(data?.message || "Error al crear el viaje operativo");
      }

      navigate("/viajesInternos");
    } catch (e) {
      console.error('❌ Error completo:', e);
      console.error('❌ Response data:', e.response?.data);
      setError(e.response?.data?.message || e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const tabsCard = "bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/viajesInternos")}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver a Viajes Operativos</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-3 sm:p-4 rounded-2xl shadow-lg">
              <Plus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#34353A] mb-1">
                Nuevo Viaje Operativo
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Programar viaje para cliente corporativo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
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

          {/* Cliente Corporativo */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
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

          {/* Fecha de Salida */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Calendar className="text-[#5F8EAD]" size={22} />
              Fecha y Hora de Carga
            </h3>

            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">
                Fecha/Hora Carga *
              </label>
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
              />
            
            </div>
          </div>

          {/* Ruta con Tarjetas Modernas */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <MapPin className="text-[#5D9646]" size={22} />
              Ruta
            </h3>

            {/* Rutas Frecuentes del Cliente */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#34353A] mb-3">
                Rutas Frecuentes del Cliente
              </label>

              {!formData.clienteId ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center">
                  <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 font-medium text-sm sm:text-base">
                    Selecciona un cliente para ver sus rutas frecuentes
                  </p>
                </div>
              ) : rutasCompletasOptions.length === 0 ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 sm:p-6 text-center">
                  <AlertCircle className="mx-auto text-amber-600 mb-2" size={28} />
                  <p className="text-amber-800 font-medium text-sm sm:text-base">
                    Este cliente no tiene rutas frecuentes registradas
                  </p>
                  <p className="text-amber-600 text-xs sm:text-sm mt-1">
                    Completa los campos manualmente abajo
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rutasCompletasOptions.map((ruta) => {
                    const isSelected =
                      formData.rutaOrigen === ruta.origen &&
                      formData.rutaDestino === ruta.destino;

                    return (
                      <button
                        key={ruta.id}
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({
                            ...p,
                            rutaOrigen: ruta.origen,
                            rutaDestino: ruta.destino,
                            rutaCompleta: `${ruta.origen}/${ruta.destino}`,
                          }));
                        }}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-[#5F8EAD] bg-gradient-to-br from-[#5F8EAD]/10 to-[#5F8EAD]/5 shadow-lg scale-[1.02]"
                            : "border-gray-200 hover:border-[#5F8EAD]/50 hover:shadow-md hover:scale-[1.01]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-[#5D9646] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                            <span className="hidden sm:inline">✓ Seleccionada</span>
                            <span className="sm:hidden">✓</span>
                          </div>
                        )}

                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              isSelected ? "bg-[#5F8EAD]" : "bg-gray-100"
                            }`}
                          >
                            <MapPin
                              className={isSelected ? "text-white" : "text-gray-600"}
                              size={20}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-bold text-sm mb-1 truncate ${
                                isSelected ? "text-[#5F8EAD]" : "text-[#34353A]"
                              }`}
                            >
                              {ruta.origen}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>→</span>
                              <span className="font-medium truncate">{ruta.destino}</span>
                            </div>
                          </div>
                        </div>

                        {ruta.vecesUsada > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <TrendingUp
                                size={12}
                                className={isSelected ? "text-[#5D9646]" : "text-gray-400"}
                              />
                              <span className="text-xs text-gray-600">
                                Usada {ruta.vecesUsada} {ruta.vecesUsada === 1 ? "vez" : "veces"}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Campos manuales de ruta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          </div>

          {/* Carga */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Package className="text-[#5F8EAD]" size={22} />
              Información de Carga
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Monto */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <DollarSign className="text-[#5F8EAD]" size={22} />
              Información Financiera
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Monto acordado *
                </label>
                <DollarSign className="absolute left-4 top-11 text-gray-400" size={18} />
                <input
                  type="number"
                  name="montoAcordado"
                  min="0"
                  step="0.01"
                  value={formData.montoAcordado}
                  onChange={(e) => {
                    const val = e.target.value;
                    const partes = val.split(".");
                    if (val === "" || (Number(val) >= 0 && partes[0].length <= 6)) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="Ej: 250.00"
                  max="999999.99"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Método de Pago *
                </label>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white"
                >
                  <option value="credito">Crédito</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conductor y Vehículo */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Truck className="text-[#5F8EAD]" size={22} />
              Conductor y Vehículo
            </h3>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Motorista Principal */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="text-[#5F8EAD]" size={16} />
                    Motorista Principal *
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingMotoristas ? (
                      <p className="text-gray-500 text-sm">Cargando motoristas...</p>
                    ) : motoristasPrincipalesOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay motoristas disponibles</p>
                    ) : (
                      motoristasPrincipalesOptions.map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.conductorId === m.id
                              ? "border-[#5F8EAD] bg-[#5F8EAD]/10 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="motorista"
                            value={m.id}
                            checked={formData.conductorId === m.id}
                            onChange={(e) => {
                              const conductorId = e.target.value;
                              const motorista = (motoristas || []).find(
                                (mo) => String(mo._id) === conductorId
                              );
                              const camionObj = motorista?.camion || motorista?.truck || null;

                              let associatedTruckId =
                                String(getMotoristaTruckId(motorista) || "") ||
                                (camionObj && (camionObj._id || camionObj.id)
                                  ? String(camionObj._id || camionObj.id)
                                  : "");

                              if (
                                !associatedTruckId &&
                                Array.isArray(camiones) &&
                                camiones.length > 0 &&
                                motorista
                              ) {
                                const mid = String(motorista._id || motorista.id || "");
                                for (const c of camiones) {
                                  try {
                                    if (String(c._id || c.id || "") === mid) {
                                      associatedTruckId = String(c._id || c.id);
                                      break;
                                    }

                                    const candidateFields = [
                                      "driverId",
                                      "motoristaId",
                                      "conductorId",
                                      "assignedDriver",
                                      "motorista",
                                      "driver",
                                      "conductor",
                                    ];
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

                                    for (const key of Object.keys(c || {})) {
                                      const val = c[key];
                                      if (!val) continue;
                                      if (
                                        typeof val === "string" &&
                                        (val === mid || val === motorista.id)
                                      ) {
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
                                  } catch (xx) {}
                                }
                              }

                              if (
                                !associatedTruckId &&
                                Array.isArray(camiones) &&
                                camiones.length === 1
                              ) {
                                associatedTruckId = String(camiones[0]._id || camiones[0].id || "");
                              }

                              if (
                                camionObj &&
                                (camionObj._id ||
                                  camionObj.id ||
                                  camionObj.placa ||
                                  camionObj.plate)
                              ) {
                                const newCamion = {
                                  ...camionObj,
                                  _id: camionObj._id || camionObj.id || associatedTruckId,
                                  placa:
                                    getCamionPlaca(camionObj) || camionObj.placa || camionObj.plate,
                                };
                                setCamiones((prev) =>
                                  prev.some((c) => String(c._id) === String(newCamion._id))
                                    ? prev
                                    : [...prev, newCamion]
                                );
                              } else if (associatedTruckId) {
                                setCamiones((prev) =>
                                  prev.some((c) => String(c._id) === associatedTruckId)
                                    ? prev
                                    : [...prev, { _id: associatedTruckId }]
                                );
                              }

                              const allowedCamionesIds = camiones
                                .filter((c) => {
                                  if (!c?._id) return false;
                                  const estado = String(c.state || c.estado || "").toUpperCase().replace(/\s+/g, "_");
                                  return estado !== "MANTENIMIENTO" && estado !== "EN_MANTENIMIENTO";
                                })
                                .map((c) => String(c._id));

                              setFormData((p) => ({
                                ...p,
                                conductorId,
                                truckId: associatedTruckId && allowedCamionesIds.includes(associatedTruckId)
                                  ? associatedTruckId
                                  : "",
                              }));
                            }}
                            className="w-4 h-4 text-[#5F8EAD] border-gray-300 focus:ring-[#5F8EAD] focus:ring-2 flex-shrink-0"
                          />
                          <div className="ml-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#5F8EAD] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {m.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 break-words">
                              {m.nombre}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Auxiliares */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="text-[#5F8EAD]" size={16} />
                    Auxiliares
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingMotoristas ? (
                      <p className="text-gray-500 text-sm">Cargando auxiliares...</p>
                    ) : auxiliaresOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay auxiliares disponibles</p>
                    ) : (
                      auxiliaresOptions.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.auxiliares.includes(a.id)
                              ? "border-[#5F8EAD] bg-[#5F8EAD]/10 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.auxiliares.includes(a.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData((p) => ({
                                ...p,
                                auxiliares: isChecked
                                  ? [...p.auxiliares, a.id]
                                  : p.auxiliares.filter((id) => id !== a.id),
                              }));
                            }}
                            className="w-4 h-4 text-[#5F8EAD] border-gray-300 rounded focus:ring-[#5F8EAD] focus:ring-2 flex-shrink-0"
                          />
                          <div className="ml-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {a.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 break-words">
                              {a.nombre}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.auxiliares.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Seleccionados ({formData.auxiliares.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.auxiliares.map((id) => {
                          const aux = auxiliaresOptions.find((a) => a.id === id);
                          return (
                            <div
                              key={id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                            >
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
                                {aux?.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="break-all">{aux?.nombre || "Desconocido"}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((p) => ({
                                    ...p,
                                    auxiliares: p.auxiliares.filter((auxId) => auxId !== id),
                                  }))
                                }
                                className="ml-2 text-green-600 hover:text-green-800 font-bold flex-shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Camión */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Truck size={14} />
                  Camión *
                </label>
                <select
                  value={formData.truckId}
                  onChange={(e) => setFormData((p) => ({ ...p, truckId: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">
                    {loadingCamiones
                      ? "Cargando camiones..."
                      : "Selecciona un camión disponible"}
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

          {/* Código Programación */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4">
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

          {/* Observaciones */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#34353A] mb-4">
              Dirección detallada del viaje
            </h3>

            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              placeholder="Notas adicionales del viaje... (opcional)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/viajesInternos")}
              className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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