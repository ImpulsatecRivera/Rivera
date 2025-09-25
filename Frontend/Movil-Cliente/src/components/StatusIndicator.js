import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusIndicator = ({ status, size = 'medium' }) => {
  const getStatusInfo = (status) => {
    const statusInfo = {
      'pendiente': { 
        color: '#F59E0B', 
        bg: '#FEF3C7', 
        icon: '⏳', 
        text: 'Pendiente' 
      },
      'confirmada': { 
        color: '#10B981', 
        bg: '#D1FAE5', 
        icon: '✅', 
        text: 'Confirmada' 
      },
      'completada': { 
        color: '#3B82F6', 
        bg: '#DBEAFE', 
        icon: '🎯', 
        text: 'Completada' 
      },
      'cancelada': { 
        color: '#EF4444', 
        bg: '#FEE2E2', 
        icon: '❌', 
        text: 'Cancelada' 
      },
      'en_proceso': { 
        color: '#6366F1', 
        bg: '#E0E7FF', 
        icon: '🚛', 
        text: 'En Proceso' 
      },
    };
    return statusInfo[status] || statusInfo['pendiente'];
  };

  const statusInfo = getStatusInfo(status);
  const sizeStyles = {
    small: { fontSize: 12, paddingH: 8, paddingV: 4 },
    medium: { fontSize: 14, paddingH: 12, paddingV: 6 },
    large: { fontSize: 16, paddingH: 16, paddingV: 8 },
  };

  return (
    <View style={[
      statusStyles.container,
      { backgroundColor: statusInfo.bg },
      {
        paddingHorizontal: sizeStyles[size].paddingH,
        paddingVertical: sizeStyles[size].paddingV,
      }
    ]}>
      <Text style={[
        statusStyles.text,
        { color: statusInfo.color, fontSize: sizeStyles[size].fontSize }
      ]}>
        {statusInfo.icon} {statusInfo.text}
      </Text>
    </View>
  );
};

const statusStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

// src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmptyState = ({ 
  icon = '📄', 
  title = 'No hay datos', 
  subtitle = 'Aún no tienes cotizaciones registradas',
  actionComponent = null 
}) => (
  <View style={emptyStyles.container}>
    <Text style={emptyStyles.icon}>{icon}</Text>
    <Text style={emptyStyles.title}>{title}</Text>
    <Text style={emptyStyles.subtitle}>{subtitle}</Text>
    {actionComponent}
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});