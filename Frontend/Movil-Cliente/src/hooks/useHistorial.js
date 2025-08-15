import { useState } from 'react';
import { Alert } from 'react-native';

const useHistorial = () => {
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

  const [searchText, setSearchText] = useState('');

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

  return {
    historialItems: filteredItems,
    searchText,
    setSearchText,
    handleItemPress,
  };
};

export { useHistorial };
export default useHistorial;