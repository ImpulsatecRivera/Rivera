import React, { useState } from 'react';
import { Package, Truck, Wrench, Calendar, DollarSign, AlertCircle, Plus, MousePointer2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';

const EmptyStatesShowcase = () => {
  const [activeTab, setActiveTab] = useState('ventas');

  const tabs = [
    { id: 'ventas', label: 'Ventas', icon: DollarSign },
    { id: 'viajes', label: 'Viajes', icon: Truck },
    { id: 'planillas', label: 'Planillas', icon: Package },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench }
  ];

  // Empty State para Relatório de Vendas
  const EmptyVentas = () => (
    <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl min-h-[600px] relative overflow-hidden">
      {/* Spline 3D INTERACTIVO como fondo */}
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
        <Spline 
          scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        />
      </div>
      
      {/* Overlay oscuro para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-indigo-900/30 to-transparent pointer-events-none"></div>
      
      {/* Indicador de interactividad */}
      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 pointer-events-none z-20">
        <div className="flex items-center gap-2 text-white text-sm">
          <MousePointer2 size={16} />
          <span>Arrastra para rotar</span>
        </div>
      </div>
      
      {/* Content Overlay - SIN bloquear mouse */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20">
          <DollarSign size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          No hay ventas registradas
        </h2>
        <p className="text-white text-lg mb-8 max-w-md drop-shadow">
          Comienza a registrar tus primeras ventas y visualiza el crecimiento de tu negocio en tiempo real
        </p>
        
        {/* Botón CON pointer-events para que sea clickeable */}
        <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Plus size={20} />
          Registrar Primera Venta
        </button>
      </div>
    </div>
  );

  // Empty State para Viajes Operativos
  const EmptyViajes = () => (
    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 rounded-3xl shadow-2xl min-h-[600px] relative overflow-hidden">
      {/* Spline 3D INTERACTIVO */}
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
        <Spline 
          scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-900/30 to-transparent pointer-events-none"></div>
      
      {/* Indicador de interactividad */}
      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 pointer-events-none z-20">
        <div className="flex items-center gap-2 text-white text-sm">
          <MousePointer2 size={16} />
          <span>Interactúa con el camión</span>
        </div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20">
          <Truck size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          No hay viajes programados
        </h2>
        <p className="text-white text-lg mb-8 max-w-md drop-shadow">
          Tu flota está lista. Programa el primer viaje y comienza a optimizar tus rutas
        </p>
        
        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Plus size={20} />
          Programar Primer Viaje
        </button>
      </div>
    </div>
  );

  // Empty State para Planillas
  const EmptyPlanillas = () => (
    <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl min-h-[600px] relative overflow-hidden">
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
        <Spline 
          scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/30 to-transparent pointer-events-none"></div>
      
      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 pointer-events-none z-20">
        <div className="flex items-center gap-2 text-white text-sm">
          <MousePointer2 size={16} />
          <span>Rota el modelo 3D</span>
        </div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20">
          <Package size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          Gestión de planillas vacía
        </h2>
        <p className="text-white text-lg mb-8 max-w-md drop-shadow">
          Crea tu primera planilla para gestionar los pagos y nómina de tu equipo
        </p>
        
        <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Plus size={20} />
          Crear Primera Planilla
        </button>
      </div>
    </div>
  );

  // Empty State para Mantenimiento
  const EmptyMantenimiento = () => (
    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 rounded-3xl shadow-2xl min-h-[600px] relative overflow-hidden">
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
        <Spline 
          scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-orange-900/30 to-transparent pointer-events-none"></div>
      
      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 pointer-events-none z-20">
        <div className="flex items-center gap-2 text-white text-sm">
          <MousePointer2 size={16} />
          <span>Explora el camión 3D</span>
        </div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20">
          <Wrench size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          Sin registros de mantenimiento
        </h2>
        <p className="text-white text-lg mb-8 max-w-md drop-shadow">
          Mantén tu flota en óptimas condiciones. Registra el primer mantenimiento preventivo
        </p>
        
        <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Plus size={20} />
          Agregar Mantenimiento
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    switch(activeTab) {
      case 'ventas': return <EmptyVentas />;
      case 'viajes': return <EmptyViajes />;
      case 'planillas': return <EmptyPlanillas />;
      case 'mantenimiento': return <EmptyMantenimiento />;
      default: return <EmptyVentas />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Estados Vacíos con Spline 3D Interactivo
        </h1>
        <p className="text-gray-600">
          Camión 3D completamente interactivo - puedes rotarlo, hacer zoom y explorar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white p-2 rounded-xl shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {renderEmptyState()}

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <AlertCircle className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              ✨ Características del Spline 3D Interactivo
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>🖱️ <strong>Rotación libre:</strong> Arrastra con el mouse para rotar el camión 360°</li>
              <li>🔍 <strong>Zoom:</strong> Usa la rueda del mouse para acercar/alejar</li>
              <li>👆 <strong>Interacción táctil:</strong> Funciona perfectamente en dispositivos móviles</li>
              <li>⚡ <strong>Rendimiento optimizado:</strong> Solo se carga cuando la sección está vacía</li>
              <li>🎨 <strong>Integración visual:</strong> Se adapta a cada sección con colores diferentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Note */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h3 className="font-semibold text-purple-900 mb-3">
          💡 Cuándo mostrar estos estados:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
          <div className="bg-white/50 rounded-lg p-4">
            <strong className="block mb-2">✅ Ventas:</strong>
            Cuando <code className="bg-purple-100 px-2 py-1 rounded">sales.length === 0</code>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <strong className="block mb-2">✅ Viajes:</strong>
            Cuando <code className="bg-purple-100 px-2 py-1 rounded">trips.length === 0</code>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <strong className="block mb-2">✅ Planillas:</strong>
            Cuando <code className="bg-purple-100 px-2 py-1 rounded">payrolls.length === 0</code>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <strong className="block mb-2">✅ Mantenimiento:</strong>
            Cuando <code className="bg-purple-100 px-2 py-1 rounded">maintenance.length === 0</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStatesShowcase;