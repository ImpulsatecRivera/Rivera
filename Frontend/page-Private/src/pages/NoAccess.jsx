import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function NoAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
        <Lock size={48} className="mx-auto text-red-500" />
        <h1 className="text-2xl font-bold mt-4">No tienes acceso</h1>
        <p className="mt-2 text-gray-600">No tienes permisos para ver esta sección.</p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
