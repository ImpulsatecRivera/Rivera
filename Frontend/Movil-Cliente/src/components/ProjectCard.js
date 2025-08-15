import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

const COTIZACION_IMG = require('../images/cotizacion.png');

const ProjectCard = ({ project, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {/* Imagen centrada, sin fondo y más grande */}
      <View style={styles.iconContainer}>
        <Image source={COTIZACION_IMG} style={styles.iconImg} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {project?.name}
      </Text>
      <Text style={styles.price} numberOfLines={1}>
        {project?.price}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#3F4B5B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconImg: {
    width: 100,         
    height: 100,         
    resizeMode: 'contain',
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 6,
  },
  price: {
    color: '#D1D5DB',
    fontSize: 11,
  },
});

export default ProjectCard;
