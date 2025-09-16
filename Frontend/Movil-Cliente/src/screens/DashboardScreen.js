// src/screens/DashboardScreen.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, FlatList, Text, TouchableOpacity,
  Dimensions, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import CarouselSlide from '../components/CarouselSlide';
import CarouselIndicators from '../components/CarouselIndicators';
import ProjectCard from '../components/ProjectCard';
import QuoteSheet from '../components/QuoteSheet';
import useQuotePreview from '../hooks/useQuotePreview';
import useMyQuotes from '../hooks/useMyQuotes';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const { width: ITEM_WIDTH } = Dimensions.get('window');
const BG = '#F5F5F5';
const LOGO_WIDTH = Math.min(ITEM_WIDTH * 0.75, 420);
const LOGO_HEIGHT = 130;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Carrusel
  const baseData = [
    { id: 1, title: 'Somos',  subtitle: 'Rivera distribuidora y transporte', imageSource: require('../images/familiaRivera.png'), backgroundColor: '#667eea' },
    { id: 2, title: 'Visita', subtitle: 'Nuestro sitio web y concenos',     imageSource: require('../images/trabajador.png'),   backgroundColor: '#f093fb' },
    { id: 3, title: '30% OFF',subtitle: 'En tu primera cotización del mes',  imageSource: require('../images/cotizacion.png'),   backgroundColor: '#4facfe' },
  ];
  const LOOP_CLONES = 3, BASE_LEN = baseData.length, START_INDEX = BASE_LEN;
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
  const renderCarouselItem = ({ item }) => (
    <CarouselSlide title={item.title} subtitle={item.subtitle} imageSource={item.imageSource} backgroundColor={item.backgroundColor} />
  );

  // Cotizaciones (hook conectado al backend)
  const { quotes, loading, error, refreshing, refresh, reload } = useMyQuotes('https://riveraproject-5.onrender.com');

  // Preview de cotización
  const { visible, item, open: openPreview, close } = useQuotePreview();

  const handleProjectPress = (q) => {
    openPreview({
      title: q.title,
      price: `${q.currency === 'USD' ? '$ ' : ''}${(q.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: q.status,
      lugarEntrega: q.deliveryPlace,
      horaLlegada: q.arrivalTime,
      horaSalida: q.departureTime,
      paymentMethod: q.paymentMethod,
    });
  };

  // NO pasar funciones por params
  const handleAddQuote = () => navigation.navigate('Cotizacion');

  // ========= FIX del bucle de carga =========
  // Guardamos la función en un ref para que useFocusEffect no dependa de su identidad.
  const reloadRef = useRef(reload);
  useEffect(() => { reloadRef.current = reload; }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reloadRef.current(); // se ejecuta una vez en cada enfoque real
      return () => {};
    }, [])
  );
  // =========================================

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {/* Header con logo */}
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

          {loading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8, color: '#666' }}>Cargando tus cotizaciones…</Text>
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ color: '#d00', textAlign: 'center' }}>
                {error}. Desliza hacia abajo para reintentar.
              </Text>
              <TouchableOpacity onPress={() => reloadRef.current()} style={[styles.addButton, { marginTop: 12 }]}>
                <Text style={styles.addButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : quotes.length === 0 ? (
            <View style={{ paddingVertical: 24, paddingHorizontal: 12 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
                ¡Aún no tienes cotizaciones!
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 6, color: '#666' }}>
                Crea tu primera cotización y aprovecha el 30% OFF de este mes.
              </Text>
              <TouchableOpacity style={[styles.addButton, { marginTop: 14 }]} onPress={handleAddQuote}>
                <Text style={styles.addButtonText}>Crear mi primera cotización</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.projectsGrid}>
              {quotes.slice(0, 6).map((q) => (
                <ProjectCard
                  key={q.id}
                  project={{
                    id: q.id,
                    name: q.title,
                    price: `${q.currency === 'USD' ? '$ ' : ''}${(q.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: q.status,
                    icon: '📄',
                  }}
                  onPress={() => handleProjectPress(q)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <QuoteSheet
        visible={visible}
        item={item}
        onClose={close}
        onConfirm={(payload) => {
          close();
          navigation.navigate('Cotizacion', payload); // payload serializable
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1 },

  logoHeader: { backgroundColor: BG, alignItems: 'center', paddingTop: 26, paddingBottom: 16 },
  logo: { width: LOGO_WIDTH, height: LOGO_HEIGHT, resizeMode: 'contain', alignSelf: 'center', marginTop: 8 },

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
  addButtonText: { textAlign: 'center', color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  projectsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default DashboardScreen;
