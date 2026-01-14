// CotizacionesComponent.jsx - CORREGIDO con eliminación funcional
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook personalizado
import useCotizaciones from '../../components/Cotizaciones/hook/useCotizaciones';

// Componentes
import SweetAlert from '../../components/UICotizaciones/SweetAlert';
import PageHeader from '../../components/UICotizaciones/PageHeader';
import FiltersBar from '../../components/UICotizaciones/FiltersBar';
import CotizacionCard from '../../components/UICotizaciones/CotizacionCard';
import EmptyState from '../../components/UICotizaciones/EmptyState';
import DetalleView from '../../components/UICotizaciones/DetalleView';
import EditCotizacionModal from './EditCotiza';

export default function CotizacionesComponent() {
  const navigate = useNavigate();
  
  // ✅ Estado para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [cotizacionAEditar, setCotizacionAEditar] = useState(null);
  
  const {
    // Estados
    cotizaciones,
    cotizacionSeleccionada,
    vistaActual,
    loading,
    error,
    filtroEstado,
    busqueda,
    sweetAlert,
    
    // Datos computados
    estadoIcons,
    stats,
    
    // Acciones CRUD
    eliminarCotizacionConAPI, // ✅ Esta función ya maneja confirmación
    actualizarCotizacionAPI,
    refreshCotizaciones,
    
    // Acciones de UI
    verDetalleCotizacion,
    volverALista,
    closeSweetAlert,
    showSweetAlert,
    
    // Setters
    setFiltroEstado,
    setBusqueda,
    setVistaActual,
    setCotizacionSeleccionada
  } = useCotizaciones();

  // ✅ Función para abrir modal de edición
  const handleEditarCotizacion = (cotizacion) => {
    console.log('📝 Abriendo modal para editar:', cotizacion);
    setCotizacionAEditar(cotizacion);
    setShowEditModal(true);
  };

  // ✅ Función para cerrar modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCotizacionAEditar(null);
  };

  // ✅ Función para guardar cambios usando la función del hook
  const handleSaveCotizacion = async (id, datosActualizados) => {
    try {
      console.log('💾 Guardando cotización:', { id, datos: datosActualizados });
      
      // Usar la función del hook para actualizar
      const resultado = await actualizarCotizacionAPI(id, datosActualizados);
      
      if (resultado.success) {
        // Cerrar modal
        handleCloseEditModal();
        
        // Refrescar datos
        await refreshCotizaciones();
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          showSweetAlert({
            title: '¡Actualizado!',
            text: 'La cotización ha sido actualizada correctamente.',
            type: 'success',
            onConfirm: closeSweetAlert
          });
        }, 300);
      } else {
        // Mostrar error
        throw new Error(resultado.message);
      }
      
    } catch (error) {
      console.error('❌ Error al guardar cotización:', error);
      // Re-lanzar para que el modal lo maneje
      throw error;
    }
  };

  // ✅ Función mejorada para eliminar con mejor manejo
  const handleEliminarCotizacion = (cotizacion) => {
    console.log('🗑️ Intentando eliminar cotización:', cotizacion);
    
    // Verificar que la cotización tenga ID
    if (!cotizacion.id && !cotizacion._id) {
      showSweetAlert({
        title: 'Error',
        text: 'No se puede eliminar: cotización sin ID válido',
        type: 'error',
        onConfirm: closeSweetAlert
      });
      return;
    }
    
    // Llamar a la función del hook que ya tiene la confirmación
    eliminarCotizacionConAPI(cotizacion);
  };

  // Vista de detalle
  if (vistaActual === 'detalle' && cotizacionSeleccionada) {
    return (
      <DetalleView 
        cotizacion={cotizacionSeleccionada} 
        onVolver={volverALista} 
      />
    );
  }

  // Vista principal de lista
  return (
    <>
      <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
          
          {/* Header */}
          <PageHeader onRecargar={refreshCotizaciones} />

          {/* Barra de filtros y búsqueda */}
          <FiltersBar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            loading={loading}
          />
          
          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorState 
                error={error} 
                onRecargar={refreshCotizaciones} 
              />
            ) : (
              <>
                {/* Grid de cotizaciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cotizaciones.map((cotizacion, index) => (
                    <CotizacionCard
                      key={cotizacion.id || cotizacion._id || index}
                      cotizacion={cotizacion}
                      index={index}
                      estadoIcons={estadoIcons}
                      onVerDetalle={verDetalleCotizacion}
                      onEditar={() => handleEditarCotizacion(cotizacion)}
                      onEliminar={() => handleEliminarCotizacion(cotizacion)} // ✅ Usar función wrapper
                    />
                  ))}
                </div>

                {/* Mensaje si no hay resultados */}
                {cotizaciones.length === 0 && <EmptyState />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL DE EDICIÓN */}
      <EditCotizacionModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        cotizacion={cotizacionAEditar}
        onSave={handleSaveCotizacion}
      />

      {/* SweetAlert Component */}
      <SweetAlert
        isOpen={sweetAlert.isOpen}
        title={sweetAlert.title}
        text={sweetAlert.text}
        type={sweetAlert.type}
        onClose={closeSweetAlert}
        onConfirm={sweetAlert.onConfirm}
      />
    </>
  );
}

// Componente para mostrar errores
const ErrorState = ({ error, onRecargar }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Error al cargar cotizaciones
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">{error}</p>
    <button
      onClick={onRecargar}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      🔄 Intentar de nuevo
    </button>
  </div>
);

// Componente LoadingSpinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">Cargando cotizaciones...</p>
  </div>
);