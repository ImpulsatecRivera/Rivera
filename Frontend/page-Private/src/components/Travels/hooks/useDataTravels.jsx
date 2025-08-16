// hooks/Travels/useTravels.js - VERSIÓN FINAL CORREGIDA
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTravels = () => {
  // ⚠️ MANTENER EL ORDEN EXACTO ORIGINAL - NO CAMBIAR NADA AQUÍ
  
  // Estados para las animaciones de gráficos (ORIGINALES - POSICIONES 1-2)
  const barHeights = [60, 80, 45, 90, 120, 70, 50, 85, 95, 110, 140, 75, 65, 100];
  const progressValues = [85, 70, 55, 40, 30];
  const [animatedBars, setAnimatedBars] = useState(Array(14).fill(0));
  const [animatedProgress, setAnimatedProgress] = useState(Array(5).fill(0));

  // Estados para modales (ORIGINALES - POSICIONES 3-5)
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Estados para modal de edición (ORIGINALES - POSICIONES 6-11)
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [isConfirmEditClosing, setIsConfirmEditClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  
  // Estados para modal de eliminación (ORIGINALES - POSICIONES 12-15)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isDeleteSuccessClosing, setIsDeleteSuccessClosing] = useState(false);
  
  // Estados para modal de programar (ORIGINALES - POSICIONES 16-19)
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isProgramClosing, setIsProgramClosing] = useState(false);
  const [showProgramSuccessModal, setShowProgramSuccessModal] = useState(false);
  const [isProgramSuccessClosing, setIsProgramSuccessClosing] = useState(false);

  // Formularios (ORIGINALES - POSICIONES 20-21)
  const [editForm, setEditForm] = useState({
    quoteId: '',
    truckId: '',
    conductorId: '',
    tripDescription: '',
    departureTime: '',
    arrivalTime: '',
    condiciones: {
      clima: 'normal',
      trafico: 'normal',
      carretera: 'buena'
    },
    observaciones: ''
  });
  
  const [programForm, setProgramForm] = useState({
    quoteId: '',
    truckId: '',
    conductorId: '',
    tripDescription: '',
    departureTime: '',
    arrivalTime: '',
    condiciones: {
      clima: 'normal',
      trafico: 'normal',
      carretera: 'buena'
    },
    observaciones: ''
  });

  // 🆕 NUEVOS ESTADOS AL FINAL (POSICIONES 22-24) - AQUÍ NO HAY CONFLICTO
  const [apiTravels, setApiTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⚠️ MANTENER EL useEffect ORIGINAL EN LA MISMA POSICIÓN
  // Funciones de animación (ORIGINAL - useEffect POSICIÓN 1)
  useEffect(() => {
    const animateBars = () => {
      barHeights.forEach((height, index) => {
        setTimeout(() => {
          setAnimatedBars(prev => {
            const newBars = [...prev];
            newBars[index] = height;
            return newBars;
          });
        }, index * 100);
      });
    };

    const animateProgress = () => {
      progressValues.forEach((progress, index) => {
        setTimeout(() => {
          setAnimatedProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            return newProgress;
          });
        }, index * 200 + 1000);
      });
    };

    animateBars();
    animateProgress();
  }, []);

  // 🆕 NUEVO useEffect PARA API (useEffect POSICIÓN 2) - AL FINAL
  useEffect(() => {
    fetchTravels();
  }, []);

  // 🆕 FUNCIONES DE API (NO SON HOOKS, VAN AL FINAL)
  const fetchTravels = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Cargando viajes desde /api/viajes...");
      
      const response = await axios.get('http://localhost:4000/api/viajes');
      console.log("✅ Viajes cargados:", response.data);
      setApiTravels(response.data);
    } catch (error) {
      console.error('❌ Error al cargar los viajes:', error);
      setError('Error al cargar los viajes');
      setApiTravels([]);
    } finally {
      setLoading(false);
    }
  };

  const addTravel = async (travelData) => {
    try {
      console.log("🆕 Creando viaje:", travelData);
      const response = await axios.post('http://localhost:4000/api/viajes', travelData);
      
      console.log("✅ Viaje creado exitosamente:", response.data);
      await fetchTravels(); // Recargar datos
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al agregar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al agregar viaje' 
      };
    }
  };

  const updateTravel = async (travelId, updateData) => {
    try {
      console.log("✏️ Actualizando viaje:", travelId, updateData);
      const response = await axios.patch(`http://localhost:4000/api/viajes/${travelId}/progress`, updateData);
      
      console.log("✅ Viaje actualizado exitosamente:", response.data);
      await fetchTravels(); // Recargar datos
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al actualizar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar viaje' 
      };
    }
  };

  const deleteTravel = async (travelId) => {
    try {
      console.log("🗑️ Cancelando viaje:", travelId);
      const response = await axios.patch(`http://localhost:4000/api/viajes/${travelId}/cancel`, {
        motivo: 'eliminado_por_usuario',
        observaciones: 'Viaje cancelado desde la interfaz'
      });
      
      console.log("✅ Viaje cancelado exitosamente:", response.data);
      await fetchTravels(); // Recargar datos
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al cancelar viaje:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al cancelar viaje' 
      };
    }
  };

  // 🔄 DATOS COMBINADOS: API + FALLBACK
  const scheduledTrips = apiTravels.length > 0 ? 
    // Usar datos de la API si están disponibles
    apiTravels.map(travel => ({
      id: travel._id,
      type: `${travel.quoteId?.ruta?.origen?.nombre || 'Origen'} → ${travel.quoteId?.ruta?.destino?.nombre || 'Destino'}`,
      color: travel.estado?.actual === 'completado' ? 'bg-green-500' : 
             travel.estado?.actual === 'en_curso' ? 'bg-blue-500' :
             travel.estado?.actual === 'retrasado' ? 'bg-orange-500' :
             travel.estado?.actual === 'cancelado' ? 'bg-red-500' : 'bg-gray-500',
      status: travel.estado?.actual === 'completado' ? 'bg-green-400' : 
              travel.estado?.actual === 'en_curso' ? 'bg-blue-400' :
              travel.estado?.actual === 'retrasado' ? 'bg-orange-400' :
              travel.estado?.actual === 'cancelado' ? 'bg-red-400' : 'bg-gray-400',
      time: new Date(travel.departureTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      description: travel.tripDescription || 'Sin descripción',
      icon: '🚛',
      ...travel
    })) :
    // Usar datos estáticos como fallback
    [
      { 
        type: 'Grocery', 
        color: 'bg-blue-500', 
        status: 'bg-green-400',
        time: '5:12 pm',
        description: 'Belanja di pasar',
        icon: '🛒'
      },
      { 
        type: 'Transportation', 
        color: 'bg-purple-500', 
        status: 'bg-red-400',
        time: '5:12 pm',
        description: 'Naik bus umum',
        icon: '🚌'
      },
      { 
        type: 'Housing', 
        color: 'bg-orange-500', 
        status: 'bg-yellow-400',
        time: '5:12 pm',
        description: 'Bayar Listrik',
        icon: '🏠'
      }
    ];

  // Datos de earnings (mantener originales)
  const earningsData = [
    { category: 'Transporte de Carga', amount: '879,400', progress: animatedProgress[0], color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { category: 'Servicios Express', amount: '1,378,200', progress: animatedProgress[1], color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { category: 'Logística', amount: '928,500', progress: animatedProgress[2], color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { category: 'Distribución', amount: '420,700', progress: animatedProgress[3], color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { category: 'Almacenaje', amount: '520,000', progress: animatedProgress[4], color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
  ];

  // Estadísticas de API
  const getStats = () => {
    const statusCounts = apiTravels.reduce((acc, travel) => {
      const status = travel.estado?.actual || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: apiTravels.length,
      pendiente: statusCounts.pendiente || 0,
      en_curso: statusCounts.en_curso || 0,
      completado: statusCounts.completado || 0,
      retrasado: statusCounts.retrasado || 0,
      cancelado: statusCounts.cancelado || 0
    };
  };

  // ⚠️ MANTENER TODAS LAS FUNCIONES ORIGINALES SIN CAMBIOS

  // Funciones de manejo de modales (ORIGINALES)
  const handleTripMenuClick = (trip, index) => {
    setSelectedTrip({ ...trip, index });
    setShowModal(true);
    setIsClosing(false);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  // Funciones de edición (MODIFICADAS PARA USAR API)
  const handleEdit = () => {
    if (selectedTrip) {
      // Pre-llenar con datos del viaje seleccionado
      setEditForm({
        quoteId: selectedTrip.quoteId?._id || selectedTrip.quoteId || '',
        truckId: selectedTrip.truckId?._id || selectedTrip.truckId || '',
        conductorId: selectedTrip.conductorId?._id || selectedTrip.conductorId || '',
        tripDescription: selectedTrip.description || selectedTrip.tripDescription || '',
        departureTime: selectedTrip.departureTime || '',
        arrivalTime: selectedTrip.arrivalTime || '',
        condiciones: selectedTrip.condiciones || {
          clima: 'normal',
          trafico: 'normal',
          carretera: 'buena'
        },
        observaciones: selectedTrip.observaciones || ''
      });
    }
    
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleUpdateTrip = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
      setShowConfirmEditModal(true);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  const handleConfirmEdit = async () => {
    try {
      if (selectedTrip?.id || selectedTrip?._id) {
        const result = await updateTravel(selectedTrip.id || selectedTrip._id, {
          tripDescription: editForm.tripDescription,
          condiciones: editForm.condiciones,
          observaciones: editForm.observaciones
        });
        
        if (result.success) {
          setIsConfirmEditClosing(true);
          setTimeout(() => {
            setShowConfirmEditModal(false);
            setIsConfirmEditClosing(false);
            setShowSuccessModal(true);
            setIsSuccessClosing(false);
          }, 300);
        }
      } else {
        // Fallback al método original
        console.log('Actualizando viaje (modo local):', editForm);
        setIsConfirmEditClosing(true);
        setTimeout(() => {
          setShowConfirmEditModal(false);
          setIsConfirmEditClosing(false);
          setShowSuccessModal(true);
          setIsSuccessClosing(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error actualizando viaje:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessClosing(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsSuccessClosing(false);
    }, 300);
  };

  const handleCloseEditModal = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Funciones de eliminación (MODIFICADAS PARA USAR API)
  const handleDelete = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowDeleteModal(true);
      setIsDeleteClosing(false);
    }, 300);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedTrip?.id || selectedTrip?._id) {
        const result = await deleteTravel(selectedTrip.id || selectedTrip._id);
        
        if (result.success) {
          setIsDeleteClosing(true);
          setTimeout(() => {
            setShowDeleteModal(false);
            setIsDeleteClosing(false);
            setShowDeleteSuccessModal(true);
            setIsDeleteSuccessClosing(false);
          }, 300);
        }
      } else {
        // Fallback al método original
        console.log('Eliminando viaje (modo local):', selectedTrip);
        setIsDeleteClosing(true);
        setTimeout(() => {
          setShowDeleteModal(false);
          setIsDeleteClosing(false);
          setShowDeleteSuccessModal(true);
          setIsDeleteSuccessClosing(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error eliminando viaje:', error);
    }
  };

  const handleCloseDeleteSuccessModal = () => {
    setIsDeleteSuccessClosing(true);
    setTimeout(() => {
      setShowDeleteSuccessModal(false);
      setIsDeleteSuccessClosing(false);
      setSelectedTrip(null);
    }, 300);
  };

  const handleCancelDelete = () => {
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteClosing(false);
      setShowModal(true);
      setIsClosing(false);
    }, 300);
  };

  // Funciones de programar viaje (MODIFICADAS PARA USAR API)
  const handleOpenProgramModal = () => {
    setShowProgramModal(true);
    setIsProgramClosing(false);
  };

  const handleCloseProgramModal = () => {
    setIsProgramClosing(true);
    setTimeout(() => {
      setShowProgramModal(false);
      setIsProgramClosing(false);
      setProgramForm({
        quoteId: '',
        truckId: '',
        conductorId: '',
        tripDescription: '',
        departureTime: '',
        arrivalTime: '',
        condiciones: {
          clima: 'normal',
          trafico: 'normal',
          carretera: 'buena'
        },
        observaciones: ''
      });
    }, 300);
  };

  const handleProgramInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProgramForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProgramForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProgramTrip = async () => {
    try {
      const result = await addTravel(programForm);
      
      if (result.success) {
        setShowProgramSuccessModal(true);
        setIsProgramSuccessClosing(false);
      }
    } catch (error) {
      console.error('Error programando viaje:', error);
      // Fallback al método original
      console.log('Programando viaje (modo local):', programForm);
      setShowProgramSuccessModal(true);
      setIsProgramSuccessClosing(false);
    }
  };

  const handleCloseProgramSuccessModal = () => {
    setIsProgramSuccessClosing(true);
    setTimeout(() => {
      setShowProgramSuccessModal(false);
      setIsProgramSuccessClosing(false);
      setIsProgramClosing(true);
      setTimeout(() => {
        setShowProgramModal(false);
        setIsProgramClosing(false);
        setProgramForm({
          quoteId: '',
          truckId: '',
          conductorId: '',
          tripDescription: '',
          departureTime: '',
          arrivalTime: '',
          condiciones: {
            clima: 'normal',
            trafico: 'normal',
            carretera: 'buena'
          },
          observaciones: ''
        });
      }, 300);
    }, 300);
  };

  return {
    // ⚠️ MANTENER EL RETURN ORIGINAL + NUEVOS CAMPOS AL FINAL
    
    // Estados originales
    animatedBars,
    animatedProgress,
    showModal,
    selectedTrip,
    isClosing,
    showEditModal,
    isEditClosing,
    showConfirmEditModal,
    isConfirmEditClosing,
    showSuccessModal,
    isSuccessClosing,
    showDeleteModal,
    isDeleteClosing,
    showDeleteSuccessModal,
    isDeleteSuccessClosing,
    showProgramModal,
    isProgramClosing,
    showProgramSuccessModal,
    isProgramSuccessClosing,
    editForm,
    programForm,
    
    // Datos (modificados para usar API)
    scheduledTrips,
    earningsData,
    barHeights,
    
    // Funciones originales
    handleTripMenuClick,
    handleCloseModal,
    handleEdit,
    handleUpdateTrip,
    handleConfirmEdit,
    handleCancelEdit,
    handleCloseSuccessModal,
    handleCloseEditModal,
    handleInputChange,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteSuccessModal,
    handleCancelDelete,
    handleOpenProgramModal,
    handleCloseProgramModal,
    handleProgramInputChange,
    handleProgramTrip,
    handleCloseProgramSuccessModal,

    // 🆕 NUEVOS CAMPOS AL FINAL
    loading,
    error,
    travels: apiTravels,
    stats: getStats(),
    refreshTravels: fetchTravels,
    addTravel,
    updateTravel,
    deleteTravel
  };
};

