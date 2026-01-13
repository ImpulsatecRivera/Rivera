import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

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

  // Función para formatear fecha de forma consistente
 // Función para formatear fecha de forma consistente (SIN crear objeto Date)
const formatearFecha = (fechaString) => {
  // Si la fecha viene en formato YYYY-MM-DD del input
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

  const generarReporte = async () => {
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
        const reporteUrl = `${apiUrl}/reporte/anual/${anoSeleccionado}`;
        
        try {
          const checkResponse = await fetch(reporteUrl, { method: 'HEAD' });
          
          if (checkResponse.status === 404) {
            setGenerando(false);
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay registros de mantenimiento para el año ${anoSeleccionado}.`,
              ['Verifica que existan mantenimientos registrados en ese año', 'Intenta con otro año']
            );
            return;
          }

          if (!checkResponse.ok) {
            throw new Error('Error al verificar datos');
          }

          window.open(reporteUrl, '_blank');
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Reporte generado!', 'El reporte anual está listo para visualizar.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          showCustomAlert(
            'error',
            'Error de conexión',
            'No se pudo conectar con el servidor.',
            ['Verifica tu conexión a internet', 'Intenta nuevamente']
          );
        }
      } else if (tipoReporte === 'mensual') {
        const reporteUrl = `${apiUrl}/reporte/mensual-simple/${mesSeleccionado}/${anoSeleccionado}`;
        
        try {
          const checkResponse = await fetch(reporteUrl, { method: 'HEAD' });
          
          if (checkResponse.status === 404) {
            setGenerando(false);
            const mesNombre = meses.find(m => m.value === parseInt(mesSeleccionado))?.label;
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              `No hay registros de mantenimiento para ${mesNombre} ${anoSeleccionado}.`,
              ['Verifica que existan mantenimientos registrados en ese período', 'Intenta con otro mes']
            );
            return;
          }

          if (!checkResponse.ok) {
            throw new Error('Error al verificar datos');
          }

          window.open(reporteUrl, '_blank');
          setTimeout(() => {
            setGenerando(false);
            showCustomAlert('success', '¡Reporte generado!', 'El reporte mensual está listo para visualizar.');
          }, 1000);
        } catch (error) {
          setGenerando(false);
          showCustomAlert(
            'error',
            'Error de conexión',
            'No se pudo conectar con el servidor.',
            ['Verifica tu conexión a internet', 'Intenta nuevamente']
          );
        }
      } else if (tipoReporte === 'semanal') {
        console.log('=== DEBUG FECHAS ===');
  console.log('fechaInicio (raw):', fechaInicio);
  console.log('fechaFin (raw):', fechaFin);
  console.log('URL que se enviará:', `${apiUrl}/reporte/rango-fechas/${fechaInicio}/${fechaFin}`);
  console.log('==================');
        const reporteUrl = `${apiUrl}/reporte/rango-fechas/${fechaInicio}/${fechaFin}`;
        
        try {
          const checkResponse = await fetch(reporteUrl, { method: 'HEAD' });
          
          if (checkResponse.status === 404) {
            setGenerando(false);
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              'No hay registros de mantenimiento en el rango de fechas seleccionado.',
              ['Verifica que existan mantenimientos registrados en ese período']
            );
            return;
          }

          if (!checkResponse.ok) {
            throw new Error('Error al verificar datos');
          }

          window.open(reporteUrl, '_blank');
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
          showCustomAlert(
            'error',
            'Error de conexión',
            'No se pudo conectar con el servidor.',
            ['Verifica tu conexión a internet', 'Intenta nuevamente']
          );
        }
      } else if (tipoReporte === 'multiple') {
        const response = await fetch(`${apiUrl}/reporte/mensual-multiple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meses: mesesSeleccionados.sort((a, b) => a - b),
            ano: anoSeleccionado
          })
        });
        
        if (!response.ok) {
          setGenerando(false);
          
          if (response.status === 404) {
            const errorData = await response.json().catch(() => ({}));
            const mesesSinDatosNombres = mesesSeleccionados.map(m => 
              meses.find(mes => mes.value === m)?.label
            );
            showCustomAlert(
              'info',
              'Sin datos disponibles',
              errorData.message || `Ninguno de los meses seleccionados tiene registros de mantenimiento para ${anoSeleccionado}.`,
              mesesSinDatosNombres
            );
            return;
          }
          
          if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            showCustomAlert(
              'warning',
              'Solicitud inválida',
              errorData.message || 'Los datos enviados no son válidos.',
              ['Verifica los meses seleccionados', 'Intenta nuevamente']
            );
            return;
          }
          
          const errorData = await response.json().catch(() => ({}));
          showCustomAlert(
            'error',
            'Error del servidor',
            errorData.message || `El servidor respondió con un error (${response.status}).`,
            ['Verifica tu conexión a internet', 'Si el problema persiste, contacta al administrador']
          );
          return;
        }
        
        const blob = await response.blob();
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
          showCustomAlert('success', '¡Descarga completa!', 'El reporte de múltiples meses se ha descargado correctamente.');
        }, 1000);
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

            {/* Opciones según tipo seleccionado */}
            {tipoReporte === 'anual' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-1">Reporte Anual por Camión</h3>
                      <p className="text-sm text-indigo-700">
                        Genera un reporte horizontal con tabla de todas las placas y sus montos por mes del año seleccionado.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                  <div className="relative">
                    <select
                      value={anoSeleccionado}
                      onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      {anos.map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>
            )}

            {tipoReporte === 'mensual' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-1">Reporte Mensual Individual</h3>
                      <p className="text-sm text-indigo-700">
                        Genera un reporte simple con la tabla de placas y montos de un mes específico.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mes <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
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

            {tipoReporte === 'semanal' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-1">Reporte por Rango de Fechas</h3>
                      <p className="text-sm text-indigo-700">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {fechaInicio && fechaFin && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Período seleccionado:</span> {' '}
                      {Math.ceil((parseDate(fechaFin) - parseDate(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1} días
                      {' '}({formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)})
                    </p>
                  </div>
                )}
              </div>
            )}

            {tipoReporte === 'multiple' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-1">Reporte de Múltiples Meses</h3>
                      <p className="text-sm text-indigo-700">
                        Selecciona varios meses para generar un reporte combinado con tablas individuales.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
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
                    Seleccionar Meses <span className="text-red-500">*</span>{" "}
                    {mesesSeleccionados.length > 0 && (
                      <span className="text-indigo-600">({mesesSeleccionados.length} seleccionados)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {meses.map(mes => (
                      <button
                        key={mes.value}
                        onClick={() => toggleMes(mes.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          mesesSeleccionados.includes(mes.value)
                            ? 'bg-indigo-600 text-white shadow-md'
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

      {/* Custom Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            {/* Alert Icon Header */}
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

            {/* Alert Details */}
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

            {/* Alert Actions */}
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

export default ReportesModal;