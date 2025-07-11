import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const useDataMotorista = () => {
  // Estados principales
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Estados de modales
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');
  
  const navigate = useNavigate();

  // Cargar motoristas al iniciar
  useEffect(() => {
    const fetchMotoristas = async () => {
      try {
        setLoading(true);
        console.log('Iniciando petición a la API de motoristas...');
        
        const response = await fetch('http://localhost:4000/api/motoristas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        setMotoristas(data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar los motoristas:', error);
        setError(`Error al cargar los motoristas: ${error.message}`);
        setMotoristas([]);
      } finally {
        setLoading(false);
        console.log('Carga completada');
      }
    };
    
    fetchMotoristas();
  }, []);

  // Función para verificar si la licencia está vigente
  const isLicenseValid = (motorista) => {
    try {
      if (!motorista || !motorista.circulationCard) return false;
      
      if (motorista.birthDate) {
        const birthDate = new Date(motorista.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        // Verificar si es mayor de edad
        return age >= 18;
      }
      
      // Si no hay fecha de nacimiento, asumir que está vigente si tiene tarjeta
      return Boolean(motorista.circulationCard);
    } catch (error) {
      console.error('Error en isLicenseValid:', error);
      return false;
    }
  };

  // Filtrar motoristas
  const filterMotoristas = motoristas.filter((motorista) => 
    [motorista.name, motorista.lastName, motorista.id, motorista.email]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Navegación
  const handleContinue = (e) => {
    e.preventDefault();
    console.log('Navegando a agregar motorista...');
    navigate('/motoristas/agregarMotorista');
  };

  // Manejo de opciones
  const handleOptionsClick = (e) => {
    e.stopPropagation();
    setShowAlert(true);
  };

  const handleEdit = () => {
    setShowAlert(false);
    setShowEditAlert(true);
  };

  const handleDelete = () => {
    setShowAlert(false);
    setShowConfirmDelete(true);
  };

  // Eliminar motorista
  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      console.log('Eliminando motorista con ID:', selectedMotorista._id);
      await axios.delete(`http://localhost:4000/api/motoristas/${selectedMotorista._id}`);
      setMotoristas(motoristas.filter(mot => mot._id !== selectedMotorista._id));
      console.log("Motorista eliminado exitosamente");
      setShowDetailView(false);
      setSelectedMotorista(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al eliminar motorista:", error);
      setError("Error al eliminar el motorista");
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Editar motorista
  const handleSaveEdit = async (formData) => {
    try {
      console.log('=== INICIANDO ACTUALIZACIÓN ===');
      console.log('Datos del formulario:', formData);
      console.log('Motorista seleccionado:', selectedMotorista);
      
      // Preparar solo los campos que tienen valor
      const updateData = {};
      
      if (formData.name && formData.name.trim()) {
        updateData.name = formData.name.trim();
      }
      if (formData.lastName && formData.lastName.trim()) {
        updateData.lastName = formData.lastName.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim();
      }
      if (formData.circulationCard && formData.circulationCard.trim()) {
        updateData.circulationCard = formData.circulationCard.trim();
      }

      console.log('Datos a enviar:', updateData);
      
      // Verificar que hay algo que actualizar
      if (Object.keys(updateData).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      const response = await axios.put(
        `http://localhost:4000/api/motoristas/${selectedMotorista._id}`, 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      
      console.log('=== RESPUESTA EXITOSA ===');
      console.log('Response:', response.data);
      
      // Actualizar la lista de motoristas
      const motoristaActualizado = response.data.motorista || { ...selectedMotorista, ...updateData };
      
      setMotoristas(motoristas.map(mot => 
        mot._id === selectedMotorista._id ? motoristaActualizado : mot
      ));
      
      // Actualizar el motorista seleccionado
      setSelectedMotorista(motoristaActualizado);
      
      console.log("Motorista actualizado:", response.data);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error('=== ERROR EN ACTUALIZACIÓN ===');
      console.error('Error completo:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        const errorMessage = error.response.data?.message || 'Error del servidor';
        setError(`Error: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response:', error.request);
        setError('No se pudo conectar con el servidor');
      } else {
        console.error('Error config:', error.message);
        setError(`Error: ${error.message}`);
      }
    }
  };

  // Cerrar modales
  const closeAlert = () => {
    setShowAlert(false);
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const closeEditAlert = () => {
    setShowEditAlert(false);
  };

  // Seleccionar motorista
  const selectMotorista = (motorista) => {
    setSelectedMotorista(motorista);
    setShowDetailView(true);
  };

  // Cerrar vista detalle
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedMotorista(null);
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/motoristas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMotoristas(data);
      setError(null);
    } catch (error) {
      console.error('Error al recargar los motoristas:', error);
      setError(`Error al recargar los motoristas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados
    motoristas,
    selectedMotorista,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    filterMotoristas,

    // Setters
    setSearchTerm,
    setSortBy,
    setError,

    // Funciones
    handleContinue,
    handleOptionsClick,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleSaveEdit,
    closeAlert,
    closeSuccessAlert,
    closeEditAlert,
    selectMotorista,
    closeDetailView,
    handleRefresh,
    isLicenseValid
  };
};

export default useDataMotorista;