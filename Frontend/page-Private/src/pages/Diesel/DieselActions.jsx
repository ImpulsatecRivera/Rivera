import React, { useState, useRef, useEffect } from 'react';
import { Download, Edit, Check, Trash2, MoreVertical } from 'lucide-react';
import { ProtectedAction } from '../../components/Auth';

const DieselActions = ({ 
  row, 
  isCompletado, 
  onDownload, 
  onEdit, 
  onComplete, 
  onDelete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onDownload(row);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onEdit(row);
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onComplete(row);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete(row);
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInFromTop {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <div className="relative">
        {/* Botón de menú */}
        <button
          ref={buttonRef}
          onClick={handleMenuClick}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-gray-200 rounded-lg transform hover:scale-110 active:scale-95"
          title="Opciones"
        >
          <MoreVertical size={16} className="text-gray-400 hover:text-gray-600" />
        </button>

        {/* Menú contextual */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
              style={{
                animation: 'slideInFromTop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="py-1">
                {/* Descargar */}
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out 0.1s both'
                  }}
                >
                  <Download size={16} className="mr-3 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">Descargar PDF</span>
                </button>

                {!isCompletado && (
                  <>
                    {/* Separador */}
                    <hr 
                      className="my-1 border-gray-100"
                      style={{
                        animation: 'fadeInUp 0.3s ease-out 0.15s both'
                      }}
                    />
                    
                    {/* Editar */}
                    <ProtectedAction action="edit">
                      <button
                        onClick={handleEdit}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                        style={{
                          animation: 'fadeInUp 0.3s ease-out 0.2s both'
                        }}
                      >
                        <Edit size={16} className="mr-3 text-yellow-500 flex-shrink-0" />
                        <span className="font-medium">Editar registro</span>
                      </button>
                    </ProtectedAction>

                    {/* Separador */}
                    <hr 
                      className="my-1 border-gray-100"
                      style={{
                        animation: 'fadeInUp 0.3s ease-out 0.25s both'
                      }}
                    />

                    {/* Completar */}
                    <ProtectedAction action="edit">
                      <button
                        onClick={handleComplete}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                        style={{
                          animation: 'fadeInUp 0.3s ease-out 0.3s both'
                        }}
                      >
                        <Check size={16} className="mr-3 text-green-500 flex-shrink-0" />
                        <span className="font-medium">Marcar completado</span>
                      </button>
                    </ProtectedAction>
                  </>
                )}

                {/* Separador */}
                <hr 
                  className="my-1 border-gray-100"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out 0.35s both'
                  }}
                />

                {/* Eliminar */}
                <ProtectedAction
                  action="delete"
                  fallback={
                    <button
                      disabled
                      className="w-full px-4 py-3 text-left text-sm text-gray-400 cursor-not-allowed flex items-center opacity-50"
                    >
                      <Trash2 size={16} className="mr-3 flex-shrink-0" />
                      <span className="font-medium">Sin permisos</span>
                    </button>
                  }
                >
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                    style={{
                      animation: 'fadeInUp 0.3s ease-out 0.4s both'
                    }}
                  >
                    <Trash2 size={16} className="mr-3 text-red-500 flex-shrink-0" />
                    <span className="font-medium">Eliminar registro</span>
                  </button>
                </ProtectedAction>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DieselActions;
