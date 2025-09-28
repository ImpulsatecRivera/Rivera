// QuoteDetailsScreen.js - Versión simplificada sin PDF ni compartir
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
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const GREEN = '#10AC84';
const BLUE = '#3B82F6';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

const QuoteDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { quote } = route.params || {};
  
  // Función para obtener color según estado
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobado':
      case 'approved':
        return GREEN;
      case 'pendiente':
      case 'pending':
        return ORANGE;
      case 'rechazado':
      case 'rejected':
        return RED;
      default:
        return ORANGE;
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para generar número de cotización
  const getQuoteNumber = () => {
    if (quote?._id) {
      return `COT-${quote._id.slice(-8).toUpperCase()}`;
    }
    return 'COT-00000000';
  };

  // Función para obtener nombre del cliente
  const getClientName = () => {
    return quote?.clientName || quote?.cliente?.nombre || 'Cliente Rivera Transport';
  };

  // Función para editar cotización
  const editQuote = () => {
    Alert.alert(
      'Nueva Cotización',
      '¿Deseas crear una nueva cotización?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Crear', 
          onPress: () => {
            navigation.navigate('IntegratedTruckRequestScreen');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de Cotización</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado de factura con logo */}
        <View style={styles.invoiceHeader}>
          <View style={styles.companyInfo}>
            <Image 
              source={require('../images/logo.png')}
              style={styles.companyLogo}
              resizeMode="contain"
            />
            <Text style={styles.companyName}>Rivera Transport</Text>
            <Text style={styles.companyTagline}>Servicios de Transporte Profesional</Text>
          </View>
          
          <View style={styles.quoteNumber}>
            <Text style={styles.quoteNumberLabel}>COTIZACIÓN</Text>
            <Text style={styles.quoteNumberValue}>{getQuoteNumber()}</Text>
          </View>
        </View>

        {/* Estado de la cotización */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(quote?.status) }]}>
          <Text style={styles.statusText}>
            {quote?.status?.toUpperCase() || 'PENDIENTE'}
          </Text>
        </View>

        {/* Información del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información del Cliente</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre del cliente:</Text>
              <Text style={styles.infoValue}>{getClientName()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de solicitud:</Text>
              <Text style={styles.infoValue}>{formatDate(quote?.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método de pago:</Text>
              <Text style={styles.infoValue}>{quote?.paymentMethod || 'No especificado'}</Text>
            </View>
          </View>
        </View>

        {/* Detalles del servicio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚛 Detalles del Servicio</Text>
          <View style={styles.sectionContent}>
            
            {/* Tipo de camión */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>🚚</Text>
                <Text style={styles.serviceTitle}>Tipo de Camión</Text>
              </View>
              <Text style={styles.serviceValue}>{quote?.truckType || 'No especificado'}</Text>
              {quote?.quoteDescription && (
                <Text style={styles.serviceDescription}>{quote.quoteDescription}</Text>
              )}
            </View>

            {/* Ruta */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>📍</Text>
                <Text style={styles.serviceTitle}>Ruta del Transporte</Text>
              </View>
              
              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: GREEN }]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>Origen</Text>
                    <Text style={styles.routeAddress}>
                      {quote?.pickupLocation || quote?.ruta?.origen?.nombre || 'No especificado'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.routeConnector}>
                  <View style={styles.routeLine} />
                  <Text style={styles.routeDistance}>
                    {quote?.ruta?.distanciaTotal ? `${Math.round(quote.ruta.distanciaTotal)} km` : ''}
                  </Text>
                </View>
                
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: RED }]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>Destino</Text>
                    <Text style={styles.routeAddress}>
                      {quote?.destinationLocation || quote?.ruta?.destino?.nombre || 'No especificado'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Horarios */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>⏰</Text>
                <Text style={styles.serviceTitle}>Horarios</Text>
              </View>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Fecha necesaria:</Text>
                  <Text style={styles.timelineValue}>{formatDate(quote?.fechaNecesaria)}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Salida estimada:</Text>
                  <Text style={styles.timelineValue}>{formatDate(quote?.horarios?.fechaSalida)}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Llegada estimada:</Text>
                  <Text style={styles.timelineValue}>{formatDate(quote?.horarios?.fechaLlegadaEstimada)}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Tiempo de viaje:</Text>
                  <Text style={styles.timelineValue}>
                    {quote?.ruta?.tiempoEstimado ? `${Math.round(quote.ruta.tiempoEstimado * 60)} minutos` : 'No especificado'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Breakdown de costos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Desglose de Costos</Text>
          <View style={styles.sectionContent}>
            <View style={styles.costCard}>
              <Text style={styles.costNote}>
                Los costos se calcularán y notificarán en un plazo de 5 días hábiles una vez confirmada la cotización.
              </Text>
              
              <View style={styles.costBreakdown}>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>⛽ Combustible</Text>
                  <Text style={styles.costValue}>A calcular</Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>🛣️ Peajes</Text>
                  <Text style={styles.costValue}>A calcular</Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>👨‍✈️ Conductor</Text>
                  <Text style={styles.costValue}>A calcular</Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>📋 Otros gastos</Text>
                  <Text style={styles.costValue}>A calcular</Text>
                </View>
                
                <View style={[styles.costItem, styles.totalCost]}>
                  <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
                  <Text style={styles.totalValue}>Pendiente</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Términos y condiciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Términos y Condiciones</Text>
          <View style={styles.sectionContent}>
            <View style={styles.termsCard}>
              <Text style={styles.termsText}>
                • Esta cotización tiene validez de 30 días calendario.{'\n'}
                • Los precios pueden variar según condiciones del mercado.{'\n'}
                • Se requiere confirmación 48 horas antes del servicio.{'\n'}
                • Cancelaciones deben realizarse con 24 horas de anticipación.{'\n'}
                • El pago se realizará según el método acordado.{'\n'}
                • Rivera Transport se reserva el derecho de modificar términos.
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]} 
            onPress={editQuote}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.primaryActionText]}>
              ✏️ Nueva Cotización
            </Text>
          </TouchableOpacity>
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

  // === HEADER ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  placeholderButton: {
    width: 40,
    height: 40,
  },

  // === SCROLL ===
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // === ENCABEZADO CON LOGO ===
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  companyInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },

  companyLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },

  companyName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },

  companyTagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  quoteNumber: {
    alignItems: 'flex-end',
  },

  quoteNumberLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },

  quoteNumberValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  // === ESTADO ===
  statusBanner: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  statusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // === SECCIONES ===
  section: {
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#FAFBFC',
  },

  sectionContent: {
    padding: 20,
    paddingTop: 0,
  },

  // === INFO ROWS ===
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // === SERVICE CARDS ===
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  serviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  serviceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // === RUTA ===
  routeContainer: {
    marginTop: 8,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },

  routeInfo: {
    flex: 1,
  },

  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  routeAddress: {
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
    height: 20,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },

  routeDistance: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  // === TIMELINE ===
  timelineContainer: {
    marginTop: 8,
  },

  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  timelineLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  timelineValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // === COSTOS ===
  costCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  costNote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  costBreakdown: {
    marginTop: 8,
  },

  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  costLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  costValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  totalCost: {
    borderTopWidth: 2,
    borderTopColor: '#D1D5DB',
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
  },

  totalLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 16,
    color: GREEN,
    fontWeight: '800',
  },

  // === TÉRMINOS ===
  termsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  termsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },

  // === BOTONES ===
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  actionButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },

  primaryAction: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  primaryActionText: {
    color: '#FFFFFF',
  },
});

export default QuoteDetailsScreen;