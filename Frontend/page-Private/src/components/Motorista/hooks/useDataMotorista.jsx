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
        
        const response = await fetch('riveraproject-production.up.railway.app/api/motoristas', {
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
      await axios.delete(`riveraproject-production.up.railway.app/api/motoristas/${selectedMotorista._id}`);
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

  // 📸 Editar motorista con soporte para imágenes
  const handleSaveEdit = async (formData) => {
    try {
      console.log('=== INICIANDO ACTUALIZACIÓN ===');
      console.log('Datos del formulario:', formData);
      console.log('Motorista seleccionado:', selectedMotorista);
      console.log('¿Hay imagen?', !!formData.image);
      
      // 🖼️ Si hay imagen, usar FormData (multipart/form-data)
      if (formData.image) {
        console.log('📸 Enviando con imagen usando FormData');
        
        const submitData = new FormData();
        
        // Agregar campos de texto (solo los que tienen valor)
        if (formData.name && formData.name.trim()) {
          submitData.append('name', formData.name.trim());
        }
        if (formData.lastName && formData.lastName.trim()) {
          submitData.append('lastName', formData.lastName.trim());
        }
        if (formData.phone && formData.phone.trim()) {
          submitData.append('phone', formData.phone.trim());
        }
        if (formData.address && formData.address.trim()) {
          submitData.append('address', formData.address.trim());
        }
        if (formData.password && formData.password.trim()) {
          submitData.append('password', formData.password.trim());
        }
        if (formData.circulationCard && formData.circulationCard.trim()) {
          submitData.append('circulationCard', formData.circulationCard.trim());
        }
        
        // Agregar imagen
        submitData.append('img', formData.image);
        
        console.log('FormData creado, enviando...');
        
        // Enviar con fetch (axios tiene problemas con FormData a veces)
        const response = await fetch(`riveraproject-production.up.railway.app/api/motoristas/${selectedMotorista._id}`, {
          method: 'PUT',
          body: submitData,
          // No agregar Content-Type, el navegador lo maneja automáticamente para FormData
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('=== RESPUESTA EXITOSA (CON IMAGEN) ===');
        console.log('Response:', responseData);
        
        // Actualizar la lista de motoristas
        const motoristaActualizado = responseData.motorista || responseData.data || { ...selectedMotorista, ...formData };
        
        setMotoristas(motoristas.map(mot => 
          mot._id === selectedMotorista._id ? motoristaActualizado : mot
        ));
        
        // Actualizar el motorista seleccionado
        setSelectedMotorista(motoristaActualizado);
        
      } else {
        // 📝 Sin imagen, usar JSON normal
        console.log('📝 Enviando sin imagen usando JSON');
        
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
          `riveraproject-production.up.railway.app/api/motoristas/${selectedMotorista._id}`, 
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );
        
        console.log('=== RESPUESTA EXITOSA (SIN IMAGEN) ===');
        console.log('Response:', response.data);
        
        // Actualizar la lista de motoristas
        const motoristaActualizado = response.data.motorista || response.data.data || { ...selectedMotorista, ...updateData };
        
        setMotoristas(motoristas.map(mot => 
          mot._id === selectedMotorista._id ? motoristaActualizado : mot
        ));
        
        // Actualizar el motorista seleccionado
        setSelectedMotorista(motoristaActualizado);
      }
      
      console.log("✅ Motorista actualizado exitosamente");
      
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
      } else if (error.message) {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      } else {
        console.error('Error desconocido');
        setError('Error desconocido al actualizar motorista');
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
      const response = await fetch('riveraproject-production.up.railway.app/api/motoristas', {
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