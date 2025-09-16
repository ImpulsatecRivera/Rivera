// src/screens/CotizacionScreen.jsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import { createQuote } from '../api/quotes';

const GREEN = '#10AC84';
const BG = '#FFFFFF';

const CotizacionScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  // Base de la API (tu backend en Render)
  const BASE_URL = useMemo(() => 'https://riveraproject-5.onrender.com', []);

  const [formData, setFormData] = useState({
    tipoCamion: '',
    descripcion: '',
    estado: 'pendiente',
    horaLlegada: '', // texto tipo "10:30 AM" o "22:15"
    horaSalida:  '', // texto tipo "11:45 AM" o "23:30"
    metodoPago: 'efectivo',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMetodo = (metodo) => {
    setFormData(prev => ({ ...prev, metodoPago: metodo }));
  };

  // Mapea texto de UI a enum del backend
  const inferTruckType = (txt) => {
    const s = (txt || '').toLowerCase();
    if (s.includes('granel') || s.includes('maíz') || s.includes('arroz') || s.includes('agric')) return 'productos_agricolas';
    if (s.includes('refriger')) return 'refrigerado';
    if (s.includes('seco')) return 'seco';
    return 'otros';
  };

  const validate = () => {
    if (!formData.descripcion.trim()) return 'Ingresa la descripción (ej. MAÍZ, ARROZ).';
    return null;
  };

  // ---- Utilidades de fecha/hora ----

  // ✅ Convierte "10:30 AM" / "22:15" a ISO del día de hoy;
  //    si ya pasó, la mueve a mañana para evitar "fecha en el pasado".
  const parseTimeToISO = (timeStr, base = new Date()) => {
    const t = (timeStr || '').trim();
    if (!t) return null;

    const date = new Date(base); // copia de la fecha base
    let h, m;

    // Formato con AM/PM: "h:mm AM/PM" o "h AM/PM"
    const ampm = t.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*$/i);
    if (ampm) {
      h = parseInt(ampm[1], 10);
      m = parseInt(ampm[2] || '0', 10);
      const mer = ampm[3].toUpperCase();
      if (mer === 'PM' && h < 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      date.setHours(h, m, 0, 0);

      // Si ya pasó hoy, pásala a mañana
      if (date.getTime() < base.getTime()) {
        date.setDate(date.getDate() + 1);
      }
      return date.toISOString();
    }

    // Formato 24h: "HH:mm" o "H:mm"
    const hhmm = t.match(/^\s*(\d{1,2}):(\d{2})\s*$/);
    if (hhmm) {
      h = parseInt(hhmm[1], 10);
      m = parseInt(hhmm[2], 10);
      date.setHours(h, m, 0, 0);

      if (date.getTime() < base.getTime()) {
        date.setDate(date.getDate() + 1);
      }
      return date.toISOString();
    }

    // Si no matchea, devolvemos null para que el llamante use defaults
    return null;
  };

  const diffHours = (fromISO, toISO) => {
    const a = new Date(fromISO).getTime();
    const b = new Date(toISO).getTime();
    const ms = Math.max(0, b - a);
    // Mínimo 1h; si llegada <= salida, devolvemos 1
    return Math.max(1, Math.round(ms / (60 * 60 * 1000)));
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Faltan datos', err);
      return;
    }

    try {
      setSubmitting(true);
      const clientId = user?.id || user?._id;
      if (!clientId) throw new Error('No hay sesión de cliente');

      const now = new Date();

      // 1) Construimos salida y llegada a partir de los textos
      //    Si no hay hora de salida, usamos "ahora".
      let salida = parseTimeToISO(formData.horaSalida, now);
      if (!salida) salida = now.toISOString();

      //    Si no hay hora de llegada, usamos salida + 2h.
      let llegada = parseTimeToISO(formData.horaLlegada, now);
      if (!llegada) llegada = new Date(new Date(salida).getTime() + 2 * 60 * 60 * 1000).toISOString();

      // 2) Llegada debe ser > salida (el backend lo valida)
      if (new Date(llegada) <= new Date(salida)) {
        llegada = new Date(new Date(salida).getTime() + 60 * 60 * 1000).toISOString(); // +1h
      }

      const tiempoEstimadoViaje = diffHours(salida, llegada);

      // Usamos la fecha de salida como deliveryDate
      const deliveryISO = salida;

      // Coordenadas reales (San Salvador aprox). Ajusta si lo necesitas.
      const ORIGEN = { nombre: 'San Salvador', lat: 13.69294, lng: -89.21819 };
      const DESTINO = { nombre: 'San Salvador', lat: 13.69294, lng: -89.21819 };

      // Payload que cumple tu schema y la validación del controlador
      const payload = {
        // === Requeridos top-level ===
        clientId,
        quoteDescription: formData.descripcion.trim(),
        quoteName: (formData.tipoCamion || 'Cotización').trim(),
        travelLocations: `${ORIGEN.nombre} - ${DESTINO.nombre}`,
        truckType: inferTruckType(formData.tipoCamion),
        deliveryDate: deliveryISO,
        paymentMethod: (formData.metodoPago || 'efectivo').toLowerCase(),
        status: 'pendiente',
        price: 1,

        // ===== 1. RUTA (con coordenadas) =====
        ruta: {
          origen: {
            nombre: ORIGEN.nombre,
            coordenadas: { lat: ORIGEN.lat, lng: ORIGEN.lng },
            tipo: 'ciudad',
          },
          destino: {
            nombre: DESTINO.nombre,
            coordenadas: { lat: DESTINO.lat, lng: DESTINO.lng },
            tipo: 'ciudad',
          },
          distanciaTotal: 100,
          tiempoEstimado: tiempoEstimadoViaje, // en horas
        },

        // ===== 2. CARGA =====
        carga: {
          categoria: inferTruckType(formData.tipoCamion) || 'otros',
          descripcion: formData.descripcion.trim(),
          peso: { valor: 1000, unidad: 'kg' },
        },

        // ===== 3. HORARIOS (ambos campos requeridos por tu backend) =====
        horarios: {
          fechaSalida: salida,
          fechaLlegadaEstimada: llegada,
          tiempoEstimadoViaje,
          horarioPreferido: {
            inicio: formData.horaLlegada || '',
            fin: formData.horaSalida || '',
          },
        },

        // ===== 4. COSTOS =====
        costos: {
          combustible: 0,
          peajes: 0,
          conductor: 0,
          otros: 0,
          impuestos: 0,
          moneda: 'USD',
        },
      };

      const res = await createQuote({ baseUrl: BASE_URL, token, payload });

      if (res?.success === false) {
        throw new Error(res?.message || 'No se pudo crear la cotización');
      }

      Alert.alert('¡Listo!', 'Cotización creada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo crear la cotización');
    } finally {
      setSubmitting(false);
    }
  };

  const PayOption = ({ label, icon, selected, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.payOption, selected && styles.payOptionActive]}
    >
      <Text style={styles.payIcon}>{icon}</Text>
      <Text style={[styles.payTitle, selected && styles.payTitleActive]}>{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Realizar una nueva cotización</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tipo de camión */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de camión</Text>
          <TextInput
            style={styles.input}
            placeholder="Empresas graneleras"
            placeholderTextColor="#999"
            value={formData.tipoCamion}
            onChangeText={(t) => handleInputChange('tipoCamion', t)}
          />
        </View>

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="MAÍZ, ARROZ"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={formData.descripcion}
            onChangeText={(t) => handleInputChange('descripcion', t)}
          />
        </View>

        {/* Estado (solo display) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Pendiente</Text>
          </View>
        </View>

        {/* Hora de llegada */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora de llegada</Text>
          <TextInput
            style={styles.input}
            placeholder="10:30 AM"
            placeholderTextColor="#999"
            value={formData.horaLlegada}
            onChangeText={(t) => handleInputChange('horaLlegada', t)}
          />
        </View>

        {/* Hora de salida */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora de salida</Text>
          <TextInput
            style={styles.input}
            placeholder="11:45 AM"
            placeholderTextColor="#999"
            value={formData.horaSalida}
            onChangeText={(t) => handleInputChange('horaSalida', t)}
          />
        </View>

        {/* Métodos de pago */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { marginBottom: 12 }]}>Elige tu método de pago</Text>

          <PayOption
            label="Pagar con efectivo"
            icon="💰"
            selected={formData.metodoPago === 'efectivo'}
            onPress={() => handleSelectMetodo('efectivo')}
          />

          <PayOption
            label="Pagar con transferencia"
            icon="💳"
            selected={formData.metodoPago === 'transferencia'}
            onPress={() => handleSelectMetodo('transferencia')}
          />
        </View>

        {/* Enviar */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar cotización</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  backButtonText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  statusContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F39C12', marginRight: 8 },
  statusText: { fontSize: 16, color: '#856404', fontWeight: '500' },

  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  payOptionActive: {
    backgroundColor: '#4338CA',
    borderColor: '#10AC84',
    shadowColor: '#10AC84',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payIcon: { fontSize: 20, marginRight: 12, color: '#fff' },
  payTitle: { color: '#E5E7EB', fontSize: 16, fontWeight: '600', flex: 1 },
  payTitleActive: { color: '#FFFFFF' },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: '#FFFFFF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },

  submitButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default CotizacionScreen;
