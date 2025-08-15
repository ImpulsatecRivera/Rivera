import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CarouselSlide from '../components/CarouselSlide';
import CarouselIndicators from '../components/CarouselIndicators';
import ProjectCard from '../components/ProjectCard';
import QuoteSheet from '../components/QuoteSheet';
import useQuotePreview from '../hooks/useQuotePreview';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const { width: ITEM_WIDTH } = Dimensions.get('window');
const BG = '#F5F5F5';

// Tamaño responsive del logo
const LOGO_WIDTH = Math.min(ITEM_WIDTH * 0.75, 420);
const LOGO_HEIGHT = 130;

const DashboardScreen = () => {
  const navigation = useNavigation();

  const baseData = [
    { id: 1, title: 'Somos',  subtitle: 'Rivera distribuidora y transporte', imageSource: require('../images/familiaRivera.png'), backgroundColor: '#667eea' },
    { id: 2, title: 'Visita', subtitle: 'Nuestro sitio web y concenos',     imageSource: require('../images/trabajador.png'),   backgroundColor: '#f093fb' },
    { id: 3, title: '30% OFF',subtitle: 'En tu primera cotización del mes',  imageSource: require('../images/cotizacion.png'),   backgroundColor: '#4facfe' },
  ];

  // Carrusel infinito
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
      flatListRef.current?.scrollToOffset({ offset: START_INDEX * ITEM_WIDTH, animated: false });
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const currentIndex = absIndex % BASE_LEN;

  useEffect(() => {
    if (!autoPlay || BASE_LEN === 0) return;
    const id = setInterval(() => {
      let nextAbs = absIndex + 1;
      if (nextAbs >= BASE_LEN * 2) nextAbs -= BASE_LEN;
      flatListRef.current?.scrollToOffset({ offset: nextAbs * ITEM_WIDTH, animated: true });
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

  const projects = [
    { id: 1, name: 'PROYECTO - USD1', price: '$ 1,800.00', status: 'pendiente',  icon: '📄' },
    { id: 2, name: 'PROYECTO - EUR1', price: '$ 1,800.00', status: 'en ruta',    icon: '📄' },
    { id: 3, name: 'PROYECTO - USD1', price: '$ 1,800.00', status: 'completado', icon: '📄' },
    { id: 4, name: 'PROYECTO - EUR1', price: '$ 1,800.00', status: 'pendiente',  icon: '📄' },
    { id: 5, name: 'PROYECTO - USD1', price: '$ 1,800.00', status: 'en ruta',    icon: '📄' },
    { id: 6, name: 'PROYECTO - EUR1', price: '$ 1,800.00', status: 'completado', icon: '📄' },
  ];

  const { visible, item, open, close } = useQuotePreview();

  const handleProjectPress = (project) => {
    open({
      title: project.name,
      price: project.price,
      status: project.status,
      lugarEntrega: 'San Salvador',
      horaLlegada: '10:30 AM',
      horaSalida: '11:45 AM',
    });
  };

  const handleAddQuote = () => navigation.navigate('Cotizacion');

  const renderCarouselItem = ({ item }) => (
    <CarouselSlide
      title={item.title}
      subtitle={item.subtitle}
      image={item.image}
      imageSource={item.imageSource}
      backgroundColor={item.backgroundColor}
    />
  );

  return (
    <View style={styles.container}>
      {/* Solo la pantalla enfocada pinta su StatusBar */}
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header con logo que ahora scrollea */}
        <View style={styles.logoHeader}>
          <Image source={require('../images/logo.png')} style={styles.logo} />
        </View>

        {/* Carrusel */}
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
            getItemLayout={(_, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
            initialScrollIndex={START_INDEX}
          />
          <CarouselIndicators currentIndex={currentIndex} totalSlides={BASE_LEN} />
        </View>

        {/* Sección de cotizaciones */}
        <View style={styles.quotesSection}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddQuote}>
            <Text style={styles.addButtonText}>Hacer una cotización de viaje</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Cotizaciones realizadas</Text>
          </View>

          {/* Grid 2x3 */}
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

      <QuoteSheet
        visible={visible}
        item={item}
        onClose={close}
        onConfirm={(payload) => {
          close();
          navigation.navigate('Cotizacion', payload);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  content: { flex: 1 },

  logoHeader: {
    backgroundColor: BG,
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 16,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 8,
  },

  carouselContainer: { marginTop: 20, marginBottom: 30 },

  quotesSection: { paddingHorizontal: 20, paddingBottom: 20 },

  sectionHeader: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '500', color: '#666666' },

  addButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#10AC84',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#10AC84',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  projectsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default DashboardScreen;
