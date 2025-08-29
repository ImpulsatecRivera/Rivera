import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

const SocialButton = ({ type, onPress, disabled }) => {
  const getIcon = () => {
    switch (type) {
      case 'google':
        return 'G'; // Letra G estilizada como Google
      case 'facebook':
        return 'f';
      default:
        return '?';
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return '#CCCCCC';
    
    switch (type) {
      case 'google':
        return '#FFFFFF'; // Fondo blanco como el botón real de Google
      case 'facebook':
        return '#4267B2';
      default:
        return '#CCCCCC';
    }
  };

  const getTextColor = () => {
    if (disabled) return '#666666';
    
    switch (type) {
      case 'google':
        return '#DB4437'; // Rojo de Google sobre fondo blanco
      case 'facebook':
        return '#FFFFFF';
      default:
        return '#666666';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'google':
        return '#DB4437';
      case 'facebook':
        return '#4267B2';
      default:
        return '#E0E0E0';
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <Text style={[
          styles.iconText, 
          { color: getTextColor() },
          type === 'google' && styles.googleText
        ]}>
          {getIcon()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  googleText: {
    fontFamily: 'System', // Fuente del sistema
    fontSize: 24,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SocialButton;