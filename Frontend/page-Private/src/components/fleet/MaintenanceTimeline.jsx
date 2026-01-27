// src/components/fleet/MaintenanceTimeline.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Clock, AlertCircle, XCircle } from 'lucide-react';

const MaintenanceTimeline = ({ mantenimientos }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!mantenimientos || mantenimientos.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500 font-semibold">No hay mantenimientos registrados</p>
      </div>
    );
  }

  // Agrupar por año
  const mantenimientosPorAno = mantenimientos.reduce((acc, mant) => {
    const fecha = new Date(mant.fecha_mantenimiento);
    const ano = fecha.getFullYear();
    
    if (!acc[ano]) {
      acc[ano] = [];
    }
    acc[ano].push(mant);
    return acc;
  }, {});

  // Ordenar años descendente
  const anosOrdenados = Object.keys(mantenimientosPorAno).sort((a, b) => b - a);

  const tipoLabels = {
    'preventivo': 'Preventivo',
    'correctivo': 'Correctivo',
    'llantas': 'Llantas',
    'rines': 'Rines',
    'furgo': 'Furgón',
    'madera_furgo': 'Madera de Furgón',
    'torno': 'Torno',
    'bomba': 'Bomba',
    'reparacion_turbo': 'Reparación del Turbo',
    'otros': 'Otros'
  };

  const estadoConfig = {
    'completado': {
      icon: Check,
      color: 'text-[#5D9646]',
      bg: 'bg-[#5D9646]',
      label: 'Completado'
    },
    'en_proceso': {
      icon: Clock,
      color: 'text-[#5F8EAD]',
      bg: 'bg-[#5F8EAD]',
      label: 'En Proceso'
    },
    'pendiente': {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500',
      label: 'Pendiente'
    },
    'cancelado': {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-500',
      label: 'Cancelado'
    }
  };

  const getEstadoConfig = (estado) => {
    return estadoConfig[estado] || estadoConfig['pendiente'];
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: 'short'
    });
  };

  const formatearFechaCompleta = (fecha) => {
  if (!fecha) return 'N/A';
  
  // Crear fecha y ajustar por timezone offset
  const date = new Date(fecha);
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/El_Salvador' // ← Forzar zona horaria
  });
};

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(cantidad);
  };

  const calcularTotal = (detalles) => {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((sum, det) => sum + (det.subTotal || 0), 0);
  };

  const calcularDuracion = (mantActual, mantAnterior) => {
    if (!mantAnterior) return null;
    
    const fechaActual = new Date(mantActual.fecha_mantenimiento);
    const fechaAnterior = new Date(mantAnterior.fecha_mantenimiento);
    const dias = Math.floor((fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24));
    
    return dias;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {anosOrdenados.map((ano) => {
        const mantosDelAno = mantenimientosPorAno[ano].sort(
          (a, b) => new Date(b.fecha_mantenimiento) - new Date(a.fecha_mantenimiento)
        );

        return (
          <div key={ano} className="relative">
            {/* Año Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white px-5 py-2 rounded-lg font-bold text-lg shadow-md">
                {ano}
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
              <span className="text-sm font-semibold text-gray-500">
                {mantosDelAno.length} mantenimiento{mantosDelAno.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-8">
              {/* Línea vertical */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-6">
                {mantosDelAno.map((mant, index) => {
                  const config = getEstadoConfig(mant.estado);
                  const Icon = config.icon;
                  const isExpanded = expandedId === mant._id;
                  const total = calcularTotal(mant.detalles);
                  const duracion = calcularDuracion(mant, mantosDelAno[index + 1]);

                  return (
                    <div key={mant._id} className="relative">
                      {/* Punto del timeline */}
                      <div className={`absolute -left-[26px] top-2 w-5 h-5 rounded-full ${config.bg} border-4 border-white shadow-md z-10`}></div>

                      {/* Card del mantenimiento */}
                      <div 
                        className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#5F8EAD] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
                        onClick={() => toggleExpand(mant._id)}
                      >
                        {/* Header compacto */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-[#5F8EAD]">
                                  {formatearFecha(mant.fecha_mantenimiento)}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.color}`}>
                                  <Icon size={14} />
                                  {config.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD] border border-[#5F8EAD]">
                                  {tipoLabels[mant.tipo_de_mantenimiento] || 'Otro'}
                                </span>
                                <span className="text-lg font-bold text-[#34353A]">
                                  {formatearMoneda(total)}
                                </span>
                              </div>

                              {mant.descripcion && (
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  {mant.descripcion}
                                </p>
                              )}

                              {/* Fechas de Registro y Completado */}
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Clock size={12} className="text-[#5F8EAD]" />
                                  <span className="font-semibold">Registrado:</span>
                                  <span>{formatearFechaCompleta(mant.createdAt || mant.fecha_mantenimiento)}</span>
                                </div>
                                {mant.estado === 'completado' && mant.updatedAt && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Check size={12} className="text-[#5D9646]" />
                                    <span className="font-semibold">Completado:</span>
                                    <span>{formatearFechaCompleta(mant.updatedAt)}</span>
                                  </div>
                                )}
                              </div>

                              {duracion !== null && duracion > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                                    duracion > 45 ? 'bg-red-100 text-red-700' :
                                    duracion > 30 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    <Clock size={12} />
                                    {duracion} días desde anterior
                                  </div>
                                </div>
                              )}
                            </div>

                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-gray-600" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Contenido expandido */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <div className="space-y-4">
                              {/* Información general */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Fecha de Servicio</p>
                                  <p className="text-sm font-bold text-gray-800">
                                    {formatearFechaCompleta(mant.fecha_mantenimiento)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Período</p>
                                  <p className="text-sm font-bold text-gray-800">
                                    {mant.mes && mant.ano ? `${mant.mes}/${mant.ano}` : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Descripción completa */}
                              {mant.descripcion && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Descripción</p>
                                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                    {mant.descripcion}
                                  </p>
                                </div>
                              )}

                              {/* Detalles de servicios/partes */}
                              {mant.detalles && mant.detalles.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">
                                    Servicios/Partes ({mant.detalles.length})
                                  </p>
                                  <div className="space-y-2">
                                    {mant.detalles.map((detalle, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                                      >
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-gray-800">
                                            {detalle.descripcion || detalle.concepto || 'Sin descripción'}
                                          </p>
                                          {detalle.cantidad && detalle.precioUnitario && (
                                            <p className="text-xs text-gray-500">
                                              {detalle.cantidad} × {formatearMoneda(detalle.precioUnitario)}
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-sm font-bold text-[#5D9646]">
                                          {formatearMoneda(detalle.subTotal || 0)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Total */}
                                  <div className="flex items-center justify-between bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white p-3 rounded-lg mt-2">
                                    <span className="font-bold">TOTAL</span>
                                    <span className="text-xl font-bold">{formatearMoneda(total)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceTimeline;