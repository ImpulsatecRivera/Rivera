import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageIndicator}>3/3</Text>
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration Container */}
      <View style={styles.illustrationContainer}>
        {/* Money Bag Character */}
        <View style={styles.characterContainer}>
          {/* Arms */}
          <View style={styles.leftArm}>
            <View style={styles.leftHand} />
          </View>
          <View style={styles.rightArm}>
            <View style={styles.rightHand}>
              <View style={styles.moneyBill} />
            </View>
          </View>
          
          {/* Body (Money Bag) */}
          <View style={styles.moneyBag}>
            {/* Logo/Label */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>RIVERA</Text>
                <View style={styles.logoUnderline} />
              </View>
            </View>
            
            {/* Bag tie/rope */}
            <View style={styles.bagTie} />
          </View>
          
          {/* Legs */}
          <View style={styles.legs}>
            <View style={styles.leftLeg}>
              <View style={styles.leftShoe} />
            </View>
            <View style={styles.rightLeg}>
              <View style={styles.rightShoe} />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Realiza cotizaciones las veces que quieras</Text>
        <Text style={styles.subtitle}>
          Puedes realizar las cotizaciones que desees;{'\n'}
          estaremos listos para ayudarte.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
          
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
          
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    // TouchableOpacity styles can be empty
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  characterContainer: {
    alignItems: 'center',
  },
  leftArm: {
    position: 'absolute',
    left: -50,
    top: 40,
    width: 40,
    height: 60,
    backgroundColor: '#D4A574',
    borderRadius: 20,
    transform: [{ rotate: '-30deg' }],
    zIndex: 1,
  },
  leftHand: {
    position: 'absolute',
    bottom: -15,
    left: 5,
    width: 25,
    height: 25,
    backgroundColor: '#D4A574',
    borderRadius: 12.5,
  },
  rightArm: {
    position: 'absolute',
    right: -50,
    top: 40,
    width: 40,
    height: 60,
    backgroundColor: '#D4A574',
    borderRadius: 20,
    transform: [{ rotate: '30deg' }],
    zIndex: 1,
  },
  rightHand: {
    position: 'absolute',
    bottom: -15,
    right: 5,
    width: 25,
    height: 25,
    backgroundColor: '#D4A574',
    borderRadius: 12.5,
  },
  moneyBill: {
    position: 'absolute',
    top: -10,
    right: -20,
    width: 30,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
    transform: [{ rotate: '15deg' }],
  },
  moneyBag: {
    width: 160,
    height: 140,
    backgroundColor: '#C8956D',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  logo: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  logoUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: '#4CAF50',
    marginTop: 2,
  },
  bagTie: {
    position: 'absolute',
    top: -15,
    width: 60,
    height: 30,
    backgroundColor: '#B8804D',
    borderRadius: 30,
  },
  legs: {
    flexDirection: 'row',
    gap: 20,
    marginTop: -10,
    zIndex: 1,
  },
  leftLeg: {
    width: 30,
    height: 50,
    backgroundColor: '#C8956D',
    borderRadius: 15,
  },
  rightLeg: {
    width: 30,
    height: 50,
    backgroundColor: '#C8956D',
    borderRadius: 15,
  },
  leftShoe: {
    position: 'absolute',
    bottom: -15,
    left: -5,
    width: 40,
    height: 25,
    backgroundColor: '#333333',
    borderRadius: 20,
  },
  rightShoe: {
    position: 'absolute',
    bottom: -15,
    right: -5,
    width: 40,
    height: 25,
    backgroundColor: '#333333',
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    lineHeight: 28,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    // TouchableOpacity styles can be empty
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#333333',
    width: 30,
  },
  nextButton: {
    // TouchableOpacity styles can be empty
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
});

export default OnboardingScreen;