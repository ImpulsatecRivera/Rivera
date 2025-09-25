// src/screens/EditProfileScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useProfile } from '../hooks/useProfile';
import perfilImg from '../images/perfil.png';

export default function EditProfileScreen({ navigation }) {
  const { profile, loading, saveProfile } = useProfile();

  // Estado del formulario (controlado)
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    tarjeta: '',
  });
  const [saving, setSaving] = useState(false);

  // Evita re-hidratar si el usuario ya empezó a escribir
  const hydratedOnce = useRef(false);

  // Hidratar el formulario con los datos del perfil en cuanto estén listos
  useEffect(() => {
    if (!hydratedOnce.current && profile?.id) {
      setForm({
        nombre: profile?.nombre ?? '',
        telefono: profile?.telefono ?? '',
        direccion: profile?.direccion ?? '',
        // Muestra tal cual venga del hook (dd/mm/aaaa o yyyy-mm-dd)
        fechaNacimiento: profile?.fechaNacimiento ?? '',
        tarjeta: profile?.tarjeta ?? '',
      });
      hydratedOnce.current = true;
    }
  }, [profile]);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // (Opcional) normaliza dd/mm/aaaa -> yyyy-mm-dd si lo necesitas en backend
  const toISODateIfNeeded = (s) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    return s;
  };

  const onSubmit = async () => {
    try {
      setSaving(true);
      await saveProfile({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        fechaNacimiento: toISODateIfNeeded(form.fechaNacimiento.trim()),
        tarjeta: form.tarjeta.trim(),
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  // Loading inicial: mostrar algo mientras llega el perfil
  if (loading && !profile?.id && !hydratedOnce.current) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: '#555' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Editar perfil</Text>

        {/* Foto fija (solo lectura) */}
        <View style={styles.avatarBox}>
          <Image
            source={profile?.img ? { uri: profile.img } : perfilImg}
            style={styles.avatar}
          />
          <Text style={styles.fixedNote}>Foto de perfil (fija)</Text>
        </View>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={form.nombre}
          onChangeText={(t) => onChange('nombre', t)}
          placeholder="Nombre completo"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={form.telefono}
          onChangeText={(t) => onChange('telefono', t)}
          placeholder="+503 ..."
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={form.direccion}
          onChangeText={(t) => onChange('direccion', t)}
          placeholder="Dirección"
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TextInput
          style={styles.input}
          value={form.fechaNacimiento}
          onChangeText={(t) => onChange('fechaNacimiento', t)}
          placeholder="YYYY-MM-DD o dd/mm/aaaa"
        />

        <Text style={styles.label}>Tarjeta de circulación</Text>
        <TextInput
          style={styles.input}
          value={form.tarjeta}
          onChangeText={(t) => onChange('tarjeta', t)}
          placeholder="Número de tarjeta"
        />

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, { marginTop: 18 }]}
          onPress={onSubmit}
          disabled={saving || loading}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar cambios</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={[styles.btnText, { color: '#2196F3' }]}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  avatarBox: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 6 },
  fixedNote: { fontSize: 12, color: '#6b7280' },
  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#4CAF50' },
  btnSecondary: {
    backgroundColor: '#E3F2FD',
    marginTop: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
