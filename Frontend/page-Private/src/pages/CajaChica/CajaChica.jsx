import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingDown, Download, Search, FileText, Loader2, Plus, Settings, 
  Upload, X, ChevronDown, ChevronUp, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, Eye, Check, AlertCircle, TrendingUp,
  Filter, RefreshCw, Maximize2, Sparkles
} from 'lucide-react';
import Lottie from 'lottie-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import './CajaChica.css';
import ReportesCajaChicaModal from './ModalReportesCajaChica';
import { usePermissions } from '../../hooks/usePermissions';
import { api } from "../../Context/authContext";

// 🎨 Importar animaciones Lottie
import loadingAnimation from '../../assets/lotties/Sandy Loading.json';
import emptyBoxAnimation from '../../assets/lotties/empty.json';
import successAnimation from '../../assets/lotties/Thumbs up birdie.json';
import warningAnimation from '../../assets/lotties/Alert Notification Character.json';
import moneyAnimation from '../../assets/lotties/Piggy Bank - Coin In.json';

const showLottieAlert = (type, title, text = '') => {
  let lottieData;
  let lottieSize = 150;
  let confirmButtonColor = '#5F8EAD';

  switch (type) {
    case 'success':
      lottieData = successAnimation;
      lottieSize = 180;
      confirmButtonColor = '#5D9646';
      break;
    case 'warning':
      lottieData = warningAnimation;
      lottieSize = 180;
      confirmButtonColor = '#f59e0b';
      break;
    case 'error':
      lottieData = warningAnimation;
      lottieSize = 180;
      confirmButtonColor = '#ef4444';
      break;
    case 'money':
      lottieData = moneyAnimation;
      lottieSize = 200;
      confirmButtonColor = '#5D9646';
      break;
    default:
      lottieData = successAnimation;
  }

  Swal.fire({
    title: title,
    html: `
      <div id="lottie-container" style="margin: 20px auto;"></div>
      ${text ? `<p style="color: #64748b; font-size: 15px; margin-top: 15px; line-height: 1.5;">${text}</p>` : ''}
    `,
    showConfirmButton: true,
    confirmButtonText: 'Entendido ✓',
    confirmButtonColor: confirmButtonColor,
    allowOutsideClick: false,
    customClass: {
      popup: 'rounded-3xl shadow-2xl',
      title: 'text-2xl font-bold text-gray-800 mb-2',
      confirmButton: 'px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200'
    },
    didOpen: () => {
      const container = document.getElementById('lottie-container');
      if (container) {
        Lottie.loadAnimation({
          container: container,
          animationData: lottieData,
          loop: type === 'success' ? false : true,
          autoplay: true,
          renderer: 'svg'
        });
        
        container.style.width = `${lottieSize}px`;
        container.style.height = `${lottieSize}px`;
      }
    }
  });
};

const showLottieToast = (type, title, duration = 3000) => {
  let lottieData;
  let background = '#fff';
  
  switch (type) {
    case 'success':
      lottieData = successAnimation;
      background = 'linear-gradient(135deg, #5D9646 0%, #5F8EAD 100%)';
      break;
    case 'error':
      lottieData = warningAnimation;
      background = 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)';
      break;
    case 'warning':
      lottieData = warningAnimation;
      background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      break;
    case 'info':
      lottieData = successAnimation;
      background = 'linear-gradient(135deg, #5F8EAD 0%, #34353A 100%)';
      break;
    default:
      lottieData = successAnimation;
  }

  Swal.fire({
    title: title,
    html: '<div id="toast-lottie-container" style="width: 80px; height: 80px; margin: 10px auto;"></div>',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
    background: background,
    color: '#fff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-base font-bold'
    },
    didOpen: (toast) => {
      const container = document.getElementById('toast-lottie-container');
      if (container) {
        Lottie.loadAnimation({
          container: container,
          animationData: lottieData,
          loop: false,
          autoplay: true,
          renderer: 'svg'
        });
      }
      
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

export default function CajaChicaModern() {
  const { canCreate, canDelete } = usePermissions();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState(null);
  const [estadoReintegro, setEstadoReintegro] = useState(null);
  
  // Estados para panels expandibles
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showIngresoForm, setShowIngresoForm] = useState(false);
  const [showEgresoForm, setShowEgresoForm] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para hover en botones
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  
  // Form states
  const [tempMaximo, setTempMaximo] = useState(1000);
  const [tempMinimo, setTempMinimo] = useState(100);
  const [montoIngreso, setMontoIngreso] = useState('');
  const [descripcionIngreso, setDescripcionIngreso] = useState('');
  const [montoEgreso, setMontoEgreso] = useState('');
  const [descripcionEgreso, setDescripcionEgreso] = useState('');
  const [showReportesModal, setShowReportesModal] = useState(false);

  // Refs para Lottie
  const loadingLottieRef = useRef();
  const moneyLottieRef = useRef();

  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    totalTransacciones: 0,
    ingresosHoy: 0,
    gastosHoy: 0
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
      showLottieToast('error', '❌ Error al cargar datos');
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

  const calcularEstadisticas = (movimientos) => {
    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
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

    const movimientosHoy = movimientos.filter(m => {
      const d = new Date(m.date);
      return d >= hoy;
    });

    const ingresos = movimientosSemana.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
    const gastos = movimientosSemana.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    const ingresosHoy = movimientosHoy.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
    const gastosHoy = movimientosHoy.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    
    setStats({ 
      totalIngresos: ingresos, 
      totalGastos: gastos, 
      totalTransacciones: movimientosSemana.length,
      ingresosHoy,
      gastosHoy
    });
  };

  const guardarConfiguracion = async () => {
    const { value: codigoSeguridad } = await Swal.fire({
      title: '🔒 Código de Seguridad',
      text: 'Ingresa el código para guardar la configuración',
      input: 'password',
      inputPlaceholder: 'Código de seguridad',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      },
      inputValidator: (value) => !value && 'Debes ingresar el código de seguridad'
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
        setShowConfigPanel(false);
        
        // 🎨 Alert con Lottie de Success
        showLottieAlert(
          'success',
          '¡Configuración Guardada! ✅',
          `Máximo: ${formatearMoneda(tempMaximo)} | Mínimo: ${formatearMoneda(tempMinimo)}`
        );
        
        await cargarDatos();
      }
    } catch (error) {
      showLottieAlert(
        'error',
        error.response?.status === 401 ? '🔒 Código Incorrecto' : '❌ Error',
        error.response?.data?.message || 'No se pudo guardar la configuración'
      );
    }
  };

  const registrarIngreso = async () => {
    if (!montoIngreso || !descripcionIngreso) {
      showLottieAlert('warning', '⚠️ Campos Incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    const { value: password } = await Swal.fire({
      title: '🔒 Confirmar Ingreso',
      text: `Ingreso de ${formatearMoneda(parseFloat(montoIngreso))}`,
      input: 'password',
      inputPlaceholder: 'Código de seguridad',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      },
      inputValidator: (value) => !value && 'Debes ingresar el código de seguridad'
    });

    if (!password) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', montoIngreso);
      formDataToSend.append('reason', descripcionIngreso);
      formDataToSend.append('password', password);

      await api.post('/cajaChica/ingreso', formDataToSend);
      
      // 🎨 Alert con Lottie de Money
      showLottieAlert(
        'money',
        '¡Ingreso Registrado! 💰',
        `Se agregaron ${formatearMoneda(parseFloat(montoIngreso))} a caja chica exitosamente`
      );
      
      setShowIngresoForm(false);
      setMontoIngreso('');
      setDescripcionIngreso('');
      await cargarDatos();
    } catch (error) {
      showLottieAlert(
        'error',
        error.response?.status === 401 ? '🔒 Código Incorrecto' : '❌ Error',
        error.response?.data?.message || 'No se pudo registrar el ingreso'
      );
    }
  };

  const registrarEgreso = async () => {
    if (!montoEgreso || !descripcionEgreso) {
      showLottieAlert('warning', '⚠️ Campos Incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', montoEgreso);
      formDataToSend.append('reason', descripcionEgreso);

      await api.post('/cajaChica/egreso', formDataToSend);

      // 🎨 Alert con Lottie de Success
      showLottieAlert(
        'success',
        '¡Egreso Registrado! ✅',
        `Se registró el gasto de ${formatearMoneda(parseFloat(montoEgreso))} correctamente`
      );
      
      setShowEgresoForm(false);
      setMontoEgreso('');
      setDescripcionEgreso('');
      await cargarDatos();
    } catch (error) {
      showLottieAlert(
        'error',
        '❌ Error al Registrar',
        error.response?.data?.message || 'No se pudo registrar el egreso'
      );
    }
  };

  const registrarReintegro = async () => {
    if (!configuracion) {
      showLottieAlert('warning', '⚠️ Configuración Faltante', 'Debes configurar los límites de caja chica primero');
      return;
    }

    const montoSugerido = (configuracion?.maximoPermitido || 0) - balance;

    if (montoSugerido <= 0) {
      showLottieAlert('success', '✅ Balance Óptimo', 'El balance actual ya alcanza el máximo permitido');
      return;
    }

    const { value: password } = await Swal.fire({
      title: '🔒 Confirmar Reintegro',
      html: `
        <div class="text-center">
          <p class="text-gray-600 mb-2">Se reintegrará automáticamente:</p>
          <p class="text-3xl font-bold text-[#5D9646]">${formatearMoneda(montoSugerido)}</p>
          <p class="text-sm text-gray-500 mt-2">Balance final: ${formatearMoneda(configuracion.maximoPermitido)}</p>
        </div>
      `,
      input: 'password',
      inputPlaceholder: 'Código de seguridad',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Reintegro',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      },
      inputValidator: (value) => !value && 'Debes ingresar el código de seguridad'
    });

    if (!password) return;

    try {
      await api.post('/cajaChicaConfig/registrar-reintegro', { password });

      // 🎨 Alert con Lottie de Money
      showLottieAlert(
        'money',
        '¡Reintegro Exitoso! 💸',
        `Se agregaron ${formatearMoneda(montoSugerido)} a caja chica. Balance actualizado a ${formatearMoneda(configuracion.maximoPermitido)}`
      );
      
      await cargarDatos();
    } catch (error) {
      showLottieAlert(
        'error',
        error.response?.status === 401 ? '🔒 Código Incorrecto' : '❌ Error',
        error.response?.data?.message || 'No se pudo registrar el reintegro'
      );
    }
  };

  const descargarReporteIndividual = async (transaccionId) => {
    // Mostrar alerta de procesando
    Swal.fire({
      title: 'Procesando...',
      html: '<div style="text-align: center;"><div style="border: 4px solid #f3f3f3; border-top: 4px solid #5F8EAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div><p style="margin-top: 10px; color: #666;">Generando reporte, por favor espera</p></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
    });

    try {
      const response = await api.get(`/reportesCajaChica/individual/${transaccionId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${transaccionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mostrar alerta de éxito
      Swal.fire({
        icon: 'success',
        title: 'Reporte generado',
        html: `<p style="color: #666;"><strong>Reporte Individual</strong></p><p style="color: #999; font-size: 14px;">reporte_${transaccionId}.pdf</p>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#5F8EAD',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error descargando reporte:', error);
      
      // Extraer el mensaje de error
      let errorMessage = 'No se pudo generar el reporte. Intenta nuevamente.';
      let errorDetails = '';
      
      const showError = (msg, details = '') => {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar reporte',
          html: `<p style="color: #666;">${msg}</p>${details}`,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#5F8EAD'
        });
      };

      // Verificar si hay respuesta del servidor
      if (error.response) {
        if (error.response.status === 404 || error.response.status === 400) {
          if (error.response.data instanceof Blob) {
            error.response.data.text().then(text => {
              try {
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || 'No se pudo generar el reporte';
                if (error.response.status) {
                  errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
                }
                showError(errorMessage, errorDetails);
              } catch (e) {
                errorMessage = 'No se pudo generar el reporte';
                showError(errorMessage);
              }
            });
            return;
          } else if (typeof error.response.data === 'object') {
            errorMessage = error.response.data.message || 'No se pudo generar el reporte';
          }
        } else {
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
        
        if (error.response.status) {
          errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar alerta de error
      showError(errorMessage, errorDetails);
    }
  };

  const subirComprobante = async (transaccion) => {
    const { value: file } = await Swal.fire({
      title: '📎 Subir Comprobante',
      html: `
        <div class="px-4 py-2">
          <label for="swal-input-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5F8EAD] hover:bg-gray-50 transition-all">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm text-gray-500">Click para seleccionar archivo</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG o PDF (MAX. 10MB)</p>
            </div>
            <input type="file" id="swal-input-file" accept="image/*,.pdf" class="hidden" onchange="document.getElementById('file-name').textContent = this.files[0]?.name || 'Sin archivo';">
          </label>
          <p id="file-name" class="text-sm text-center text-gray-500 mt-2">Sin archivo seleccionado</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Subir Archivo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      },
      preConfirm: () => {
        const fileInput = document.getElementById('swal-input-file');
        if (!fileInput.files[0]) {
          Swal.showValidationMessage('Por favor selecciona un archivo');
          return false;
        }
        return fileInput.files[0];
      }
    });

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('voucher', file);

      await api.patch(`/cajaChica/movements/${transaccion._id}/voucher`, formData);

      // 🎨 Alert con Lottie de Success
      showLottieAlert(
        'success', 
        '¡Comprobante Subido! 📎', 
        'El archivo se guardó correctamente en el sistema'
      );

      await cargarDatos();
    } catch (error) {
      showLottieAlert(
        'error', 
        '❌ Error al Subir', 
        'No se pudo guardar el comprobante. Intenta nuevamente.'
      );
    }
  };

  const generarVale = async (transaccion) => {
    const { value: formValues } = await Swal.fire({
      title: '📄 Generar Vale',
      input: 'text',
      inputLabel: 'Nombre completo del beneficiario',
      inputPlaceholder: 'Ej: Juan Pérez García',
      showCancelButton: true,
      confirmButtonText: 'Generar Vale',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      },
      inputValidator: (value) => !value && 'Por favor ingresa el nombre del beneficiario'
    });

    if (!formValues) return;

    // Mostrar alerta de procesando
    Swal.fire({
      title: 'Procesando...',
      html: '<div style="text-align: center;"><div style="border: 4px solid #f3f3f3; border-top: 4px solid #5F8EAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div><p style="margin-top: 10px; color: #666;">Generando vale, por favor espera</p></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
    });

    try {
      const { data } = await api.post(`/cajaChica/${transaccion._id}/generar-vale`, {
        nombreBeneficiario: formValues
      });
      
      if (data.voucher) {
        window.open(data.voucher, '_blank', 'noopener,noreferrer');

        // Mostrar alerta de éxito
        Swal.fire({
          icon: 'success',
          title: 'Vale generado',
          html: `<p style="color: #666;"><strong>Vale #${data.vale || 'N/A'}</strong></p><p style="color: #999; font-size: 14px;">Creado exitosamente y listo para descargar</p>`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#5F8EAD',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          cargarDatos();
        });
      }
    } catch (error) {
      console.error('Error generando vale:', error);
      
      // Extraer el mensaje de error
      let errorMessage = 'No se pudo generar el vale. Intenta nuevamente.';
      let errorDetails = '';
      
      const showError = (msg, details = '') => {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar vale',
          html: `<p style="color: #666;">${msg}</p>${details}`,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#5F8EAD'
        });
      };

      // Verificar si hay respuesta del servidor
      if (error.response) {
        if (error.response.status === 404 || error.response.status === 400) {
          // Si es un Blob, intentar convertirlo a texto y parsearlo
          if (error.response.data instanceof Blob) {
            error.response.data.text().then(text => {
              try {
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || 'No se pudo generar el vale';
                if (error.response.status) {
                  errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
                }
                showError(errorMessage, errorDetails);
              } catch (e) {
                errorMessage = 'No se pudo generar el vale';
                showError(errorMessage);
              }
            });
            return;
          } else if (typeof error.response.data === 'object') {
            errorMessage = error.response.data.message || 'No se pudo generar el vale';
          }
        } else {
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
        
        if (error.response.status) {
          errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar alerta de error
      showError(errorMessage, errorDetails);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad);
  };

  const abrirArchivo = (url) => {
    if (!url) {
      showLottieAlert('warning', '⚠️ Archivo No Disponible', 'El archivo solicitado no se encontró en el sistema');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.employeeId?.name || 'Admin').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const txDate = new Date(tx.date);

    if (filterType === 'week') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1 - day);
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0,0,0,0);
      return txDate >= monday;
    }

    if (filterType === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return txDate >= firstDay;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lottie
            lottieRef={loadingLottieRef}
            animationData={loadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 250, height: 250, margin: '0 auto' }}
          />
          <p className="text-gray-600 font-medium text-lg mt-4">Cargando caja chica...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo datos financieros</p>
        </div>
      </div>
    );
  }

  const porcentajeBalance = configuracion ? (balance / configuracion.maximoPermitido) * 100 : 0;
  const necesitaReintegro = configuracion && balance < configuracion.minimoReintegro;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#34353A]">💰 Caja Chica</h1>
              <p className="text-sm text-gray-500 mt-1">Gestión de movimientos financieros</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportesModal(true)}
                onMouseEnter={() => setHoveredButton('reportes')}
                onMouseLeave={() => setHoveredButton(null)}
                className="hidden md:flex items-center gap-2 bg-[#5D9646] text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all hover:scale-105 relative overflow-hidden"
              >
                {hoveredButton === 'reportes' && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <Lottie
                      animationData={successAnimation}
                      loop={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                <FileText size={18} />
                <span className="relative z-10">Reportes</span>
              </button>
              
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 ${
                  showConfigPanel 
                    ? 'bg-[#34353A] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings size={18} className={showConfigPanel ? 'animate-spin' : ''} />
                <span className="hidden md:inline">Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Balance Principal con Lottie Animation */}
        <div className="bg-gradient-to-br from-[#34353A] via-[#5F8EAD] to-[#5D9646] rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Lottie de fondo decorativo */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Lottie
              animationData={moneyAnimation}
              loop={true}
              style={{ width: 300, height: 300 }}
            />
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Balance Disponible
                </p>
                <h2 className="text-4xl md:text-6xl font-bold mb-2">{formatearMoneda(balance)}</h2>
                {configuracion && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/80">
                      {porcentajeBalance.toFixed(1)}% del límite máximo
                    </span>
                    {necesitaReintegro && (
                      <span className="bg-amber-500/20 text-amber-200 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 animate-pulse">
                        <AlertCircle size={14} />
                        Requiere reintegro
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={registrarReintegro}
                onMouseEnter={() => setHoveredButton('reintegro')}
                onMouseLeave={() => setHoveredButton(null)}
                className={`text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 hover:scale-105 relative overflow-hidden ${
                  necesitaReintegro 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-[#5D9646] hover:bg-[#4a7335]'
                }`}
              >
                {hoveredButton === 'reintegro' && (
                  <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <Lottie
                      animationData={warningAnimation}
                      loop={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                <RefreshCw size={16} className={hoveredButton === 'reintegro' ? 'animate-spin' : ''} />
                <span className="relative z-10">Reintegrar</span>
              </button>
            </div>

            {/* Barra de progreso */}
            {configuracion && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Mínimo: {formatearMoneda(configuracion.minimoReintegro)}</span>
                  <span>Máximo: {formatearMoneda(configuracion.maximoPermitido)}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      porcentajeBalance < 30 ? 'bg-amber-400' :
                      porcentajeBalance < 70 ? 'bg-[#5D9646]' :
                      'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(porcentajeBalance, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats con Lottie */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden"
            onMouseEnter={() => setHoveredStat('ingresos')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            {hoveredStat === 'ingresos' && (
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  style={{ width: 80, height: 80 }}
                />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="bg-[#5D9646]/10 p-2 rounded-lg">
                <ArrowUpRight className="text-[#5D9646]" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Reintegrado Semana</p>
            </div>
            <p className="text-2xl font-bold text-[#34353A] relative z-10">{formatearMoneda(stats.totalIngresos)}</p>
          </div>

          <div 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden"
            onMouseEnter={() => setHoveredStat('gastos')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            {hoveredStat === 'gastos' && (
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Lottie
                  animationData={warningAnimation}
                  loop={true}
                  style={{ width: 80, height: 80 }}
                />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="bg-red-50 p-2 rounded-lg">
                <ArrowDownRight className="text-red-600" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Gastos Semana</p>
            </div>
            <p className="text-2xl font-bold text-[#34353A] relative z-10">{formatearMoneda(stats.totalGastos)}</p>
          </div>

          <div 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onMouseEnter={() => setHoveredStat('ingresosHoy')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#5F8EAD]/10 p-2 rounded-lg">
                <TrendingUp className="text-[#5F8EAD]" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Reintegrado Hoy</p>
            </div>
            <p className="text-2xl font-bold text-[#34353A]">{formatearMoneda(stats.ingresosHoy)}</p>
          </div>

          <div 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onMouseEnter={() => setHoveredStat('gastosHoy')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-50 p-2 rounded-lg">
                <TrendingDown className="text-amber-600" size={16} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Gastos Hoy</p>
            </div>
            <p className="text-2xl font-bold text-[#34353A]">{formatearMoneda(stats.gastosHoy)}</p>
          </div>
        </div>

        {/* Quick Actions Cards con Lottie */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card Ingreso */}
          <div className={`bg-white rounded-2xl border-2 transition-all ${
            showIngresoForm ? 'border-[#5D9646] shadow-lg scale-105' : 'border-gray-200 shadow-sm hover:shadow-md'
          }`}>
            <button
              onClick={() => {
                setShowIngresoForm(!showIngresoForm);
                setShowEgresoForm(false);
              }}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`bg-[#5D9646]/10 p-3 rounded-xl transition-all ${
                  showIngresoForm ? 'bg-[#5D9646] scale-110' : ''
                }`}>
                  <Plus className={`${showIngresoForm ? 'text-white' : 'text-[#5D9646]'}`} size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[#34353A]">Registrar Ingreso</h3>
                  <p className="text-sm text-gray-500">Agregar fondos a caja chica</p>
                </div>
              </div>
              {showIngresoForm ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            {showIngresoForm && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={montoIngreso}
                  onChange={(e) => setMontoIngreso(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  placeholder="Descripción del ingreso"
                  value={descripcionIngreso}
                  onChange={(e) => setDescripcionIngreso(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#5D9646] focus:outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowIngresoForm(false);
                      setMontoIngreso('');
                      setDescripcionIngreso('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registrarIngreso}
                    onMouseEnter={() => setHoveredButton('submitIngreso')}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="flex-1 px-4 py-3 bg-[#5D9646] text-white rounded-xl font-medium hover:opacity-90 transition-all hover:scale-105 relative overflow-hidden"
                  >
                    {hoveredButton === 'submitIngreso' && (
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <Lottie
                          animationData={successAnimation}
                          loop={false}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                    <span className="relative z-10">Registrar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Egreso */}
          <div className={`bg-white rounded-2xl border-2 transition-all ${
            showEgresoForm ? 'border-red-500 shadow-lg scale-105' : 'border-gray-200 shadow-sm hover:shadow-md'
          }`}>
            <button
              onClick={() => {
                setShowEgresoForm(!showEgresoForm);
                setShowIngresoForm(false);
              }}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`bg-red-50 p-3 rounded-xl transition-all ${
                  showEgresoForm ? 'bg-red-500 scale-110' : ''
                }`}>
                  <TrendingDown className={`${showEgresoForm ? 'text-white' : 'text-red-600'}`} size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[#34353A]">Registrar Egreso</h3>
                  <p className="text-sm text-gray-500">Registrar gasto o salida</p>
                </div>
              </div>
              {showEgresoForm ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            {showEgresoForm && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={montoEgreso}
                  onChange={(e) => setMontoEgreso(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  placeholder="Descripción del egreso"
                  value={descripcionEgreso}
                  onChange={(e) => setDescripcionEgreso(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowEgresoForm(false);
                      setMontoEgreso('');
                      setDescripcionEgreso('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registrarEgreso}
                    onMouseEnter={() => setHoveredButton('submitEgreso')}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-all hover:scale-105 relative overflow-hidden"
                  >
                    {hoveredButton === 'submitEgreso' && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <Lottie
                          animationData={warningAnimation}
                          loop={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                    <span className="relative z-10">Registrar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transacciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#34353A]">Historial de Transacciones</h3>
                <p className="text-sm text-gray-500 mt-1">{filteredTransactions.length} movimientos</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors w-full sm:w-auto"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
                >
                  <option value="all">Todas</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline de transacciones */}
          <div className="divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Lottie
                  animationData={emptyBoxAnimation}
                  loop={false}
                  style={{ width: 200, height: 200, margin: '0 auto' }}
                />
                <p className="text-gray-600 font-medium mt-4">No hay transacciones</p>
                <p className="text-sm text-gray-400 mt-2">Comienza registrando un movimiento</p>
              </div>
            ) : (
              filteredTransactions.map((tx, index) => (
                <div key={tx._id} className="hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => setExpandedTransaction(expandedTransaction === tx._id ? null : tx._id)}
                    className="w-full p-4 flex items-center gap-4"
                  >
                    {/* Indicador visual */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.type === 'income' 
                          ? 'bg-[#5D9646]/10' 
                          : 'bg-red-50'
                      }`}>
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="text-[#5D9646]" size={20} />
                        ) : (
                          <ArrowDownRight className="text-red-600" size={20} />
                        )}
                      </div>
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#34353A]">{tx.reason}</p>
                          <p className="text-sm text-gray-500">{formatearFecha(tx.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            tx.type === 'income' ? 'text-[#5D9646]' : 'text-red-600'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{formatearMoneda(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-500">Balance: {formatearMoneda(tx.currentBalance)}</p>
                        </div>
                      </div>
                    </div>

                    {expandedTransaction === tx._id ? (
                      <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                  </button>

                  {/* Detalles expandibles */}
                  {expandedTransaction === tx._id && (
                    <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Usuario</p>
                          <p className="font-medium text-[#34353A]">{tx.employeeId?.name || 'Admin'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tipo</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            tx.type === 'income' 
                              ? 'bg-[#5D9646]/20 text-[#5D9646]' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {tx.voucher ? (
                          <button
                            onClick={() => abrirArchivo(tx.voucher)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5F8EAD]/10 text-[#5F8EAD] rounded-lg hover:bg-[#5F8EAD]/20 transition-all font-medium hover:scale-105"
                          >
                            <Eye size={16} />
                            Ver comprobante
                          </button>
                        ) : (
                          <button
                            onClick={() => subirComprobante(tx)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium hover:scale-105"
                          >
                            <Upload size={16} />
                            Subir comprobante
                          </button>
                        )}

                        {tx.type === 'expense' && (
                          <>
                            {tx.ticket ? (
                              <button
                                onClick={() => abrirArchivo(tx.ticket)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#5D9646]/10 text-[#5D9646] rounded-lg hover:bg-[#5D9646]/20 transition-all font-medium hover:scale-105"
                              >
                                <FileText size={16} />
                                Ver vale #{tx.vale}
                              </button>
                            ) : (
                              <button
                                onClick={() => generarVale(tx)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all font-medium hover:scale-105"
                              >
                                <FileText size={16} />
                                Generar vale
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => descargarReporteIndividual(tx._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#5D9646]/10 text-[#5D9646] rounded-lg hover:bg-[#5D9646]/20 transition-all font-medium hover:scale-105"
                        >
                          <Download size={16} />
                          Descargar reporte
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral de configuración con Lottie */}
      {/* Panel lateral de configuración MEJORADO */}
<div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
  showConfigPanel ? 'translate-x-0' : 'translate-x-full'
}`}>
  <div className="h-full flex flex-col">
    {/* Header del panel */}
    <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <Lottie
          animationData={moneyAnimation}
          loop={true}
          style={{ width: 150, height: 150 }}
        />
      </div>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <h2 className="text-2xl font-bold">⚙️ Configuración</h2>
        <button
          onClick={() => setShowConfigPanel(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      <p className="text-white/80 text-sm relative z-10">Ajusta los límites de caja chica</p>
    </div>

    {/* Contenido del panel */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* 💵 Máximo Permitido */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-[#34353A] flex items-center gap-2">
          <div className="bg-[#5F8EAD]/10 p-2 rounded-lg">
            <TrendingUp className="text-[#5F8EAD]" size={18} />
          </div>
          Límite Máximo
        </label>
        
        {/* Vista previa grande */}
        <div className="bg-gradient-to-br from-[#5F8EAD]/10 to-[#5F8EAD]/5 rounded-2xl p-6 border-2 border-[#5F8EAD]/20">
          <p className="text-sm text-gray-600 mb-2">Balance máximo permitido</p>
          <p className="text-4xl font-bold text-[#5F8EAD]">{formatearMoneda(tempMaximo)}</p>
        </div>

        {/* Input directo con botones de incremento */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">$</span>
            <input
              type="text"
              value={tempMaximo}
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir números mientras escribe, sin validar min/max
                const numValue = value.replace(/[^0-9]/g, '');
                setTempMaximo(numValue);
              }}
              onBlur={(e) => {
                // Validar solo cuando pierde el foco
                const value = e.target.value.trim();
                if (value === '' || value === '0') {
                  setTempMaximo(100);
                } else {
                  const numValue = Number(value);
                  const finalValue = Math.max(100, Math.min(10000, numValue));
                  setTempMaximo(finalValue);
                }
              }}
              onKeyDown={(e) => {
                // Al presionar Enter, validar
                if (e.key === 'Enter') {
                  const value = e.target.value.trim();
                  if (value === '' || value === '0') {
                    setTempMaximo(100);
                  } else {
                    const numValue = Number(value);
                    const finalValue = Math.max(100, Math.min(10000, numValue));
                    setTempMaximo(finalValue);
                  }
                }
              }}
              className="flex-1 px-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors"
              placeholder="1000"
            />
          </div>

          {/* Botones de incremento rápido */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2500].map((increment) => (
              <button
                key={increment}
                onClick={() => {
                  const newValue = Math.min(10000, tempMaximo + increment);
                  setTempMaximo(newValue);
                }}
                className="px-3 py-2 bg-[#5F8EAD]/10 text-[#5F8EAD] rounded-lg text-sm font-semibold hover:bg-[#5F8EAD]/20 transition-all hover:scale-105"
              >
                +${increment}
              </button>
            ))}
          </div>

          {/* Presets comunes */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Valores comunes:</p>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTempMaximo(preset)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                    tempMaximo === preset
                      ? 'bg-[#5F8EAD] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="100"
              max="10000"
              step="50"
              value={tempMaximo}
              onChange={(e) => setTempMaximo(Number(e.target.value))}
              className="w-full h-2 accent-[#5F8EAD] cursor-pointer"
              style={{
                background: `linear-gradient(to right, #5F8EAD ${((tempMaximo - 100) / (10000 - 100)) * 100}%, #e5e7eb ${((tempMaximo - 100) / (10000 - 100)) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>$100</span>
              <span>$10,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separador visual */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-400">●</span>
        </div>
      </div>

      {/* ⚠️ Mínimo para Reintegro */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-[#34353A] flex items-center gap-2">
          <div className="bg-amber-50 p-2 rounded-lg">
            <AlertCircle className="text-amber-600" size={18} />
          </div>
          Límite Mínimo (Alerta de Reintegro)
        </label>
        
        {/* Vista previa grande */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl p-6 border-2 border-amber-200">
          <p className="text-sm text-amber-700 mb-2">Se alertará al llegar a:</p>
          <p className="text-4xl font-bold text-amber-600">{formatearMoneda(tempMinimo)}</p>
        </div>

        {/* Input directo con botones de incremento */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">$</span>
            <input
              type="text"
              value={tempMinimo}
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir números mientras escribe, sin validar min/max
                const numValue = value.replace(/[^0-9]/g, '');
                setTempMinimo(numValue);
              }}
              onBlur={(e) => {
                // Validar solo cuando pierde el foco
                const value = e.target.value.trim();
                if (value === '') {
                  setTempMinimo(0);
                } else {
                  const numValue = Number(value);
                  const finalValue = Math.max(0, Math.min(5000, numValue));
                  setTempMinimo(finalValue);
                }
              }}
              onKeyDown={(e) => {
                // Al presionar Enter, validar
                if (e.key === 'Enter') {
                  const value = e.target.value.trim();
                  if (value === '') {
                    setTempMinimo(0);
                  } else {
                    const numValue = Number(value);
                    const finalValue = Math.max(0, Math.min(5000, numValue));
                    setTempMinimo(finalValue);
                  }
                }
              }}
              className="flex-1 px-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="100"
            />
          </div>

          {/* Botones de incremento rápido */}
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((increment) => (
              <button
                key={increment}
                onClick={() => {
                  const newValue = Math.min(5000, tempMinimo + increment);
                  setTempMinimo(newValue);
                }}
                className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-all hover:scale-105"
              >
                +${increment}
              </button>
            ))}
          </div>

          {/* Presets comunes */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Valores comunes:</p>
            <div className="grid grid-cols-3 gap-2">
              {[100, 300, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTempMinimo(preset)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                    tempMinimo === preset
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={tempMinimo}
              onChange={(e) => setTempMinimo(Number(e.target.value))}
              className="w-full h-2 accent-amber-500 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b ${(tempMinimo / 5000) * 100}%, #e5e7eb ${(tempMinimo / 5000) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>$0</span>
              <span>$5,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validación visual */}
      {tempMinimo >= tempMaximo && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-800">⚠️ Configuración Inválida</p>
            <p className="text-xs text-red-600 mt-1">
              El mínimo debe ser menor que el máximo
            </p>
          </div>
        </div>
      )}

      {/* Preview del impacto */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-[#5F8EAD]" size={18} />
          <p className="text-sm font-bold text-[#34353A]">Resumen de Configuración</p>
        </div>
        
        <div className="space-y-3">
          {/* Rango operativo */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Rango operativo:</span>
            <span className="text-sm font-bold text-[#34353A]">
              {formatearMoneda(tempMinimo)} - {formatearMoneda(tempMaximo)}
            </span>
          </div>

          {/* Monto de reintegro sugerido */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Reintegro sugerido:</span>
            <span className="text-sm font-bold text-[#5D9646]">
              {formatearMoneda(tempMaximo - balance)}
            </span>
          </div>

          {/* Diferencia entre máximo y mínimo */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Margen de seguridad:</span>
            <span className="text-sm font-bold text-amber-600">
              {formatearMoneda(tempMaximo - tempMinimo)}
            </span>
          </div>

          {/* Balance actual */}
          <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
            <span className="text-xs text-gray-600">Balance actual:</span>
            <span className={`text-sm font-bold ${
              balance < tempMinimo ? 'text-red-600' : 
              balance > tempMaximo ? 'text-amber-600' : 
              'text-[#5D9646]'
            }`}>
              {formatearMoneda(balance)}
            </span>
          </div>

          {/* Indicador visual del balance */}
          <div className="pt-2">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Zona de alerta (mínimo) */}
              <div 
                className="absolute h-full bg-red-300 opacity-30"
                style={{ width: `${(tempMinimo / tempMaximo) * 100}%` }}
              />
              {/* Zona óptima */}
              <div 
                className="absolute h-full bg-[#5D9646] opacity-20"
                style={{ 
                  left: `${(tempMinimo / tempMaximo) * 100}%`,
                  width: `${((tempMaximo - tempMinimo) / tempMaximo) * 100}%` 
                }}
              />
              {/* Indicador del balance actual */}
              <div 
                className="absolute h-full w-1 bg-[#34353A] shadow-lg"
                style={{ left: `${Math.min(100, (balance / tempMaximo) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Mínimo</span>
              <span>Balance</span>
              <span>Máximo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparación con configuración actual */}
      {configuracion && (tempMaximo !== configuracion.maximoPermitido || tempMinimo !== configuracion.minimoReintegro) && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertCircle className="text-blue-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-2">Cambios pendientes</p>
              <div className="space-y-1 text-xs text-blue-700">
                {tempMaximo !== configuracion.maximoPermitido && (
                  <p>• Máximo: {formatearMoneda(configuracion.maximoPermitido)} → {formatearMoneda(tempMaximo)}</p>
                )}
                {tempMinimo !== configuracion.minimoReintegro && (
                  <p>• Mínimo: {formatearMoneda(configuracion.minimoReintegro)} → {formatearMoneda(tempMinimo)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Footer del panel */}
    <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
      {/* Botón para resetear a valores actuales */}
      {configuracion && (tempMaximo !== configuracion.maximoPermitido || tempMinimo !== configuracion.minimoReintegro) && (
        <button
          onClick={() => {
            setTempMaximo(configuracion.maximoPermitido);
            setTempMinimo(configuracion.minimoReintegro);
            showLottieToast('info', 'ℹ️ Valores restaurados', 2000);
          }}
          className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Restaurar valores actuales
        </button>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowConfigPanel(false)}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardarConfiguracion}
          disabled={tempMinimo >= tempMaximo}
          onMouseEnter={() => setHoveredButton('saveConfig')}
          onMouseLeave={() => setHoveredButton(null)}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 hover:scale-105 relative overflow-hidden ${
            tempMinimo >= tempMaximo
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white hover:opacity-90'
          }`}
        >
          {hoveredButton === 'saveConfig' && tempMinimo < tempMaximo && (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Lottie
                animationData={successAnimation}
                loop={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
          <Check size={18} className="relative z-10" />
          <span className="relative z-10">Guardar Cambios</span>
        </button>
      </div>
    </div>
  </div>
</div>

      {/* Overlay cuando el panel está abierto */}
      {showConfigPanel && (
        <div
          onClick={() => setShowConfigPanel(false)}
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      <ReportesCajaChicaModal
        isOpen={showReportesModal}
        onClose={() => setShowReportesModal(false)}
        apiUrl={config.api.API_URL}
      />
    </div>
  );
}