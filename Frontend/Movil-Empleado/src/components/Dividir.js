import React from 'react';
import { View, Text } from 'react-native';

const Divider = ({ 
  text = "O",
  textColor = 'text-gray-500',
  lineColor = 'border-gray-300',
  fontSize = 'text-sm',
  marginY = 'mb-6',
  showLines = false, // true para mostrar líneas a los lados
  style
}) => {
  
  if (showLines) {
    return (
      <View className={`flex-row items-center ${marginY}`} style={style}>
        <View className={`flex-1 h-px ${lineColor.replace('text-', 'bg-')}`} />
        <Text className={`${textColor} ${fontSize} mx-4`}>
          {text}
        </Text>
        <View className={`flex-1 h-px ${lineColor.replace('text-', 'bg-')}`} />
      </View>
    );
  }

  return (
    <Text className={`${textColor} text-center ${marginY} ${fontSize}`} style={style}>
      {text}
    </Text>
  );
};

export default Divider;
