// CotizacionesComponent.jsx - Componente principal refactorizado
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Hook personalizado
import { useCotizaciones } from '../../components/Cotizaciones/hook/useCotizaciones';

// Componentes
import SweetAlert from '../../components/UICotizaciones/SweetAlert';
import PageHeader from '../../components/UICotizaciones/PageHeader';
import FiltersBar from '../../components/UICotizaciones/FiltersBar';
import CotizacionCard from '../../components/UICotizaciones/CotizacionCard';
import EmptyState from '../../components/UICotizaciones/EmptyState';
import DetalleView from '../../components/UICotizaciones/DetalleView';

export default function CotizacionesComponent() {
  const navigate = useNavigate();
  
  const {
    // Estados
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    vistaActual,
    cotizacionSeleccionada,
    sweetAlert,
    
    // Datos computados
    filtrosCotizaciones,
    estadoIcons,
    
    // Funciones
    closeSweetAlert,
    eliminarCotizacion,
    verDetalleCotizacion,
    volverALista
  } = useCotizaciones();

  const handleAddTruck = () => navigate('/cotizaciones/CotizacionForm');

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
          <PageHeader />

          {/* Barra de filtros y búsqueda */}
          <FiltersBar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
          />
          
          {/* Grid de cotizaciones */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtrosCotizaciones.map((cotizacion, index) => (
                <CotizacionCard
                  key={cotizacion.id}
                  cotizacion={cotizacion}
                  index={index}
                  estadoIcons={estadoIcons}
                  onVerDetalle={verDetalleCotizacion}
                  onEditar={handleAddTruck}
                  onEliminar={eliminarCotizacion}
                />
              ))}
            </div>

            {/* Mensaje si no hay resultados */}
            {filtrosCotizaciones.length === 0 && <EmptyState />}
          </div>
        </div>
      </div>

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