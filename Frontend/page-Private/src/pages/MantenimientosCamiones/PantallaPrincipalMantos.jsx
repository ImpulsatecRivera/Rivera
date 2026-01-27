import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Download, Edit, Trash2, Plus, Check, TruckIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import MantenimientoDetailModal from "./VerDetalleManto";
import ReportesModal from "./ReportesModal";
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedAction } from '../../components/Auth';
import Swal from 'sweetalert2';
import { api } from '../../Context/authContext';

const formatDateTimeLocal = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatearFechaCorta = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatearHoraCorta = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const MantenimientosTable = () => {
  const navigate = useNavigate();
  const { canCreate, canDelete } = usePermissions();
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

  const descargarReporteIndividual = async (id) => {
<<<<<<< HEAD
=======
  try {
    // Mostrar alerta de procesando
    Swal.fire({
      title: 'Procesando...',
      html: '<div style="text-align: center;"><div style="border: 4px solid #f3f3f3; border-top: 4px solid #5F8EAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div><p style="margin-top: 10px; color: #666;">Generando reporte, por favor espera</p></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
    });

    const response = await api.get(`/reporte/individual/${id}`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-mantenimiento-${id}.pdf`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Cerrar alerta de procesando y mostrar éxito
    Swal.fire({
      icon: 'success',
      title: '¡Reporte generado!',
      text: 'El reporte individual se descargó correctamente',
      confirmButtonText: 'OK',
      confirmButtonColor: '#5F8EAD',
      timer: 3000,
      timerProgressBar: true
    });

  } catch (error) {
    console.error('Error descargando reporte individual:', error);

    Swal.fire({
      icon: 'error',
      title: 'Error al generar reporte',
      text: error.response?.data?.message || 'No se pudo descargar el reporte',
      confirmButtonColor: '#5F8EAD'
    });
  }
};

 const fetchMantenimientos = async () => {
  try {
    setLoading(true);
    const { data } = await api.get('/mantenimientos'); // ✅ Sin config.api.API_URL
    setMantenimientos(data.data || data || []); // ✅ Más seguro
    setError(null);
  } catch (err) {
    console.error('Error cargando mantenimientos:', err);
    setError(err.response?.data?.message || err.message || 'Error al cargar los mantenimientos');
  } finally {
    setLoading(false);
  }
};

const marcarComoCompletado = async (id) => {
  const result = await Swal.fire({
    title: '¿Marcar como completado?',
    html: '<p class="text-gray-700">Selecciona la fecha y hora en la que se finalizó el mantenimiento.</p>',
    icon: 'question',
    input: 'datetime-local',
    inputLabel: 'Fecha y hora de finalización',
    inputValue: formatDateTimeLocal(),
    inputAttributes: {
      step: '60'
    },
    showCancelButton: true,
    confirmButtonText: 'Sí, marcar completado',
    confirmButtonColor: '#5D9646',
    cancelButtonColor: '#6b7280',
    cancelButtonText: 'Cancelar',
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage('Selecciona la fecha y hora de finalización');
      }
      return value;
    }
  });

  if (!result.isConfirmed || !result.value) return;

  const fechaFinalizacion = result.value;

  try {
    Swal.fire({
      title: 'Actualizando...',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
          <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #5F8EAD;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <p style="color: #666; font-size: 14px; margin: 0;">Por favor espera...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    const response = await api.put(`/mantenimientos/${id}`, {
      estado: 'completado',
      fecha_finalizacion: new Date(fechaFinalizacion).toISOString()
    });

    if (response.data.success) {
      await fetchMantenimientos();
      
      Swal.fire({
        icon: 'success',
        title: '¡Completado!',
        text: 'El mantenimiento ha sido marcado como completado',
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error marcando como completado:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'No se pudo marcar como completado',
      confirmButtonColor: '#ef4444'
    });
  }
};


  const handleDelete = async (mantenimiento) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    html: `
      <div class="text-left">
        <p class="text-gray-700 mb-4">Esta acción no se puede deshacer.</p>
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-600 mb-2">
            <strong class="text-gray-800">Camión:</strong> ${mantenimiento.ciculatioCard?.licensePlate || 'N/A'}
          </p>
          <p class="text-sm text-gray-600 mb-2">
            <strong class="text-gray-800">Tipo:</strong> ${tipoMantenimientoLabels[mantenimiento.tipo_de_mantenimiento] || 'N/A'}
          </p>
          <p class="text-sm text-gray-600 mb-2">
            <strong class="text-gray-800">Fecha:</strong> ${formatearFecha(mantenimiento.fecha_mantenimiento)}
          </p>
          <p class="text-sm text-gray-600">
            <strong class="text-gray-800">Total:</strong> ${formatearMoneda(calcularTotal(mantenimiento.detalles))}
          </p>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl',
      title: 'text-xl font-bold text-gray-800',
      confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
      cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
    }
  });

  if (result.isConfirmed) {
    // Mostrar loading
    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

>>>>>>> c162f964af8929843b6808c0f56ae3b60ef7293e
    try {
      Swal.fire({
        title: 'Procesando...',
        html: '<div style="text-align: center;"><div style="border: 4px solid #f3f3f3; border-top: 4px solid #5F8EAD; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div><p style="margin-top: 10px; color: #666;">Generando reporte, por favor espera</p></div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          const style = document.createElement('style');
          style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
      });

      const response = await api.get(`/reporte/individual/${id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-mantenimiento-${id}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: '¡Reporte generado!',
        text: 'El reporte individual se descargó correctamente',
        confirmButtonText: 'OK',
        confirmButtonColor: '#5F8EAD',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error descargando reporte individual:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al generar reporte',
        text: error.response?.data?.message || 'No se pudo descargar el reporte',
        confirmButtonColor: '#5F8EAD'
      });
    }
  };

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/mantenimientos');
      setMantenimientos(data.data || data || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando mantenimientos:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar los mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoCompletado = async (id) => {
    const result = await Swal.fire({
      title: '¿Marcar como completado?',
      text: 'El mantenimiento se marcará como completado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar completado',
      confirmButtonColor: '#5D9646',
      cancelButtonColor: '#6b7280',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Actualizando...',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <div class="spinner" style="
              width: 50px;
              height: 50px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #5F8EAD;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <p style="color: #666; font-size: 14px; margin: 0;">Por favor espera...</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      const response = await api.put(`/mantenimientos/${id}`, {
        estado: 'completado'
      });

      if (response.data.success) {
        await fetchMantenimientos();
        
        Swal.fire({
          icon: 'success',
          title: '¡Completado!',
          text: 'El mantenimiento ha sido marcado como completado',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error marcando como completado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo marcar como completado',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDelete = async (mantenimiento) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">Esta acción no se puede deshacer.</p>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-600 mb-2">
              <strong class="text-gray-800">Camión:</strong> ${mantenimiento.ciculatioCard?.licensePlate || 'N/A'}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong class="text-gray-800">Tipo:</strong> ${tipoMantenimientoLabels[mantenimiento.tipo_de_mantenimiento] || 'N/A'}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong class="text-gray-800">Fecha:</strong> ${formatearFecha(mantenimiento.fecha_mantenimiento)}
            </p>
            <p class="text-sm text-gray-600">
              <strong class="text-gray-800">Total:</strong> ${formatearMoneda(calcularTotal(mantenimiento.detalles))}
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const { data } = await api.delete(`/mantenimientos/${mantenimiento._id}`);

        if (data.success) {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'El mantenimiento se ha eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
          fetchMantenimientos();
        } else {
          throw new Error(data.message || 'Error al eliminar');
        }
      } catch (error) {
        console.error('Error eliminando mantenimiento:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || error.message || 'No se pudo eliminar el mantenimiento',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-2.5 rounded-lg font-semibold'
          }
        });
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
        {/* HEADER CON BOTÓN AL PANEL DE FLOTA */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-2">Mantenimientos</h1>
              <p className="text-[#5F8EAD] text-base font-semibold">Total: {mantenimientos.length} registros</p>
            </div>
            
            {/* BOTÓN PARA IR AL PANEL DE FLOTA */}
            <button
              onClick={() => navigate('/flota')}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg transition-all"
            >
              <TruckIcon size={20} />
              Ver Panel de Flota
            </button>
          </div>
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

              <ProtectedAction action="create">
                <button 
                  onClick={() => navigate('/mantenimientos/agregar-mantenimiento')} 
                  className="flex items-center gap-2 px-5 py-3 bg-[#5D9646] text-white rounded-xl hover:opacity-90 font-semibold shadow-lg"
                >
                  <Plus size={20} />
                  Agregar Mantenimiento
                </button>
              </ProtectedAction>
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
                      <td className="py-5 px-6 text-[#34353A] font-semibold">
                        <div className="flex flex-col">
                          <span>{formatearFechaCorta(mant.fecha_mantenimiento)}</span>
                          <span className="text-xs text-gray-500">{formatearHoraCorta(mant.fecha_mantenimiento)}</span>
                        </div>
                      </td>
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
                            onClick={() => descargarReporteIndividual(mant._id)}
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>

                          {mant.estado !== 'completado' && mant.estado !== 'cancelado' && (
                            <>
                              <ProtectedAction action="edit">
                                <button
                                  onClick={() => navigate(`/mantenimientos/editar/${mant._id}`)}
                                  className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                              </ProtectedAction>

                              <button
                                onClick={() => marcarComoCompletado(mant._id)}
                                className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                                title="Marcar como completado"
                              >
                                <Check size={18} />
                              </button>
                            </>
                          )}

                          <ProtectedAction action="delete">
                            <button
                              onClick={() => handleDelete(mant)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Eliminar"
                              disabled={mant.estado === 'completado' || mant.estado === 'cancelado'}
                              style={{ opacity: (mant.estado === 'completado' || mant.estado === 'cancelado') ? 0.5 : 1, cursor: (mant.estado === 'completado' || mant.estado === 'cancelado') ? 'not-allowed' : 'pointer' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </ProtectedAction>
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