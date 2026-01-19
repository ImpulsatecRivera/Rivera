import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../Context/authContext";
import Swal from "sweetalert2";

const getNombreCliente = (cliente) => {
  if (!cliente) return 'Sin nombre';
  if (cliente.tipoCliente === 'corporativo') {
    return cliente.nombreComercial || cliente.nombreEmpresa || 'Cliente sin nombre';
  }
  return `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim() || 'Cliente sin nombre';
};

export default function AgregarVenta() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editingVentaId, setEditingVentaId] = useState(id || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [clientesData, setClientesData] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [formData, setFormData] = useState({
    cliente: "",
    tipoDocumento: "CONSUMIDOR_FINAL",
    numeroDocumento: "",
    fechaEmision: new Date().toISOString().split('T')[0],
    descripcion: "",
    monto: "",
    iva: "0",
    total: "",
    metodoPago: "efectivo",
    voucher: null,
    voucherNombre: ""
  });

  // Cargar clientes
  useEffect(() => {
    const cargarClientes = async () => {
      setLoadingClientes(true);
      try {
        const response = await api.get("/clientes");
        console.log("Respuesta bruta clientes:", response);

        let clientesArray = [];
        
        // Intentar extraer clientes de diferentes rutas
        if (response.data?.data?.clientes && Array.isArray(response.data.data.clientes)) {
          clientesArray = response.data.data.clientes;
          console.log("✅ Data extraída de data.data.clientes");
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          clientesArray = response.data.data;
          console.log("✅ Data extraída de data.data");
        } else if (Array.isArray(response.data?.clientes)) {
          clientesArray = response.data.clientes;
          console.log("✅ Data extraída de data.clientes");
        } else if (Array.isArray(response.data)) {
          clientesArray = response.data;
          console.log("✅ Data es directamente un array");
        }

        console.log("Clientes finales:", clientesArray);
        console.log("Cantidad de clientes:", clientesArray.length);

        if (Array.isArray(clientesArray)) {
          setClientesData(clientesArray);
        } else {
          console.error("❌ clientesArray no es un array");
          setClientesData([]);
        }
      } catch (error) {
        console.error("Error cargando clientes:", error);
        setError("Error al cargar clientes");
      } finally {
        setLoadingClientes(false);
      }
    };

    cargarClientes();
  }, []);

  // Cargar datos de la venta si estamos editando
  useEffect(() => {
    if (!editingVentaId) return;

    const cargarVenta = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/ventas/${editingVentaId}`);
        const venta = response.data?.venta || response.data;

        console.log("📥 Venta a editar cargada:", venta);

        // Convertir fecha a formato YYYY-MM-DD para el input type="date"
        const fechaEmision = venta.fechaEmision 
          ? new Date(venta.fechaEmision).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        setFormData({
          cliente: venta.clienteId?._id || venta.clienteId || "",
          tipoDocumento: venta.tipoDocumento || "CONSUMIDOR_FINAL",
          numeroDocumento: venta.numeroDocumento || "",
          fechaEmision: fechaEmision,
          descripcion: venta.descripcion || "",
          monto: venta.monto?.toString() || "",
          iva: venta.iva?.toString() || "0",
          total: venta.total?.toString() || "",
          metodoPago: venta.metodoPago || "efectivo",
          voucher: null, // No cargamos el archivo existente
          voucherNombre: venta.voucher ? "Comprobante ya subido" : ""
        });
      } catch (error) {
        console.error("Error cargando venta:", error);
        setError("Error al cargar la venta");
      } finally {
        setLoading(false);
      }
    };

    cargarVenta();
  }, [editingVentaId]);
  useEffect(() => {
    const monto = parseFloat(formData.monto) || 0;
    const ivaCalculado = monto * 0.13; // 13% de IVA
    const total = monto + ivaCalculado;
    
    setFormData(prev => ({ 
      ...prev, 
      iva: ivaCalculado.toFixed(2),
      total: total.toFixed(2)
    }));
  }, [formData.monto]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        voucher: file,
        voucherNombre: file.name
      }));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.cliente) {
      Swal.fire("Error", "Selecciona un cliente", "error");
      return;
    }

    if (!formData.tipoDocumento) {
      Swal.fire("Error", "Selecciona un tipo de documento", "error");
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      Swal.fire("Error", "El monto debe ser mayor a 0", "error");
      return;
    }

    setLoading(true);

    try {
      // Crear nueva venta o actualizar existente
      // Convertir la fecha a fecha/hora en zona horaria de El Salvador
      const fechaPartes = formData.fechaEmision.split('-'); // YYYY-MM-DD
      const fechaConHora = new Date(
        parseInt(fechaPartes[0]),
        parseInt(fechaPartes[1]) - 1,
        parseInt(fechaPartes[2]),
        12, 0, 0, 0
      );

      const newVentaData = {
        clienteId: formData.cliente,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaEmision: fechaConHora.toISOString(),
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        iva: parseFloat(formData.iva),
        total: parseFloat(formData.total),
        metodoPago: formData.metodoPago || "efectivo",
        estado: editingVentaId ? undefined : "pendiente" // No cambiar estado si estamos editando
      };

      // Si estamos editando, remover undefined
      if (editingVentaId) {
        delete newVentaData.estado;
      }

      console.log("📤 Enviando datos de venta:", newVentaData);

      let response;
      let ventaId;

      if (editingVentaId) {
        // Actualizar venta existente
        response = await api.put(`/ventas/${editingVentaId}`, newVentaData);
        ventaId = editingVentaId;
        console.log("📝 Venta actualizada");
      } else {
        // Crear nueva venta
        response = await api.post("/ventas", newVentaData);
        
        console.log("📥 Respuesta del servidor:", response.data);

        ventaId = response.data?.venta?._id || response.data?._id || response.data?.data?._id;

        if (!ventaId) {
          console.error("❌ No se pudo obtener ID de venta. Respuesta completa:", response.data);
          throw new Error("No se obtuvo ID de la venta creada");
        }

        console.log("✅ Venta creada con ID:", ventaId);
      }

      // Si hay voucher, subir archivo
      if (formData.voucher) {
        const formDataFile = new FormData();
        formDataFile.append("comprobante", formData.voucher);

        await api.patch(`/ventas/${ventaId}/comprobante`, formDataFile, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      Swal.fire({
        title: "¡Éxito!",
        text: "Venta registrada correctamente",
        icon: "success",
        confirmButtonColor: "#5D9646"
      }).then(() => {
        navigate("/ventas");
      });
    } catch (error) {
      console.error("Error al guardar venta:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al registrar la venta",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Modificar la función de eliminar venta para marcar como anulada
  const eliminarVenta = async () => {
    try {
      if (!editingVentaId) return;

      await api.patch(`/ventas/${editingVentaId}/estado`, { estado: "anulada" });

      Swal.fire({
        title: "Venta anulada",
        text: "La venta se marcó como anulada.",
        icon: "success",
        confirmButtonColor: "#5D9646"
      }).then(() => {
        navigate("/ventas");
      });
    } catch (error) {
      console.error("Error al anular venta:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo anular la venta",
        "error"
      );
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <button
        onClick={() => navigate("/ventas")}
        className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Volver a Ventas
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#34353A] mb-2">Agregar Nueva Venta</h1>
          <p className="text-slate-600 mb-8">Completa los detalles de la venta</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-6">
            {/* Cliente */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Cliente *
                </label>
                <select
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  disabled={loadingClientes}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all disabled:bg-slate-100"
                >
                  <option value="">Selecciona un cliente</option>
                  {Array.isArray(clientesData) && clientesData.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>
                      {getNombreCliente(cliente)}
                    </option>
                  ))}
                </select>
                {loadingClientes && <p className="text-sm text-slate-500 mt-2">Cargando clientes...</p>}
              </div>
            </div>

            {/* Tipo de Documento y Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Tipo de Documento *
                </label>
                <select
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                >
                  <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                  <option value="CCF">CCF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                  placeholder="Ej: 001-000-000000001"
                />
              </div>
            </div>

            {/* Fecha de Emisión */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  name="fechaEmision"
                  value={formData.fechaEmision}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Método de Pago *
                </label>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="credito">Crédito</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe la venta (productos, servicios, etc.)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                  rows="3"
                />
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Monto (sin IVA) *
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5F8EAD] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  IVA (13%) - Automático
                </label>
                <input
                  type="text"
                  value={formData.iva || '0.00'}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-[#34353A] font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Total
                </label>
                <input
                  type="text"
                  value={formData.total || '0.00'}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-[#34353A] font-semibold"
                />
              </div>
            </div>

            {/* Voucher/Comprobante */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Voucher/Comprobante
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full"
                  />
                  {formData.voucherNombre && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Archivo seleccionado: {formData.voucherNombre}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/ventas")}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#5D9646] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Venta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
