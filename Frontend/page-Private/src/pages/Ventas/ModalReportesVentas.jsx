import React, { useState } from 'react';
import { X, Calendar, FileText, Download, ChevronDown, TrendingUp } from 'lucide-react';
import { api } from "../../Context/authContext";
import Swal from 'sweetalert2';

const ModalReportesVentas = ({ isOpen, onClose }) => {
  const [tipoReporte, setTipoReporte] = useState('mensual');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [metodoPago, setMetodoPago] = useState('todos');
  const [generando, setGenerando] = useState(false);

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

  const metodosPago = [
    { value: 'todos', label: 'Todas las ventas' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'credito', label: 'Crédito' },
    { value: 'otros', label: 'Otros' }
  ];

  const isButtonDisabled = () => {
    if (generando) return true;
    if (tipoReporte === 'mensual' && !mesSeleccionado) return true;
    if (tipoReporte === 'anual' && !anoSeleccionado) return true;
    return false;
  };

  const generarReporte = async () => {
    if (tipoReporte === 'mensual' && !mesSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Mes no seleccionado',
        text: 'Selecciona un mes para generar el reporte',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    if (tipoReporte === 'anual' && !anoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Año no seleccionado',
        text: 'Selecciona un año para generar el reporte',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

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

    setGenerando(true);

    try {
      let response;
      let filename = 'reporte-ventas.pdf';
      let reportType = '';

      if (tipoReporte === 'mensual') {
        const url = metodoPago === 'todos' 
          ? `/reportesVentas/mensual/${mesSeleccionado}/${anoSeleccionado}`
          : `/reportesVentas/mensual/${mesSeleccionado}/${anoSeleccionado}?metodoPago=${metodoPago}`;
        response = await api.get(url, {
          responseType: 'blob'
        });
        filename = `reporte-ventas-${meses.find(m => m.value === mesSeleccionado)?.label || 'mes'}-${anoSeleccionado}.pdf`;
        reportType = 'Informe Mensual';
      } else if (tipoReporte === 'resumen') {
        const url = metodoPago === 'todos'
          ? `/reportesVentas/resumen-mensual/${mesSeleccionado}/${anoSeleccionado}`
          : `/reportesVentas/resumen-mensual/${mesSeleccionado}/${anoSeleccionado}?metodoPago=${metodoPago}`;
        response = await api.get(url, {
          responseType: 'blob'
        });
        filename = `resumen-ventas-${meses.find(m => m.value === mesSeleccionado)?.label || 'mes'}-${anoSeleccionado}.pdf`;
        reportType = 'Resumen Mensual';
      } else if (tipoReporte === 'anual') {
        const url = metodoPago === 'todos'
          ? `/reportesVentas/comparativo-anual/${anoSeleccionado}`
          : `/reportesVentas/comparativo-anual/${anoSeleccionado}?metodoPago=${metodoPago}`;
        response = await api.get(url, {
          responseType: 'blob'
        });
        filename = `comparativo-ventas-${anoSeleccionado}.pdf`;
        reportType = 'Comparativo Anual';
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mostrar alerta de éxito
      Swal.fire({
        icon: 'success',
        title: 'Reporte generado',
        html: `<p style="color: #666;"><strong>${reportType}</strong></p><p style="color: #999; font-size: 14px;">${filename}</p>`,
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
        if (error.response.status === 404 || error.response.status === 400) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#34353A]">Generar Reportes de Ventas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-semibold text-[#34353A] mb-3">
              Tipo de Reporte
            </label>
            <div className="space-y-2">
              {[
                { value: 'mensual', label: 'Informe Mensual', desc: 'Detalle completo de ventas del mes' },
                { value: 'resumen', label: 'Resumen Mensual', desc: 'Resumen ejecutivo del mes' },
                { value: 'anual', label: 'Comparativo Anual', desc: 'Comparativa de ventas por mes del año' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    tipoReporte === option.value
                      ? 'bg-[#5F8EAD] bg-opacity-10 border-[#5F8EAD]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={tipoReporte === option.value}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-[#34353A]">{option.label}</div>
                    <div className="text-sm text-slate-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selectores de Período */}
          {(tipoReporte === 'mensual' || tipoReporte === 'resumen') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Mes
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#5F8EAD] focus:outline-none"
                >
                  <option value="">Selecciona un mes</option>
                  {meses.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Año
                </label>
                <select
                  value={anoSeleccionado}
                  onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#5F8EAD] focus:outline-none"
                >
                  {anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {tipoReporte === 'anual' && (
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">
                Año
              </label>
              <select
                value={anoSeleccionado}
                onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#5F8EAD] focus:outline-none"
              >
                {anos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro de Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-[#34353A] mb-3">
              Filtrar por Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {metodosPago.map((metodo) => (
                <label
                  key={metodo.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    metodoPago === metodo.value
                      ? 'bg-[#5D9646] bg-opacity-10 border-[#5D9646]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={metodo.value}
                    checked={metodoPago === metodo.value}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-[#34353A]">{metodo.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-1">
                <FileText size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Información</h4>
                <p className="text-sm text-blue-800 mt-1">
                  {tipoReporte === 'mensual'
                    ? 'Generará un informe detallado con todos los registros de ventas del mes seleccionado.'
                    : tipoReporte === 'resumen'
                    ? 'Generará un resumen ejecutivo con estadísticas clave del mes.'
                    : 'Generará una comparativa anual mostrando el desempeño de cada mes del año.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={generarReporte}
            disabled={isButtonDisabled()}
            className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              isButtonDisabled()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white hover:opacity-90'
            }`}
          >
            {generando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                <Download size={18} />
                Generar Reporte
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalReportesVentas;
