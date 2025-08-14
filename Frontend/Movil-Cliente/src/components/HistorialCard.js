import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const HistorialCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={styles.truckIcon}>
          <Text style={styles.truckEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationEmoji}>{item.location}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  truckIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10AC84',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckEmoji: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  locationBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#FF9F43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationEmoji: {
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default HistorialCard;