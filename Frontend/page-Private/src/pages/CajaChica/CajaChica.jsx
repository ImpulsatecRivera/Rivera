import React, { useState, useEffect } from 'react';
import { TrendingDown, Download, Search, FileText, Loader2, Plus, Settings, Upload } from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import './CajaChica.css';
import ReportesCajaChicaModal from './ModalReportesCajaChica';
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedAction, RoleBadge } from '../../components/Auth';
import { api } from "../../Context/authContext"


export default function CajaChicaModern() {
  const { canCreate, canDelete } = usePermissions();
  
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

  const [formData, setFormData] = useState({
    amount: '',
    operationType: 'egreso',
    reason: ''
  });

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

  const obtenerMovimientos = async () => {
    try {
      const { data } = await api.get('/cajaChica');
      setTransactions(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
    }
  };

  const obtenerBalance = async () => {
    try {
      const { data } = await api.get('/cajaChica/balance');
      setBalance(data.currentBalance);
    } catch (error) {
      console.error('Error obteniendo balance:', error);
    }
  };

  const obtenerConfiguracion = async () => {
    try {
      const { data } = await api.get('/cajaChicaConfig');
      if (data.success) {
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
      const { data } = await api.get('/cajaChicaConfig/verificar-reintegro');
      if (data.success) {
        setEstadoReintegro(data.data);
      }
    } catch (error) {
      console.error('Error verificando reintegro:', error);
    }
  };

  const descargarReporteIndividual = async (transaccionId) => {
    try {
      const response = await api.get(`/reportesCajaChica/individual/${transaccionId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
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
        text: error.response?.status === 401 ? 'No tienes permisos para descargar este reporte' : 'No se pudo descargar el reporte',
        icon: 'error'
      });
    }
  };

  const subirComprobante = async (transaccion) => {
    const { value: file } = await Swal.fire({
      title: 'Subir Comprobante',
      html: `
        <div class="px-4 py-2">
          <p class="text-sm text-gray-600 mb-4">Selecciona una imagen o PDF del comprobante</p>
          <label for="swal-input-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5F8EAD] hover:bg-gray-50 transition-all">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="mb-2 text-sm text-gray-500">
                <span class="font-semibold">Click para seleccionar</span> o arrastra
              </p>
              <p class="text-xs text-gray-400">Imágenes (JPG, PNG) o PDF (MAX. 10MB)</p>
            </div>
            <input type="file" id="swal-input-file" accept="image/*,.pdf" class="hidden" onchange="document.getElementById('file-name').textContent = this.files[0]?.name || 'Sin archivos seleccionados'; document.getElementById('file-name').className = this.files[0] ? 'text-base font-semibold text-center text-[#5F8EAD] mt-3 break-all px-2' : 'text-sm text-center text-gray-500 mt-2';">
          </label>
          <p id="file-name" class="text-sm text-center text-gray-500 mt-2">Sin archivos seleccionados</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      width: '90%',
      maxWidth: '500px',
      customClass: {
        container: 'swal-responsive',
        popup: 'rounded-2xl',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
        cancelButton: 'px-6 py-2.5 rounded-lg font-medium'
      },
      preConfirm: () => {
        const fileInput = document.getElementById('swal-input-file');
        if (!fileInput.files[0]) {
          Swal.showValidationMessage('Debes seleccionar un archivo');
          return false;
        }
        return fileInput.files[0];
      }
    });

    if (!file) return;

    Swal.fire({
      title: 'Subiendo comprobante...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const formData = new FormData();
      formData.append('voucher', file);

      await api.patch(`/cajaChica/movements/${transaccion._id}/voucher`, formData);

      Swal.fire({
        title: '¡Comprobante subido!',
        text: 'El comprobante se ha subido correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      await cargarDatos();
    } catch (error) {
      console.error('💥 Error subiendo comprobante:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo subir el comprobante',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const generarVale = async (transaccion) => {
    const { value: formValues } = await Swal.fire({
      title: 'Generar Vale',
      input: 'text',
      inputLabel: 'Nombre del beneficiario',
      inputPlaceholder: 'Ingresa el nombre completo',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el nombre del beneficiario';
        }
      }
    });

    if (!formValues) return;

    Swal.fire({
      title: 'Generando vale...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const { data } = await api.post(`/cajaChica/${transaccion._id}/generar-vale`, {
        nombreBeneficiario: formValues
      });
      
      if (data.voucher) {
        window.open(data.voucher, '_blank', 'noopener,noreferrer');

        Swal.fire({
          title: '¡Vale generado!',
          html: `
            <p><strong>Número de vale:</strong> ${data.vale || 'N/A'}</p>
            <p class="text-sm text-gray-500 mt-2">${data.message}</p>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });

        await cargarDatos();
      } else {
        throw new Error('La respuesta no contiene la URL del vale');
      }
    } catch (error) {
      console.error('💥 Error generando vale:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo generar el vale',
        icon: 'error',
        confirmButtonText: 'OK'
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
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el código de seguridad';
        }
      }
    });

    if (!codigoSeguridad) return;

    try {
      const { data } = await api.put('/cajaChicaConfig', {
        maximoPermitido: tempMaximo,
        minimoReintegro: tempMinimo,
        password: codigoSeguridad
      });
      
      if (data.success) {
        setConfiguracion({ maximoPermitido: tempMaximo, minimoReintegro: tempMinimo });
        setShowConfigModal(false);
        await Swal.fire({
          title: '¡Configuración Guardada!',
          text: 'Los límites se han actualizado correctamente',
          icon: 'success',
          timer: 2000
        });
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error completo:', error);
      Swal.fire({ 
        title: error.response?.status === 401 ? 'No autorizado' : 'Error',
        text: error.response?.data?.message || 'Error al guardar la configuración', 
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
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar el código de seguridad';
        }
      }
    });

    if (!password) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', montoIngreso);
      formDataToSend.append('reason', descripcionIngreso);
      formDataToSend.append('password', password);

      const { data } = await api.post('/cajaChica/ingreso', formDataToSend);
      
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
    } catch (error) {
      Swal.fire({ 
        title: error.response?.status === 401 ? 'Código Incorrecto' : 'Error',
        text: error.response?.data?.message || 'Error al registrar ingreso', 
        icon: 'error' 
      });
    }
  };

  const registrarReintegro = async () => {
    if (!configuracion) {
      Swal.fire({ title: 'Configuración faltante', text: 'Debes configurar el máximo permitido antes de realizar reintegros.', icon: 'warning' });
      return;
    }

    const montoSugerido = (configuracion?.maximoPermitido || 0) - balance;

    if (!montoSugerido || montoSugerido <= 0) {
      Swal.fire({ title: 'No es necesario', text: 'El balance ya alcanza o supera el máximo permitido. No se registrará ningún reintegro.', icon: 'info' });
      return;
    }

    const { value: password } = await Swal.fire({
      title: '🔒 Código de Seguridad',
      html: `Se generará un reintegro automático por <strong>$${montoSugerido.toFixed(2)}</strong> (no superará el máximo permitido). Ingresa el código de seguridad para confirmar.`,
      input: 'password',
      inputPlaceholder: 'Ingresa tu código',
      inputAttributes: { autocapitalize: 'off', autocorrect: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar el código de seguridad';
      }
    });

    if (!password) return;

    try {
      const { data } = await api.post('/cajaChicaConfig/registrar-reintegro', { password });

      if (data.success) {
        await Swal.fire({ title: '¡Reintegro Registrado!', text: data.message, icon: 'success', timer: 2000 });
        await cargarDatos();
      }
    } catch (error) {
      Swal.fire({ 
        title: error.response?.status === 401 ? 'Código Incorrecto' : 'Error',
        text: error.response?.data?.message || 'Error al registrar reintegro', 
        icon: 'error' 
      });
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

      const { data } = await api.post('/cajaChica/egreso', formDataToSend);

      await Swal.fire({
        title: '¡Egreso Registrado!',
        text: data.message,
        icon: 'success',
        timer: 2000
      });
      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      Swal.fire({ 
        title: 'Error', 
        text: error.response?.data?.message || 'Error al registrar egreso', 
        icon: 'error' 
      });
    }
  };

  const calcularEstadisticas = (movimientos) => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    const movimientosSemana = movimientos.filter(m => {
      const d = new Date(m.date);
      return d >= monday && d <= sunday;
    });

    const ingresos = movimientosSemana.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
    const gastos = movimientosSemana.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    setStats({ totalIngresos: ingresos, totalGastos: gastos, totalTransacciones: movimientosSemana.length });
  };

  const limpiarFormulario = () => {
    setFormData({ amount: '', operationType: 'egreso', reason: '' });
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
          <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando caja chica...</p>
        </div>
      </div>
    );
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#34353A]">Caja Chica</h1>
            <p className="text-slate-500 mt-1">Gestiona tus transacciones diarias</p>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 bg-[#34353A] text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            <Settings size={18} />
            Configurar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-[#34353A] to-[#5F8EAD] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
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
              <p className="text-slate-600 text-sm font-medium">Ingresos (Semana)</p>
              <div className="bg-[#5D9646] bg-opacity-20 p-2 rounded-lg">
                <Plus className="text-[#5D9646]" size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#34353A] mb-2">{formatearMoneda(stats.totalIngresos)}</h3>
            <p className="text-sm font-medium text-[#5D9646]">Click para agregar</p>
          </div>

          <div
            onClick={() => registrarReintegro()}
            className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all cursor-pointer hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-sm font-medium">Gastos (Semana)</p>
              <TrendingDown
                className={'text-amber-600'}
                size={18}
              />
            </div>

            <h3 className="text-2xl font-bold text-[#34353A] mb-2">
              {formatearMoneda(stats.totalGastos)}
            </h3>

            <p className={`text-sm font-medium text-amber-600`}>
              Click para reintegrar
            </p>
          </div>
        </div>

        {/* Registrar Transacción */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-[#34353A] mb-4">Registrar Transacción</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={registrarEgreso}
              className="w-full bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white py-3 rounded-xl font-medium hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
            >
              📤 Registrar Egreso
            </button>
          </div>
        </div>

        {/* Tabla Transacciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#34353A]">
                  Últimas Transacciones
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Historial completo de movimientos
                </p>
              </div>

              <button
                onClick={() => setShowReportesModal(true)}
                className="flex items-center gap-2 bg-[#5D9646] text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all"
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
                      ? 'bg-[#34353A] text-white'
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
              <thead className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] border-b-2 border-[#5D9646]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Usuario</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase">Monto</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase">Balance</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">{formatearFecha(tx.date)}</td>
                    <td className="px-6 py-4"><span className="font-medium text-[#34353A]">{tx.reason}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${tx.type === 'income' ? 'bg-[#5D9646] bg-opacity-20 text-[#5D9646] border border-[#5D9646]' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{tx.employeeId?.name || 'Admin'}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'income' ? 'text-[#5D9646]' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatearMoneda(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-[#34353A] font-mono text-sm font-semibold">{formatearMoneda(tx.currentBalance)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {tx.voucher ? (
                          <button
                            onClick={() => abrirArchivo(tx.voucher)}
                            title="Ver comprobante"
                            className="p-2 rounded-lg bg-[#5F8EAD] bg-opacity-20 hover:bg-[#5F8EAD] hover:bg-opacity-30 text-[#5F8EAD] transition-all hover:scale-110"
                          >
                            <Search size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => subirComprobante(tx)}
                            title="Subir comprobante"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all hover:scale-110"
                          >
                            <Upload size={18} />
                          </button>
                        )}
                        
                        {tx.type === 'expense' && (
                          <>
                            {tx.ticket && (
                              <button
                                onClick={() => abrirArchivo(tx.ticket)}
                                title={`Ver vale ${tx.vale || 'generado'}`}
                                className="p-2 rounded-lg transition-all hover:scale-110 bg-[#5D9646] bg-opacity-20 hover:bg-[#5D9646] hover:bg-opacity-30 text-[#5D9646] relative"
                              >
                                <FileText size={18} />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#5D9646] rounded-full border-2 border-white"></span>
                              </button>
                            )}
                            
                            {!tx.ticket && (
                              <button
                                onClick={() => generarVale(tx)}
                                title="Generar vale"
                                className="p-2 rounded-lg transition-all hover:scale-110 bg-amber-100 hover:bg-amber-200 text-amber-700"
                              >
                                <FileText size={18} />
                              </button>
                            )}
                          </>
                        )}
                        
                        <button
                          onClick={() => descargarReporteIndividual(tx._id)}
                          title="Descargar reporte individual"
                          className="p-2 rounded-lg bg-[#5D9646] bg-opacity-20 hover:bg-[#5D9646] hover:bg-opacity-30 text-[#5D9646] transition-all hover:scale-110"
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

        {/* Modal Configuración */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-[#34353A] mb-6">⚙️ Configuración de Caja Chica</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-3">
                    Máximo Permitido: {'$' + tempMaximo.toFixed(2)}
                  </label>
                  <input
                    type="number" min="100" max="10000" step="0.01"
                    value={tempMaximo}
                    onChange={(e) => setTempMaximo(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span className="text-xs">mín 100</span><span className="text-xs">máx 10000</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-3">
                    Mínimo para Reintegro: {'$' + tempMinimo.toFixed(2)}
                  </label>
                  <input
                    type="number" min="0" max="10000" step="0.01"
                    value={tempMinimo}
                    onChange={(e) => setTempMinimo(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span className="text-xs">mín 0</span><span className="text-xs">máx 10000</span>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ingreso */}
        {showIngresoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-[#34353A] mb-6">💰 Registrar Ingreso</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">Monto</label>
                  <input
                    type="number" step="0.01" placeholder="0.00"
                    value={montoIngreso}
                    onChange={(e) => setMontoIngreso(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#5D9646] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#34353A] mb-2">Descripción</label>
                  <input
                    type="text" placeholder="Concepto del ingreso"
                    value={descripcionIngreso}
                    onChange={(e) => setDescripcionIngreso(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#5D9646] focus:outline-none transition-colors"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#5D9646] to-[#5F8EAD] text-white rounded-xl font-medium hover:opacity-90 transition-all"
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