import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HistorialCard from '../components/HistorialCard';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import QuoteSheet from '../components/QuoteSheet';
import useQuotePreview from '../hooks/useQuotePreview';

const BG = '#F5F5F5';

const HistorialScreen = () => {
  const navigation = useNavigation();

  // ===== Datos del historial (nombres y estados variados) =====
  const [historialItems] = useState([
    { id: 1, title: 'Carga de maíz a San Miguel',        status: 'completado' },
    { id: 2, title: 'Bebidas gaseosas a Santa Ana',      status: 'en ruta' },
    { id: 3, title: 'Material de construcción a Soyapango', status: 'pendiente' },
    { id: 4, title: 'Electrodomésticos a La Unión',      status: 'completado' },
    { id: 5, title: 'Medicamentos a San Salvador',       status: 'en ruta' },
    { id: 6, title: 'Paquetería exprés a Sonsonate',     status: 'pendiente' },
  ]);

  const [searchText, setSearchText] = useState('');
  const filteredItems = historialItems.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );


  const { visible, item, open, close } = useQuotePreview();

  const handleItemPress = (it) => {
    // Muestra el sheet con detalles de ejemplo
    open({
      title: it.title,
      status: it.status,              
      lugarEntrega: 'San Salvador',
      horaLlegada: '10:30 AM',
      horaSalida: '11:45 AM',
      metodoPago: 'Efectivo',        
    });
  };

  const renderHistorialItem = ({ item }) => (
    <HistorialCard item={item} onPress={() => handleItemPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar blanco para evitar bordes/ franjas */}
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Historial</Text>
        <View style={styles.rightSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#7F8C8D"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Grid */}
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

      {/* Mini pantalla (sheet) con detalles */}
      <QuoteSheet
        visible={visible}
        item={item}
        onClose={close}
        onConfirm={(payload) => {
          close();
          navigation.navigate('Cotizacion', payload);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  backButtonText: { fontSize: 20, color: '#2C3E50', fontWeight: 'bold' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 20, fontWeight: 'bold', color: '#2C3E50',
  },
  rightSpacer: { width: 40, height: 40 },

  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 25,
    paddingHorizontal: 15, paddingVertical: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 10, color: '#7F8C8D' },
  searchInput: { flex: 1, fontSize: 16, color: '#2C3E50' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  gridContainer: { paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
});

export default HistorialScreen;
