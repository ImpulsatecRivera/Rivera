// src/screens/InfoViajeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import Header from '../components/Header';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const isLargeScreen = screenWidth > 414;
/* 👇 cambia a true si quieres volver a ver el bloque de diagnóstico */
const SHOW_DEBUG = false;

/* ========= Helpers ========== */
const isHex = (hex) => typeof hex === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
const textSafe = (v, fb='—') => (v===null||v===undefined) ? fb : (typeof v==='string' ? (v.trim()||fb) : String(v));
const get = (o, p) => String(p||'').split('.').reduce((x,k)=> (x&&x[k]!==undefined?x[k]:undefined), o);

const MEH = ['n/a','sin descripción','cliente no especificado','por asignar','—'];
const isUseful = (s)=> typeof s==='string' && s.trim().length>0 && !MEH.includes(s.trim().toLowerCase());
const pickUseful = (...vals)=> { for(const v of vals){ if(isUseful(v)) return String(v).trim(); } return null; };

/* 🔸 Detecta “nombre” débil (correo/teléfono) para forzar fetch del cliente */
const looksLikeWeakName = (s) => {
  if (!s) return true;
  const str = String(s).trim();
  if (!str) return true;
  if (str.includes('@')) return true;
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 6) return true;
  if (/\(\d/.test(str)) return true;
  return false;
};

/* ✨ Derivar un nombre legible desde el email */
const guessNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  const [local] = email.split('@');
  if (!local) return null;
  const cleaned = local.replace(/[._-]+/g, ' ').replace(/\d+/g, ' ').trim();
  if (!cleaned || cleaned.length < 3) return null;
  const words = cleaned.split(/\s+/).slice(0, 4);
  const titled = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return looksLikeWeakName(titled) ? null : titled;
};

/* ✅ Detectar si un objeto tiene campos de nombre reales */
const hasNameFields = (o) => {
  if (!o || typeof o !== 'object') return false;
  const v = (x) => typeof x === 'string' && x.trim().length > 0;
  return v(o.name) || v(o.nombre) || v(o.firstName) || v(o.lastName) || v(o.razonSocial) || v(o.razon);
};

/* ✅ Leer nombres/correo profundamente sin importar el envoltorio */
const unwrapOne = (c) => {
  if (!c) return null;
  if (Array.isArray(c)) return c.length ? unwrapOne(c[0]) : null;
  const wrappers = ['cliente','client','customer','data','user','profile','payload','result','value','record','item'];
  for (const k of wrappers) {
    if (c && typeof c[k] === 'object') return unwrapOne(c[k]);
  }
  return c;
};
const deepFirstName = (c) =>
  pickUseful(
    get(c,'firstName'), get(c,'firstname'),
    get(c,'cliente.firstName'), get(c,'client.firstName'), get(c,'customer.firstName'),
    get(c,'data.firstName'), get(c,'user.firstName'), get(c,'profile.firstName')
  );
const deepLastName = (c) =>
  pickUseful(
    get(c,'lastName'), get(c,'lastname'),
    get(c,'cliente.lastName'), get(c,'client.lastName'), get(c,'customer.lastName'),
    get(c,'data.lastName'), get(c,'user.lastName'), get(c,'profile.lastName')
  );
const deepDirectName = (c) =>
  pickUseful(
    get(c,'name'), get(c,'nombre'), get(c,'displayName'),
    get(c,'cliente.name'), get(c,'cliente.nombre'),
    get(c,'client.name'), get(c,'client.nombre'),
    get(c,'customer.name'), get(c,'customer.nombre'),
    get(c,'data.name'), get(c,'data.nombre'),
    get(c,'profile.name')
  );
const deepEmail = (c) =>
  pickUseful(
    get(c,'email'),
    get(c,'cliente.email'), get(c,'client.email'), get(c,'customer.email'),
    get(c,'data.email'), get(c,'user.email'), get(c,'profile.email'), get(c,'contact.email')
  );

const fmtTime = (v)=>{
  if(!v) return 'No especificada';
  const d=new Date(v);
  if(isNaN(d.getTime())) return 'No especificada';
  return d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',hour12:true});
};
const estadoToColor = (estado)=>{
  const s=String(estado||'').toLowerCase();
  if(s.includes('en curso')||s.includes('en_curso')||s.includes('en transito'))return '#9C27B0';
  if(s.includes('pendiente')||s.includes('programado')||s.includes('confirmado'))return '#FF9800';
  if(s.includes('completado')||s.includes('finalizado'))return '#4CAF50';
  if(s.includes('cancelado'))return '#F44336';
  return '#757575';
};

/* 🔹 Helpers de cliente */
const getQuoteClientName = (q) => {
  if (!q || typeof q !== 'object') return null;

  const direct =
    get(q,'clientId.name') || get(q,'clientId.nombre') ||
    q.clientName || q.clienteNombre ||
    get(q,'client.name') || get(q,'client.nombre') ||
    get(q,'customer.name') || get(q,'customer.nombre') ||
    q.clientDisplayName ||
    (isUseful(q.quoteName) && !looksLikeWeakName(q.quoteName) ? q.quoteName : null);
  if (isUseful(direct) && !looksLikeWeakName(direct)) return String(direct).trim();

  const cid = q.clientId;
  if (cid && typeof cid === 'object') {
    const nm = cid.name || cid.nombre || cid.razonSocial || cid.razon;
    if (isUseful(nm) && !looksLikeWeakName(nm)) return String(nm).trim();

    const email = cid.email;
    const derived = guessNameFromEmail(email);
    if (derived) return derived;

    const phone = cid.phone;
    const address = cid.address;
    if (isUseful(email)) return email;
    if (isUseful(phone)) return phone;
    if (isUseful(address)) return address;
  }
  return null;
};

/* 🟢 PRIORIDAD a firstName + lastName cuando exista */
const getClientDisplayName = (cRaw) => {
  const c = unwrapOne(cRaw);
  if (!c || typeof c !== 'object') return null;

  const fn = deepFirstName(c);
  const ln = deepLastName(c);
  const fullName = [fn, ln].filter(Boolean).join(' ').trim();
  if (isUseful(fullName) && !looksLikeWeakName(fullName)) return fullName;

  const direct = deepDirectName(c);
  if (direct && !looksLikeWeakName(direct)) return direct;

  if (isUseful(fn) && !looksLikeWeakName(fn)) return fn;
  if (isUseful(ln) && !looksLikeWeakName(ln)) return ln;

  const derived = guessNameFromEmail(deepEmail(c));
  if (derived) return derived;

  const email = deepEmail(c);
  if (isUseful(email)) return email;

  return null;
};

/* ✅ Detector ESTRICTO de clientId en la cotización */
const getClientIdFromQuote = (q) => {
  if (!q || typeof q !== 'object') return null;

  const quoteOwnId =
    (q && (q._id && (q._id.$oid || q._id))) ||
    q.id || q.$oid || null;

  const rawCandidates = [
    q.clientId, q.clienteId, q.customerId, q.userId,
    get(q, 'clientId'), get(q, 'clienteId'), get(q, 'customerId'), get(q, 'userId'),
    get(q, 'client._id'), get(q, 'client.id'), get(q, 'client.$oid'),
    get(q, 'cliente._id'), get(q, 'cliente.id'), get(q, 'cliente.$oid'),
    get(q, 'customer._id'), get(q, 'customer.id'), get(q, 'customer.$oid'),
  ].filter((v) => v !== undefined && v !== null);

  const hex24 = /^[0-9a-f]{24}$/i;
  for (const c of rawCandidates) {
    const idCandidate =
      typeof c === 'string' ? c.trim() :
      (c && (c.$oid || c._id || c.id)) || null;

    if (!idCandidate) continue;
    const clean = String(idCandidate).trim();

    if (quoteOwnId && clean === String(quoteOwnId)) continue;
    if (hex24.test(clean)) return clean;
  }
  return null;
};

/* Adaptador local sin red */
const getTripUI = (tripOrRaw)=>{
  const t = tripOrRaw || {};
  const raw = t.raw || t;

  const scanStrings = (obj, keyRegex, maxDepth=4)=>{
    const out=[]; const seen=new WeakSet();
    const walk=(o,d)=>{
      if(!o||typeof o!=='object'||d>maxDepth||seen.has(o)) return;
      seen.add(o);
      for(const [k,v] of Object.entries(o)){
        if(keyRegex.test(String(k))){
          if(typeof v==='string' && isUseful(v)) out.push(v.trim());
          else if(v && typeof v==='object'){
            const nm = v.name ?? v.nombre ?? v.title ?? v.razonSocial ?? v.razon ?? null;
            if(isUseful(nm)) out.push(String(nm).trim());
          }
        }
        if(v && typeof v==='object') walk(v,d+1);
      }
    };
    walk(obj,0); return out;
  };

  let cliente =
    pickUseful(
      t.cotizacion,
      get(t,'cotizacion.clientId.name'), get(t,'cotizacion.clientId.nombre'),
      get(t,'quoteId.clientId.name'),    get(t,'quoteId.clientId.nombre'),
      raw.cliente, raw.clienteNombre, get(raw,'customer.name'), get(raw,'customer.nombre')
    ) || scanStrings(raw,/(cliente|client|customer).*(name|nombre|razon)/i)[0] || 'Cliente no especificado';

  if (looksLikeWeakName(cliente)) {
    const anyEmail = pickUseful(
      get(t,'cotizacion.clientId.email'),
      get(t,'quoteId.clientId.email'),
      get(raw,'clientId.email'),
      get(raw,'client.email'),
      get(raw,'customer.email')
    );
    const derived = guessNameFromEmail(anyEmail);
    if (derived) cliente = derived;
  }

  const plate =
    pickUseful(
      t.placa,t.unidad,
      get(t,'truckId.licensePlate'),get(t,'truckId.placa'),
      get(t,'truck.licensePlate'),  get(t,'truck.placa'),
      raw.placa,raw.unidad,raw.camion,raw.truckPlate,raw.truckNumber,
      get(raw,'truckId.licensePlate'),get(raw,'truckId.placa'),
      get(raw,'truck.licensePlate'),  get(raw,'truck.placa')
    ) || scanStrings(raw,/(license|plate|placa|unidad)/i)[0];

  const brand = pickUseful(get(t,'truckId.brand'),get(t,'truckId.marca'),get(raw,'truckId.brand'),get(raw,'truckId.marca')) || scanStrings(raw,/(brand|marca)/i)[0];
  const model = pickUseful(get(t,'truckId.model'),get(t,'truckId.modelo'),get(raw,'truckId.model'),get(raw,'truckId.modelo')) || scanStrings(raw,/(model|modelo)/i)[0];
  const tname = pickUseful(get(t,'truckId.name'),get(t,'truckId.nombre'),get(raw,'truckId.name'),get(raw,'truckId.nombre')) || scanStrings(raw,/(truck).*(name|nombre)/i)[0];

  let camion = pickUseful(t.camion);
  if(!camion){
    if(brand||model) camion = `${brand||''} ${model||''}`.trim();
    else if(tname) camion = tname;
    else if(plate) camion = plate;
  }
  if(camion && plate && !camion.includes(plate)) camion += ` (${plate})`;
  camion = camion || 'N/A';

  const descripcion =
    pickUseful(
      t.descripcion,t.tripDescription,get(t,'quoteId.quoteDescription'),
      raw.tripDescription,raw.descripcion,raw.detalle,raw.detalles,raw.observaciones,
      get(raw,'quoteId.quoteDescription'),
      get(raw,'quote.description'),get(raw,'quote.quoteDescription'),
      raw.quoteDescription
    ) || scanStrings(raw,/(descripcion|description|detalle|observa)/i)[0] || 'Sin descripción';

  const horaSalida  = pickUseful(t.horaSalida)  || fmtTime(raw.departureTime || get(raw,'horarios.fechaSalida') || get(raw,'fechaSalida'));
  const horaLlegada = pickUseful(t.horaLlegada) || fmtTime(raw.arrivalTime   || get(raw,'horarios.fechaLlegadaEstimada') || get(raw,'fechaLlegada'));

  const asistente =
    pickUseful(
      t.asistente,get(t,'asistente.nombre'),t.ayudante,t.helper,
      get(t,'conductorId.name'),get(t,'conductorId.nombre'),t.driverName,
      raw.asistente,get(raw,'asistente.nombre'),raw.ayudante,raw.helper,
      get(raw,'conductorId.name'),get(raw,'conductorId.nombre'),raw.driverName
    ) || scanStrings(raw,/(asistente|ayudante|helper|conductor|driver).*(name|nombre)/i)[0] || 'Por asignar';

  const origen  = pickUseful(
    t.origen, get(t,'quoteId.ruta.origen.nombre'), raw.origen, raw.pickupLocation, get(raw,'quoteId.ruta.origen.nombre')
  ) || null;

  const destino = pickUseful(
    t.destino, get(t,'quoteId.ruta.destino.nombre'), raw.destino, raw.destinationLocation, get(raw,'quoteId.ruta.destino.nombre')
  ) || null;

  const estadoRaw = t.estado ?? raw.estado?.actual ?? raw.estado ?? 'programado';
  const colorFinal = isHex(t.color) ? t.color : isHex(raw.color) ? raw.color : estadoToColor(estadoRaw);

  return { cliente,camion,descripcion,horaSalida,horaLlegada,asistente,origen,destino,
    tipo: isUseful(t.tipo)?t.tipo:'Transporte de carga',
    fecha: isUseful(t.fecha)?t.fecha:null,
    hora:  isUseful(t.hora)?t.hora:null,
    color: colorFinal, estado: estadoRaw
  };
};

/* ===== Base API / auth fetch ===== */
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, '');
const API_BASE_URL = (CLEAN_BASE || 'https://riveraproject-production-933e.up.railway.app') + '/api';

const resolveId = (v)=> typeof v==='string'&&v.trim()? v.trim() : (v && (v._id || v.$oid)) || null;

// acepta {message,data} o {success,data} o el objeto directo
const getPayload = (resp)=>{
  if (!resp || typeof resp !== 'object') return resp;
  if (Object.prototype.hasOwnProperty.call(resp, 'data')) return resp.data;
  if (resp.success && resp.data !== undefined) return resp.data;
  return resp;
};

const fetchWithAuth = async (url, token, signal) => {
  const fallbackToken =
    token ||
    (await AsyncStorage.getItem('userToken')) ||
    (await AsyncStorage.getItem('authToken')) ||
    (await AsyncStorage.getItem('token'));

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(fallbackToken && !/^temp(-register)?-token$/.test(fallbackToken)
      ? { Authorization: `Bearer ${fallbackToken}` }
      : {}),
  };

  const r = await fetch(url, { headers, signal });
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
};

const tryFetchFirst = async (urls = [], token, signal) => {
  for (const u of urls) {
    const j = await fetchWithAuth(u, token, signal);
    const p = getPayload(j);
    if (p) return p;
  }
  return null;
};

/* ========= Estilos ========== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? (isLargeScreen ? 180 : 120) : (isLargeScreen ? 160 : 100),
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: '#000', marginBottom: 8, fontWeight: '500' },
  inputContainer: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8 },
  inputText: { fontSize: 16, color: '#666' },
  volverButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  volverButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  debugBox: { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:16, borderWidth:1, borderColor:'#eee' },
  debugTitle: { fontWeight:'700', marginBottom:6, color:'#333' },
  debugLine: { fontSize:12, color:'#555', marginBottom:3 },
  debugBtn: { alignSelf:'flex-start', backgroundColor:'#e0e0e0', paddingVertical:8, paddingHorizontal:12, borderRadius:6, marginTop:8 },
});

/* ========= Screen ========== */
const InfoViajeScreen = ({ navigation, route }) => {
  const { trip } = route.params || {};
  const { token } = useAuth();

  if (!trip) {
    return (
      <View style={styles.container}>
        <Header title="Información del viaje" showBack onBack={() => navigation.goBack()} />
        <View style={{ padding: 20 }}>
          <Text>No se encontró información del viaje</Text>
        </View>
      </View>
    );
  }

  const rawInitial = useMemo(()=> trip?.raw || trip || {}, [trip]);
  const [ui, setUi] = useState(()=> getTripUI(rawInitial));
  const [raw, setRaw] = useState(rawInitial);
  const [debug, setDebug] = useState({
    quoteFetch:null, truckFetch:null, driverFetch:null, clientFetch:null,
    clientIdDetected:null, clientIdRaw:null,
    quoteKeys:null, quoteHasDisplayName:null, quoteClientIdType:null,
    selectedClientName:null,
  });

  // Fallback: si viene sin refs, pedir el viaje completo por ID
  useEffect(() => {
    const controller = new AbortController();
    const needRefs = !resolveId(rawInitial.quoteId) && !resolveId(rawInitial.truckId) && !resolveId(rawInitial.conductorId);
    const hasId = resolveId(rawInitial.id);

    if (needRefs && hasId) {
      (async () => {
        const full = await tryFetchFirst(
          [
            `${API_BASE_URL}/viajes/${encodeURIComponent(hasId)}`,
            `${API_BASE_URL}/trips/${encodeURIComponent(hasId)}`
          ],
          token,
          controller.signal
        );
        if (full) {
          setRaw(full);
          setUi(getTripUI({ raw: full }));
        }
      })();
    }

    return () => controller.abort();
  }, [rawInitial, token]);

  // Enriquecedor por IDs
  const enriquecer = useCallback(async ()=>{
    const controller = new AbortController();
    const next = {};
    try {
      // Cliente
      const qId = resolveId(raw.quoteId);
      if ((ui.cliente === 'Cliente no especificado' || looksLikeWeakName(ui.cliente)) && qId) {
        const q = await tryFetchFirst(
          [
            `${API_BASE_URL}/cotizaciones/${encodeURIComponent(qId)}`,
            `${API_BASE_URL}/quotes/${encodeURIComponent(qId)}`,
            `${API_BASE_URL}/quote/${encodeURIComponent(qId)}`
          ],
          token,
          controller.signal
        );

        const qKeys = q ? Object.keys(q) : [];
        const qHasDisplay = !!(q && (q.clientDisplayName || q.client_name || q.clienteNombre));
        const qClientIdVal =
          q?.clientIdSimple ?? q?.clientId ?? q?.clienteId ?? q?.customerId ??
          get(q,'client._id') ?? get(q,'client.id') ?? null;
        setDebug((d)=>({
          ...d,
          quoteFetch: q,
          quoteKeys: qKeys.join(', '),
          quoteHasDisplayName: qHasDisplay ? 'sí' : 'no',
          quoteClientIdType: qClientIdVal ? typeof qClientIdVal : '(no)'
        }));

        let clientName = getQuoteClientName(q);

        const quoteOwnId =
          (q && (q._id && (q._id.$oid || q._id))) ||
          q?.id || q?.$oid || null;

        let clientIdRaw = q?.clientIdSimple ?? q?.clientId ?? q?.clienteId ?? q?.customerId ?? null;
        let cid =
          (typeof clientIdRaw === 'string' && clientIdRaw) ||
          (clientIdRaw && (clientIdRaw.$oid || clientIdRaw._id || clientIdRaw.id)) ||
          getClientIdFromQuote(q) ||
          null;

        if (quoteOwnId && cid && String(cid) === String(quoteOwnId)) cid = null;

        setDebug((d)=>({
          ...d,
          clientIdRaw: clientIdRaw
            ? (typeof clientIdRaw === 'object' ? JSON.stringify(clientIdRaw) : String(clientIdRaw))
            : '(no)',
          clientIdDetected: cid || '(no)',
        }));

        const qClientObj = (q && typeof q.clientId === 'object' && !Array.isArray(q.clientId)) ? q.clientId : null;
        const missingNameFields = !!qClientObj && !hasNameFields(qClientObj);
        const needsLookup = !!cid && ( !clientName || looksLikeWeakName(clientName) || missingNameFields );

        if (needsLookup) {
          const cRaw = await tryFetchFirst(
            [
              `${API_BASE_URL}/clientes/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/clientes/cliente/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/clients/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/customers/${encodeURIComponent(cid)}`,
              `${API_BASE_URL}/cliente/${encodeURIComponent(cid)}`
            ],
            token,
            controller.signal
          );
          setDebug((d)=>({...d, clientFetch: cRaw}));

          const c = unwrapOne(cRaw);
          const fn = deepFirstName(c);
          const ln = deepLastName(c);
          const full = [fn, ln].filter(Boolean).join(' ').trim();
          if (isUseful(full) && !looksLikeWeakName(full)) {
            clientName = full;
          } else {
            const better = getClientDisplayName(c);
            if (isUseful(better)) clientName = better;
            if ((!clientName || looksLikeWeakName(clientName))) {
              const derived = guessNameFromEmail(deepEmail(c));
              if (derived) clientName = derived;
            }
          }
        }

        if (!clientName && cid) clientName = `ID: ${cid}`;

        setDebug((d)=>({ ...d, selectedClientName: clientName || '(vacío)' }));

        const desc = q?.quoteDescription || q?.descripcion || null;

        if (clientName) next.cliente = clientName;
        if (desc && !isUseful(ui.descripcion)) next.descripcion = desc;
      }

      // Camión
      const tId = resolveId(raw.truckId);
      if (ui.camion === 'N/A' && tId) {
        const t = await tryFetchFirst(
          [
            `${API_BASE_URL}/camiones/${encodeURIComponent(tId)}`,
            `${API_BASE_URL}/trucks/${encodeURIComponent(tId)}`,
            `${API_BASE_URL}/truck/${encodeURIComponent(tId)}`
          ],
          token,
          controller.signal
        );
        setDebug((d)=>({...d, truckFetch: t}));
        if (t) {
          const brand = t.brand || t.marca || '';
          const model = t.model || t.modelo || '';
          const plate = t.licensePlate || t.placa || '';
          let truckTxt = (brand||model) ? `${brand} ${model}`.trim() : (t.name || t.nombre || '');
          if (!truckTxt && plate) truckTxt = plate;
          if (truckTxt && plate && !truckTxt.includes(plate)) truckTxt += ` (${plate})`;
          if (truckTxt) next.camion = truckTxt;
        }
      }

      // Conductor / Asistente
      const dId = resolveId(raw.conductorId);
      if ((ui.asistente === 'Por asignar' || !ui.asistente) && dId) {
        const d = await tryFetchFirst(
          [
            `${API_BASE_URL}/motoristas/${encodeURIComponent(dId)}`,
            `${API_BASE_URL}/drivers/${encodeURIComponent(dId)}`,
            `${API_BASE_URL}/usuarios/${encodeURIComponent(dId)}`
          ],
          token,
          controller.signal
        );
        setDebug((prev)=>({...prev, driverFetch: d}));
        const name = d?.name || d?.nombre || null;
        if (name) next.asistente = name;
      }
    } finally {
      if (Object.keys(next).length) setUi((prev)=> ({...prev, ...next}));
    }
    return ()=> controller.abort();
  }, [raw, token, ui.cliente, ui.camion, ui.asistente, ui.descripcion]);

  useEffect(() => {
    const clean = enriquecer();
    return () => { typeof clean === 'function' && clean(); };
  }, [enriquecer]);

  const FormField = ({ label, value, fallback }) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>{textSafe(value, fallback)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Información del viaje" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator bounces>
        {/* 🧪 DEBUG (oculto por SHOW_DEBUG) */}
        {SHOW_DEBUG && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>Diagnóstico</Text>
            <Text style={styles.debugLine}>quoteId: {textSafe(resolveId(raw.quoteId),'(no)')}</Text>
            <Text style={styles.debugLine}>truckId: {textSafe(resolveId(raw.truckId),'(no)')}</Text>
            <Text style={styles.debugLine}>conductorId: {textSafe(resolveId(raw.conductorId),'(no)')}</Text>
            <Text style={styles.debugLine}>token: {textSafe(token ? '(sí)' : '(no)')}</Text>
            <Text style={styles.debugLine}>fetch cotización: {textSafe(debug.quoteFetch ? 'OK' : '—')}</Text>
            <Text style={styles.debugLine}>cotización keys: {textSafe(debug.quoteKeys,'(no)')}</Text>
            <Text style={styles.debugLine}>cotización trae clientDisplayName: {textSafe(debug.quoteHasDisplayName,'(no)')}</Text>
            <Text style={styles.debugLine}>tipo de clientId en cotización: {textSafe(debug.quoteClientIdType,'(no)')}</Text>
            <Text style={styles.debugLine}>clientId (raw): {textSafe(debug.clientIdRaw,'(no)')}</Text>
            <Text style={styles.debugLine}>clientId detectado: {textSafe(debug.clientIdDetected,'(no)')}</Text>
            <Text style={styles.debugLine}>fetch cliente: {textSafe(debug.clientFetch ? 'OK' : '—')}</Text>
            <Text style={styles.debugLine}>cliente elegido: {textSafe(debug.selectedClientName,'(no)')}</Text>
            <Text style={styles.debugLine}>fetch camión: {textSafe(debug.truckFetch ? 'OK' : '—')}</Text>
            <Text style={styles.debugLine}>fetch motorista: {textSafe(debug.driverFetch ? 'OK' : '—')}</Text>
            <TouchableOpacity style={styles.debugBtn} onPress={enriquecer}>
              <Text>Reintentar enriquecer</Text>
            </TouchableOpacity>
          </View>
        )}

        <FormField label="Cotización de"   value={ui.cliente}     fallback="Cliente no especificado" />
        <FormField label="Camión encargado" value={ui.camion}      fallback="N/A" />
        <FormField label="Descripción"      value={ui.descripcion} fallback="Sin descripción" />
        <FormField label="Hora de llegada"  value={ui.horaLlegada} fallback="No especificada" />
        <FormField label="Hora de salida"   value={ui.horaSalida}  fallback="No especificada" />
        <FormField label="Asistente"        value={ui.asistente}   fallback="Por asignar" />

        <TouchableOpacity
          style={styles.volverButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Volver a la lista de viajes"
        >
          <Text style={styles.volverButtonText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default InfoViajeScreen;
