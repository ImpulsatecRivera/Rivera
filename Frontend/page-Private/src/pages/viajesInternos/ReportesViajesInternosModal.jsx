import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle,
  Loader2,
  ChevronRight,
  BarChart3,
  Clock,
  CalendarDays,
  Filter,
  Layers,
} from "lucide-react";
import { config } from "../../config";
import Swal from "sweetalert2";
import { api } from "../../Context/authContext";

const REPORTES_BASE = `${config.api.API_URL}/reportes-directos`;

const MESES = [
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

const TABS = [
  { id: "basicos", label: "Reportes Básicos", icon: FileText },
  { id: "consolidados", label: "Consolidados", icon: Layers },
];

const TIPOS_REPORTE = [
  {
    id: "resumen-mes",
    titulo: "Resumen Mensual",
    descripcion: "Vista general de clientes",
    icono: FileText,
    requiere: ["mes", "año"],
  },
  {
    id: "comparativo-efectivo",
    titulo: "Comparativo Efectivo (Anual)",
    descripcion: "Resumen anual por clientes — solo efectivo",
    icono: BarChart3,
    requiere: ["año"],
  },
  {
    id: "anual",
    titulo: "Consolidado Anual",
    descripcion: "Resumen anual por cliente",
    icono: Calendar,
    requiere: ["año"],
  },
];

const CONSOLIDADOS = [
  {
    id: "semanal",
    titulo: "Semanal",
    icono: Clock,
    requiere: ["fechaInicio", "fechaFin"],
  },
  {
    id: "trimestral",
    titulo: "Trimestral",
    icono: BarChart3,
    requiere: ["año", "trimestre"],
  },
  {
    id: "semestral",
    titulo: "Semestral",
    icono: Calendar,
    requiere: ["año", "semestre"],
  },
  {
    id: "9meses",
    titulo: "9 Meses",
    icono: TrendingUp,
    requiere: ["año"],
  },
];

export default function ReportesViajesOperativosModal({ isOpen, onClose }) {
  const [tabActiva, setTabActiva] = useState("basicos");
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState(1);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(1);
  const [consolidadoSeleccionado, setConsolidadoSeleccionado] = useState("semanal");
  const [generando, setGenerando] = useState(false);
  
  // ✅ NUEVO: Estados para rango de fechas
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const descargarPDF = async (tipo) => {
    let url = "";
    let nombreArchivo = "";

    try {
      setGenerando(true);

      switch (tipo.id) {
        case "resumen-mes":
          url = `${REPORTES_BASE}/resumen-mes/${mesSeleccionado}/${añoSeleccionado}`;
          nombreArchivo = `resumen-${MESES.find((m) => m.value === mesSeleccionado)?.label}-${añoSeleccionado}.pdf`;
          break;

        case "semanal":
          // ✅ NUEVO: Usar rango de fechas
          if (!fechaInicio || !fechaFin) {
            throw new Error("Debe seleccionar fecha de inicio y fecha de fin");
          }
          url = `${REPORTES_BASE}/consolidado-periodo?periodo=semanal&ano=${añoSeleccionado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
          nombreArchivo = `consolidado-semanal-${fechaInicio}_${fechaFin}.pdf`;
          break;

        case "mensual":
          url = `${REPORTES_BASE}/resumen-mes/${mesSeleccionado}/${añoSeleccionado}`;
          nombreArchivo = `resumen-mes-${añoSeleccionado}-mes${mesSeleccionado}.pdf`;
          break;

        case "trimestral":
          url = `${REPORTES_BASE}/consolidado-periodo?periodo=trimestral&ano=${añoSeleccionado}&trimestre=${trimestreSeleccionado}`;
          nombreArchivo = `consolidado-trimestral-${añoSeleccionado}-t${trimestreSeleccionado}.pdf`;
          break;

        case "semestral":
          url = `${REPORTES_BASE}/consolidado-periodo?periodo=semestral&ano=${añoSeleccionado}&semestre=${semestreSeleccionado}`;
          nombreArchivo = `consolidado-semestral-${añoSeleccionado}-s${semestreSeleccionado}.pdf`;
          break;

        case "9meses":
          url = `${REPORTES_BASE}/consolidado-periodo?periodo=9meses&ano=${añoSeleccionado}`;
          nombreArchivo = `consolidado-9meses-${añoSeleccionado}.pdf`;
          break;

        case "anual":
          url = `${REPORTES_BASE}/consolidado/${añoSeleccionado}`;
          nombreArchivo = `consolidado-anual-${añoSeleccionado}.pdf`;
          break;

        case "comparativo-efectivo":
          url = `${REPORTES_BASE}/comparativo-efectivo/${añoSeleccionado}`;
          nombreArchivo = `comparativo-efectivo-${añoSeleccionado}.pdf`;
          break;

        default:
          throw new Error("Tipo de reporte no válido");
      }

      const response = await api.get(url, {
  responseType: "blob",
});

const blob = response.data;
const downloadUrl = window.URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = downloadUrl;
link.download = nombreArchivo;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(downloadUrl);


      await Swal.fire({
        title: "¡Descargado!",
        text: `PDF generado: ${nombreArchivo}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error descargando PDF:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo generar el PDF",
        icon: "error",
      });
    } finally {
      setGenerando(false);
    }
  };

  const consolidadoActual = CONSOLIDADOS.find(c => c.id === consolidadoSeleccionado);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generador de Reportes</h2>
              <p className="text-blue-100 text-sm mt-1">Viajes Operativos</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    tabActiva === tab.id
                      ? "bg-white text-[#34353A] shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* FILTROS GLOBALES */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-gray-600" />
              <h3 className="font-semibold text-[#34353A]">Filtros</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                  Mes
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white text-sm"
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                  Año
                </label>
                <input
                  type="number"
                  value={añoSeleccionado}
                  onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
                  min="2020"
                  max="2050"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] text-sm"
                />
              </div>
            </div>
          </div>

          {/* TAB: REPORTES BÁSICOS */}
          {tabActiva === "basicos" && (
            <div className="space-y-3">
              {TIPOS_REPORTE.map((tipo) => {
                const Icon = tipo.icono;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => descargarPDF(tipo)}
                    disabled={generando}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#5F8EAD] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#5F8EAD] bg-opacity-10 rounded-lg group-hover:bg-[#5F8EAD] group-hover:bg-opacity-20 transition-colors">
                        <Icon size={24} className="text-[#5F8EAD]" />
                      </div>

                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-[#34353A]">{tipo.titulo}</h4>
                        <p className="text-sm text-gray-500">{tipo.descripcion}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
                          {tipo.requiere.includes("mes") ? `${MESES.find((m) => m.value === mesSeleccionado)?.label} ${añoSeleccionado}` : `${añoSeleccionado}`}
                        </div>
                        {generando ? (
                          <Loader2 size={20} className="animate-spin text-[#5F8EAD]" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400 group-hover:text-[#5F8EAD] group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: CONSOLIDADOS */}
          {tabActiva === "consolidados" && (
            <div className="grid grid-cols-2 gap-6">
              
              {/* Selector de Tipo */}
              <div>
                <h3 className="font-semibold text-[#34353A] mb-3">Tipo de Consolidado</h3>
                <div className="space-y-2">
                  {CONSOLIDADOS.map((consolidado) => {
                    const Icon = consolidado.icono;
                    return (
                      <button
                        key={consolidado.id}
                        onClick={() => setConsolidadoSeleccionado(consolidado.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          consolidadoSeleccionado === consolidado.id
                            ? "border-[#5F8EAD] bg-[#5F8EAD] bg-opacity-10"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            consolidadoSeleccionado === consolidado.id
                              ? "text-[#5F8EAD]"
                              : "text-gray-400"
                          }
                        />
                        <span
                          className={`font-medium ${
                            consolidadoSeleccionado === consolidado.id
                              ? "text-[#5F8EAD]"
                              : "text-gray-700"
                          }`}
                        >
                          {consolidado.titulo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configuración y Preview */}
              <div>
                <h3 className="font-semibold text-[#34353A] mb-3">Configuración</h3>
                
                <div className="bg-gradient-to-br from-[#5F8EAD] from-opacity-10 to-white border-2 border-[#5F8EAD] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    {consolidadoActual && <consolidadoActual.icono size={20} className="text-[#5F8EAD]" />}
                    <h4 className="font-bold text-[#34353A]">{consolidadoActual?.titulo}</h4>
                  </div>

                  {/* Filtros específicos */}
                  <div className="space-y-3">
                    
                    {/* ✅ NUEVO: Selector de rango de fechas para SEMANAL */}
                    {consolidadoActual?.id === "semanal" && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                            Fecha de Inicio
                          </label>
                          <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                            Fecha de Fin
                          </label>
                          <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            min={fechaInicio}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white text-sm"
                          />
                        </div>
                      </>
                    )}

                    {consolidadoActual?.requiere.includes("trimestre") && (
                      <div>
                        <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                          Trimestre
                        </label>
                        <select
                          value={trimestreSeleccionado}
                          onChange={(e) => setTrimestreSeleccionado(Number(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white text-sm"
                        >
                          <option value={1}>Q1 (Ene-Feb-Mar)</option>
                          <option value={2}>Q2 (Abr-May-Jun)</option>
                          <option value={3}>Q3 (Jul-Ago-Sep)</option>
                          <option value={4}>Q4 (Oct-Nov-Dic)</option>
                        </select>
                      </div>
                    )}

                    {consolidadoActual?.requiere.includes("semestre") && (
                      <div>
                        <label className="block text-xs font-medium text-[#34353A] mb-1.5">
                          Semestre
                        </label>
                        <select
                          value={semestreSeleccionado}
                          onChange={(e) => setSemestreSeleccionado(Number(e.target.value))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] bg-white text-sm"
                        >
                          <option value={1}>Primer Semestre (Ene-Jun)</option>
                          <option value={2}>Segundo Semestre (Jul-Dic)</option>
                        </select>
                      </div>
                    )}

                    {/* Preview */}
                    <div className="mt-4 pt-3 border-t-2 border-[#5F8EAD] border-opacity-30">
                      <p className="text-xs text-[#34353A] font-semibold mb-2">Vista previa:</p>
                      <div className="flex flex-wrap gap-2">
                        {consolidadoActual?.id === "semanal" ? (
                          <>
                            {fechaInicio && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md text-[#34353A] font-semibold border-2 border-gray-300">
                                {new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                            {fechaFin && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md text-[#34353A] font-semibold border-2 border-gray-300">
                                {new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {consolidadoActual?.requiere.includes("año") && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md text-[#34353A] font-semibold border-2 border-gray-300">
                                {añoSeleccionado}
                              </span>
                            )}
                            {consolidadoActual?.requiere.includes("trimestre") && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md text-[#34353A] font-semibold border-2 border-gray-300">
                                Q{trimestreSeleccionado}
                              </span>
                            )}
                            {consolidadoActual?.requiere.includes("semestre") && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md text-[#34353A] font-semibold border-2 border-gray-300">
                                S{semestreSeleccionado}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de descarga */}
                <button
                  onClick={() => descargarPDF(consolidadoActual)}
                  disabled={generando || (consolidadoActual?.id === "semanal" && (!fechaInicio || !fechaFin))}
                  className="w-full bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {generando ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Generar PDF
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-[#5F8EAD] bg-opacity-10 border-2 border-[#5F8EAD] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-[#5F8EAD] flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-[#34353A] font-semibold mb-1">💡 Tips</p>
                <p className="text-xs text-gray-700">
                  Los consolidados muestran datos agrupados por cliente en formato de tabla.
                  Ideal para análisis financiero y seguimiento de operaciones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}