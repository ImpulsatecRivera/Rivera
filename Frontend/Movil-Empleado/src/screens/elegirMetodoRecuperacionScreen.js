import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const elegirMetodoRecuperacionScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedMethod(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, [navigation]);

  const handleActualizarContrasena = () => {
    setSelectedMethod('actualizar');
    navigation.navigate('Recuperacion');
  };

  const handleCodigoVerificacion = () => {
    setSelectedMethod('codigo');
    navigation.navigate('RecuperacionTelefono');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const { width, height } = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F4F6FB',
    },
    header: {
      paddingHorizontal: width * 0.05,
      paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
    },
    content: {
      flex: 1,
      paddingHorizontal: width * 0.06,
      paddingTop: height * 0.02,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#1E293B',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 15,
      color: '#64748B',
      marginBottom: 30,
      lineHeight: 22,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
      color: '#334155',
    },
    card: {
      borderRadius: 18,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 4,
    },
    cardInner: {
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
    },
    continueBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    continueText: {
      color: '#FFFFFF',
      marginRight: 4,
      fontWeight: '600',
      fontSize: 13,
    },
    footer: {
      alignItems: 'center',
      paddingBottom: height * 0.04,
    },
    footerText: {
      fontSize: 12,
      color: '#94A3B8',
    },
  });

  const CardOption = ({
    selected,
    title,
    subtitle,
    icon,
    onPress,
    colors,
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={colors} style={styles.card}>
        <View style={styles.cardInner}>
          <View style={styles.cardLeft}>
            <View style={styles.iconBox}>
              <Icon name={icon} size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.continueBox}>
            <Text style={styles.continueText}>Continuar</Text>
            <Icon name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={18} color="#111" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.content}>
          <Text style={styles.title}>Recuperar contraseña</Text>

          <Text style={styles.subtitle}>
            Selecciona cómo deseas recibir el código de verificación para
            restablecer tu contraseña.
          </Text>

          <Text style={styles.sectionTitle}>Método de recuperación</Text>

          <CardOption
            selected={selectedMethod === 'actualizar'}
            title="Correo electrónico"
            subtitle="Recibe el código en tu email"
            icon="email"
            colors={['#4F46E5', '#6366F1']}
            onPress={handleActualizarContrasena}
          />

          <CardOption
            selected={selectedMethod === 'codigo'}
            title="Número de teléfono"
            subtitle="Recibe el código por SMS"
            icon="phone"
            colors={['#0EA5E9', '#38BDF8']}
            onPress={handleCodigoVerificacion}
          />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Rivera Distribuidora • 2025</Text>
      </View>
    </SafeAreaView>
  );
};

export default elegirMetodoRecuperacionScreen;
