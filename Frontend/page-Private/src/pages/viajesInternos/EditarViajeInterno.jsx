import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  User,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { config } from "../../config";

const VIAJES_ENDPOINT = `${config.api.API_URL}/viajesinternos`;
const RUTAS_ENDPOINT = `${config.api.API_URL}/rutas`;
const CLIENTES_ENDPOINT = `${config.api.API_URL}/clientes`;
const MOTORISTAS_ENDPOINT = `${config.api.API_URL}/motoristas`;
const CAMIONES_ENDPOINT = `${config.api.API_URL}/camiones`;

const TIPO_SERVICIO = [
  { value: "REGULAR", label: "Regular" },
  { value: "ESCOLAR", label: "Escolar" },
  { value: "ESPECIAL", label: "Especial" },
  { value: "EMERGENCIA", label: "Emergencia" },
  { value: "OTRO", label: "Otro" },
];

const METODO_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "CREDITO", label: "Crédito" },
];

const ESTADO_VIAJE = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const isMongoId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

const parseDateSafe = (v) => {
  const d = new Date(v || "");
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
};

const getUbicacionLabel = (u) =>
  u?.nombreUbicacion || u?.nombre || u?.name || u?.texto || u?.direccion || "Ubicación";

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// ===== Helpers Motoristas / Camiones =====
const getMotoristaNombre = (m) =>
  m?.nombre ||
  m?.name ||
  [m?.nombres, m?.apellidos].filter(Boolean).join(" ") ||
  m?.motoristaNombre ||
  "Motorista";

const findPlacaDeep = (obj) => {
  if (!obj || typeof obj !== "object") return "";

  const direct =
    obj.placa ||
    obj.numeroPlaca ||
    obj.placaCamion ||
    obj.matricula ||
    obj.plate ||
    obj.vehiculo;

  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const stack = [{ v: obj, d: 0 }];
  const keyRegex = /(placa|plate|matricula|vehiculo)/i;

  while (stack.length) {
    const { v, d } = stack.pop();
    if (!v || typeof v !== "object") continue;
    if (d > 4) continue;

    for (const [k, val] of Object.entries(v)) {
      if (typeof val === "string" && keyRegex.test(k) && val.trim()) return val.trim();
      if (val && typeof val === "object") stack.push({ v: val, d: d + 1 });
    }
  }

  return "";
};

const getMotoristaPlaca = (m) => {
  const p =
    m?.vehiculo ||
    m?.placa ||
    m?.camion?.placa ||
    m?.camionAsignado?.placa ||
    m?.unidad?.placa ||
    m?.vehiculoPlaca ||
    "";
  return p?.trim?.() ? p.trim() : findPlacaDeep(m);
};

const getCamionPlaca = (c) => findPlacaDeep(c);
const norm = (s) => String(s || "").trim().toUpperCase();

export default function EditarViajeInterno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [ubicaciones, setUbicaciones] = useState([]);

  // ✅ Clientes
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const [clientesApiEnabled, setClientesApiEnabled] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "" });

  // ✅ Motoristas
  const [motoristas, setMotoristas] = useState([]);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);
  const [creatingMotorista, setCreatingMotorista] = useState(false);
  const [nuevoMotorista, setNuevoMotorista] = useState({ nombre: "", placa: "" });

  // ✅ Camiones
  const [camiones, setCamiones] = useState([]);
  const [loadingCamiones, setLoadingCamiones] = useState(false);
  const [creatingCamion, setCreatingCamion] = useState(false);
  const [nuevoCamion, setNuevoCamion] = useState({ placa: "" });

  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    clienteEsRecurrente: false,
    clienteId: "",

    clienteNombre: "",
    clienteTelefono: "",

    fecha: "",
    hora: "",

    tipoServicio: "REGULAR",
    metodoPago: "EFECTIVO",
    pagado: false,
    pasajeros: 1,

    monto: "",
    estado: "PENDIENTE",

    origen: { esRecurrente: false, ubicacionId: "", texto: "" },
    destino: { esRecurrente: false, ubicacionId: "", texto: "" },

    notas: "",
    referencias: "",

    conductor: { nombre: "", vehiculo: "" },

    // frontend only
    motoristaId: "",
    camionId: "",
  });

  // ✅ HOY para bloquear fechas futuras
  const todayISO = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  // =========================
  // Fetch: Ubicaciones
  // =========================
  const fetchUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const res = await fetch(RUTAS_ENDPOINT);
      const json = await res.json().catch(() => ({}));
      const rows = json?.data || (Array.isArray(json) ? json : []);
      setUbicaciones(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error cargando rutas/ubicaciones:", e);
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const ubicacionesOptions = useMemo(() => {
    return (ubicaciones || [])
      .filter((u) => u?._id)
      .map((u) => ({ id: u._id, label: getUbicacionLabel(u) }));
  }, [ubicaciones]);

  // =========================
  // Fetch: Clientes
  // =========================
  const fetchClientes = async () => {
    setLoadingClientes(true);
    try {
      // 1) /clientes
      try {
        const r1 = await fetch(CLIENTES_ENDPOINT);
        if (r1.ok) {
          const j1 = await r1.json().catch(() => ({}));
          const rows1 = j1?.data || (Array.isArray(j1) ? j1 : []);
          if (Array.isArray(rows1)) {
            setClientesApiEnabled(true);
            setClientes(rows1);
            return;
          }
        }
        setClientesApiEnabled(false);
      } catch (_) {
        setClientesApiEnabled(false);
      }

      // 2) fallback desde /viajesinternos (tomando el más reciente por nombre+tel)
      const r2 = await fetch(VIAJES_ENDPOINT);
      const j2 = await r2.json().catch(() => ({}));
      const rows2 = j2?.data || (Array.isArray(j2) ? j2 : []);

      const map = new Map();
      (rows2 || []).forEach((v) => {
        const nombre = String(v?.clienteNombre || "").trim();
        const telefono = String(v?.clienteTelefono || "").trim();
        if (!nombre) return;

        const key = `${nombre}|${telefono}`;
        const t = parseDateSafe(v?.fecha || v?.createdAt);

        const prev = map.get(key);
        if (!prev || t > prev.__t) {
          map.set(key, {
            _id: v?.clienteId?._id || v?.clienteId || key,
            clienteNombre: nombre,
            clienteTelefono: telefono,
            conductorNombre: v?.conductor?.nombre || "",
            conductorVehiculo: v?.conductor?.vehiculo || "",
            notas: v?.notas || "",
            referencias: v?.referencias || "",
            __t: t,
          });
        }
      });

      setClientes(Array.from(map.values()));
    } finally {
      setLoadingClientes(false);
    }
  };

  const clientesOptions = useMemo(() => {
    return (clientes || []).map((c) => {
      const nombre = c?.clienteNombre || c?.nombre || c?.name || "";
      const telefono = c?.clienteTelefono || c?.telefono || c?.phone || "";
      const cid = c?._id || c?.id || `${nombre}|${telefono}`;

      return {
        id: cid,
        nombre,
        telefono,
        label: telefono ? `${nombre} - ${telefono}` : nombre,
        conductorNombre: c?.conductorNombre || c?.conductor?.nombre || "",
        conductorVehiculo: c?.conductorVehiculo || c?.conductor?.vehiculo || "",
        notas: c?.notas || "",
        referencias: c?.referencias || "",
      };
    });
  }, [clientes]);

  const handleClienteToggle = (checked) => {
    setFormData((p) => ({
      ...p,
      clienteEsRecurrente: checked,
      clienteId: checked ? p.clienteId : "",
    }));
  };

  const handleClienteSelect = (clienteId) => {
    const found = clientesOptions.find((x) => x.id === clienteId);

    setFormData((p) => ({
      ...p,
      clienteEsRecurrente: true,
      clienteId,
      clienteNombre: found?.nombre || p.clienteNombre,
      clienteTelefono: found?.telefono || p.clienteTelefono,
      conductor: {
        nombre: p.conductor.nombre || found?.conductorNombre || "",
        vehiculo: p.conductor.vehiculo || found?.conductorVehiculo || "",
      },
      notas: p.notas || found?.notas || "",
      referencias: p.referencias || found?.referencias || "",
    }));
  };

  const crearClienteYSeleccionar = async () => {
    const nombre = (nuevoCliente.nombre || "").trim();
    const telefono = (nuevoCliente.telefono || "").trim();

    if (!nombre) return setError("Escribe el nombre del nuevo cliente");

    setCreatingCliente(true);
    setError(null);

    try {
      if (clientesApiEnabled) {
        const payload = { nombre, telefono, clienteNombre: nombre, clienteTelefono: telefono };

        const res = await fetch(CLIENTES_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const created = json?.data || json;
          const newId = created?._id || created?.id;

          await fetchClientes();

          setFormData((p) => ({
            ...p,
            clienteEsRecurrente: true,
            clienteId: newId || "",
            clienteNombre: nombre,
            clienteTelefono: telefono,
          }));

          setNuevoCliente({ nombre: "", telefono: "" });
          return;
        }
      }

      const localId = `${nombre}|${telefono}|${Date.now()}`;
      setClientes((prev) => [{ _id: localId, clienteNombre: nombre, clienteTelefono: telefono }, ...(prev || [])]);

      setFormData((p) => ({
        ...p,
        clienteEsRecurrente: true,
        clienteId: localId,
        clienteNombre: nombre,
        clienteTelefono: telefono,
      }));

      setNuevoCliente({ nombre: "", telefono: "" });
    } catch (e) {
      setError(e.message || "Error creando cliente");
    } finally {
      setCreatingCliente(false);
    }
  };

  // =========================
  // Fetch: Motoristas / Camiones
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
        const placa = getMotoristaPlaca(m);
        return { id: m._id, nombre, placa, label: placa ? `${nombre} - ${placa}` : nombre };
      });
  }, [motoristas]);

  const fetchCamiones = async () => {
    try {
      setLoadingCamiones(true);
      const res = await fetch(CAMIONES_ENDPOINT);
      const json = await res.json().catch(() => ({}));

      const rows =
        json?.data?.camiones ||
        json?.camiones ||
        json?.data ||
        (Array.isArray(json) ? json : []);

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
        return { id: c._id, placa, label: placa ? placa : `(Sin placa) ${String(c._id).slice(-6)}` };
      });
  }, [camiones]);

  const postMotorista = async (nombre, placa) => {
    const payload = { nombre, name: nombre, placa, vehiculo: placa };
    const res = await fetch(MOTORISTAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) throw new Error(json?.message || "No se pudo crear el motorista");

    const created = json?.data || json;
    return created?._id || created?.id || "";
  };

  const postCamion = async (placa) => {
    const payload = { placa, numeroPlaca: placa, placaCamion: placa, plate: placa, matricula: placa };

    const res = await fetch(CAMIONES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json?.success !== false) {
      const created = json?.data || json;
      return created?._id || created?.id || "";
    }

    const localId = `local-${Date.now()}`;
    setCamiones((prev) => [{ _id: localId, placa }, ...(prev || [])]);
    return localId;
  };

  const handleMotoristaSelect = (motoristaId) => {
    const found = motoristasOptions.find((x) => x.id === motoristaId);
    const placaMotorista = found?.placa || "";

    const matchCamion = placaMotorista
      ? camionesOptions.find((c) => norm(c.placa) === norm(placaMotorista))
      : null;

    setFormData((p) => ({
      ...p,
      motoristaId,
      camionId: matchCamion?.id || p.camionId,
      conductor: {
        nombre: found?.nombre || p.conductor.nombre,
        vehiculo: matchCamion?.placa || placaMotorista || p.conductor.vehiculo,
      },
    }));
  };

  const handleCamionSelect = (camionId) => {
    const found = camionesOptions.find((x) => x.id === camionId);
    setFormData((p) => ({
      ...p,
      camionId,
      conductor: { ...p.conductor, vehiculo: found?.placa || p.conductor.vehiculo },
    }));
  };

  const crearMotoristaYCamion = async () => {
    const nombre = (nuevoMotorista.nombre || "").trim();
    const placaMotorista = (nuevoMotorista.placa || "").trim();
    const placaCamion = (nuevoCamion.placa || "").trim();
    const placaFinal = placaCamion || placaMotorista;

    if (!nombre) return setError("Escribe el nombre del motorista");
    if (!placaFinal) return setError("Escribe la placa (del motorista o del camión)");

    try {
      setError(null);
      setCreatingMotorista(true);
      setCreatingCamion(true);

      const newMotoristaId = await postMotorista(nombre, placaFinal);
      const newCamionId = await postCamion(placaFinal);

      await Promise.all([fetchMotoristas(), fetchCamiones()]);

      setFormData((p) => ({
        ...p,
        motoristaId: newMotoristaId || p.motoristaId,
        camionId: newCamionId || p.camionId,
        conductor: { nombre, vehiculo: placaFinal },
      }));

      setNuevoMotorista({ nombre: "", placa: "" });
      setNuevoCamion({ placa: "" });
    } catch (e) {
      setError(e.message || "Error creando motorista/camión");
    } finally {
      setCreatingMotorista(false);
      setCreatingCamion(false);
    }
  };

  // =========================
  // Origen/Destino (igual que Agregar)
  // =========================
  const handleOrigenToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      origen: { esRecurrente: checked, ubicacionId: "", texto: checked ? "" : prev.origen.texto },
    }));
  };

  const handleDestinoToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      destino: { esRecurrente: checked, ubicacionId: "", texto: checked ? "" : prev.destino.texto },
    }));
  };

  const handleOrigenSelect = (ubicacionId) => {
    const found = ubicacionesOptions.find((x) => x.id === ubicacionId);
    setFormData((prev) => ({
      ...prev,
      origen: { ...prev.origen, ubicacionId, texto: found?.label || "" },
    }));
  };

  const handleDestinoSelect = (ubicacionId) => {
    const found = ubicacionesOptions.find((x) => x.id === ubicacionId);
    setFormData((prev) => ({
      ...prev,
      destino: { ...prev.destino, ubicacionId, texto: found?.label || "" },
    }));
  };

  const handleOrigenTexto = (value) => setFormData((prev) => ({ ...prev, origen: { ...prev.origen, texto: value } }));
  const handleDestinoTexto = (value) => setFormData((prev) => ({ ...prev, destino: { ...prev.destino, texto: value } }));
  const handleConductorChange = (field, value) =>
    setFormData((prev) => ({ ...prev, conductor: { ...prev.conductor, [field]: value } }));

  // =========================
  // ✅ Pagado => Estado COMPLETADO (y en UI se refleja)
  // =========================
  const handlePagadoToggle = (checked) => {
    setFormData((p) => ({
      ...p,
      pagado: checked,
      estado: checked ? "COMPLETADO" : p.estado === "COMPLETADO" ? "PENDIENTE" : p.estado,
    }));
  };

  // =========================
  // Cargar viaje por ID
  // =========================
  const fetchViaje = async () => {
    try {
      setLoadingPage(true);
      setError(null);

      const res = await fetch(`${VIAJES_ENDPOINT}/${id}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.message || "Error al cargar el viaje interno");

      const v = json?.data || json;
      const cid = v?.clienteId?._id || v?.clienteId || "";

      const pagado = !!v?.pagado;
      const estadoInicial = pagado
        ? "COMPLETADO"
        : v?.estado || v?.status || v?.estatus || "PENDIENTE";

      setFormData((p) => ({
        ...p,
        clienteEsRecurrente: !!cid,
        clienteId: cid || "",

        clienteNombre: v?.clienteNombre || "",
        clienteTelefono: v?.clienteTelefono || "",

        fecha: toInputDate(v?.fecha || v?.createdAt),
        hora: v?.hora || "",

        tipoServicio: v?.tipoServicio || "REGULAR",
        metodoPago: v?.metodoPago || "EFECTIVO",
        pagado,
        pasajeros: Number(v?.pasajeros ?? 1),

        monto: String(v?.monto ?? ""),

        estado: estadoInicial,

        origen: {
          esRecurrente: !!v?.origen?.esRecurrente,
          ubicacionId: v?.origen?.ubicacionId?._id || v?.origen?.ubicacionId || "",
          texto: v?.origen?.texto || "",
        },

        destino: {
          esRecurrente: !!v?.destino?.esRecurrente,
          ubicacionId: v?.destino?.ubicacionId?._id || v?.destino?.ubicacionId || "",
          texto: v?.destino?.texto || "",
        },

        notas: v?.notas || "",
        referencias: v?.referencias || "",

        conductor: {
          nombre: v?.conductor?.nombre || "",
          vehiculo: v?.conductor?.vehiculo || "",
        },

        // si existen en backend, los tomamos
        motoristaId: v?.motoristaId?._id || v?.motoristaId || "",
        camionId: v?.camionId?._id || v?.camionId || "",
      }));
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoadingPage(false);
    }
  };

  // Auto-match por placa si vino solo conductor.vehiculo
  useEffect(() => {
    const placa = (formData.conductor.vehiculo || "").trim();
    if (!placa) return;

    // camion
    if (!formData.camionId && camionesOptions.length) {
      const matchCamion = camionesOptions.find((c) => norm(c.placa) === norm(placa));
      if (matchCamion?.id) setFormData((p) => ({ ...p, camionId: matchCamion.id }));
    }

    // motorista
    if (!formData.motoristaId && motoristasOptions.length) {
      const matchMotorista = motoristasOptions.find((m) => norm(m.placa) === norm(placa));
      if (matchMotorista?.id) setFormData((p) => ({ ...p, motoristaId: matchMotorista.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camionesOptions, motoristasOptions]);

  useEffect(() => {
    fetchUbicaciones();
    fetchClientes();
    fetchMotoristas();
    fetchCamiones();
    fetchViaje();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================
  // Handlers generales
  // =========================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "pagado") return handlePagadoToggle(checked);
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================
  // Validación
  // =========================
  const validar = () => {
    if (!formData.clienteNombre.trim()) return "El nombre del cliente es requerido";
    if (!formData.fecha) return "La fecha es requerida";

    // ✅ no futuro
    if (formData.fecha > todayISO) return "No se permite seleccionar fechas a futuro";

    if (formData.clienteEsRecurrente && !formData.clienteId) {
      return "Selecciona un cliente existente o agrega uno nuevo";
    }

    const montoNum = Number(formData.monto);
    if (!formData.monto || Number.isNaN(montoNum) || montoNum <= 0) return "El monto debe ser mayor a 0";

    if (!formData.origen?.texto?.trim()) return "El origen es requerido";
    if (!formData.destino?.texto?.trim()) return "El destino es requerido";

    if (formData.origen.esRecurrente && !formData.origen.ubicacionId) return "Selecciona una ubicación recurrente para Origen";
    if (formData.destino.esRecurrente && !formData.destino.ubicacionId) return "Selecciona una ubicación recurrente para Destino";

    return null;
  };

  // =========================
  // Guardar (PUT)
  // =========================
  const submitUpdate = async () => {
    const err = validar();
    if (err) return setError(err);

    try {
      setSaving(true);
      setError(null);

      // ✅ pagado => COMPLETADO SIEMPRE
      const estadoFinal = formData.pagado ? "COMPLETADO" : (formData.estado || "PENDIENTE");

      const payload = {
        ...(isMongoId(formData.clienteId) ? { clienteId: formData.clienteId } : {}),

        clienteNombre: formData.clienteNombre,
        clienteTelefono: formData.clienteTelefono || "",

        estado: estadoFinal,
        status: estadoFinal,
        estatus: estadoFinal,

        origen: {
          texto: formData.origen.texto,
          esRecurrente: !!formData.origen.esRecurrente,
          ...(formData.origen.ubicacionId ? { ubicacionId: formData.origen.ubicacionId } : {}),
        },

        destino: {
          texto: formData.destino.texto,
          esRecurrente: !!formData.destino.esRecurrente,
          ...(formData.destino.ubicacionId ? { ubicacionId: formData.destino.ubicacionId } : {}),
        },

        monto: Number(formData.monto),
        fecha: formData.fecha,
        hora: formData.hora || "",

        tipoServicio: formData.tipoServicio,
        metodoPago: formData.metodoPago,
        pagado: !!formData.pagado,
        pasajeros: Number(formData.pasajeros) || 1,

        notas: formData.notas || "",
        referencias: formData.referencias || "",

        conductor: {
          nombre: formData.conductor.nombre || "",
          vehiculo: formData.conductor.vehiculo || "",
        },

        // si tu backend los acepta, los mandamos
        ...(isMongoId(formData.motoristaId) ? { motoristaId: formData.motoristaId } : {}),
        ...(isMongoId(formData.camionId) ? { camionId: formData.camionId } : {}),
      };

      const res = await fetch(`${VIAJES_ENDPOINT}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.message || "Error al actualizar el viaje interno");

      navigate("/viajesInternos");
    } catch (e) {
      setError(e.message || "Error al guardar");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI
  // =========================
  if (loadingPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Cargando viaje interno...</p>
          <p className="text-gray-400 text-sm mt-1">ID: {id}</p>
        </div>
      </div>
    );
  }

  const tabsCard = "bg-gray-50 rounded-2xl p-5 border border-gray-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/viajesInternos")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Viajes Internos
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Save className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Editar Viaje Interno</h1>
              <p className="text-gray-600">Actualiza la información del viaje</p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                  ID: {id}
                </span>

                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    formData.pagado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Estado: {formData.pagado ? "COMPLETADO" : (formData.estado || "PENDIENTE")}
                </span>
              </div>
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

          {/* Cliente */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-indigo-600" size={22} />
              Datos del Cliente
            </h3>

            <div className={tabsCard}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-900">Cliente *</p>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.clienteEsRecurrente}
                    onChange={(e) => handleClienteToggle(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Recurrente
                </label>
              </div>

              {formData.clienteEsRecurrente && (
                <>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Clientes existentes (backend)</label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => handleClienteSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    disabled={loadingClientes}
                  >
                    <option value="">{loadingClientes ? "Cargando clientes..." : "Seleccionar cliente..."}</option>
                    {clientesOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">¿No aparece? Agregar nuevo cliente</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        value={nuevoCliente.nombre}
                        onChange={(e) => setNuevoCliente((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Nombre (Ej: DIANA)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        value={nuevoCliente.telefono}
                        onChange={(e) => setNuevoCliente((p) => ({ ...p, telefono: e.target.value }))}
                        placeholder="Teléfono (Ej: 7890-1234)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={crearClienteYSeleccionar}
                        disabled={creatingCliente}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
                      >
                        {creatingCliente ? "Guardando..." : "Agregar"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Cliente *</label>
                  <input
                    type="text"
                    name="clienteNombre"
                    value={formData.clienteNombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="clienteTelefono"
                      value={formData.clienteTelefono}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Viaje */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={22} />
              Información del Viaje
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  max={todayISO}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora</label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pasajeros</label>
                <input
                  type="number"
                  name="pasajeros"
                  min="1"
                  step="1"
                  value={formData.pasajeros}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Servicio</label>
                <select
                  name="tipoServicio"
                  value={formData.tipoServicio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIPO_SERVICIO.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {METODO_PAGO.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl w-full cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="pagado"
                    checked={formData.pagado}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Pagado</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monto (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="monto"
                    min="0"
                    step="0.01"
                    value={formData.monto}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <select
                  name="estado"
                  value={formData.pagado ? "COMPLETADO" : formData.estado}
                  onChange={handleInputChange}
                  disabled={formData.pagado}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {ESTADO_VIAJE.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {formData.pagado && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    *Al marcar <b>Pagado</b>, el estado se fuerza a <b>COMPLETADO</b>.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Origen/Destino */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={22} />
              Origen y Destino
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origen */}
              <div className={tabsCard}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Origen *</p>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.origen.esRecurrente}
                      onChange={(e) => handleOrigenToggle(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Recurrente
                  </label>
                </div>

                {formData.origen.esRecurrente ? (
                  <>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Seleccionar ubicación</label>
                    <select
                      value={formData.origen.ubicacionId}
                      onChange={(e) => handleOrigenSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      disabled={loadingUbicaciones}
                    >
                      <option value="">{loadingUbicaciones ? "Cargando ubicaciones..." : "Seleccionar origen..."}</option>
                      {ubicacionesOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Texto (se envía al backend) *</label>
                      <input
                        type="text"
                        value={formData.origen.texto}
                        onChange={(e) => handleOrigenTexto(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección / nombre *</label>
                    <input
                      type="text"
                      value={formData.origen.texto}
                      onChange={(e) => handleOrigenTexto(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </>
                )}
              </div>

              {/* Destino */}
              <div className={tabsCard}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Destino *</p>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.destino.esRecurrente}
                      onChange={(e) => handleDestinoToggle(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Recurrente
                  </label>
                </div>

                {formData.destino.esRecurrente ? (
                  <>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Seleccionar ubicación</label>
                    <select
                      value={formData.destino.ubicacionId}
                      onChange={(e) => handleDestinoSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      disabled={loadingUbicaciones}
                    >
                      <option value="">{loadingUbicaciones ? "Cargando ubicaciones..." : "Seleccionar destino..."}</option>
                      {ubicacionesOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Texto (se envía al backend) *</label>
                      <input
                        type="text"
                        value={formData.destino.texto}
                        onChange={(e) => handleDestinoTexto(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección / nombre *</label>
                    <input
                      type="text"
                      value={formData.destino.texto}
                      onChange={(e) => handleDestinoTexto(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Conductor y Vehículo (igual que Agregar) */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="text-indigo-600" size={22} />
              Conductor y Vehículo
            </h3>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Motorista */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Motorista</label>
                  <select
                    value={formData.motoristaId}
                    onChange={(e) => handleMotoristaSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    disabled={loadingMotoristas}
                  >
                    <option value="">{loadingMotoristas ? "Cargando motoristas..." : "Seleccionar motorista..."}</option>
                    {motoristasOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Camión */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Camión (Placa)</label>
                  <select
                    value={formData.camionId}
                    onChange={(e) => handleCamionSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    disabled={loadingCamiones}
                  >
                    <option value="">{loadingCamiones ? "Cargando camiones..." : "Seleccionar camión..."}</option>
                    {camionesOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agregar ambos */}
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700 mb-2">¿No aparecen? Agregar motorista y camión (juntos)</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    value={nuevoMotorista.nombre}
                    onChange={(e) => setNuevoMotorista((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Nombre del motorista"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <input
                    value={nuevoMotorista.placa}
                    onChange={(e) => setNuevoMotorista((p) => ({ ...p, placa: e.target.value }))}
                    placeholder="Placa (para ambos)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <input
                    value={nuevoCamion.placa}
                    onChange={(e) => setNuevoCamion({ placa: e.target.value })}
                    placeholder="Placa camión (opcional)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={crearMotoristaYCamion}
                    disabled={creatingMotorista || creatingCamion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {creatingMotorista || creatingCamion ? "Guardando..." : "Agregar ambos"}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 mt-2">
                  *Si no escribís “Placa camión”, se usa la placa del motorista para crear el camión también.
                </p>
              </div>

              {/* Inputs manuales */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Conductor (opcional)</label>
                  <input
                    type="text"
                    value={formData.conductor.nombre}
                    onChange={(e) => handleConductorChange("nombre", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehículo/Placa (opcional)</label>
                  <input
                    type="text"
                    value={formData.conductor.vehiculo}
                    onChange={(e) => handleConductorChange("vehiculo", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notas / Referencias */}
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Referencias</label>
                  <textarea
                    value={formData.referencias}
                    onChange={(e) => setFormData((p) => ({ ...p, referencias: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/viajesInternos")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={submitUpdate}
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
  );
}
