import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

const RUTA_IMG = require('../images/ruta.png');

const statusStyles = {
  pendiente:  { bg: '#FFF3CD', color: '#8A6D3B', label: 'Pendiente' },
  'en ruta':  { bg: '#DBEAFE', color: '#1E40AF', label: 'En ruta' },
  completado: { bg: '#E6FFFA', color: '#0F766E', label: 'Completado' },
  cancelado:  { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelado' },
};

// Props:
// - item: { title, status, lugarEntrega, horaLlegada, horaSalida, metodoPago }
// - onPress (opcional): si además quieres navegar o hacer algo externo
export default function HistorialCard({ item, onPress }) {
  const [expanded, setExpanded] = useState(false);

  // Habilitar animaciones en Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager?.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const st =
    statusStyles[(item?.status || '').toLowerCase()] ||
    { bg: '#EEE', color: '#333', label: item?.status || 'Sin estado' };

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
    // Si además te mandan onPress, lo llamamos (por si quieres navegar)
    if (typeof onPress === 'function') onPress(item);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={handlePress}
      accessible
      accessibilityLabel={`Cotización: ${item?.title || ''}, estado: ${st.label}`}
    >
      <View style={styles.imageWrap}>
        <Image source={RUTA_IMG} style={styles.image} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item?.title || 'Cotización'}
      </Text>

      <View style={[styles.badge, { backgroundColor: st.bg }]}>
        <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.detailText}>📍 Lugar: {item?.lugarEntrega ?? '—'}</Text>
          <Text style={styles.detailText}>⏱ Llegada: {item?.horaLlegada ?? '—'}</Text>
          <Text style={styles.detailText}>🚚 Salida: {item?.horaSalida ?? '—'}</Text>
          <Text style={styles.detailText}>💳 Pago: {item?.metodoPago ?? '—'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  image: { width: 64, height: 64, resizeMode: 'contain' },
  title: { fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  details: { marginTop: 10 },
  detailText: { fontSize: 12, color: '#374151', marginBottom: 4 },
});
