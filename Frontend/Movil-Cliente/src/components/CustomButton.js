import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  backgroundColor = '#4CAF50',
  textColor = '#FFFFFF',
  disabled = false 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: disabled ? '#cccccc' : backgroundColor }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;