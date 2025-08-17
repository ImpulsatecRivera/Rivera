import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, MoreHorizontal } from 'lucide-react';

const ContextMenu = ({ trip, index, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Cerrar menú cuando se hace clic fuera
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
    console.log('🎯 Menú contextual clickeado para viaje:', trip.type);
    setIsOpen(!isOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log('🖊️ Opción EDITAR seleccionada para:', trip.type);
    setIsOpen(false);
    // Llamar la función onEdit que activará el ActionModal
    onEdit(trip, index);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    console.log('🗑️ Opción ELIMINAR seleccionada para:', trip.type);
    setIsOpen(false);
    // Llamar la función onDelete que activará el ActionModal
    onDelete(trip, index);
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
        {/* Botón de menú - Siempre visible en hover */}
        <button
          ref={buttonRef}
          onClick={handleMenuClick}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-gray-200 rounded-lg transform hover:scale-110 active:scale-95"
          title="Opciones del viaje"
        >
          <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
        </button>

        {/* Menú contextual */}
        {isOpen && (
          <>
            {/* Overlay para capturar clics fuera */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menú con estilos completos */}
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
              style={{
                animation: 'slideInFromTop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="py-1">
                {/* Opción Editar con icono y estilos completos */}
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out 0.1s both'
                  }}
                >
                  <Edit3 size={16} className="mr-3 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">Editar viaje</span>
                </button>
                
                {/* Separador */}
                <hr 
                  className="my-1 border-gray-100"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out 0.15s both'
                  }}
                />
                
                {/* Opción Eliminar con icono y estilos completos */}
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center transition-all duration-200 transform hover:scale-[1.02] border-none bg-transparent cursor-pointer"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out 0.2s both'
                  }}
                >
                  <Trash2 size={16} className="mr-3 text-red-500 flex-shrink-0" />
                  <span className="font-medium">Eliminar viaje</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContextMenu;