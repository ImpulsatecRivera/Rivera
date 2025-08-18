// useMotoristaManagement.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useMotoristaManagement = () => {
  // Estados principales
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Estados de modales
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');

  const navigate = useNavigate();

  // Cargar motoristas al montar el componente
  useEffect(() => {
    fetchMotoristas();
  }, []);

  // Función para obtener motoristas desde la API
  const fetchMotoristas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:4000/api/motoristas');
      
      if (response.data && Array.isArray(response.data)) {
        setMotoristas(response.data);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al cargar motoristas:', error);
      
      let errorMessage = 'Error al cargar los motoristas';
      if (error.response) {
        // Error de respuesta del servidor
        switch (error.response.status) {
          case 404:
            errorMessage = 'Servicio no encontrado. Verifica la configuración del servidor.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          case 401:
            errorMessage = 'No autorizado. Verifica tus credenciales.';
            break;
          default:
            errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    fetchMotoristas();
  };

  // Filtrar motoristas basado en término de búsqueda
  const filterMotoristas = motoristas.filter(motorista => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      motorista.name?.toLowerCase().includes(search) ||
      motorista.lastName?.toLowerCase().includes(search) ||
      motorista.email?.toLowerCase().includes(search) ||
      motorista.id?.toString().includes(search) ||
      motorista.phone?.toString().includes(search) ||
      motorista.address?.toLowerCase().includes(search)
    );
  });

  // Función para validar si la licencia está vigente
  const isLicenseValid = (motorista) => {
    // Simulación: una licencia es válida si el motorista tiene menos de 65 años
    if (!motorista.birthDate) return false;
    
    const today = new Date();
    const birthDate = new Date(motorista.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 && age <= 65;
  };

  // Funciones de navegación
  const handleContinue = () => {
    navigate('/agregar-motorista');
  };

  // Funciones de selección y vista de detalles
  const selectMotorista = (motorista) => {
    setSelectedMotorista(motorista);
    setShowDetailView(true);
  };

  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedMotorista(null);
  };

  // Funciones de modales y acciones
  const handleOptionsClick = () => {
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const handleEdit = () => {
    setShowAlert(false);
    setShowEditAlert(true);
  };

  const closeEditAlert = () => {
    setShowEditAlert(false);
  };

  const handleDelete = () => {
    setShowAlert(false);
    setShowConfirmDelete(true);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const confirmDelete = async () => {
    if (!selectedMotorista) return;

    try {
      await axios.delete(`http://localhost:4000/api/motoristas/${selectedMotorista._id || selectedMotorista.id}`);
      
      // Actualizar lista local
      setMotoristas(prevMotoristas => 
        prevMotoristas.filter(m => 
          (m._id !== selectedMotorista._id) && (m.id !== selectedMotorista.id)
        )
      );
      
      setShowConfirmDelete(false);
      setShowDetailView(false);
      setSelectedMotorista(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error('Error al eliminar motorista:', error);
      
      let errorMessage = 'Error al eliminar el motorista';
      if (error.response?.status === 404) {
        errorMessage = 'Motorista no encontrado';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      }
      
      // Aquí podrías mostrar un modal de error
      alert(errorMessage);
    }
  };

  // 📸 FUNCIÓN ACTUALIZADA: Manejar edición con soporte para imágenes
  const handleSaveEdit = async (formData) => {
    if (!selectedMotorista) return;

    try {
      console.log('=== INICIANDO ACTUALIZACIÓN (useMotoristaManagement) ===');
      console.log('Form data recibido:', formData);
      console.log('¿Hay imagen?', !!formData.image);

      let response;

      // 🖼️ Si hay imagen, usar FormData (multipart/form-data)
      if (formData.image) {
        console.log('📸 Procesando actualización con imagen');
        
        const submitData = new FormData();
        
        // Agregar campos de texto (solo los que tienen valor)
        Object.keys(formData).forEach(key => {
          if (key !== 'image' && formData[key] && typeof formData[key] === 'string' && formData[key].trim() !== '') {
            submitData.append(key, formData[key].trim());
          }
        });
        
        // Agregar imagen
        submitData.append('img', formData.image);
        
        console.log('FormData preparado, enviando...');
        
        // Usar fetch para FormData (mejor compatibilidad que axios)
        const fetchResponse = await fetch(
          `http://localhost:4000/api/motoristas/${selectedMotorista._id || selectedMotorista.id}`,
          {
            method: 'PUT',
            body: submitData,
            // No agregar Content-Type, el navegador lo maneja automáticamente
            credentials: 'include'
          }
        );
        
        console.log('Respuesta del servidor:', fetchResponse.status, fetchResponse.statusText);
        
        if (!fetchResponse.ok) {
          // Intentar leer como JSON primero
          let errorData;
          const contentType = fetchResponse.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await fetchResponse.json();
          } else {
            // Si no es JSON, leer como texto para debug
            const errorText = await fetchResponse.text();
            console.error('Respuesta no-JSON del servidor:', errorText.substring(0, 500));
            throw new Error(`Error ${fetchResponse.status}: El servidor devolvió HTML en lugar de JSON. Verifica los logs del backend.`);
          }
          
          throw new Error(errorData.message || `HTTP ${fetchResponse.status}`);
        }
        
        const responseData = await fetchResponse.json();
        response = { data: responseData };
        
      } else {
        // 📝 Sin imagen, usar JSON normal con axios
        console.log('📝 Procesando actualización sin imagen');
        
        const updateData = {};
        
        // Solo incluir campos que no estén vacíos
        Object.keys(formData).forEach(key => {
          if (key !== 'image' && formData[key] && typeof formData[key] === 'string' && formData[key].trim() !== '') {
            updateData[key] = formData[key].trim();
          }
        });

        if (Object.keys(updateData).length === 0) {
          alert('No hay cambios para guardar');
          return;
        }

        console.log('Datos a enviar (sin imagen):', updateData);

        response = await axios.put(
          `http://localhost:4000/api/motoristas/${selectedMotorista._id || selectedMotorista.id}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      console.log('=== RESPUESTA EXITOSA ===');
      console.log('Response data:', response.data);

      // Extraer datos actualizados
      const updatedMotorista = response.data.motorista || response.data.data || response.data;
      
      // Actualizar lista local
      setMotoristas(prevMotoristas =>
        prevMotoristas.map(m => 
          (m._id === selectedMotorista._id || m.id === selectedMotorista.id) 
            ? { ...m, ...updatedMotorista }
            : m
        )
      );

      // Actualizar motorista seleccionado
      setSelectedMotorista(prev => ({ ...prev, ...updatedMotorista }));
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
      console.log('✅ Motorista actualizado exitosamente');
      
    } catch (error) {
      console.error('=== ERROR EN ACTUALIZACIÓN ===');
      console.error('Error completo:', error);
      
      let errorMessage = 'Error al actualizar el motorista';
      
      if (error.response) {
        // Error de axios
        switch (error.response.status) {
          case 404:
            errorMessage = 'Motorista no encontrado';
            break;
          case 400:
            errorMessage = error.response.data?.message || 'Datos inválidos';
            break;
          case 413:
            errorMessage = 'Archivo demasiado grande. Máximo 5MB permitido.';
            break;
          case 415:
            errorMessage = 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = error.response.data?.message || `Error del servidor: ${error.response.status}`;
        }
      } else if (error.message) {
        // Error de fetch o general
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setError(errorMessage);
    }
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  // Retornar todas las funciones y estados necesarios
  return {
    // Estados principales
    motoristas,
    selectedMotorista,
    showDetailView,
    loading,
    error,
    
    // Estados de filtros
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    
    // Estados de modales
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    
    // Datos procesados
    filterMotoristas,
    
    // Funciones de datos
    handleRefresh,
    isLicenseValid,
    
    // Funciones de navegación
    handleContinue,
    
    // Funciones de selección
    selectMotorista,
    closeDetailView,
    
    // Funciones de modales y acciones
    handleOptionsClick,
    closeAlert,
    handleEdit,
    closeEditAlert,
    handleDelete,
    cancelDelete,
    confirmDelete,
    handleSaveEdit, // 📸 Función actualizada para manejar imágenes
    closeSuccessAlert
  };
};

export default useMotoristaManagement;