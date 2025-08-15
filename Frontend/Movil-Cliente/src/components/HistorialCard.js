import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

const RUTA_IMG = require('../images/ruta.png');

const HistorialCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Imagen del viaje */}
      <View style={styles.imageWrap}>
        <Image source={RUTA_IMG} style={styles.image} />
      </View>

      {/* Título de la carga */}
      <Text style={styles.title} numberOfLines={2}>
        {item?.title}
      </Text>

      {/* Estado visible nuevamente */}
      {item?.status === 'completed' && (
        <View style={[styles.badge, styles.badgeCompleted]}>
          <Text style={styles.badgeText}>Completado</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

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
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  badgeCompleted: {
    backgroundColor: '#E6FFFA',
  },
  badgeText: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '700',
  },
});

export default HistorialCard;
