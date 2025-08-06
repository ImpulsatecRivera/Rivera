import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import logo from '../images/logo.png'; 

const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  logoImage: {
    width: 700,  
    height: 120,   
  },
});

export default LogoHeader;
