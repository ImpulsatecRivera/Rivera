import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Search, Phone, Mail, User, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ClientManagementInterface = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/clientes');
        setClients(response.data);
      } catch (error) {
        setError("Error al cargar los clientes");
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const filteredClients = clients.filter((client) =>
    [client.firstName, client.lastName, client.idNumber, client.email]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen text-white" style={{ backgroundColor: '#34353A' }}>
      <div className="flex-1 flex relative">
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 ${showDetailView ? 'rounded-l-3xl' : 'rounded-3xl'} ml-4 my-4 flex flex-col`}>
          
          {/* Header Section */}
          <div className="p-8 pb-0 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Clientes</h1>
            
            {/* Listado de clientes section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Listado de clientes</h2>
              <p className="text-sm text-teal-600 font-medium">Clientes registrados</p>
            </div>

            {/* Search and Sort Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
              
              <div className="ml-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Name">Name</option>
                    <option value="Email">Email</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Headers */}
            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Email</div>
              <div>DUI</div>
              <div>Fecha-Nacimiento</div>
              {!showDetailView && (
                <>
                  <div>Teléfono</div>
                  <div>Dirección</div>
                </>
              )}
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="space-y-2 py-4">
              {loading ? (
                <p className="text-gray-500">Cargando clientes...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : filteredClients.length === 0 ? (
                <p className="text-gray-500">No se encontraron resultados.</p>
              ) : (
                filteredClients.map((client, index) => (
                  <div
                    key={client._id || index}
                    className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                      selectedClient && selectedClient._id === client._id ? 'bg-teal-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailView(true);
                    }}
                  >
                    <div className="font-medium truncate">{client.firstName} {client.lastName}</div>
                    <div className="text-gray-600 truncate">{client.email}</div>
                    <div className="text-gray-600 truncate">{client.idNumber}</div>
                    <div className="text-gray-600 truncate">{new Date(client.birthDate).toLocaleDateString()}</div>
                    {!showDetailView && (
                      <>
                        <div className="text-gray-600 truncate">{client.phone ? client.phone.toString() : 'No disponible'}</div>
                        <div className="text-gray-600 truncate">{client.address}</div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Section */}
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="text-sm text-gray-500">
              Showing data 1 to 8 of 256k entries
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                <button className="w-8 h-8 flex items-center justify-center text-white bg-blue-600 rounded-lg text-sm font-medium">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  3
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  4
                </button>
                <span className="px-2 text-gray-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  40
                </button>
              </div>
              
              {/* Next Button */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail View Panel */}
        {showDetailView && selectedClient && (
          <div className="w-80 bg-white text-gray-900 rounded-r-3xl mr-4 my-4 p-6">
            <div className="flex items-center mb-6">
              <button
                className="p-2 hover:bg-gray-100 rounded-full mr-3"
                onClick={() => {
                  setShowDetailView(false);
                  setSelectedClient(null);
                }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold">Información del Cliente</h2>
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{selectedClient.firstName} {selectedClient.lastName}</h3>
              <div className="flex justify-center space-x-3">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Información Personal</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                  <div className="text-sm text-gray-400 break-words">{selectedClient.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">DUI</div>
                  <div className="text-sm text-gray-400">{selectedClient.idNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                  <div className="text-sm text-gray-400">{new Date(selectedClient.birthDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                  <div className="text-sm text-gray-400">{selectedClient.phone ? selectedClient.phone.toString() : 'No disponible'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="text-sm text-gray-400 break-words">{selectedClient.address}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagementInterface;