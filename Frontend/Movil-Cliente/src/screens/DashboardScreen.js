import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import CarouselSlide from '../components/CarouselSlide';
import ProjectCard from '../components/ProjectCard';

const DashboardScreen = () => {
  const navigation = useNavigation();

  // Datos del carrusel con 3 slides como en las imágenes
  const carouselData = [
    {
      id: 1,
      title: 'Somos',
      subtitle: 'Brinda distribuciones y transportes',
      image: '👥',
      backgroundColor: '#667eea',
    },
    {
      id: 2,
      title: 'Visitas',
      subtitle: 'Nuestro sitio web y supervisión',
      image: '👤',
      backgroundColor: '#f093fb',
    },
    {
      id: 3,
      title: '30% OFF',
      subtitle: 'En tu primera cotización del mes',
      image: '💰',
      backgroundColor: '#4facfe',
    },
  ];

  // Datos de proyectos en grid 2x3 (6 elementos)
  const projects = [
    {
      id: 1,
      name: 'PROYECTO - USD1',
      price: '$ 1,800.00',
      icon: '📄',
    },
    {
      id: 2,
      name: 'PROYECTO - EUR1',
      price: '$ 1,800.00',
      icon: '📄',
    },
    {
      id: 3,
      name: 'PROYECTO - USD1',
      price: '$ 1,800.00',
      icon: '📄',
    },
    {
      id: 4,
      name: 'PROYECTO - EUR1',
      price: '$ 1,800.00',
      icon: '📄',
    },
    {
      id: 5,
      name: 'PROYECTO - USD1',
      price: '$ 1,800.00',
      icon: '📄',
    },
    {
      id: 6,
      name: 'PROYECTO - EUR1',
      price: '$ 1,800.00',
      icon: '📄',
    },
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
      image={item.image}
      backgroundColor={item.backgroundColor}
    />
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Carrusel informativo */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={carouselData}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          />
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  carouselContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  quotesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#10AC84',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default DashboardScreen;