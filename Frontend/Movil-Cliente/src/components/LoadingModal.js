import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export const LoadingModal = ({ visible, text = 'Cargando...' }) => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={visible}
  >
    <View style={loadingStyles.overlay}>
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={loadingStyles.text}>{text}</Text>
      </View>
    </View>
  </Modal>
);

const loadingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});