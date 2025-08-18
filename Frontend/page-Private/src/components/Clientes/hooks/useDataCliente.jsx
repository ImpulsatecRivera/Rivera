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

      // Siempre garantizar que sea un array
      const clientsData = Array.isArray(response.data)
        ? response.data
        : response.data?.clientes || [];
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
      setError('Error al cargar los clientes');
      setClients([]); // fallback seguro
    } finally {
      setLoading(false);
    }
  };

  // Agregar cliente
  const addClient = async (clientData) => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/clientes',
        clientData
      );
      setClients((prev) =>
        Array.isArray(prev) ? [...prev, response.data] : [response.data]
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Error al agregar cliente',
      };
    }
  };

  // Actualizar cliente
  const updateClient = async (clientId, updateData) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/clientes/${clientId}`,
        updateData
      );
      const updatedClient = response.data.cliente || {
        ...selectedClient,
        ...updateData,
      };

      setClients((prev) =>
        Array.isArray(prev)
          ? prev.map((c) => (c._id === clientId ? updatedClient : c))
          : [updatedClient]
      );

      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(updatedClient);
      }

      return { success: true, data: updatedClient };
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Error al actualizar cliente',
      };
    }
  };

  // Eliminar cliente
  const deleteClient = async (clientId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/clientes/${clientId}`
      );
      setClients((prev) =>
        Array.isArray(prev)
          ? prev.filter((c) => c._id !== clientId)
          : []
      );

      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(null);
        setShowDetailView(false);
      }

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Error al eliminar cliente',
      };
    }
  };

  // Filtrar clientes
  const filteredClients = Array.isArray(clients)
    ? clients.filter((c) => {
        const firstName = c.firstName || c.nombre || '';
        const lastName = c.lastName || c.apellido || '';
        const idNumber = c.idNumber || '';
        const email = c.email || '';

        return [firstName, lastName, idNumber, email]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    : [];

  // Ordenar clientes
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return (
          new Date(b.createdAt || b._id || 0) -
          new Date(a.createdAt || a._id || 0)
        );
      case 'Oldest':
        return (
          new Date(a.createdAt || a._id || 0) -
          new Date(b.createdAt || b._id || 0)
        );
      case 'Name':
        const nameA = `${a.firstName || a.nombre || ''} ${
          a.lastName || a.apellido || ''
        }`.trim();
        const nameB = `${b.firstName || b.nombre || ''} ${
          b.lastName || b.apellido || ''
        }`.trim();
        return nameA.localeCompare(nameB);
      case 'Email':
        return (a.email || '').localeCompare(b.email || '');
      default:
        return 0;
    }
  });

  // Stats seguros
  const getStats = () => {
    const clientsArray = Array.isArray(clients) ? clients : [];
    const filteredArray = Array.isArray(filteredClients)
      ? filteredClients
      : [];

    return {
      total: clientsArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0,
    };
  };

  return {
    clients: sortedClients,
    selectedClient,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    addClient,
    updateClient,
    deleteClient,
    refreshClients: fetchClients,
    selectClient: (c) => {
      setSelectedClient(c);
      setShowDetailView(true);
    },
    closeDetailView: () => {
      setShowDetailView(false);
      setSelectedClient(null);
    },
    clearSearch: () => setSearchTerm(''),
    setSearchTerm,
    setSortBy,
    filteredClients,
    stats: getStats(),
  };
};

export default useDataCliente;
