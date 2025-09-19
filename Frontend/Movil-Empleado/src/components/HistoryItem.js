import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import listaImg from '../images/lista.png'; 

const HistoryItem = ({ item = {}, onInfoPress }) => {
  // Datos base que ya traías del hook
  const icon = item?.icon || '📦';
  const tipo = item?.tipo || 'Viaje';
  const subtitulo = item?.subtitulo || '—';
  const fecha = item?.fecha || '';
  const hora = item?.hora || '';
  const estado = (item?.estado || '').toString();
  const color = item?.color || '#757575';
  const camion = item?.camion || item?.truck?.placa || item?.truck?.alias || 'N/A';

  // 🔎 Motorista: soporta varios shapes
  const motoristaNombre =
    item?.motorista?.nombre ||
    item?.motorista?.name ||
    item?.conductor?.nombre ||
    item?.conductor?.name ||
    item?.driverName ||
    item?.driver?.name ||
    null;

  const handlePress = () => {
    if (typeof onInfoPress === 'function') {
      onInfoPress(item);
    }
  };

  return (
    <View style={styles.item}>
      {/* icono + imagen existente */}
      <View style={styles.left}>
        <Text style={styles.emoji}>{icon}</Text>
        <Image source={listaImg} style={styles.iconImage} />
      </View>

      <View style={styles.info}>
        {/* línea superior: tipo + badge de estado */}
        <View style={styles.topRow}>
          <Text style={styles.type} numberOfLines={1}>{tipo}</Text>

          {!!estado && (
            <View
              style={[
                styles.badge,
                { 
                  backgroundColor: hexWithAlpha(color, 0.15),
                  borderColor: isHex(color) ? color : '#757575',
                }
              ]}
            >
              <View style={[styles.dot, { backgroundColor: isHex(color) ? color : '#757575' }]} />
              <Text style={[styles.badgeText, { color: isHex(color) ? color : '#757575' }]} numberOfLines={1}>
                {beautifyEstado(estado)}
              </Text>
            </View>
          )}
        </View>

        {/* subtítulo (origen → destino) */}
        <Text style={styles.subtitle} numberOfLines={1}>{subtitulo}</Text>

        {/* meta datos: fecha · hora */}
        <View style={styles.metaRow}>
          {!!fecha && <Text style={styles.metaText}>{fecha}</Text>}
          {!!hora && <Text style={styles.metaText}> · {hora}</Text>}
        </View>

        {/* fila extra con motorista y camión (si existen) */}
        {(motoristaNombre || camion) && (
          <View style={[styles.metaRow, { marginTop: 4 }]}>
            {!!motoristaNombre && <Text style={styles.metaText}>👤 {motoristaNombre}</Text>}
            {!!motoristaNombre && !!camion && <Text style={styles.metaText}> · </Text>}
            {!!camion && <Text style={styles.metaText}>🚚 {camion}</Text>}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.infoButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.infoButtonText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

/** Helpers visuales **/
const isHex = (hex) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

const hexWithAlpha = (hex, alpha = 0.15) => {
  // admite #RGB o #RRGGBB; fallback gris
  const norm = isHex(hex) ? hex : '#757575';
  // RN acepta rgba() mejor para alpha
  const toRgb = (h) => {
    let r, g, b;
    if (h.length === 4) {
      r = parseInt(h[1] + h[1], 16);
      g = parseInt(h[2] + h[2], 16);
      b = parseInt(h[3] + h[3], 16);
    } else {
      r = parseInt(h.slice(1, 3), 16);
      g = parseInt(h.slice(3, 5), 16);
      b = parseInt(h.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  return toRgb(norm);
};

const beautifyEstado = (e) => {
  const s = e.replace('_', ' ').toLowerCase();
  if (s === 'en curso' || s === 'en_curso' || s === 'en transito' || s === 'en_transito') return 'En tránsito';
  if (s === 'pendiente') return 'Pendiente';
  if (s === 'programado') return 'Programado';
  if (s === 'confirmado') return 'Confirmado';
  if (s === 'completado' || s === 'finalizado') return 'Completado';
  if (s === 'cancelado') return 'Cancelado';
  return e;
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  left: {
    marginRight: 12,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  iconImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    minWidth: 0, // para que el text numberOfLines funcione bien
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flexShrink: 1,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#444',
  },
  infoButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 12,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HistoryItem;
