import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  DollarSign, 
  Package, 
  AlertCircle, 
  TrendingUp,
  CheckCircle,
  Wrench,
  MapPin,
  Users,
  Activity,
  Fuel,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { config } from '../../config';

const ModernDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    viajesOperativos: { total: 0, pendientes: 0, completados: 0, ingresos: 0 },
    mantenimientos: { total: 0, pendientes: 0, completados: 0, gastos: 0 },
    diesel: { total: 0, pendientes: 0, completados: 0, gastos: 0, galones: 0 },
    cajaChica: { balance: 0, ingresos: 0, gastos: 0, transacciones: 0 },
    planillas: { total: 0, pendientes: 0, pagadas: 0, totalPagado: 0, empleados: 0 },
    flota: { total: 25, operando: 23 }
  });

  useEffect(() => {
    cargarEstadisticas();
  }, [selectedPeriod]); // 🔄 Recargar cuando cambie el período

  // 📅 Función para filtrar por fecha
  const filtrarPorPeriodo = (items, campoFecha) => {
    const diasAtras = parseInt(selectedPeriod);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

    return items.filter(item => {
      const fecha = new Date(item[campoFecha]);
      return fecha >= fechaLimite;
    });
  };

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);

      // 🔹 VIAJES OPERATIVOS
      const viajesRes = await fetch(`${config.api.API_URL}/viajes-operativos/listar`);
      const viajesData = await viajesRes.json();
      let viajes = viajesData?.data || [];
      
      // Filtrar por período
      viajes = filtrarPorPeriodo(viajes, 'departureTime');
      
      const viajesStats = {
        total: viajes.length,
        pendientes: viajes.filter(v => {
          const estado = (v?.estado?.actual || v?.estado || '').toLowerCase();
          return estado === 'pendiente';
        }).length,
        completados: viajes.filter(v => {
          const estado = (v?.estado?.actual || v?.estado || '').toLowerCase();
          return ['completado', 'completed'].includes(estado);
        }).length,
        ingresos: viajes.reduce((sum, v) => sum + (v?.montoAcordado || 0), 0)
      };

      // 🔹 MANTENIMIENTOS
      const mantoRes = await fetch(`${config.api.API_URL}/mantenimientos`);
      const mantoData = await mantoRes.json();
      let mantenimientos = mantoData?.data || [];
      
      // Filtrar por período
      mantenimientos = filtrarPorPeriodo(mantenimientos, 'fecha_mantenimiento');
      
      const mantoStats = {
        total: mantenimientos.length,
        pendientes: mantenimientos.filter(m => m?.estado === 'pendiente').length,
        completados: mantenimientos.filter(m => m?.estado === 'completado').length,
        gastos: mantenimientos.reduce((sum, m) => {
          const totalDetalle = (m?.detalles || []).reduce((s, d) => s + (d?.subTotal || 0), 0);
          return sum + totalDetalle;
        }, 0)
      };

      // 🔹 DIÉSEL
      const dieselRes = await fetch(`${config.api.API_URL}/resumen`);
      const dieselData = await dieselRes.json();
      let diesel = dieselData?.data || (Array.isArray(dieselData) ? dieselData : []);
      
      // Filtrar por período
      diesel = filtrarPorPeriodo(diesel, 'fecha');
      
      const dieselStats = {
        total: diesel.length,
        pendientes: diesel.filter(d => {
          const estado = (d?.estado || d?.Estado || 'pendiente').toLowerCase();
          return estado === 'pendiente';
        }).length,
        completados: diesel.filter(d => {
          const estado = (d?.estado || d?.Estado || 'pendiente').toLowerCase();
          return ['completado', 'completed'].includes(estado);
        }).length,
        gastos: diesel.reduce((sum, d) => sum + (d?.Total || d?.total || 0), 0),
        galones: diesel.reduce((sum, d) => sum + (d?.Galones || d?.galones || 0), 0)
      };

      // 🔹 CAJA CHICA
      const cajaRes = await fetch(`${config.api.API_URL}/cajaChica`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const cajaData = await cajaRes.json();
      let transacciones = Array.isArray(cajaData) ? cajaData : [];
      
      // Filtrar por período
      transacciones = filtrarPorPeriodo(transacciones, 'date');

      const cajaBalanceRes = await fetch(`${config.api.API_URL}/cajaChica/balance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const cajaBalanceData = await cajaBalanceRes.json();
      
      const cajaStats = {
        balance: cajaBalanceData?.currentBalance || 0,
        ingresos: transacciones.filter(t => t?.type === 'income').reduce((s, t) => s + (t?.amount || 0), 0),
        gastos: transacciones.filter(t => t?.type === 'expense').reduce((s, t) => s + (t?.amount || 0), 0),
        transacciones: transacciones.length
      };

      // 🔹 PLANILLAS
      const planillasRes = await fetch(`${config.api.API_URL}/planillas/quincenal`);
      const planillasData = await planillasRes.json();
      let planillas = planillasData?.data || [];
      
      // Filtrar por período
      planillas = filtrarPorPeriodo(planillas, 'createdAt');
      
      const planillasStats = {
        total: planillas.length,
        pendientes: planillas.filter(p => p?.estado === 'pendiente').length,
        pagadas: planillas.filter(p => p?.estado === 'aprobada' && p?.pagada === true).length,
        totalPagado: planillas.reduce((s, p) => s + (p?.totales?.totalAPagar || 0), 0),
        empleados: planillas.reduce((s, p) => s + (p?.empleados?.length || 0), 0)
      };

      setEstadisticas({
        viajesOperativos: viajesStats,
        mantenimientos: mantoStats,
        diesel: dieselStats,
        cajaChica: cajaStats,
        planillas: planillasStats,
        flota: { total: 25, operando: 23 } // Esto puedes ajustarlo según tu lógica
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad || 0);
  };

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-ES').format(num || 0);
  };

  // 📊 CALCULAR TOTALES GENERALES
  const totales = {
    ingresos: estadisticas.viajesOperativos.ingresos + estadisticas.cajaChica.ingresos,
    gastos: estadisticas.mantenimientos.gastos + estadisticas.diesel.gastos + estadisticas.cajaChica.gastos + estadisticas.planillas.totalPagado,
    balance: (estadisticas.viajesOperativos.ingresos + estadisticas.cajaChica.ingresos) - 
             (estadisticas.mantenimientos.gastos + estadisticas.diesel.gastos + estadisticas.cajaChica.gastos + estadisticas.planillas.totalPagado)
  };

  const statsCards = [
    {
      title: 'Viajes Activos',
      value: estadisticas.viajesOperativos.total.toString(),
      change: `${estadisticas.viajesOperativos.pendientes} pendientes`,
      trend: 'neutral',
      icon: Truck,
      color: 'blue',
      extra: `${estadisticas.viajesOperativos.completados} completados`
    },
    {
      title: 'Ingresos Totales',
      value: formatearMoneda(totales.ingresos),
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      extra: `Período de ${selectedPeriod} días`
    },
    {
      title: 'Flota Operando',
      value: `${estadisticas.flota.operando}/${estadisticas.flota.total}`,
      change: '92%',
      trend: 'neutral',
      icon: Package,
      color: 'purple',
      extra: `${estadisticas.flota.total - estadisticas.flota.operando} en mantenimiento`
    },
    {
      title: 'Mantenimientos',
      value: estadisticas.mantenimientos.pendientes.toString(),
      change: `${estadisticas.mantenimientos.total} total`,
      trend: 'warning',
      icon: Wrench,
      color: 'orange',
      extra: `${estadisticas.mantenimientos.completados} realizados`
    }
  ];

  const alertas = [
    {
      tipo: 'warning',
      titulo: 'Mantenimientos pendientes',
      descripcion: `${estadisticas.mantenimientos.pendientes} mantenimientos por realizar`,
      icon: Wrench,
      color: 'orange'
    },
    {
      tipo: 'info',
      titulo: 'Viajes operativos',
      descripcion: `${estadisticas.viajesOperativos.completados} viajes completados este mes`,
      icon: CheckCircle,
      color: 'green'
    },
    {
      tipo: 'success',
      titulo: 'Planillas activas',
      descripcion: `${estadisticas.planillas.total} planillas en el sistema`,
      icon: FileText,
      color: 'blue'
    },
    {
      tipo: 'warning',
      titulo: 'Diésel pendiente',
      descripcion: `${estadisticas.diesel.pendientes} registros por completar`,
      icon: Fuel,
      color: 'orange'
    }
  ];

  const modulosResumen = [
    {
      nombre: 'Viajes Operativos',
      total: estadisticas.viajesOperativos.total,
      completados: estadisticas.viajesOperativos.completados,
      pendientes: estadisticas.viajesOperativos.pendientes,
      monto: estadisticas.viajesOperativos.ingresos,
      tipo: 'ingreso'
    },
    {
      nombre: 'Mantenimientos',
      total: estadisticas.mantenimientos.total,
      completados: estadisticas.mantenimientos.completados,
      pendientes: estadisticas.mantenimientos.pendientes,
      monto: estadisticas.mantenimientos.gastos,
      tipo: 'gasto'
    },
    {
      nombre: 'Diésel',
      total: estadisticas.diesel.total,
      completados: estadisticas.diesel.completados,
      pendientes: estadisticas.diesel.pendientes,
      monto: estadisticas.diesel.gastos,
      tipo: 'gasto',
      extra: `${formatearNumero(estadisticas.diesel.galones)} gal`
    },
    {
      nombre: 'Planillas',
      total: estadisticas.planillas.total,
      completados: estadisticas.planillas.pagadas,
      pendientes: estadisticas.planillas.pendientes,
      monto: estadisticas.planillas.totalPagado,
      tipo: 'gasto',
      extra: `${estadisticas.planillas.empleados} empleados`
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
    };
    return colors[color];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner con Spline - VERSIÓN PRO */}
      <div className="relative h-[300px] overflow-hidden">
        {/* Spline 3D Background */}
        <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
          <Spline 
            scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          />
        </div>
        
        {/* Overlay mejorado con gradiente más oscuro arriba */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/30 to-gray-50 pointer-events-none"></div>
        
        {/* Header PREMIUM con stats inline */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
          
          {/* Top bar con mini stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 rounded-full px-5 py-2.5 border border-white/20 shadow-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Activity className="text-white" size={18} />
              <span className="text-white font-semibold text-sm">Sistema en vivo</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Flota activa */}
              <div className="backdrop-blur-md bg-white/10 rounded-full px-5 py-2.5 border border-white/20 shadow-lg pointer-events-auto cursor-pointer hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2">
                  <Truck className="text-white" size={16} />
                  <span className="text-white font-bold text-sm">{estadisticas.flota.operando}/{estadisticas.flota.total}</span>
                </div>
              </div>
              
              {/* Balance */}
              <div className={`backdrop-blur-md rounded-full px-5 py-2.5 border shadow-lg pointer-events-auto cursor-pointer transition-all ${
                totales.balance >= 0 
                  ? 'bg-green-500/20 border-green-400/30 hover:bg-green-500/25' 
                  : 'bg-red-500/20 border-red-400/30 hover:bg-red-500/25'
              }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={totales.balance >= 0 ? 'text-green-300' : 'text-red-300'} size={16} />
                  <span className="text-white font-bold text-sm">{formatearMoneda(totales.balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom title con glassmorphism */}
          <div>
            <div className="backdrop-blur-xl bg-gradient-to-r from-black/40 via-black/30 to-transparent rounded-2xl px-8 py-5 border border-white/10 inline-block shadow-2xl">
              <h1 className="text-6xl font-bold text-white mb-2" style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
              }}>
                Dashboard
              </h1>
              <p className="text-white/95 text-base font-medium" style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Flotando sobre el Spline */}
      <div className="container mx-auto px-8 -mt-20 relative z-20">
        {/* Badge de período activo */}
        <div className="flex items-center justify-end mb-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg border border-indigo-200">
            <span className="text-xs font-semibold text-indigo-600">
              📊 Mostrando datos de los últimos {selectedPeriod} días
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            
            return (
              <div 
                key={index}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${colors.bg} rounded-xl shadow-sm`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <TrendingUp size={14} />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'warning' && (
                    <div className="text-orange-600 text-sm font-medium bg-orange-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm mb-2">{stat.title}</div>
                {stat.extra && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    {stat.extra}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Resumen financiero */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Resumen Financiero</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Actualizando datos...
                    </span>
                  ) : (
                    `Balance del período seleccionado`
                  )}
                </p>
              </div>
              
              {/* Selector de período mejorado */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Período:</span>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  disabled={loading}
                  className={`px-4 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold transition-all ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed border-gray-200' 
                      : 'border-gray-200 hover:border-indigo-300 cursor-pointer'
                  }`}
                >
                  <option value="7">📅 Últimos 7 días</option>
                  <option value="30">📅 Últimos 30 días</option>
                  <option value="90">📅 Últimos 3 meses</option>
                </select>
              </div>
            </div>

            {/* Gráfico de barras comparativo - Microsoft Power BI Style */}
            <div className="mb-6 bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-600" />
                  Ingresos vs Gastos
                </h4>
                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                  Últimos {selectedPeriod} días
                </div>
              </div>
              
              <div className="flex items-end justify-around gap-4 h-32">
                {/* Barra de Ingresos */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div 
                      className="w-16 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer"
                      style={{ 
                        height: `${Math.min((totales.ingresos / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px'
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.ingresos)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-green-700">Ingresos</p>
                    <p className="text-lg font-bold text-green-900">{formatearMoneda(totales.ingresos)}</p>
                  </div>
                </div>

                {/* Barra de Gastos */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div 
                      className="w-16 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer"
                      style={{ 
                        height: `${Math.min((totales.gastos / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px'
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.gastos)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-red-700">Gastos</p>
                    <p className="text-lg font-bold text-red-900">{formatearMoneda(totales.gastos)}</p>
                  </div>
                </div>

                {/* Barra de Balance */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div 
                      className={`w-16 bg-gradient-to-t rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer ${
                        totales.balance >= 0 
                          ? 'from-blue-500 to-blue-400' 
                          : 'from-orange-500 to-orange-400'
                      }`}
                      style={{ 
                        height: `${Math.min((Math.abs(totales.balance) / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px'
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.balance)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-semibold ${totales.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      Balance
                    </p>
                    <p className={`text-lg font-bold ${totales.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                      {formatearMoneda(totales.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="text-xs font-semibold text-green-700">INGRESOS</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">{formatearMoneda(totales.ingresos)}</div>
                <div className="text-xs text-green-600 mt-1">Viajes y otros ingresos</div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <Calendar size={12} />
                    <span className="font-semibold">
                      {estadisticas.viajesOperativos.total + estadisticas.cajaChica.transacciones} transacciones
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-red-600 rotate-180" size={20} />
                  <span className="text-xs font-semibold text-red-700">GASTOS</span>
                </div>
                <div className="text-2xl font-bold text-red-900 mb-1">{formatearMoneda(totales.gastos)}</div>
                <div className="text-xs text-red-600 mt-1">Operativos y planillas</div>
                <div className="mt-2 pt-2 border-t border-red-200">
                  <div className="flex items-center gap-1 text-xs text-red-700">
                    <Activity size={12} />
                    <span className="font-semibold">
                      {estadisticas.mantenimientos.total + estadisticas.diesel.total + estadisticas.planillas.total} registros
                    </span>
                  </div>
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-xl p-4 border hover:shadow-lg transition-all ${
                totales.balance >= 0 
                  ? 'from-blue-50 to-indigo-50 border-blue-200' 
                  : 'from-orange-50 to-amber-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} size={20} />
                  <span className={`text-xs font-semibold ${totales.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>BALANCE</span>
                </div>
                <div className={`text-2xl font-bold mb-1 ${totales.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                  {formatearMoneda(totales.balance)}
                </div>
                <div className={`text-xs mt-1 ${totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {totales.balance >= 0 ? 'Positivo' : 'Atención requerida'}
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className={`flex items-center gap-1 text-xs ${totales.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    <CheckCircle size={12} />
                    <span className="font-semibold">
                      {totales.ingresos > totales.gastos ? 'Rentable' : 'Revisar gastos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen por módulos */}
            <div className="space-y-3">
              {/* Header con totales del período */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Resumen del Período</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Total de registros en los últimos {selectedPeriod} días
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      {modulosResumen.reduce((sum, m) => sum + m.total, 0)}
                    </div>
                    <p className="text-xs text-gray-600">registros</p>
                  </div>
                </div>
              </div>

              {modulosResumen.map((modulo, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{modulo.nombre}</span>
                        {modulo.extra && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            {modulo.extra}
                          </span>
                        )}
                        {modulo.total === 0 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                            Sin registros
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {modulo.total === 0 ? (
                          `Sin datos en los últimos ${selectedPeriod} días`
                        ) : (
                          `${modulo.completados} completados · ${modulo.pendientes} pendientes de ${modulo.total} total`
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${modulo.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {modulo.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(modulo.monto)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          modulo.total === 0 
                            ? 'bg-gray-300' 
                            : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                        }`}
                        style={{ width: `${modulo.total > 0 ? (modulo.completados / modulo.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {modulo.total > 0 ? Math.round((modulo.completados / modulo.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            
            {/* Alertas compactas */}
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Alertas</h3>
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {alertas.length}
                </span>
              </div>
              <div className="space-y-2">
                {alertas.map((alerta, i) => {
                  const Icon = alerta.icon;
                  const colors = getColorClasses(alerta.color);
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex items-start gap-3 p-3 ${colors.bg} rounded-xl border ${colors.border} hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className={`p-1.5 bg-white rounded-lg ${colors.text}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-xs">{alerta.titulo}</div>
                        <div className="text-gray-600 text-xs mt-0.5 truncate">{alerta.descripcion}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={() => navigate('/alertas')}
                className="w-full mt-4 py-2.5 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Ver todas las alertas →
              </button>
            </div>

            {/* Stats rápidas */}
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stats Rápidas</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Caja Chica</span>
                  </div>
                  <span className="font-bold text-blue-900">{formatearMoneda(estadisticas.cajaChica.balance)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fuel className="text-purple-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Diésel</span>
                  </div>
                  <span className="font-bold text-purple-900">{formatearNumero(estadisticas.diesel.galones)} gal</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="text-green-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Empleados</span>
                  </div>
                  <span className="font-bold text-green-900">{estadisticas.planillas.empleados}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="text-orange-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Pendientes</span>
                  </div>
                  <span className="font-bold text-orange-900">
                    {estadisticas.viajesOperativos.pendientes + estadisticas.mantenimientos.pendientes + estadisticas.diesel.pendientes}
                  </span>
                </div>
              </div>
            </div>

            {/* 🆕 Feed de Actividad Reciente - Microsoft Teams Style */}
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="text-indigo-600" size={20} />
                  Actividad Reciente
                </h3>
                <span className="text-xs text-gray-500 font-medium">Últimas 24 horas</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {/* Viajes completados */}
                {estadisticas.viajesOperativos.completados > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Viajes completados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.viajesOperativos.completados} viajes finalizados exitosamente
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">hace 2 horas</p>
                    </div>
                  </div>
                )}

                {/* Mantenimientos pendientes */}
                {estadisticas.mantenimientos.pendientes > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Wrench className="text-orange-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Mantenimientos programados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.mantenimientos.pendientes} mantenimientos requieren atención
                      </p>
                      <p className="text-xs text-orange-600 font-medium mt-1">hace 5 horas</p>
                    </div>
                  </div>
                )}

                {/* Planillas procesadas */}
                {estadisticas.planillas.pagadas > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="text-blue-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Planillas pagadas</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.planillas.pagadas} planillas procesadas ({formatearMoneda(estadisticas.planillas.totalPagado)})
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">hace 8 horas</p>
                    </div>
                  </div>
                )}

                {/* Diésel registrado */}
                {estadisticas.diesel.completados > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Fuel className="text-purple-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Registros de diésel</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatearNumero(estadisticas.diesel.galones)} galones registrados
                      </p>
                      <p className="text-xs text-purple-600 font-medium mt-1">hace 12 horas</p>
                    </div>
                  </div>
                )}

                {/* Viajes programados */}
                {estadisticas.viajesOperativos.pendientes > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Truck className="text-indigo-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Viajes programados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.viajesOperativos.pendientes} viajes próximos a realizar
                      </p>
                      <p className="text-xs text-indigo-600 font-medium mt-1">hace 18 horas</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="w-full mt-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Ver todo el historial →
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;