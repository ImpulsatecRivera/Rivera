import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(height * 0.52);

const pretty = (s = '') =>
  String(s).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const Row = ({ label, children }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={{ maxWidth: '60%' }}>{children}</View>
  </View>
);

const Pill = ({ children }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{children}</Text>
  </View>
);

// HH:MM local a partir de ISO
const fmtTime = (iso) => {
  if (!iso || iso === '—') return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
};

const QuoteSheet = ({ visible, item, onClose, onConfirm }) => {
  const anim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 0 : SHEET_HEIGHT, duration: 220, useNativeDriver: true }).start();
  }, [visible, anim]);

  if (!visible) return null;

  const estadoRaw = (item?.status || 'pendiente').toString();
  const payload = {
    titulo: item?.title || item?.name || 'Cotización',
    status: pretty(estadoRaw),
    metodoPago: (item?.paymentMethod || item?.metodoPago || '—').toString(),
    monto: item?.price || item?.monto || '—',
    horaLlegada: fmtTime(item?.horaLlegada || item?.arrivalTime),
    horaSalida: fmtTime(item?.horaSalida || item?.departureTime),
    lugarEntrega: item?.lugarEntrega || item?.deliveryPlace || '—',
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: anim }] }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cotización</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Row label="Carga"><Text style={styles.rowValue} numberOfLines={1}>{payload.titulo}</Text></Row>
          <Row label="Estado"><Pill>{payload.status}</Pill></Row>
          <Row label="Método de pago"><Text style={styles.rowValue}>{payload.metodoPago}</Text></Row>
          <Row label="Monto a pagar"><Text style={styles.rowValue}>{payload.monto}</Text></Row>
          <Row label="Hora de llegada"><Text style={styles.rowValue}>{payload.horaLlegada}</Text></Row>
          <Row label="Hora de salida"><Text style={styles.rowValue}>{payload.horaSalida}</Text></Row>
          <Row label="Lugar de entrega"><Text style={styles.rowValue}>{payload.lugarEntrega}</Text></Row>
        </View>

        <View style={styles.footer}>
          {!!onConfirm && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10AC84' }]} onPress={onConfirm}>
              <Text style={styles.actionText}>Cotizar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF4757', marginTop: 10 }]} onPress={onClose}>
            <Text style={styles.actionText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomColor: '#F0F0F0', borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  close: { fontSize: 18, color: '#8E9BAA' },
  content: { paddingHorizontal: 18, paddingTop: 10, gap: 10, paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: '#6B7280', fontSize: 13 },
  rowValue: { color: '#111827', fontSize: 14, fontWeight: '600' },
  pill: { backgroundColor: '#E6FFFA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pillText: { color: '#0F766E', fontWeight: '700', fontSize: 12 },
  footer: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 14 },
  actionBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontWeight: '700' },
});

export default QuoteSheet;
