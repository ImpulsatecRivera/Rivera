import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Loader2, Plus, Edit2, Trash2, Upload, Eye, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { config } from '../../config';
import Swal from 'sweetalert2';
import './Ventas.css';
import ModalReportesVentas from './ModalReportesVentas';
import VentaDetailModal from './VentaDetailModal';
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedAction, RoleBadge } from '../../components/Auth';
import { api } from "../../Context/authContext"
import { useNavigate } from 'react-router-dom';


export default function Ventas() {
    const navigate = useNavigate();
    const { canCreate, canDelete, canEdit } = usePermissions();

    const [ventasData, setVentasData] = useState([]);
    const [clientesData, setClientesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReportesModal, setShowReportesModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVentaId, setSelectedVentaId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const itemsPerPage = 8;

   
    useEffect(() => {
        cargarVentas();
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            console.log('Iniciando carga de clientes...');
            const { data } = await api.get(`${config.api.API_URL}/clientes`);
            console.log('Respuesta bruta clientes:', data);
            console.log('Tipo de data:', typeof data);
            console.log('¿Es array?:', Array.isArray(data));

            // Intentar extraer el array de diferentes estructuras posibles
            let clientesList = [];

            if (Array.isArray(data)) {
                clientesList = data;
                console.log('✅ Data es un array directamente');
            } else if (data?.data?.clientes && Array.isArray(data.data.clientes)) {
                clientesList = data.data.clientes;
                console.log('✅ Data extraída de data.data.clientes');
            } else if (data?.data && Array.isArray(data.data)) {
                clientesList = data.data;
                console.log('✅ Data extraída de data.data');
            } else if (data?.clientes && Array.isArray(data.clientes)) {
                clientesList = data.clientes;
                console.log('✅ Data extraída de data.clientes');
            } else {
                console.warn('⚠️ No se encontró estructura de array conocida. Data completa:', data);
                clientesList = [];
            }

            console.log('Clientes finales:', clientesList);
            console.log('Cantidad de clientes:', clientesList.length);
            setClientesData(clientesList);
        } catch (err) {
            console.error('❌ Error al cargar clientes:', err);
            console.error('Mensaje error:', err.message);
            setClientesData([]);
        }
    };

    const cargarVentas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`${config.api.API_URL}/ventas`);
            console.log('Respuesta ventas:', response.data);
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            setVentasData(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al cargar ventas');
            setVentasData([]);
        } finally {
            setLoading(false);
        }
    };


    const getNombreCliente = (cliente) => {
        if (!cliente) return 'Sin nombre';
        // Si es cliente corporativo
        if (cliente.tipoCliente === 'corporativo') {
            return cliente.nombreComercial || cliente.nombreEmpresa || 'Cliente sin nombre';
        }
        // Si es cliente personal
        return `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim() || 'Cliente sin nombre';
    };

    const eliminarVenta = async (venta) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Anular venta?',
            text: `La venta de ${getNombreCliente(venta.clienteId)} se marcará como anulada.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        });

        if (!isConfirmed) return;

        try {
            await api.patch(`${config.api.API_URL}/ventas/${venta._id}/estado`, { estado: 'anulada' });
            Swal.fire({
                title: 'Venta anulada',
                text: 'La venta ha sido marcada como anulada',
                icon: 'success',
                timer: 2000
            });
            await cargarVentas();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo anular la venta',
                icon: 'error'
            });
        }
    };

    const marcarPagada = async (venta) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Marcar como pagada?',
            text: `La venta de ${getNombreCliente(venta.clienteId)} se marcará como pagada.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, marcar',
            cancelButtonText: 'Cancelar'
        });

        if (!isConfirmed) return;

        try {
            await api.patch(`${config.api.API_URL}/ventas/${venta._id}/estado`, { estado: 'pagada' });
            Swal.fire({
                title: 'Venta pagada',
                text: 'La venta ha sido marcada como pagada',
                icon: 'success',
                timer: 2000
            });
            await cargarVentas();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo marcar como pagada',
                icon: 'error'
            });
        }
    };

    const reemplazarComprobante = async (venta) => {
        const { value: file } = await Swal.fire({
            title: 'Reemplazar Comprobante',
            html: `
            <div class="px-4 py-2">
              <p class="text-sm text-gray-600 mb-4">Selecciona una nueva imagen o PDF del comprobante</p>
              <label for="swal-input-file-replace" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5F8EAD] hover:bg-gray-50 transition-all">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500">
                    <span class="font-semibold">Click para seleccionar</span> o arrastra
                  </p>
                  <p class="text-xs text-gray-400">Imágenes (JPG, PNG) o PDF (MAX. 10MB)</p>
                </div>
                <input type="file" id="swal-input-file-replace" accept="image/*,.pdf" class="hidden" onchange="document.getElementById('file-name-replace').textContent = this.files[0]?.name || 'Sin archivos seleccionados'; document.getElementById('file-name-replace').className = this.files[0] ? 'text-base font-semibold text-center text-[#5F8EAD] mt-3 break-all px-2' : 'text-sm text-center text-gray-500 mt-2';">
              </label>
              <p id="file-name-replace" class="text-sm text-center text-gray-500 mt-2">Sin archivos seleccionados</p>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: 'Reemplazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#5F8EAD',
            cancelButtonColor: '#64748b',
            width: '90%',
            maxWidth: '500px',
            customClass: {
                container: 'swal-responsive',
                popup: 'rounded-2xl',
                title: 'text-xl font-bold text-gray-800',
                confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
                cancelButton: 'px-6 py-2.5 rounded-lg font-medium'
            },
            preConfirm: () => {
                const fileInput = document.getElementById('swal-input-file-replace');
                if (!fileInput.files[0]) {
                    Swal.showValidationMessage('Debes seleccionar un archivo');
                    return false;
                }
                return fileInput.files[0];
            }
        });

        if (!file) return;

        Swal.fire({
            title: 'Reemplazando comprobante...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('comprobante', file);

            await api.patch(`/ventas/${venta._id}/comprobante`, formDataToSend);

            Swal.fire({
                title: '¡Comprobante reemplazado!',
                text: 'El comprobante se ha actualizado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarVentas();
        } catch (error) {
            console.error('💥 Error reemplazando comprobante:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo reemplazar el comprobante',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const subirComprobante = async (venta) => {
        const { value: file } = await Swal.fire({
            title: 'Subir Comprobante de Venta',
            html: `
            <div class="px-4 py-2">
              <p class="text-sm text-gray-600 mb-4">Selecciona una imagen o PDF del comprobante</p>
              <label for="swal-input-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5F8EAD] hover:bg-gray-50 transition-all">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500">
                    <span class="font-semibold">Click para seleccionar</span> o arrastra
                  </p>
                  <p class="text-xs text-gray-400">Imágenes (JPG, PNG) o PDF (MAX. 10MB)</p>
                </div>
                <input type="file" id="swal-input-file" accept="image/*,.pdf" class="hidden" onchange="document.getElementById('file-name').textContent = this.files[0]?.name || 'Sin archivos seleccionados'; document.getElementById('file-name').className = this.files[0] ? 'text-base font-semibold text-center text-[#5F8EAD] mt-3 break-all px-2' : 'text-sm text-center text-gray-500 mt-2';">
              </label>
              <p id="file-name" class="text-sm text-center text-gray-500 mt-2">Sin archivos seleccionados</p>
            </div>
          `,
            showCancelButton: true,
            confirmButtonText: 'Subir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#5F8EAD',
            cancelButtonColor: '#64748b',
            width: '90%',
            maxWidth: '500px',
            customClass: {
                container: 'swal-responsive',
                popup: 'rounded-2xl',
                title: 'text-xl font-bold text-gray-800',
                confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
                cancelButton: 'px-6 py-2.5 rounded-lg font-medium'
            },
            preConfirm: () => {
                const fileInput = document.getElementById('swal-input-file');
                if (!fileInput.files[0]) {
                    Swal.showValidationMessage('Debes seleccionar un archivo');
                    return false;
                }
                return fileInput.files[0];
            }
        });

        if (!file) return;

        Swal.fire({
            title: 'Subiendo comprobante...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('comprobante', file);

            await api.patch(`/ventas/${venta._id}/comprobante`, formDataToSend);

            Swal.fire({
                title: '¡Comprobante subido!',
                text: 'El comprobante se ha subido correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarVentas();
        } catch (error) {
            console.error('💥 Error subiendo comprobante:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo subir el comprobante',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const abrirArchivoOpciones = async (venta) => {
        const { isConfirmed, value } = await Swal.fire({
            title: 'Comprobante',
            text: '¿Qué deseas hacer con el comprobante?',
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Ver comprobante',
            denyButtonText: 'Reemplazar comprobante',
            confirmButtonColor: '#5F8EAD',
            denyButtonColor: '#64748b'
        });

        if (isConfirmed) {
            // Ver comprobante
            if (venta.voucher && typeof venta.voucher === 'string') {
                window.open(venta.voucher, '_blank', 'noopener,noreferrer');
            }
        } else if (value === false) {
            // Reemplazar comprobante
            await reemplazarComprobante(venta);
        }
    };


    const openDetailModal = (ventaId) => {
        setSelectedVentaId(ventaId);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedVentaId(null);
    };

    // Funciones auxiliares
    const descargarReporteIndividual = async (ventaId) => {
        try {
            const response = await api.get(`${config.api.API_URL}/reportesVentas/individual/${ventaId}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_venta_${ventaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire({
                title: 'Descarga exitosa',
                text: 'El reporte se ha descargado correctamente',
                icon: 'success',
                timer: 2000
            });
        } catch (error) {
            console.error('Error descargando reporte:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.status === 401 ? 'No tienes permisos para descargar este reporte' : 'No se pudo descargar el reporte',
                icon: 'error'
            });
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatearMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cantidad);
    };

    const filteredVentas = useMemo(() => ventasData.filter(v => {
        const clienteName = getNombreCliente(v.clienteId).toLowerCase();
        const matchesSearch = clienteName.includes(searchTerm.toLowerCase()) ||
            (v.monto && v.monto.toString().includes(searchTerm)) ||
            (v.descripcion && v.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesEstado = estadoFiltro === 'Todos' || v.estado === estadoFiltro.toLowerCase();
        return matchesSearch && matchesEstado;
    }), [ventasData, searchTerm, estadoFiltro]);

    const sortedVentas = useMemo(() => {
        const sorted = [...filteredVentas];
        if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
        if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.fechaEmision) - new Date(b.fechaEmision));
        if (sortBy === 'monto-alto') sorted.sort((a, b) => b.monto - a.monto);
        if (sortBy === 'monto-bajo') sorted.sort((a, b) => a.monto - b.monto);
        return sorted;
    }, [filteredVentas, sortBy]);

    const totalPages = Math.ceil(sortedVentas.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = sortedVentas.slice(startIndex, endIndex);

    useEffect(() => setCurrentPage(1), [searchTerm, sortBy, estadoFiltro]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#5F8EAD] mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Cargando ventas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold mb-2">Error al cargar</p>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={cargarVentas} className="bg-[#5F8EAD] text-white px-4 py-2 rounded-lg hover:opacity-90">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#34353A]">Ventas</h1>
                        <p className="text-slate-500 mt-1">Gestiona tus ventas y comprobantes</p>
                    </div>
                    <ProtectedAction requiredPermission="create">
                        <button
                            onClick={() => navigate('/agregar-venta')}
                            className="flex items-center gap-2 bg-[#5F8EAD] text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-colors"
                        >
                            <Plus size={18} />
                            Nueva Venta
                        </button>
                    </ProtectedAction>
                </div>

                {/* Tabla Ventas */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#34353A]">
                                    Mis Ventas
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Total: {ventasData.length} registros
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente o descripción..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#5F8EAD] focus:outline-none transition-colors w-full sm:w-64"
                                    />
                                </div>

                                <button
                                    onClick={() => setShowReportesModal(true)}
                                    className="flex items-center justify-center gap-2 bg-[#5D9646] text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all"
                                >
                                    <FileText size={18} />
                                    Generar Reportes
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] border-b-2 border-[#5D9646]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Fecha</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Cliente</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Descripción</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase">Total (c/ IVA)</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {currentRows.length > 0 ? (
                                    currentRows.map((venta, idx) => (
                                        <tr
                                            key={venta._id}
                                            onClick={() => openDetailModal(venta._id)}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-slate-600 text-sm">{formatearFecha(venta.fechaEmision || venta.createdAt)}</td>
                                            <td className="px-6 py-4"><span className="font-medium text-[#34353A]">{getNombreCliente(venta.clienteId)}</span></td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{venta.descripcion}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium
                                                ${venta.estado === 'pagada' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                            : venta.estado === 'anulada' ? 'bg-red-100 text-red-700 border border-red-200'
                                                                : 'bg-amber-100 text-amber-700 border border-amber-200'}`}
                                                >
                                                    {venta.estado === 'pagada' ? 'Pagada' : venta.estado === 'anulada' ? 'Anulada' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-[#34353A]">
                                                {formatearMoneda(venta.total)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {venta.voucher ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                abrirArchivoOpciones(venta);
                                                            }}
                                                            title="Opciones de comprobante"
                                                            className="p-2 rounded-lg bg-[#5F8EAD] bg-opacity-20 hover:bg-[#5F8EAD] hover:bg-opacity-30 text-[#5F8EAD] transition-all hover:scale-110"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                subirComprobante(venta);
                                                            }}
                                                            title="Subir comprobante"
                                                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all hover:scale-110"
                                                        >
                                                            <Upload size={18} />
                                                        </button>
                                                    )}

                                                    {canEdit && venta.estado === 'pendiente' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/agregar-venta/${venta._id}`);
                                                            }}
                                                            title="Editar venta"
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all hover:scale-110"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                    )}

                                                    {canDelete && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    eliminarVenta(venta);
                                                                }}
                                                                title="Anular venta"
                                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all hover:scale-110 disabled:opacity-50"
                                                                disabled={venta.estado === 'anulada'}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    marcarPagada(venta);
                                                                }}
                                                                title="Marcar como pagada"
                                                                className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 transition-all hover:scale-110 disabled:opacity-50"
                                                                disabled={venta.estado === 'pagada' || venta.estado === 'anulada'}
                                                            >
                                                                <CheckCircle2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                            No hay ventas registradas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex items-center justify-between px-6 py-5 border-t border-slate-200 bg-slate-50">
                        <p className="text-sm text-gray-600 font-medium">
                            Mostrando {sortedVentas.length === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, sortedVentas.length)} de {sortedVentas.length} registros
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === page ? "bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalReportesVentas
                isOpen={showReportesModal}
                onClose={() => setShowReportesModal(false)}
            />

            <VentaDetailModal
                ventaId={selectedVentaId}
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
            />
        </div>
    );
}
