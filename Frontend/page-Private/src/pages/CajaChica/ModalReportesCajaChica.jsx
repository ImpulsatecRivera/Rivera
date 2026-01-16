import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { api } from '../../Context/authContext';

const ReportesCajaChicaModal = ({ isOpen, onClose, apiUrl }) => {
  const [tipoReporte, setTipoReporte] = useState('individual');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
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

  const isButtonDisabled = () => {
    if (generando) return true;
    if (tipoReporte === 'mensual' && !mesSeleccionado) return true;
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) return true;
    if (tipoReporte === 'diario' && !fechaSeleccionada) return true;
    if (tipoReporte === 'rango' && (!fechaInicio || !fechaFin)) return true;
    return false;
  };

  const showCustomAlert = (type, title, message, details = []) => {
    setAlertData({ type, title, message, details });
    setShowAlert(true);
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
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

    if (tipoReporte === 'mensual' && !mesSeleccionado) {
      showCustomAlert('warning', 'Mes no seleccionado', 'Por favor selecciona un mes para generar el reporte.');
      return;
    }
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) {
      showCustomAlert('warning', 'Meses no seleccionados', 'Por favor selecciona al menos un mes para continuar.');
      return;
    }
    if (tipoReporte === 'diario' && !fechaSeleccionada) {
      showCustomAlert('warning', 'Fecha no seleccionada', 'Por favor selecciona una fecha para el reporte diario.');
      return;
    }
    if (tipoReporte === 'rango' && (!fechaInicio || !fechaFin)) {
      showCustomAlert('warning', 'Rango incompleto', 'Por favor selecciona fecha de inicio y fin.');
      return;
    }
    if (tipoReporte === 'rango' && parseDate(fechaInicio) > parseDate(fechaFin)) {
      showCustomAlert('warning', 'Rango inválido', 'La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    setGenerando(true);
    
    try {
      if (tipoReporte === 'todos') {
        // ✅ Usar api de authContext que ya tiene el interceptor
        const reporteUrl = `/reportesCajaChica/todos`;
        window.open(`${apiUrl}${reporteUrl}?token=${token}`, '_blank');
        
        setTimeout(() => {
          setGenerando(false);
          showCustomAlert('success', '¡Reporte generado!', 'El reporte consolidado se ha abierto en una nueva pestaña.');
        }, 1000);
      } else if (tipoReporte === 'mensual') {
        try {
          const response = await api.get(`/reportesCajaChica/mensual-simple/${mesSeleccionado}/${anoSeleccionado}`);
          
          if (response.status === 200) {
            const reporteUrl = `/reportesCajaChica/mensual-simple/${mesSeleccionado}/${anoSeleccionado}`;
            window.open(`${apiUrl}${reporteUrl}?token=${token}`, '_blank');
            
            setTimeout(() => {
              setGenerando(false);
              showCustomAlert('success', '¡Reporte generado!', 'El reporte mensual está listo para visualizar.');
            }, 1000);
          }
        } catch (error) {
          setGenerando(false);
          if (error.response?.status === 404) {
            const mesNombre = meses.find(m => m.value === parseInt(mesSeleccionado))?.label;
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay movimientos para ${mesNombre} ${anoSeleccionado}.`,
              ['Verifica que existan transacciones registradas en ese período']
            );
          } else {
            showCustomAlert(
              'error',
              'Error al generar reporte',
              'No se pudo generar el reporte.',
              ['Verifica tu conexión a internet', 'Si el problema persiste, contacta al administrador']
            );
          }
        }
      } else if (tipoReporte === 'multiple') {
        try {
          const response = await api.post(`/reportesCajaChica/mensual-multiple`, {
            meses: mesesSeleccionados.sort((a, b) => a - b),
            ano: anoSeleccionado
          }, {
            responseType: 'blob'
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-caja-chica-multiple-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Descarga completa!', 'El reporte de múltiples meses se ha descargado correctamente.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          if (error.response?.status === 404) {
            const mesesNombres = mesesSeleccionados.map(m => 
              meses.find(mes => mes.value === m)?.label
            );
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay movimientos en los meses seleccionados para ${anoSeleccionado}.`,
              mesesNombres
            );
          } else {
            showCustomAlert('error', 'Error del servidor', 'No se pudo generar el reporte.');
          }
        }
      } else if (tipoReporte === 'diario') {
        try {
          const response = await api.get(`/reportesCajaChica/diario/${fechaSeleccionada}`);
          
          if (response.status === 200) {
            const reporteUrl = `/reportesCajaChica/diario/${fechaSeleccionada}`;
            window.open(`${apiUrl}${reporteUrl}?token=${token}`, '_blank');
            
            setTimeout(() => {
              setGenerando(false);
              const fecha = parseDate(fechaSeleccionada);
              showCustomAlert('success', '¡Reporte generado!', `Reporte diario del ${fecha.toLocaleDateString('es-ES')} está listo.`);
            }, 1000);
          }
        } catch (error) {
          setGenerando(false);
          if (error.response?.status === 404) {
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              'No hay movimientos para el día seleccionado.',
              ['Verifica que existan transacciones en esa fecha']
            );
          } else {
            showCustomAlert('error', 'Error al generar reporte', 'No se pudo generar el reporte.');
          }
        }
      } else if (tipoReporte === 'rango') {
        try {
          const response = await api.post(`/reportesCajaChica/rango-fechas`, {
            fechaInicio,
            fechaFin
          }, {
            responseType: 'blob'
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-caja-chica-${fechaInicio}_${fechaFin}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Descarga completa!', 'El reporte por rango de fechas se ha descargado correctamente.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          if (error.response?.status === 404) {
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              'No hay movimientos en el rango de fechas seleccionado.',
              ['Verifica que existan transacciones en ese período']
            );
          } else {
            showCustomAlert('error', 'Error del servidor', 'No se pudo generar el reporte.');
          }
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setGenerando(false);
      showCustomAlert(
        'error',
        'Error al generar reporte',
        'Ocurrió un problema al procesar tu solicitud.',
        ['Verifica tu conexión a internet']
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ... resto del JSX igual ... */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reportes de Caja Chica</h2>
                <p className="text-emerald-100 text-sm">Selecciona el tipo de reporte</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* ... resto del contenido igual ... */}
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
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      {/* Alert Modal igual... */}
    </>
  );
};

export default ReportesCajaChicaModal;