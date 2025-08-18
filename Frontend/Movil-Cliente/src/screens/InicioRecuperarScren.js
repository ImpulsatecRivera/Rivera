import React from 'react';
import { ChevronLeft, Clock } from 'lucide-react';

const PasswordRecoveryScreen = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col max-w-sm mx-auto">
      {/* Header con flecha de regreso */}
      <div className="flex items-center p-4 pt-12">
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 px-6 py-4">
        {/* Título principal */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
          Bienvenido al recuperar contraseña
        </h1>

        {/* Subtítulo explicativo */}
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          No te preocupes, puede pasar. Introduce tu número de teléfono y te enviaremos la contraseña de un solo uso.
        </p>

        {/* Sección de opciones */}
        <div className="mb-8">
          <h2 className="text-gray-900 font-medium mb-4">
            Como quieres recuperar tu cuenta
          </h2>

          {/* Opción Actualizar contraseña */}
          <div className="mb-4">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-lg flex items-center justify-between transition-colors">
              <div className="flex flex-col items-start">
                <span className="font-medium">Actualizar contraseña</span>
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1 opacity-80" />
                  <span className="text-xs opacity-80">22h 55m 20s actualización</span>
                </div>
              </div>
              <span className="text-sm border border-white/30 px-2 py-1 rounded">
                Continuar →
              </span>
            </button>
          </div>

          {/* Opción Código de verificación */}
          <div className="mb-4">
            <button className="w-full bg-gray-400 hover:bg-gray-500 text-white py-4 px-4 rounded-lg flex items-center justify-between transition-colors">
              <div className="flex flex-col items-start">
                <span className="font-medium">Código de verificación</span>
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1 opacity-80" />
                  <span className="text-xs opacity-80">22h 55m 20s actualización</span>
                </div>
              </div>
              <span className="text-sm border border-white/30 px-2 py-1 rounded">
                Continuar →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-gray-400 text-sm">
          Rivera distribuidora y<br />
          transporte || 2025
        </p>
      </div>
    </div>
  );
};

export default PasswordRecoveryScreen;