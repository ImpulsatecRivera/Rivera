import { useState } from 'react';

export const useProfile = () => {
  const [profile, setProfile] = useState({
    nombre: 'Diego Pocasangre',
    cargo: 'Motorista',
    email: 'Diego@gmail.com',
    camion: '0769231-D',
    fechaNacimiento: '1998-09-16',
    telefono: '7566-9709',
    direccion: 'Ciudad delegado',
    tarjeta: 'LIC-1001',
    avatar: 'DP'
  });

  const updateProfile = (newData) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  const logout = () => {
    // Lógica de cierre de sesión
    console.log('Cerrando sesión...');
  };

  return {
    profile,
    updateProfile,
    logout
  };
};