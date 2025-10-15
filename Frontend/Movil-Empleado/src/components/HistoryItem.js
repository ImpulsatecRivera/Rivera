// src/components/HistoryItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import listaImg from '../images/lista.png';

/* ================= Helpers ================= */
const get = (o, path) =>
  String(path).split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), o);

const isHex = (hex) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

const hexWithAlpha = (hex, alpha = 0.15) => {
  const norm = isHex(hex) ? hex : '#757575';
  const toRgb = (h) => {
    let r, g, b;
    if (h.length === 4) {
      r = parseInt(h[1] + h[1], 16);
      g = parseInt(h[2] + h[2], 16);
      b = parseInt(h[3] + h[3], 16);
    } else {
      r = parseInt(h.slice(1, 3), 16);
      g = parseInt(h.slice(3, 5), 16);
      b = parseInt(h.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  return toRgb(norm);
};

const textSafe = (val, fb = '—') => {
  if (val == null) return fb;
  if (typeof val === 'string') return val.trim() || fb;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fb;
};

const MEH = ['n/a','sin descripción','cliente no especificado','por asignar','—'];
const isUseful = (s)=> typeof s==='string' && s.trim().length>0 && !MEH.includes(s.trim().toLowerCase());
const pickUseful = (...vals)=> { for (const v of vals) if (isUseful(v)) return String(v).trim(); return null; };

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
const guessNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  const [local] = email.split('@');
  if (!local) return null;
  const cleaned = local.replace(/[._-]+/g, ' ').replace(/\d+/g, ' ').trim();
  if (!cleaned || cleaned.length < 3) return null;
  const words = cleaned.split(/\s+/).slice(0, 4);
  const titled = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return looksLikeWeakName(titled) ? null : titled;
};

const estadoLabel = (estado) => {
  let raw = estado;
  if (estado && typeof estado === 'object') {
    raw = estado.actual ?? estado.nombre ?? estado.name ?? estado.estado ?? estado.status ?? '';
  }
  const s = String(raw || '').replace('_', ' ').toLowerCase();
  if (['en curso','en transito','en_transito'].includes(s)) return 'En tránsito';
  if (s === 'pendiente') return 'Pendiente';
  if (s === 'programado') return 'Programado';
  if (s === 'confirmado') return 'Confirmado';
  if (s === 'completado' || s === 'finalizado') return 'Completado';
  if (s === 'cancelado') return 'Cancelado';
  return '—';
};

/* ====== Fecha igual que en InfoViaje (sin hora) ====== */
const asDate = (v) => {
  if (!v) return null;
  const raw = (typeof v === 'object' && v.$date) ? v.$date : v;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const pickDepartureDate = (raw) => (
  asDate(raw?.departureTime) ||
  asDate(get(raw, 'horarios.fechaSalida')) ||
  asDate(raw?.fechaSalida) ||
  asDate(raw?.createdAt)
);

const fmtDate = (d) =>
  d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

/* ====== Normalizadores ====== */
const resolveTruck = (item) => {
  if (typeof item?.camion === 'string') return item.camion;

  const t = item?.truckId || item?.truck || item?.raw?.truckId || item?.raw?.truck || {};
  const brand = textSafe(t.brand ?? t.marca, '');
  const model = textSafe(t.model ?? t.modelo, '');
  const name  = textSafe(t.name ?? t.nombre, '');
  const plate = textSafe(t.licensePlate ?? t.placa ?? item?.placa ?? item?.unidad, '');

  let out = '';
  if (brand || model) out = `${brand} ${model}`.trim();
  else if (name) out = name;
  else if (plate) out = plate;

  if (out && plate && !out.includes(plate)) out += ` (${plate})`;
  return out || 'N/A';
};

const resolveClient = (item) => {
  const directPre = pickUseful(item?.cliente, item?.cotizacion, item?.raw?.cliente);
  if (directPre && !looksLikeWeakName(directPre)) return directPre;

  const q = item?.quoteId || item?.quote || item?.cotizacion || item?.raw?.quoteId || {};
  const c = q?.clientId || item?.customer || item?.raw?.customer || {};

  const full = [c?.firstName, c?.lastName].filter(Boolean).join(' ').trim();
  if (isUseful(full) && !looksLikeWeakName(full)) return full;

  const direct = pickUseful(c?.name, c?.nombre, q?.clientName, q?.clienteNombre, get(c,'razonSocial'), get(c,'razon'));
  if (direct && !looksLikeWeakName(direct)) return direct;

  const one = pickUseful(c?.firstName, c?.lastName);
  if (one && !looksLikeWeakName(one)) return one;

  const email = pickUseful(c?.email, get(q,'clientId.email'), item?.email, item?.raw?.email);
  const derived = guessNameFromEmail(email);
  if (derived) return derived;

  return '';
};

const resolveDriver = (item) => {
  const d = item?.motorista || item?.conductor || item?.driver || item?.raw?.conductorId || {};
  return textSafe(d?.name ?? d?.nombre ?? item?.driverName, '');
};

/* ===================== Componente ===================== */
const HistoryItem = ({ item = {}, onInfoPress }) => {
  const tipo = textSafe(item?.tipo, 'Transporte de carga');
  const color = isHex(item?.color) ? item.color : '#757575';

  const raw = item?.raw || item;
  const dep = pickDepartureDate(raw);
  const fecha = dep ? fmtDate(dep) : textSafe(item?.fecha, '');

  const camion = resolveTruck(item);
  const hasTruck = camion && camion !== 'N/A';
  const cliente = resolveClient(item);
  const conductor = resolveDriver(item);
  const estLabel = estadoLabel(item?.estado);
  const showBadge = !!item?.estado && estLabel !== '—';

  const handlePress = () => {
    if (typeof onInfoPress === 'function') onInfoPress(item);
  };

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <Image source={listaImg} style={styles.iconImage} />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.type} numberOfLines={1}>{tipo}</Text>

          {showBadge && (
            <View style={[styles.badge, { backgroundColor: hexWithAlpha(color, 0.15), borderColor: color }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.badgeText, { color }]} numberOfLines={1}>{estLabel}</Text>
            </View>
          )}
        </View>

        {/* Solo fecha (sin hora) */}
        {fecha ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{fecha}</Text>
          </View>
        ) : null}

        {(conductor || hasTruck) && (
          <View style={[styles.metaRow, { marginTop: 4 }]}>
            {conductor ? (
              <>
                <Text style={styles.metaText}>👤 {conductor}</Text>
                {hasTruck && <Text style={styles.metaText}> · </Text>}
              </>
            ) : null}
            {hasTruck && <Text style={styles.metaText}>🚚 {camion}</Text>}
          </View>
        )}

        {cliente ? (
          <View style={[styles.metaRow, { marginTop: 4 }]}>
            <Text style={styles.metaText}>🏢 {cliente}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.infoButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Ver información del viaje"
      >
        <Text style={styles.infoButtonText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  left: { marginRight: 12, alignItems: 'center' },
  iconImage: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  type: { fontSize: 16, fontWeight: '600', color: '#000', flexShrink: 1, marginRight: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  metaText: { fontSize: 12, color: '#444' },
  infoButton: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, marginLeft: 12 },
  infoButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

export default HistoryItem;
