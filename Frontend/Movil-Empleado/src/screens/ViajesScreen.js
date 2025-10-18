// src/screens/ViajesScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useTrips } from '../hooks/useTrips';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../Context/authContext';
import HistoryItem from '../components/HistoryItem';
import senalImg from '../images/senal.png';

/* =========================
   Utilidad para deduplicar
   ========================= */
const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return (arr || []).filter((x) => {
    const k = getKey(x);
    if (!k) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const ViajesScreen = ({ navigation }) => {
  const { user, isAuthenticated, motoristaId: ctxMotoristaId } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [motoristaId, setMotoristaId] = useState(null);

  // --- Obtiene el ID del motorista desde: Context -> AsyncStorage -> Profile
  const obtenerMotoristaId = useCallback(async () => {
    try {
      if (ctxMotoristaId) return String(ctxMotoristaId);

      const storedId = await AsyncStorage.getItem('motoristaId');
      if (storedId) return storedId;

      const contextId = user?._id || user?.id;
      if (contextId) return String(contextId);

      const profileId = profile?._id || profile?.id;
      if (profileId) return String(profileId);

      return null;
    } catch {
      return null;
    }
  }, [ctxMotoristaId, user, profile]);

  // --- Fija motoristaId cuando hay sesión
  useEffect(() => {
    const setupMotoristaId = async () => {
      if (!isAuthenticated) {
        setMotoristaId(null);
        return;
      }
      const id = await obtenerMotoristaId();
      if (id && id !== motoristaId) setMotoristaId(id);
    };
    setupMotoristaId();
  }, [isAuthenticated, obtenerMotoristaId]);

  // --- Hook: cargar HISTORIAL de viajes del motorista
  const {
    trips,
    loading,
    error,
    refrescarViajes,
    totalTrips,
    estadisticas,
  } = useTrips(motoristaId, 'historial');

  // ✅ DEDUPE una vez y úsalo para todo (lista y estadísticas)
  const baseTrips = useMemo(
    () => dedupeBy(trips, (x) => String(x._fechaSalidaISO || x.id || x._id || x.viajeId || x.codigo || '')),
    [trips]
  );

  // Contadores para las estadísticas principales
  const counts = useMemo(() => {
    const pendientes = baseTrips.filter((v) => 
      v.estado === 'pendiente'
    ).length;
    
    const completados = baseTrips.filter((v) => 
      v.estado === 'completado'
    ).length;
    
    const enCurso = baseTrips.filter((v) => 
      v.estado === 'en_curso'
    ).length;

    return { 
      total: baseTrips.length,
      pendientes,
      completados,
      enCurso
    };
  }, [baseTrips]);

  const onRefresh = useCallback(() => {
    refrescarViajes();
  }, [refrescarViajes]);

  /* =========================
     handleInfoPress (usa campos normalizados del hook)
     ========================= */
  const handleInfoPress = useCallback((item) => {
    navigation.navigate('InfoViaje', {
      trip: {
        id: item.id || item._id || item.viajeId || item.codigo,
        tipo: item.tipo,
        cotizacion: item.cotizacion ?? 'Cliente no especificado',
        camion: item.camion ?? 'N/A',
        descripcion: item.descripcion ?? 'Sin descripción',
        horaLlegada: item.horaLlegada ?? 'No especificada',
        horaSalida: item.horaSalida ?? 'No especificada',
        asistente: item.asistente ?? 'Por asignar',
        estado: item.estado,
        origen: item.origen,
        destino: item.destino,
        fecha: item.fecha,
        hora: item.hora,
        raw: item,
      },
    });
  }, [navigation]);

  // --- Loading / estados iniciales
  if (profileLoading || (isAuthenticated && !motoristaId) || (motoristaId && loading)) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Cargando viajes...</Text>
        {!isAuthenticated && <Text style={styles.errorText}>Por favor, inicia sesión</Text>}
      </View>
    );
  }

  // --- Error
  if (error) {
    return (
      <View style={[styles.container, styles.center, { paddingHorizontal: 20 }]}>
        <Text style={styles.errorText}>No se pudieron cargar los viajes.</Text>
        <TouchableOpacity
          style={[styles.resetFilterButton, { marginTop: 16 }]}
          onPress={onRefresh}
        >
          <Text style={styles.resetFilterText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Render principal
  return (
    <View style={styles.container}>
      <FlatList
        data={baseTrips}
        keyExtractor={(item, index) => {
          const id = item?.id ?? item?._id ?? item?.viajeId ?? item?.codigo;
          return id ? String(id) : `row-${index}`;
        }}
        renderItem={({ item }) => (
          <HistoryItem item={item} onInfoPress={handleInfoPress} />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        ListHeaderComponent={
          <>
            {/* Título */}
            <Text style={styles.title}>Historial de viajes</Text>

            {/* Subtítulo + imagen */}
            <View style={styles.greetingContainer}>
              <Text style={styles.subtitle}>
                Aquí podrás ver todos tus viajes realizados con nosotros
              </Text>
              <Image source={senalImg} style={styles.avatarImage} />
            </View>

            {/* Estadísticas rápidas */}
            

            {/* Encabezado de sección lista */}
            <Text style={styles.sectionTitle}>Todos tus viajes</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.noTripsContainer}>
            <LottieView
              source={require('../images/Speedy car.json')}
              autoPlay
              loop
              style={styles.emptyAnimation}
            />
            
            <Text style={styles.noTripsText}>
              No tienes viajes registrados
            </Text>
            <Text style={styles.noTripsSubtext}>
              Cuando tengas viajes asignados, aparecerán aquí
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={!!loading} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 70,
    marginBottom: 10,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: { fontSize: 16, color: '#666', flex: 1, marginRight: 15 },
  avatarImage: { width: 120, height: 120, resizeMode: 'contain' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  noTripsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyAnimation: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  noTripsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noTripsSubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  resetFilterButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingText: { color: '#333', fontSize: 16, marginTop: 12 },
  errorText: { color: '#c00', fontSize: 14, marginTop: 8, textAlign: 'center' },
});

export default ViajesScreen;