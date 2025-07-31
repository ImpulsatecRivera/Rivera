// components/FiltersBar.jsx
import React from 'react';
import { Search, Filter } from 'lucide-react';

const FiltersBar = ({ 
  busqueda, 
  setBusqueda, 
  filtroEstado, 
  setFiltroEstado 
}) => {
  return (
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
  );
};

export default FiltersBar;