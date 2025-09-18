// src/screens/HistorialScreen.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import HistorialCard from '../components/HistorialCard';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

import { useAuth } from '../context/authContext';
import { fetchQuotesByClient } from '../api/quotes';

const BG = '#F5F5F5';
const BASE_URL = 'riveraproject-production.up.railway.app';

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  const keys = ['items', 'results', 'data', 'cotizaciones', 'quotes', 'rows', 'list'];
  for (const k of keys) {
    if (data && Array.isArray(data[k])) return data[k];
  }
  return [];
}
function pick() {
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function mapQuoteToItem(raw) {
  const estado = (pick(raw && raw.status) || 'pendiente').toLowerCase();
  const title = pick(raw && raw.quoteName, raw && raw.quoteDescription) || 'Cotización';
  const lugar = pick(
    raw && raw.travelLocations,
    raw && raw.ruta && raw.ruta.destino && raw.ruta.destino.nombre,
    raw && raw.ruta && raw.ruta.origen && raw.ruta.origen.nombre
  ) || '—';
  const hSalida  = pick(raw && raw.horarios && raw.horarios.fechaSalida) || '—';
  const hLlegada = pick(raw && raw.horarios && raw.horarios.fechaLlegadaEstimada) || '—';
  const metodoPago = pick(raw && raw.paymentMethod) || '—';
  const total = pick(raw && raw.costos && raw.costos.total, raw && raw.price);

  return {
    id: String((raw && raw._id) || (raw && raw.id) || Math.random()),
    title,
    status: estado,
    lugarEntrega: lugar,
    horaLlegada: hLlegada,
    horaSalida: hSalida,
    metodoPago,
    total,
    clienteId: pick(raw && raw.clientId) || null,
    _raw: raw,
  };
}

export default function HistorialScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getClientId = useCallback(async () => {
    const fromCtx = (user && (user._id || user.id || user.uid || user.clienteId || user.clientId)) || null;
    if (fromCtx) return String(fromCtx);
    const fromStorage = await AsyncStorage.getItem('clientId');
    return fromStorage ? String(fromStorage) : null;
  }, [user]);

  const loadQuotes = useCallback(async (isRefresh) => {
    try {
      const clientId = await getClientId();
      const storedToken = await AsyncStorage.getItem('clientToken');

      if (!clientId) {
        setItems([]);
        setLoading(false);
        if (isRefresh) setRefreshing(false);
        Alert.alert('Falta información', 'No se encontró el clientId del usuario.');
        return;
      }

      if (isRefresh) setRefreshing(true);
      if (!isRefresh) setLoading(true);

      // 1) Trae por clientId
      let data;
      try {
        data = await fetchQuotesByClient({
          baseUrl: BASE_URL,
          token,
          clientId,
        });
      } catch (e) {
        // seguimos al fallback
      }

      const rawList = normalizeList(data);
      let list = rawList.map(mapQuoteToItem);

      // 2) Fallback: pedir todo y filtrar por clientId (SIN filtrar por estado)
      if (!list.length) {
        const res = await fetch(`${BASE_URL}/api/cotizaciones`, {
          headers: {
            'Content-Type': 'application/json',
            ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
          },
        });
        let raw = [];
        try { raw = await res.json(); } catch { raw = []; }
        const all = normalizeList(raw).map(mapQuoteToItem);
        list = all.filter((x) => String(x.clienteId || '') === String(clientId));
      }

      setItems(list);
    } catch (err) {
      Alert.alert('Error', (err && err.message) || 'No se pudo cargar el historial.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getClientId, token]);

  useEffect(() => {
    loadQuotes(false);
  }, [loadQuotes]);

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => ((it && it.title) || '').toLowerCase().includes(q));
  }, [items, searchText]);

  const renderHistorialItem = ({ item }) => (
    <HistorialCard item={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={styles.rightSpacer} />
      </View>

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

      <View style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10, color: '#7F8C8D' }}>Cargando historial…</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderHistorialItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadQuotes(true)} />}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#7F8C8D' }}>No hay cotizaciones.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
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
