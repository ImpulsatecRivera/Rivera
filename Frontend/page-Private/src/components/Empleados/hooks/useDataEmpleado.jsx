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
      
      const response = await axios.get('http://localhost:4000/api/empleados');
      
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
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en http://localhost:4000');
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
      await axios.delete(`http://localhost:4000/api/empleados/${selectedEmpleados._id}`);
      
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

  // Editar empleado - FUNCIÓN CORREGIDA
  const handleSaveEdit = async (formData) => {
    // Activar estado de carga
    setUploading(true);
    
    try {
      // Verificar qué campos están en el FormData para debug
      console.log('📝 Campos enviados:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'Archivo de imagen' : pair[1]));
      }

      // formData ya viene como FormData del componente
      const response = await axios.put(
        `http://localhost:4000/api/empleados/${selectedEmpleados._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Usar la respuesta completa del servidor (incluye URL de Cloudinary)
      const updatedEmployee = response.data.empleado || response.data.data || response.data;
      
      // Actualizar la lista de empleados con safety check
      setEmpleados(prevEmpleados => 
        Array.isArray(prevEmpleados)
          ? prevEmpleados.map(emp => 
              emp._id === selectedEmpleados._id 
                ? updatedEmployee
                : emp
            )
          : [updatedEmployee]
      );
      
      // Actualizar el empleado seleccionado
      setSelectedEmpleados(updatedEmployee);
      
      console.log("✅ Empleado actualizado:", updatedEmployee);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error("❌ Error al actualizar empleado:", error);
      setError("Error al actualizar el empleado");
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

  // Seleccionar empleado
  const selectEmpleado = (empleado) => {
    console.log('👤 Empleado seleccionado:', empleado);
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