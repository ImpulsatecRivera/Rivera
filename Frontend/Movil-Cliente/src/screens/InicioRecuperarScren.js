// src/screens/InicioRecuperarScren.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InicioRecuperarScren = ({ navigation }) => {
  const handleBack = () => navigation.goBack();

  const goEmail = () => {
    // si prefieres pasar por "seleccionarMetodoRecuperacion", cambia a:
    // navigation.navigate('seleccionarMetodoRecuperacion');
    navigation.navigate('Recuperacion');
  };

  const goPhone = () => {
    navigation.navigate('RecuperacionTelefono');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header con flecha de regreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="arrow-back-ios" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido al{'\n'}recuperar contraseña</Text>

        <Text style={styles.subtitle}>
          No te preocupes, puede pasar. Introduce tu número de teléfono y te enviaremos la contraseña de un solo uso.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como quieres recuperar tu cuenta</Text>

          {/* Opción Actualizar contraseña (correo) */}
          <TouchableOpacity style={[styles.card, styles.primaryCard]} onPress={goEmail}>
            <View style={styles.cardLeft}>
              <Text style={[styles.cardTitle, styles.primaryText]}>Actualizar contraseña</Text>
              <View style={styles.row}>
                <Icon name="schedule" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.timeText, styles.primaryText]}>{' '}22h 55m 20s actualización</Text>
              </View>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Continuar</Text>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Opción Código de verificación (teléfono) */}
          <TouchableOpacity style={[styles.card, styles.secondaryCard]} onPress={goPhone}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>Código de verificación</Text>
              <View style={styles.row}>
                <Icon name="schedule" size={14} color="#E5E7EB" />
                <Text style={styles.timeText}>{' '}22h 55m 20s actualización</Text>
              </View>
            </View>
            <View style={styles.pillSecondary}>
              <Text style={styles.pillSecondaryText}>Continuar</Text>
              <Icon name="arrow-forward" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rivera distribuidora y{'\n'}transporte || 2025
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', lineHeight: 30, marginBottom: 16 },
  subtitle: { color: '#4B5563', fontSize: 14, lineHeight: 20, marginBottom: 28 },

  section: { marginBottom: 24 },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: '600', marginBottom: 12 },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCard: { backgroundColor: '#3B82F6' }, // azul
  secondaryCard: { backgroundColor: '#9CA3AF' }, // gris

  cardLeft: { flex: 1, paddingRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },

  primaryText: { color: '#FFFFFF' },
  timeText: { fontSize: 12, color: '#E5E7EB' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  pillSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  pillSecondaryText: { color: '#374151', fontSize: 12, fontWeight: '600' },

  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', lineHeight: 18 },
});

export default InicioRecuperarScren;
