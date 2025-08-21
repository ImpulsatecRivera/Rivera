// components/DetalleHeader.jsx
import React from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const DetalleHeader = ({ cotizacion, onVolver }) => {
  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'Aprobada': return <CheckCircle className="text-emerald-600" size={24} />;
      case 'Pendiente': return <Clock className="text-amber-600" size={24} />;
      case 'Rechazada': return <XCircle className="text-red-600" size={24} />;
      case 'En Proceso': return <AlertCircle className="text-blue-600" size={24} />;
      default: return <Clock className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onVolver}
          className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-300 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </button>
        <div>
          {/* CORREGIDO: Mostrar quoteName en lugar del ID */}
          <h1 className="text-3xl font-bold text-slate-800">
            {cotizacion.quoteName || 'Sin nombre de cotización'}
          </h1>
          <p className="text-slate-600">{cotizacion.tipoViaje}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`px-6 py-3 rounded-2xl font-semibold border ${cotizacion.colorEstado} flex items-center gap-3`}>
          {getEstadoIcon(cotizacion.estado)}
          <span className="text-lg">{cotizacion.estado}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-800">{cotizacion.monto}</p>
          <p className="text-slate-500">Valor total</p>
        </div>
      </div>
    </div>
  );
};

export default DetalleHeader;