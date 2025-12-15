import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Send, Wrench, Download, Search, Filter, Calendar, Edit, Trash2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';

export default function CajaChicaModern() {
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState(null);
  const [estadoReintegro, setEstadoReintegro] = useState(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    amount: '',
    operationType: 'egreso',
    reason: '',
    password: ''
  });
  const [voucher, setVoucher] = useState(null);

  // Estados para estadísticas calculadas
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    totalTransacciones: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función principal para cargar todos los datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        obtenerMovimientos(),
        obtenerBalance(),
        obtenerConfiguracion(),
        verificarReintegro()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar los datos de caja chica',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OBTENER TODOS LOS MOVIMIENTOS
  // =====================================================
  const obtenerMovimientos = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/caja-chica`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data);
        calcularEstadisticas(data);
      }
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
    }
  };

  // =====================================================
  // OBTENER BALANCE ACTUAL
  // =====================================================
  const obtenerBalance = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/caja-chica/balance`);
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.currentBalance);
      }
    } catch (error) {
      console.error('Error obteniendo balance:', error);
    }
  };

  // =====================================================
  // OBTENER CONFIGURACIÓN
  // =====================================================
  const obtenerConfiguracion = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/caja-chica-config`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setConfiguracion(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }
  };

  // =====================================================
  // VERIFICAR SI NECESITA REINTEGRO
  // =====================================================
  const verificarReintegro = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/caja-chica-config/verificar-reintegro`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEstadoReintegro(data.data);
      }
    } catch (error) {
      console.error('Error verificando reintegro:', error);
    }
  };

  // =====================================================
  // REGISTRAR REINTEGRO AUTOMÁTICO
  // =====================================================
  const registrarReintegro = async () => {
    const result = await Swal.fire({
      title: '¿Registrar Reintegro?',
      html: `
        <p>Se registrará un ingreso de <strong>$${estadoReintegro?.reintegroNecesario?.toFixed(2)}</strong></p>
        <p>Balance actual: $${balance.toFixed(2)}</p>
        <p>Balance después: $${configuracion?.maximoPermitido?.toFixed(2)}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${config.api.API_URL}/caja-chica-config/registrar-reintegro`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          await Swal.fire({
            title: '¡Reintegro Registrado!',
            text: data.message,
            icon: 'success',
            timer: 2000
          });
          await cargarDatos();
        } else {
          throw new Error(data.message || 'Error al registrar reintegro');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error'
        });
      }
    }
  };

  // =====================================================
  // REGISTRAR INGRESO (CON PASSWORD)
  // =====================================================
  const registrarIngreso = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.reason) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        icon: 'warning'
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('password', formData.password);
      
      if (voucher) {
        formDataToSend.append('voucher', voucher);
      }

      const response = await fetch(`${config.api.API_URL}/caja-chica/ingreso`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '¡Ingreso Registrado!',
          text: data.message,
          icon: 'success',
          timer: 2000
        });
        limpiarFormulario();
        await cargarDatos();
      } else {
        throw new Error(data.message || 'Error al registrar ingreso');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    }
  };

  // =====================================================
  // REGISTRAR EGRESO (SIN PASSWORD)
  // =====================================================
  const registrarEgreso = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.reason) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        icon: 'warning'
      });
      return;
    }

    if (!voucher) {
      Swal.fire({
        title: 'Comprobante requerido',
        text: 'El comprobante es obligatorio para egresos',
        icon: 'warning'
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('operationType', 'egreso');
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('voucher', voucher);

      const response = await fetch(`${config.api.API_URL}/caja-chica/egreso`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '¡Egreso Registrado!',
          text: data.message,
          icon: 'success',
          timer: 2000
        });
        limpiarFormulario();
        await cargarDatos();
      } else {
        throw new Error(data.message || 'Error al registrar egreso');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    }
  };

  // =====================================================
  // ELIMINAR MOVIMIENTO
  // =====================================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar movimiento?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${config.api.API_URL}/caja-chica/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'Movimiento eliminado exitosamente',
            icon: 'success',
            timer: 2000
          });
          await cargarDatos();
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el movimiento',
          icon: 'error'
        });
      }
    }
  };

  // =====================================================
  // GENERAR REPORTES PDF
  // =====================================================
  const generarReportePDF = async (tipo) => {
    let url = '';
    
    switch (tipo) {
      case 'todos':
        url = `${config.api.API_URL}/reportesCajaChica/todos`;
        break;
      case 'mensual':
        const mes = new Date().getMonth() + 1;
        const ano = new Date().getFullYear();
        url = `${config.api.API_URL}/reportesCajaChica/mensual-simple/${mes}/${ano}`;
        break;
      case 'diario':
        const hoy = new Date().toISOString().split('T')[0];
        url = `${config.api.API_URL}/reportesCajaChica/diario/${hoy}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank');
  };

  // =====================================================
  // FUNCIONES AUXILIARES
  // =====================================================
  const calcularEstadisticas = (movimientos) => {
    const ingresos = movimientos
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const gastos = movimientos
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    setStats({
      totalIngresos: ingresos,
      totalGastos: gastos,
      totalTransacciones: movimientos.length
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      amount: '',
      operationType: 'egreso',
      reason: '',
      password: ''
    });
    setVoucher(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad);
  };

  // Filtrar transacciones según el tab activo
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'income') return tx.type === 'income';
    if (activeTab === 'expense') return tx.type === 'expense';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando caja chica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Caja Chica</h1>
            <p className="text-slate-500 mt-1">Gestiona tus transacciones diarias</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => generarReportePDF('diario')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText size={18} />
              Diario
            </button>
            <button 
              onClick={() => generarReportePDF('mensual')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              <FileText size={18} />
              Mensual
            </button>
            <button 
              onClick={() => generarReportePDF('todos')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Download size={20} />
              Exportar Todo
            </button>
          </div>
        </div>

        {/* Alerta de Reintegro */}
        {estadoReintegro?.necesitaReintegro && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-600" size={24} />
                <div>
                  <p className="font-semibold text-amber-900">Se requiere reintegro</p>
                  <p className="text-sm text-amber-700">{estadoReintegro.mensaje}</p>
                </div>
              </div>
              <button
                onClick={registrarReintegro}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Registrar Reintegro
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Balance Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-2">Balance Total</p>
              <h2 className="text-5xl font-bold mb-4">{formatearMoneda(balance)}</h2>
              {configuracion && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <span className="text-white/90">
                      {((balance / configuracion.maximoPermitido) * 100).toFixed(1)}% del límite ({formatearMoneda(configuracion.maximoPermitido)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mini Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-sm font-medium">Total Ingresos</p>
              <TrendingUp className="text-emerald-500" size={18} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatearMoneda(stats.totalIngresos)}</h3>
            <p className="text-sm font-medium text-emerald-600">
              Acumulado
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-sm font-medium">Total Gastos</p>
              <TrendingDown className="text-rose-500" size={18} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatearMoneda(stats.totalGastos)}</h3>
            <p className="text-sm font-medium text-rose-600">
              Acumulado
            </p>
          </div>
        </div>

        {/* Control Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Transacción</h3>
          <form onSubmit={formData.operationType === 'ingreso' ? registrarIngreso : registrarEgreso}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
              <select 
                value={formData.operationType}
                onChange={(e) => setFormData({...formData, operationType: e.target.value})}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors appearance-none bg-white"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Gasto</option>
              </select>
              <input 
                type="text" 
                placeholder="Descripción"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
              <div className="relative">
                <input
                  type="file"
                  id="voucher"
                  accept="image/*,.pdf"
                  onChange={(e) => setVoucher(e.target.files[0])}
                  className="hidden"
                />
                <label 
                  htmlFor="voucher"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <FileText size={18} />
                  {voucher ? voucher.name.substring(0, 15) + '...' : 'Comprobante'}
                </label>
              </div>
            </div>
            
            {formData.operationType === 'ingreso' && (
              <div className="mt-4">
                <input
                  type="password"
                  placeholder="Contraseña (requerida para ingresos)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-900 transition-colors"
            >
              Realizar Operación
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Últimas Transacciones</h3>
                <p className="text-sm text-slate-500 mt-1">Historial completo de movimientos</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {['all', 'income', 'expense'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'all' ? 'Todas' : tab === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {formatearFecha(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{tx.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tx.type === 'income' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {tx.employeeId?.name || 'Admin'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatearMoneda(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">
                      {formatearMoneda(tx.currentBalance)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Descargar PDF Individual */}
                        {tx.voucher && (
                          <button
                            onClick={() => window.open(tx.voucher, '_blank')}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Ver Comprobante"
                          >
                            <Download size={18} />
                          </button>
                        )}

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}