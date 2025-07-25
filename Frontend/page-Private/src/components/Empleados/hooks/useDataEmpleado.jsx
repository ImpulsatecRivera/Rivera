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

  // Función para cargar empleados (separada para reutilizar)
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/empleados');
      setEmpleados(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setError("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados al iniciar
  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Filtrar empleados
  const filterEmpleados = empleados.filter((empleado) => 
    [empleado.name, empleado.lastName, empleado.dui, empleado.email]
    .join(' ')
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
  );

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
      await axios.delete(`http://localhost:4000/api/empleados/${selectedEmpleados._id}`);
      setEmpleados(empleados.filter(emp => emp._id !== selectedEmpleados._id));
      console.log("Empleado eliminado:", selectedEmpleados);
      setShowDetailView(false);
      setSelectedEmpleados(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
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
      console.log('Campos enviados:');
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
      const updatedEmployee = response.data.empleado;
      
      // Actualizar la lista de empleados
      setEmpleados(empleados.map(emp => 
        emp._id === selectedEmpleados._id 
          ? updatedEmployee
          : emp
      ));
      
      // Actualizar el empleado seleccionado
      setSelectedEmpleados(updatedEmployee);
      
      console.log("Empleado actualizado:", updatedEmployee);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
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
    await fetchEmpleados();
  };

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
  };
};

export default useDataEmpleado;