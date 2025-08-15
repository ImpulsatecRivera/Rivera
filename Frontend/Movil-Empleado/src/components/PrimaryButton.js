import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const PrimaryButton = ({ 
  title, 
  onPress, 
  backgroundColor = 'bg-green-500',
  textColor = 'text-white',
  disabled = false,
  loading = false,
  size = 'large', // 'small', 'medium', 'large'
  style
}) => {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'medium':
        return 'py-3 px-6';
      case 'large':
      default:
        return 'py-4 px-8';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
      default:
        return 'text-lg';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${backgroundColor} ${disabled || loading ? 'opacity-50' : ''} rounded-xl ${getSizeClasses()} mb-4`}
      activeOpacity={0.8}
      style={style}
    >
      <Text className={`${textColor} text-center ${getTextSizeClasses()} font-semibold`}>
        {loading ? 'Cargando...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;