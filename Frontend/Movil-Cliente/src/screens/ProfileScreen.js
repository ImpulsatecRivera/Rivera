import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image, 
} from 'react-native';

const ProfileScreen = () => {
  const [userInfo] = useState({
    name: 'Diego Pocasangre',
    role: 'Cliente',
    email: 'Diego@gmail.com',
    dni: '07637631-0',
    birthDate: '1998-09-16',
    phone: '7556-9909',
    address: 'Ciudad completa',
    password: '••••••••••••'
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => console.log('Usuario cerró sesión') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10AC84" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil de usuario</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Image
              source={require('../images/perfil.png')}
              style={styles.avatarImg}
            />
          </View>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userRole}>{userInfo.role}</Text>
        </View>

        {/* Información personal */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dui</Text>
            <Text style={styles.infoValue}>{userInfo.dni}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
            <Text style={styles.infoValue}>{userInfo.birthDate}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{userInfo.phone}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{userInfo.address}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contraseña</Text>
            <Text style={styles.infoValue}>{userInfo.password}</Text>
          </View>
        </View>

        {/* Botón Cerrar sesión */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const GREEN = '#10AC84';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    backgroundColor: GREEN,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },

  profileCard: {
    backgroundColor: GREEN,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 96,           
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',    
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',    
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userRole: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },

  infoSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20 },
  infoItem: { marginBottom: 15 },
  infoLabel: { fontSize: 14, color: '#7F8C8D', marginBottom: 5, fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#2C3E50', fontWeight: '400' },

  buttonContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  logoutButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;
