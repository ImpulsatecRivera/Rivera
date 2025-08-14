import { useState } from 'react';
import { Alert } from 'react-native';

const useProjects = () => {
  const [projects] = useState([
    {
      id: 1,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$2,500',
    },
    {
      id: 2,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$3,200',
    },
    {
      id: 3,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$1,800',
    },
    {
      id: 4,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$4,100',
    },
    {
      id: 5,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$2,750',
    },
    {
      id: 6,
      name: 'PROYECTO - USD',
      icon: '📄',
      amount: '$3,600',
    },
  ]);

  const handleProjectPress = (project) => {
    Alert.alert(
      'Proyecto',
      `${project.name}\nMonto: ${project.amount}\n\n¡Proyecto disponible para aplicar!`,
      [{ text: 'OK' }]
    );
  };

  return { 
    projects, 
    handleProjectPress 
  };
};

export { useProjects };
export default useProjects;