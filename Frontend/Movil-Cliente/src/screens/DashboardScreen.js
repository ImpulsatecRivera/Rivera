import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CarouselSlide from '../components/CarouselSlide';
import CarouselIndicators from '../components/CarouselIndicators';
import ProjectCard from '../components/ProjectCard';

const { width: ITEM_WIDTH } = Dimensions.get('window');
const BG = '#F5F5F5';

const DashboardScreen = () => {
  const navigation = useNavigation();

  // Slides con imágenes locales
  const baseData = [
    {
      id: 1,
      title: 'Somos',
      subtitle: 'Rivera distribuidora y transporte',
      imageSource: require('../images/familiaRivera.png'),
      backgroundColor: '#667eea',
    },
    {
      id: 2,
      title: 'Visita',
      subtitle: 'Nuestro sitio web y concenos',
      imageSource: require('../images/trabajador.png'),
      backgroundColor: '#f093fb',
    },
    {
      id: 3,
      title: '30% OFF',
      subtitle: 'En tu primera cotización del mes',
      imageSource: require('../images/cotizacion.png'),
      backgroundColor: '#4facfe',
    },
  ];

  // ===== Carrusel infinito =====
  const LOOP_CLONES = 3;                 
  const BASE_LEN = baseData.length;
  const START_INDEX = BASE_LEN;          
  const bigData = Array.from({ length: LOOP_CLONES }).flatMap(() => baseData);

  const flatListRef = useRef(null);
  const [absIndex, setAbsIndex] = useState(START_INDEX);
  const [autoPlay, setAutoPlay] = useState(true);
  const INTERVAL = 3000;

  useEffect(() => {
    const id = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: START_INDEX * ITEM_WIDTH,
        animated: false,
      });
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const currentIndex = absIndex % BASE_LEN;

  useEffect(() => {
    if (!autoPlay || BASE_LEN === 0) return;
    const id = setInterval(() => {
      let nextAbs = absIndex + 1;
      if (nextAbs >= BASE_LEN * 2) nextAbs -= BASE_LEN; // rebobina al centro
      flatListRef.current?.scrollToOffset({
        offset: nextAbs * ITEM_WIDTH,
        animated: true,
      });
      setAbsIndex(nextAbs);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [autoPlay, absIndex, BASE_LEN]);

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / ITEM_WIDTH);
    if (idx !== absIndex) setAbsIndex(idx);
  };

  const handleMomentumEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    let idx = Math.round(x / ITEM_WIDTH);
    if (idx < BASE_LEN) {
      const centralIdx = idx + BASE_LEN;
      flatListRef.current?.scrollToOffset({ offset: centralIdx * ITEM_WIDTH, animated: false });
      setAbsIndex(centralIdx);
    } else if (idx >= BASE_LEN * 2) {
      const centralIdx = idx - BASE_LEN;
      flatListRef.current?.scrollToOffset({ offset: centralIdx * ITEM_WIDTH, animated: false });
      setAbsIndex(centralIdx);
    }
  };

  // Grid de proyectos
  const projects = [
    { id: 1, name: 'PROYECTO - USD1', price: '$ 1,800.00', icon: '📄' },
    { id: 2, name: 'PROYECTO - EUR1', price: '$ 1,800.00', icon: '📄' },
    { id: 3, name: 'PROYECTO - USD1', price: '$ 1,800.00', icon: '📄' },
    { id: 4, name: 'PROYECTO - EUR1', price: '$ 1,800.00', icon: '📄' },
    { id: 5, name: 'PROYECTO - USD1', price: '$ 1,800.00', icon: '📄' },
    { id: 6, name: 'PROYECTO - EUR1', price: '$ 1,800.00', icon: '📄' },
  ];

  const handleProjectPress = (project) => {
    Alert.alert(
      'Proyecto',
      `${project.name}\nPrecio: ${project.price}\n\n¡Proyecto disponible para cotizar!`,
      [{ text: 'OK' }]
    );
  };

  const handleAddQuote = () => {
    navigation.navigate('Cotizacion');
  };

  const renderCarouselItem = ({ item }) => (
    <CarouselSlide
      title={item.title}
      subtitle={item.subtitle}
      image={item.image}                 // fallback
      imageSource={item.imageSource}     // imagen real
      backgroundColor={item.backgroundColor}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Topbar con LOGO (mismo fondo, sin línea y centrado) */}
      <SafeAreaView style={styles.topBar}>
        <Image source={require('../images/logo.png')} style={styles.logo} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carrusel informativo (infinito) */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={bigData}
            renderItem={renderCarouselItem}
            keyExtractor={(_, index) => `slide-${index}`}
            horizontal
            pagingEnabled={false}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumEnd}
            onTouchStart={() => setAutoPlay(false)}
            onScrollBeginDrag={() => setAutoPlay(false)}
            onScrollEndDrag={() => setAutoPlay(true)}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={START_INDEX}
          />

          <CarouselIndicators currentIndex={currentIndex} totalSlides={BASE_LEN} />
        </View>

        {/* Sección de cotizaciones */}
        <View style={styles.quotesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Cotizaciones fechas</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddQuote}>
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Grid de proyectos 2x3 */}
          <View style={styles.projectsGrid}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => handleProjectPress(project)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Topbar del logo (sin línea divisoria; logo centrado)
  topBar: {
    backgroundColor: BG,
    alignItems: 'center',
    paddingTop: 10,   
    paddingBottom: 18,
  },
  logo: {
    height: 76,
    marginTop: 6,
    resizeMode: 'contain',
  },

  content: { flex: 1 },
  carouselContainer: { marginTop: 20, marginBottom: 30 },
  quotesSection: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '500', color: '#666666' },
  addButton: {
    backgroundColor: '#10AC84',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default DashboardScreen;
