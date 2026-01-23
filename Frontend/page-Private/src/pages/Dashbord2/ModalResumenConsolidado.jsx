import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../Context/authContext';

const ModalResumenConsolidado = ({ isOpen, onClose }) => {
  // Estados principales
  const [tipoReporte, setTipoReporte] = useState('mensual');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [generando, setGenerando] = useState(false);
  
  // Estados de alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: '', title: '', message: '', details: [] });

  // Meses del año
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

  // Años disponibles (últimos 10 años)
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
    if (tipoReporte === 'mensual' && (!mesSeleccionado || !diasTrabajados)) return true;
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) return true;
    return false;
  };

  const showCustomAlert = (type, title, message, details = []) => {
    setAlertData({ type, title, message, details });
    setShowAlert(true);
  };

  const generarReporte = async () => {
    // Validaciones específicas por tipo
    if (tipoReporte === 'mensual') {
      if (!mesSeleccionado) {
        showCustomAlert('warning', 'Mes no seleccionado', 'Por favor selecciona un mes para generar el reporte.');
        return;
      }
      if (!diasTrabajados || parseInt(diasTrabajados) < 1 || parseInt(diasTrabajados) > 31) {
        showCustomAlert('warning', 'Días trabajados inválidos', 'Por favor ingresa un número válido de días trabajados (1-31).');
        return;
      }
    }
    
    if (tipoReporte === 'multiple' && mesesSeleccionados.length === 0) {
      showCustomAlert('warning', 'Meses no seleccionados', 'Por favor selecciona al menos un mes para continuar.');
      return;
    }

    setGenerando(true);

    // Alerta de procesamiento estilo Ventas/Viajes
    Swal.fire({
      title: 'Generando reporte...',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
          <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #5F8EAD;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <p style="color: #666; font-size: 14px; margin: 0;">Por favor espera mientras se genera el PDF...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    try {
      // REPORTE ANUAL
      if (tipoReporte === 'anual') {
        try {
          const response = await api.get(`/reporte-consolidado/anual/${anoSeleccionado}`, {
            responseType: 'blob'
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-consolidado-anual-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            setGenerando(false);
            Swal.fire({
              icon: 'success',
              title: '¡Reporte generado!',
              text: 'El reporte anual consolidado está listo.',
              timer: 2000,
              showConfirmButton: false
            });
          }, 600);
        } catch (error) {
          setGenerando(false);
          Swal.close();
          if (error.response?.status === 404) {
            Swal.fire({
              icon: 'info',
              title: 'Sin datos disponibles',
              text: error.response.data?.message || `No hay registros para el año ${anoSeleccionado}.`,
              confirmButtonColor: '#5F8EAD'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al generar reporte',
              text: error.response?.data?.message || 'No se pudo generar el reporte.',
              confirmButtonColor: '#ef4444'
            });
          }
        }
      } 
      // REPORTE MENSUAL
      else if (tipoReporte === 'mensual') {
        try {
          const response = await api.get(
            `/reporte-consolidado/mensual/${mesSeleccionado}/${anoSeleccionado}/${diasTrabajados}`,
            { responseType: 'blob' }
          );
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-consolidado-mensual-${mesSeleccionado}-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            setGenerando(false);
            Swal.fire({
              icon: 'success',
              title: '¡Reporte generado!',
              text: 'El reporte mensual consolidado está listo.',
              timer: 2000,
              showConfirmButton: false
            });
          }, 600);
        } catch (error) {
          setGenerando(false);
          Swal.close();
          if (error.response?.status === 404) {
            const mesNombre = meses.find(m => m.value === parseInt(mesSeleccionado))?.label;
            Swal.fire({
              icon: 'info',
              title: 'Sin datos disponibles',
              text: error.response.data?.message || `No hay registros para ${mesNombre} ${anoSeleccionado}.`,
              confirmButtonColor: '#5F8EAD'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al generar reporte',
              text: error.response?.data?.message || 'No se pudo generar el reporte.',
              confirmButtonColor: '#ef4444'
            });
          }
        }
      } 
      // REPORTE MULTI-MES
      else if (tipoReporte === 'multiple') {
        try {
          const response = await api.post('/reporte-consolidado/multi-mes', {
            meses: mesesSeleccionados.sort((a, b) => a - b),
            ano: anoSeleccionado
          }, {
            responseType: 'blob'
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-consolidado-multi-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setGenerando(false);
            Swal.fire({
              icon: 'success',
              title: '¡Descarga completa!',
              text: 'El reporte multi-mes se ha descargado correctamente.',
              timer: 2000,
              showConfirmButton: false
            });
          }, 600);
        } catch (error) {
          setGenerando(false);
          Swal.close();
          if (error.response?.status === 404) {
            const mesesSinDatosNombres = mesesSeleccionados.map(m => 
              meses.find(mes => mes.value === m)?.label
            );
            Swal.fire({
              icon: 'info',
              title: 'Sin datos disponibles',
              text: error.response.data?.message || `Ninguno de los meses seleccionados tiene registros para ${anoSeleccionado}.`,
              confirmButtonColor: '#5F8EAD'
            });
          } else if (error.response?.status === 400) {
            Swal.fire({
              icon: 'warning',
              title: 'Solicitud inválida',
              text: error.response.data?.message || 'Los datos enviados no son válidos.',
              confirmButtonColor: '#f59e0b'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error del servidor',
              text: error.response?.data?.message || `Error al generar el reporte.`,
              confirmButtonColor: '#ef4444'
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setGenerando(false);
      Swal.fire({
        icon: 'error',
        title: 'Error al generar reporte',
        text: 'Ocurrió un problema al procesar tu solicitud. Por favor intenta nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Resumen Consolidado</h2>
                <p className="text-white text-opacity-90 text-sm">Reportes por camión</p>
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoReporte('mensual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'mensual'
                      ? 'border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10 text-[#5F8EAD]'
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
                      ? 'border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10 text-[#5F8EAD]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Multi-mes</div>
                  <div className="text-xs text-gray-500 mt-1">Varios meses</div>
                </button>

                <button
                  onClick={() => setTipoReporte('anual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoReporte === 'anual'
                      ? 'border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10 text-[#5F8EAD]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-semibold">Anual</div>
                  <div className="text-xs text-gray-500 mt-1">12 meses</div>
                </button>
              </div>
            </div>

            {/* OPCIONES SEGÚN TIPO SELECCIONADO */}
            
            {/* ANUAL */}
            {tipoReporte === 'anual' && (
              <div className="space-y-4">
                <div className="bg-[#5F8EAD] bg-opacity-10 rounded-xl p-5 border border-[#5F8EAD] mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="text-[#5F8EAD] mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-[#34353A] mb-1">Reporte Anual Consolidado</h3>
                      <p className="text-sm text-gray-600">
                        Genera un reporte vertical con utilidad bruta de todos los camiones por mes del año seleccionado.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] appearance-none bg-white font-semibold"
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

            {/* MENSUAL */}
            {tipoReporte === 'mensual' && (
              <div className="space-y-4">
                <div className="bg-[#5F8EAD] bg-opacity-10 rounded-xl p-5 border border-[#5F8EAD] mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-[#5F8EAD] mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-[#34353A] mb-1">Reporte Mensual Consolidado</h3>
                      <p className="text-sm text-gray-600">
                        Genera un reporte horizontal con ingresos, diesel, planilla y utilidad bruta por camión.
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] appearance-none bg-white"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] appearance-none bg-white"
                      >
                        {anos.map(ano => (
                          <option key={ano} value={ano}>{ano}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* DÍAS TRABAJADOS (SOLO MENSUAL) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Días trabajados del mes</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diasTrabajados}
                    onChange={(e) => setDiasTrabajados(e.target.value)}
                    placeholder="Ej: 30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este valor se usará para calcular las observaciones (ej: "26 de 30")</p>
                </div>
              </div>
            )}

            {/* MULTI-MES */}
            {tipoReporte === 'multiple' && (
              <div className="space-y-4">
                <div className="bg-[#5F8EAD] bg-opacity-10 rounded-xl p-5 border border-[#5F8EAD] mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-[#5F8EAD] mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-[#34353A] mb-1">Reporte Multi-Mes Consolidado</h3>
                      <p className="text-sm text-gray-600">
                        Selecciona varios meses para generar un reporte vertical con secciones por cada mes.
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] appearance-none bg-white"
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
                      <span className="text-[#5F8EAD]">({mesesSeleccionados.length} seleccionados)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {meses.map(mes => (
                      <button
                        key={mes.value}
                        onClick={() => toggleMes(mes.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          mesesSeleccionados.includes(mes.value)
                            ? 'bg-[#5F8EAD] text-white shadow-md'
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5F8EAD] text-white rounded-xl hover:bg-[#5D9646] font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5F8EAD] transition-all"
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

      <style jsx>{`
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

export default ModalResumenConsolidado;