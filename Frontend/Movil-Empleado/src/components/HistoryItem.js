// src/components/HistoryItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

const HistoryItem = ({ item, onInfoPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {/* 🎬 LOTTIE en lugar del emoji */}
        <View style={styles.iconContainer}>
          <LottieView
            source={require('../images/Speedy car.json')}
            autoPlay
            loop
            style={styles.lottieIcon}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.tipo || 'Transporte de carga'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => onInfoPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.infoButtonText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieIcon: {
    width: 60,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  infoButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HistoryItem;