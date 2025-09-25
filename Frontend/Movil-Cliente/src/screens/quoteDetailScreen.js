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
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

// Importa las mismas animaciones Lottie
import DeliveryTruck from "../assets/lottie/Car _ Ignite Animation.json";
import CheckSuccess from "../assets/lottie/success tick.json";
import ClockPending from "../assets/lottie/Tourists by car.json";
import CancelError from "../assets/lottie/cancel animation.json";
import EditSuccess from "../assets/lottie/Blue successful login.json"; // Tu animación de éxito

const { width } = Dimensions.get('window');

// Configuración de estados con Lottie
const statusConfig = {
  pendiente: {
    bg: '#FEF3C7',
    borderColor: '#F59E0B',
    color: '#92400E',
    label: 'Pendiente',
    lottie: ClockPending,
  },
  enviada: {
    bg: '#DBEAFE',
    borderColor: '#3B82F6',
    color: '#1D4ED8',
    label: 'Enviada',
    lottie: DeliveryTruck,
  },
  'en ruta': {
    bg: '#DBEAFE',
    borderColor: '#3B82F6',
    color: '#1E40AF',
    label: 'En Ruta',
    lottie: DeliveryTruck,
  },
  aceptada: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#065F46',
    label: 'Aceptada',
    lottie: CheckSuccess,
  },
  completado: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Completado',
    lottie: CheckSuccess,
  },
  ejecutada: {
    bg: '#D1FAE5',
    borderColor: '#10B981',
    color: '#047857',
    label: 'Ejecutada',
    lottie: CheckSuccess,
  },
  rechazada: {
    bg: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#991B1B',
    label: 'Rechazada',
    lottie: CancelError,
  },
  cancelada: {
    bg: '#F3F4F6',
    borderColor: '#6B7280',
    color: '#374151',
    label: 'Cancelada',
    lottie: CancelError,
  },
};

// Funciones de utilidad
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-SV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
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

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount || amount === '—' || amount === 0) return '—';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    const symbol = currency === 'USD' ? '$' : '';
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  } catch {
    return `$${amount}`;
  }
};

export default function DetalleQuoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, quote } = route.params || {};
  
  // Usar quote si viene del QuoteDetailsScreen, sino usar item del HistorialCard
  const data = quote || item;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  
  // Animaciones sutiles
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const editSuccessScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Efecto para mostrar animación de éxito de edición
  useEffect(() => {
    if (showEditSuccess) {
      Animated.sequence([
        Animated.spring(editSuccessScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(editSuccessScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowEditSuccess(false);
      });
    }
  }, [showEditSuccess]);

  if (!data) {
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

  // Mapear campos para compatibilidad entre ambas estructuras
  const mappedData = {
    id: data.id || data._id,
    title: data.title || data.quoteName || data.quoteDescription || 'Sin título',
    status: data.status,
    amount: data.total || data.amount || data.price,
    currency: data.currency || 'USD',
    paymentMethod: data.metodoPago || data.paymentMethod,
    deliveryPlace: data.lugarEntrega || data.deliveryPlace || data.travelLocations,
    departureTime: data.horaSalida || data.departureTime,
    arrivalTime: data.horaLlegada || data.arrivalTime,
    deliveryDate: data.deliveryDate,
    travelLocations: data.travelLocations,
    truckType: data.truckType,
    quoteDescription: data.quoteDescription || data._raw?.quoteDescription,
    createdAt: data.createdAt || data._raw?.createdAt,
    updatedAt: data.updatedAt || data._raw?.updatedAt,
    clientId: data.clienteId || data.clientId,
  };

  // Función para aceptar cotización
  const handleAcceptQuote = async () => {

  const config = statusConfig[mappedData.status?.toLowerCase()] || {
    bg: '#F3F4F6',
    borderColor: '#6B7280',
    color: '#374151',
    label: mappedData.status || 'Sin estado',
    lottie: ClockPending,
  };

  // Función para editar cotización
  const handleEditQuote = async () => {
    Alert.alert(
      "Editar Cotización",
      "¿Deseas editar esta cotización? Podrás modificar los datos disponibles.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar",
          style: "default",
          onPress: async () => {
            setIsEditing(true);
            try {
              // Aquí puedes agregar campos editables o navegar a una pantalla de edición
              // Por ahora simularemos una edición exitosa
              await new Promise(resolve => setTimeout(resolve, 1500)); // Simular call al backend
              
              // Ejemplo de call real al backend (descomenta cuando esté listo):
              /*
              const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  // Los campos que quieras editar
                  status: mappedData.status,
                  title: mappedData.title,
                  // ... otros campos
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al editar la cotización');
              }
              */

              // Mostrar animación de éxito
              setShowEditSuccess(true);
              
            } catch (error) {
              Alert.alert("Error", `No se pudo editar la cotización: ${error.message}`);
            } finally {
              setIsEditing(false);
            }
          }
        }
      ]
    );
  };

  // Función para eliminar cotización  
  const handleDeleteQuote = async () => {
    Alert.alert(
      "Eliminar Cotización",
      `¿Estás seguro de que deseas eliminar la cotización "${mappedData.title}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              });

              if (response.ok) {
                Alert.alert(
                  "Eliminada", 
                  "La cotización se ha eliminado correctamente", 
                  [
                    { 
                      text: "OK", 
                      onPress: () => navigation.goBack() // Volver al listado
                    }
                  ]
                );
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar la cotización');
              }
            } catch (error) {
              Alert.alert("Error", `No se pudo eliminar la cotización: ${error.message}`);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
    if (mappedData.status !== 'pendiente' || !mappedData.amount || mappedData.amount <= 0) return;

    try {
      Alert.alert(
        "Aceptar Cotización",
        `¿Estás seguro de aceptar esta cotización por ${formatCurrency(mappedData.amount, mappedData.currency)}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Aceptar",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
                const response = await fetch(`https://riveraproject-production.up.railway.app/api/cotizaciones/${mappedData.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'aceptada' })
                });

                if (response.ok) {
                  Alert.alert("Éxito", "Cotización aceptada correctamente", [
                    { text: "OK", onPress: () => navigation.goBack() }
                  ]);
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Error al aceptar la cotización');
                }
              } catch (error) {
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

  const handleShare = async () => {
    try {
      const shareContent = `
🧾 Cotización: ${mappedData.title}
📍 Destino: ${mappedData.deliveryPlace || 'No especificado'}
📅 Fecha de entrega: ${formatDate(mappedData.deliveryDate)}
💰 Total: ${formatCurrency(mappedData.amount, mappedData.currency)}
📋 Estado: ${config.label.toUpperCase()}
💳 Método de pago: ${mappedData.paymentMethod || 'No especificado'}
🆔 ID: ${mappedData.id?.slice(-6) || 'N/A'}
      `.trim();

      await Share.share({
        message: shareContent,
        title: 'Detalles de Cotización',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la información');
    }
  };

  const shouldShowAcceptButton = mappedData.status === 'pendiente' && mappedData.amount && mappedData.amount > 0;

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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[
        styles.content, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Estado de la cotización con Lottie */}
          <View style={styles.statusSection}>
            <View style={styles.statusContainer}>
              <View style={styles.lottieContainer}>
                <LottieView
                  source={config.lottie}
                  autoPlay
                  loop={mappedData.status === 'en ruta'}
                  style={styles.statusLottie}
                />
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: config.bg, 
                borderColor: config.borderColor 
              }]}>
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Información principal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Descripción</Text>
              <Text style={styles.value}>{mappedData.title}</Text>
            </View>

            {mappedData.amount && mappedData.amount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Precio</Text>
                <Text style={[styles.value, styles.priceText]}>
                  {formatCurrency(mappedData.amount, mappedData.currency)}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Método de pago</Text>
              <Text style={styles.value}>{mappedData.paymentMethod || 'No especificado'}</Text>
            </View>
          </View>

          {/* Información de horarios */}
          {(mappedData.departureTime || mappedData.arrivalTime || mappedData.deliveryDate) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horarios</Text>
              
              {mappedData.departureTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Hora de salida</Text>
                  <Text style={styles.value}>{formatTime(mappedData.departureTime)}</Text>
                </View>
              )}

              {mappedData.arrivalTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Hora de llegada</Text>
                  <Text style={styles.value}>{formatTime(mappedData.arrivalTime)}</Text>
                </View>
              )}

              {mappedData.deliveryDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Fecha de entrega</Text>
                  <Text style={styles.value}>{formatDate(mappedData.deliveryDate)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Información de ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Lugar de entrega</Text>
              <Text style={styles.value}>{mappedData.deliveryPlace || 'No especificado'}</Text>
            </View>

            {mappedData.travelLocations && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Destinos de viaje</Text>
                <Text style={styles.value}>{mappedData.travelLocations}</Text>
              </View>
            )}
          </View>

          {/* Información adicional */}
          {(mappedData.truckType || mappedData.quoteDescription) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Adicional</Text>
              
              {mappedData.truckType && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tipo de camión</Text>
                  <Text style={styles.value}>{mappedData.truckType}</Text>
                </View>
              )}

              {mappedData.quoteDescription && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Descripción detallada</Text>
                  <Text style={styles.value}>{mappedData.quoteDescription}</Text>
                </View>
              )}
            </View>
          )}

          {/* Información del sistema */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Sistema</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID de cotización</Text>
              <Text style={[styles.value, styles.idText]}>{mappedData.id}</Text>
            </View>

            {mappedData.createdAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Fecha de creación</Text>
                <Text style={styles.value}>{formatDate(mappedData.createdAt)}</Text>
              </View>
            )}

            {mappedData.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Última actualización</Text>
                <Text style={styles.value}>{formatDate(mappedData.updatedAt)}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Footer con botones de acción */}
      <View style={styles.footer}>
        {shouldShowAcceptButton && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptQuote}
            disabled={isLoading || isEditing || isDeleting}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Procesando...' : 'Aceptar Cotización'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botones de Editar y Eliminar */}
        <View style={styles.editDeleteContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditQuote}
            disabled={isLoading || isEditing || isDeleting}
          >
            {isEditing ? (
              <Text style={styles.editButtonText}>Editando...</Text>
            ) : (
              <>
                <Ionicons name="create-outline" size={20} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Editar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteQuote}
            disabled={isLoading || isEditing || isDeleting}
          >
            {isDeleting ? (
              <Text style={styles.deleteButtonText}>Eliminando...</Text>
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={isEditing || isDeleting}
        >
          <Ionicons name="share-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Compartir Detalles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backActionButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backActionButtonText}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay de éxito de edición */}
      {showEditSuccess && (
        <Animated.View 
          style={[
            styles.editSuccessOverlay,
            { transform: [{ scale: editSuccessScale }] }
          ]}
        >
          <View style={styles.editSuccessContainer}>
            <View style={styles.editSuccessLottie}>
              <LottieView
                source={EditSuccess}
                autoPlay
                loop={false}
                style={styles.successLottieStyle}
              />
            </View>
            <Text style={styles.editSuccessText}>Cotización editada correctamente</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Status section with Lottie
  statusSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  lottieContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  statusLottie: {
    width: '100%',
    height: '100%',
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#10AC84',
  },
  editDeleteContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    flex: 1,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  shareButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  backActionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos para overlay de éxito de edición
  editSuccessOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editSuccessContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: width * 0.8,
  },
  editSuccessLottie: {
    width: 100,
    height: 100,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLottieStyle: {
    width: '100%',
    height: '100%',
  },
  editSuccessText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10AC84',
    textAlign: 'center',
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