import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { useTrips } from '../hooks/useTrips';
import { useProfile } from '../hooks/useProfile';

// Components
import LogoHeader from '../components/LogoHeader';
import ServiceCard from '../components/ServiceCard';
import StatsCard from '../components/StatsCard';

const InicioScreen = ({ navigation }) => {
  const { profile, loading: profileLoading } = useProfile();
  
  // Estados para clima y hora
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Animaciones
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  
  const motoristaId = profile?.id || profile?._id;
  
  const { 
    trips, 
    loading: tripsLoading, 
    error,
    totalTrips, 
    refrescarViajes,
    getViajesHoy,
    getEstadisticas,
    viajesPorDia
  } = useTrips(motoristaId);

  const loading = profileLoading || tripsLoading;

  // ===== ANIMACIONES =====
  
  useEffect(() => {
    // Animación de entrada
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animación de pulso para elementos urgentes
    const pulseAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulseAnimation).start();
  }, []);

  // ===== FUNCIONES DE UTILIDAD =====
  
  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Obtener clima (más variado y dinámico)
  const obtenerClima = async () => {
    setWeatherLoading(true);
    try {
      setTimeout(() => {
        const climas = [
          { temp: 28, descripcion: 'Perfecto para manejar', icono: '☀️', color: '#FFD700', bg: '#FFF8DC' },
          { temp: 25, descripcion: 'Día agradable', icono: '⛅', color: '#87CEEB', bg: '#F0F8FF' },
          { temp: 22, descripcion: 'Fresco y cómodo', icono: '☁️', color: '#B0C4DE', bg: '#F5F5F5' },
          { temp: 30, descripcion: '¡Mantente hidratado!', icono: '🌡️', color: '#FF6347', bg: '#FFE4E1' },
          { temp: 26, descripcion: 'Clima ideal', icono: '🌤️', color: '#98FB98', bg: '#F0FFF0' }
        ];
        setWeather(climas[Math.floor(Math.random() * climas.length)]);
        setWeatherLoading(false);
      }, 1200);
    } catch (error) {
      setWeather({ temp: '🤷', descripcion: 'Sorpresa del clima', icono: '🌈', color: '#FF69B4', bg: '#FFF0F5' });
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    obtenerClima();
  }, []);

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const obtenerSaludo = (hora) => {
    const h = hora.getHours();
    const saludos = {
      mañana: ['¡Buenos días!', '¡Que tengas un gran día!', '¡Empecemos con energía!'],
      tarde: ['¡Buenas tardes!', '¡Sigue así!', '¡Excelente trabajo!'],
      noche: ['¡Buenas noches!', '¡Ya casi terminas!', '¡Último esfuerzo!']
    };
    
    let categoria = 'noche';
    if (h >= 5 && h < 12) categoria = 'mañana';
    else if (h >= 12 && h < 18) categoria = 'tarde';
    
    const opcionesSaludo = saludos[categoria];
    return opcionesSaludo[Math.floor(Math.random() * opcionesSaludo.length)];
  };

  const getInitials = (name) => {
    if (!name) return '😊';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Conductor';
    return fullName.split(' ')[0];
  };

  const formatearFechaAmigable = (fechaString) => {
    const fecha = new Date(fechaString + 'T00:00:00');
    const hoy = new Date();
    const mañana = new Date();
    mañana.setDate(hoy.getDate() + 1);
    
    hoy.setHours(0, 0, 0, 0);
    mañana.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    if (fecha.getTime() === hoy.getTime()) return '🔥 ¡HOY!';
    if (fecha.getTime() === mañana.getTime()) return '⭐ Mañana';
    
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // ===== HANDLERS =====
  
  const handleTripPress = (trip) => {
    navigation.navigate('InfoViaje', { trip });
  };

  const onRefresh = () => {
    refrescarViajes();
    obtenerClima();
  };

  // Vibración y feedback al tocar botones
  const handleButtonPress = (action) => {
    // Aquí puedes agregar Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  // ===== DATOS PROCESADOS =====
  
  const estadisticas = getEstadisticas();
  const viajesHoy = getViajesHoy();
  
  // Separar viajes por urgencia
  const viajesUrgentes = viajesPorDia?.filter(dia => {
    const fecha = new Date(dia.fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    return fecha.getTime() <= hoy.getTime();
  }) || [];

  const viajesProximos = viajesPorDia?.filter(dia => {
    const fecha = new Date(dia.fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    return fecha.getTime() > hoy.getTime();
  }).slice(0, 3) || [];

  // Motivación según rendimiento
  const getMensajeMotivacion = () => {
    const mensajes = [
      '¡Vas excelente! 🚀',
      '¡Sigue así, campeón! 💪',
      '¡Eres el mejor! ⭐',
      '¡Imparable hoy! 🔥',
      '¡Rumbo al éxito! 🎯'
    ];
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  // ===== COMPONENTE PRINCIPAL =====

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50', '#FF6B35', '#FF9800']}
          />
        }
      >
        <LogoHeader />
        
        {/* HEADER DINÁMICO Y COLORIDO */}
        <Animated.View 
          style={[
            styles.headerCard, 
            weather?.bg && { backgroundColor: weather.bg },
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Hora con Lottie de bienvenida y clima */}
          <View style={styles.timeWeatherRow}>
            <View style={styles.timeSection}>
              <View style={styles.timeWithWelcome}>
                <LottieView
                  source={require('../../assets/lottie/Robot Says Hi.json')} // Cambia por tu ruta exacta
                  autoPlay={true}
                  loop={false}
                  style={styles.welcomeLottie}
                  resizeMode="contain"
                  onAnimationFinish={() => console.log('Animación de bienvenida terminada')}
                  onError={(error) => console.log('Error Lottie bienvenida:', error)}
                />
                <View>
                  <Text style={styles.timeText}>{formatearHora(currentTime)}</Text>
                  <Text style={styles.dateText}>
                    {currentTime.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.weatherSection, { backgroundColor: weather?.color + '20' || '#f0f0f0' }]}
              onPress={() => handleButtonPress(obtenerClima)}
              activeOpacity={0.7}
            >
              {weatherLoading ? (
                <Animated.Text 
                  style={[styles.weatherIcon, {
                    transform: [{ rotate: '360deg' }]
                  }]}
                >
                  🔄
                </Animated.Text>
              ) : weather && (
                <>
                  <Text style={styles.weatherIcon}>{weather.icono}</Text>
                  <Text style={[styles.tempText, { color: weather.color }]}>
                    {weather.temp}°
                  </Text>
                  <Text style={styles.weatherDesc}>{weather.descripcion}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Saludo dinámico con avatar */}
          <View style={styles.greetingSection}>
            <View style={styles.avatarSection}>
              <Animated.View 
                style={[
                  styles.avatarContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: weather?.color || '#4CAF50' }]}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.name || profile?.nombre)}
                  </Text>
                </View>
              </Animated.View>
              
              <View style={styles.greetingTextSection}>
                <Text style={styles.greetingText}>
                  {obtenerSaludo(currentTime)}
                </Text>
                <Text style={styles.nameText}>
                  {getFirstName(profile?.name || profile?.nombre)}
                </Text>
                <Text style={styles.motivationText}>
                  {getMensajeMotivacion()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ESTADÍSTICAS VIBRANTES */}
        {totalTrips > 0 && (
          <Animated.View 
            style={[
              styles.quickStatsContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={[styles.statCard, styles.todayCard]} activeOpacity={0.8}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{viajesHoy.length}</Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statCard, styles.pendingCard]} activeOpacity={0.8}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statNumber}>{estadisticas.pendientes}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statCard, styles.totalCard]} activeOpacity={0.8}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statNumber}>{totalTrips}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* VIAJES URGENTES CON ANIMACIÓN */}
        {viajesUrgentes && viajesUrgentes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.urgentHeader}>
              <Text style={styles.urgentTitle}>🚨 ¡Atención Inmediata!</Text>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>URGENTE</Text>
              </View>
            </View>
            
            {viajesUrgentes.map((dia, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.urgentContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {dia.viajes?.map((viaje, viajeIndex) => {
                  const viajeCard = {
                    id: viaje._id || `urgente-${index}-${viajeIndex}`,
                    tipo: `${viaje.origen} → ${viaje.destino}`,
                    subtitulo: viaje.descripcion || 'Transporte de carga',
                    fecha: formatearFechaAmigable(dia.fecha),
                    hora: new Date(viaje.fechaSalida).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                    estado: viaje.estado,
                    urgente: true,
                    ...viaje
                  };
                  return (
                    <ServiceCard 
                      key={viajeCard.id}
                      trip={viajeCard}
                      onPress={handleTripPress}
                      style={styles.urgentCard}
                    />
                  );
                })}
              </Animated.View>
            ))}
          </View>
        )}

        {/* PRÓXIMOS VIAJES COLORIDOS */}
        {viajesProximos && viajesProximos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🗓️ Próximas Aventuras</Text>
              <TouchableOpacity 
                onPress={() => handleButtonPress(() => navigation.navigate('Viajes'))}
                style={styles.viewAllButton}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>Ver todas</Text>
                <Text style={styles.viewAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
            
            {viajesProximos.map((dia, index) => (
              <View key={index} style={[styles.dayGroup, styles[`dayColor${index % 3}`]]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>
                    {formatearFechaAmigable(dia.fecha)}
                  </Text>
                  <View style={styles.tripCount}>
                    <Text style={styles.tripCountText}>{dia.viajes?.length || 0}</Text>
                  </View>
                </View>
                
                {dia.viajes?.slice(0, 2).map((viaje, viajeIndex) => {
                  const viajeCard = {
                    id: viaje._id || `proximo-${index}-${viajeIndex}`,
                    tipo: `${viaje.origen} → ${viaje.destino}`,
                    subtitulo: viaje.descripcion || 'Transporte de carga',
                    fecha: formatearFechaAmigable(dia.fecha),
                    hora: new Date(viaje.fechaSalida).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                    estado: viaje.estado,
                    ...viaje
                  };
                  return (
                    <ServiceCard 
                      key={viajeCard.id}
                      trip={viajeCard}
                      onPress={handleTripPress}
                    />
                  );
                })}
                
                {dia.viajes?.length > 2 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => handleButtonPress(() => navigation.navigate('Viajes'))}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.showMoreIcon}>✨</Text>
                    <Text style={styles.showMoreText}>
                      +{dia.viajes.length - 2} viajes más esperándote
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ESTADO VACÍO MOTIVADOR */}
        {(!viajesPorDia || viajesPorDia.length === 0) && (
          <Animated.View 
            style={[
              styles.emptyState,
              {
                transform: [
                  {
                    scale: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>¡Todo listo para la acción!</Text>
            <Text style={styles.emptySubtext}>
              Pronto tendrás nuevas rutas emocionantes 🚛✨
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={() => handleButtonPress(onRefresh)}
              activeOpacity={0.8}
            >
              <Text style={styles.refreshButtonText}>🔄 ¡Actualizar ahora!</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ACCIONES RÁPIDAS DINÁMICAS - CON LOTTIE EN MI HISTORIAL */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.historyAction]}
            onPress={() => handleButtonPress(() => navigation.navigate('Viajes'))}
            activeOpacity={0.8}
          >
            <LottieView
              source={require('../../assets/lottie/Statistics.json')} // Cambia por tu ruta exacta
              autoPlay={true}
              loop={true}
              style={styles.actionLottie}
              resizeMode="contain"
              onAnimationFinish={() => console.log('Animación de historial terminada')}
              onError={(error) => console.log('Error Lottie historial:', error)}
            />
            <Text style={styles.actionText}>Mi Historial</Text>
            <Text style={styles.actionSubtext}>Ver todo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshAction]}
            onPress={() => handleButtonPress(onRefresh)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Actualizar</Text>
            <Text style={styles.actionSubtext}>Sincronizar</Text>
          </TouchableOpacity>
        </View>

        {/* MENSAJE DE MOTIVACIÓN FINAL CON SEGUNDA LOTTIE */}
        <View style={styles.motivationFooter}>
          <LottieView
            source={require('../../assets/lottie/Celebration balloon confetti animation.json')} // Usa el mismo archivo por ahora
            autoPlay={true}
            loop={true}
            style={styles.lottieAnimation}
            resizeMode="contain"
            onAnimationFinish={() => console.log('Animación de estrella terminada')}
            onError={(error) => console.log('Error Lottie estrella:', error)}
          />
          <Text style={styles.motivationFooterText}>
            ¡Cada viaje es una nueva oportunidad de brillar!
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
  },
  
  // ===== HEADER DINÁMICO =====
  headerCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  
  timeWeatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  
  timeSection: {
    flex: 1,
  },
  
  timeWithWelcome: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  welcomeLottie: {
    width: 55,
    height: 55,
    marginRight: 15,
    // backgroundColor: 'rgba(76, 175, 80, 0.1)', // Debug - quítalo cuando funcione
  },
  
  timeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 2,
  },
  
  dateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  
  weatherSection: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    minWidth: 100,
  },
  
  weatherIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  
  tempText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 3,
  },
  
  weatherDesc: {
    fontSize: 11,
    color: '#5d6d7e',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  greetingSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.1)',
    paddingTop: 20,
  },
  
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    marginRight: 20,
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  greetingTextSection: {
    flex: 1,
  },
  
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 3,
  },
  
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  
  motivationText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // ===== ESTADÍSTICAS COLORIDAS =====
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  todayCard: {
    backgroundColor: '#ff6b35',
    transform: [{ rotate: '-1deg' }],
  },
  
  pendingCard: {
    backgroundColor: '#ffa726',
    transform: [{ rotate: '1deg' }],
  },
  
  totalCard: {
    backgroundColor: '#66bb6a',
    transform: [{ rotate: '-0.5deg' }],
  },
  
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },

  // ===== SECCIONES =====
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  
  // URGENTE
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  urgentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e74c3c',
  },
  
  urgentBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  
  urgentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  
  urgentContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#ffcdd2',
  },
  
  urgentCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  
  // PRÓXIMOS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  
  viewAllArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  dayGroup: {
    marginBottom: 25,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  
  dayColor0: { backgroundColor: '#e8f5e8' },
  dayColor1: { backgroundColor: '#fff3e0' },
  dayColor2: { backgroundColor: '#e3f2fd' },
  
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  dayLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  
  tripCount: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tripCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderStyle: 'dashed',
  },
  
  showMoreIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  
  showMoreText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },

  // ===== ESTADO VACÍO MOTIVADOR =====
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginBottom: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },

  // ===== BOTONES DINÁMICOS =====
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 35,
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ rotate: '-1deg' }],
  },
  
  refreshButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // ===== ACCIONES RÁPIDAS COLORIDAS =====
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  
  actionButton: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  
  historyAction: {
    backgroundColor: '#3498db',
    transform: [{ rotate: '1deg' }],
  },
  
  refreshAction: {
    backgroundColor: '#e67e22',
    transform: [{ rotate: '-1deg' }],
  },
  
  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  
  actionLottie: {
    width: 35,
    height: 35,
    marginBottom: 8,
  },
  
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  
  actionSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '500',
  },

  // ===== MENSAJE MOTIVACIONAL CON SEGUNDA LOTTIE =====
  motivationFooter: {
    alignItems: 'center',
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(155, 89, 182, 0.2)',
  },
  
  lottieAnimation: {
    width: 85,
    height: 85,
    marginBottom: 15,
    // backgroundColor: 'rgba(155, 89, 182, 0.1)', // Debug - quítalo cuando funcione
  },
  
  motivationFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e44ad',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

export default InicioScreen;