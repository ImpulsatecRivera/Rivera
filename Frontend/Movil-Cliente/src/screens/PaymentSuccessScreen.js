// PaymentSuccessScreen.js - Versión limpia, profesional y responsive
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const GREEN = '#10AC84';
const BLUE = '#3B82F6';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    metodoPago = 'Efectivo',
    truckTypeName = 'Camión',
    price = 0,
    estimatedTime = 0,
    pickupLocation = '',
    destinationLocation = '',
    departureTime = '',
    arrivalTime = '',
    quoteId = '',
    quoteData = null
  } = route.params || {};

  const goHome = () => {
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const viewQuoteDetails = () => {
    if (quoteData && quoteId) {
      navigation.navigate('cotizacionFactura', {
        quote: quoteData
      });
    } else {
      console.log('No hay datos de cotización disponibles');
      goHome();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header con Lottie */}
        <View style={styles.header}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/lottie/Success.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
              resizeMode="contain"
            />
            
            {/* Elementos decorativos sutiles */}
            <View style={[styles.decorativeDot, { top: 20, left: 30, backgroundColor: GREEN }]} />
            <View style={[styles.decorativeDot, { top: 40, right: 25, backgroundColor: BLUE }]} />
            <View style={[styles.decorativeDot, { bottom: 30, left: 20, backgroundColor: '#F59E0B' }]} />
            <View style={[styles.decorativeDot, { bottom: 15, right: 35, backgroundColor: '#8B5CF6' }]} />
          </View>
          
          <Text style={styles.title}>¡Cotización Enviada!</Text>
          <Text style={styles.subtitle}>
            Tu solicitud se procesó exitosamente
          </Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          
          {/* Información básica */}
          {truckTypeName && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>🚛</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>TIPO DE CAMIÓN</Text>
                  <Text style={styles.cardValue}>{truckTypeName}</Text>
                </View>
              </View>
            </View>
          )}

          {estimatedTime > 0 && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>⏱️</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>TIEMPO ESTIMADO</Text>
                  <Text style={styles.cardValue}>{estimatedTime} minutos</Text>
                </View>
              </View>
            </View>
          )}

          {/* Ruta del viaje */}
          {pickupLocation && destinationLocation && (
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeIcon}>📍</Text>
                <Text style={styles.routeTitle}>Ruta del viaje</Text>
              </View>
              
              <View style={styles.routeContent}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: GREEN }]} />
                  <Text style={styles.routeText}>{pickupLocation}</Text>
                </View>
                
                <View style={styles.routeConnector}>
                  <View style={styles.routeLine} />
                  <Text style={styles.routeArrow}>→</Text>
                </View>
                
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.routeText}>{destinationLocation}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Método de pago */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentIcon}>
                {metodoPago === 'Transferencia' ? '💳' : '💵'}
              </Text>
              <Text style={styles.paymentText}>
                Pago con {metodoPago.toLowerCase()}
              </Text>
            </View>
          </View>

          {/* Próximos pasos */}
          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Text style={styles.infoBoxIcon}>📋</Text>
              <Text style={styles.infoBoxTitle}>Próximos pasos</Text>
            </View>
            <Text style={styles.infoBoxText}>
              En el transcurso de 5 días te notificaremos el monto final a pagar.
            </Text>
            <Text style={styles.infoBoxSubtext}>
              Algunos datos podrían ajustarse al confirmar la cotización definitiva.
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            {quoteData && quoteId && (
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={viewQuoteDetails} 
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>📄 Ver detalles</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={goHome} 
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // === SCROLL ===
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    minHeight: height - 100, // Asegurar altura mínima
  },

  // === HEADER ===
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },

  lottieContainer: {
    width: 160,
    height: 160,
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 140,
    height: 140,
  },

  decorativeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },

  // === CONTENIDO ===
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // === CARDS DE INFORMACIÓN ===
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  icon: {
    fontSize: 20,
  },

  cardContent: {
    flex: 1,
  },

  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  cardValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },

  // === RUTA ===
  routeCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    overflow: 'hidden',
  },

  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E0F2FE',
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },

  routeIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },

  routeContent: {
    padding: 20,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
  },

  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    marginVertical: 4,
  },

  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginRight: 12,
  },

  routeArrow: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  // === MÉTODO DE PAGO ===
  paymentCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  paymentIcon: {
    fontSize: 18,
    marginRight: 12,
  },

  paymentText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
  },

  // === INFORMACIÓN ===
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoBoxIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },

  infoBoxText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },

  infoBoxSubtext: {
    fontSize: 13,
    color: '#D97706',
    lineHeight: 18,
    fontWeight: '400',
  },

  // === BOTONES ===
  actionButtons: {
    gap: 12,
    paddingBottom: 20,
  },

  secondaryButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: GREEN,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default PaymentSuccessScreen;