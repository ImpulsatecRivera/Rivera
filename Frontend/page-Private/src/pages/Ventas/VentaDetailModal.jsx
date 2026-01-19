import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  User,
  DollarSign,
  Loader2,
  FileText,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { config } from "../../config";
import { api } from "../../Context/authContext";

const VentaDetailModal = ({ ventaId, isOpen, onClose }) => {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && ventaId) {
      fetchVentaById(ventaId);
    }
  }, [isOpen, ventaId]);

  const fetchVentaById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${config.api.API_URL}/ventas/${id}`);
      const ventaData = response.data?.venta || response.data;
      
      setVenta(ventaData);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Error al cargar la venta"
      );
    } finally {
      setLoading(false);
    }
  };

  const getNombreCliente = (cliente) => {
    if (!cliente) return 'Sin nombre';
    if (cliente.tipoCliente === 'corporativo') {
      return cliente.nombreComercial || cliente.nombreEmpresa || 'Cliente sin nombre';
    }
    return `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim() || 'Cliente sin nombre';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatearMoneda = (n) =>
    new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(n || 0);

  const getEstadoIcon = (estado) => {
    if (estado === 'pagada') return <CheckCircle className="text-emerald-600" size={24} />;
    if (estado === 'anulada') return <XCircle className="text-red-600" size={24} />;
    return <Clock className="text-amber-600" size={24} />;
  };

  const getEstadoColor = (estado) => {
    if (estado === 'pagada') return 'border-emerald-500 bg-emerald-50';
    if (estado === 'anulada') return 'border-red-500 bg-red-50';
    return 'border-amber-500 bg-amber-50';
  };

  const getEstadoTexto = (estado) => {
    if (estado === 'pagada') return 'Pagada';
    if (estado === 'anulada') return 'Anulada';
    return 'Pendiente';
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5F8EAD] px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Receipt className="text-white" size={20} />
              <h2 className="text-xl font-bold text-white">
                Detalle de Venta
              </h2>
            </div>

            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <X className="text-white" size={22} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#5F8EAD]" size={40} />
              </div>
            )}

            {error && (
              <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {venta && (
              <>
                {/* FECHA & CLIENTE */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#5F8EAD] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="text-[#5F8EAD]" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Fecha de Emisión</span>
                    </div>
                    <p className="font-bold text-[#34353A] text-sm">
                      {formatearFecha(venta.fechaEmision)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-[#5D9646] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="text-[#5D9646]" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Cliente</span>
                    </div>
                    <p className="font-bold text-[#34353A] text-sm">
                      {getNombreCliente(venta.clienteId)}
                    </p>
                  </div>
                </div>

                {/* TIPO DE DOCUMENTO & NÚMERO */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="text-slate-600" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Tipo de Documento</span>
                    </div>
                    <p className="font-bold text-[#34353A] text-sm">
                      {venta.tipoDocumento === 'CCF' ? 'Comprobante de Crédito Fiscal' : 'Consumidor Final'}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="text-slate-600" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Número de Documento</span>
                    </div>
                    <p className="font-bold text-[#34353A] text-sm">
                      {venta.numeroDocumento}
                    </p>
                  </div>
                </div>

                {/* MÉTODO DE PAGO */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#5F8EAD] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="text-[#5F8EAD]" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Método de Pago</span>
                    </div>
                    <p className="font-bold text-[#34353A] text-sm capitalize">
                      {venta.metodoPago ? venta.metodoPago.charAt(0).toUpperCase() + venta.metodoPago.slice(1) : 'No especificado'}
                    </p>
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                {venta.descripcion && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="text-slate-600" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Descripción</span>
                    </div>
                    <p className="text-[#34353A] text-sm">
                      {venta.descripcion}
                    </p>
                  </div>
                )}

                {/* MONTOS */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="text-slate-600" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">Subtotal</span>
                    </div>
                    <p className="text-lg font-bold text-[#34353A]">
                      {formatearMoneda(venta.monto)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="text-blue-600" size={16} />
                      <span className="text-xs text-gray-600 font-semibold">IVA (13%)</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatearMoneda(venta.iva)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#5F8EAD] to-[#34353A] rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="text-white" size={16} />
                      <span className="text-xs text-white font-semibold">Total</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {formatearMoneda(venta.total)}
                    </p>
                  </div>
                </div>

                {/* ESTADO */}
                <div className={`rounded-xl p-4 border shadow-sm ${getEstadoColor(venta.estado)}`}>
                  <div className="flex items-center justify-center gap-2">
                    {getEstadoIcon(venta.estado)}
                    <span className="text-lg font-bold text-[#34353A]">
                      Estado: {getEstadoTexto(venta.estado)}
                    </span>
                  </div>
                </div>

                {/* COMPROBANTE */}
                {venta.voucher && (
                  <div className="bg-white rounded-xl p-3 border border-[#5D9646] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="text-[#5D9646]" size={16} />
                        <span className="text-xs text-gray-600 font-semibold">Comprobante</span>
                      </div>
                      <button
                        onClick={() => window.open(venta.voucher, '_blank')}
                        className="flex items-center gap-2 bg-[#5D9646] text-white px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-all"
                      >
                        <Eye size={16} />
                        Ver Comprobante
                      </button>
                    </div>
                  </div>
                )}

                {/* FECHAS DE CREACIÓN Y ACTUALIZACIÓN */}
                <div className="grid md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">Creada:</span> {formatearFecha(venta.createdAt)}
                  </div>
                  {venta.updatedAt && (
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Última actualización:</span> {formatearFecha(venta.updatedAt)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-slate-50 px-6 py-3 flex justify-end border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white text-sm rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VentaDetailModal;
