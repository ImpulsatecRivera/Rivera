import React from 'react';

<<<<<<< HEAD
const CategoryItem = ({ image, name, progress, gradientClass }) => (
  <div className="flex items-center space-x-3 mb-4">
    <img 
      src={image} 
      alt={name}
      className="w-12 h-12 rounded-lg object-cover"
    />
    <div className="flex-1">
      <h4 className="text-base font-semibold text-gray-900 mb-2">{name}</h4>
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${gradientClass} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
          <span className="text-sm text-gray-500 ml-1">Viajes</span>
        </div>
=======
const ProgressBar = ({ name, progress, bgColor }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-6 h-6 ${bgColor} rounded flex items-center justify-center`}>
      <div className="w-2 h-2 bg-white rounded" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-700 font-medium">{name}</span>
        <span className="text-xs text-gray-600">{progress}% Total</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${bgColor} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
      </div>
    </div>
  </div>
);

<<<<<<< HEAD
const PerishableFoods = () => {
  const categories = [
    { 
      name: 'Alimentos perecederos', 
      progress: 74, 
      gradientClass: 'bg-gradient-to-r from-orange-400 via-pink-500 to-pink-300',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center'
    },
    { 
      name: 'Medicamentos', 
      progress: 52, 
      gradientClass: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-300',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center'
    },
    { 
      name: 'Equipos electronicos', 
      progress: 36, 
      gradientClass: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-300',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="space-y-2">
        {categories.map((category, index) => (
          <CategoryItem key={index} {...category} />
=======
const FunctionalGroups = () => {
  const groups = [
    { name: 'Motorizadas no programadas', progress: 74, bgColor: 'bg-red-500' },
    { name: 'Mantenimientos', progress: 52, bgColor: 'bg-blue-500' },
    { name: 'Tickets destinados', progress: 38, bgColor: 'bg-orange-500' }
  ];

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Grupos Funcionales</h3>
      <div className="space-y-4">
        {groups.map((group, index) => (
          <ProgressBar key={index} {...group} />
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
        ))}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default PerishableFoods;
=======
export default FunctionalGroups;
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
