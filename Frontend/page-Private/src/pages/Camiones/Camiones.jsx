import React, { useState } from 'react';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TruckMainScreen = () => {
  const initialTrucks = [
    {
      id: 1,
      name: "Volvo FH 540",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&h=120&fit=crop",
      status: "DISPONIBLE",
      type: "Volvo FH",
      plate: "P1234545-0",
      card: "P979R2-9",
      year: "1978",
      origin: "Guatemala",
      description: "Camión de carga pesada en excelente estado",
      kilometraje: "150,000",
      vidaUtil: "10 años",
      valorOriginal: "4",
      combustible: "12",
      valorDepreciacion: "85"
    },
    {
      id: 2,
      name: "Scania R450",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=120&fit=crop",
      status: "EN RUTA",
      type: "Scania R",
      plate: "P2345656-1",
      card: "P123A4-5",
      year: "2019",
      origin: "Honduras",
      description: "Camión moderno con tecnología avanzada",
      kilometraje: "75,000",
      vidaUtil: "15 años",
      valorOriginal: "8",
      combustible: "10",
      valorDepreciacion: "20"
    },
    {
      id: 3,
      name: "Mercedes Actros",
      image: "https://images.unsplash.com/photo-1519641643750-65022e1cde27?w=200&h=120&fit=crop",
      status: "MANTENIMIENTO",
      type: "Mercedes Actros",
      plate: "P3456767-2",
      card: "P456B7-8",
      year: "2020",
      origin: "El Salvador",
      description: "Camión de alta gama con sistemas de seguridad",
      kilometraje: "45,000",
      vidaUtil: "18 años",
      valorOriginal: "12",
      combustible: "8",
      valorDepreciacion: "15"
    },
    {
      id: 4,
      name: "Kenworth T800",
      image: "https://images.unsplash.com/photo-1541184654-9e2c3b0e4e0a?w=200&h=120&fit=crop",
      status: "DISPONIBLE",
      type: "Kenworth T800",
      plate: "P4567878-3",
      card: "P789C0-1",
      year: "2018",
      origin: "Nicaragua",
      description: "Camión robusto para cargas pesadas",
      kilometraje: "120,000",
      vidaUtil: "12 años",
      valorOriginal: "6",
      combustible: "14",
      valorDepreciacion: "35"
    },
    {
      id: 5,
      name: "Mack Granite",
      image: "https://images.unsplash.com/photo-1558618047-bf51c5e5c4c7?w=200&h=120&fit=crop",
      status: "NO DISPONIBLE",
      type: "Mack Granite",
      plate: "P5678989-4",
      card: "P012D3-4",
      year: "2017",
      origin: "Costa Rica",
      description: "Camión de construcción especializado",
      kilometraje: "180,000",
      vidaUtil: "8 años",
      valorOriginal: "5",
      combustible: "16",
      valorDepreciacion: "60"
    },
    {
      id: 6,
      name: "Freightliner Cascadia",
      image: "https://images.unsplash.com/photo-1566024287286-457247b70310?w=200&h=120&fit=crop",
      status: "DISPONIBLE",
      type: "Freightliner",
      plate: "P6789090-5",
      card: "P345E6-7",
      year: "2021",
      origin: "Panamá",
      description: "Camión eficiente con bajo consumo",
      kilometraje: "30,000",
      vidaUtil: "20 años",
      valorOriginal: "10",
      combustible: "7",
      valorDepreciacion: "5"
    },
    {
      id: 7,
      name: "Iveco Stralis",
      image: "https://images.unsplash.com/photo-1562141961-4d0b8e8b5b95?w=200&h=120&fit=crop",
      status: "EN RUTA",
      type: "Iveco Stralis",
      plate: "P7890101-6",
      card: "P678F9-0",
      year: "2019",
      origin: "Guatemala",
      description: "Camión europeo de alta calidad",
      kilometraje: "95,000",
      vidaUtil: "16 años",
      valorOriginal: "9",
      combustible: "9",
      valorDepreciacion: "25"
    },
    {
      id: 8,
      name: "Peterbilt 579",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=120&fit=crop",
      status: "DISPONIBLE",
      type: "Peterbilt 579",
      plate: "P8901212-7",
      card: "P901G2-3",
      year: "2020",
      origin: "Honduras",
      description: "Camión premium con cabina espaciosa",
      kilometraje: "65,000",
      vidaUtil: "17 años",
      valorOriginal: "11",
      combustible: "8",
      valorDepreciacion: "18"
    },
    {
      id: 9,
      name: "DAF XF",
      image: "https://images.unsplash.com/photo-1558618620-fcd25c85cd63?w=200&h=120&fit=crop",
      status: "MANTENIMIENTO",
      type: "DAF XF",
      plate: "P9012323-8",
      card: "P234H5-6",
      year: "2018",
      origin: "El Salvador",
      description: "Camión holandés confiable",
      kilometraje: "110,000",
      vidaUtil: "13 años",
      valorOriginal: "7",
      combustible: "11",
      valorDepreciacion: "40"
    },
    {
      id: 10,
      name: "MAN TGX",
      image: "https://images.unsplash.com/photo-1558618047-1b0b1c77e1d2?w=200&h=120&fit=crop",
      status: "DISPONIBLE",
      type: "MAN TGX",
      plate: "P0123434-9",
      card: "P567I8-9",
      year: "2021",
      origin: "Nicaragua",
      description: "Camión alemán de última generación",
      kilometraje: "25,000",
      vidaUtil: "19 años",
      valorOriginal: "13",
      combustible: "6",
      valorDepreciacion: "8"
    },
    {
      id: 11,
      name: "Hino 500 Series",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=200&h=120&fit=crop",
      status: "NO DISPONIBLE",
      type: "Hino 500",
      plate: "P1234545-0",
      card: "P890J1-2",
      year: "2016",
      origin: "Costa Rica",
      description: "Camión japonés para distribución",
      kilometraje: "200,000",
      vidaUtil: "7 años",
      valorOriginal: "3",
      combustible: "18",
      valorDepreciacion: "75"
    },
    {
      id: 12,
      name: "Renault T High",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=120&fit=crop",
      status: "EN RUTA",
      type: "Renault T",
      plate: "P2345656-1",
      card: "P123K4-5",
      year: "2020",
      origin: "Panamá",
      description: "Camión francés con diseño moderno",
      kilometraje: "55,000",
      vidaUtil: "16 años",
      valorOriginal: "8",
      combustible: "9",
      valorDepreciacion: "20"
    }
  ];

  const navigate = useNavigate();

  const [trucks, setTrucks] = useState(initialTrucks);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/Camiones/verCamion');
  };

  const handleEditTruck = (e) => {
    e.preventDefault();
    navigate('/Camiones/editarCamion');
  };

  const handleDeleteClick = (e, truck) => {
    e.stopPropagation();
    setSelectedTruck(truck);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    // Eliminar camión de la lista
    setTrucks(trucks.filter(t => t.id !== selectedTruck.id));
    setShowDeleteModal(false);
    setShowSuccessModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedTruck(null);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTruck(null);
    // Aquí no navegamos, porque ya estamos en el listado
  };

  const handleAddTruck = () => {
    navigate('/Camiones/aggCamion');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'text-green-600 bg-green-50';
      case 'NO DISPONIBLE':
        return 'text-red-600 bg-red-50';
      case 'MANTENIMIENTO':
        return 'text-yellow-600 bg-yellow-50';
      case 'EN RUTA':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const TruckCard = ({ truck }) => (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[280px] cursor-pointer"
      onClick={handleContinue}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-lg font-semibold text-gray-800">{truck.name}</div>
        <div className="flex gap-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTruck(e);
            }}
          >
            <Edit3 size={16} className="text-gray-500" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => handleDeleteClick(e, truck)}
          >
            <Trash2 size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={truck.image} 
            alt={truck.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-600 font-medium">{truck.type}</div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            truck.status === 'DISPONIBLE' ? 'bg-green-500' :
            truck.status === 'NO DISPONIBLE' ? 'bg-red-500' :
            truck.status === 'MANTENIMIENTO' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}></div>
          {truck.status}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden">
          <div className="mt-4">
            <button onClick={handleAddTruck} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar camion</span>
            </button>
          </div>

          <div className="mt-4">
            <button onClick={handleEditTruck} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Editar camión</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-auto max-h-[calc(100vh-200px)] p-4">
            {trucks.map((truck) => (
              <TruckCard key={truck.id} truck={truck} />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-xl">
            {/* Red X Icon */}
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-white" strokeWidth="2.5" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-black mb-4 leading-tight">
              ¿Está seguro de que desea eliminar este camión?
            </h3>

            {/* Subtitle */}
            <p className="text-gray-600 text-base mb-8">
              Este camión se eliminará con esta acción
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium text-base"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-10 text-center shadow-2xl">
            {/* Green Check Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-green-600" strokeWidth="2.5" />
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-semibold text-black mb-4 leading-tight">
              Camión eliminado con éxito
            </h3>
            
            {/* Subtitle */}
            <p className="text-gray-600 text-lg mb-10">
              Camión eliminado correctamente
            </p>
            
            {/* Continue Button */}
            <button
              onClick={handleSuccessContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckMainScreen;
