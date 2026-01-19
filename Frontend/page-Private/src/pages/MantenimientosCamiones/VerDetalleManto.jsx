import React, { useState, useEffect } from 'react';
import { X, Calendar, Truck, Wrench, FileText, DollarSign, Package, Loader2, AlertCircle, Users } from 'lucide-react';
import { api } from '../../Context/authContext';

const MantenimientoDetailModal = ({ mantenimientoId, isOpen, onClose }) => {
  const [mantenimiento, setMantenimiento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tipoMantenimientoLabels = {
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

  useEffect(() => {
    if (isOpen && mantenimientoId) {
      fetchMantenimientoById(mantenimientoId);
    }
  }, [isOpen, mantenimientoId]);

  const fetchMantenimientoById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CAMBIO: Usar ruta relativa
      const response = await api.get(`/mantenimientos/${id}`);

      const data = response.data?.data || response.data;

      const mantenimientoMapeado = {
        _id: data._id,
        fecha_mantenimiento: data.fecha || data.fecha_mantenimiento,
        mes: data.mes,
        ano: data.ano,
        tipo_de_mantenimiento: data.tipoMantenimiento || data.tipo_de_mantenimiento,
        descripcion: data.descripcion,
        estado: data.estado,
        ciculatioCard: data.camion || data.ciculatioCard,
        proveedores: data.proveedores || [], // ← NUEVO
        detalles: data.detalles || []
      };

      console.log('📦 Mantenimiento cargado:', mantenimientoMapeado);
      setMantenimiento(mantenimientoMapeado);

    } catch (err) {
      console.error('❌ Error al cargar mantenimiento:', err);
      setError(
        err.response?.data?.message ||
        'Error al cargar el mantenimiento'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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
    return detalles.reduce((sum, detalle) => sum + (detalle.subTotal || 0), 0);
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'preventivo':
        return 'from-emerald-600 to-teal-600';
      case 'correctivo':
        return 'from-red-600 to-pink-600';
      default:
        return 'from-indigo-600 to-purple-600';
    }
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendiente', icon: '⏳' },
      'en_proceso': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'En Proceso', icon: '🔧' },
      'completado': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completado', icon: '✅' },
      'cancelado': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado', icon: '❌' }
    };
    return configs[estado] || configs.pendiente;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600 font-medium">Cargando detalles...</p>
            </div>
          ) : error ? (
            // Error State
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchMantenimientoById(mantenimientoId)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : mantenimiento ? (
            <>
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${getTipoColor(mantenimiento.tipo_de_mantenimiento)} px-8 py-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />
                
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white bg-opacity-20 p-2 rounded-xl backdrop-blur-sm">
                        <Wrench className="text-white" size={24} />
                      </div>
                      <span className="text-white text-sm font-semibold px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                        {tipoMantenimientoLabels[mantenimiento.tipo_de_mantenimiento]}
                      </span>
                      {/* ← NUEVO: Badge de estado */}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-sm border-2 ${getEstadoConfig(mantenimiento.estado).color}`}>
                        {getEstadoConfig(mantenimiento.estado).icon} {getEstadoConfig(mantenimiento.estado).label}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      Detalle de Mantenimiento
                    </h2>
                    <p className="text-white text-opacity-80 text-sm">
                      ID: {mantenimiento._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-xl transition-all backdrop-blur-sm"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Fecha */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 p-2.5 rounded-xl">
                        <Calendar className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Fecha</p>
                        <p className="text-gray-900 font-bold capitalize">
                          {formatearFecha(mantenimiento.fecha_mantenimiento)}
                        </p>
                        <p className="text-indigo-600 text-sm font-medium mt-1">
                          {mantenimiento.mes}/{mantenimiento.ano}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Camión */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2.5 rounded-xl">
                        <Truck className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Camión</p>
                        <p className="text-gray-900 font-bold">
                          {mantenimiento.ciculatioCard?.licensePlate || mantenimiento.ciculatioCard?.placa || 'N/A'}
                        </p>
                        <p className="text-blue-600 text-sm font-medium mt-1">
                          {mantenimiento.ciculatioCard?.brand} {mantenimiento.ciculatioCard?.model}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ← NUEVO: Proveedores */}
                {mantenimiento.proveedores && mantenimiento.proveedores.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2.5 rounded-xl">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Proveedores</p>
                        <div className="flex flex-wrap gap-2">
                          {mantenimiento.proveedores.map((proveedor, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold border border-purple-200"
                            >
                              {proveedor.companyName || proveedor.nombre || 'Proveedor'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gray-200 p-2 rounded-xl">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Descripción</p>
                      <p className="text-gray-800 leading-relaxed">
                        {mantenimiento.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles/Conceptos */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="text-indigo-600" size={22} />
                    <h3 className="text-xl font-bold text-gray-900">Desglose de Conceptos</h3>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Concepto</th>
                            <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Proveedor</th>
                            <th className="text-center py-4 px-4 text-gray-600 font-semibold text-sm">Cant.</th>
                            <th className="text-right py-4 px-4 text-gray-600 font-semibold text-sm">P. Unit.</th>
                            <th className="text-right py-4 px-6 text-gray-600 font-semibold text-sm">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mantenimiento.detalles && mantenimiento.detalles.length > 0 ? (
                            mantenimiento.detalles.map((detalle, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-gray-800 font-medium">{detalle.concepto}</td>
                                {/* ← NUEVO: Columna de proveedor */}
                                <td className="py-4 px-4">
                                  {detalle.proveedor ? (
                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                      {detalle.proveedor.companyName || detalle.proveedor.nombre || 'Proveedor'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs italic">Sin proveedor</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-center text-gray-700">{detalle.cantidad}</td>
                                <td className="py-4 px-4 text-right text-gray-700">{formatearMoneda(detalle.precioUnitario)}</td>
                                <td className="py-4 px-6 text-right text-gray-900 font-bold">{formatearMoneda(detalle.subTotal || detalle.subtotal)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-500">
                                No hay detalles registrados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <DollarSign className="text-white" size={28} />
                      </div>
                      <div>
                        <p className="text-white text-opacity-90 text-sm font-medium">Total del Mantenimiento</p>
                        <p className="text-white text-4xl font-bold">
                          {formatearMoneda(calcularTotal(mantenimiento.detalles))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default MantenimientoDetailModal;