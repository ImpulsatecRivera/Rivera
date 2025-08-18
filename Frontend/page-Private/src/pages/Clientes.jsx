import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Users, MapPin, Calendar, CreditCard, Plus } from 'lucide-react';
import useClients from '../components/Clientes/hooks/useDataCliente'; // Ajusta la ruta según tu estructura

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
    stats
  } = useClients();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estado para la animación de carga del panel de detalles
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Efecto para activar loading cuando cambie el cliente seleccionado
  useEffect(() => {
    if (selectedClient && showDetailView) {
      setIsDetailLoading(true);
      const timer = setTimeout(() => {
        setIsDetailLoading(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [selectedClient, showDetailView]);

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
                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
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
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="px-8 py-4 border-b-2" style={{borderColor: '#5F8EAD', backgroundColor: '#f8fafc'}}>
              <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 text-sm font-semibold`} style={{color: '#5F8EAD'}}>
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
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pt-0">
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
                ) : !stats.hasResults ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay clientes registrados.'}
                      </p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                          style={{backgroundColor: '#5F8EAD'}}
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-4">
                    {getCurrentPageClients().map((client, index) => (
                      <div
                        key={client._id || index}
                        className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          selectedClient && selectedClient._id === client._id 
                            ? 'shadow-lg transform scale-[1.02]' 
                            : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
                        }`}
                        style={{
                          backgroundColor: selectedClient && selectedClient._id === client._id ? '#5D9646' : '#ffffff',
                          color: selectedClient && selectedClient._id === client._id ? '#ffffff' : '#374151',
                          borderColor: selectedClient && selectedClient._id === client._id ? '#5D9646' : 'transparent'
                        }}
                        onClick={() => selectClient(client)}
                      >
                        <div className="font-semibold flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            selectedClient && selectedClient._id === client._id ? 'bg-white bg-opacity-20' : ''
                          }`} style={{backgroundColor: selectedClient && selectedClient._id === client._id ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
                            <User className={`w-5 h-5 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-white'}`} />
                          </div>
                          <span className="truncate">{client.firstName} {client.lastName}</span>
                        </div>
                        <div className="flex items-center truncate">
                          <Mail className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center truncate">
                          <CreditCard className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">{client.idNumber}</span>
                        </div>
                        <div className="flex items-center truncate">
                          <Calendar className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">
                            {client.birthDate ? new Date(client.birthDate).toLocaleDateString() : 'No disponible'}
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
            <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
              {isDetailLoading ? (
                /* Enhanced Loading Screen */
                <div className="flex-1 flex items-center justify-center relative" 
                     style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b2f 100%)'}}>
                  
                  {/* Background Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10 animate-pulse"
                         style={{backgroundColor: '#5F8EAD', animation: 'float 3s ease-in-out infinite'}}>
                    </div>
                    <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full opacity-10 animate-pulse"
                         style={{backgroundColor: '#5D9646', animation: 'float 3s ease-in-out infinite reverse'}}>
                    </div>
                    <div className="absolute top-1/2 left-4 w-12 h-12 rounded-full opacity-10 animate-pulse"
                         style={{backgroundColor: '#5F8EAD', animation: 'float 4s ease-in-out infinite'}}>
                    </div>
                  </div>

                  <div className="text-center z-10">
                    {/* Enhanced Profile Loading Animation */}
                    <div className="relative mb-8">
                      <div className="w-28 h-28 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl overflow-hidden relative" 
                           style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #5D9646 100%)'}}>
                        <User className="w-14 h-14 text-white animate-pulse" />
                        
                        {/* Multiple rotating borders */}
                        <div className="absolute inset-0 rounded-2xl border-4 border-transparent animate-spin"
                             style={{
                               borderTopColor: '#FFFFFF',
                               borderRightColor: 'rgba(255,255,255,0.3)',
                               animation: 'spin 2s linear infinite'
                             }}>
                        </div>
                        <div className="absolute inset-2 rounded-xl border-2 border-transparent animate-spin"
                             style={{
                               borderBottomColor: '#FFFFFF',
                               borderLeftColor: 'rgba(255,255,255,0.2)',
                               animation: 'spin 3s linear infinite reverse'
                             }}>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Loading Text */}
                    <div className="space-y-4 mb-8">
                      <h2 className="text-2xl font-bold text-white animate-pulse">
                        Cargando Cliente
                      </h2>
                      <p className="text-gray-300 text-lg">
                        Preparando información del cliente
                      </p>
                    </div>

                    {/* Modern Loading Dots with Ripple Effect */}
                    <div className="flex justify-center space-x-3 mb-8">
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full animate-bounce" 
                             style={{
                               backgroundColor: '#5F8EAD', 
                               animationDelay: '0ms',
                               animation: 'bounce-custom 1.6s ease-in-out infinite both'
                             }}>
                        </div>
                        <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                             style={{backgroundColor: '#5F8EAD', opacity: '0.3'}}>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full animate-bounce" 
                             style={{
                               backgroundColor: '#FFFFFF', 
                               animationDelay: '0.2s',
                               animation: 'bounce-custom 1.6s ease-in-out infinite both'
                             }}>
                        </div>
                        <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                             style={{backgroundColor: '#FFFFFF', opacity: '0.3', animationDelay: '0.2s'}}>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full animate-bounce" 
                             style={{
                               backgroundColor: '#5D9646', 
                               animationDelay: '0.4s',
                               animation: 'bounce-custom 1.6s ease-in-out infinite both'
                             }}>
                        </div>
                        <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                             style={{backgroundColor: '#5D9646', opacity: '0.3', animationDelay: '0.4s'}}>
                        </div>
                      </div>
                    </div>
                    
                    {/* Advanced Progress Bar */}
                    <div className="w-80 mx-auto">
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div className="h-2 rounded-full relative overflow-hidden"
                             style={{
                               background: 'linear-gradient(90deg, #5F8EAD 0%, #5D9646 50%, #5F8EAD 100%)',
                               width: '100%',
                               animation: 'loading-wave 2.5s ease-in-out infinite'
                             }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                               style={{animation: 'shimmer 1.5s ease-in-out infinite'}}>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dynamic Loading Steps */}
                      <div className="text-sm text-gray-400 animate-pulse">
                        <span className="inline-block" style={{animation: 'text-fade 3s ease-in-out infinite'}}>
                          Verificando información del cliente...
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <style jsx>{`
                    @keyframes loading-wave {
                      0% { 
                        transform: translateX(-100%);
                        opacity: 0.5;
                      }
                      50% { 
                        transform: translateX(0%);
                        opacity: 1;
                      }
                      100% { 
                        transform: translateX(100%);
                        opacity: 0.5;
                      }
                    }
                    
                    @keyframes bounce-custom {
                      0%, 80%, 100% {
                        transform: scale(0.8) translateY(0);
                        opacity: 0.5;
                      } 
                      40% {
                        transform: scale(1.2) translateY(-10px);
                        opacity: 1;
                      }
                    }
                    
                    @keyframes float {
                      0%, 100% {
                        transform: translateY(0px) scale(1);
                      }
                      50% {
                        transform: translateY(-10px) scale(1.1);
                      }
                    }
                    
                    @keyframes shimmer {
                      0% {
                        transform: translateX(-100%);
                      }
                      100% {
                        transform: translateX(100%);
                      }
                    }
                    
                    @keyframes text-fade {
                      0%, 100% { opacity: 0.6; }
                      50% { opacity: 1; }
                    }
                    
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : (
                <>
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{backgroundColor: '#5F8EAD', borderRadius: '0 0 0 100%'}}></div>
                  
                  {/* Header - Fijo */}
                  <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
                    <div className="flex items-center">
                      <button
                        className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
                        onClick={closeDetailView}
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h2 className="text-xl font-semibold text-gray-900">Detalles del Cliente</h2>
                    </div>
                  </div>

                  {/* Contenido Scrolleable */}
                  <div className="flex-1 overflow-y-auto px-8 pb-8">
                    {/* Profile Section */}
                    <div className="text-center mb-10">
                      <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
                          <User className="w-14 h-14 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-900">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </h3>
                      
                      <div className="flex justify-center space-x-3">
                        <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5D9646'}}>
                          <Phone className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5F8EAD'}}>
                          <Mail className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Information Cards */}
                    <div className="space-y-6">
                      {/* Información Personal */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg" style={{backgroundColor: '#5F8EAD'}}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">Información Personal</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Correo Electrónico</div>
                            <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">{selectedClient.email}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">DUI</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{selectedClient.idNumber}</div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg" style={{backgroundColor: '#5D9646'}}>
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <Calendar className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                              {selectedClient.birthDate ? 
                                new Date(selectedClient.birthDate).toLocaleDateString() : 
                                'No disponible'
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <Phone className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                              {selectedClient.phone ? selectedClient.phone.toString() : 'No disponible'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Dirección</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <MapPin className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                              {selectedClient.address || 'No disponible'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientes;