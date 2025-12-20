import React, { useState, useEffect } from 'react';
import { TrendingDown, Download, Search, FileText, Loader2, Plus, Settings } from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import './CajaChica.css';
import ReportesCajaChicaModal from './ModalReportesCajaChica';


export default function CajaChicaModern() {
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState(null);
  const [estadoReintegro, setEstadoReintegro] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [tempMaximo, setTempMaximo] = useState(1000);
  const [tempMinimo, setTempMinimo] = useState(100);
  const [montoIngreso, setMontoIngreso] = useState('');
  const [descripcionIngreso, setDescripcionIngreso] = useState('');
  const [showReportesModal, setShowReportesModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    operationType: 'egreso',
    reason: ''
  });
  const [voucher, setVoucher] = useState(null);

  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    totalTransacciones: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAuthError = (response) => {
    if (response.status === 401) {
      Swal.fire({
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      });
      return true;
    }
    return false;
  };

  const obtenerMovimientos = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/cajaChica`, {
        headers: getAuthHeaders()
      });
      
      if (handleAuthError(response)) return;
      
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
        calcularEstadisticas(data);
      }
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
    }
  };

  const obtenerBalance = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/cajaChica/balance`, {
        headers: getAuthHeaders()
      });
      
      if (handleAuthError(response)) return;
      
      const data = await response.json();
      if (response.ok) {
        setBalance(data.currentBalance);
      }
    } catch (error) {
      console.error('Error obteniendo balance:', error);
    }
  };

  const obtenerConfiguracion = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/cajaChicaConfig`, {
        headers: getAuthHeaders()
      });
      
      if (handleAuthError(response)) return;
      
      const data = await response.json();
      if (response.ok && data.success) {
        setConfiguracion(data.data);
        setTempMaximo(data.data.maximoPermitido);
        setTempMinimo(data.data.minimoReintegro);
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }
  };

  const verificarReintegro = async () => {
    try {
      const response = await fetch(`${config.api.API_URL}/cajaChicaConfig/verificar-reintegro`, {
        headers: getAuthHeaders()
      });
      
      if (handleAuthError(response)) return;
      
      const data = await response.json();
      if (response.ok && data.success) {
        setEstadoReintegro(data.data);
      }
    } catch (error) {
      console.error('Error verificando reintegro:', error);
    }
  };

  const descargarReporteIndividual = async (transaccionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.API_URL}/reportesCajaChica/individual/${transaccionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        Swal.fire({
          title: 'No autorizado',
          text: 'No tienes permisos para descargar este reporte',
          icon: 'error'
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Error al descargar el reporte');
      }

      console.log('STATUS:', response.status);
console.log('CONTENT-TYPE:', response.headers.get('content-type'));

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_individual_${transaccionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        title: 'Descarga exitosa',
        text: 'El reporte se ha descargado correctamente',
        icon: 'success',
        timer: 2000
      });
    } catch (error) {
      console.error('Error descargando reporte:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo descargar el reporte',
        icon: 'error'
      });
    }
  };

  // 🆕 FUNCIÓN PARA GENERAR VALE
  const generarVale = async (transaccion) => {
  const { value: formValues } = await Swal.fire({
    title: '📄 Generar Vale',
    input: 'text',
    inputLabel: 'Nombre del beneficiario',
    showCancelButton: true
  });

  if (!formValues) return;

  Swal.fire({
    title: 'Generando vale...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(
      `${config.api.API_URL}/cajaChica/${transaccion._id}/generar-vale`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreBeneficiario: formValues,
          cantidadLetras: 'PENDIENTE'
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al generar el vale');
    }

    // ✅ ABRIR PDF DESDE CLOUDINARY
    window.open(data.voucher, '_blank');

    Swal.fire({
      title: '¡Vale generado!',
      icon: 'success',
      timer: 2000
    });

    await cargarDatos();

  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error'
    });
  }
};


  const guardarConfiguracion = async () => {
    const { value: codigoSeguridad } = await Swal.fire({
      title: '🔒 Código de Seguridad',
      text: 'Ingresa el código de seguridad de Caja Chica',
      input: 'password',
      inputPlaceholder: 'Ingresa tu código',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el código de seguridad';
        }
      }
    });

    if (!codigoSeguridad) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        Swal.fire({ 
          title: 'Error', 
          text: 'No se encontró token de autenticación. Por favor inicia sesión nuevamente.', 
          icon: 'error' 
        });
        return;
      }

      const response = await fetch(`${config.api.API_URL}/cajaChicaConfig`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          maximoPermitido: tempMaximo,
          minimoReintegro: tempMinimo,
          password: codigoSeguridad
        })
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        Swal.fire({ 
          title: 'No autorizado', 
          text: data.message || 'No tienes permisos para actualizar la configuración o el código de seguridad es incorrecto.', 
          icon: 'error' 
        });
        return;
      }
      
      if (response.ok && data.success) {
        setConfiguracion({ maximoPermitido: tempMaximo, minimoReintegro: tempMinimo });
        setShowConfigModal(false);
        await Swal.fire({
          title: '¡Configuración Guardada!',
          text: 'Los límites se han actualizado correctamente',
          icon: 'success',
          timer: 2000
        });
        await cargarDatos();
      } else {
        throw new Error(data.message || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error completo:', error);
      Swal.fire({ 
        title: 'Error', 
        text: error.message || 'Error al guardar la configuración', 
        icon: 'error' 
      });
    }
  };

  const registrarIngreso = async () => {
    if (!montoIngreso || !descripcionIngreso) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        icon: 'warning'
      });
      return;
    }

    const { value: password } = await Swal.fire({
      title: '🔒 Código de Seguridad',
      text: 'Ingresa el código de seguridad de Caja Chica',
      input: 'password',
      inputPlaceholder: 'Ingresa tu código',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el código de seguridad';
        }
      }
    });

    if (!password) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', montoIngreso);
      formDataToSend.append('reason', descripcionIngreso);
      formDataToSend.append('password', password);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.API_URL}/cajaChica/ingreso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      const data = await response.json();
      
      if (response.status === 401) {
        Swal.fire({ 
          title: 'Código Incorrecto', 
          text: data.message || 'El código de seguridad es incorrecto.', 
          icon: 'error' 
        });
        return;
      }
      
      if (response.ok) {
        await Swal.fire({
          title: '¡Ingreso Registrado!',
          text: data.message,
          icon: 'success',
          timer: 2000
        });
        setShowIngresoModal(false);
        setMontoIngreso('');
        setDescripcionIngreso('');
        await cargarDatos();
      } else {
        throw new Error(data.message || 'Error al registrar ingreso');
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
    }
  };

  const registrarReintegro = async () => {
    const { value: password } = await Swal.fire({
      title: '🔒 Código de Seguridad',
      text: 'Ingresa el código de seguridad de Caja Chica',
      input: 'password',
      inputPlaceholder: 'Ingresa tu código',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el código de seguridad';
        }
      }
    });

    if (!password) {
      return;
    }

    const result = await Swal.fire({
      title: '¿Registrar Reintegro?',
      html: `
        <p>Se registrará un ingreso de <strong>${estadoReintegro?.reintegroNecesario?.toFixed(2)}</strong></p>
        <p>Balance actual: ${balance.toFixed(2)}</p>
        <p>Balance después: ${configuracion?.maximoPermitido?.toFixed(2)}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${config.api.API_URL}/cajaChicaConfig/registrar-reintegro`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ password })
        });
        const data = await response.json();
        
        if (response.status === 401) {
          Swal.fire({ 
            title: 'Código Incorrecto', 
            text: data.message || 'El código de seguridad es incorrecto.', 
            icon: 'error' 
          });
          return;
        }
        
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
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
      }
    }
  };

  const registrarEgreso = async () => {
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

      if (voucher) {
        formDataToSend.append('voucher', voucher);
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.API_URL}/cajaChica/egreso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
    }
  };

  const calcularEstadisticas = (movimientos) => {
    const ingresos = movimientos.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
    const gastos = movimientos.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    setStats({ totalIngresos: ingresos, totalGastos: gastos, totalTransacciones: movimientos.length });
  };

  const limpiarFormulario = () => {
    setFormData({ amount: '', operationType: 'egreso', reason: '' });
    setVoucher(null);
    const fileInput = document.getElementById('voucher');
    if (fileInput) fileInput.value = '';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad);
  };

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
const abrirArchivo = (url) => {
  if (!url || typeof url !== 'string') {
    Swal.fire({
      title: 'Archivo no disponible',
      text: 'No existe un archivo válido para mostrar',
      icon: 'warning'
    });
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Caja Chica</h1>
            <p className="text-slate-500 mt-1">Gestiona tus transacciones diarias</p>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            <Settings size={18} />
            Configurar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <div 
            onClick={() => setShowIngresoModal(true)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-sm font-medium">Total Ingresos</p>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Plus className="text-emerald-600" size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatearMoneda(stats.totalIngresos)}</h3>
            <p className="text-sm font-medium text-emerald-600">Click para agregar</p>
          </div>

          <div
            onClick={() => {
              if (estadoReintegro?.necesitaReintegro) {
                registrarReintegro();
              } else {
                Swal.fire({
                  title: 'Sin reintegro',
                  text: 'No es necesario realizar un reintegro en este momento',
                  icon: 'info'
                });
              }
            }}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all cursor-pointer ${
              estadoReintegro?.necesitaReintegro
                ? 'border-amber-300 hover:shadow-lg hover:scale-105'
                : 'border-slate-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-sm font-medium">Total Gastos</p>
              <TrendingDown
                className={estadoReintegro?.necesitaReintegro ? 'text-amber-600' : 'text-rose-500'}
                size={18}
              />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {formatearMoneda(stats.totalGastos)}
            </h3>

            <p className={`text-sm font-medium ${
              estadoReintegro?.necesitaReintegro ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {estadoReintegro?.necesitaReintegro ? 'Click para reintegrar' : 'Acumulado'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Transacción</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
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
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 cursor-pointer border-2 border-slate-200"
                >
                  <FileText size={18} />
                  {voucher ? voucher.name.substring(0, 15) + '...' : 'Comprobante'}
                </label>
              </div>
            </div>
            <button
              onClick={registrarEgreso}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              📤 Registrar Egreso
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Últimas Transacciones
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Historial completo de movimientos
                </p>
              </div>

              <button
                onClick={() => setShowReportesModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all"
              >
                <FileText size={18} />
                Generar Reportes
              </button>
            </div>

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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Monto</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Balance</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">{formatearFecha(tx.date)}</td>
                    <td className="px-6 py-4"><span className="font-medium text-slate-800">{tx.reason}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{tx.employeeId?.name || 'Admin'}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatearMoneda(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">{formatearMoneda(tx.currentBalance)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {tx.voucher ? (
                          <button
                           onClick={() => abrirArchivo(tx.voucher)}

                            title="Ver comprobante"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-100 text-indigo-600 transition-all hover:scale-110"
                          >
                            <Search size={18} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin comprobante</span>
                        )}
                        
                        {tx.type === 'expense' && (
  <button
    onClick={() => generarVale(tx)}
    title={tx.vale ? "Vale generado - Regenerar" : "Generar vale"}
    className={`p-2 rounded-lg transition-all hover:scale-110 relative ${
      tx.vale
        ? 'bg-green-100 hover:bg-green-200 text-green-700'
        : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
    }`}
  >
    <FileText size={18} />
    {tx.vale && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
    )}
  </button>
)}

                        
                        <button
                          onClick={() => descargarReporteIndividual(tx._id)}
                          title="Descargar reporte individual"
                          className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-all hover:scale-110"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">⚙️ Configuración de Caja Chica</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Máximo Permitido: ${tempMaximo.toFixed(2)}
                  </label>
                  <input
                    type="range" min="100" max="10000" step="50"
                    value={tempMaximo}
                    onChange={(e) => setTempMaximo(Number(e.target.value))}
                    className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$100</span><span>$10,000</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Mínimo para Reintegro: ${tempMinimo.toFixed(2)}
                  </label>
                  <input
                    type="range" min="10" max="1000" step="10"
                    value={tempMinimo}
                    onChange={(e) => setTempMinimo(Number(e.target.value))}
                    className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$10</span><span>$1,000</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarConfiguracion}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {showIngresoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">💰 Registrar Ingreso</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Monto</label>
                  <input
                    type="number" step="0.01" placeholder="0.00"
                    value={montoIngreso}
                    onChange={(e) => setMontoIngreso(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                  <input
                    type="text" placeholder="Concepto del ingreso"
                    value={descripcionIngreso}
                    onChange={(e) => setDescripcionIngreso(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowIngresoModal(false);
                    setMontoIngreso('');
                    setDescripcionIngreso('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarIngreso}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReportesCajaChicaModal
        isOpen={showReportesModal}
        onClose={() => setShowReportesModal(false)}
        apiUrl={config.api.API_URL}
      />
      
     
    </div>
  );
}