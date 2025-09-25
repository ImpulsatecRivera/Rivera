import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// Importa las mismas animaciones Lottie
import DeliveryTruck from "../assets/lottie/Car _ Ignite Animation.json";
import CheckSuccess from "../assets/lottie/success tick.json";
import ClockPending from "../assets/lottie/Tourists by car.json";
import CancelError from "../assets/lottie/cancel animation.json";

const { width } = Dimensions.get('window');
const BG = '#F8F9FA';

// Misma configuración de estados que tu card
const statusConfig = {
  pendiente: {
    bg: '#FEF3C7',
    borderColor: '#F59E0B',
    color: '#92400E',
    label: 'Pendiente',
    lottie: ClockPending,
    gradient: ['#FEF3C7', '#FCD34D']
  },
  'en ruta': {
    bg: '#DBEAFE',
    borderColor: '#3B82F6',
    color: '#1E40AF',
    label: 'En Ruta',
    lottie: DeliveryTruck,
    gradient: ['#DBEAFE', '#93C5FD']
  },
  completado: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Completado',
    lottie: CheckSuccess,
    gradient: ['#D1FAE5', '#6EE7B7']
  },
  cancelado: {
    bg: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#DC2626',
    label: 'Cancelado',
    lottie: CancelError,
    gradient: ['#FEE2E2', '#FCA5A5']
  },
};

// Funciones de utilidad
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount) => {
  if (!amount || amount === '—') return '—';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  } catch {
    return `$${amount}`;
  }
};

const formatShortDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function DetalleQuoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada secuencial
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <LottieView
            source={CancelError}
            autoPlay
            loop={false}
            style={styles.errorLottie}
          />
          <Text style={styles.errorText}>No se encontró información de la cotización</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = statusConfig[(item?.status || '').toLowerCase()] || {
    bg: '#F3F4F6',
    borderColor: '#9CA3AF',
    color: '#374151',
    label: item?.status || 'Sin estado',
    lottie: ClockPending,
    gradient: ['#F3F4F6', '#E5E7EB']
  };

  const handleShare = async () => {
    try {
      const shareContent = `
🧾 Cotización: ${item.title || 'Sin título'}
📍 Destino: ${item.lugarEntrega || 'No especificado'}
📅 Salida: ${formatShortDate(item.horaSalida)}
📅 Llegada: ${formatShortDate(item.horaLlegada)}
💰 Total: ${formatCurrency(item.total)}
📋 Estado: ${config.label.toUpperCase()}
💳 Método de pago: ${item.metodoPago || 'No especificado'}
🆔 ID: #${item.id?.slice(-6) || 'N/A'}
      `.trim();

      await Share.share({
        message: shareContent,
        title: 'Detalles de Cotización',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la información');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header animado */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Cotización</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[
        styles.content, 
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
          {/* Hero Status Card con Lottie */}
          <View style={[styles.heroCard, { borderColor: config.borderColor }]}>
            <View style={styles.heroHeader}>
              <View style={styles.heroLottieContainer}>
                <LottieView
                  source={config.lottie}
                  autoPlay
                  loop={item?.status === 'en ruta'}
                  style={styles.heroLottie}
                />
              </View>
              <View style={styles.heroInfo}>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {config.label.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>{item.title || 'Cotización sin título'}</Text>
                <Text style={styles.heroId}>#{item.id?.slice(-6) || 'N/A'}</Text>
              </View>
            </View>
            
            {/* Precio destacado */}
            {item.total && item.total !== '—' && (
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Total a Pagar</Text>
                <Text style={styles.priceValue}>{formatCurrency(item.total)}</Text>
              </View>
            )}
          </View>

          {/* Timeline de fechas (si hay fechas) */}
          {(item.horaSalida || item.horaLlegada) && (
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>📅 Cronograma</Text>
              
              {item.horaSalida && (
                <TimelineItem
                  icon="🚚"
                  title="Fecha de Salida"
                  time={formatDate(item.horaSalida)}
                  isActive={item.status === 'en ruta' || item.status === 'completado'}
                  color="#F59E0B"
                />
              )}
              
              {item.horaLlegada && (
                <TimelineItem
                  icon="📍"
                  title="Fecha de Llegada Estimada"
                  time={formatDate(item.horaLlegada)}
                  isActive={item.status === 'completado'}
                  color="#10B981"
                  isLast={true}
                />
              )}
            </View>
          )}

          {/* Detalles del viaje */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>🚛 Detalles del Viaje</Text>
            
            <DetailRow
              icon="📍"
              label="Destino"
              value={item.lugarEntrega}
              color="#10B981"
            />
            
            {item.metodoPago && (
              <DetailRow
                icon="💳"
                label="Método de Pago"
                value={item.metodoPago}
                color="#8B5CF6"
              />
            )}
          </View>

          {/* Información adicional si existe */}
          {item._raw && (
            <View style={styles.additionalCard}>
              <Text style={styles.sectionTitle}>📋 Información Adicional</Text>
              
              {item._raw.quoteDescription && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Descripción</Text>
                  <Text style={styles.descriptionText}>{item._raw.quoteDescription}</Text>
                </View>
              )}
              
              {item._raw.createdAt && (
                <DetailRow
                  icon="📅"
                  label="Fecha de Creación"
                  value={formatDate(item._raw.createdAt)}
                  color="#6B7280"
                />
              )}
            </View>
          )}

          {/* Progreso especial para envíos en ruta */}
          {item.status === 'en ruta' && (
            <View style={styles.progressCard}>
              <Text style={styles.sectionTitle}>🚛 Estado del Envío</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>En camino a destino...</Text>
              </View>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: config.borderColor }]}
              onPress={() => Alert.alert('Función', 'Contactar soporte - En desarrollo')}
            >
              <Text style={styles.primaryButtonText}>📞 Contactar Soporte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleShare}
            >
              <Text style={[styles.secondaryButtonText, { color: config.borderColor }]}>
                📤 Compartir Detalles
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// Componente para elementos de timeline
const TimelineItem = ({ icon, title, time, isActive, color, isLast = false }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={[
        styles.timelineIcon, 
        { 
          backgroundColor: isActive ? color + '20' : '#F3F4F6',
          borderColor: isActive ? color : '#E5E7EB'
        }
      ]}>
        <Text style={styles.timelineEmoji}>{icon}</Text>
      </View>
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: isActive ? color : '#E5E7EB' }]} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={[styles.timelineTitle, { color: isActive ? '#111827' : '#6B7280' }]}>
        {title}
      </Text>
      <Text style={styles.timelineTime}>{time}</Text>
    </View>
  </View>
);

// Componente para filas de detalles
const DetailRow = ({ icon, label, value, color }) => (
  <View style={styles.detailRow}>
    <View style={[styles.detailIconContainer, { backgroundColor: color + '20' }]}>
      <Text style={styles.detailIcon}>{icon}</Text>
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'No especificado'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  shareIcon: {
    fontSize: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  
  // Hero card styles
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroLottieContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  heroLottie: {
    width: '100%',
    height: '100%',
  },
  heroInfo: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 24,
  },
  heroId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  priceSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#059669',
  },

  // Card styles generales
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  additionalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // Timeline styles
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  timelineEmoji: {
    fontSize: 16,
  },
  timelineLine: {
    width: 2,
    height: 30,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Detail row styles
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailContent: {
    flex: 1,
    paddingTop: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Description styles
  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  // Progress styles
  progressContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '70%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Action buttons
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorLottie: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});