import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatsCard = ({ number, label }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default StatsCard;