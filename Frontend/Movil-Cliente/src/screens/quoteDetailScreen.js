// src/screens/QuoteDetailsScreen.jsx
import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, Text, TouchableOpacity,
  SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const QuoteDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  
  const { quote } = route.params || {};

  if (!quote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la cotización</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Función para aceptar cotización
  const handleAcceptQuote = async () => {
    try {
      Alert.alert(
        "Aceptar Cotización",
        `¿Estás seguro de aceptar esta cotización por ${quote.currency === 'USD' ? '$' : ''}${(quote.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}?`,
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Aceptar",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
                const response = await fetch(`riveraproject-production.up.railway.app/api/cotizaciones/${quote.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: 'aceptada'
                  })
                });

                if (response.ok) {
                  Alert.alert("Éxito", "Cotización aceptada correctamente", [
                    {
                      text: "OK",
                      onPress: () => navigation.goBack()
                    }
                  ]);
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Error al aceptar la cotización');
                }
              } catch (error) {
                console.error('Error accepting quote:', error);
                Alert.alert("Error", `No se pudo aceptar la cotización: ${error.message}`);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pendiente': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
      'enviada': { bg: '#DBEAFE', text: '#1D4ED8', border: '#3B82F6' },
      'aceptada': { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
      'rechazada': { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
      'ejecutada': { bg: '#E0E7FF', text: '#3730A3', border: '#8B5CF6' },
      'cancelada': { bg: '#F3F4F6', text: '#374151', border: '#6B7280' },
    };
    
    return statusColors[status?.toLowerCase()] || { bg: '#E6FFFA', text: '#0F766E', border: '#14B8A6' };
  };

  const formatTime = (iso) => {
    if (!iso || iso === '—') return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const formatDate = (iso) => {
    if (!iso || iso === '—') return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-SV', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  const statusColors = getStatusColor(quote.status);
  const shouldShowAcceptButton = quote.status === 'pendiente' && quote.amount && quote.amount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de Cotización</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado de la cotización */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors.bg, 
            borderColor: statusColors.border 
          }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Información principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.value}>{quote.title || 'Sin descripción'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Precio</Text>
            <Text style={[styles.value, styles.priceText]}>
              {quote.currency === 'USD' ? '$' : ''}{(quote.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Método de pago</Text>
            <Text style={styles.value}>{quote.paymentMethod || 'No especificado'}</Text>
          </View>
        </View>

        {/* Información de horarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Hora de salida</Text>
            <Text style={styles.value}>{formatTime(quote.departureTime)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Hora de llegada</Text>
            <Text style={styles.value}>{formatTime(quote.arrivalTime)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de entrega</Text>
            <Text style={styles.value}>{formatDate(quote.deliveryDate)}</Text>
          </View>
        </View>

        {/* Información de ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Lugar de entrega</Text>
            <Text style={styles.value}>{quote.deliveryPlace || 'No especificado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Destinos de viaje</Text>
            <Text style={styles.value}>{quote.travelLocations || 'No especificado'}</Text>
          </View>
        </View>

        {/* Información adicional */}
        {(quote.truckType || quote.quoteDescription) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            
            {quote.truckType && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tipo de camión</Text>
                <Text style={styles.value}>{quote.truckType}</Text>
              </View>
            )}

            {quote.quoteDescription && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Descripción detallada</Text>
                <Text style={styles.value}>{quote.quoteDescription}</Text>
              </View>
            )}
          </View>
        )}

        {/* Fechas del sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID de cotización</Text>
            <Text style={[styles.value, styles.idText]}>{quote.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de creación</Text>
            <Text style={styles.value}>{formatDate(quote.createdAt)}</Text>
          </View>

          {quote.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Última actualización</Text>
              <Text style={styles.value}>{formatDate(quote.updatedAt)}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer con botones de acción */}
      <View style={styles.footer}>
        {shouldShowAcceptButton && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptQuote}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Procesando...' : 'Aceptar Cotización'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backActionButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backActionButtonText}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Status section
  statusSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },

  // Info rows
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10AC84',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10AC84',
  },
  backActionButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backActionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuoteDetailsScreen;