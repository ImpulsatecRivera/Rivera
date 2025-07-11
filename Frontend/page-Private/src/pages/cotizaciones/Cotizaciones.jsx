import React, { useState } from 'react';
import { Trash2, Edit3, Eye, Calendar, MapPin, User, Filter, Search } from 'lucide-react';

export default function CotizacionesComponent() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const cotizaciones = [
    {
      id: 1,
      cliente: 'Wilfrido Granados',
      destino: 'Morazán, Chalatenango',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-08',
      monto: '$1,250.00',
      tipoViaje: 'Carga pesada'
    },
    {
      id: 2,
      cliente: 'María José Rivera',
      destino: 'San Miguel, Usulután',
      estado: 'Pendiente',
      colorEstado: 'bg-amber-100 text-amber-800 border-amber-200',
      fecha: '2024-07-09',
      monto: '$850.00',
      tipoViaje: 'Mudanza'
    },
    {
      id: 3,
      cliente: 'Carlos Mendoza',
      destino: 'La Unión, Conchagua',
      estado: 'Rechazada',
      colorEstado: 'bg-red-100 text-red-800 border-red-200',
      fecha: '2024-07-07',
      monto: '$2,100.00',
      tipoViaje: 'Materiales'
    },
    {
      id: 4,
      cliente: 'Ana Sofía López',
      destino: 'Santa Ana, Metapán',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-10',
      monto: '$675.00',
      tipoViaje: 'Distribución'
    },
    {
      id: 5,
      cliente: 'Roberto Castillo',
      destino: 'Ahuachapán, Atiquizaya',
      estado: 'En Proceso',
      colorEstado: 'bg-blue-100 text-blue-800 border-blue-200',
      fecha: '2024-07-11',
      monto: '$1,450.00',
      tipoViaje: 'Logística'
    },
    {
      id: 6,
      cliente: 'Elena Ramírez',
      destino: 'Cabañas, Sensuntepeque',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-06',
      monto: '$980.00',
      tipoViaje: 'Transporte'
    }
  ];

  const estadoIcons = {
    'Aprobada': '✓',
    'Pendiente': '⏳',
    'Rechazada': '✗',
    'En Proceso': '🚛'
  };

  const filtrosCotizaciones = cotizaciones.filter(cotizacion => {
    const cumpleFiltro = filtroEstado === 'Todos' || cotizacion.estado === filtroEstado;
    const cumpleBusqueda = cotizacion.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cotizacion.destino.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
        
        {/* Header mejorado */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Gestión de Cotizaciones
            </h1>
            <p className="text-slate-600 text-lg">Administra y supervisa todas las cotizaciones de transporte</p>
          </div>
        </div>

        {/* Barra de filtros y búsqueda */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente o destino..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Rechazada">Rechazadas</option>
              <option value="En Proceso">En Proceso</option>
            </select>
          </div>
        </div>
        
        {/* Grid de cotizaciones mejorado */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrosCotizaciones.map((cotizacion, index) => (
              <div 
                key={cotizacion.id}
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
                  <button className="p-2.5 bg-white/80 backdrop-blur-sm text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                    <Eye size={16} />
                  </button>
                  <button className="p-2.5 bg-white/80 backdrop-blur-sm text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2.5 bg-white/80 backdrop-blur-sm text-red-500 hover:text-white hover:bg-red-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Contenido principal */}
                <div className="relative z-10">
                  
                  {/* Header de la card */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <span className="text-white font-bold text-sm">🚛</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors duration-300">
                          Cotización #{cotizacion.id.toString().padStart(3, '0')}
                        </h3>
                        <p className="text-slate-500 text-sm">{cotizacion.tipoViaje}</p>
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
            ))}
          </div>

          {/* Mensaje si no hay resultados */}
          {filtrosCotizaciones.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No se encontraron cotizaciones</h3>
              <p className="text-slate-500">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}