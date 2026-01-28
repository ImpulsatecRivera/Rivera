// src/components/fleet/TruckDetailDrawer.jsx

import React, { useState } from 'react';
import { X, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useFleetMetrics, getHealthConfig } from '../../hooks/useFleetMetrics';
import MaintenanceTimeline from './MaintenanceTimeline';

const TruckDetailDrawer = ({ isOpen, onClose, truckData }) => {
  const [activeTab, setActiveTab] = useState('historial');

  // ⚠️ HOOKS ANTES DEL RETURN CONDICIONAL
  const { truck, mantenimientos } = truckData || { truck: null, mantenimientos: [] };
  const metrics = useFleetMetrics(mantenimientos);
  const healthConfig = getHealthConfig(metrics.healthScore);

  // ✅ AHORA SÍ PUEDES HACER RETURNS CONDICIONALES
  if (!isOpen || !truckData) return null;

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(cantidad);
  };

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'historial', label: 'Historial', icon: Calendar },
    { id: 'estadisticas', label: 'Estadísticas', icon: TrendingUp }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[60%] xl:w-[50%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-3xl">🚛</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {truck?.licensePlate || 'N/A'}
                  </h2>
                  <p className="text-gray-200 font-medium">
                    {truck?.brand || ''} {truck?.model || ''} {truck?.year || ''}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-opacity-80 text-xs font-semibold mb-1">Mantenimientos</p>
                <p className="text-white text-2xl font-bold">{metrics.totalMantenimientos}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-opacity-80 text-xs font-semibold mb-1">Inversión Total</p>
                <p className="text-white text-xl font-bold">{formatearMoneda(metrics.costoTotal)}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-opacity-80 text-xs font-semibold mb-1">Estado</p>
                <p className="text-white text-lg font-bold">{healthConfig.icon}</p>
              </div>
            </div>

            {/* Alertas */}
            {metrics.alertas.length > 0 && (
              <div className="mt-4 space-y-2">
                {metrics.alertas.slice(0, 2).map((alerta, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 bg-yellow-500 bg-opacity-30 backdrop-blur-sm rounded-lg p-3 border border-yellow-400"
                  >
                    <AlertCircle size={18} className="text-yellow-200 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-100 text-sm font-semibold">{alerta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 font-semibold text-sm transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#5F8EAD] text-[#5F8EAD] bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'historial' && (
              <HistorialTab 
                mantenimientos={mantenimientos}
                metrics={metrics}
                formatearFechaCompleta={formatearFechaCompleta}
              />
            )}

            {activeTab === 'estadisticas' && (
              <EstadisticasTab 
                metrics={metrics}
                mantenimientos={mantenimientos}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== TAB: HISTORIAL ====================
const HistorialTab = ({ mantenimientos, metrics, formatearFechaCompleta }) => {
  return (
    <div className="space-y-6">
      {/* Métricas Rápidas */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#5F8EAD]" size={20} />
          Métricas Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Días sin Servicio</p>
            <p className="text-2xl font-bold text-[#34353A]">
              {metrics.diasDesdeUltimoManto !== null ? `${metrics.diasDesdeUltimoManto} días` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Tiempo Promedio</p>
            <p className="text-2xl font-bold text-[#34353A]">
              {metrics.diasPromedioEntreManto > 0 
                ? `${metrics.diasPromedioEntreManto} días` 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Último Servicio</p>
            <p className="text-sm font-bold text-[#34353A]">
              {formatearFechaCompleta(metrics.ultimoMantenimiento?.fecha_mantenimiento)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Costo Promedio</p>
            <p className="text-2xl font-bold text-[#34353A]">
              {new Intl.NumberFormat('es-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(metrics.costoPromedio)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-[#5F8EAD]" size={20} />
          Timeline de Mantenimientos
        </h3>
        <MaintenanceTimeline mantenimientos={mantenimientos} />
      </div>
    </div>
  );
};

// ==================== TAB: ESTADÍSTICAS ====================
const EstadisticasTab = ({ metrics, mantenimientos }) => {
  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(cantidad);
  };

  const tipoLabels = {
    'preventivo': 'Preventivo',
    'correctivo': 'Correctivo',
    'llantas': 'Llantas',
    'rines': 'Rines',
    'furgo': 'Furgón',
    'madera_furgo': 'Madera de Furgón',
    'torno': 'Torno',
    'bomba': 'Bomba',
    'reparacion_turbo': 'Reparación del Turbo',
    'otros': 'Otros'
  };

  return (
    <div className="space-y-6">
      {/* Distribución por Tipo */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución por Tipo</h3>
        <div className="space-y-3">
          {Object.entries(metrics.mantenimientosPorTipo).map(([tipo, cantidad]) => {
            const porcentaje = (cantidad / metrics.totalMantenimientos * 100).toFixed(1);
            return (
              <div key={tipo}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {tipoLabels[tipo] || tipo}
                  </span>
                  <span className="text-sm font-bold text-[#5F8EAD]">
                    {cantidad} ({porcentaje}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#5F8EAD] to-[#34353A] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tendencia de Costos */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tendencia de Costos</h3>
        <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <span className="text-5xl">
            {metrics.tendenciaCostos === 'incrementando' ? '📈' : 
             metrics.tendenciaCostos === 'disminuyendo' ? '📉' : '➡️'}
          </span>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Estado</p>
            <p className={`text-2xl font-bold ${
              metrics.tendenciaCostos === 'incrementando' ? 'text-red-600' :
              metrics.tendenciaCostos === 'disminuyendo' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {metrics.tendenciaCostos === 'incrementando' ? 'Costos Incrementando' :
               metrics.tendenciaCostos === 'disminuyendo' ? 'Costos Disminuyendo' :
               'Costos Estables'}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Costos */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Costos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-semibold">Costo Total</span>
            <span className="text-2xl font-bold text-[#34353A]">
              {formatearMoneda(metrics.costoTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-semibold">Costo Promedio</span>
            <span className="text-xl font-bold text-[#5F8EAD]">
              {formatearMoneda(metrics.costoPromedio)}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-semibold">Total de Servicios</span>
            <span className="text-xl font-bold text-[#5D9646]">
              {metrics.totalMantenimientos}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckDetailDrawer;