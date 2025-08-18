import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const SocialButton = ({ type, onPress }) => {
  const getIconComponent = () => {
    switch (type) {
      case 'google':
        return <Icon name="google" size={24} color="#DB4437" />;
      case 'facebook':
        return <FontAwesome name="facebook" size={24} color="#4267B2" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'google':
        return '#FFFFFF';
      case 'facebook':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {getIconComponent()}
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialButton;