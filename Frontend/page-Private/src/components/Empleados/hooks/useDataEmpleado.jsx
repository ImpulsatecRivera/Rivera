import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const useEmployeeManagement = () => {
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
  
  const navigate = useNavigate();

  // Cargar empleados al iniciar
  useEffect(() => {
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

  // Editar empleado
  const handleSaveEdit = async (formData) => {
    try {
      const updatedData = {};
      
      if (formData.name && formData.name.trim()) {
        updatedData.name = formData.name;
      }
      if (formData.lastName && formData.lastName.trim()) {
        updatedData.lastName = formData.lastName;
      }
      if (formData.phone && formData.phone.trim()) {
        updatedData.phone = formData.phone;
      }
      if (formData.address && formData.address.trim()) {
        updatedData.address = formData.address;
      }
      if (formData.password && formData.password.trim()) {
        updatedData.password = formData.password;
      }

      const response = await axios.put(
        `http://localhost:4000/api/empleados/${selectedEmpleados._id}`, 
        updatedData
      );
      
      // Actualizar la lista
      setEmpleados(empleados.map(emp => 
        emp._id === selectedEmpleados._id 
          ? { ...emp, ...updatedData }
          : emp
      ));
      
      // Actualizar el empleado seleccionado
      setSelectedEmpleados({ ...selectedEmpleados, ...updatedData });
      
      console.log("Empleado actualizado:", response.data);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      setError("Error al actualizar el empleado");
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

  // Refrescar datos
  const refreshEmpleados = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/empleados');
      setEmpleados(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al refrescar empleados:', error);
      setError("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
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
    selectEmpleado,
    closeDetailView,
    refreshEmpleados
  };
};

export default useEmployeeManagement;