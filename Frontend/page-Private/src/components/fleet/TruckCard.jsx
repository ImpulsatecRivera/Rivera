// src/components/fleet/TruckCard.jsx

import React from 'react';
import { Wrench, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useFleetMetrics, getHealthConfig } from '../../hooks/useFleetMetrics';

const TruckCard = ({ truck, mantenimientos, onClick }) => {
  const metrics = useFleetMetrics(mantenimientos);
  const healthConfig = getHealthConfig(metrics.healthScore);

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(cantidad);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin registros';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#5F8EAD] group overflow-hidden"
    >
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🚛</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {truck?.licensePlate || 'N/A'}
                </h3>
                <p className="text-xs text-gray-200 font-medium">
                  {truck?.brand || ''} {truck?.model || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Health Indicator */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${healthConfig.bg} ${healthConfig.color} border ${healthConfig.border} backdrop-blur-sm`}>
            {healthConfig.icon}
          </div>
        </div>

        {/* Alertas (si existen) */}
        {metrics.alertas.length > 0 && (
          <div className="mt-3 flex items-start gap-2 bg-yellow-500 bg-opacity-20 backdrop-blur-sm rounded-lg p-2 border border-yellow-400">
            <AlertTriangle size={16} className="text-yellow-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-100 font-semibold">
              {metrics.alertas[0]}
            </p>
          </div>
        )}
      </div>

      {/* Body con métricas */}
      <div className="p-5 space-y-4">
        {/* Grid de métricas principales */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Mantenimientos */}
          <div className="bg-gradient-to-br from-[#5F8EAD] to-[#5F8EAD]/80 rounded-xl p-3 text-white shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={16} className="opacity-80" />
              <span className="text-xs font-semibold opacity-90">Mantenimientos</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalMantenimientos}</p>
          </div>

          {/* Costo Total */}
          <div className="bg-gradient-to-br from-[#5D9646] to-[#5D9646]/80 rounded-xl p-3 text-white shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="opacity-80" />
              <span className="text-xs font-semibold opacity-90">Costo Total</span>
            </div>
            <p className="text-xl font-bold">{formatearMoneda(metrics.costoTotal)}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <Calendar size={14} className="text-[#5F8EAD]" />
              Último servicio
            </span>
            <span className="text-gray-800 font-semibold">
              {formatearFecha(metrics.ultimoMantenimiento?.fecha_mantenimiento)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Costo promedio</span>
            <span className="text-gray-800 font-semibold">
              {formatearMoneda(metrics.costoPromedio)}
            </span>
          </div>

          {metrics.diasPromedioEntreManto > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Frecuencia</span>
              <span className="text-gray-800 font-semibold">
                Cada {metrics.diasPromedioEntreManto} días
              </span>
            </div>
          )}
        </div>

        {/* Footer con tendencia */}
        {metrics.tendenciaCostos !== 'estable' && (
          <div className="pt-3 border-t border-gray-100">
            <div className={`flex items-center gap-2 text-xs font-semibold ${
              metrics.tendenciaCostos === 'incrementando' 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              <span className="text-lg">
                {metrics.tendenciaCostos === 'incrementando' ? '📈' : '📉'}
              </span>
              Costos {metrics.tendenciaCostos}
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center group-hover:text-[#5F8EAD] transition-colors">
            Click para ver historial completo →
          </p>
        </div>
      </div>
    </div>
  );
};

export default TruckCard;