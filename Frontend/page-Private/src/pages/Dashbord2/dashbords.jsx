import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Lottie from 'lottie-react';
import { config } from '../../config';

// 🎨 Importar animaciones Lottie
import loadingTruckAnimation from '../../assets/lotties/ready, set, go!.json';
import emptyBoxAnimation from '../../assets/lotties/empty.json';
import successAnimation from '../../assets/lotties/Success (1).json';
import warningAnimation from '../../assets/lotties/Alert Notification Character.json';
import moneyAnimation from '../../assets/lotties/Coins blow effect.json';
import truckIconAnimation from '../../assets/lotties/ecommerce order fulfillment automation.json';
import checkmarkAnimation from '../../assets/lotties/Success (1).json';

//Nuevo: componente Modal del reporte consolidado
import ModalResumenConsolidado from "./ModalResumenConsolidado";
// Modal para generar reporte semanal (PDF)
import ReportsPdfModal from '../../components/Dashboard/ReportsPdfModal';
// Modal reporte mensual de gastos
import ReportsGastosMesModal from '../../components/Dashboard/ReportsGastosMesModal';

const ModernDashboard = () => {

  //nuevo estado para el modal
  const [modalResumenOpen, setModalResumenOpen] = useState(false);
  // nuevo estado para el modal PDF
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  // nuevo estado para modal Mensual Gastos
  const [modalGastosMesOpen, setModalGastosMesOpen] = useState(false);

  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    viajesOperativos: { total: 0, pendientes: 0, completados: 0, ingresos: 0 },
    mantenimientos: { total: 0, pendientes: 0, completados: 0, gastos: 0 },
    diesel: { total: 0, pendientes: 0, completados: 0, gastos: 0, galones: 0 },
    cajaChica: { balance: 0, ingresos: 0, gastos: 0, transacciones: 0 },
    planillas: { total: 0, pendientes: 0, pagadas: 0, totalPagado: 0, empleados: 0 },
    flota: { total: 25, operando: 23 }
  });
  const lottieRef = useRef();



  useEffect(() => {
    cargarEstadisticas();
  }, [selectedPeriod]);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1); // ⏱ más lento
    }
  }, []);


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
    const startTime = Date.now(); // ⏱ empieza a contar

    try {
      setLoading(true);


      const viajesRes = await fetch(`${config.api.API_URL}/viajes-operativos/listar`, { credentials: 'include' });
      const viajesData = await viajesRes.json();
      let viajes = viajesData?.data || [];

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

      const mantoRes = await fetch(`${config.api.API_URL}/mantenimientos`, { credentials: 'include' });
      const mantoData = await mantoRes.json();
      let mantenimientos = mantoData?.data || [];

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

      const dieselRes = await fetch(`${config.api.API_URL}/resumen`, { credentials: 'include' });
      const dieselData = await dieselRes.json();
      let diesel = dieselData?.data || (Array.isArray(dieselData) ? dieselData : []);

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

      const cajaRes = await fetch(`${config.api.API_URL}/cajaChica`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const cajaData = await cajaRes.json();
      let transacciones = Array.isArray(cajaData) ? cajaData : [];

      transacciones = filtrarPorPeriodo(transacciones, 'date');

      const cajaBalanceRes = await fetch(`${config.api.API_URL}/cajaChica/balance`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const cajaBalanceData = await cajaBalanceRes.json();

      const cajaStats = {
        balance: cajaBalanceData?.currentBalance || 0,
        ingresos: transacciones.filter(t => t?.type === 'income').reduce((s, t) => s + (t?.amount || 0), 0),
        gastos: transacciones.filter(t => t?.type === 'expense').reduce((s, t) => s + (t?.amount || 0), 0),
        transacciones: transacciones.length
      };

      const planillasRes = await fetch(`${config.api.API_URL}/planillas/quincenal`, { credentials: 'include' });
      const planillasData = await planillasRes.json();
      let planillas = planillasData?.data || [];

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
        flota: { total: 25, operando: 23 }
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDuration = 6000; // ⏱ 6 segundos

      const remaining = Math.max(minDuration - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }

  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad || 0);
  };

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-ES').format(num || 0);
  };

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
      extra: `${estadisticas.viajesOperativos.completados} completados`,
      lottie: truckIconAnimation
    },
    {
      title: 'Ingresos Totales',
      value: formatearMoneda(totales.ingresos),
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      extra: `Período de ${selectedPeriod} días`,
      lottie: moneyAnimation
    },
    {
      title: 'Flota Operando',
      value: `${estadisticas.flota.operando}/${estadisticas.flota.total}`,
      change: '92%',
      trend: 'neutral',
      icon: Package,
      color: 'purple',
      extra: `${estadisticas.flota.total - estadisticas.flota.operando} en mantenimiento`,
      lottie: null
    },
    {
      title: 'Mantenimientos',
      value: estadisticas.mantenimientos.pendientes.toString(),
      change: `${estadisticas.mantenimientos.total} total`,
      trend: 'warning',
      icon: Wrench,
      color: 'orange',
      extra: `${estadisticas.mantenimientos.completados} realizados`,
      lottie: null
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
      blue: { bg: 'bg-[#5F8EAD] bg-opacity-20', text: 'text-[#5F8EAD]', border: 'border-[#5F8EAD]' },
      green: { bg: 'bg-[#5D9646] bg-opacity-20', text: 'text-[#5D9646]', border: 'border-[#5D9646]' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
    };
    return colors[color];
  };

  // 🎨 LOADING STATE CON LOTTIE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={loadingTruckAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 250, height: 250, margin: '0 auto' }}
          />

          <p className="text-gray-600 font-medium text-lg mt-4">Cargando dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo datos del sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner con Spline */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
          <Spline
            scene="https://prod.spline.design/RPoeKCG7eSYlbZ4c/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/30 to-gray-50 pointer-events-none"></div>

        <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 rounded-full px-5 py-2.5 border border-white/20 shadow-lg">
              <div className="w-2 h-2 bg-[#5D9646] rounded-full animate-pulse"></div>
              <Activity className="text-white" size={18} />
              <span className="text-white font-semibold text-sm">Sistema en vivo</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="backdrop-blur-md bg-white/10 rounded-full px-5 py-2.5 border border-white/20 shadow-lg pointer-events-auto cursor-pointer hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2">
                  <Truck className="text-white" size={16} />
                  <span className="text-white font-bold text-sm">{estadisticas.flota.operando}/{estadisticas.flota.total}</span>
                </div>
              </div>

              <div className={`backdrop-blur-md rounded-full px-5 py-2.5 border shadow-lg pointer-events-auto cursor-pointer transition-all ${totales.balance >= 0
                  ? 'bg-[#5D9646]/20 border-[#5D9646]/30 hover:bg-[#5D9646]/25'
                  : 'bg-red-500/20 border-red-400/30 hover:bg-red-500/25'
                }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={totales.balance >= 0 ? 'text-green-300' : 'text-red-300'} size={16} />
                  <span className="text-white font-bold text-sm">{formatearMoneda(totales.balance)}</span>
                </div>
              </div>
            </div>
          </div>

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

      {/* Stats Grid CON LOTTIE EN HOVER */}
      <div className="container mx-auto px-8 -mt-20 relative z-20">
        <div className="flex items-center justify-end mb-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg border-2 border-[#5F8EAD]">
            <span className="text-xs font-semibold text-[#5F8EAD]">
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
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              >
                {/* Lottie de fondo en hover */}
                {stat.lottie && hoveredCard === index && (
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Lottie
                      animationData={stat.lottie}
                      loop={true}
                      style={{ width: 120, height: 120 }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 ${colors.bg} rounded-xl shadow-sm`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-[#5D9646] text-sm font-medium bg-[#5D9646] bg-opacity-20 px-3 py-1 rounded-full">
                      <TrendingUp size={14} />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="text-[#5F8EAD] text-sm font-medium bg-[#5F8EAD] bg-opacity-20 px-3 py-1 rounded-full">
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'warning' && (
                    <div className="text-orange-600 text-sm font-medium bg-orange-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-[#34353A] mb-1 relative z-10">{stat.value}</div>
                <div className="text-gray-600 text-sm mb-2 relative z-10">{stat.title}</div>
                {stat.extra && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md relative z-10">
                    {stat.extra}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#34353A]">Resumen Financiero</h3>
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

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Período:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  disabled={loading}
                  className={`px-4 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white font-semibold transition-all ${loading
                      ? 'opacity-50 cursor-not-allowed border-gray-200'
                      : 'border-gray-200 hover:border-[#5F8EAD] cursor-pointer'
                    }`}
                >
                  <option value="7">📅 Últimos 7 días</option>
                  <option value="30">📅 Últimos 30 días</option>
                  <option value="90">📅 Últimos 3 meses</option>
                </select>
              </div>
            </div>

            {/* Gráfico de barras */}
            <div className="mb-6 bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#34353A] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#5F8EAD]" />
                  Ingresos vs Gastos
                </h4>
                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                  Últimos {selectedPeriod} días
                </div>
              </div>

              <div className="flex items-end justify-around gap-4 h-32">
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className="w-16 bg-gradient-to-t from-[#5D9646] to-[#5D9646] rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer"
                      style={{
                        height: `${Math.min((totales.ingresos / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px',
                        opacity: 0.9
                      }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.ingresos)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-[#5D9646]">Ingresos</p>
                    <p className="text-lg font-bold text-[#34353A]">{formatearMoneda(totales.ingresos)}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className="w-16 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer"
                      style={{
                        height: `${Math.min((totales.gastos / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.gastos)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-red-700">Gastos</p>
                    <p className="text-lg font-bold text-[#34353A]">{formatearMoneda(totales.gastos)}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className={`w-16 bg-gradient-to-t rounded-t-lg shadow-lg hover:shadow-xl transition-all relative group cursor-pointer ${totales.balance >= 0
                          ? 'from-[#5F8EAD] to-[#5F8EAD]'
                          : 'from-orange-500 to-orange-400'
                        }`}
                      style={{
                        height: `${Math.min((Math.abs(totales.balance) / Math.max(totales.ingresos, totales.gastos, 1)) * 100, 100)}%`,
                        minHeight: '20px',
                        opacity: totales.balance >= 0 ? 0.9 : 1
                      }}
                    >
                      {/* Lottie en balance */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lottie
                          animationData={totales.balance >= 0 ? successAnimation : warningAnimation}
                          loop={totales.balance >= 0 ? false : true}
                          style={{ width: 40, height: 40 }}
                        />
                      </div>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {formatearMoneda(totales.balance)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-semibold ${totales.balance >= 0 ? 'text-[#5F8EAD]' : 'text-orange-700'}`}>
                      Balance
                    </p>
                    <p className={`text-lg font-bold ${totales.balance >= 0 ? 'text-[#34353A]' : 'text-orange-900'}`}>
                      {formatearMoneda(totales.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#5D9646] rounded-xl p-4 border-2 border-[#5D9646] hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-20 transition-opacity">
                  <Lottie
                    animationData={moneyAnimation}
                    loop={true}
                    style={{ width: 80, height: 80 }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <TrendingUp className="text-white" size={20} />
                  <span className="text-xs font-semibold text-white">INGRESOS</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1 relative z-10">{formatearMoneda(totales.ingresos)}</div>
                <div className="text-xs text-white opacity-90 mt-1 relative z-10">Viajes y otros ingresos</div>
                <div className="mt-2 pt-2 border-t-2 border-white border-opacity-30 relative z-10">
                  <div className="flex items-center gap-1 text-xs text-white">
                    <Calendar size={12} />
                    <span className="font-semibold">
                      {estadisticas.viajesOperativos.total + estadisticas.cajaChica.transacciones} transacciones
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-500 rounded-xl p-4 border-2 border-red-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-white rotate-180" size={20} />
                  <span className="text-xs font-semibold text-white">GASTOS</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatearMoneda(totales.gastos)}</div>
                <div className="text-xs text-white opacity-90 mt-1">Operativos y planillas</div>
                <div className="mt-2 pt-2 border-t-2 border-white border-opacity-30">
                  <div className="flex items-center gap-1 text-xs text-white">
                    <Activity size={12} />
                    <span className="font-semibold">
                      {estadisticas.mantenimientos.total + estadisticas.diesel.total + estadisticas.planillas.total} registros
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border-2 hover:shadow-lg transition-all ${totales.balance >= 0
                  ? 'bg-[#5F8EAD] border-[#5F8EAD]'
                  : 'bg-orange-500 border-orange-500'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-white" size={20} />
                  <span className="text-xs font-semibold text-white">BALANCE</span>
                </div>
                <div className="text-2xl font-bold mb-1 text-white">
                  {formatearMoneda(totales.balance)}
                </div>
                <div className="text-xs mt-1 text-white opacity-90">
                  {totales.balance >= 0 ? 'Positivo' : 'Atención requerida'}
                </div>
                <div className="mt-2 pt-2 border-t-2 border-white border-opacity-30">
                  <div className="flex items-center gap-1 text-xs text-white">
                    <CheckCircle size={12} />
                    <span className="font-semibold">
                      {totales.ingresos > totales.gastos ? 'Rentable' : 'Revisar gastos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen por módulos CON ESTADO VACÍO */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-[#5F8EAD] from-opacity-10 to-[#5F8EAD] to-opacity-5 rounded-xl p-4 border-2 border-[#5F8EAD] mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#34353A]">Resumen del Período</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Total de registros en los últimos {selectedPeriod} días
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#5F8EAD]">
                      {modulosResumen.reduce((sum, m) => sum + m.total, 0)}
                    </div>
                    <p className="text-xs text-gray-600">registros</p>
                  </div>
                </div>
              </div>

              {modulosResumen.length === 0 ? (
                <div className="text-center py-12">
                  <Lottie
                    animationData={emptyBoxAnimation}
                    loop={false}
                    style={{ width: 150, height: 150, margin: '0 auto' }}
                  />
                  <p className="text-gray-600 mt-4 font-medium">No hay datos en este período</p>
                  <p className="text-gray-400 text-sm mt-2">Intenta seleccionar un período diferente</p>
                </div>
              ) : (
                modulosResumen.map((modulo, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#34353A]">{modulo.nombre}</span>
                          {modulo.extra && (
                            <span className="text-xs bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] px-2 py-0.5 rounded-full font-semibold">
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
                        <div className={`text-lg font-bold ${modulo.tipo === 'ingreso' ? 'text-[#5D9646]' : 'text-red-600'}`}>
                          {modulo.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(modulo.monto)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${modulo.total === 0
                              ? 'bg-gray-300'
                              : 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD]'
                            }`}
                          style={{ width: `${modulo.total > 0 ? (modulo.completados / modulo.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {modulo.total > 0 ? Math.round((modulo.completados / modulo.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#34353A]">Alertas</h3>
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
                      className={`flex items-start gap-3 p-3 ${colors.bg} rounded-xl border-2 ${colors.border} hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className={`p-1.5 bg-white rounded-lg ${colors.text}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#34353A] text-xs">{alerta.titulo}</div>
                        <div className="text-gray-600 text-xs mt-0.5 truncate">{alerta.descripcion}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#34353A]">Resúmenes</h3>
                <button
                  onClick={() => setModalResumenOpen(true)}
                  className="text-[#5F8EAD] hover:text-[#5D9646] transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div
                  onClick={() => setModalResumenOpen(true)}
                  className="flex items-center justify-between p-3 bg-[#5F8EAD] bg-opacity-10 rounded-lg cursor-pointer hover:bg-[#5F8EAD] hover:bg-opacity-20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="text-[#5F8EAD]" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Resumen Consolidado</span>
                  </div>
                  <ChevronRight className="text-[#5F8EAD]" size={18} />
                </div>

                <div
                  onClick={() => setModalPdfOpen(true)}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="text-green-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Reporte Semanal (PDF)</span>
                  </div>
                  <ChevronRight className="text-green-600" size={18} />
                </div>

                <div
                  onClick={() => setModalGastosMesOpen(true)}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-600" size={18} />
                    <span className="text-sm font-semibold text-gray-700">Reporte Mensual Gastos (PDF)</span>
                  </div>
                  <ChevronRight className="text-blue-600" size={18} />
                </div>
              </div>
            </div>


            <ModalResumenConsolidado
              isOpen={modalResumenOpen}
              onClose={() => setModalResumenOpen(false)}
              apiUrl={config.api.API_URL}
            />

            <ReportsPdfModal
              isOpen={modalPdfOpen}
              onClose={() => setModalPdfOpen(false)}
            />

            <ReportsGastosMesModal
              isOpen={modalGastosMesOpen}
              onClose={() => setModalGastosMesOpen(false)}
            />

            {/* Actividad Reciente CON LOTTIE CHECKMARK */}
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#5F8EAD]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#34353A] flex items-center gap-2">
                  <Activity className="text-[#5F8EAD]" size={20} />
                  Actividad Reciente
                </h3>
                <span className="text-xs text-gray-500 font-medium">Últimas 24 horas</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {estadisticas.viajesOperativos.completados > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-[#5D9646] bg-opacity-10 rounded-lg hover:bg-[#5D9646] hover:bg-opacity-15 transition-colors relative group">
                    <div className="p-2 bg-[#5D9646] bg-opacity-20 rounded-lg relative">
                      <CheckCircle className="text-[#5D9646]" size={16} />
                      {/* Lottie checkmark en hover */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lottie
                          animationData={checkmarkAnimation}
                          loop={false}
                          style={{ width: 24, height: 24 }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#34353A]">Viajes completados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.viajesOperativos.completados} viajes finalizados exitosamente
                      </p>
                      <p className="text-xs text-[#5D9646] font-medium mt-1">hace 2 horas</p>
                    </div>
                  </div>
                )}

                {estadisticas.mantenimientos.pendientes > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Wrench className="text-orange-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#34353A]">Mantenimientos programados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.mantenimientos.pendientes} mantenimientos requieren atención
                      </p>
                      <p className="text-xs text-orange-600 font-medium mt-1">hace 5 horas</p>
                    </div>
                  </div>
                )}

                {estadisticas.planillas.pagadas > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-[#5F8EAD] bg-opacity-10 rounded-lg hover:bg-[#5F8EAD] hover:bg-opacity-15 transition-colors">
                    <div className="p-2 bg-[#5F8EAD] bg-opacity-20 rounded-lg">
                      <FileText className="text-[#5F8EAD]" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#34353A]">Planillas pagadas</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.planillas.pagadas} planillas procesadas ({formatearMoneda(estadisticas.planillas.totalPagado)})
                      </p>
                      <p className="text-xs text-[#5F8EAD] font-medium mt-1">hace 8 horas</p>
                    </div>
                  </div>
                )}

                {estadisticas.diesel.completados > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Fuel className="text-purple-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#34353A]">Registros de diésel</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatearNumero(estadisticas.diesel.galones)} galones registrados
                      </p>
                      <p className="text-xs text-purple-600 font-medium mt-1">hace 12 horas</p>
                    </div>
                  </div>
                )}

                {estadisticas.viajesOperativos.pendientes > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-[#5F8EAD] bg-opacity-10 rounded-lg hover:bg-[#5F8EAD] hover:bg-opacity-15 transition-colors">
                    <div className="p-2 bg-[#5F8EAD] bg-opacity-20 rounded-lg">
                      <Truck className="text-[#5F8EAD]" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#34353A]">Viajes programados</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {estadisticas.viajesOperativos.pendientes} viajes próximos a realizar
                      </p>
                      <p className="text-xs text-[#5F8EAD] font-medium mt-1">hace 18 horas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #34353A 0%, #5F8EAD 100%);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #5F8EAD 0%, #34353A 100%);
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;
