import React from 'react';
import { ChevronLeft, Clock } from 'lucide-react';

const PasswordRecoveryScreen = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col w-full">
      {/* Header con flecha de regreso */}
      <div className="flex items-center p-4 pt-12 lg:pt-16">
        <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
      </div>

      {/* Contenedor principal centrado */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          
          {/* Contenido principal */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            
            {/* Título principal */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight text-center">
              Bienvenido al recuperar contraseña
            </h1>

            {/* Subtítulo explicativo */}
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed text-center px-2">
              No te preocupes, puede pasar. Introduce tu número de teléfono y te enviaremos la contraseña de un solo uso.
            </p>

            {/* Sección de opciones */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-gray-900 font-medium mb-4 sm:mb-6 text-center text-sm sm:text-base">
                Como quieres recuperar tu cuenta
              </h2>

              {/* Opción Actualizar contraseña */}
              <div className="mb-3 sm:mb-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-lg flex items-center justify-between transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium text-sm sm:text-base">Actualizar contraseña</span>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1 opacity-80" />
                      <span className="text-xs sm:text-sm opacity-80">22h 55m 20s actualización</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm border border-white/30 px-2 py-1 rounded ml-2 whitespace-nowrap">
                    Continuar →
                  </span>
                </button>
              </div>

              {/* Opción Código de verificación */}
              <div className="mb-4 sm:mb-6">
                <button className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 sm:py-4 px-4 rounded-lg flex items-center justify-between transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium text-sm sm:text-base">Código de verificación</span>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1 opacity-80" />
                      <span className="text-xs sm:text-sm opacity-80">22h 55m 20s actualización</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm border border-white/30 px-2 py-1 rounded ml-2 whitespace-nowrap">
                    Continuar →
                  </span>
                </button>
              </div>
            </div>

            {/* Indicador de progreso opcional */}
            <div className="flex justify-center items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 text-center">
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Rivera distribuidora y<br />
          transporte || 2025
        </p>
      </div>
    </div>
  );
};

export default PasswordRecoveryScreen;