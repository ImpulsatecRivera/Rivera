import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedAction, DisableableButton } from './ProtectedAction';
import { RoleBadge } from './RoleBadge';

/**
 * Componente de ejemplo para demostrar el uso del sistema RBAC
 * Eliminar este archivo una vez que entiendas cómo usar los componentes
 */
export const RBACExample = () => {
  const { 
    userRole, 
    isAdmin, 
    isSupervisor, 
    isOperativo,
    isCoordinador
  } = usePermissions();

  const handleCreate = () => alert('✅ Crear registro');
  const handleEdit = () => alert('✅ Editar registro');
  const handleDelete = () => alert('✅ Eliminar registro');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Sistema RBAC - Ejemplo</h1>
        
        {/* Mostrar rol actual */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600 mb-2">Tu rol actual:</p>
          <RoleBadge className="text-lg" />
        </div>

        {/* Información de permisos */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">Rol</p>
            <p className="font-semibold">{userRole || 'Sin rol'}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">¿Es Admin?</p>
            <p className="font-semibold">{isAdmin ? '✅ Sí' : '❌ No'}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">¿Es Supervisor?</p>
            <p className="font-semibold">{isSupervisor ? '✅ Sí' : '❌ No'}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">¿Es Operativo?</p>
            <p className="font-semibold">{isOperativo ? '✅ Sí' : '❌ No'}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">¿Es Coordinador?</p>
            <p className="font-semibold">{isCoordinador ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>

        <hr className="my-8" />

        {/* Tabla de ejemplo con permisos */}
        <h2 className="text-2xl font-bold mb-4">Ejemplo: Tabla con Acciones Protegidas</h2>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">ID</th>
                <th className="border p-3 text-left">Nombre</th>
                <th className="border p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">001</td>
                <td className="border p-3">Registro Ejemplo</td>
                <td className="border p-3 space-x-2">
                  {/* Botón Ver - siempre visible */}
                  <button 
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => alert('👁️ Ver registro')}
                  >
                    Ver
                  </button>

                  {/* Botón Editar - solo Supervisor y Admin */}
                  <ProtectedAction 
                    action="edit"
                    fallback={<span className="text-gray-400 text-xs">Sin permiso</span>}
                  >
                    <button 
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={handleEdit}
                    >
                      Editar
                    </button>
                  </ProtectedAction>

                  {/* Botón Eliminar - solo Admin */}
                  <ProtectedAction action="delete">
                    <button 
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={handleDelete}
                    >
                      Eliminar
                    </button>
                  </ProtectedAction>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr className="my-8" />

        {/* Botones deshabilitables */}
        <h2 className="text-2xl font-bold mb-4">Botones Deshabilitables</h2>
        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Crear (Operativo, Coordinador, Supervisor, Admin):</p>
            <DisableableButton 
              action="create"
              onClick={handleCreate}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Crear Nuevo
            </DisableableButton>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Editar (Supervisor, Admin):</p>
            <DisableableButton 
              action="edit"
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ✏️ Editar
            </DisableableButton>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Eliminar (Admin only):</p>
            <DisableableButton 
              action="delete"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ Eliminar
            </DisableableButton>
          </div>
        </div>

        <hr className="my-8" />

        {/* Matriz de permisos */}
        <h2 className="text-2xl font-bold mb-4">Matriz de Permisos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-300">
                <th className="border p-2 text-left">Acción</th>
                <th className="border p-2 text-center">Operativo</th>
                <th className="border p-2 text-center">Coordinador</th>
                <th className="border p-2 text-center">Supervisor</th>
                <th className="border p-2 text-center">Admin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">Ver (GET)</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2 font-semibold">Crear (POST)</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Editar (PUT)</td>
                <td className="border p-2 text-center">❌</td>
                <td className="border p-2 text-center">❌</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2 font-semibold">Eliminar (DELETE)</td>
                <td className="border p-2 text-center">❌</td>
                <td className="border p-2 text-center">❌</td>
                <td className="border p-2 text-center">❌</td>
                <td className="border p-2 text-center">✅</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Ver Reportes</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
                <td className="border p-2 text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-700">
            <strong>💡 Tip:</strong> Este componente es solo un ejemplo. 
            Elimínalo una vez que entiendas cómo usar los componentes `usePermissions()`, 
            `&lt;ProtectedAction&gt;` y `&lt;RoleBadge&gt;`.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RBACExample;
