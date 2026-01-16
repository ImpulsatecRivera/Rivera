import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../Context/authContext';

const ReportesModal = ({ isOpen, onClose, apiUrl }) => {
  const [tipoReporte, setTipoReporte] = useState('mensual');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [generando, setGenerando] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: '', title: '', message: '', details: [] });

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const toggleMes = (mes) => {
    if (mesesSeleccionados.includes(mes)) {
      setMesesSeleccionados(mesesSeleccionados.filter(m => m !== mes));
    } else {
      setMesesSeleccionados([...mesesSeleccionados, mes]);
    }
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  const formatearFecha = (fechaString) => {
    const [year, month, day] = fechaString.split('-');
    return `${day}/${month}/${year}`;
  };

  const isButtonDisabled = () => {
    if (generando) return true;
    if (tipoReporte === 'mensual' && !mesSeleccionado) return true;
    if (tipoReporte === 'semanal' && (!fechaInicio || !fechaFin)) return true;
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) return true;
    return false;
  };

  const showCustomAlert = (type, title, message, details = []) => {
    setAlertData({ type, title, message, details });
    setShowAlert(true);
  };

  // ✅ Obtener token correctamente
  const getAuthToken = () => {
    try {
      const rawToken = localStorage.getItem('authToken');
      if (!rawToken) return null;
      
      const parsed = JSON.parse(rawToken);
      return parsed?.token || null;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  const generarReporte = async () => {
    const token = getAuthToken();
    if (!token) {
      showCustomAlert('error', 'No autorizado', 'No se encontró token de autenticación. Por favor inicia sesión nuevamente.');
      return;
    }

    // Validaciones
    if (tipoReporte === 'mensual' && !mesSeleccionado) {
      showCustomAlert('warning', 'Mes no seleccionado', 'Por favor selecciona un mes para generar el reporte.');
      return;
    }
    if (tipoReporte === 'semanal') {
      if (!fechaInicio) {
        showCustomAlert('warning', 'Fecha no seleccionada', 'Por favor selecciona una fecha de inicio.');
        return;
      }
      if (!fechaFin) {
        showCustomAlert('warning', 'Fecha no seleccionada', 'Por favor selecciona una fecha de fin.');
        return;
      }
      if (parseDate(fechaInicio) > parseDate(fechaFin)) {
        showCustomAlert('warning', 'Rango inválido', 'La fecha de inicio debe ser anterior a la fecha de fin.');
        return;
      }
    }
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) {
      showCustomAlert('warning', 'Meses no seleccionados', 'Por favor selecciona al menos un mes para continuar.');
      return;
    }

    setGenerando(true);
    
    try {
      if (tipoReporte === 'anual') {
        try {
          // ✅ Verificar primero con api
          await api.get(`/reporte/anual/${anoSeleccionado}`);
          
          // Si no hay error, abrir en nueva ventana
          window.open(`${apiUrl}/reporte/anual/${anoSeleccionado}?token=${token}`, '_blank');
          
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Reporte generado!', 'El reporte anual está listo para visualizar.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          
          if (error.response?.status === 404) {
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay registros de mantenimiento para el año ${anoSeleccionado}.`,
              ['Verifica que existan mantenimientos registrados en ese año', 'Intenta con otro año']
            );
          } else {
            showCustomAlert(
              'error',
              'Error de conexión',
              'No se pudo conectar con el servidor.',
              ['Verifica tu conexión a internet', 'Intenta nuevamente']
            );
          }
        }
      } else if (tipoReporte === 'mensual') {
        try {
          // ✅ Verificar primero con api
          await api.get(`/reporte/mensual-simple/${mesSeleccionado}/${anoSeleccionado}`);
          
          // Si no hay error, abrir en nueva ventana
          window.open(`${apiUrl}/reporte/mensual-simple/${mesSeleccionado}/${anoSeleccionado}?token=${token}`, '_blank');
          
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Reporte generado!', 'El reporte mensual está listo para visualizar.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          
          if (error.response?.status === 404) {
            const mesNombre = meses.find(m => m.value === parseInt(mesSeleccionado))?.label;
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay registros de mantenimiento para ${mesNombre} ${anoSeleccionado}.`,
              ['Verifica que existan mantenimientos registrados en ese período', 'Intenta con otro mes']
            );
          } else {
            showCustomAlert(
              'error',
              'Error de conexión',
              'No se pudo conectar con el servidor.',
              ['Verifica tu conexión a internet', 'Intenta nuevamente']
            );
          }
        }
      } else if (tipoReporte === 'semanal') {
        try {
          // ✅ Verificar primero con api
          await api.get(`/reporte/rango-fechas/${fechaInicio}/${fechaFin}`);
          
          // Si no hay error, abrir en nueva ventana
          window.open(`${apiUrl}/reporte/rango-fechas/${fechaInicio}/${fechaFin}?token=${token}`, '_blank');
          
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert(
              'success', 
              '¡Reporte generado!', 
              `Reporte del ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)} está listo.`
            );
          }, 1000);
        } catch (error) {
          setGenerando(false);
          
          if (error.response?.status === 404) {
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              'No hay registros de mantenimiento en el rango de fechas seleccionado.',
              ['Verifica que existan mantenimientos registrados en ese período']
            );
          } else {
            showCustomAlert(
              'error',
              'Error de conexión',
              'No se pudo conectar con el servidor.',
              ['Verifica tu conexión a internet', 'Intenta nuevamente']
            );
          }
        }
      } else if (tipoReporte === 'multiple') {
        try {
          const response = await api.post(
            '/reporte/mensual-multiple',
            {
              meses: mesesSeleccionados.sort((a, b) => a - b),
              ano: anoSeleccionado
            },
            {
              responseType: 'blob'
            }
          );

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-multiple-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          setTimeout(() => {
            setGenerando(false);
            showCustomAlert(
              'success',
              '¡Descarga completa!',
              'El reporte de múltiples meses se ha descargado correctamente.'
            );
          }, 1000);

        } catch (error) {
          setGenerando(false);
          
          if (error.response?.status === 404) {
            const mesesSinDatosNombres = mesesSeleccionados.map(m =>
              meses.find(mes => mes.value === m)?.label
            );

            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `Ninguno de los meses seleccionados tiene registros de mantenimiento para ${anoSeleccionado}.`,
              mesesSinDatosNombres
            );
            return;
          }

          if (error.response?.status === 400) {
            showCustomAlert(
              'warning',
              'Solicitud inválida',
              error.response.data?.message || 'Los datos enviados no son válidos.',
              ['Verifica los meses seleccionados', 'Intenta nuevamente']
            );
            return;
          }

          showCustomAlert(
            'error',
            'Error del servidor',
            error.response?.data?.message || `El servidor respondió con un error.`,
            ['Verifica tu conexión a internet', 'Si el problema persiste, contacta al administrador']
          );
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setGenerando(false);
      showCustomAlert(
        'error',
        'Error al generar reporte',
        'Ocurrió un problema al procesar tu solicitud. Por favor intenta nuevamente.',
        ['Verifica tu conexión a internet', 'Si el problema persiste, contacta al administrador']
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generar Reportes</h2>
                <p className="text-indigo-100 text-sm">Selecciona el tipo de reporte</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* ... resto del contenido del modal igual ... */}
            {/* Selector de Tipo de Reporte */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setTipoReporte('mensual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'mensual'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Mensual</div>
                  <div className="text-xs text-gray-500 mt-1">1 mes</div>
                </button>

                <button
                  onClick={() => setTipoReporte('semanal')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'semanal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Rango</div>
                  <div className="text-xs text-gray-500 mt-1">Personalizado</div>
                </button>

                <button
                  onClick={() => setTipoReporte('multiple')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'multiple'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Múltiples</div>
                  <div className="text-xs text-gray-500 mt-1">Varios meses</div>
                </button>

                <button
                  onClick={() => setTipoReporte('anual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'anual'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Anual</div>
                  <div className="text-xs text-gray-500 mt-1">12 meses</div>
                </button>
              </div>
            </div>

            {/* Resto de opciones según tipo... (mantener igual) */}
          </div>

          {/* Footer con botones */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={generarReporte}
              disabled={isButtonDisabled()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 transition-all"
            >
              {generando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Alert Modal (mantener igual) */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-fadeIn">
          {/* ... contenido del alert igual ... */}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ReportesModal;