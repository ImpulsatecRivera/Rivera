import React from 'react';
import { View, Text } from 'react-native';

const AuthContainer = ({ 
  children, 
  title,
  titleColor = 'text-gray-900',
  backgroundColor = 'bg-white',
  padding = 'p-8',
  borderRadius = 'rounded-3xl',
  shadow = 'shadow-sm',
  titleSize = 'text-3xl',
  titleAlign = 'text-left',
  style
}) => {
  return (
    <View className="flex-1 justify-center">
      <View className={`${backgroundColor} ${borderRadius} ${padding} ${shadow}`} style={style}>
        {title && (
          <Text className={`${titleSize} font-bold ${titleColor} mb-8 ${titleAlign}`}>
            {title}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
};

export default AuthContainer;