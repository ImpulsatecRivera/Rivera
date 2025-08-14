import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import HistorialCard from '../components/HistorialCard';

const HistorialScreen = () => {
  const [searchText, setSearchText] = useState('');

  // Datos del historial
  const [historialItems] = useState([
    {
      id: 1,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
    {
      id: 6,
      title: 'Fresh Fruits & Vegetable',
      icon: '🚛',
      location: '📍',
      status: 'completed'
    },
  ]);

  const filteredItems = historialItems.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleItemPress = (item) => {
    Alert.alert(
      'Historial',
      `${item.title}\n\nEstado: Completado\nUbicación disponible`,
      [{ text: 'OK' }]
    );
  };

  const renderHistorialItem = ({ item }) => (
    <HistorialCard
      item={item}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationText}>🔔</Text>
            <View style={styles.notificationBadge} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search done"
            placeholderTextColor="#7F8C8D"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Historial Grid */}
      <View style={styles.content}>
        <FlatList
          data={filteredItems}
          renderItem={renderHistorialItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: '#FF4757',
    borderRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#7F8C8D',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default HistorialScreen;