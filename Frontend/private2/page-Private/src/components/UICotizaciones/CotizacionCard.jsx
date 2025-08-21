// components/CotizacionCard.jsx
import React from 'react';
import { Trash2, Edit3, Eye, Calendar, MapPin, User, Truck } from 'lucide-react';

const CotizacionCard = ({ 
  cotizacion, 
  index, 
  estadoIcons, 
  onVerDetalle, 
  onEditar, 
  onEliminar 
}) => {
  // Icono del camión
  const CotizacionIcon = () => (
    <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
      <Truck size={16} className="text-orange-500" />
    </div>
  );

  return (
    <div 
      className="group relative bg-white border border-slate-200/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Gradiente de fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Efectos de luz */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      {/* Botones de acción flotantes */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 delay-150 z-20">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalle(cotizacion);
          }}
          className="p-2.5 bg-white/80 backdrop-blur-sm text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEditar();
          }}
          className="p-2.5 bg-white/80 backdrop-blur-sm text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
        >
          <Edit3 size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEliminar(cotizacion);
          }}
          className="p-2.5 bg-white/80 backdrop-blur-sm text-red-500 hover:text-white hover:bg-red-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        
        {/* Header de la card */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <CotizacionIcon />
            </div>
            <div>
              {/* CORREGIDO: Mostrar quoteName en lugar del ID */}
              <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors duration-300">
                {cotizacion.quoteName || 'Sin nombre'}
              </h3>
              {/* AGREGADO: Mostrar número de cotización como subtítulo */}
              <p className="text-slate-500 text-sm">{cotizacion.numeroDetizacion}</p>
            </div>
          </div>
        </div>
        
        {/* Información del cliente */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Cliente</p>
              <p className="font-semibold text-slate-800">{cotizacion.cliente}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Destino</p>
              <p className="font-semibold text-slate-800 text-sm">{cotizacion.destino}</p>
            </div>
          </div>
        </div>

        {/* Footer con fecha y estado */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-sm text-slate-600">{cotizacion.fecha}</span>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${cotizacion.colorEstado} group-hover:scale-110 transition-transform duration-300 flex items-center gap-2`}>
            <span>{estadoIcons[cotizacion.estado]}</span>
            <span>{cotizacion.estado}</span>
          </div>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 transform scale-0 group-hover:scale-100 transition-all duration-500 delay-200 group-hover:animate-pulse"></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-80 transform scale-0 group-hover:scale-100 transition-all duration-700 delay-300 group-hover:animate-pulse"></div>
      
      {/* Brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
    </div>
  );
};

export default CotizacionCard;