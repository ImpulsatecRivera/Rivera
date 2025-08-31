// constants/colors.js
export const COLORS = {
  // Colores primarios del diseño original
  primary: '#4A90E2',
  secondary: '#7B68EE',
  
  // Colores de elementos
  cardBackground: '#6C7B7F',
  accent: '#FF9500',
  accentDark: '#FF6B00',
  success: '#4CAF50',
  successDark: '#45a049',
  
  // Colores de fondo
  background: '#f5f7fa',
  white: '#FFFFFF',
  
  // Colores de texto
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  textMuted: '#D1D5DB',
  
  // Colores de estado
  statusCompleted: '#4CAF50',
  statusInProgress: '#FF9500',
  statusPending: '#FF9500',
  
  // Colores especiales
  price: '#FFD700', // Dorado para precios
  weather: '#4A90E2',
  
  // Transparencias
  overlay: 'rgba(0,0,0,0.25)',
  cardOverlay: 'rgba(108, 123, 127, 0.3)',
  whiteOverlay: 'rgba(255,255,255,0.2)',
  whiteOverlayLight: 'rgba(255,255,255,0.1)',
};

// Gradientes (para uso con bibliotecas de gradientes)
export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.secondary],
  accent: [COLORS.accent, COLORS.accentDark],
  success: [COLORS.success, COLORS.successDark],
};

// Sombras predefinidas
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: (color, opacity = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export default COLORS;