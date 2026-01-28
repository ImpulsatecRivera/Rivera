// src/pages/FleetDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Search, Loader2, TrendingUp, DollarSign, Wrench, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../Context/authContext";
import { useGroupByTruck } from '../../hooks/useFleetMetrics';
import TruckCard from '../../components/fleet/TruckCard';
import TruckDetailDrawer from '../../components/fleet/TruckDetailDrawer';

const FleetDashboard = () => {
  const navigate = useNavigate();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Agrupar mantenimientos por camión
  const fleetData = useGroupByTruck(mantenimientos);

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/mantenimientos');
      setMantenimientos(data.data || data || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando mantenimientos:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ MOVER ESTA FUNCIÓN ANTES DE fleetStats
  const calculateQuickMetrics = (mantenimientos) => {
    if (!mantenimientos || mantenimientos.length === 0) {
      return { healthScore: 'unknown' };
    }

    const sorted = [...mantenimientos].sort(
      (a, b) => new Date(b.fecha_mantenimiento) - new Date(a.fecha_mantenimiento)
    );

    const ultimoManto = sorted[0];
    const diasDesdeUltimo = Math.floor(
      (new Date() - new Date(ultimoManto.fecha_mantenimiento)) / (1000 * 60 * 60 * 24)
    );

    let healthScore = 'good';
    if (diasDesdeUltimo > 60) {
      healthScore = 'critical';
    } else if (diasDesdeUltimo > 30) {
      healthScore = 'warning';
    }

    return { healthScore };
  };

  // Calcular estadísticas generales de la flota
  const fleetStats = React.useMemo(() => {
    const totalCamiones = fleetData.length;
    const totalMantenimientos = mantenimientos.length;
    const costoTotal = mantenimientos.reduce((sum, mant) => {
      const total = mant.detalles?.reduce((detSum, det) => detSum + (det.subTotal || 0), 0) || 0;
      return sum + total;
    }, 0);

    // Contar camiones por health status
    const healthCounts = fleetData.reduce((acc, data) => {
      const metrics = calculateQuickMetrics(data.mantenimientos);
      acc[metrics.healthScore] = (acc[metrics.healthScore] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCamiones,
      totalMantenimientos,
      costoTotal,
      healthCounts
    };
  }, [fleetData, mantenimientos]);

  // Filtrado de camiones - SOLO POR BÚSQUEDA
  const filteredFleet = fleetData.filter(data => {
    const matchesSearch = 
      data.truck?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.truck?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.truck?.model?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cantidad);
  };

  const handleCardClick = (data) => {
    setSelectedTruck(data);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#5F8EAD] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Cargando flota...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-bold text-xl mb-2">Error al cargar datos</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMantenimientos} 
            className="px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-2">Panel de Flota</h1>
              <p className="text-[#5F8EAD] text-base font-semibold">
                Gestión y análisis de vehículos
              </p>
            </div>
            <button
              onClick={() => navigate('/mantenimientos')}
              className="px-5 py-3 bg-white text-[#5F8EAD] rounded-xl hover:shadow-lg font-semibold border-2 border-[#5F8EAD] transition-all"
            >
              ← Ver Tabla de Mantenimientos
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Total Camiones */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#5F8EAD]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Total Camiones</p>
                  <p className="text-3xl font-bold text-[#34353A]">{fleetStats.totalCamiones}</p>
                </div>
                <div className="w-12 h-12 bg-[#5F8EAD] bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🚛</span>
                </div>
              </div>
            </div>

            {/* Total Mantenimientos */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#5D9646]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Mantenimientos</p>
                  <p className="text-3xl font-bold text-[#34353A]">{fleetStats.totalMantenimientos}</p>
                </div>
                <div className="w-12 h-12 bg-[#5D9646] bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Wrench className="text-[#5D9646]" size={24} />
                </div>
              </div>
            </div>

            {/* Costo Total */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Inversión Total</p>
                  <p className="text-3xl font-bold text-[#34353A]">
                    {formatearMoneda(fleetStats.costoTotal)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm font-semibold">Estado de Flota</p>
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="text-[#5D9646]">●</span>
                  <span className="text-gray-600">{fleetStats.healthCounts.good || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">●</span>
                  <span className="text-gray-600">{fleetStats.healthCounts.warning || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-600">●</span>
                  <span className="text-gray-600">{fleetStats.healthCounts.critical || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - SOLO BÚSQUEDA */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por placa, marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD]"
              />
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Mostrando {filteredFleet.length} de {fleetData.length} vehículos
            </div>
          </div>
        </div>

        {/* Grid de Camiones */}
        {filteredFleet.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold text-lg mb-2">No se encontraron camiones</p>
            <p className="text-gray-500 text-sm">
              Intenta ajustar el término de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((data) => (
              <TruckCard
                key={data.truck._id}
                truck={data.truck}
                mantenimientos={data.mantenimientos}
                onClick={() => handleCardClick(data)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer con detalles del camión */}
      <TruckDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        truckData={selectedTruck}
      />
    </div>
  );
};

export default FleetDashboard;
