// ProveedorDetailPanel.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Building2, Phone, Mail, Package } from 'lucide-react';

const ProveedorDetailPanel = ({ 
  selectedProveedor, 
  closeDetailView, 
  handleOptionsClick 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Activar loading cada vez que cambie el proveedor seleccionado
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [selectedProveedor]); // Se ejecuta cada vez que cambia selectedProveedor

  if (isLoading) {
    return (
      <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
        {/* Enhanced Loading Screen */}
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
                <Building2 className="w-14 h-14 text-white animate-pulse" />
                
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
                Cargando Proveedor
              </h2>
              <p className="text-gray-300 text-lg">
                Preparando información de la empresa
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
                  Verificando datos del proveedor...
                </span>
              </div>
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
    );
  }

  return (
    <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
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
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Proveedor</h2>
        </div>
        
        <div className="relative">
          <button
            onClick={handleOptionsClick}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Profile Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">{selectedProveedor.companyName}</h3>
          
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
          {/* Información de Contacto */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#5F8EAD'}}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Información de Contacto</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Correo Electrónico</div>
                <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">{selectedProveedor.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{selectedProveedor.phone}</div>
              </div>
            </div>
          </div>

          {/* Información de Productos */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#5D9646'}}>
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Productos y Servicios</span>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Repuesto Principal</div>
              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                <Package className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                {selectedProveedor.partDescription}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          {(selectedProveedor.direccion || selectedProveedor.rubro) && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg" style={{backgroundColor: '#34353A'}}>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Información Adicional</span>
              </div>

              <div className="space-y-4">
                {selectedProveedor.direccion && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Dirección</div>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{selectedProveedor.direccion}</div>
                  </div>
                )}

                {selectedProveedor.rubro && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Rubro</div>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{selectedProveedor.rubro}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProveedorDetailPanel;