import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, ChevronDown, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MotoristaManagementInterface = () => {
  const navigate = useNavigate();
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    const fetchMotoristas = async () => {
      try {
        setLoading(true);
        console.log('Iniciando petición a la API de motoristas...');
        
        const response = await fetch('http://localhost:4000/api/motoristas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        setMotoristas(data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar los motoristas:', error);
        setError(`Error al cargar los motoristas: ${error.message}`);
        setMotoristas([]);
      } finally {
        setLoading(false);
        console.log('Carga completada');
      }
    };
    
    fetchMotoristas();
  }, []);

  // Función para verificar si la licencia está vigente
  const isLicenseValid = (motorista) => {
    try {
      if (!motorista || !motorista.circulationCard) return false;
      
      if (motorista.birthDate) {
        const birthDate = new Date(motorista.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        // Verificar si es mayor de edad
        return age >= 18;
      }
      
      // Si no hay fecha de nacimiento, asumir que está vigente si tiene tarjeta
      return Boolean(motorista.circulationCard);
    } catch (error) {
      console.error('Error en isLicenseValid:', error);
      return false;
    }
  };

  const filterMotoristas = motoristas.filter((motorista) => 
    [motorista.name, motorista.lastName, motorista.id, motorista.email]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleContinue = (e) => {
    e.preventDefault();
    console.log('Navegando a agregar motorista...');
    navigate('/motoristas/agregarMotorista');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/motoristas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMotoristas(data);
      setError(null);
    } catch (error) {
      console.error('Error al recargar los motoristas:', error);
      setError(`Error al recargar los motoristas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen text-white" style={{backgroundColor: '#34353A'}}>
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Motorista List */}
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 ${showDetailView ? 'rounded-l-3xl' : 'rounded-3xl'} ml-4 my-4 flex flex-col`}>
          {/* Header - Fixed */}
          <div className="p-8 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Motoristas</h1>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Listado de motoristas</h2>
              <div className="text-teal-500 text-sm mb-4">Motoristas registrados</div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={handleRefresh}
                    className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Cargando...' : 'Actualizar'}
                  </button>
                  <div className="text-sm text-gray-500">
                    Sort by: <span className="text-gray-700 font-medium">{sortBy}</span>
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
              </div>
            </div>

            {/* Table Header - Fixed */}
            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-7'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Email</div>
              <div>DUI</div>
              <div>Fecha-Nacimiento</div>
              {!showDetailView && (
                <>
                  <div>Teléfono</div>
                  <div>Dirección</div>
                  <div>Licencia</div>
                </>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="space-y-2 py-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando motoristas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : filterMotoristas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay motoristas registrados.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleContinue}
                      className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Agregar primer motorista
                    </button>
                  )}
                </div>
              ) : (
                filterMotoristas.map((motorista, index) => (
                  <div
                    key={motorista._id || motorista.id || index}
                    className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-7'} gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMotorista && (selectedMotorista._id === motorista._id || selectedMotorista.id === motorista.id) ? 'bg-teal-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedMotorista(motorista);
                      setShowDetailView(true);
                    }}
                  >
                    <div className="font-medium truncate">{motorista.name} {motorista.lastName}</div>
                    <div className="text-gray-600 truncate">{motorista.email}</div>
                    <div className="text-gray-600 truncate">{motorista.id}</div>
                    <div className="text-gray-600 truncate">
                      {motorista.birthDate ? new Date(motorista.birthDate).toLocaleDateString() : 'No disponible'}
                    </div>
                    {!showDetailView && (
                      <>
                        <div className="text-gray-600 truncate">{motorista.phone ? motorista.phone.toString() : 'No disponible'}</div>
                        <div className="text-gray-600 truncate">{motorista.address || 'No disponible'}</div>
                        <div className="truncate">
                          {isLicenseValid(motorista) ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Vigente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Vencido
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-8 pt-4 flex-shrink-0 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing data 1 to {Math.min(filterMotoristas.length, 8)} of {filterMotoristas.length} entries
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex space-x-1">
                  <button className="w-8 h-8 bg-teal-500 text-white rounded-lg text-sm font-medium">1</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">2</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">3</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">4</button>
                  <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">40</button>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Add Motorista Button */}
            <div className="mt-4">
              <button onClick={handleContinue} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Agregar motorista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Motorista Info Panel */}
        {showDetailView && selectedMotorista && (
          <div className="w-80 bg-white text-gray-900 rounded-r-3xl mr-4 my-4 p-6">
            <div className="flex items-center mb-6">
              <button
                className="p-2 hover:bg-gray-100 rounded-full mr-3"
                onClick={() => {
                  setShowDetailView(false);
                  setSelectedMotorista(null);
                }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold">Información del motorista</h2>
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{selectedMotorista.name} {selectedMotorista.lastName}</h3>
              <div className="text-sm text-gray-500 mb-4">Motorista</div>
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
                  <div className="text-sm text-gray-400 break-words">{selectedMotorista.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">DUI</div>
                  <div className="text-sm text-gray-400">{selectedMotorista.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                  <div className="text-sm text-gray-400">
                    {selectedMotorista.birthDate ? new Date(selectedMotorista.birthDate).toLocaleDateString() : 'No disponible'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                  <div className="text-sm text-gray-400">{selectedMotorista.phone ? selectedMotorista.phone.toString() : 'No disponible'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="text-sm text-gray-400 break-words">{selectedMotorista.address || 'No disponible'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tarjeta de Circulación</div>
                  <div className="text-sm text-gray-400">{selectedMotorista.circulationCard || 'No disponible'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Estado de Licencia</div>
                  <div className="text-sm">
                    {isLicenseValid(selectedMotorista) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Vencido
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotoristaManagementInterface;