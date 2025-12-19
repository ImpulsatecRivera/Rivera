import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function ModalAgregarPlanilla({ isOpen, onClose, onCrear }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  // SOLO DOS TIPOS: QUINCENAL Y SEMANAL (SIN DESCRIPCIONES NI DETALLES)
  const tiposPlanilla = [
    {
      id: 'quincenal',
      nombre: 'Planilla Quincenal',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'semanal',
      nombre: 'Planilla Semanal',
      icon: Clock,
      color: 'purple'
    }
  ];

  const handleSeleccionar = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  const handleConfirmar = () => {
    if (tipoSeleccionado) {
      onCrear(tipoSeleccionado);
      setTipoSeleccionado(null);
    }
  };

  const handleCerrar = () => {
    setTipoSeleccionado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Agregar Nueva Planilla</h2>
            <p className="text-sm text-slate-600 mt-1">Selecciona el tipo de planilla que deseas crear</p>
          </div>
          <button
            onClick={handleCerrar}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposPlanilla.map((tipo) => {
              const Icon = tipo.icon;
              const isSelected = tipoSeleccionado === tipo.id;
              
              const colorClasses = {
                blue: {
                  bg: 'from-blue-500 to-cyan-500',
                  light: 'bg-blue-50',
                  border: 'border-blue-500',
                  hover: 'hover:border-blue-400'
                },
                purple: {
                  bg: 'from-purple-500 to-pink-500',
                  light: 'bg-purple-50',
                  border: 'border-purple-500',
                  hover: 'hover:border-purple-400'
                }
              };

              const colors = colorClasses[tipo.color];

              return (
                <button
                  key={tipo.id}
                  onClick={() => handleSeleccionar(tipo.id)}
                  className={`relative p-8 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `${colors.border} ${colors.light} shadow-lg scale-105`
                      : `border-slate-200 hover:border-slate-300 ${colors.hover}`
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg mx-auto w-fit mb-4`}>
                    <Icon className="text-white" size={40} />
                  </div>

                  {/* Nombre */}
                  <h3 className="text-xl font-bold text-slate-900 text-center">
                    {tipo.nombre}
                  </h3>

                  {/* Checkmark cuando está seleccionado */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="text-green-600" size={28} />
                    </div>
                  )}

                  {/* Barra inferior cuando está seleccionado */}
                  {isSelected && (
                    <div className={`absolute bottom-0 left-0 right-0 h-2 rounded-b-2xl bg-gradient-to-r ${colors.bg}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          <div className="text-sm text-slate-600">
            {tipoSeleccionado ? (
              <span className="font-medium text-indigo-600">
                ✓ {tiposPlanilla.find(t => t.id === tipoSeleccionado)?.nombre} seleccionada
              </span>
            ) : (
              <span>Selecciona un tipo de planilla para continuar</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCerrar}
              className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!tipoSeleccionado}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                tipoSeleccionado
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}