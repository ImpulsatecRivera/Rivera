import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const useDataEmpleado = () => {
  // Estados principales
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState(null);
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
  
  // Estado para el botón de actualizar
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();

  // Función para cargar empleados (CORREGIDA)
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando petición a la API de empleados...');
      
      const response = await axios.get('https://riveraproject-5.onrender.com/api/empleados');
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📋 Datos recibidos completos:', response.data);
      console.log('📋 Tipo de datos recibidos:', typeof response.data);
      
      const responseData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      let empleadosArray = [];
      
      if (Array.isArray(responseData)) {
        // Si la respuesta es directamente un array
        empleadosArray = responseData;
        console.log('✅ Datos son un array directo');
      } else if (responseData && responseData.data && Array.isArray(responseData.data.empleados)) {
        // Tu API devuelve: { data: { empleados: [...] } }
        empleadosArray = responseData.data.empleados;
        console.log('✅ Datos encontrados en data.empleados');
      } else if (responseData && Array.isArray(responseData.empleados)) {
        // Si está directamente en empleados
        empleadosArray = responseData.empleados;
        console.log('✅ Datos encontrados en empleados');
      } else if (responseData && Array.isArray(responseData.data)) {
        // Si está en data como array
        empleadosArray = responseData.data;
        console.log('✅ Datos encontrados en data');
      } else {
        console.warn('⚠️ Formato de datos no esperado:', responseData);
        console.warn('⚠️ Estructura recibida:', Object.keys(responseData || {}));
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de empleados encontrados: ${empleadosArray.length}`);
      
      if (empleadosArray.length === 0) {
        console.log('⚠️ No se encontraron empleados en la respuesta');
      } else {
        console.log('📋 Primeros empleados:', empleadosArray.slice(0, 2));
      }

      // Normalizar los datos de empleados
      const normalizedEmpleados = empleadosArray.map((empleado, index) => {
        console.log(`🔄 Normalizando empleado ${index + 1}:`, empleado);
        
        return {
          ...empleado,
          // Asegurar que todos los campos existan
          name: empleado.name || '',
          lastName: empleado.lastName || '',
          email: empleado.email || '',
          dui: empleado.dui || '',
          birthDate: empleado.birthDate || null,
          phone: empleado.phone || '',
          address: empleado.address || '',
          img: empleado.img || null,
          _id: empleado._id || empleado.id || `temp-${index}`
        };
      });

      console.log("✅ Empleados normalizados:", normalizedEmpleados);
      setEmpleados(normalizedEmpleados);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error detallado:', error);
      console.error('❌ Tipo de error:', error.name);
      console.error('❌ Mensaje de error:', error.message);
      
      // Verificar si es un error de red
      if (error.message.includes('Network') || error.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en https://riveraproject-5.onrender.com');
      } else if (error.response) {
        setError(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar empleados: ${error.message}`);
      }
      setEmpleados([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
      console.log('🏁 Carga de empleados finalizada');
    }
  };

  // Cargar empleados al iniciar
  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Filtrar empleados - WITH SAFETY CHECK
  const filterEmpleados = Array.isArray(empleados) ? empleados.filter((empleado) => 
    [empleado.name, empleado.lastName, empleado.dui, empleado.email]
    .join(' ')
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) : [];

  // Navegación
  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/empleados/agregarEmployee');
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

  // Eliminar empleado
  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      console.log(`🗑️ Eliminando empleado ${selectedEmpleados._id}`);
      await axios.delete(`https://riveraproject-5.onrender.com/api/empleados/${selectedEmpleados._id}`);
      
      // Asegurar que empleados es un array antes de filtrar
      setEmpleados(prevEmpleados => 
        Array.isArray(prevEmpleados) 
          ? prevEmpleados.filter(emp => emp._id !== selectedEmpleados._id)
          : []
      );
      
      console.log("✅ Empleado eliminado:", selectedEmpleados);
      setShowDetailView(false);
      setSelectedEmpleados(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("❌ Error al eliminar empleado:", error);
      setError("Error al eliminar el empleado");
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // FUNCIÓN HANDLESAVEEDIT MEJORADA PARA ACTUALIZACIÓN INSTANTÁNEA
  const handleSaveEdit = async (formData) => {
    // VALIDACIÓN CRÍTICA - Verificar empleado seleccionado
    if (!selectedEmpleados) {
      console.error('❌ No hay empleado seleccionado');
      setError('No hay empleado seleccionado para actualizar');
      return;
    }
    
    if (!selectedEmpleados._id) {
      console.error('❌ El empleado seleccionado no tiene ID:', selectedEmpleados);
      setError('El empleado seleccionado no tiene un ID válido');
      return;
    }
    
    console.log('🎯 Empleado ANTES de actualizar:', selectedEmpleados);
    
    // Verificar que el FormData no esté vacío
    let hasData = false;
    for (let pair of formData.entries()) {
      hasData = true;
      break;
    }
    
    if (!hasData) {
      console.error('❌ No hay datos para actualizar');
      setError('No hay cambios para guardar');
      return;
    }
    
    // Activar estado de carga
    setUploading(true);
    
    try {
      // Log detallado de lo que se está enviando
      console.log('📤 Enviando actualización a:', `https://riveraproject-5.onrender.com/api/empleados/${selectedEmpleados._id}`);

      // Realizar la actualización
      const response = await axios.put(
        `https://riveraproject-5.onrender.com/api/empleados/${selectedEmpleados._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log("✅ Respuesta COMPLETA del servidor:", response.data);
      
      // Extraer datos del servidor
      const updatedEmployeeFromServer = response.data.empleado || response.data.data || response.data;
      
      // 🎯 CRÍTICO: Combinar datos del servidor con datos existentes para preservar campos
      const fullyUpdatedEmployee = {
        // Empezar con los datos originales para preservar TODO
        ...selectedEmpleados,
        // Sobrescribir SOLO con los datos que vienen del servidor
        ...updatedEmployeeFromServer,
        // Asegurar que estos campos críticos NO se pierdan
        _id: selectedEmpleados._id,
        dui: selectedEmpleados.dui || updatedEmployeeFromServer.dui,
        birthDate: selectedEmpleados.birthDate || updatedEmployeeFromServer.birthDate,
        // Si el servidor no devuelve ciertos campos, mantener los originales
        email: updatedEmployeeFromServer.email || selectedEmpleados.email,
        name: updatedEmployeeFromServer.name || selectedEmpleados.name,
        lastName: updatedEmployeeFromServer.lastName || selectedEmpleados.lastName,
        phone: updatedEmployeeFromServer.phone || selectedEmpleados.phone,
        address: updatedEmployeeFromServer.address || selectedEmpleados.address,
        img: updatedEmployeeFromServer.img || selectedEmpleados.img
      };
      
      console.log("✅ Empleado COMBINADO final:", fullyUpdatedEmployee);
      
      // 🚀 ACTUALIZACIÓN INMEDIATA - Primero actualizar selectedEmpleados
      setSelectedEmpleados(fullyUpdatedEmployee);
      
      // Después actualizar la lista de empleados
      setEmpleados(prevEmpleados => 
        Array.isArray(prevEmpleados)
          ? prevEmpleados.map(emp => 
              emp._id === selectedEmpleados._id 
                ? fullyUpdatedEmployee
                : emp
            )
          : [fullyUpdatedEmployee]
      );
      
      console.log("✅ ACTUALIZACIÓN INSTANTÁNEA COMPLETADA");
      
      // Cerrar el modal y mostrar éxito
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error("❌ Error completo al actualizar empleado:", error);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Response status:", error.response?.status);
      
      let errorMessage = 'Error al actualizar el empleado';
      
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      // IMPORTANTE: Siempre desactivar el estado de carga
      setUploading(false);
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

  // Seleccionar empleado - CON VALIDACIÓN
  const selectEmpleado = (empleado) => {
    console.log('👤 Empleado seleccionado:', empleado);
    console.log('👤 ID del empleado:', empleado?._id);
    
    if (!empleado || !empleado._id) {
      console.error('❌ Empleado inválido seleccionado');
      setError('Empleado inválido seleccionado');
      return;
    }
    
    setSelectedEmpleados(empleado);
    setShowDetailView(true);
  };

  // Cerrar vista detalle
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedEmpleados(null);
  };

  // Refrescar datos (usa la función fetchEmpleados)
  const refreshEmpleados = async () => {
    console.log('🔄 Refrescando lista de empleados...');
    await fetchEmpleados();
  };

  // Función para obtener estadísticas
  const getStats = () => {
    const empleadosArray = Array.isArray(empleados) ? empleados : [];
    const filteredArray = Array.isArray(filterEmpleados) ? filterEmpleados : [];
    
    return {
      total: empleadosArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0
    };
  };

  // Efecto para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Estado actual de empleados:', {
        count: empleados.length,
        loading,
        error,
        hasData: empleados.length > 0,
        empleados: empleados.slice(0, 2) // Solo mostrar los primeros 2
      });
    }
  }, [empleados, loading, error]);

  // Efecto para monitorear selectedEmpleados
  useEffect(() => {
    console.log('🔍 Estado de selectedEmpleados cambió:', {
      empleado: selectedEmpleados,
      tieneId: selectedEmpleados?._id,
      id: selectedEmpleados?._id
    });
  }, [selectedEmpleados]);

  return {
    // Estados
    empleados,
    selectedEmpleados,
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
    filterEmpleados,
    uploading, // Estado para el botón de actualizar

    // Setters
    setSearchTerm,
    setSortBy,
    setError,
    setUploading,

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
    selectEmpleado,
    closeDetailView,
    refreshEmpleados,
    fetchEmpleados, // Exportar para usar en otros lugares si necesitas
    
    // Utilidades
    stats: getStats()
  };
};

export default useDataEmpleado;