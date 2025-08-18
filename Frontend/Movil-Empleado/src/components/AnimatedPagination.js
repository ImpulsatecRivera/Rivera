import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const AnimatedPagination = ({ currentIndex, totalDots = 3 }) => {
  const animatedValue = useRef(new Animated.Value(currentIndex)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, animatedValue]);

  const renderDots = () => {
    const dots = [];
    
    for (let i = 0; i < totalDots; i++) {
      dots.push(
        <View key={i} style={styles.inactiveDot} />
      );
    }
    
    return dots;
  };

  const activeDotTranslateX = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 20, 40], // 10px dot + 10px margin = 20px entre centros
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {renderDots()}
        <Animated.View
          style={[
            styles.activeDot,
            {
              transform: [{ translateX: activeDotTranslateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    position: 'absolute',
    width: 30,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
    left: 5, // Offset inicial para alinear con el primer dot
  },
});

export default AnimatedPagination;