import React, { useMemo, useState } from "react";
import { X, Calendar, FileText, Download, ChevronDown } from "lucide-react";

const ReportesDieselModal = ({ isOpen, onClose, apiUrl }) => {
  const [tipoReporte, setTipoReporte] = useState("todos"); // 'todos', 'mensual', 'multiple'
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [generando, setGenerando] = useState(false);

  // ✅ Tu backend está montado así:
  // app.use("/api/resumenReporte", ResumenDieselReporte)
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

  const descargarBlobComoPDF = async (response, filename) => {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generarReporte = async () => {
    // Validaciones
    if (tipoReporte === "mensual" && !mesSeleccionado) {
      alert("Por favor selecciona un mes");
      return;
    }
    if (tipoReporte === "multiple" && mesesSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un mes");
      return;
    }

    setGenerando(true);

    try {
      if (tipoReporte === "todos") {
        // ✅ Tu backend NO tiene /general
        // ✅ Entonces hacemos "general del año" usando comparativo con los 12 meses
        const response = await fetch(`${reporteBase}/reportes/diesel/comparativo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meses: [1,2,3,4,5,6,7,8,9,10,11,12],
            ano: anoSeleccionado,
          }),
        });

        if (!response.ok) throw new Error("Error al generar reporte general del año");

        await descargarBlobComoPDF(response, `reporte-diesel-general-${anoSeleccionado}.pdf`);
      }

      if (tipoReporte === "mensual") {
        // ✅ Mensual SIMPLE (GET)
        window.open(
          `${reporteBase}/reportes/diesel/mes/${mesSeleccionado}/${anoSeleccionado}`,
          "_blank"
        );
      }

      if (tipoReporte === "multiple") {
        // ✅ Comparativo (POST)
        const response = await fetch(`${reporteBase}/reportes/diesel/comparativo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meses: [...mesesSeleccionados].sort((a, b) => a - b),
            ano: anoSeleccionado,
          }),
        });

        if (!response.ok) throw new Error("Error al generar reporte");

        await descargarBlobComoPDF(
          response,
          `reporte-diesel-comparativo-${anoSeleccionado}.pdf`
        );
      }

      setTimeout(() => {
        setGenerando(false);
        onClose();
      }, 700);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error al generar el reporte");
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
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTipoReporte("todos")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoReporte === "todos"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <FileText className="mx-auto mb-2" size={24} />
                <div className="text-sm font-semibold">General</div>
                <div className="text-xs text-gray-500 mt-1">Año completo</div>
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
                <div className="text-sm font-semibold">Un Mes</div>
                <div className="text-xs text-gray-500 mt-1">Simple</div>
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

          {/* Año para General */}
          {tipoReporte === "todos" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <FileText className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte General (por año)</h3>
                    <p className="text-sm text-indigo-700">
                      Se descargará un PDF consolidado del año seleccionado.
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
                    <h3 className="font-semibold text-indigo-900 mb-1">Reporte Mensual (Simple)</h3>
                    <p className="text-sm text-indigo-700">Genera un reporte del mes seleccionado.</p>
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
                  Seleccionar Meses{" "}
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
