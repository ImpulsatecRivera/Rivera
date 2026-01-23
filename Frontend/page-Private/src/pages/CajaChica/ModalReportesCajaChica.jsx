import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { api } from "../../Context/authContext";
import Swal from 'sweetalert2';



const ReportesCajaChicaModal = ({ isOpen, onClose }) => {
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

 


  const generarReporte = async () => {
  if (tipoReporte === 'mensual' && !mesSeleccionado) {
    showCustomAlert('warning', 'Mes no seleccionado', 'Selecciona un mes.');
    return;
  }

  if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) {
    showCustomAlert('warning', 'Meses no seleccionados', 'Selecciona al menos un mes.');
    return;
  }

  if (tipoReporte === 'diario' && !fechaSeleccionada) {
    showCustomAlert('warning', 'Fecha no seleccionada', 'Selecciona una fecha.');
    return;
  }

  if (tipoReporte === 'rango' && (!fechaInicio || !fechaFin)) {
    showCustomAlert('warning', 'Rango incompleto', 'Selecciona fechas válidas.');
    return;
  }

  if (tipoReporte === 'rango' && parseDate(fechaInicio) > parseDate(fechaFin)) {
    showCustomAlert('warning', 'Rango inválido', 'La fecha inicio debe ser menor.');
    return;
  }

  setGenerando(true);

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
    let response;
    let filename = 'reporte-caja-chica.pdf';

    /* ================= TODOS ================= */
    if (tipoReporte === 'todos') {
      response = await api.get('/reportesCajaChica/todos', {
        responseType: 'blob',
      });
      filename = 'caja-chica-consolidado.pdf';
    }

    /* ================= MENSUAL ================= */
    if (tipoReporte === 'mensual') {
      response = await api.get(
        `/reportesCajaChica/mensual-simple/${mesSeleccionado}/${anoSeleccionado}`,
        { responseType: 'blob' }
      );
      filename = `caja-chica-${mesSeleccionado}-${anoSeleccionado}.pdf`;
    }

    /* ================= MULTIPLE ================= */
    if (tipoReporte === 'multiple') {
      response = await api.post(
        '/reportesCajaChica/mensual-multiple',
        {
          meses: mesesSeleccionados.sort((a, b) => a - b),
          ano: anoSeleccionado,
        },
        { responseType: 'blob' }
      );
      filename = `caja-chica-multiple-${anoSeleccionado}.pdf`;
    }

    /* ================= DIARIO ================= */
    if (tipoReporte === 'diario') {
      response = await api.get(
        `/reportesCajaChica/diario/${fechaSeleccionada}`,
        { responseType: 'blob' }
      );
      filename = `caja-chica-${fechaSeleccionada}.pdf`;
    }

    /* ================= RANGO ================= */
    if (tipoReporte === 'rango') {
      response = await api.post(
        '/reportesCajaChica/rango-fechas',
        { fechaInicio, fechaFin },
        { responseType: 'blob' }
      );
      filename = `caja-chica-${fechaInicio}_${fechaFin}.pdf`;
    }

    /* ================= DESCARGA ================= */
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Mostrar alerta de éxito
    Swal.fire({
      icon: 'success',
      title: 'Reporte generado',
      html: `<p style="color: #666;"><strong>Caja Chica</strong></p><p style="color: #999; font-size: 14px;">${filename}</p>`,
      confirmButtonText: 'OK',
      confirmButtonColor: '#5F8EAD',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      setGenerando(false);
      onClose();
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    
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
      }).then(() => {
        setGenerando(false);
      });
    };

    // Verificar si hay respuesta del servidor
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Sesión expirada';
        errorDetails = '<p style="color: #999; font-size: 12px; margin-top: 10px;">Vuelve a iniciar sesión</p>';
      } else if (error.response.status === 404) {
        errorMessage = 'Sin datos disponibles';
        errorDetails = '<p style="color: #999; font-size: 12px; margin-top: 10px;">No hay registros para el período seleccionado</p>';
      } else if (error.response.status === 400) {
        // Si es un Blob, intentar convertirlo a texto y parsearlo
        if (error.response.data instanceof Blob) {
          error.response.data.text().then(text => {
            try {
              const jsonData = JSON.parse(text);
              errorMessage = jsonData.message || 'No hay datos disponibles para este período';
              if (error.response.status) {
                errorDetails = `<p style="color: #999; font-size: 12px; margin-top: 10px;">Status: ${error.response.status}</p>`;
              }
              showError(errorMessage, errorDetails);
            } catch (e) {
              errorMessage = 'No hay datos disponibles para este período';
              showError(errorMessage);
            }
          });
          return;
        } else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || 'No hay datos disponibles para este período';
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


  if (!isOpen) return null;

  return (
    <>
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
            {/* Selector de Tipo de Reporte */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoReporte('todos')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'todos'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Todos</div>
                  <div className="text-xs text-gray-500 mt-1">Consolidado</div>
                </button>

                <button
                  onClick={() => setTipoReporte('mensual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'mensual'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Mensual</div>
                  <div className="text-xs text-gray-500 mt-1">Un mes</div>
                </button>

                <button
                  onClick={() => setTipoReporte('multiple')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'multiple'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Múltiples</div>
                  <div className="text-xs text-gray-500 mt-1">Varios meses</div>
                </button>

                <button
                  onClick={() => setTipoReporte('diario')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'diario'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Diario</div>
                  <div className="text-xs text-gray-500 mt-1">Un día</div>
                </button>

                <button
                  onClick={() => setTipoReporte('rango')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'rango'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Rango</div>
                  <div className="text-xs text-gray-500 mt-1">Período</div>
                </button>
              </div>
            </div>

            {/* Opciones según tipo seleccionado */}
            {tipoReporte === 'todos' && (
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <FileText className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Reporte Consolidado</h3>
                    <p className="text-sm text-emerald-700">
                      Se generará un PDF con todos los movimientos históricos registrados en caja chica.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tipoReporte === 'mensual' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Reporte Mensual</h3>
                      <p className="text-sm text-emerald-700">
                        Genera un reporte con todos los movimientos de un mes específico.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
                    <div className="relative">
                      <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                      >
                        <option value="">Seleccionar mes</option>
                        {meses.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                    <div className="relative">
                      <select
                        value={anoSeleccionado}
                        onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                      >
                        {anos.map(ano => (
                          <option key={ano} value={ano}>{ano}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tipoReporte === 'multiple' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Reporte de Múltiples Meses</h3>
                      <p className="text-sm text-emerald-700">
                        Selecciona varios meses para generar un reporte comparativo con estadísticas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                  <div className="relative">
                    <select
                      value={anoSeleccionado}
                      onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    >
                      {anos.map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Seleccionar Meses {mesesSeleccionados.length > 0 && (
                      <span className="text-emerald-600">({mesesSeleccionados.length} seleccionados)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {meses.map(mes => (
                      <button
                        key={mes.value}
                        onClick={() => toggleMes(mes.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          mesesSeleccionados.includes(mes.value)
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mes.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tipoReporte === 'diario' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Reporte Diario</h3>
                      <p className="text-sm text-emerald-700">
                        Genera un reporte detallado con todos los movimientos de un día específico, incluyendo horas.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>
            )}

            {tipoReporte === 'rango' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Reporte por Rango de Fechas</h3>
                      <p className="text-sm text-emerald-700">
                        Genera un reporte personalizado para cualquier período (semanal, quincenal, mensual, etc).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Inicio</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      max={fechaFin || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Fin</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      min={fechaInicio}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {fechaInicio && fechaFin && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Período seleccionado:</span> {' '}
                      {Math.ceil((parseDate(fechaFin) - parseDate(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1} días
                      {' '}({parseDate(fechaInicio).toLocaleDateString('es-ES')} - {parseDate(fechaFin).toLocaleDateString('es-ES')})
                    </p>
                  </div>
                )}
              </div>
            )}
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

      {/* Custom Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className={`px-6 py-8 ${
              alertData.type === 'success' ? 'bg-gradient-to-br from-green-50 to-emerald-50' :
              alertData.type === 'error' ? 'bg-gradient-to-br from-red-50 to-rose-50' :
              alertData.type === 'warning' ? 'bg-gradient-to-br from-amber-50 to-yellow-50' :
              'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  alertData.type === 'success' ? 'bg-green-100' :
                  alertData.type === 'error' ? 'bg-red-100' :
                  alertData.type === 'warning' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  {alertData.type === 'success' ? (
                    <CheckCircle className="text-green-600" size={32} />
                  ) : alertData.type === 'error' ? (
                    <X className="text-red-600" size={32} />
                  ) : (
                    <AlertCircle className={
                      alertData.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    } size={32} />
                  )}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  alertData.type === 'success' ? 'text-green-900' :
                  alertData.type === 'error' ? 'text-red-900' :
                  alertData.type === 'warning' ? 'text-amber-900' :
                  'text-blue-900'
                }`}>
                  {alertData.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {alertData.message}
                </p>
              </div>
            </div>

            {alertData.details && alertData.details.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <ul className="space-y-2">
                  {alertData.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <button
                onClick={() => setShowAlert(false)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  alertData.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  alertData.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  alertData.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
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

export default ReportesCajaChicaModal