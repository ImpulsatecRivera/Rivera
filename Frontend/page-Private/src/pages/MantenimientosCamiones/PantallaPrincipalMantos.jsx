import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Download, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import MantenimientoDetailModal from "./VerDetalleManto";
import ReportesModal from "./ReportesModal";
import Swal from 'sweetalert2';

const MantenimientosTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMantenimientoId, setSelectedMantenimientoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportesModalOpen, setIsReportesModalOpen] = useState(false);

  const itemsPerPage = 8;

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

  const estadoConfig = {
    'pendiente': {
      label: 'Pendiente',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    'en_proceso': {
      label: 'En Proceso',
      bg: 'bg-[#5F8EAD] bg-opacity-20',
      text: 'text-[#5F8EAD]',
      border: 'border-[#5F8EAD]'
    },
    'completado': {
      label: 'Completado',
      bg: 'bg-[#5D9646] bg-opacity-20',
      text: 'text-[#5D9646]',
      border: 'border-[#5D9646]'
    },
    'cancelado': {
      label: 'Cancelado',
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  };

  const getEstadoStyle = (estado) => {
    return estadoConfig[estado] || {
      label: estado || 'Sin Estado',
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    };
  };

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.api.API_URL}/mantenimientos`);
      if (!response.ok) throw new Error('Error al cargar los mantenimientos');
      const result = await response.json();
      setMantenimientos(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mantenimiento) => {
    const result = await Swal.fire({
      html: `<div style="text-align: center; padding: 20px 10px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" fill="none" stroke="#ef4444" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
          </div>
          <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 12px 0;">¿Eliminar mantenimiento?</h2>
          <p style="color: #6b7280;">Esta acción no se puede deshacer</p>
        </div>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${config.api.API_URL}/mantenimientos/${mantenimiento._id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.success) {
          await Swal.fire({ title: '¡Eliminado!', text: 'Mantenimiento eliminado exitosamente', icon: 'success', timer: 2000 });
          fetchMantenimientos();
        } else {
          throw new Error(data.message || 'Error al eliminar');
        }
      } catch (error) {
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
      }
    }
  };

  const calcularTotal = (detalles) => {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((sum, detalle) => sum + (detalle.subTotal || 0), 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad);
  };

  const filteredMantenimientos = mantenimientos.filter(mant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mant.descripcion?.toLowerCase().includes(searchLower) ||
      mant.tipo_de_mantenimiento?.toLowerCase().includes(searchLower) ||
      mant.ciculatioCard?.licensePlate?.toLowerCase().includes(searchLower)
    );
  });

  const sortedMantenimientos = [...filteredMantenimientos].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.fecha_mantenimiento) - new Date(a.fecha_mantenimiento);
    if (sortBy === 'oldest') return new Date(a.fecha_mantenimiento) - new Date(b.fecha_mantenimiento);
    return 0;
  });

  const totalPages = Math.ceil(sortedMantenimientos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMantenimientos = sortedMantenimientos.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando mantenimientos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar los datos</p>
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchMantenimientos} className="mt-4 px-6 py-2 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-lg hover:opacity-90">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#34353A] mb-2">Mantenimientos</h1>
          <p className="text-[#5F8EAD] text-base font-semibold">Total: {mantenimientos.length} registros</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por descripción, tipo o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD]"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Ordenar por:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#5F8EAD]">
                  <option value="newest">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                </select>
              </div>

              <button 
                onClick={() => setIsReportesModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5F8EAD] to-[#34353A] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg transition-all"
              >
                <Download size={18} />
                Generar Reportes
              </button>

              <button 
                onClick={() => navigate('/mantenimientos/agregar-mantenimiento')} 
                className="flex items-center gap-2 px-5 py-3 bg-[#5D9646] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg"
              >
                <Plus size={20} />
                Agregar Mantenimiento
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] border-b-2 border-[#5D9646]">
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Fecha</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Camión</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Tipo</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Estado</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Descripción</th>
                  <th className="text-left py-5 px-6 text-white font-semibold text-sm">Mes/Año</th>
                  <th className="text-right py-5 px-6 text-white font-semibold text-sm">Total</th>
                  <th className="text-center py-5 px-6 text-white font-semibold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMantenimientos.map((mant) => {
                  const estadoStyle = getEstadoStyle(mant.estado);
                  return (
                    <tr 
                      key={mant._id} 
                      onClick={() => { setSelectedMantenimientoId(mant._id); setIsModalOpen(true); }} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-5 px-6 text-[#34353A] font-semibold">{formatearFecha(mant.fecha_mantenimiento)}</td>
                      <td className="py-5 px-6 text-gray-600">{mant.ciculatioCard?.licensePlate || 'N/A'}</td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#5F8EAD] bg-opacity-20 text-[#5F8EAD]">
                          {tipoMantenimientoLabels[mant.tipo_de_mantenimiento] || 'N/A'}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${estadoStyle.bg} ${estadoStyle.text} ${estadoStyle.border}`}>
                          {estadoStyle.label}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-gray-700">{mant.descripcion || 'Sin descripción'}</td>
                      <td className="py-5 px-6 text-gray-600">
                        {mant.mes && mant.ano ? `${mant.mes}/${mant.ano}` : mant.fecha_mantenimiento ? `${new Date(mant.fecha_mantenimiento).getMonth() + 1}/${new Date(mant.fecha_mantenimiento).getFullYear()}` : 'N/A'}
                      </td>
                      <td className="py-5 px-6 text-right font-bold text-[#34353A]">{formatearMoneda(calcularTotal(mant.detalles))}</td>
                      <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(`${config.api.API_URL}/reporte/individual/${mant._id}`, "_blank")}
                            className="p-2 rounded-lg bg-[#5F8EAD] bg-opacity-20 hover:bg-[#5F8EAD] hover:bg-opacity-30 text-[#5F8EAD] transition-colors"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>

                          {mant.estado !== 'completado' && mant.estado !== 'cancelado' && (
                            <button
                              onClick={() => navigate(`/mantenimientos/editar/${mant._id}`)}
                              className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(mant)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando {startIndex + 1} a {Math.min(endIndex, sortedMantenimientos.length)} de {sortedMantenimientos.length} registros
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1} 
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, idx) => (
                <button 
                  key={idx + 1} 
                  onClick={() => setCurrentPage(idx + 1)} 
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === idx + 1 
                      ? 'bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <button 
                    onClick={() => setCurrentPage(totalPages)} 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages} 
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReportesModal 
        isOpen={isReportesModalOpen}
        onClose={() => setIsReportesModalOpen(false)}
        apiUrl={config.api.API_URL}
      />

      <MantenimientoDetailModal 
        mantenimientoId={selectedMantenimientoId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default MantenimientosTable;