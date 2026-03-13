import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ChevronLeft, ChevronRight, Users, MapPin, Calendar, CreditCard, Plus, MoreHorizontal, Building2, FileText, DollarSign, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlertCliente from '../components/Clientes/SweetAlertCliente';
import ConfirmDeleteClienteAlert from '../components/Clientes/ConfirmDeleteClienteAlert';
import SuccessAlertCliente from '../components/Clientes/SuccessAlertCliente';
import EditClienteCorporativoAlert from '../components/Clientes/EditClienteCorporativoAlert';
import useClients from '../components/Clientes/hooks/useDataCliente'; // Ajusta la ruta según tu estructura
import { usePermissions } from '../hooks/usePermissions';
import { RoleBadge } from '../components/Auth';
import Swal from 'sweetalert2';
import { useTutorial } from '../hooks/useTutorial';
import '../styles/tutorial-global.css';

const Clientes= () => {
  const {
    clients,
    selectedClient,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    selectClient,
    closeDetailView,
    stats,
    deleteClient,
    updateClient,
  } = useClients();

    const { canCreate } = usePermissions();

  const { startTutorial, hasCompleted } = useTutorial('clientes');

  // Modales y navegación
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsAlert, setShowOptionsAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estado para la animación de carga del panel de detalles
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // ✅ Estado para controlar qué tipo de cliente mostrar
  const [tipoClienteActivo, setTipoClienteActivo] = useState('natural');

  // ✅ Separar clientes por tipo
  const clientesNaturales = clients.filter(c => c.tipoCliente === 'natural' || !c.tipoCliente);
  const clientesCorporativos = clients.filter(c => c.tipoCliente === 'corporativo');
  
  // Clientes a mostrar según el tipo activo
  const clientesMostrar = tipoClienteActivo === 'natural' ? clientesNaturales : clientesCorporativos;

  // ✅ Helper para formatear fechas sin timezone
  const formatFecha = (v) => {
    if (!v) return 'No disponible';
    try {
      const dateStr = String(v).substring(0, 10);
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return 'No disponible';
      return `${day}/${month}/${year}`;
    } catch {
      return 'No disponible';
    }
  };

  const showNoPermission = () => {
    Swal.fire({
      title: 'Acceso restringido',
      html: 'No tienes permiso, contacta con un administrador',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#2563eb'
    });
  };

  const openCreateCorporate = () => {
    setTipoClienteActivo('corporativo');
    navigate('/clientes/agregarCliente');
  };

  const openEditCorporate = () => {
    if (!selectedClient || selectedClient.tipoCliente !== 'corporativo') return;
    setShowEditModal(true);
    setActionStatus({ type: '', message: '' });
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setSubmitting(true);
    const result = await deleteClient(selectedClient._id);
    setSubmitting(false);
    if (result.status === 403) {
      showNoPermission();
      setShowDeleteConfirm(false);
      return;
    }
    if (result.success) {
      setShowDeleteConfirm(false);
      closeDetailView();
      setSuccessType('delete');
      setShowSuccessAlert(true);
      return;
    }
    setActionStatus({ type: 'error', message: result.error || 'No se pudo eliminar' });
  };

  const handleOptionsClick = (e) => {
    if (e) e.stopPropagation();
    setShowOptionsAlert(true);
  };

  const handleEdit = () => {
    setShowOptionsAlert(false);
    openEditCorporate();
  };

  const handleDelete = () => {
    setShowOptionsAlert(false);
    setShowDeleteConfirm(true);
  };

  const handleSaveEdit = async (data) => {
    if (!selectedClient) return;
    const payload = {
      ...data,
      // Asegurar requeridos para corporativo
      nombreEmpresa: data.nombreEmpresa || selectedClient.nombreEmpresa,
      nombreComercial: data.nombreComercial || data.nombreEmpresa || selectedClient.nombreComercial || selectedClient.nombreEmpresa,
      ruc: data.ruc || selectedClient.ruc,
      email: data.email || selectedClient.email,
      phone: data.phone || data.contactoPrincipal?.telefono || selectedClient.phone || selectedClient.contactoPrincipal?.telefono,
      address: data.address || selectedClient.address,
      direccionFacturacion: data.direccionFacturacion || selectedClient.direccionFacturacion || data.address || selectedClient.address,
      tipoCliente: 'corporativo',
      contactoPrincipal: {
        ...selectedClient.contactoPrincipal,
        ...data.contactoPrincipal
      }
    };

    setSubmitting(true);
    const result = await updateClient(selectedClient._id, payload);
    setSubmitting(false);

    if (result.status === 403) {
      showNoPermission();
      return;
    }
    if (result.success) {
      setShowEditModal(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      return;
    }

    setActionStatus({ type: 'error', message: result.error || 'No se pudo actualizar' });
  };

  // Efecto para activar loading cuando cambie el cliente seleccionado
  useEffect(() => {
    if (selectedClient && showDetailView) {
      setIsDetailLoading(true);
      const timer = setTimeout(() => {
        setIsDetailLoading(false);
      }, 1000); // Reduced from 2500ms for testing

      return () => clearTimeout(timer);
    }
  }, [selectedClient, showDetailView]);

  useEffect(() => {
    if (actionStatus.message) {
      const timer = setTimeout(() => setActionStatus({ type: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionStatus]);

  // Obtener clientes para la página actual
  const getCurrentPageClients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clients.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  // Función para cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-6 py-8">
        {actionStatus.message && actionStatus.type === 'error' && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium shadow-md bg-red-50 text-red-700 border border-red-200">
            {actionStatus.message}
          </div>
        )}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white rounded-2xl shadow-2xl ${showDetailView ? 'mr-6' : ''} flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-6" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
                  <p className="text-blue-100 text-lg">Administra tu cartera de clientes</p>
                </div>
                <div className="flex items-center space-x-4">
                  <RoleBadge />
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Directorio de Clientes</h2>
                    <div className="text-blue-100 flex items-center">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                        {stats.total > 0 ? `${stats.total} Registrados` : 'Clientes registrados'}
                      </span>
                    </div>
                  </div>
                  
                  {/* ✅ Botones para cambiar tipo de cliente */}
                  <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg p-1">
                    <button
                      onClick={() => setTipoClienteActivo('natural')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        tipoClienteActivo === 'natural'
                          ? 'bg-white text-blue-700 shadow-lg'
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Naturales ({clientesNaturales.length})</span>
                    </button>
                    <button
                      onClick={() => setTipoClienteActivo('corporativo')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        tipoClienteActivo === 'corporativo'
                          ? 'bg-white text-green-700 shadow-lg'
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Corporativos ({clientesCorporativos.length})</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar clientes..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-400 shadow-lg"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Botón tutorial */}
                    <button
                      onClick={startTutorial}
                      className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#5F8EAD] text-[#5F8EAD] rounded-xl hover:bg-[#5F8EAD] hover:text-white font-bold shadow-lg transition-all transform hover:scale-105 backdrop-blur-sm"
                    >
                      <HelpCircle size={22} />
                      <span>Tutorial</span>
                      {!hasCompleted && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          !
                        </span>
                      )}
                    </button>

                    {tipoClienteActivo === 'corporativo' && canCreate && (
                      <button
                        onClick={openCreateCorporate}
                        className="flex items-center space-x-2 px-5 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 shadow-lg backdrop-blur-sm font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Nuevo corporativo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ TABLA DINÁMICA según tipo seleccionado */}
            <div className="px-8 py-4 border-b-2" style={{
              borderColor: tipoClienteActivo === 'natural' ? '#5F8EAD' : '#5D9646', 
              backgroundColor: tipoClienteActivo === 'natural' ? '#f0f9ff' : '#f0fdf4'
            }}>
              <h3 className="text-lg font-bold mb-3" style={{color: tipoClienteActivo === 'natural' ? '#5F8EAD' : '#5D9646'}}>
                {tipoClienteActivo === 'natural' ? ' Clientes Naturales' : ' Clientes Corporativos'} 
              </h3>
              
              {/* Table Header Dinámico */}
              <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 text-sm font-semibold mb-2`} style={{color: tipoClienteActivo === 'natural' ? '#5F8EAD' : '#5D9646'}}>
                {tipoClienteActivo === 'natural' ? (
                  <>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Nombres
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      DUI
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha Nacimiento
                    </div>
                    {!showDetailView && (
                      <>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Teléfono
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Dirección
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Nombre Empresa
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Nombre Comercial
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      RUC/NIT
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </div>
                    {!showDetailView && (
                      <>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Teléfono
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Dirección
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Table Content Unificado */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#5F8EAD'}}></div>
                    <p className="text-gray-500 mt-4">Cargando clientes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-2 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                        style={{backgroundColor: '#ef4444'}}
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                ) : clientesMostrar.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay clientes {tipoClienteActivo === 'natural' ? 'naturales' : 'corporativos'} registrados
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientesMostrar.map((client, index) => (
                      <div
                        key={client._id || index}
                        className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          selectedClient && selectedClient._id === client._id 
                            ? 'shadow-lg transform scale-[1.02]' 
                            : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
                        }`}
                        style={{
                          backgroundColor: selectedClient && selectedClient._id === client._id ? (tipoClienteActivo === 'natural' ? '#5F8EAD' : '#5D9646') : '#ffffff',
                          color: selectedClient && selectedClient._id === client._id ? '#ffffff' : '#374151',
                          borderColor: selectedClient && selectedClient._id === client._id ? (tipoClienteActivo === 'natural' ? '#5F8EAD' : '#5D9646') : 'transparent'
                        }}
                        onClick={() => selectClient(client)}
                      >
                        {tipoClienteActivo === 'natural' ? (
                          <>
                            <div className="font-semibold flex items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedClient && selectedClient._id === client._id ? 'bg-white bg-opacity-20' : ''
                              }`} style={{backgroundColor: selectedClient && selectedClient._id === client._id ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
                                <User className={`w-5 h-5 text-white`} />
                              </div>
                              <span className="truncate">{client.firstName} {client.lastName}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <Mail className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <CreditCard className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">{client.idNumber || '—'}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <Calendar className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">
                                {client.birthDate ? (() => {
                                  try {
                                    const dateStr = String(client.birthDate).substring(0, 10);
                                    const [year, month, day] = dateStr.split('-');
                                    return `${day}/${month}/${year}`;
                                  } catch {
                                    return 'No disponible';
                                  }
                                })() : 'No disponible'}
                              </span>
                            </div>
                            {!showDetailView && (
                              <>
                                <div className="flex items-center truncate">
                                  <Phone className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                  <span className="truncate">
                                    {client.phone ? client.phone.toString() : 'No disponible'}
                                  </span>
                                </div>
                                <div className="flex items-center truncate">
                                  <MapPin className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                  <span className="truncate">
                                    {client.address || 'No disponible'}
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="font-semibold flex items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedClient && selectedClient._id === client._id ? 'bg-white bg-opacity-20' : ''
                              }`} style={{backgroundColor: selectedClient && selectedClient._id === client._id ? 'rgba(255,255,255,0.2)' : '#5D9646'}}>
                                <Users className={`w-5 h-5 text-white`} />
                              </div>
                              <span className="truncate">{client.nombreEmpresa || '—'}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <User className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">{client.nombreComercial || '—'}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <CreditCard className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">{client.ruc || '—'}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <Mail className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                              <span className="truncate">{client.email}</span>
                            </div>
                            {!showDetailView && (
                              <>
                                <div className="flex items-center truncate">
                                  <Phone className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                  <span className="truncate">
                                    {client.phone || client.contactoPrincipal?.telefono || 'No disponible'}
                                  </span>
                                </div>
                                <div className="flex items-center truncate">
                                  <MapPin className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                  <span className="truncate">
                                    {client.address || client.direccionFacturacion || 'No disponible'}
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-gray-100" style={{backgroundColor: '#f8fafc'}}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, clients.length)} de {clients.length} clientes
                  {searchTerm && ` (filtrado de ${stats.total} total)`}
                </div>
                
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                      ) : (
                        <button 
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'text-white shadow-sm'
                              : 'text-gray-700 border border-gray-200 hover:bg-white'
                          }`}
                          style={currentPage === page ? {backgroundColor: '#5F8EAD'} : {}}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Detalles */}
          {showDetailView && selectedClient && (
            <div className="w-96 bg-white rounded-2xl shadow-2xl relative flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0 border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
                    onClick={closeDetailView}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">Detalles del Cliente</h2>
                </div>
                <button
                  onClick={handleOptionsClick}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 pb-8">
                {/* Profile Section */}
                <div className="text-center mb-10">
                  <div className="relative inline-block">
                    <div
                      className="w-28 h-28 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)' }}
                    >
                      {selectedClient.tipoCliente === 'corporativo' ? (
                        <Building2 className="w-14 h-14 text-white" />
                      ) : (
                        <User className="w-14 h-14 text-white" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">
                    {selectedClient.tipoCliente === 'corporativo'
                      ? (selectedClient.nombreEmpresa || selectedClient.nombreComercial || 'Cliente corporativo')
                      : ((`${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim()) || 'Cliente')}
                  </h3>

                  <div className="flex justify-center space-x-3">
                    <button
                      className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md"
                      style={{ backgroundColor: '#5D9646' }}
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </button>
                    <button
                      className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md"
                      style={{ backgroundColor: '#5F8EAD' }}
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Information Cards */}
                <div className="space-y-6">
                  {selectedClient.tipoCliente === 'corporativo' ? (
                    <>
                      {/* Información Empresarial */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#5F8EAD' }}>
                            <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">Información Empresarial</span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                  {selectedClient.nombreEmpresa || 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Nombre Comercial</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                  {selectedClient.nombreComercial || 'No especificado'}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-1">RUC/NIT</div>
                                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2" style={{ color: '#5F8EAD' }} />
                                    {selectedClient.ruc || 'No especificado'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-1">Giro del Negocio</div>
                                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                    <FileText className="w-4 h-4 mr-2" style={{ color: '#5F8EAD' }} />
                                    {selectedClient.giroNegocio || 'No especificado'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Información de Contacto */}
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: '#5D9646' }}>
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Correo Principal</div>
                                <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border flex items-center">
                                  <Mail className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.email || 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <Phone className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.phone || selectedClient.contactoPrincipal?.telefono || 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Dirección Principal</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.address || 'No especificado'}
                                </div>
                              </div>
                              {selectedClient.direccionFacturacion && (
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-1">Dirección de Facturación</div>
                                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                    {selectedClient.direccionFacturacion}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Información Financiera */}
                          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: '#10b981' }}>
                                <DollarSign className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">Información Comercial</span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Términos de Pago</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2" style={{ color: '#10b981' }} />
                                  {selectedClient.terminosPago || 'Contado'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contacto Principal */}
                          {(selectedClient.contactoPrincipal?.nombre || selectedClient.contactoPrincipal?.telefono) && (
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#9333ea' }}>
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-gray-900">Contacto Principal</span>
                              </div>

                              <div className="space-y-4">
                                {selectedClient.contactoPrincipal?.nombre && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Nombre</div>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                      {selectedClient.contactoPrincipal.nombre}
                                    </div>
                                  </div>
                                )}
                                {selectedClient.contactoPrincipal?.cargo && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Cargo</div>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                      {selectedClient.contactoPrincipal.cargo}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  {selectedClient.contactoPrincipal?.telefono && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                        <Phone className="w-4 h-4 mr-2" style={{ color: '#9333ea' }} />
                                        {selectedClient.contactoPrincipal.telefono}
                                      </div>
                                    </div>
                                  )}
                                  {selectedClient.contactoPrincipal?.email && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-700 mb-1">Email</div>
                                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                        <Mail className="w-4 h-4 mr-2" style={{ color: '#9333ea' }} />
                                        {selectedClient.contactoPrincipal.email}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Información Personal - Cliente Natural */}
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: '#5F8EAD' }}>
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">Información Personal</span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Correo Electrónico</div>
                                <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">
                                  {selectedClient.email || 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">DUI</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                  {selectedClient.idNumber || selectedClient.dui || 'No especificado'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Información de Contacto - Cliente Natural */}
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: '#5D9646' }}>
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.birthDate ? (() => { 
                                    try { 
                                      const d = String(selectedClient.birthDate).substring(0,10); 
                                      const [y,m,dd] = d.split('-'); 
                                      return `${dd}/${m}/${y}`; 
                                    } catch { 
                                      return 'No especificado'; 
                                    } 
                                  })() : 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <Phone className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.phone || 'No especificado'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Dirección</div>
                                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" style={{ color: '#5D9646' }} />
                                  {selectedClient.address || 'No especificado'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

        </div>
        
        {/* Global Alerts and Modals */}
        <SweetAlertCliente
          isOpen={showOptionsAlert}
          onClose={() => setShowOptionsAlert(false)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        <ConfirmDeleteClienteAlert
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteClient}
          clientName={selectedClient ? (selectedClient.nombreEmpresa || `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim()) : ''}
        />

        <SuccessAlertCliente
          isOpen={showSuccessAlert}
          onClose={() => setShowSuccessAlert(false)}
          type={successType === 'edit' ? 'edit' : 'delete'}
        />

        {selectedClient?.tipoCliente === 'corporativo' && (
          <EditClienteCorporativoAlert
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveEdit}
            cliente={selectedClient}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default Clientes;