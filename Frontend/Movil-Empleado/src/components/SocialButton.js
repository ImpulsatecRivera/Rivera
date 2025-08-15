import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SocialButton = ({ 
  type, // 'google', 'facebook', 'apple', 'twitter'
  onPress,
  size = 'medium', // 'small', 'medium', 'large'
  style
}) => {
  
  const getButtonContent = () => {
    switch (type) {
      case 'google':
        return {
          text: 'G',
          textColor: 'text-red-500',
          icon: 'logo-google'
        };
      case 'facebook':
        return {
          text: 'f',
          textColor: 'text-blue-600',
          icon: 'logo-facebook'
        };
      case 'apple':
        return {
          text: '',
          textColor: 'text-black',
          icon: 'logo-apple'
        };
      case 'twitter':
        return {
          text: '',
          textColor: 'text-blue-400',
          icon: 'logo-twitter'
        };
      default:
        return {
          text: '?',
          textColor: 'text-gray-500',
          icon: 'help-outline'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10';
      case 'medium':
        return 'w-12 h-12';
      case 'large':
        return 'w-14 h-14';
      default:
        return 'w-12 h-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const { text, textColor, icon } = getButtonContent();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${getSizeClasses()} bg-white border border-gray-200 rounded-full justify-center items-center shadow-sm`}
      activeOpacity={0.7}
      style={style}
    >
      {icon && (text === '' || text === ' ') ? (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={textColor.replace('text-', '').replace('-500', '').replace('-600', '').replace('-400', '')}
        />
      ) : (
        <Text className={`text-xl font-bold ${textColor}`}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default SocialButton;