import React, { useState } from 'react';
import { X, Calendar, Clock, ChevronRight, CheckCircle } from 'lucide-react';

export default function ModalAgregarPlanilla({ isOpen, onClose, onCrear }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  const tiposPlanilla = [
    {
      id: 'quincenal',
      nombre: 'Planilla Quincenal',
      descripcion: 'Pago cada 15 días (dos veces al mes)',
      icon: Calendar,
      color: 'blue',
      detalles: [
        'Primera quincena: 1-15 del mes',
        'Segunda quincena: 16-último día',
        'Dos pagos por mes',
        'Ideal para salarios mensuales'
      ]
    },
    {
      id: 'semanal',
      nombre: 'Planilla Semanal',
      descripcion: 'Pago cada 7 días (cuatro veces al mes)',
      icon: Clock,
      color: 'purple',
      detalles: [
        'Pago cada semana',
        'Cuatro pagos por mes aproximadamente',
        'Mayor liquidez para empleados',
        'Ideal para trabajos por hora'
      ]
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
        <div className="p-6 space-y-4">
          {tiposPlanilla.map((tipo) => {
            const Icon = tipo.icon;
            const isSelected = tipoSeleccionado === tipo.id;
            
            const colorClasses = {
              blue: {
                bg: 'from-blue-500 to-cyan-500',
                light: 'bg-blue-50',
                border: 'border-blue-500',
                text: 'text-blue-600',
                hover: 'hover:border-blue-400'
              },
              purple: {
                bg: 'from-purple-500 to-pink-500',
                light: 'bg-purple-50',
                border: 'border-purple-500',
                text: 'text-purple-600',
                hover: 'hover:border-purple-400'
              }
            };

            const colors = colorClasses[tipo.color];

            return (
              <button
                key={tipo.id}
                onClick={() => handleSeleccionar(tipo.id)}
                className={`w-full text-left rounded-2xl border-3 transition-all duration-200 ${
                  isSelected
                    ? `${colors.border} bg-gradient-to-br ${colors.light} shadow-lg scale-[1.02]`
                    : `border-slate-200 hover:border-slate-300 ${colors.hover}`
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg flex-shrink-0`}>
                      <Icon className="text-white" size={32} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{tipo.nombre}</h3>
                        {isSelected && (
                          <div className={`p-1.5 rounded-full ${colors.light}`}>
                            <CheckCircle className={colors.text} size={24} />
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{tipo.descripcion}</p>

                      {/* Detalles */}
                      <div className="space-y-2">
                        {tipo.detalles.map((detalle, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <ChevronRight className={`${colors.text} flex-shrink-0 mt-0.5`} size={16} />
                            <span className="text-sm text-slate-700">{detalle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected indicator bottom bar */}
                {isSelected && (
                  <div className={`h-2 rounded-b-2xl bg-gradient-to-r ${colors.bg}`}></div>
                )}
              </button>
            );
          })}
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