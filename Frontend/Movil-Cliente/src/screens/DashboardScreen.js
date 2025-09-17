// src/screens/DashboardScreen.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Text, TouchableOpacity,
  Dimensions, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import ProjectCard from '../components/ProjectCard';
import QuoteSheet from '../components/QuoteSheet';
import useQuotePreview from '../hooks/useQuotePreview';
import useMyQuotes from '../hooks/useMyQuotes';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import LottieView from 'lottie-react-native';
import Summer from "../assets/lottie/Summer Vibes.json";
import Rain from "../assets/lottie/rainy icon.json";
import Cloudy from "../assets/lottie/Cloudy Animation.json";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BG = '#F5F5F5';
const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.6, 280);
const LOGO_HEIGHT = 80;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Estado para clima y hora
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temperature: '32',
    condition: 'Soleado',
    humidity: '68%'
  });

  // Obtener hora de El Salvador (UTC-6)
  const getSalvadorTime = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const salvadorTime = new Date(utc + (-6 * 3600000)); // UTC-6
    return salvadorTime;
  };

  // Actualizar la hora cada minuto con tiempo de El Salvador
  useEffect(() => {
    // Establecer la hora inicial
    setCurrentTime(getSalvadorTime());
    
    const timer = setInterval(() => {
      setCurrentTime(getSalvadorTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Función para obtener la animación Lottie según el clima
  const getWeatherAnimation = (condition) => {
    switch (condition.toLowerCase()) {
      case 'soleado':
      case 'muy soleado':
      case 'despejado':
        return Summer;
      case 'lluvioso':
        return Rain;
      case 'nublado':
      case 'parcialmente nublado':
        return Cloudy;
      default:
        return Summer;
    }
  };

  // Simular datos del clima típicos de El Salvador
  useEffect(() => {
    // Temperaturas típicas de San Salvador (20-35°C)
    const salvadorWeatherData = [
      { temperature: '32', condition: 'Soleado', humidity: '68%' },
      { temperature: '29', condition: 'Parcialmente nublado', humidity: '72%' },
      { temperature: '26', condition: 'Nublado', humidity: '78%' },
      { temperature: '24', condition: 'Lluvioso', humidity: '85%' },
      { temperature: '35', condition: 'Muy soleado', humidity: '60%' },
      { temperature: '28', condition: 'Despejado', humidity: '65%' },
    ];
    
    // Simular variación basada en la hora del día
    const hour = getSalvadorTime().getHours();
    let selectedWeather;
    
    if (hour >= 6 && hour <= 11) {
      // Mañana: más fresco y despejado
      selectedWeather = salvadorWeatherData[Math.random() < 0.7 ? 0 : 5];
    } else if (hour >= 12 && hour <= 17) {
      // Tarde: más caliente
      selectedWeather = salvadorWeatherData[Math.random() < 0.6 ? 4 : 0];
    } else if (hour >= 18 && hour <= 21) {
      // Atardecer: posible lluvia
      selectedWeather = salvadorWeatherData[Math.random() < 0.4 ? 3 : 1];
    } else {
      // Noche: más fresco
      selectedWeather = salvadorWeatherData[Math.random() < 0.5 ? 2 : 1];
    }
    
    setWeather(selectedWeather);
  }, []);

  // Cotizaciones (hook conectado al backend)
  const { quotes, loading, error, refreshing, refresh, reload } = useMyQuotes('https://riveraproject-5.onrender.com');

  // Preview de cotización
  const { visible, item, open: openPreview, close } = useQuotePreview();

  const handleProjectPress = (q) => {
    openPreview({
      title: q.title,
      price: `${q.currency === 'USD' ? '$ ' : ''}${(q.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: q.status,
      lugarEntrega: q.deliveryPlace,
      horaLlegada: q.arrivalTime,
      horaSalida: q.departureTime,
      paymentMethod: q.paymentMethod,
    });
  };

  const handleAddQuote = () => navigation.navigate('Cotizacion');

  // FIX del bucle de carga
  const reloadRef = useRef(reload);
  useEffect(() => { reloadRef.current = reload; }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reloadRef.current();
      return () => {};
    }, [])
  );

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/El_Salvador'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-SV', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/El_Salvador'
    });
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <Image source={require('../images/logo.png')} style={styles.logo} />
          
          {/* Saludo personalizado */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              ¡Hola{user?.name ? `, ${user.name}` : ''}! 👋
            </Text>
            <Text style={styles.welcomeSubtext}>
              Bienvenido a Rivera Distribuidora
            </Text>
          </View>
        </View>

        {/* Sección de Clima y Hora */}
        <View style={styles.weatherTimeContainer}>
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View style={styles.lottieContainer}>
                <LottieView
                  source={getWeatherAnimation(weather.condition)}
                  autoPlay
                  loop
                  style={styles.weatherLottie}
                />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>Humedad</Text>
                <Text style={styles.weatherDetailValue}>{weather.humidity}</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>San Salvador</Text>
                <Text style={styles.weatherDetailValue}>El Salvador</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeCard}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
            <View style={styles.clockIcon}>
              <Text style={styles.clockEmoji}>🕐</Text>
            </View>
          </View>
        </View>

        {/* Sección de cotizaciones */}
        <View style={styles.quotesSection}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddQuote}>
            <View style={styles.addButtonContent}>
              <View style={styles.locationLottieContainer}>
                <LottieView
                  source={Location}
                  autoPlay
                  loop
                  style={styles.locationLottie}
                />
              </View>
              <Text style={styles.addButtonText}>Hacer una cotización de viaje</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Mis Cotizaciones</Text>
            <Text style={styles.sectionSubtitle}>Últimas cotizaciones realizadas</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10AC84" />
              <Text style={styles.loadingText}>Cargando tus cotizaciones…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error}. Desliza hacia abajo para reintentar.
              </Text>
              <TouchableOpacity style={[styles.addButton, { marginTop: 12 }]} onPress={() => reloadRef.current()}>
                <View style={styles.addButtonContent}>
                  <Text style={styles.addButtonText}>🔄 Reintentar</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : quotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>
                ¡Aún no tienes cotizaciones!
              </Text>
              <Text style={styles.emptySubtitle}>
                Crea tu primera cotización y aprovecha el 30% OFF de este mes.
              </Text>
              <TouchableOpacity style={[styles.addButton, { marginTop: 16 }]} onPress={handleAddQuote}>
                <View style={styles.addButtonContent}>
                  <View style={styles.locationLottieContainer}>
                    <LottieView
                      source={Location}
                      autoPlay
                      loop
                      style={styles.locationLottie}
                    />
                  </View>
                  <Text style={styles.addButtonText}>Crear mi primera cotización</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.projectsGrid}>
              {quotes.slice(0, 6).map((q) => (
                <ProjectCard
                  key={q.id}
                  project={{
                    id: q.id,
                    name: q.title,
                    price: `${q.currency === 'USD' ? '$ ' : ''}${(q.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: q.status,
                    icon: '📄',
                  }}
                  onPress={() => handleProjectPress(q)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <QuoteSheet
        visible={visible}
        item={item}
        onClose={close}
        onConfirm={(payload) => {
          close();
          navigation.navigate('Cotizacion', payload);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG 
  },
  content: { 
    flex: 1 
  },

  // Header mejorado
  header: { 
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 20,
  },
  logo: { 
    width: LOGO_WIDTH, 
    height: LOGO_HEIGHT, 
    resizeMode: 'contain', 
    alignSelf: 'center',
    marginBottom: 15,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },

  // Sección de clima y hora
  weatherTimeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 12,
  },
  weatherCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lottieContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  weatherLottie: {
    width: '100%',
    height: '100%',
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  weatherDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  timeCard: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  currentTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 12,
    color: '#E8EAFF',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  clockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  clockEmoji: {
    fontSize: 16,
    opacity: 0.7,
  },

  // Sección de cotizaciones mejorada
  quotesSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  sectionHeader: { 
    marginTop: 8, 
    marginBottom: 20,
    paddingLeft: 4,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  addButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#10AC84',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#10AC84',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLottieContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  locationLottie: {
    width: '100%',
    height: '100%',
  },
  addButtonText: { 
    textAlign: 'center', 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // Estados de carga, error y vacío mejorados
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 16,
  },

  errorContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  errorText: {
    color: '#d00',
    textAlign: 'center',
    fontSize: 16,
  },

  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },

  projectsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
});

export default DashboardScreen;