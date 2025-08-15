import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

const RUTA_IMG = require('../images/ruta.png');

const statusStyles = {
  pendiente:  { bg: '#FFF3CD', color: '#8A6D3B', label: 'Pendiente' },
  'en ruta':  { bg: '#DBEAFE', color: '#1E40AF', label: 'En ruta' },
  completado: { bg: '#E6FFFA', color: '#0F766E', label: 'Completado' },
  cancelado:  { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelado' },
};

const HistorialCard = ({ item, onPress }) => {
  const st = statusStyles[(item?.status || '').toLowerCase()] || statusStyles.pendiente;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={RUTA_IMG} style={styles.image} />
      </View>

      <Text style={styles.title} numberOfLines={2}>{item?.title}</Text>

      <View style={[styles.badge, { backgroundColor: st.bg }]}>
        <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#E9ECEF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  imageWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  image: { width: 64, height: 64, resizeMode: 'contain' },
  title: { fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export default HistorialCard;
