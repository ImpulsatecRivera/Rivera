import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../config';
import axios from "axios";

const API_URL = config.api.API_URL;

const useDataProveedores = () => {
  // Estados principales
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
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

  // Cargar proveedores al iniciar
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/proveedores`);
        setProveedores(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setError("Error al cargar los proveedores");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProveedores();
  }, []);

  // Filtrar proveedores
  const filterProveedores = proveedores.filter((proveedor) => 
    [proveedor.companyName, proveedor.email, proveedor.partDescription, proveedor.phone]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Navegación
  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/proveedores/agregarProveedor');
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

  // Eliminar proveedor
  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      await axios.delete(`${API_URL}/proveedores/${selectedProveedor._id}`);
      setProveedores(proveedores.filter(prov => prov._id !== selectedProveedor._id));
      console.log("Proveedor eliminado:", selectedProveedor);
      setShowDetailView(false);
      setSelectedProveedor(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      setError("Error al eliminar el proveedor");
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Editar proveedor
  const handleSaveEdit = async (formData) => {
    try {
      // Los nombres de los campos ahora coinciden con la estructura del backend
      const updatedData = {};
      
      // Solo incluir campos que no estén vacíos
      if (formData.companyName && formData.companyName.trim()) {
        updatedData.companyName = formData.companyName;
      }
      if (formData.email && formData.email.trim()) {
        updatedData.email = formData.email;
      }
      if (formData.partDescription && formData.partDescription.trim()) {
        updatedData.partDescription = formData.partDescription;
      }
      if (formData.phone && formData.phone.trim()) {
        updatedData.phone = formData.phone;
      }
      if (formData.direccion && formData.direccion.trim()) {
        updatedData.direccion = formData.direccion;
      }
      if (formData.rubro && formData.rubro.trim()) {
        updatedData.rubro = formData.rubro;
      }

      const response = await axios.put(
        `${API_URL}/proveedores/${selectedProveedor._id}`, 
        updatedData
      );
      
      // Actualizar la lista de proveedores
      setProveedores(proveedores.map(prov => 
        prov._id === selectedProveedor._id 
          ? { ...prov, ...updatedData }
          : prov
      ));
      
      // Actualizar el proveedor seleccionado
      setSelectedProveedor({ ...selectedProveedor, ...updatedData });
      
      console.log("Proveedor actualizado:", response.data);
      
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      setError("Error al actualizar el proveedor");
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

  // Seleccionar proveedor
  const selectProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetailView(true);
  };

  // Cerrar vista detalle
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedProveedor(null);
  };

  // Refrescar datos
  const refreshProveedores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/proveedores`);
      setProveedores(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al refrescar proveedores:', error);
      setError("Error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados
    proveedores,
    selectedProveedor,
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
    filterProveedores,

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
    selectProveedor,
    closeDetailView,
    refreshProveedores
  };
};

export default useDataProveedores;