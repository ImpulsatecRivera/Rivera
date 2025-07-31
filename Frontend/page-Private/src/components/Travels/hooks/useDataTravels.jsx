// hooks/Travels/useTravels.js
import { useState, useEffect } from 'react';

export const useTravels = () => {
  // Estados para las animaciones de gráficos
  const barHeights = [60, 80, 45, 90, 120, 70, 50, 85, 95, 110, 140, 75, 65, 100];
  const progressValues = [85, 70, 55, 40, 30];
  const [animatedBars, setAnimatedBars] = useState(Array(14).fill(0));
  const [animatedProgress, setAnimatedProgress] = useState(Array(5).fill(0));

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Estados para modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [isConfirmEditClosing, setIsConfirmEditClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  
  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isDeleteSuccessClosing, setIsDeleteSuccessClosing] = useState(false);
  
  // Estados para modal de programar
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isProgramClosing, setIsProgramClosing] = useState(false);
  const [showProgramSuccessModal, setShowProgramSuccessModal] = useState(false);
  const [isProgramSuccessClosing, setIsProgramSuccessClosing] = useState(false);

  // Formularios
  const [editForm, setEditForm] = useState({
    cotizacion: '300.00',
    horaLlegada: '7:00 AM',
    descripcion: 'Descarga de productos en walmart\nconstitución',
    horaSalida: '8 PM',
    auxiliar: 'Johan Velasco'
  });
  
  const [programForm, setProgramForm] = useState({
    cotizacion: '',
    horaLlegada: '',
    descripcion: '',
    horaSalida: '',
    auxiliar: ''
  });

  // Datos estáticos
  const scheduledTrips = [
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
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-green-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-yellow-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-red-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    }
  ];

  const earningsData = [
    { category: 'Food and Drinks', amount: '879,400', progress: animatedProgress[0], color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { category: 'Shopping', amount: '1,378,200', progress: animatedProgress[1], color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { category: 'Housing', amount: '928,500', progress: animatedProgress[2], color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { category: 'Transportation', amount: '420,700', progress: animatedProgress[3], color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { category: 'Vehicle', amount: '520,000', progress: animatedProgress[4], color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
  ];

  // Funciones de animación
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

  // Funciones de manejo de modales
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

  // Funciones de edición
  const handleEdit = () => {
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

  const handleConfirmEdit = () => {
    console.log('Actualizando viaje:', editForm);
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowSuccessModal(true);
      setIsSuccessClosing(false);
    }, 300);
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
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones de eliminación
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

  const handleConfirmDelete = () => {
    console.log('Eliminando viaje:', selectedTrip);
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteClosing(false);
      setShowDeleteSuccessModal(true);
      setIsDeleteSuccessClosing(false);
    }, 300);
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

  // Funciones de programar viaje
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
        cotizacion: '',
        horaLlegada: '',
        descripcion: '',
        horaSalida: '',
        auxiliar: ''
      });
    }, 300);
  };

  const handleProgramInputChange = (field, value) => {
    setProgramForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgramTrip = () => {
    console.log('Programando viaje:', programForm);
    setShowProgramSuccessModal(true);
    setIsProgramSuccessClosing(false);
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
          cotizacion: '',
          horaLlegada: '',
          descripcion: '',
          horaSalida: '',
          auxiliar: ''
        });
      }, 300);
    }, 300);
  };

  return {
    // Estados
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
    
    // Datos
    scheduledTrips,
    earningsData,
    barHeights,
    
    // Funciones
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
    handleCloseProgramSuccessModal
  };
};