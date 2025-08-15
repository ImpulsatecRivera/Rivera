import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const GREEN = '#10AC84';
const BG = '#F5F5F5';

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

  const [confirmVisible, setConfirmVisible] = useState(false);

  const openConfirm = () => setConfirmVisible(true);
  const closeConfirm = () => setConfirmVisible(false);
  const handleConfirmLogout = () => { 
    console.log('Usuario cerró sesión'); 
    setConfirmVisible(false); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar que solo se pinta cuando esta pantalla está enfocada */}
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={GREEN} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil de usuario</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Image source={require('../images/perfil.png')} style={styles.avatarImg} />
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
          <TouchableOpacity style={styles.logoutButton} onPress={openConfirm} activeOpacity={0.9}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmación bonito */}
      <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={closeConfirm}>
        <Pressable style={styles.backdrop} onPress={closeConfirm}>
          <Pressable style={styles.modalCard}>
            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
            </View>

            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalSubtitle}>
              Se cerrará tu sesión en este dispositivo. Podrás volver a iniciar cuando quieras.
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.btnLight} onPress={closeConfirm} activeOpacity={0.9}>
                <Text style={styles.btnLightText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnDanger} onPress={handleConfirmLogout} activeOpacity={0.9}>
                <Text style={styles.btnDangerText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

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
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
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

  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  iconWrap: { alignItems: 'center', marginBottom: 8 },
  iconCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFECEF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 34 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center', marginTop: 6 },
  modalSubtitle: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btnLight: {
    flex: 1, backgroundColor: '#EEF2F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  btnLightText: { color: '#334155', fontWeight: '700', fontSize: 15 },
  btnDanger: {
    flex: 1, backgroundColor: '#FF4757', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  btnDangerText: {
    color: '#FFFFFF', fontWeight: '800', fontSize: 15,
  },
});

export default ProfileScreen;
