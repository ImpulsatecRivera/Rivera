import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import listaImg from '../images/lista.png'; 

const HistoryItem = ({ item, onInfoPress }) => {
  return (
    <View style={styles.item}>
      <Image source={listaImg} style={styles.iconImage} />

      <View style={styles.info}>
        <Text style={styles.type}>{item.tipo}</Text>
        <Text style={styles.subtitle}>{item.subtitulo}</Text>
      </View>

      <TouchableOpacity 
        style={styles.infoButton}
        onPress={() => onInfoPress(item)}
      >
        <Text style={styles.infoButtonText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  iconImage: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HistoryItem;
