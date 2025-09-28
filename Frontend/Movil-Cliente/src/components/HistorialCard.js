import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

// Importa tus animaciones Lottie
import DeliveryTruck from "../assets/lottie/Car _ Ignite Animation.json";
import CheckSuccess from "../assets/lottie/success tick.json";
import ClockPending from "../assets/lottie/Waiting (1).json";
import CancelError from "../assets/lottie/cancel animation.json";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const statusConfig = {
  pendiente: {
    bg: '#FEF3C7',
    borderColor: '#F59E0B',
    color: '#92400E',
    label: 'Pendiente',
    lottie: null, // Usar ícono temporal hasta conseguir la animación
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
  ejecutada: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Ejecutada',
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
  cancelada: {
    bg: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#DC2626',
    label: 'Cancelada',
    lottie: CancelError,
    gradient: ['#FEE2E2', '#FCA5A5']
  },
};

// Función para formatear moneda de forma segura
const formatCurrency = (amount) => {
  if (!amount || amount === '—' || amount === 0) return '—';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return '—';
  }
};

// Función para obtener valor seguro como string
const getSafeString = (value, fallback = '—') => {
  if (!value || value === '—') return fallback;
  return String(value);
};

export default function HistorialCard({ item, onPress, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation();
  
  // Animaciones existentes
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const cardElevation = useRef(new Animated.Value(2)).current;
  const fullScreenButtonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada escalonada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Animar entrada del botón de pantalla completa cuando se expande
  useEffect(() => {
    Animated.spring(fullScreenButtonScale, {
      toValue: expanded ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  // Validar item
  if (!item) return null;

  const config = statusConfig[(getSafeString(item.status, 'pendiente')).toLowerCase()] || {
    bg: '#F3F4F6',
    borderColor: '#9CA3AF',
    color: '#374151',
    label: getSafeString(item.status, 'Sin estado'),
    lottie: ClockPending,
    gradient: ['#F3F4F6', '#E5E7EB']
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(cardElevation, {
        toValue: 8,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(cardElevation, {
        toValue: 2,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleExpandToggle = () => {
    // Animación del botón de expand
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Configurar animación de layout de forma segura
    const animationConfig = {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    };

    try {
      LayoutAnimation.configureNext(animationConfig);
    } catch (error) {
      console.log('LayoutAnimation not available');
    }
    
    setExpanded(prev => !prev);
    
    if (typeof onPress === 'function') onPress(item);
  };

  // Función para ir a pantalla completa
  const handleGoToFullScreen = () => {
    // Pequeña animación de feedback
    Animated.sequence([
      Animated.spring(fullScreenButtonScale, {
        toValue: 1.2,
        tension: 200,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(fullScreenButtonScale, {
        toValue: 1,
        tension: 200,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar a pantalla completa usando el nombre correcto del navegador
    navigation.navigate('QuoteDetails', { item });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: config.borderColor,
            shadowColor: config.borderColor,
          }
        ]}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleExpandToggle}
        accessible
        accessibilityLabel={`Cotización: ${getSafeString(item.title, 'Sin título')}, estado: ${config.label}`}
      >
        {/* Header con animación Lottie y estado */}
        <View style={styles.header}>
          <View style={[styles.statusContainer, { backgroundColor: config.bg }]}>
            <View style={styles.lottieContainer}>
              {config.lottie ? (
                <LottieView
                  source={config.lottie}
                  autoPlay={true}
                  loop={
                    item?.status === 'en ruta' ? true : // En ruta siempre en loop
                    item?.status === 'cancelada' || item?.status === 'cancelado' ? true : // Canceladas en loop
                    false // Completadas, ejecutadas, pendientes solo una vez
                  }
                  style={styles.statusLottie}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.fallbackIcon}>
                  {item?.status === 'pendiente' ? '⏱️' : 
                   item?.status === 'en ruta' ? '🚛' :
                   item?.status === 'completado' || item?.status === 'ejecutada' ? '✅' :
                   item?.status === 'cancelado' || item?.status === 'cancelada' ? '❌' : '📄'}
                </Text>
              )}
            </View>
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          
          {/* Botón de expansión */}
          <Animated.View
            style={[
              styles.expandButton,
              { transform: [{ rotate: rotation }] }
            ]}
          >
            <Text style={styles.expandIcon}>⌄</Text>
          </Animated.View>
        </View>

        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={expanded ? undefined : 2}>
            {getSafeString(item.title, 'Cotización sin título')}
          </Text>
          <Text style={styles.quoteId}>
            #{getSafeString(item.id?.slice(-6), 'N/A')}
          </Text>
        </View>

        {/* Vista previa compacta */}
        {!expanded && (
          <View style={styles.preview}>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📍</Text>
              <Text style={styles.previewText} numberOfLines={1}>
                {getSafeString(item.lugarEntrega, 'Sin ubicación')}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>⏰</Text>
              <Text style={styles.previewText} numberOfLines={1}>
                {getSafeString(item.horaLlegada, 'Sin hora')}
              </Text>
            </View>
            {/* Mostrar precio si está disponible */}
            {item?.total && item?.total !== '—' && item?.total !== 0 && (
              <View style={styles.pricePreview}>
                <Text style={styles.priceText}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Detalles expandidos */}
        {expanded && (
          <View style={styles.details}>
            <View style={styles.divider} />
            
            <DetailItem
              icon="📍"
              label="Lugar de entrega"
              value={getSafeString(item.lugarEntrega, 'No especificado')}
              color="#10B981"
            />
            <DetailItem
              icon="⏰"
              label="Hora de llegada"
              value={getSafeString(item.horaLlegada, 'No especificado')}
              color="#3B82F6"
            />
            <DetailItem
              icon="🚚"
              label="Hora de salida"
              value={getSafeString(item.horaSalida, 'No especificado')}
              color="#F59E0B"
            />
            <DetailItem
              icon="💳"
              label="Método de pago"
              value={getSafeString(item.metodoPago, 'No especificado')}
              color="#8B5CF6"
            />
            
            {/* Mostrar precio en vista expandida */}
            {item?.total && item?.total !== '—' && item?.total !== 0 && (
              <DetailItem
                icon="💰"
                label="Total"
                value={formatCurrency(item.total)}
                color="#059669"
                isPrice={true}
              />
            )}

            {/* Progreso visual para entregas en ruta */}
            {item?.status === 'en ruta' && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Estado del envío</Text>
                <View style={styles.progressBar}>
                  <Animated.View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>En camino...</Text>
              </View>
            )}

            {/* Botón para ver en pantalla completa */}
            <Animated.View
              style={[
                styles.fullScreenButtonContainer,
                { transform: [{ scale: fullScreenButtonScale }] }
              ]}
            >
              <TouchableOpacity
                style={[styles.fullScreenButton, { borderColor: config.borderColor }]}
                onPress={handleGoToFullScreen}
                activeOpacity={0.8}
              >
                <Text style={styles.fullScreenIcon}>🔍</Text>
                <Text style={[styles.fullScreenText, { color: config.color }]}>
                  Ver detalles completos
                </Text>
                <Text style={styles.fullScreenArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Indicador visual en la esquina para estados importantes */}
        {(item?.status === 'completado' || item?.status === 'ejecutada' || item?.status === 'cancelado') && (
          <View style={[styles.cornerIndicator, { backgroundColor: config.borderColor }]}>
            <Text style={styles.cornerIcon}>
              {(item?.status === 'completado' || item?.status === 'ejecutada') ? '✓' : '✕'}
            </Text>
          </View>
        )}

        {/* Botón flotante de acceso rápido a pantalla completa (solo cuando no está expandido) */}
        {!expanded && (
          <TouchableOpacity
            style={[styles.quickAccessButton, { backgroundColor: config.borderColor }]}
            onPress={handleGoToFullScreen}
            activeOpacity={0.8}
          >
            <Text style={styles.quickAccessIcon}>📋</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Componente para elementos de detalle
const DetailItem = ({ icon, label, value, color, isPrice = false }) => {
  const safeIcon = getSafeString(icon, '');
  const safeLabel = getSafeString(label, '');
  const safeValue = getSafeString(value, 'No especificado');

  return (
    <View style={styles.detailItem}>
      <View style={[styles.detailIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.detailIcon}>{safeIcon}</Text>
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{safeLabel}</Text>
        <Text 
          style={[
            styles.detailValue, 
            isPrice && styles.priceValue
          ]} 
          numberOfLines={2}
        >
          {safeValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 3, // Borde más grueso para que se vea mejor
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'visible',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  lottieContainer: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  statusLottie: {
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  quoteId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  preview: {
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  previewText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  pricePreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  details: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  progressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    width: '70%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  cornerIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 24,
    height: 24,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fullScreenButtonContainer: {
    marginTop: 16,
  },
  fullScreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FAFAFA',
  },
  fullScreenIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fullScreenText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  fullScreenArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  quickAccessButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickAccessIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});