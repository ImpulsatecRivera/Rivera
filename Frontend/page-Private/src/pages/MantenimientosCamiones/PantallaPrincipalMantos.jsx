import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Download, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import MantenimientoDetailModal from "./VerDetalleManto";
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

  const itemsPerPage = 8;

  // Mapeo de tipos de mantenimiento para mostrar en español
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

  // Fetch mantenimientos desde la API
  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.api.API_URL}/mantenimientos`);

      if (!response.ok) {
        throw new Error('Error al cargar los mantenimientos');
      }

      const result = await response.json();
      const mantenimientosArray = result.data || [];

      console.log('Mantenimientos cargados:', mantenimientosArray.length);
      console.log('Ejemplo de mantenimiento:', mantenimientosArray[0]);

      setMantenimientos(mantenimientosArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar mantenimiento
  const handleDelete = async (mantenimiento) => {
    const result = await Swal.fire({
      html: `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
            </svg>
          </div>
          
          <h2 style="
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
          ">¿Eliminar mantenimiento?</h2>
          
          <p style="
            font-size: 15px;
            color: #6b7280;
            margin: 0 0 24px 0;
            line-height: 1.5;
          ">Esta acción no se puede deshacer</p>
          
          <div style="
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 16px;
            padding: 20px;
            margin: 0 0 8px 0;
            border: 1px solid #e5e7eb;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
            ">
              <span style="
                font-size: 13px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Detalles</span>
            </div>
            
            <p style="
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 12px 0;
            ">${mantenimiento.descripcion || 'Sin descripción'}</p>
            
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                color: #6b7280;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${formatearFecha(mantenimiento.fecha_mantenimiento)}</span>
              </div>
              
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                color: #6b7280;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>${mantenimiento.ciculatioCard?.licensePlate || 'N/A'}</span>
              </div>
              
              <div style="
                display: inline-flex;
                align-items: center;
                padding: 4px 12px;
                background: #eef2ff;
                color: #4f46e5;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
              ">
                ${tipoMantenimientoLabels[mantenimiento.tipo_de_mantenimiento] || mantenimiento.tipo_de_mantenimiento || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>Sí, eliminar</span>',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#f3f4f6',
      reverseButtons: true,
      width: '580px',
      padding: '0',
      background: '#ffffff',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      showClass: {
        popup: 'swal2-show',
        backdrop: 'swal2-backdrop-show'
      },
      customClass: {
        popup: 'rounded-3xl shadow-2xl border-0',
        confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0',
        cancelButton: 'rounded-xl px-6 py-3 font-semibold border-0 text-gray-700 hover:bg-gray-200 transition-all duration-200',
        actions: 'gap-3 mt-6 mb-4'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loading moderno
        Swal.fire({
          html: `
            <div style="text-align: center; padding: 40px 20px;">
              <div style="
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                position: relative;
              ">
                <div style="
                  width: 100%;
                  height: 100%;
                  border: 4px solid #e5e7eb;
                  border-top-color: #6366f1;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                "></div>
              </div>
              
              <h3 style="
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
              ">Eliminando mantenimiento</h3>
              
              <p style="
                font-size: 14px;
                color: #6b7280;
                margin: 0;
              ">Por favor espera un momento...</p>
            </div>
            
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          `,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          width: '400px',
          padding: '0',
          background: '#ffffff',
          backdrop: 'rgba(0, 0, 0, 0.4)',
          customClass: {
            popup: 'rounded-3xl shadow-2xl border-0'
          }
        });

        const response = await fetch(`${config.api.API_URL}/mantenimientos/${mantenimiento._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Éxito con animación
          await Swal.fire({
            html: `
              <div style="text-align: center; padding: 20px 10px;">
                <div style="
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                  margin: 0 auto 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  animation: successPulse 0.6s ease-out;
                  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
                ">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                
                <h2 style="
                  font-size: 28px;
                  font-weight: 700;
                  color: #1f2937;
                  margin: 0 0 12px 0;
                  letter-spacing: -0.5px;
                ">¡Eliminado exitosamente!</h2>
                
                <p style="
                  font-size: 15px;
                  color: #6b7280;
                  margin: 0;
                  line-height: 1.5;
                ">El mantenimiento ha sido eliminado de forma permanente</p>
              </div>
              
              <style>
                @keyframes successPulse {
                  0% {
                    transform: scale(0.8);
                    opacity: 0;
                  }
                  50% {
                    transform: scale(1.1);
                  }
                  100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
              </style>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#10b981',
            width: '500px',
            padding: '0',
            background: '#ffffff',
            backdrop: 'rgba(0, 0, 0, 0.4)',
            timer: 3000,
            timerProgressBar: true,
            showClass: {
              popup: 'swal2-show',
              backdrop: 'swal2-backdrop-show'
            },
            customClass: {
              popup: 'rounded-3xl shadow-2xl border-0',
              confirmButton: 'rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0',
              actions: 'mt-6 mb-4'
            }
          });

          // Recargar la lista de mantenimientos
          fetchMantenimientos();
        } else {
          throw new Error(data.message || 'Error al eliminar el mantenimiento');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        
        Swal.fire({
          html: `
            <div style="text-align: center; padding: 20px 10px;">
              <div style="
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                margin: 0 auto 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
              ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              
              <h2 style="
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 12px 0;
                letter-spacing: -0.5px;
              ">Error al eliminar</h2>
              
              <p style="
                font-size: 15px;
                color: #6b7280;
                margin: 0 0 8px 0;
                line-height: 1.5;
              ">${error.message || 'No se pudo eliminar el mantenimiento'}</p>
              
              <p style="
                font-size: 14px;
                color: #9ca3af;
                margin: 0;
              ">Por favor, intenta nuevamente</p>
            </div>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#6366f1',
          width: '500px',
          padding: '0',
          background: '#ffffff',
          backdrop: 'rgba(0, 0, 0, 0.4)',
          customClass: {
            popup: 'rounded-3xl shadow-2xl border-0',
            confirmButton: 'rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0',
            actions: 'mt-6 mb-4'
          }
        });
      }
    }
  };

  // Calcular el total de un mantenimiento
  const calcularTotal = (detalles) => {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((sum, detalle) => sum + (detalle.subTotal || 0), 0);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear moneda
  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad);
  };

  // Filtrar mantenimientos
  const filteredMantenimientos = mantenimientos.filter(mant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mant.descripcion?.toLowerCase().includes(searchLower) ||
      mant.tipo_de_mantenimiento?.toLowerCase().includes(searchLower) ||
      mant.ciculatioCard?.licensePlate?.toLowerCase().includes(searchLower)
    );
  });

  // Ordenar mantenimientos
  const sortedMantenimientos = [...filteredMantenimientos].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.fecha_mantenimiento) - new Date(a.fecha_mantenimiento);
    } else if (sortBy === 'oldest') {
      return new Date(a.fecha_mantenimiento) - new Date(b.fecha_mantenimiento);
    }
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedMantenimientos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMantenimientos = sortedMantenimientos.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
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
          <button
            onClick={fetchMantenimientos}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mantenimientos</h1>
          <p className="text-indigo-600 text-base font-semibold">
            Total: {mantenimientos.length} registros
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por descripción, tipo o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
              />
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium whitespace-nowrap">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option value="newest">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                </select>
              </div>

              {/* Download Report Button */}
              <button
                onClick={() => window.open(`${config.api.API_URL}/reporte/todos`, "_blank")}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold shadow-sm"
              >
                <Download size={18} />
                Descargar Reportes
              </button>

              {/* Add Maintenance Button */}
              <button
                onClick={() => navigate('/mantenimientos/agregar-mantenimiento')}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                <Plus size={20} strokeWidth={2.5} />
                Agregar Mantenimiento
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Fecha</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Camión</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Tipo</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Descripción</th>
                  <th className="text-left py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Mes/Año</th>
                  <th className="text-right py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">Total</th>
                  <th className="text-center py-5 px-6 text-gray-500 font-semibold text-sm tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentMantenimientos.map((mant) => (
                  <tr
                    key={mant._id}
                    onClick={() => {
                      setSelectedMantenimientoId(mant._id);
                      setIsModalOpen(true);
                    }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="py-5 px-6 text-gray-900 font-semibold">
                      {formatearFecha(mant.fecha_mantenimiento)}
                    </td>
                    <td className="py-5 px-6 text-gray-600">
                      {mant.ciculatioCard?.licensePlate || 'N/A'}
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        {tipoMantenimientoLabels[mant.tipo_de_mantenimiento] || mant.tipo_de_mantenimiento || 'N/A'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-gray-700">
                      {mant.descripcion || 'Sin descripción'}
                    </td>
                    <td className="py-5 px-6 text-gray-600">
                      {(() => {
                        if (mant.mes && mant.ano) {
                          return `${mant.mes}/${mant.ano}`;
                        }
                        if (mant.fecha_mantenimiento) {
                          const fecha = new Date(mant.fecha_mantenimiento);
                          return `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                        }
                        return 'N/A';
                      })()}
                    </td>
                    <td className="py-5 px-6 text-right font-bold text-gray-900">
                      {formatearMoneda(calcularTotal(mant.detalles))}
                    </td>

                    {/* ------- ACCIONES -------- */}
                    <td
                      className="py-5 px-6"
                      onClick={(e) => e.stopPropagation()} // evita abrir modal
                    >
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Descargar PDF */}
                        <button
                          onClick={() =>
                            window.open(
                              `${config.api.API_URL}/reporte/individual/${mant._id}`,
                              "_blank"
                            )
                          }
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => navigate(`/mantenimientos/editar/${mant._id}`)}
                          className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDelete(mant)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando {startIndex + 1} a {Math.min(endIndex, sortedMantenimientos.length)} de <span className="font-bold text-gray-900">{sortedMantenimientos.length}</span> registros
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-400 font-semibold">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MantenimientoDetailModal
        mantenimientoId={selectedMantenimientoId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MantenimientosTable;