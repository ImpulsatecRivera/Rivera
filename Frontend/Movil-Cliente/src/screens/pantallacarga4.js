import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoadingAnimation = ({ onAnimationComplete }) => {
  const truckPosition = useRef(new Animated.Value(-200)).current;
  const roadLines = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const wheelSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada del contenido
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animación del camión conduciendo de izquierda a derecha
    const truckAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(truckPosition, {
          toValue: width + 200,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(truckPosition, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    truckAnimation.start();

    // Animación de las líneas de la carretera
    const roadAnimation = Animated.loop(
      Animated.timing(roadLines, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    roadAnimation.start();

    // Animación de las ruedas girando
    const wheelAnimation = Animated.loop(
      Animated.timing(wheelSpin, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    );
    wheelAnimation.start();

    if (onAnimationComplete) {
      const completeTimer = setTimeout(() => {
        onAnimationComplete();
      }, 3000);

      return () => {
        clearTimeout(completeTimer);
        truckAnimation.stop();
        roadAnimation.stop();
        wheelAnimation.stop();
      };
    }

    return () => {
      truckAnimation.stop();
      roadAnimation.stop();
      wheelAnimation.stop();
    };
  }, [onAnimationComplete]);

  const roadLineTransform = roadLines.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const wheelRotation = wheelSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5F8EAD" />
      
      {/* Fondo con gradiente simulado */}
      <View style={styles.backgroundLayer1} />
      <View style={styles.backgroundLayer2} />
      <View style={styles.backgroundLayer3} />

      {/* Elementos decorativos de fondo */}
      <View style={styles.backgroundElements}>
        <View style={styles.cloud1} />
        <View style={styles.cloud2} />
        <View style={styles.cloud3} />
        <View style={styles.mountain1} />
        <View style={styles.mountain2} />
      </View>

      {/* Carretera */}
      <View style={styles.roadContainer}>
        <View style={styles.road} />
        <Animated.View 
          style={[
            styles.roadLines,
            { transform: [{ translateX: roadLineTransform }] }
          ]}
        >
          {[...Array(20)].map((_, index) => (
            <View key={index} style={styles.roadLine} />
          ))}
        </Animated.View>
      </View>

      {/* Camión conduciendo */}
      <Animated.View
        style={[
          styles.truckContainer,
          { 
            transform: [
              { translateX: truckPosition },
              { scaleX: -1 } // Voltear el camión horizontalmente
            ]
          }
        ]}
      >
        <View style={styles.superTruck}>
          {/* Cabina súper detallada */}
          <View style={styles.truckCab}>
            <View style={styles.cabBase} />
            <View style={styles.cabTop} />
            <View style={styles.cabWindow} />
            <View style={styles.cabWindowFrame} />
            <View style={styles.cabDoor} />
            <View style={styles.cabDoorHandle} />
            <View style={styles.cabVent} />
            <View style={styles.bumperChrome} />
            <View style={styles.grill} />
            <View style={styles.headlight1} />
            <View style={styles.headlight2} />
            <View style={styles.headlightGlow1} />
            <View style={styles.headlightGlow2} />
            <View style={styles.turnSignal} />
          </View>
          
          {/* Conexión cabina-remolque */}
          <View style={styles.connection} />
          
          {/* Remolque súper detallado */}
          <View style={styles.trailer}>
            <View style={styles.trailerBase} />
            <View style={styles.trailerTop} />
            <View style={styles.trailerSide} />
            <View style={styles.trailerPanel1} />
            <View style={styles.trailerPanel2} />
            <View style={styles.trailerDoor} />
            <View style={styles.trailerHandle} />
            <View style={styles.trailerLock} />
            <View style={styles.trailerLogo} />
          </View>

          {/* Sistema de ruedas súper realista */}
          <View style={styles.wheelsContainer}>
            <View style={styles.frontAxle}>
              <Animated.View style={[styles.wheelAssembly, { transform: [{ rotate: wheelRotation }] }]}>
                <View style={styles.wheelTire} />
                <View style={styles.wheelRim} />
                <View style={styles.wheelHub} />
                <View style={styles.wheelBolts} />
              </Animated.View>
            </View>
            <View style={styles.rearAxle1}>
              <Animated.View style={[styles.wheelAssembly, { transform: [{ rotate: wheelRotation }] }]}>
                <View style={styles.wheelTire} />
                <View style={styles.wheelRim} />
                <View style={styles.wheelHub} />
                <View style={styles.wheelBolts} />
              </Animated.View>
            </View>
            <View style={styles.rearAxle2}>
              <Animated.View style={[styles.wheelAssembly, { transform: [{ rotate: wheelRotation }] }]}>
                <View style={styles.wheelTire} />
                <View style={styles.wheelRim} />
                <View style={styles.wheelHub} />
                <View style={styles.wheelBolts} />
              </Animated.View>
            </View>
          </View>

          {/* Detalles adicionales súper realistas */}
          <View style={styles.truckDetails}>
            <View style={styles.exhaust} />
            <View style={styles.exhaustSmoke} />
            <View style={styles.mirror} />
            <View style={styles.mirrorArm} />
            <View style={styles.antenna} />
            <View style={styles.airHorn} />
            <View style={styles.mudFlap1} />
            <View style={styles.mudFlap2} />
            <View style={styles.sideLight} />
          </View>
        </View>
      </Animated.View>

      {/* Contenido principal */}
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeValue,
            transform: [{ scale: scaleValue }]
          }
        ]}
      >
        {/* Nombre de la empresa */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>RIVERA</Text>
          <Text style={styles.subtitle}>Distribuidora y Transporte</Text>
          <View style={styles.tagline}>
            <Text style={styles.taglineText}>Conectando El Salvador</Text>
          </View>
        </View>
      </Animated.View>

      {/* Servicios destacados - movido hasta abajo */}
      <View style={styles.servicesContainer}>
        <Text style={styles.servicesText}>
          🚛 Envíos Nacionales • 📦 Distribución • ⚡ Entrega Rápida
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Capas de fondo
  backgroundLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#5F8EAD',
  },
  backgroundLayer2: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#5D9646',
    opacity: 0.8,
  },
  backgroundLayer3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#34353A',
    opacity: 0.9,
  },

  // Elementos decorativos de paisaje
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cloud1: {
    position: 'absolute',
    width: 60,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    top: '15%',
    left: '20%',
  },
  cloud2: {
    position: 'absolute',
    width: 40,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    top: '25%',
    right: '30%',
  },
  cloud3: {
    position: 'absolute',
    width: 50,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9,
    top: '20%',
    right: '10%',
  },
  mountain1: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(93, 150, 70, 0.6)',
    bottom: '35%',
    left: '10%',
  },
  mountain2: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(93, 150, 70, 0.4)',
    bottom: '35%',
    right: '20%',
  },

  // Carretera
  roadContainer: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  road: {
    width: '100%',
    height: 60,
    backgroundColor: '#2C2C2C',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
  },
  roadLines: {
    position: 'absolute',
    top: 27,
    left: 0,
    right: 0,
    height: 6,
    flexDirection: 'row',
  },
  roadLine: {
    width: 40,
    height: 6,
    backgroundColor: '#FFFF00',
    marginRight: 20,
  },

  // Camión contenedor
  truckContainer: {
    position: 'absolute',
    bottom: '25%',
    height: 60,
    zIndex: 2,
  },

  // Camión súper detallado
  superTruck: {
    width: 140,
    height: 60,
    position: 'relative',
  },
  
  // Cabina súper detallada
  truckCab: {
    position: 'absolute',
    width: 40,
    height: 50,
    left: 0,
    bottom: 10,
  },
  cabBase: {
    position: 'absolute',
    width: 40,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  cabTop: {
    position: 'absolute',
    top: -8,
    left: 6,
    width: 28,
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  cabWindow: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 20,
    height: 15,
    backgroundColor: '#87CEEB',
    borderRadius: 3,
    opacity: 0.9,
  },
  cabWindowFrame: {
    position: 'absolute',
    top: 7,
    left: 9,
    width: 22,
    height: 17,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 3,
  },
  cabDoor: {
    position: 'absolute',
    top: 28,
    right: 3,
    width: 3,
    height: 17,
    backgroundColor: '#D3D3D3',
    borderRadius: 1.5,
  },
  cabDoorHandle: {
    position: 'absolute',
    top: 35,
    right: 1,
    width: 2,
    height: 3,
    backgroundColor: '#808080',
    borderRadius: 1,
  },
  cabVent: {
    position: 'absolute',
    top: 15,
    right: 5,
    width: 8,
    height: 2,
    backgroundColor: '#B0B0B0',
    borderRadius: 1,
  },
  bumperChrome: {
    position: 'absolute',
    bottom: -5,
    left: -3,
    width: 46,
    height: 6,
    backgroundColor: '#E6E6FA',
    borderRadius: 3,
  },
  grill: {
    position: 'absolute',
    bottom: 8,
    left: -2,
    width: 4,
    height: 12,
    backgroundColor: '#C0C0C0',
    borderRadius: 2,
  },
  headlight1: {
    position: 'absolute',
    bottom: 18,
    left: -3,
    width: 5,
    height: 5,
    backgroundColor: '#FFFF99',
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headlight2: {
    position: 'absolute',
    bottom: 8,
    left: -3,
    width: 5,
    height: 5,
    backgroundColor: '#FFFF99',
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headlightGlow1: {
    position: 'absolute',
    bottom: 16,
    left: -5,
    width: 9,
    height: 9,
    backgroundColor: 'rgba(255, 255, 153, 0.3)',
    borderRadius: 4.5,
  },
  headlightGlow2: {
    position: 'absolute',
    bottom: 6,
    left: -5,
    width: 9,
    height: 9,
    backgroundColor: 'rgba(255, 255, 153, 0.3)',
    borderRadius: 4.5,
  },
  turnSignal: {
    position: 'absolute',
    bottom: 28,
    left: -2,
    width: 3,
    height: 3,
    backgroundColor: '#FF8C00',
    borderRadius: 1.5,
  },

  // Conexión cabina-remolque
  connection: {
    position: 'absolute',
    left: 38,
    bottom: 25,
    width: 8,
    height: 15,
    backgroundColor: '#808080',
    borderRadius: 2,
  },

  // Remolque súper detallado
  trailer: {
    position: 'absolute',
    width: 85,
    height: 42,
    left: 50,
    bottom: 10,
  },
  trailerBase: {
    position: 'absolute',
    width: 85,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
  },
  trailerTop: {
    position: 'absolute',
    top: -4,
    left: 4,
    width: 77,
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
  },
  trailerSide: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 65,
    height: 25,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  trailerPanel1: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 25,
    height: 21,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  trailerPanel2: {
    position: 'absolute',
    top: 12,
    left: 40,
    width: 25,
    height: 21,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  trailerDoor: {
    position: 'absolute',
    top: 12,
    right: 8,
    width: 3,
    height: 21,
    backgroundColor: '#C8C8C8',
    borderRadius: 1.5,
  },
  trailerHandle: {
    position: 'absolute',
    top: 21,
    right: 5,
    width: 4,
    height: 4,
    backgroundColor: '#808080',
    borderRadius: 2,
  },
  trailerLock: {
    position: 'absolute',
    top: 18,
    right: 3,
    width: 2,
    height: 6,
    backgroundColor: '#606060',
    borderRadius: 1,
  },
  trailerLogo: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 12,
    height: 8,
    backgroundColor: '#5F8EAD',
    borderRadius: 2,
    opacity: 0.7,
  },

  // Sistema de ruedas súper realista
  wheelsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 22,
  },
  frontAxle: {
    position: 'absolute',
    left: 18,
    bottom: 0,
    alignItems: 'center',
  },
  rearAxle1: {
    position: 'absolute',
    left: 75,
    bottom: 0,
    alignItems: 'center',
  },
  rearAxle2: {
    position: 'absolute',
    left: 95,
    bottom: 0,
    alignItems: 'center',
  },
  wheelAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelTire: {
    width: 18,
    height: 18,
    backgroundColor: '#1A1A1A',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#2C2C2C',
  },
  wheelRim: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#E6E6FA',
    borderRadius: 6,
    top: 3,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  wheelHub: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#C0C0C0',
    borderRadius: 3,
    top: 6,
    alignSelf: 'center',
  },
  wheelBolts: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#808080',
    borderRadius: 1,
    top: 8,
    alignSelf: 'center',
  },

  // Detalles adicionales súper realistas
  truckDetails: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  exhaust: {
    position: 'absolute',
    left: 90, // Tubo de escape cerca de la cabina
    bottom: 30,
    width: 4,
    height: 18,
    backgroundColor: '#696969',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#808080',
  },
  exhaustSmoke: {
    position: 'absolute',
    left: 88,
    bottom: 46,
    width: 8,
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    borderRadius: 4,
  },
  mirror: {
    position: 'absolute',
    left: 135, // Espejo en el frente de la cabina
    top: 30,
    width: 3,
    height: 5,
    backgroundColor: '#E6E6FA',
    borderRadius: 1.5,
  },
  mirrorArm: {
    position: 'absolute',
    left: 132,
    top: 32,
    width: 6,
    height: 1,
    backgroundColor: '#C0C0C0',
  },
  antenna: {
    position: 'absolute',
    left: 115, // Antena en la cabina
    top: 12,
    width: 1.5,
    height: 12,
    backgroundColor: '#808080',
  },
  airHorn: {
    position: 'absolute',
    left: 110,
    top: 20,
    width: 3,
    height: 4,
    backgroundColor: '#E6E6FA',
    borderRadius: 1.5,
  },
  mudFlap1: {
    position: 'absolute',
    left: 25, // Guardafango trasero
    bottom: 5,
    width: 8,
    height: 6,
    backgroundColor: '#2C2C2C',
    borderRadius: 1,
  },
  mudFlap2: {
    position: 'absolute',
    left: 45, // Segundo guardafango trasero
    bottom: 5,
    width: 8,
    height: 6,
    backgroundColor: '#2C2C2C',
    borderRadius: 1,
  },
  sideLight: {
    position: 'absolute',
    left: 70, // Luz lateral
    top: 35,
    width: 2,
    height: 2,
    backgroundColor: '#FF4500',
    borderRadius: 1,
  },

  // Contenido principal
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
    marginBottom: 80, // Para dar espacio a la carretera
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  taglineText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  servicesContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  servicesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 1,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default LoadingAnimation;