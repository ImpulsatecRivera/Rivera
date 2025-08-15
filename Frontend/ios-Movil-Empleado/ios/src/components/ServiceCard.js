import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import cargaImg from '../images/carga.png'; 

const ServiceCard = ({ trip, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(trip)}>
      <Image source={cargaImg} style={styles.iconImage} />

      <View style={styles.info}>
        <Text style={styles.title}>{trip.tipo}</Text>
        <Text style={styles.subtitle}>{trip.subtitulo}</Text>
        <Text style={styles.date}>{trip.fecha}</Text>

        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{trip.hora}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  timeBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ServiceCard;
