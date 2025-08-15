import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import avatarImg from '../images/empleado.png'; 

const GreetingSection = ({ name, subtitle, avatarText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>¡Hola!, {name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Avatar text={avatarText} size={60} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default GreetingSection;