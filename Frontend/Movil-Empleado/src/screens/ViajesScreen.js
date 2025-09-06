import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useTrips } from '../hooks/useTrips';
import { useProfile } from '../hooks/useProfile';
import HistoryItem from '../components/HistoryItem';
import senalImg from '../images/senal.png';

const ViajesScreen = ({ navigation }) => {
  const { profile } = useProfile();
  const motoristaId = profile?.id || profile?._id;
  
  // IMPORTANTE: Pasar 'historial' para obtener TODOS los viajes
  const { 
    trips, // TODOS los viajes (programados, completados, cancelados, etc.)
    loading, 
    error,
    refrescarViajes,
    totalTrips,
    estadisticas // Estadísticas del backend
  } = useTrips(motoristaId, 'historial'); // ← Clave: usar 'historial'

  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Función para obtener viajes filtrados
  const getViajesFiltrados = () => {
    if (filtroEstado === 'todos') {
      return trips;
    }
    
    // Filtrar según el estado seleccionado
    switch (filtroEstado) {
      case 'programados':
        return trips.filter(v => ['programado', 'pendiente', 'confirmado'].includes(v.estado));
      case 'completados':
        return trips.filter(v => ['completado', 'finalizado'].includes(v.estado));
      case 'en_transito':
        return trips.filter(v => ['en_transito', 'iniciado'].includes(v.estado));
      case 'cancelados':
        return trips.filter(v => v.estado === 'cancelado');
      default:
        return trips.filter(v => v.estado === filtroEstado);
    }
  };

  const handleInfoPress = (item) => {
    navigation.navigate('InfoViaje', {
      trip: {
        id: item.id,
        tipo: item.tipo,
        cotizacion: item.cotizacion || item.cliente || 'Cliente no especificado',
        camion: item.camion || 'N/A',
        descripcion: item.descripcion || 'Sin descripción',
        horaLlegada: item.horaLlegada || 'No especificada',
        horaSalida: item.horaSalida || item.hora,
        asistente: item.asistente || 'Por asignar',
        estado: item.estado,
        origen: item.origen,
        destino: item.destino,
        fecha: item.fecha,
        hora: item.hora,
        // Pasar todos los datos originales
        ...item
      }
    });
  };

  const onRefresh = () => {
    refrescarViajes();
  };

  // Obtener datos organizados
  const viajesFiltrados = getViajesFiltrados();

  // Función para obtener el conteo de cada filtro
  const getConteoFiltro = (filtro) => {
    switch (filtro) {
      case 'programados':
        return estadisticas?.programados || trips.filter(v => ['programado', 'pendiente', 'confirmado'].includes(v.estado)).length;
      case 'completados':
        return estadisticas?.completados || trips.filter(v => ['completado', 'finalizado'].includes(v.estado)).length;
      case 'en_transito':
        return estadisticas?.enProgreso || trips.filter(v => ['en_transito', 'iniciado'].includes(v.estado)).length;
      case 'cancelados':
        return estadisticas?.cancelados || trips.filter(v => v.estado === 'cancelado').length;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTrips}</Text>
            <Text style={styles.statLabel}>Total viajes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {getConteoFiltro('programados')}
            </Text>
            <Text style={styles.statLabel}>Programados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#2196F3' }]}>
              {getConteoFiltro('completados')}
            </Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'todos', label: 'Todos', count: totalTrips },
              { key: 'programados', label: 'Programados', count: getConteoFiltro('programados') },
              { key: 'completados', label: 'Completados', count: getConteoFiltro('completados') },
              { key: 'en_transito', label: 'En tránsito', count: getConteoFiltro('en_transito') },
              { key: 'cancelados', label: 'Cancelados', count: getConteoFiltro('cancelados') }
            ].map((filtro) => (
              <TouchableOpacity
                key={filtro.key}
                style={[
                  styles.filterButton,
                  filtroEstado === filtro.key && styles.filterButtonActive
                ]}
                onPress={() => setFiltroEstado(filtro.key)}
              >
                <Text style={[
                  styles.filterText,
                  filtroEstado === filtro.key && styles.filterTextActive
                ]}>
                  {filtro.label} ({filtro.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Información de debug */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            📊 Mostrando {viajesFiltrados.length} de {totalTrips} viajes
          </Text>
          <Text style={styles.debugText}>
            🎯 Filtro actual: {filtroEstado}
          </Text>
          <Text style={styles.debugText}>
            👤 Motorista ID: {motoristaId}
          </Text>
          {error && (
            <Text style={styles.debugError}>
              ❌ Error: {error}
            </Text>
          )}
        </View>

        {/* Lista de viajes */}
        {viajesFiltrados.length > 0 ? (
          <View style={styles.historyList}>
            <Text style={styles.sectionTitle}>
              {filtroEstado === 'todos' 
                ? 'Todos tus viajes' 
                : `Viajes ${filtroEstado === 'programados' ? 'programados' : 
                              filtroEstado === 'completados' ? 'completados' :
                              filtroEstado === 'en_transito' ? 'en tránsito' :
                              filtroEstado === 'cancelados' ? 'cancelados' : filtroEstado}`
              }
            </Text>
            
            {viajesFiltrados.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onInfoPress={handleInfoPress}
              />
            ))}
          </View>
        ) : (
          /* No hay viajes con el filtro actual */
          <View style={styles.noTripsContainer}>
            <Text style={styles.noTripsIcon}>📋</Text>
            <Text style={styles.noTripsText}>
              {filtroEstado === 'todos' 
                ? 'No tienes viajes registrados'
                : `No tienes viajes ${filtroEstado === 'programados' ? 'programados' : 
                                      filtroEstado === 'completados' ? 'completados' :
                                      filtroEstado === 'en_transito' ? 'en tránsito' :
                                      filtroEstado === 'cancelados' ? 'cancelados' : filtroEstado}`
              }
            </Text>
            <Text style={styles.noTripsSubtext}>
              {filtroEstado === 'todos'
                ? 'Cuando tengas viajes asignados, aparecerán aquí'
                : 'Prueba con otro filtro para ver más viajes'
              }
            </Text>
            
            {filtroEstado !== 'todos' && (
              <TouchableOpacity 
                style={styles.resetFilterButton}
                onPress={() => setFiltroEstado('todos')}
              >
                <Text style={styles.resetFilterText}>Ver todos los viajes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 15,
  },
  avatarImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 2,
  },
  debugError: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 5,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  historyList: {
    marginTop: 10,
    marginBottom: 20,
  },
  noTripsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 20,
  },
  noTripsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noTripsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noTripsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetFilterButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ViajesScreen;