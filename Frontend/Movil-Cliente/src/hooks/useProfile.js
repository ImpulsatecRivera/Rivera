import { useState } from 'react';
import { Alert } from 'react-native';

const useProfile = () => {
  const [userInfo] = useState({
    name: 'Diego Pocasangre',
    role: 'Cliente',
    email: 'Diego@gmail.com',
    dni: '07637631-0',
    birthDate: '1998-09-16',
    phone: '7556-9909',
    address: 'Ciudad completa',
    password: '••••••••••••'
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            console.log('Usuario cerró sesión');
          }
        },
      ]
    );
  };

  return {
    userInfo,
    handleLogout,
  };
};

export { useProfile };
export default useProfile;