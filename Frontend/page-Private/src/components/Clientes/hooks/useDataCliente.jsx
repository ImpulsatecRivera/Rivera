import { useState, useEffect } from 'react';
import { config } from '../../../config';
import axios from 'axios';
const API_URL = config.api.API_URL;

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

  const normalizeClient = (client, index = 0) => {
    const contactoPrincipal = client?.contactoPrincipal || {};
    return {
      ...client,
      _id: client?._id || client?.id || `temp-${index}`,
      tipoCliente: client?.tipoCliente || 'natural',
      // Naturales
      firstName: client?.firstName || client?.firtsName || '',
      lastName: client?.lastName || '',
      idNumber: client?.idNumber || '',
      birthDate: client?.birthDate || null,
      // Corporativos
      nombreEmpresa: client?.nombreEmpresa || '',
      nombreComercial: client?.nombreComercial || '',
      ruc: client?.ruc || '',
      giroNegocio: client?.giroNegocio || '',
      terminosPago: client?.terminosPago || 'contado',
      direccionFacturacion: client?.direccionFacturacion || '',
      contactoPrincipal: {
        nombre: contactoPrincipal.nombre || '',
        cargo: contactoPrincipal.cargo || '',
        telefono: contactoPrincipal.telefono || '',
        email: contactoPrincipal.email || ''
      },
      contactosAdicionales: client?.contactosAdicionales || [],
      // Comunes
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      img: client?.img || ''
    };
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  // Función para obtener clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando petición a la API de clientes...');
      
      const response = await axios.get(`${API_URL}/clientes`, { withCredentials: true });
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📋 Datos recibidos completos:', response.data);
      console.log('📋 Tipo de datos recibidos:', typeof response.data);
      
      const clientsData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      let clientsArray = [];
      
      if (Array.isArray(clientsData)) {
        // Si la respuesta es directamente un array
        clientsArray = clientsData;
        console.log('✅ Datos son un array directo');
      } else if (clientsData && clientsData.data && Array.isArray(clientsData.data.clientes)) {
        // Tu API devuelve: { data: { clientes: [...] } }
        clientsArray = clientsData.data.clientes;
        console.log('✅ Datos encontrados en data.clientes');
      } else if (clientsData && Array.isArray(clientsData.clientes)) {
        // Si está directamente en clientes
        clientsArray = clientsData.clientes;
        console.log('✅ Datos encontrados en clientes');
      } else if (clientsData && Array.isArray(clientsData.data)) {
        // Si está en data como array
        clientsArray = clientsData.data;
        console.log('✅ Datos encontrados en data');
      } else {
        console.warn('⚠️ Formato de datos no esperado:', clientsData);
        console.warn('⚠️ Estructura recibida:', Object.keys(clientsData || {}));
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de clientes encontrados: ${clientsArray.length}`);
      
      if (clientsArray.length === 0) {
        console.log('⚠️ No se encontraron clientes en la respuesta');
      } else {
        console.log('📋 Primeros clientes:', clientsArray.slice(0, 2));
      }

      // Normalizar los datos de clientes
      const normalizedClients = clientsArray.map((client, index) => {
        console.log(`🔄 Normalizando cliente ${index + 1}:`, client);
        return normalizeClient(client, index);
      });

      console.log("✅ Clientes normalizados:", normalizedClients);
      setClients(normalizedClients);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error detallado:', error);
      console.error('❌ Tipo de error:', error.name);
      console.error('❌ Mensaje de error:', error.message);
      
      // Verificar si es un error de red
      if (error.message.includes('Network') || error.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en https://riveraproject-production-933e.up.railway.app');
      } else if (error.response) {
        setError(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar clientes: ${error.message}`);
      }
      setClients([]);
    } finally {
      setLoading(false);
      console.log('🏁 Carga de clientes finalizada');
    }
  };

  // Función para agregar un nuevo cliente
  const addClient = async (clientData) => {
    try {
      console.log('➕ Agregando nuevo cliente:', clientData);
      const response = await axios.post(`${API_URL}/clientes`, clientData, { withCredentials: true });
      
      const newClient = response.data.data || response.data;
      const normalizedClient = normalizeClient(newClient);
      
      setClients(prev => Array.isArray(prev) ? [...prev, normalizedClient] : [normalizedClient]);
      console.log('✅ Cliente agregado exitosamente');
      return { success: true, data: normalizedClient };
    } catch (error) {
      console.error('❌ Error al agregar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al agregar cliente' 
      };
    }
  };

  // Función para actualizar un cliente
  const updateClient = async (clientId, updateData) => {
    try {
      console.log(`📝 Actualizando cliente ${clientId}:`, updateData);
      const tipo = updateData?.tipoCliente || selectedClient?.tipoCliente;
      const isCorp = tipo === 'corporativo';
      const url = isCorp
        ? `${API_URL}/clientes/corporativo/${clientId}`
        : `${API_URL}/clientes/${clientId}`;

      const response = await axios.put(url, updateData, { withCredentials: true });
      
      const updatedClientData =
        response.data?.cliente ||
        response.data?.data?.cliente ||
        response.data?.data ||
        { ...selectedClient, ...updateData };
      const updatedClient = normalizeClient(updatedClientData);
      
      setClients(prev => 
        Array.isArray(prev) 
          ? prev.map(client => client._id === clientId ? updatedClient : client)
          : [updatedClient]
      );
      
      // Actualizar el cliente seleccionado si es el mismo
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(updatedClient);
      }
      
      console.log('✅ Cliente actualizado exitosamente');
      return { success: true, data: updatedClient };
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar cliente' 
      };
    }
  };

  // Función para eliminar un cliente
  const deleteClient = async (clientId) => {
    try {
      console.log(`🗑️ Eliminando cliente ${clientId}`);
      await axios.delete(`${API_URL}/clientes/${clientId}`, { withCredentials: true });
      setClients(prev => Array.isArray(prev) ? prev.filter(client => client._id !== clientId) : []);
      
      // Limpiar selección si se elimina el cliente seleccionado
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(null);
        setShowDetailView(false);
      }
      
      console.log('✅ Cliente eliminado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al eliminar cliente' 
      };
    }
  };

  // Función para filtrar clientes - WITH SAFETY CHECK
  const filteredClients = Array.isArray(clients) ? clients.filter((client) => {
    const haystack = [
      client.firstName,
      client.lastName,
      client.idNumber,
      client.email,
      client.nombreEmpresa,
      client.nombreComercial,
      client.ruc,
      client.contactoPrincipal?.nombre,
      client.contactoPrincipal?.email,
      client.contactoPrincipal?.telefono
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.toLowerCase());
  }) : [];

  // Función para ordenar clientes - WITH SAFETY CHECK
  const sortedClients = Array.isArray(filteredClients) ? [...filteredClients].sort((a, b) => {
    const nombreA = a?.tipoCliente === 'corporativo'
      ? (a.nombreComercial || a.nombreEmpresa || '')
      : `${a.firstName || ''} ${a.lastName || ''}`.trim();
    const nombreB = b?.tipoCliente === 'corporativo'
      ? (b.nombreComercial || b.nombreEmpresa || '')
      : `${b.firstName || ''} ${b.lastName || ''}`.trim();

    switch (sortBy) {
      case 'Newest':
        return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      case 'Oldest':
        return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
      case 'Name':
        return nombreA.localeCompare(nombreB);
      case 'Email':
        return a.email.localeCompare(b.email);
      default:
        return 0;
    }
  }) : [];

  // Función para seleccionar cliente y mostrar detalles
  const selectClient = (client) => {
    console.log('👤 Cliente seleccionado:', client);
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
    console.log('🔄 Refrescando lista de clientes...');
    fetchClients();
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para obtener estadísticas
  const getStats = () => {
    const clientsArray = Array.isArray(clients) ? clients : [];
    const filteredArray = Array.isArray(filteredClients) ? filteredClients : [];
    
    return {
      total: clientsArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0
    };
  };

  // Efecto para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Estado actual de clientes:', {
        count: clients.length,
        loading,
        error,
        hasData: clients.length > 0,
        clients: clients.slice(0, 2) // Solo mostrar los primeros 2
      });
    }
  }, [clients, loading, error]);

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