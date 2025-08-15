import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const GREEN = '#10AC84';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { metodoPago = 'Efectivo' } = route.params || {};

  const goHome = () => {
    // Volver al tab "Dashboard" dentro del TabNavigator (Main)
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        {/* Tarjeta */}
        <View style={styles.card}>
          {/* Badge de éxito + confetti */}
          <View style={styles.celebrateArea}>
            <View style={styles.badgeOuter}>
              <View style={styles.badgeInner}>
                <Text style={styles.check}>✓</Text>
              </View>
            </View>

            {/* Confetti (pequeños dots y rayitas) */}
            <View style={[styles.dot, { top: 8, left: 28, backgroundColor: '#60A5FA' }]} />
            <View style={[styles.dot, { top: 18, right: 40, backgroundColor: '#F59E0B' }]} />
            <View style={[styles.dot, { bottom: 20, left: 40, backgroundColor: '#EF4444' }]} />
            <View style={[styles.dot, { bottom: 8, right: 28, backgroundColor: '#A78BFA' }]} />
            <View style={[styles.line, { top: 12, transform: [{ rotate: '25deg' }] }]} />
            <View style={[styles.line, { bottom: 14, right: 30, transform: [{ rotate: '-30deg' }] }]} />
          </View>

          {/* Título */}
          <Text style={styles.title}>¡Cotización enviada!</Text>
          <Text style={styles.subtitle}>
            Tu cotización se realizó correctamente.
          </Text>

          {/* Chip del método de pago */}
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>{metodoPago === 'Transferencia' ? '💳' : '💵'}</Text>
            <Text style={styles.chipText}>
              Pago con {metodoPago.toLowerCase()}
            </Text>
          </View>

          {/* Mensaje informativo */}
          <Text style={styles.note}>
            En el transcurso de 5 días te notificaremos el monto a pagar.
          </Text>
          <Text style={[styles.note, { marginTop: 2 }]}>
            Algunos datos se informarán o podrían cambiar al confirmar la cotización.
          </Text>

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={goHome} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const CARD_W = Math.min(width - 40, 420);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F7FA',
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    width: CARD_W,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  celebrateArea: {
    width: 160,
    height: 160,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#E7F7F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },

  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    position: 'absolute',
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34D399',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  chipText: {
    color: GREEN,
    fontWeight: '700',
  },

  note: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  cta: {
    marginTop: 20,
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default PaymentSuccessScreen;
