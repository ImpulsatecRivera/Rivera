import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import caminoImg from '../images/camino.png'; 

const DestinationCard = ({ destino, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(destino)}>
      <Image source={caminoImg} style={styles.imageIcon} />

      <Text style={styles.type}>{destino.tipo}</Text>
      <Text style={styles.date}>{destino.fecha}</Text>
      <Text style={styles.time}>{destino.hora}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageIcon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});

export default DestinationCard;
