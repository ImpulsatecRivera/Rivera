import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { config } from "../../config";
import Swal from "sweetalert2";

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

const TIPOS_REPORTE = [
  {
    id: "resumen-mes",
    titulo: "Resumen Mensual",
    descripcion: "Vista general de todos los clientes del mes",
    icono: FileText,
    color: "blue",
    requiere: ["mes", "año"],
  },
  {
    id: "credito-fiscal",
    titulo: "Crédito Fiscal",
    descripcion: "Separación por tipo de consumidor (IVA)",
    icono: TrendingUp,
    color: "green",
    requiere: ["mes", "año"],
  },
  {
    id: "consolidado",
    titulo: "Consolidado Anual",
    descripcion: "Vista horizontal de todo el año",
    icono: Calendar,
    color: "orange",
    requiere: ["año"],
  },
];

export default function ReportesViajesOperativosModal({ isOpen, onClose }) {
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [generando, setGenerando] = useState(null);

  const descargarPDF = async (tipo) => {
    let url = "";
    let nombreArchivo = "";

    try {
      setGenerando(tipo.id);

      // Validaciones
      if (tipo.requiere.includes("mes") && !mesSeleccionado) {
        throw new Error("Selecciona un mes");
      }

      if (tipo.requiere.includes("año") && !añoSeleccionado) {
        throw new Error("Selecciona un año");
      }

      // Construir URL según el tipo
      switch (tipo.id) {
        case "resumen-mes":
          url = `${REPORTES_BASE}/resumen-mes/${mesSeleccionado}/${añoSeleccionado}`;
          nombreArchivo = `resumen-${MESES.find((m) => m.value === mesSeleccionado)?.label}-${añoSeleccionado}.pdf`;
          break;

        case "credito-fiscal":
          url = `${REPORTES_BASE}/credito-fiscal/${mesSeleccionado}/${añoSeleccionado}`;
          nombreArchivo = `credito-fiscal-${mesSeleccionado}-${añoSeleccionado}.pdf`;
          break;

        case "consolidado":
          url = `${REPORTES_BASE}/consolidado/${añoSeleccionado}`;
          nombreArchivo = `consolidado-${añoSeleccionado}.pdf`;
          break;

        default:
          throw new Error("Tipo de reporte no válido");
      }

      console.log("📄 Descargando PDF desde:", url);

      // Hacer petición
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || "Error al generar el PDF");
      }

      // Descargar el PDF
      const blob = await res.blob();
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
      setGenerando(null);
    }
  };

  const getColorClasses = (color, variant = "bg") => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        hover: "hover:bg-blue-100",
        ring: "focus:ring-blue-500",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        hover: "hover:bg-green-100",
        ring: "focus:ring-green-500",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        hover: "hover:bg-orange-100",
        ring: "focus:ring-orange-500",
      },
    };

    return colors[color] || colors.blue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Reportes</h2>
              <p className="text-gray-500 text-sm">Generar PDFs de viajes operativos</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filtros */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mes
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={añoSeleccionado}
                  onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
                  min="2020"
                  max="2050"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Tipos de Reportes */}
          <div className="space-y-3">
            {TIPOS_REPORTE.map((tipo) => {
              const colorClasses = getColorClasses(tipo.color);
              const Icono = tipo.icono;
              const estaGenerando = generando === tipo.id;

              return (
                <button
                  key={tipo.id}
                  onClick={() => descargarPDF(tipo)}
                  disabled={estaGenerando}
                  className={`w-full ${colorClasses.bg} ${colorClasses.border} border rounded-2xl p-5 transition-all duration-200 ${colorClasses.hover} disabled:opacity-50 disabled:cursor-not-allowed group`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icono */}
                    <div
                      className={`${colorClasses.bg} p-3 rounded-xl ${colorClasses.text}`}
                    >
                      {estaGenerando ? (
                        <Loader2 size={28} className="animate-spin" />
                      ) : (
                        <Icono size={28} />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 text-left">
                      <h4 className={`text-lg font-bold ${colorClasses.text}`}>
                        {tipo.titulo}
                      </h4>
                      <p className="text-sm text-gray-600">{tipo.descripcion}</p>

                      {/* Requiere */}
                      <div className="flex items-center gap-2 mt-2">
                        {tipo.requiere.map((req) => (
                          <span
                            key={req}
                            className="text-xs bg-white px-2 py-1 rounded-lg text-gray-600 font-medium"
                          >
                            {req === "mes" && `${MESES.find((m) => m.value === mesSeleccionado)?.label}`}
                            {req === "año" && añoSeleccionado}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Icono derecha */}
                    <div className={`${colorClasses.text} group-hover:translate-x-1 transition-transform`}>
                      {estaGenerando ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <ChevronRight size={24} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info adicional */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-blue-900 font-semibold">Tips para generar reportes</p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• <strong>Resumen Mensual:</strong> Vista general de todos los clientes</li>
                  <li>• <strong>Crédito Fiscal:</strong> Separa por tipo de consumidor (IVA)</li>
                  <li>• <strong>Consolidado:</strong> Vista horizontal de todos los meses del año</li>
                  <li>• <strong>Individual:</strong> Usa el botón morado en cada viaje de la tabla</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}