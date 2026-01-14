// src/screens/InfoViajeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import Header from "../components/Header";
import { useAuth } from "../Context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHOW_DEBUG = false;

/* ========= Helpers ========== */
const isHex = (hex) =>
  typeof hex === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

const textSafe = (v, fb = "—") =>
  v === null || v === undefined
    ? fb
    : typeof v === "string"
    ? v.trim() || fb
    : String(v);

const get = (o, p) =>
  String(p || "")
    .split(".")
    .reduce((x, k) => (x && x[k] !== undefined ? x[k] : undefined), o);

const MEH = ["n/a", "sin descripción", "cliente no especificado", "por asignar", "—"];
const isUseful = (s) =>
  typeof s === "string" && s.trim().length > 0 && !MEH.includes(s.trim().toLowerCase());

const pickUseful = (...vals) => {
  for (const v of vals) {
    if (isUseful(v)) return String(v).trim();
  }
  return null;
};

const looksLikeWeakName = (s) => {
  if (!s) return true;
  const str = String(s).trim();
  if (!str) return true;
  if (str.includes("@")) return true;
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 6) return true;
  if (/\(\d/.test(str)) return true;
  return false;
};

const guessNameFromEmail = (email) => {
  if (!email || typeof email !== "string") return null;
  const [local] = email.split("@");
  if (!local) return null;
  const cleaned = local.replace(/[._-]+/g, " ").replace(/\d+/g, " ").trim();
  if (!cleaned || cleaned.length < 3) return null;
  const words = cleaned.split(/\s+/).slice(0, 4);
  const titled = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return looksLikeWeakName(titled) ? null : titled;
};

const hasNameFields = (o) => {
  if (!o || typeof o !== "object") return false;
  const v = (x) => typeof x === "string" && x.trim().length > 0;
  return v(o.name) || v(o.nombre) || v(o.firstName) || v(o.lastName) || v(o.razonSocial) || v(o.razon);
};

const unwrapOne = (c) => {
  if (!c) return null;
  if (Array.isArray(c)) return c.length ? unwrapOne(c[0]) : null;
  const wrappers = ["cliente", "client", "customer", "data", "user", "profile", "payload", "result", "value", "record", "item"];
  for (const k of wrappers) {
    if (c && typeof c[k] === "object") return unwrapOne(c[k]);
  }
  return c;
};

const deepFirstName = (c) =>
  pickUseful(
    get(c, "firstName"),
    get(c, "firstname"),
    get(c, "cliente.firstName"),
    get(c, "client.firstName"),
    get(c, "customer.firstName"),
    get(c, "data.firstName"),
    get(c, "user.firstName"),
    get(c, "profile.firstName")
  );

const deepLastName = (c) =>
  pickUseful(
    get(c, "lastName"),
    get(c, "lastname"),
    get(c, "cliente.lastName"),
    get(c, "client.lastName"),
    get(c, "customer.lastName"),
    get(c, "data.lastName"),
    get(c, "user.lastName"),
    get(c, "profile.lastName")
  );

const deepDirectName = (c) =>
  pickUseful(
    get(c, "name"),
    get(c, "nombre"),
    get(c, "displayName"),
    get(c, "cliente.name"),
    get(c, "cliente.nombre"),
    get(c, "client.name"),
    get(c, "client.nombre"),
    get(c, "customer.name"),
    get(c, "customer.nombre"),
    get(c, "data.name"),
    get(c, "data.nombre"),
    get(c, "profile.name")
  );

const deepEmail = (c) =>
  pickUseful(
    get(c, "email"),
    get(c, "cliente.email"),
    get(c, "client.email"),
    get(c, "customer.email"),
    get(c, "data.email"),
    get(c, "user.email"),
    get(c, "profile.email"),
    get(c, "contact.email")
  );

// ✅ Soporta fechas tipo { "$date": "..." } (Mongo export)
const fmtTime = (v) => {
  const raw = v && typeof v === "object" && v.$date ? v.$date : v;
  if (!raw) return "No especificada";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "No especificada";
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const estadoToColor = (estado) => {
  const s = String(estado || "").toLowerCase();
  if (s.includes("en curso") || s.includes("en_curso") || s.includes("en transito")) return "#9C27B0";
  if (s.includes("pendiente") || s.includes("programado") || s.includes("confirmado")) return "#FF9800";
  if (s.includes("completado") || s.includes("finalizado")) return "#4CAF50";
  if (s.includes("cancelado")) return "#F44336";
  return "#757575";
};

const getQuoteClientName = (q) => {
  if (!q || typeof q !== "object") return null;
  const direct =
    get(q, "clientId.name") ||
    get(q, "clientId.nombre") ||
    q.clientName ||
    q.clienteNombre ||
    get(q, "client.name") ||
    get(q, "client.nombre") ||
    get(q, "customer.name") ||
    get(q, "customer.nombre") ||
    q.clientDisplayName ||
    (isUseful(q.quoteName) && !looksLikeWeakName(q.quoteName) ? q.quoteName : null);

  if (isUseful(direct) && !looksLikeWeakName(direct)) return String(direct).trim();

  const cid = q.clientId;
  if (cid && typeof cid === "object") {
    const nm = cid.name || cid.nombre || cid.razonSocial || cid.razon;
    if (isUseful(nm) && !looksLikeWeakName(nm)) return String(nm).trim();
    const email = cid.email;
    const derived = guessNameFromEmail(email);
    if (derived) return derived;
    if (isUseful(email)) return email;
    if (isUseful(cid.phone)) return cid.phone;
    if (isUseful(cid.address)) return cid.address;
  }
  return null;
};

const getClientDisplayName = (cRaw) => {
  const c = unwrapOne(cRaw);
  if (!c || typeof c !== "object") return null;

  const fn = deepFirstName(c);
  const ln = deepLastName(c);
  const fullName = [fn, ln].filter(Boolean).join(" ").trim();
  if (isUseful(fullName) && !looksLikeWeakName(fullName)) return fullName;

  const direct = deepDirectName(c);
  if (direct && !looksLikeWeakName(direct)) return direct;

  const derived = guessNameFromEmail(deepEmail(c));
  if (derived) return derived;

  const email = deepEmail(c);
  if (isUseful(email)) return email;

  return null;
};

const getClientIdFromQuote = (q) => {
  if (!q || typeof q !== "object") return null;
  const quoteOwnId = (q && q._id && (q._id.$oid || q._id)) || q.id || q.$oid || null;

  const rawCandidates = [
    q.clientId,
    q.clienteId,
    q.customerId,
    q.userId,
    get(q, "client._id"),
    get(q, "client.id"),
    get(q, "customer._id"),
    get(q, "customer.id"),
  ].filter((v) => v !== undefined && v !== null);

  const hex24 = /^[0-9a-f]{24}$/i;
  for (const c of rawCandidates) {
    const idCandidate = typeof c === "string" ? c.trim() : (c && (c.$oid || c._id || c.id)) || null;
    if (!idCandidate) continue;
    const clean = String(idCandidate).trim();
    if (quoteOwnId && clean === String(quoteOwnId)) continue;
    if (hex24.test(clean)) return clean;
  }
  return null;
};

const resolveId = (v) =>
  typeof v === "string" && v.trim()
    ? v.trim()
    : v && (v._id || v.$oid || v.id)
    ? v._id?.$oid || v._id || v.$oid || v.id
    : null;

const getPayload = (resp) => {
  if (!resp || typeof resp !== "object") return resp;
  if (Object.prototype.hasOwnProperty.call(resp, "data")) return resp.data;
  if (resp.success && resp.data !== undefined) return resp.data;
  return resp;
};

const fetchWithAuth = async (url, token, signal) => {
  const fallbackToken =
    token ||
    (await AsyncStorage.getItem("userToken")) ||
    (await AsyncStorage.getItem("authToken")) ||
    (await AsyncStorage.getItem("token"));

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(fallbackToken && !/^temp(-register)?-token$/.test(fallbackToken)
      ? { Authorization: `Bearer ${fallbackToken}` }
      : {}),
  };

  const r = await fetch(url, { credentials: 'include', headers, signal });
  if (!r.ok) return null;
  try {
    return await r.json();
  } catch {
    return null;
  }
};

const tryFetchFirst = async (urls = [], token, signal) => {
  for (const u of urls) {
    const j = await fetchWithAuth(u, token, signal);
    const p = getPayload(j);
    if (p) return p;
  }
  return null;
};

/* ========= Extracción mejorada para ruta/origen/destino ========= */
const pickLocation = (raw, prefixes = []) => {
  const candidates = [];
  for (const pre of prefixes) {
    candidates.push(
      get(raw, `${pre}.nombre`),
      get(raw, `${pre}.name`),
      get(raw, `${pre}.direccion`),
      get(raw, `${pre}.address`),
      get(raw, `${pre}.location`),
      get(raw, `${pre}`)
    );
  }
  return pickUseful(...candidates);
};

// ✅ Parseo por texto tipo "RED ROCKS/ULTRA - CLIENTE" o "ORIGEN/DESTINO"
const parseRutaCompleta = (s) => {
  if (!s) return null;
  const base = String(s).split("-")[0].trim(); // antes del " - cliente"
  const parts = base.split("/").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { origen: parts[0], destino: parts[1] };
  return null;
};

const getTripUI = (tripOrRaw) => {
  const t = tripOrRaw || {};
  const raw = t.raw || t;

  const scanStrings = (obj, keyRegex, maxDepth = 4) => {
    const out = [];
    const seen = new WeakSet();
    const walk = (o, d) => {
      if (!o || typeof o !== "object" || d > maxDepth || seen.has(o)) return;
      seen.add(o);
      for (const [k, v] of Object.entries(o)) {
        if (keyRegex.test(String(k))) {
          if (typeof v === "string" && isUseful(v)) out.push(v.trim());
          else if (v && typeof v === "object") {
            const nm = v.name ?? v.nombre ?? v.title ?? v.razonSocial ?? v.razon ?? null;
            if (isUseful(nm)) out.push(String(nm).trim());
          }
        }
        if (v && typeof v === "object") walk(v, d + 1);
      }
    };
    walk(obj, 0);
    return out;
  };

  let cliente =
    pickUseful(
      get(t, "cotizacion.clientId.name"),
      get(t, "cotizacion.clientId.nombre"),
      get(t, "quoteId.clientId.name"),
      get(t, "quoteId.clientId.nombre"),
      raw.cliente,
      raw.clienteNombre,
      get(raw, "customer.name"),
      get(raw, "customer.nombre")
    ) ||
    scanStrings(raw, /(cliente|client|customer).*(name|nombre|razon)/i)[0] ||
    "Cliente no especificado";

  if (looksLikeWeakName(cliente)) {
    const anyEmail = pickUseful(
      get(t, "cotizacion.clientId.email"),
      get(t, "quoteId.clientId.email"),
      get(raw, "clientId.email"),
      get(raw, "client.email"),
      get(raw, "customer.email")
    );
    const derived = guessNameFromEmail(anyEmail);
    if (derived) cliente = derived;
  }

  const plate =
    pickUseful(
      t.placa,
      t.unidad,
      get(t, "truckId.licensePlate"),
      get(t, "truckId.placa"),
      get(t, "truck.licensePlate"),
      get(t, "truck.placa"),
      raw.placa,
      raw.unidad,
      raw.camion,
      raw.truckPlate,
      raw.truckNumber,
      get(raw, "truckId.licensePlate"),
      get(raw, "truckId.placa"),
      get(raw, "truck.licensePlate"),
      get(raw, "truck.placa")
    ) || scanStrings(raw, /(license|plate|placa|unidad)/i)[0];

  const brand =
    pickUseful(get(t, "truckId.brand"), get(t, "truckId.marca"), get(raw, "truckId.brand"), get(raw, "truckId.marca")) ||
    scanStrings(raw, /(brand|marca)/i)[0];

  const model =
    pickUseful(get(t, "truckId.model"), get(t, "truckId.modelo"), get(raw, "truckId.model"), get(raw, "truckId.modelo")) ||
    scanStrings(raw, /(model|modelo)/i)[0];

  const tname =
    pickUseful(get(t, "truckId.name"), get(t, "truckId.nombre"), get(raw, "truckId.name"), get(raw, "truckId.nombre")) ||
    scanStrings(raw, /(truck).*(name|nombre)/i)[0];

  let camion = pickUseful(t.camion);
  if (!camion) {
    if (brand || model) camion = `${brand || ""} ${model || ""}`.trim();
    else if (tname) camion = tname;
    else if (plate) camion = plate;
  }
  if (camion && plate && !camion.includes(plate)) camion += ` (${plate})`;
  camion = camion || "N/A";

  const descripcion =
    pickUseful(
      t.descripcion,
      t.tripDescription,
      get(t, "quoteId.quoteDescription"),
      raw.tripDescription,
      raw.descripcion,
      raw.detalle,
      raw.detalles,
      raw.observaciones,
      get(raw, "quoteId.quoteDescription"),
      get(raw, "quote.description"),
      get(raw, "quote.quoteDescription"),
      raw.quoteDescription
    ) ||
    scanStrings(raw, /(descripcion|description|detalle|observa)/i)[0] ||
    "Sin descripción";

  // ✅ rutaCompleta para fallback (operativos y otros)
  const rutaCompleta =
    pickUseful(
      get(raw, "rutaDirecta.rutaCompleta"),
      get(raw, "rutaCompleta"),
      get(raw, "routeName"),
      get(raw, "rutaNombre")
    ) || null;

  const parsedRuta = parseRutaCompleta(rutaCompleta || raw.tripDescription || descripcion);

  const horaSalida =
    pickUseful(t.horaSalida) ||
    fmtTime(raw.departureTime || get(raw, "horarios.fechaSalida") || get(raw, "fechaSalida"));

  const horaLlegada =
    pickUseful(t.horaLlegada) ||
    fmtTime(raw.arrivalTime || get(raw, "horarios.fechaLlegadaEstimada") || get(raw, "fechaLlegada"));

  const asistente =
    pickUseful(
      t.asistente,
      get(t, "asistente.nombre"),
      t.ayudante,
      t.helper,
      get(t, "conductorId.name"),
      get(t, "conductorId.nombre"),
      t.driverName,
      raw.asistente,
      get(raw, "asistente.nombre"),
      raw.ayudante,
      raw.helper,
      get(raw, "conductorId.name"),
      get(raw, "conductorId.nombre"),
      raw.driverName
    ) ||
    scanStrings(raw, /(asistente|ayudante|helper|conductor|driver).*(name|nombre)/i)[0] ||
    "Por asignar";

  // ✅ Soporta viajes operativos (rutaDirecta)
  const origen =
    pickUseful(
      // Operativo
      get(raw, "rutaDirecta.origen.nombre"),
      get(raw, "rutaDirecta.origen.name"),
      get(raw, "rutaDirecta.origen.direccion"),
      get(raw, "rutaDirecta.origen.address"),

      // Lo que ya tenías
      t.origen,
      get(t, "quoteId.ruta.origen.nombre"),
      get(t, "quoteId.ruta.origen.direccion"),
      get(t, "quoteId.ruta.origen.address"),
      raw.origen,
      raw.pickupLocation,
      raw.origin,
      get(raw, "ruta.origen.nombre"),
      get(raw, "ruta.origen.direccion"),
      get(raw, "ruta.origen.address"),
      get(raw, "quoteId.ruta.origen.nombre"),
      get(raw, "quoteId.ruta.origen.direccion"),
      get(raw, "quoteId.ruta.origen.address")
    ) ||
    pickLocation(raw, ["rutaDirecta.origen", "route.origin", "route.pickup", "ruta.origen", "ruta.pickup"]) ||
    pickUseful(parsedRuta?.origen) ||
    scanStrings(raw, /(origen|origin|pickup).*(nombre|name|direccion|address|location)/i)[0] ||
    null;

  const destino =
    pickUseful(
      // Operativo
      get(raw, "rutaDirecta.destino.nombre"),
      get(raw, "rutaDirecta.destino.name"),
      get(raw, "rutaDirecta.destino.direccion"),
      get(raw, "rutaDirecta.destino.address"),

      // Lo que ya tenías
      t.destino,
      get(t, "quoteId.ruta.destino.nombre"),
      get(t, "quoteId.ruta.destino.direccion"),
      get(t, "quoteId.ruta.destino.address"),
      raw.destino,
      raw.destinationLocation,
      raw.destination,
      get(raw, "ruta.destino.nombre"),
      get(raw, "ruta.destino.direccion"),
      get(raw, "ruta.destino.address"),
      get(raw, "quoteId.ruta.destino.nombre"),
      get(raw, "quoteId.ruta.destino.direccion"),
      get(raw, "quoteId.ruta.destino.address")
    ) ||
    pickLocation(raw, ["rutaDirecta.destino", "route.destination", "ruta.destino"]) ||
    pickUseful(parsedRuta?.destino) ||
    scanStrings(raw, /(destino|destination|dropoff).*(nombre|name|direccion|address|location)/i)[0] ||
    null;

  const estadoRaw = t.estado ?? raw.estado?.actual ?? raw.estado ?? "programado";
  const colorFinal = isHex(t.color) ? t.color : isHex(raw.color) ? raw.color : estadoToColor(estadoRaw);

  return {
    cliente,
    camion,
    descripcion,
    horaSalida,
    horaLlegada,
    asistente,
    origen,
    destino,
    tipo: isUseful(t.tipo) ? t.tipo : "Transporte de carga",
    color: colorFinal,
    estado: estadoRaw,
  };
};

/* ========= API Base ========= */
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "");
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, "");
const API_BASE_URL =
  (CLEAN_BASE || "https://rivera-test-629395560179.us-west1.run.app") + "/api";

/* ========= Estilos ========= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  content: {
    flexGrow: 1,
    padding: 16,
  },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tripTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  tripSubtitle: { fontSize: 14, color: "#666", lineHeight: 20 },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 8 },
  sectionIcon: { width: 24, height: 24, borderRadius: 6, justifyContent: "center", alignItems: "center", marginRight: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#666", textTransform: "uppercase", letterSpacing: 1 },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },

  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  infoIconContainer: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  infoContent: { flex: 1, minWidth: 0 },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 4, fontWeight: "500" },
  infoValue: { fontSize: 15, color: "#1A1A1A", fontWeight: "500", lineHeight: 20, flexWrap: "wrap", flexShrink: 1 },

  routeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  routePoint: { flexDirection: "row", alignItems: "flex-start" },
  routeIconContainer: { alignItems: "center", marginRight: 12 },
  routeIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  routeLine: { width: 2, flex: 1, backgroundColor: "#E0E0E0", marginVertical: 4 },
  routeInfo: { flex: 1, minWidth: 0, paddingBottom: 16 },
  routeLabel: { fontSize: 11, color: "#888", marginBottom: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  routeLocation: { fontSize: 15, color: "#1A1A1A", fontWeight: "600", marginBottom: 6, flexWrap: "wrap", flexShrink: 1 },
  routeTime: { fontSize: 13, color: "#666" },

  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },

  debugBox: { backgroundColor: "#FFF3CD", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#FFE69C" },
  debugTitle: { fontWeight: "700", marginBottom: 8, color: "#856404", fontSize: 14 },
  debugLine: { fontSize: 12, color: "#856404", marginBottom: 4, lineHeight: 18 },
  debugBtn: { alignSelf: "flex-start", backgroundColor: "#FFE69C", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 10 },
  debugBtnText: { color: "#856404", fontWeight: "600", fontSize: 13 },

  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
});

/* ========= UI ========= */
const Icon = ({ name, size = 20 }) => {
  const icons = {
    user: "👤",
    truck: "🚛",
    description: "📋",
    clock: "🕐",
    assistant: "👨‍🔧",
    location: "📍",
    route: "🗺️",
  };

  return (
    <Text
      style={{
        fontSize: size,
        lineHeight: size + 2,
        textAlign: "center",
        includeFontPadding: false,
      }}
    >
      {icons[name] || "•"}
    </Text>
  );
};

const InfoRow = ({ icon, label, value, iconBg = "#F0F4FF" }) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconContainer, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={18} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

/* ========= Screen ========= */
const InfoViajeScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const tabBarHeightParam = Number(route?.params?.tabBarHeight || 0);
  const effectiveTabBarHeight = tabBarHeightParam > 0 ? tabBarHeightParam : 90;

  const bottomPad = Math.max(insets.bottom ?? 0, 12) + effectiveTabBarHeight + 24;

  const tripParam = route?.params?.trip || null;
  const tripIdParam = route?.params?.tripId || null;

  const rawInitial = useMemo(() => {
    if (tripParam?.raw) return tripParam.raw;
    if (tripParam) return tripParam;
    if (tripIdParam) return { _id: tripIdParam };
    return null;
  }, [tripParam, tripIdParam]);

  const [raw, setRaw] = useState(rawInitial);
  const [ui, setUi] = useState(() => getTripUI({ raw: rawInitial || {} }));

  const [debug, setDebug] = useState({
    quoteFetch: null,
    truckFetch: null,
    driverFetch: null,
    clientFetch: null,
    quoteKeys: null,
    selectedClientName: null,
  });

  const missingTrip = !rawInitial;

  // 1) Traer viaje completo por ID si existe
  useEffect(() => {
    if (!rawInitial) return;
    const controller = new AbortController();
    const id = resolveId(rawInitial._id || rawInitial.id || rawInitial.viajeId);
    if (!id) return () => controller.abort();

    (async () => {
      const full = await tryFetchFirst(
        [`${API_BASE_URL}/viajes/${encodeURIComponent(id)}`, `${API_BASE_URL}/trips/${encodeURIComponent(id)}`],
        token,
        controller.signal
      );
      if (full) {
        setRaw(full);
        setUi(getTripUI({ raw: full }));
      }
    })();

    return () => controller.abort();
  }, [rawInitial, token]);

  // 2) Enriquecer cotización/cliente/camión/conductor + ✅ ruta desde cotización
  const enriquecer = useCallback(
    async (signal) => {
      if (!raw) return;
      const next = {};

      const missingOrigen = !isUseful(ui.origen);
      const missingDestino = !isUseful(ui.destino);
      const missingCliente = ui.cliente === "Cliente no especificado" || looksLikeWeakName(ui.cliente);

      // --- Cotización / Cliente / Ruta ---
      const qId = resolveId(raw?.quoteId || raw?.cotizacionId || raw?.quote || raw?.quote_id);
      if ((missingCliente || missingOrigen || missingDestino) && qId) {
        const q = await tryFetchFirst(
          [
            `${API_BASE_URL}/cotizaciones/${encodeURIComponent(qId)}`,
            `${API_BASE_URL}/quotes/${encodeURIComponent(qId)}`,
            `${API_BASE_URL}/quote/${encodeURIComponent(qId)}`,
          ],
          token,
          signal
        );

        setDebug((d) => ({ ...d, quoteFetch: q, quoteKeys: q ? Object.keys(q).join(", ") : null }));

        // ---- Cliente desde cotización
        let clientName = getQuoteClientName(q);

        let clientIdRaw = q?.clientIdSimple ?? q?.clientId ?? q?.clienteId ?? q?.customerId ?? null;
        let cid =
          (typeof clientIdRaw === "string" && clientIdRaw) ||
          (clientIdRaw && (clientIdRaw.$oid || clientIdRaw._id || clientIdRaw.id)) ||
          getClientIdFromQuote(q) ||
          null;

        const qClientObj = q && typeof q.clientId === "object" && !Array.isArray(q.clientId) ? q.clientId : null;
        const missingNameFields = !!qClientObj && !hasNameFields(qClientObj);
        const needsLookup = !!cid && (!clientName || looksLikeWeakName(clientName) || missingNameFields);

        if (needsLookup) {
          const cRaw = await tryFetchFirst(
            [
              `${API_BASE_URL}/clientes/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/cliente/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/customers/${encodeURIComponent(cid)}`,
            ],
            token,
            signal
          );
          setDebug((d) => ({ ...d, clientFetch: cRaw }));
          const better = getClientDisplayName(cRaw);
          if (isUseful(better)) clientName = better;
        }

        setDebug((d) => ({ ...d, selectedClientName: clientName || "(vacío)" }));

        const desc = q?.quoteDescription || q?.descripcion || null;
        if (clientName && missingCliente) next.cliente = clientName;
        if (desc && !isUseful(ui.descripcion)) next.descripcion = desc;

        // ✅ Ruta desde cotización (si no venía en el viaje)
        if (missingOrigen || missingDestino) {
          const qRutaCompleta =
            pickUseful(
              get(q, "ruta.rutaCompleta"),
              get(q, "rutaDirecta.rutaCompleta"),
              get(q, "rutaCompleta"),
              get(q, "routeName"),
              get(q, "route.rutaCompleta"),
              q?.tripDescription,
              q?.quoteDescription
            ) || null;

          const qp = parseRutaCompleta(qRutaCompleta);

          const qOrigen =
            pickUseful(
              get(q, "ruta.origen.nombre"),
              get(q, "ruta.origen.direccion"),
              get(q, "ruta.origen.address"),
              get(q, "route.origin.name"),
              get(q, "route.origin.address"),
              get(q, "origen.nombre"),
              get(q, "origen.direccion"),
              get(q, "origin"),
              pickLocation(q, ["ruta.origen", "route.origin", "route.pickup", "origen"]),
              qp?.origen
            ) || null;

          const qDestino =
            pickUseful(
              get(q, "ruta.destino.nombre"),
              get(q, "ruta.destino.direccion"),
              get(q, "ruta.destino.address"),
              get(q, "route.destination.name"),
              get(q, "route.destination.address"),
              get(q, "destino.nombre"),
              get(q, "destino.direccion"),
              get(q, "destination"),
              pickLocation(q, ["ruta.destino", "route.destination", "destino"]),
              qp?.destino
            ) || null;

          if (qOrigen && missingOrigen) next.origen = qOrigen;
          if (qDestino && missingDestino) next.destino = qDestino;
        }
      }

      // --- Camión ---
      const tId = resolveId(raw?.truckId || raw?.camionId || raw?.truck || raw?.truck_id);
      if ((ui.camion === "N/A" || ui.camion === "—") && tId) {
        const t = await tryFetchFirst(
          [
            `${API_BASE_URL}/camiones/${encodeURIComponent(tId)}`,
            `${API_BASE_URL}/trucks/${encodeURIComponent(tId)}`,
            `${API_BASE_URL}/truck/${encodeURIComponent(tId)}`,
          ],
          token,
          signal
        );
        setDebug((d) => ({ ...d, truckFetch: t }));
        if (t) {
          const brand = t.brand || t.marca || "";
          const model = t.model || t.modelo || "";
          const plate = t.licensePlate || t.placa || "";
          let truckTxt = brand || model ? `${brand} ${model}`.trim() : t.name || t.nombre || "";
          if (!truckTxt && plate) truckTxt = plate;
          if (truckTxt && plate && !truckTxt.includes(plate)) truckTxt += ` (${plate})`;
          if (truckTxt) next.camion = truckTxt;
        }
      }

      // --- Conductor / Asistente ---
      const dId = resolveId(raw?.conductorId || raw?.driverId || raw?.motoristaId);
      if ((ui.asistente === "Por asignar" || !ui.asistente) && dId) {
        const d = await tryFetchFirst(
          [
            `${API_BASE_URL}/motoristas/${encodeURIComponent(dId)}`,
            `${API_BASE_URL}/drivers/${encodeURIComponent(dId)}`,
            `${API_BASE_URL}/usuarios/${encodeURIComponent(dId)}`,
          ],
          token,
          signal
        );
        setDebug((prev) => ({ ...prev, driverFetch: d }));
        const name = d?.name || d?.nombre || null;
        if (name) next.asistente = name;
      }

      if (Object.keys(next).length) setUi((prev) => ({ ...prev, ...next }));
    },
    [raw, token, ui.cliente, ui.camion, ui.asistente, ui.descripcion, ui.origen, ui.destino]
  );

  useEffect(() => {
    if (!raw) return;
    const controller = new AbortController();
    enriquecer(controller.signal);
    return () => controller.abort();
  }, [enriquecer, raw]);

  const estadoLabel = String(ui.estado || "programado").toLowerCase();
  const estadoDisplay =
    estadoLabel.includes("en curso") || estadoLabel.includes("en_curso")
      ? "En Curso"
      : estadoLabel.includes("completado") || estadoLabel.includes("finalizado")
      ? "Completado"
      : estadoLabel.includes("cancelado")
      ? "Cancelado"
      : estadoLabel.includes("pendiente")
      ? "Pendiente"
      : "Programado";

  return (
    <View style={styles.container}>
      <View pointerEvents="box-none">
        <Header title="Información del viaje" showBack onBack={() => navigation.goBack()} />
      </View>

      {missingTrip ? (
        <View style={{ padding: 20 }}>
          <Text>No se encontró información del viaje</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Estado */}
          <View style={styles.statusCard}>
            <View style={[styles.statusBadge, { backgroundColor: ui.color }]}>
              <Text style={styles.statusText}>{estadoDisplay}</Text>
            </View>
            <Text style={styles.tripTitle}>{textSafe(ui.tipo, "Transporte de carga")}</Text>
            <Text style={styles.tripSubtitle}>{textSafe(ui.descripcion, "Sin descripción")}</Text>
          </View>

          {/* Detalles del servicio */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Icon name="route" size={14} />
            </View>
            <Text style={styles.sectionTitle}>Detalles del servicio</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow icon="user" label="Cliente" value={textSafe(ui.cliente, "Cliente no especificado")} iconBg="#F0F4FF" />
            <View style={styles.divider} />
            <InfoRow icon="truck" label="Camión asignado" value={textSafe(ui.camion, "N/A")} iconBg="#FFF4E6" />
            <View style={styles.divider} />
            <InfoRow icon="assistant" label="Conductor / Asistente" value={textSafe(ui.asistente, "Por asignar")} iconBg="#F3E5F5" />
          </View>

          {/* Ruta */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Icon name="location" size={14} />
            </View>
            <Text style={styles.sectionTitle}>Ruta</Text>
          </View>

          <View style={styles.routeCard}>
            {/* Origen */}
            <View style={styles.routePoint}>
              <View style={styles.routeIconContainer}>
                <View style={[styles.routeIcon, { backgroundColor: "#4CAF50" }]}>
                  <Text style={{ color: "#fff", fontSize: 16 }}>A</Text>
                </View>
                <View style={styles.routeLine} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Origen</Text>
                <Text style={styles.routeLocation}>{textSafe(ui.origen, "No especificado")}</Text>
                <Text style={styles.routeTime}>🕐 {textSafe(ui.horaSalida, "No especificada")}</Text>
              </View>
            </View>

            {/* Destino */}
            <View style={styles.routePoint}>
              <View style={styles.routeIconContainer}>
                <View style={[styles.routeIcon, { backgroundColor: "#F44336" }]}>
                  <Text style={{ color: "#fff", fontSize: 16 }}>B</Text>
                </View>
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Destino</Text>
                <Text style={styles.routeLocation}>{textSafe(ui.destino, "No especificado")}</Text>
                <Text style={styles.routeTime}>🕐 {textSafe(ui.horaLlegada, "No especificada")}</Text>
              </View>
            </View>
          </View>

          {/* Horarios */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Icon name="clock" size={14} />
            </View>
            <Text style={styles.sectionTitle}>Horarios</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow icon="clock" label="Hora de salida" value={textSafe(ui.horaSalida, "No especificada")} iconBg="#E8F5E9" />
            <View style={styles.divider} />
            <InfoRow icon="clock" label="Hora de llegada" value={textSafe(ui.horaLlegada, "No especificada")} iconBg="#FFEBEE" />
          </View>

          {SHOW_DEBUG && (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>🔧 Panel de diagnóstico</Text>
              <Text style={styles.debugLine}>• token: {textSafe(token ? "(sí)" : "(no)")}</Text>
              <Text style={styles.debugLine}>• cotización keys: {textSafe(debug.quoteKeys, "(no)")}</Text>
              <Text style={styles.debugLine}>• cliente elegido: {textSafe(debug.selectedClientName, "(no)")}</Text>
              <TouchableOpacity
                style={styles.debugBtn}
                onPress={() => {
                  const c = new AbortController();
                  enriquecer(c.signal);
                }}
              >
                <Text style={styles.debugBtnText}>🔄 Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Volver a la lista</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default InfoViajeScreen;
