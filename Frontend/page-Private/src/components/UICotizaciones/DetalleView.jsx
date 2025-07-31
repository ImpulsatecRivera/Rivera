// components/DetalleView.jsx
import React from 'react';
import DetalleHeader from '../UICotizaciones/DetalleHeader';
import ClienteInfoCard from '../UICotizaciones/ClienteInfoCard';
import EnvioInfoCard from '../UICotizaciones/EnvioInfoCard';
import RutasInfoCard from '../UICotizaciones/RutasInfoCard';
import FinancieraInfoCard from '../UICotizaciones/FinancieraInfoCard';
import FechasInfoCard from '../UICotizaciones/FechasInfoCard';
import TransporteInfoCard from '../UICotizaciones/TransporteInfoCard';

const DetalleView = ({ cotizacion, onVolver }) => {
  return (
    <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
        
        {/* Header de detalle */}
        <DetalleHeader cotizacion={cotizacion} onVolver={onVolver} />

        {/* Contenido principal en scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Información del cliente */}
            <ClienteInfoCard cotizacion={cotizacion} />

            {/* Detalles del envío */}
            <EnvioInfoCard cotizacion={cotizacion} />

            {/* Rutas y direcciones */}
            <RutasInfoCard cotizacion={cotizacion} />

            {/* Información financiera */}
            <FinancieraInfoCard cotizacion={cotizacion} />

            {/* Fechas importantes */}
            <FechasInfoCard cotizacion={cotizacion} />

            {/* Información del conductor */}
            <TransporteInfoCard cotizacion={cotizacion} />
          </div>

          {/* Descripción completa */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Descripción del Servicio</h2>
            <p className="text-slate-700 leading-relaxed text-lg">{cotizacion.descripcion}</p>
          </div>

          {/* Observaciones */}
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Observaciones</h2>
            <p className="text-slate-700 leading-relaxed">{cotizacion.observaciones}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleView;