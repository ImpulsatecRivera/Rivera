// FormsTravels/EditTripModal.jsx - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { ArrowLeft, Truck, User, Calendar, Clock, AlertCircle, X, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = config.api.API_URL;

// 🎉 FUNCIÓN PARA MOSTRAR ALERTA DE ÉXITO
const showUpdateSuccessAlert = (onConfirm) => {
  Swal.fire({
    title: '¡Viaje actualizado con éxito!',
    text: 'Los cambios han sido guardados correctamente',
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#10B981', // Verde
    allowOutsideClick: false,
    customClass: {
      popup: 'animated bounceIn'
    }
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

const EditTripModal = ({ 
  show, 
  isClosing, 
  onClose, 
  onConfirm, // ✅ CAMBIADO DE onUpdate A onConfirm
  editForm, 
  onInputChange,
  refreshTravels
}) => {
  const [camiones, setCamiones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false); // ✅ Nuevo estado para el botón

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (show) {
      cargarRecursos();
    }
  }, [show]);

  const cargarRecursos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando recursos para edición...');

      // Función para cargar datos
      const cargarDatos = async (url, nombre) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Extraer array de datos según diferentes formatos posibles
          if (data.data && Array.isArray(data.data)) {
            return data.data;
          } else if (Array.isArray(data)) {
            return data;
          } else if (data.camiones && Array.isArray(data.camiones)) {
            return data.camiones;
          } else if (data.motoristas && Array.isArray(data.motoristas)) {
            return data.motoristas;
          } else {
            return [];
          }
        } catch (error) {
          console.error(`❌ Error cargando ${nombre}:`, error);
          throw error;
        }
      };

      // Cargar solo camiones y conductores
      const [camionesData, conductoresData] = await Promise.allSettled([
        cargarDatos(`${API_URL}/camiones`, 'Camiones'),
        cargarDatos(`${API_URL}/motoristas`, 'Motoristas')
      ]);

      // Procesar camiones - Filtrar los que están en mantenimiento
      if (camionesData.status === 'fulfilled') {
        const camionesDisponibles = camionesData.value.filter((c) => {
          const estado = String(c.state || c.estado || "").toUpperCase().replace(/\s+/g, "_");
          return estado !== "MANTENIMIENTO" && estado !== "EN_MANTENIMIENTO" && estado !== "NO_DISPONIBLE";
        });
        setCamiones(camionesDisponibles);
        console.log(`✅ Camiones disponibles: ${camionesDisponibles.length} de ${camionesData.value.length}`);
      } else {
        setCamiones([]);
      }

      // Procesar conductores
      if (conductoresData.status === 'fulfilled') {
        setConductores(conductoresData.value);
        console.log(`✅ Conductores cargados: ${conductoresData.value.length}`);
      } else {
        setConductores([]);
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      setError(`Error cargando recursos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚨 FUNCIÓN PRINCIPAL CORREGIDA PARA ACTUALIZAR VIAJE
  const handleUpdateViaje = async () => {
    // Validaciones básicas
    if (!editForm.tripDescription || !editForm.truckId || !editForm.conductorId || !editForm.departureTime || !editForm.arrivalTime) {
      Swal.fire({
        title: '¡Campos incompletos!',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setIsUpdating(true); // ✅ Mostrar loading en el botón
    
    try {
      console.log('🔄 Iniciando actualización de viaje desde modal...');
      console.log('📝 Datos del formulario:', editForm);
      
      // ✅ LLAMAR DIRECTAMENTE A LA FUNCIÓN QUE ACTUALIZA (onConfirm)
      await onConfirm();
      
      console.log('✅ Actualización completada desde modal');
      
      // 🎉 MOSTRAR ALERTA DE ÉXITO
      showUpdateSuccessAlert(async () => {
        console.log('🔄 Refrescando datos después de actualizar viaje...');
        
        try {
          if (refreshTravels) {
            await refreshTravels();
            console.log('✅ Datos refrescados exitosamente');
          }
          
          // Cerrar modal con delay
          setTimeout(() => {
            console.log('🚪 Cerrando modal...');
            onClose();
          }, 300);
          
        } catch (error) {
          console.error('❌ Error refrescando datos:', error);
          onClose();
        }
      });
      
    } catch (error) {
      console.error('❌ Error actualizando viaje desde modal:', error);
      
      Swal.fire({
        title: '¡Error al actualizar viaje!',
        text: error.message || 'Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#EF4444',
        customClass: {
          popup: 'animated shakeX'
        }
      });
    } finally {
      setIsUpdating(false); // ✅ Ocultar loading del botón
    }
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out ${
          isClosing 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            disabled={isUpdating}
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 animate-fade-in-up flex items-center">
            <Edit className="mr-3" size={32} />
            Editar Viaje
          </h2>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            disabled={isUpdating}
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-blue-600 mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Cargando recursos...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 text-red-600" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error de conexión</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button 
                  onClick={cargarRecursos}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  disabled={loading || isUpdating}
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* 📝 DESCRIPCIÓN DEL VIAJE */}
          <div className="bg-blue-50 p-6 rounded-xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Edit className="mr-2" size={20} />
              Descripción del Viaje
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del viaje *
              </label>
              <textarea
                value={editForm.tripDescription || ''}
                onChange={(e) => onInputChange('tripDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                placeholder="Descripción detallada del viaje"
                rows={4}
                required
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* 🚛 RECURSOS ASIGNADOS */}
          <div className="bg-purple-50 p-6 rounded-xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="mr-2" size={20} />
              Recursos Asignados
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camión *
                </label>
                <select
                  value={editForm.truckId || ''}
                  onChange={(e) => onInputChange('truckId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                  required
                  disabled={loading || isUpdating}
                >
                  <option value="">Seleccionar camión</option>
                  {camiones.map((camion) => (
                    <option key={camion._id} value={camion._id}>
                      🚛 {camion.brand || camion.marca} {camion.model || camion.modelo} - {camion.licensePlate || camion.placa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductor *
                </label>
                <select
                  value={editForm.conductorId || ''}
                  onChange={(e) => onInputChange('conductorId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                  required
                  disabled={loading || isUpdating}
                >
                  <option value="">Seleccionar conductor</option>
                  {conductores.map((conductor) => (
                    <option key={conductor._id} value={conductor._id}>
                      👤 {conductor.name || conductor.nombre} - {conductor.phone || conductor.telefono}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auxiliar */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auxiliar (Opcional)
                </label>
                <select
                  value={editForm.auxiliarId || ''}
                  onChange={(e) => onInputChange('auxiliarId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                  disabled={loading || isUpdating}
                >
                  <option value="">Sin auxiliar asignado</option>
                  {conductores.map((conductor) => (
                    <option key={conductor._id} value={conductor._id}>
                      👥 {conductor.name || conductor.nombre} - {conductor.phone || conductor.telefono}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ⏰ HORARIOS */}
          <div className="bg-green-50 p-6 rounded-xl animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="mr-2" size={20} />
              Horarios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de salida *
                </label>
                <input
                  type="datetime-local"
                  value={editForm.departureTime || ''}
                  onChange={(e) => onInputChange('departureTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora de llegada estimada *
                </label>
                <input
                  type="datetime-local"
                  value={editForm.arrivalTime || ''}
                  onChange={(e) => onInputChange('arrivalTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                  required
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* 📝 OBSERVACIONES */}
          <div className="bg-orange-50 p-6 rounded-xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="mr-2" size={20} />
              Observaciones
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones adicionales
              </label>
              <textarea
                value={editForm.observaciones || ''}
                onChange={(e) => onInputChange('observaciones', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 focus:scale-105 transition-all duration-200"
                placeholder="Observaciones importantes del viaje, cambios de planes, instrucciones especiales..."
                rows={3}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center space-x-4 pt-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <button 
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              ❌ Cancelar
            </button>
            <button 
              type="button"
              onClick={handleUpdateViaje}
              disabled={loading || isUpdating || !editForm.tripDescription || !editForm.truckId || !editForm.conductorId || !editForm.departureTime || !editForm.arrivalTime}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-semibold flex items-center transition-all duration-200 hover:scale-105 active:scale-95 transform hover:shadow-green-300"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                '✏️ Actualizar Viaje'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTripModal;