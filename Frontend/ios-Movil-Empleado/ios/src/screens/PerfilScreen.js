import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useProfile } from '../hooks/useProfile';
import InfoRow from '../components/InfoRow';
import perfilImg from '../images/perfil.png'; 

const PerfilScreen = () => {
  const { profile, logout } = useProfile();

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Verde */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de motorista</Text>
          
          <Image
            source={perfilImg}
            style={styles.perfilImage}
            resizeMode="contain"
          />

          <Text style={styles.name}>{profile.nombre}</Text>
          <Text style={styles.cargo}>{profile.cargo}</Text>
        </View>

        {/* Información Personal */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Camión encargado" value={profile.camion} />
          <InfoRow label="Fecha de nacimiento" value={profile.fechaNacimiento} />
          <InfoRow label="Teléfono" value={profile.telefono} />
          <InfoRow label="Dirección" value={profile.direccion} />
          <InfoRow label="Tarjeta de circulación" value={profile.tarjeta} />

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  perfilImage: {
    width: 100,
    height: 100,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  cargo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;
