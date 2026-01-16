import React, { useMemo, useState } from "react";
import { X, Calendar, FileText, Download, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "../../Context/authContext";

const ReportesDieselModal = ({ isOpen, onClose, apiUrl }) => {
  const [tipoReporte, setTipoReporte] = useState("todos");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const reporteBase = useMemo(() => `${apiUrl}/resumenReporte`, [apiUrl]);

  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const toggleMes = (mes) => {
    setMesesSeleccionados((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    );
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

  // ✅ Función para verificar si hay registros usando api
  const verificarRegistros = async (url) => {
    try {
      await api.get(url);
      return true;
    } catch (e) {
      if (e.response?.status === 404) return false;
      throw new Error(
        e.response?.data?.message ||
        `Error del servidor: ${e.response?.status || e.message}`
      );
    }
  };

  const generarReporte = async () => {
    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "No autorizado",
        text: "No se encontró token de autenticación. Por favor inicia sesión nuevamente.",
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Validaciones de campos requeridos
    if (tipoReporte === "mensual" && !mesSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "Mes requerido",
        text: "Por favor selecciona un mes para generar el reporte",
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (tipoReporte === "semanal") {
      if (!fechaInicio || !fechaFin) {
        Swal.fire({
          icon: "warning",
          title: "Fechas requeridas",
          text: "Por favor selecciona la fecha de inicio y fin",
          confirmButtonColor: "#4F46E5",
          confirmButtonText: "Entendido",
        });
        return;
      }

      if (new Date(fechaFin) < new Date(fechaInicio)) {
        Swal.fire({
          icon: "warning",
          title: "Rango inválido",
          text: "La fecha fin no puede ser menor que la fecha inicio",
          confirmButtonColor: "#4F46E5",
          confirmButtonText: "Entendido",
        });
        return;
      }
    }

    if (tipoReporte === "multiple" && mesesSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Meses requeridos",
        text: "Por favor selecciona al menos un mes para el reporte comparativo",
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setGenerando(true);

    // Mensaje de procesamiento
    Swal.fire({
      title: "Procesando...",
      html: "Verificando datos y generando reporte",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (tipoReporte === "todos") {
        const url = `/resumenReporte/reportes/diesel/anual/${anoSeleccionado}`;
        
        try {
          const hayRegistros = await verificarRegistros(url);
          
          if (!hayRegistros) {
            Swal.fire({
              icon: "info",
              title: "Sin registros",
              text: `No hay registros de diésel para el año ${anoSeleccionado}`,
              confirmButtonColor: "#4F46E5",
              confirmButtonText: "Entendido",
            });
            setGenerando(false);
            return;
          }

          window.open(`${apiUrl}${url}?token=${token}`, "_blank");

          Swal.fire({
            icon: "success",
            title: "¡Reporte generado!",
            html: `<strong>Reporte Anual ${anoSeleccionado}</strong><br/>El PDF se ha abierto en una nueva pestaña`,
            confirmButtonColor: "#4F46E5",
            timer: 3000,
            timerProgressBar: true,
          });
        } catch (error) {
          throw new Error(`Error al generar reporte anual: ${error.message}`);
        }
      }

      if (tipoReporte === "mensual") {
        const mesNombre = meses.find(m => m.value === parseInt(mesSeleccionado))?.label;
        const url = `/resumenReporte/reportes/diesel/mes/${mesSeleccionado}/${anoSeleccionado}`;
        
        try {
          const hayRegistros = await verificarRegistros(url);
          
          if (!hayRegistros) {
            Swal.fire({
              icon: "info",
              title: "Sin registros",
              text: `No hay registros de diésel para ${mesNombre} ${anoSeleccionado}`,
              confirmButtonColor: "#4F46E5",
              confirmButtonText: "Entendido",
            });
            setGenerando(false);
            return;
          }

          window.open(`${apiUrl}${url}?token=${token}`, "_blank");

          Swal.fire({
            icon: "success",
            title: "¡Reporte generado!",
            html: `<strong>${mesNombre} ${anoSeleccionado}</strong><br/>El PDF se ha abierto en una nueva pestaña`,
            confirmButtonColor: "#4F46E5",
            timer: 3000,
            timerProgressBar: true,
          });
        } catch (error) {
          throw new Error(`Error al generar reporte mensual: ${error.message}`);
        }
      }

      if (tipoReporte === "semanal") {
        const url = `/resumenReporte/reportes/diesel/semanal/0/0/0?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        
        try {
          const hayRegistros = await verificarRegistros(url);
          
          if (!hayRegistros) {
            Swal.fire({
              icon: "info",
              title: "Sin registros",
              text: `No hay registros de diésel en el rango seleccionado`,
              confirmButtonColor: "#4F46E5",
              confirmButtonText: "Entendido",
            });
            setGenerando(false);
            return;
          }

          window.open(`${apiUrl}${url}&token=${token}`, "_blank");

          Swal.fire({
            icon: "success",
            title: "¡Reporte generado!",
            html: `<strong>Reporte semanal</strong><br/>Del ${fechaInicio} al ${fechaFin}<br/>El PDF se ha abierto en una nueva pestaña`,
            confirmButtonColor: "#4F46E5",
            timer: 3000,
            timerProgressBar: true,
          });

        } catch (error) {
          throw new Error(`Error al generar reporte semanal: ${error.message}`);
        }
      }

      if (tipoReporte === "multiple") {
        try {
          const response = await api.post(
            `/resumenReporte/reportes/diesel/comparativo`,
            {
              meses: [...mesesSeleccionados].sort((a, b) => a - b),
              ano: anoSeleccionado,
            },
            { responseType: "blob" }
          );

          if (response.status === 404) {
            Swal.fire({
              icon: "info",
              title: "Sin registros",
              text: `No hay registros de diésel para los meses seleccionados en ${anoSeleccionado}`,
              confirmButtonColor: "#4F46E5",
              confirmButtonText: "Entendido",
            });
            setGenerando(false);
            return;
          }

          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `reporte-diesel-comparativo-${anoSeleccionado}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          const mesesNombres = mesesSeleccionados
            .sort((a, b) => a - b)
            .map(m => meses.find(mes => mes.value === m)?.label)
            .join(", ");

          Swal.fire({
            icon: "success",
            title: "¡Reporte descargado!",
            html: `<strong>Reporte Comparativo ${anoSeleccionado}</strong><br/>${mesesNombres}<br/>El PDF se ha descargado correctamente`,
            confirmButtonColor: "#4F46E5",
            timer: 3000,
            timerProgressBar: true,
          });
        } catch (error) {
          throw new Error(`Error al generar reporte comparativo: ${error.message}`);
        }
      }

      setTimeout(() => {
        setGenerando(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error("Error al generar reporte:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al generar reporte",
        html: `<strong>No se pudo generar el PDF</strong><br/>${error.message}<br/><br/>Por favor verifica tu conexión e intenta de nuevo`,
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Entendido",
      });

      setGenerando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reportes de Diésel</h2>
              <p className="text-indigo-100 text-sm">Selecciona el tipo de reporte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setTipoReporte("todos")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoReporte === "todos"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <FileText className="mx-auto mb-2" size={24} />
                <div className="text-sm font-semibold">Anual</div>
                <div className="text-xs text-gray-500 mt-1">12 meses</div>
              </button>

              <button
                onClick={() => setTipoReporte("mensual")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoReporte === "mensual"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <Calendar className="mx-auto mb-2" size={24} />
                <div className="text-sm font-semibold">Mensual</div>
                <div className="text-xs text-gray-500 mt-1">1 mes</div>
              </button>

              <button
                onClick={() => setTipoReporte("semanal")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoReporte === "semanal"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <Calendar className="mx-auto mb-2" size={24} />
                <div className="text-sm font-semibold">Semanal</div>
                <div className="text-xs text-gray-500 mt-1">Por semana</div>
              </button>

              <button
                onClick={() => setTipoReporte("multiple")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoReporte === "multiple"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <Calendar className="mx-auto mb-2" size={24} />
                <div className="text-sm font-semibold">Múltiples</div>
                <div className="text-xs text-gray-500 mt-1">Comparativo</div>
              </button>
            </div>
          </div>

          {/* Anual */}
          {tipoReporte === "todos" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <FileText className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Anual</h3>
                    <p className="text-sm text-indigo-700">
                      PDF con los 12 meses del año dividido en 2 semestres.
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
                    {anos.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensual */}
          {tipoReporte === "mensual" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Mensual</h3>
                    <p className="text-sm text-indigo-700">Genera un reporte de un mes específico.</p>
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
                      {meses.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
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
                      {anos.map((ano) => (
                        <option key={ano} value={ano}>
                          {ano}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Semanal */}
          {tipoReporte === "semanal" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Semanal</h3>
                    <p className="text-sm text-indigo-700">
                      Selecciona un rango de fechas para generar el reporte.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Multiple */}
          {tipoReporte === "multiple" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mb-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Comparativo</h3>
                    <p className="text-sm text-indigo-700">
                      Selecciona varios meses para generar un PDF combinado.
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
                    {anos.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
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
                  {meses.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => toggleMes(m.value)}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        mesesSeleccionados.includes(m.value)
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={generarReporte}
            disabled={generando}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
  );
};

export default ReportesDieselModal;