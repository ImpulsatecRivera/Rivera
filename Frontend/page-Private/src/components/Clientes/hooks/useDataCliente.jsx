import { useState, useEffect } from 'react';
import axios from 'axios';

const useDataCliente = () => {
  // Estados principales
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  // Función para obtener clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/clientes');
      
      // Asegurar que siempre sea un array
      const clientsData = Array.isArray(response.data) ? response.data : [];
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
      setError('Error al cargar los clientes');
      setClients([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar un nuevo cliente
  const addClient = async (clientData) => {
    try {
      const response = await axios.post('http://localhost:4000/api/clientes', clientData);
      setClients(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al agregar cliente' 
      };
    }
  };

  // Función para actualizar un cliente
  const updateClient = async (clientId, updateData) => {
    try {
      const response = await axios.put(`http://localhost:4000/api/clientes/${clientId}`, updateData);
      const updatedClient = response.data.cliente || { ...selectedClient, ...updateData };
      
      setClients(prev => 
        Array.isArray(prev) ? prev.map(client => 
          client._id === clientId ? updatedClient : client
        ) : [updatedClient]
      );
      
      // Actualizar el cliente seleccionado si es el mismo
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(updatedClient);
      }
      
      return { success: true, data: updatedClient };
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar cliente' 
      };
    }
  };

  // Función para eliminar un cliente
  const deleteClient = async (clientId) => {
    try {
      await axios.delete(`http://localhost:4000/api/clientes/${clientId}`);
      setClients(prev => Array.isArray(prev) ? prev.filter(client => client._id !== clientId) : []);
      
      // Limpiar selección si se elimina el cliente seleccionado
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(null);
        setShowDetailView(false);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al eliminar cliente' 
      };
    }
  };

  // Función para filtrar clientes - CORREGIDA
  const filteredClients = Array.isArray(clients) ? clients.filter((client) => {
    // Verificar que el cliente tenga las propiedades necesarias
    const firstName = client.firstName || '';
    const lastName = client.lastName || '';
    const idNumber = client.idNumber || '';
    const email = client.email || '';
    
    return [firstName, lastName, idNumber, email]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  }) : [];

  // Función para ordenar clientes - CORREGIDA
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.createdAt || b._id || 0) - new Date(a.createdAt || a._id || 0);
      case 'Oldest':
        return new Date(a.createdAt || a._id || 0) - new Date(b.createdAt || b._id || 0);
      case 'Name':
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        return nameA.localeCompare(nameB);
      case 'Email':
        return (a.email || '').localeCompare(b.email || '');
      default:
        return 0;
    }
  });

  // Función para seleccionar cliente y mostrar detalles
  const selectClient = (client) => {
    setSelectedClient(client);
    setShowDetailView(true);
  };

  // Función para cerrar vista de detalles
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedClient(null);
  };

  // Función para refrescar datos
  const refreshClients = () => {
    fetchClients();
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para obtener estadísticas - CORREGIDA
  const getStats = () => {
    const clientsArray = Array.isArray(clients) ? clients : [];
    const filteredArray = Array.isArray(filteredClients) ? filteredClients : [];
    
    return {
      total: clientsArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0
    };
  };

  return {
    // Estados
    clients: sortedClients,
    selectedClient,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    
    // Acciones CRUD
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
    
    // Acciones de UI
    selectClient,
    closeDetailView,
    clearSearch,
    
    // Setters para filtros
    setSearchTerm,
    setSortBy,
    
    // Utilidades
    filteredClients,
    stats: getStats()
  };
};

export default useDataCliente;