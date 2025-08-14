const useColors = () => {
  return {
    // Gradientes principales
    gradient1: ['#667eea', '#764ba2'], // Azul/Morado
    gradient2: ['#f093fb', '#f5576c'], // Rosa/Rojo
    gradient3: ['#4facfe', '#00f2fe'], // Azul/Cyan
    
    // Logo y elementos principales
    logoGradient: ['#4A90E2', '#6B73FF'],
    logoBackground: '#E8F4FD',
    logoText: '#4A90E2',
    
    // Botones y acciones
    primaryGreen: '#10AC84',
    notificationRed: '#FF4757',
    iconOrange: '#FF9F43',
    
    // Navegación
    navBackground: '#E8E8E8',
    navIcon: '#999999',
    
    // Tarjetas de proyecto
    projectCard: '#4A5568',
    projectCardLight: '#6B7280',
    
    // Textos
    primaryText: '#2C3E50',
    secondaryText: '#7F8C8D',
    lightText: '#666666',
    whiteText: '#FFFFFF',
    
    // Backgrounds
    screenBackground: '#F5F5F5',
    cardBackground: '#FFFFFF',
    
    // Indicadores
    indicatorActive: '#6B73FF',
    indicatorInactive: '#D1D5DB',
    
    // Sombras y overlays
    shadowColor: '#000000',
    overlayWhite: 'rgba(255, 255, 255, 0.25)',
    overlayDark: 'rgba(0, 0, 0, 0.1)',
  };
};

export { useColors };
export default useColors;