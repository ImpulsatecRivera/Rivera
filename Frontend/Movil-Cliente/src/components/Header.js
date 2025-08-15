import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';


const Header = ({
  statusBarBg = '#F5F5F5',
  bg = '#FFFFFF',
  showNotification = false,
  onPressNotification,
}) => {
  return (
    <View style={{ backgroundColor: statusBarBg }}>
      {/* Controla explícitamente el StatusBar de la pantalla activa */}
      <StatusBar
        animated
        translucent={false}
        backgroundColor={statusBarBg}
        barStyle={bg === '#FFFFFF' ? 'dark-content' : 'light-content'}
      />

      {/* Cubre el área segura superior con el MISMO color del StatusBar */}
      <SafeAreaView style={{ backgroundColor: statusBarBg }} />

      {/* Contenedor del header */}
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>NUERA</Text>
          </View>
        </View>

        {showNotification ? (
          <TouchableOpacity style={styles.notificationBtn} onPress={onPressNotification}>
            <Text style={styles.notificationText}>!</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30, height: 30 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  notificationBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Header;
