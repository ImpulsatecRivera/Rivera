import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TextLink = ({ 
  text, 
  linkText, 
  onPress,
  textColor = 'text-gray-600',
  linkColor = 'text-blue-500',
  fontSize = 'text-sm',
  alignment = 'center', // 'left', 'center', 'right'
  underline = false,
  style
}) => {
  
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  return (
    <View className={`flex-row ${getAlignmentClass()}`} style={style}>
      <Text className={`${textColor} ${fontSize}`}>
        {text}{text ? ' ' : ''}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Text 
          className={`${linkColor} ${fontSize} font-medium ${underline ? 'underline' : ''}`}
        >
          {linkText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TextLink;