import React from 'react';
import { Image, StyleSheet } from 'react-native';
import empleadoImg from '../images/empleado.png'; 

const Avatar = ({ size = 60 }) => {
  return (
    <Image
      source={empleadoImg}
      style={[styles.avatar, { width: size, height: size }]} 
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
  },
});

export default Avatar;
