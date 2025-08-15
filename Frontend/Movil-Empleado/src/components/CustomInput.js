import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  icon, 
  secureTextEntry = false,
  showPassword,
  onTogglePassword,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  style
}) => {
  return (
    <View className="mb-4" style={style}>
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-4">
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color="#6B7280"
          />
        )}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          className="flex-1 text-gray-700 text-base ml-3"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#9CA3AF"
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={onTogglePassword}
            className="ml-2"
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;