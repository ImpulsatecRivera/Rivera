import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from "../../../config";
import axios from "axios";

const API_URL = config.api.API_URL;

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

  // ✅ Helper: normalizar empleado con nuevos campos
  const normalizeEmpleado = (empleado, index = 0) => {
    return {
      ...empleado,

      // IDs
      _id: empleado._id || empleado.id || `temp-${index}`,

      // Campos base
      name: empleado.name || '',
      lastName: empleado.lastName || '',
      email: empleado.email || '',
      dui: empleado.dui || '',
      birthDate: empleado.birthDate || null,
      phone: empleado.phone || '',
      address: empleado.address || '',
      img: empleado.img || null,

      // ✅ NUEVOS CAMPOS (compatibles con posibles nombres anteriores)
      salario: empleado.salario ?? empleado.salary ?? 0,
      planillaTipo: (empleado.planillaTipo || '').toString(),
      rol: (empleado.rol || '').toString(),

      // Timestamps (si existen)
      createdAt: empleado.createdAt || null,
      updatedAt: empleado.updatedAt || null,
    };
  };

  // Función para cargar empleados (ACTUALIZADA)
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando petición a la API de empleados...');
      const response = await axios.get(`${API_URL}/empleados`);
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📋 Datos recibidos completos:', response.data);

      const responseData = response.data;

      // Manejar diferentes estructuras de respuesta
      let empleadosArray = [];
      
      if (Array.isArray(responseData)) {
        // Si la respuesta es directamente un array
        empleadosArray = responseData;
        console.log('✅ Datos son un array directo');
      } else if (responseData?.data?.empleados && Array.isArray(responseData.data.empleados)) {
        // ✅ Tu API: { success, message, data: { empleados: [...] } }
        empleadosArray = responseData.data.empleados;
        console.log('✅ Datos encontrados en data.empleados');
      } else if (Array.isArray(responseData?.empleados)) {
        empleadosArray = responseData.empleados;
        console.log('✅ Datos encontrados en empleados');
      } else if (Array.isArray(responseData?.data)) {
        empleadosArray = responseData.data;
        console.log('✅ Datos encontrados en data (array)');
      } else {
        console.warn('⚠️ Formato de datos no esperado:', responseData);
        console.warn('⚠️ Estructura recibida:', Object.keys(responseData || {}));
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de empleados encontrados: ${empleadosArray.length}`);

      // ✅ Normalizar con nuevos campos
      const normalizedEmpleados = empleadosArray.map((emp, idx) => normalizeEmpleado(emp, idx));

      console.log("✅ Empleados normalizados:", normalizedEmpleados.slice(0, 2));
      setEmpleados(normalizedEmpleados);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error detallado:', error);

      if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que el backend esté corriendo y que la URL sea correcta.');
      } else if (error.response) {
        setError(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar empleados: ${error.message}`);
      }

      setEmpleados([]);
    } finally {
      setLoading(false);
      console.log('🏁 Carga de empleados finalizada');
    }
  };

  // Cargar empleados al iniciar
  useEffect(() => {
    fetchEmpleados();
  }, []);

  // ✅ Filtrar empleados (incluye rol/planillaTipo/salario)
  const filterEmpleados = Array.isArray(empleados)
    ? empleados.filter((empleado) => {
        const haystack = [
          empleado.name,
          empleado.lastName,
          empleado.dui,
          empleado.email,
          empleado.rol,
          empleado.planillaTipo,
          String(empleado.salario ?? ''),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchTerm.toLowerCase());
      })
    : [];

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
      console.log(`🗑️ Eliminando empleado ${selectedEmpleados?._id}`);
      await axios.delete(`${API_URL}/empleados/${selectedEmpleados._id}`);
      
      setEmpleados(prev =>
        Array.isArray(prev) ? prev.filter(emp => emp._id !== selectedEmpleados._id) : []
      );

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

  // ✅ handleSaveEdit actualizado para tu respuesta del backend
  const handleSaveEdit = async (formData) => {
    if (!selectedEmpleados?._id) {
      setError('No hay empleado seleccionado para actualizar');
      return;
    }

    // Verificar que el FormData no esté vacío
    let hasData = false;
    for (let _ of formData.entries()) {
      hasData = true;
      break;
    }
    if (!hasData) {
      setError('No hay cambios para guardar');
      return;
    }

    setUploading(true);

    try {
      console.log('📤 Enviando actualización a:', `${API_URL}/empleados/${selectedEmpleados._id}`);

      const response = await axios.put(
        `${API_URL}/empleados/${selectedEmpleados._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log("✅ Respuesta servidor:", response.data);

      // ✅ Tu backend: { success, message, data: { empleado: {...} } }
      const serverEmpleado =
        response.data?.data?.empleado ||
        response.data?.empleado ||
        response.data?.data ||
        response.data;

      const normalizedFromServer = normalizeEmpleado(serverEmpleado, 0);

      // ✅ Combinar para no perder campos que el server no devuelva
      const fullyUpdatedEmployee = normalizeEmpleado(
        {
          ...selectedEmpleados,
          ...normalizedFromServer,
          _id: selectedEmpleados._id,
        },
        0
      );

      // Actualización instantánea
      setSelectedEmpleados(fullyUpdatedEmployee);
      setEmpleados(prev =>
        Array.isArray(prev)
          ? prev.map(emp => (emp._id === selectedEmpleados._id ? fullyUpdatedEmployee : emp))
          : [fullyUpdatedEmployee]
      );

      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);

    } catch (error) {
      console.error("❌ Error al actualizar empleado:", error);

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
      setUploading(false);
    }
  };

  // Cerrar modales
  const closeAlert = () => setShowAlert(false);
  const closeSuccessAlert = () => setShowSuccessAlert(false);
  const closeEditAlert = () => setShowEditAlert(false);

  // Seleccionar empleado
  const selectEmpleado = (empleado) => {
    if (!empleado?._id) {
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

  // Refrescar datos
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

  // Debug: selectedEmpleados
  useEffect(() => {
    console.log('🔍 selectedEmpleados:', selectedEmpleados);
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
    uploading,

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
    fetchEmpleados,

    // Utilidades
    stats: getStats()
  };
};

export default useDataEmpleado;
