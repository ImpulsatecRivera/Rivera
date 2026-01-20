import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Truck, FileText, Plus, Trash2, Save, AlertCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../Context/authContext';
import Swal from 'sweetalert2'; // ← IMPORTAR SWEETALERT2

const CreateMantenimientoPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [camiones, setCamiones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);

  const [formData, setFormData] = useState({
    fecha_mantenimiento: '',
    tipo_de_mantenimiento: '',
    descripcion: '',
    ciculatioCard: '',
    estado: 'pendiente',
    detalles: [
      { concepto: '', cantidad: 1, precioUnitario: 0, proveedor: '' }
    ]
  });

  const tipoMantenimientoOptions = [
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'correctivo', label: 'Correctivo' },
    { value: 'llantas', label: 'Llantas' },
    { value: 'rines', label: 'Rines' },
    { value: 'furgo', label: 'Furgón' },
    { value: 'madera_furgo', label: 'Madera de Furgón' },
    { value: 'torno', label: 'Torno' },
    { value: 'bomba', label: 'Bomba' },
    { value: 'reparacion_turbo', label: 'Reparación del Turbo' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    fetchCamiones();
    fetchProveedores();
  }, []);

  const fetchCamiones = async () => {
    try {
      const response = await api.get('/camiones');
      setCamiones(response.data.data || []);
    } catch (err) {
      console.error('❌ Error al cargar camiones:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar camiones',
        text: 'No se pudieron cargar los camiones. Por favor recarga la página.',
        confirmButtonColor: '#5F8EAD'
      });
    }
  };

  const fetchProveedores = async () => {
    setLoadingProveedores(true);
    try {
      console.log('🔄 Iniciando carga de proveedores...');
      
      const response = await api.get('/proveedores');
      
      console.log('📦 Respuesta completa:', response);
      console.log('📦 Response.data:', response.data);
      
      const proveedoresData = response.data.data || response.data.proveedores || response.data || [];
      
      console.log('✅ Proveedores extraídos:', proveedoresData);
      console.log('📊 Cantidad de proveedores:', proveedoresData.length);
      
      setProveedores(proveedoresData);
      
      if (proveedoresData.length === 0) {
        console.warn('⚠️ No se encontraron proveedores');
        Swal.fire({
          icon: 'info',
          title: 'Sin proveedores',
          text: 'No hay proveedores registrados en el sistema.',
          confirmButtonColor: '#5F8EAD'
        });
      }
    } catch (err) {
      console.error('❌ Error al cargar proveedores:', err);
      console.error('❌ Error completo:', err.response?.data || err.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar proveedores',
        text: 'No se pudieron cargar los proveedores. Puedes continuar sin asignar proveedores.',
        confirmButtonColor: '#5F8EAD'
      });
    } finally {
      setLoadingProveedores(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = field === 'cantidad' || field === 'precioUnitario'
      ? parseFloat(value) || 0
      : value;

    setFormData(prev => ({
      ...prev,
      detalles: newDetalles
    }));
  };

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, { concepto: '', cantidad: 1, precioUnitario: 0, proveedor: '' }]
    }));
  };

  const duplicarDetalle = (index) => {
    const detalleActual = formData.detalles[index];
    const nuevoDetalle = {
      concepto: '',
      cantidad: 1,
      precioUnitario: 0,
      proveedor: detalleActual.proveedor
    };
    
    const newDetalles = [...formData.detalles];
    newDetalles.splice(index + 1, 0, nuevoDetalle);
    
    setFormData(prev => ({
      ...prev,
      detalles: newDetalles
    }));

    // ✅ Toast pequeño de confirmación
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Detalle duplicado',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };

  const eliminarDetalle = async (index) => {
    if (formData.detalles.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: 'Debe haber al menos un detalle en el mantenimiento',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    // ✅ Confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Eliminar este detalle?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const newDetalles = formData.detalles.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        detalles: newDetalles
      }));
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Detalle eliminado',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    }
  };

  const calcularSubtotal = (cantidad, precioUnitario) => {
    return cantidad * precioUnitario;
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((sum, detalle) =>
      sum + calcularSubtotal(detalle.cantidad, detalle.precioUnitario), 0
    );
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad);
  };

  const handleSubmit = async () => {
    // ✅ Validaciones con SweetAlert
    if (!formData.fecha_mantenimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'La fecha es requerida',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }
    
    if (!formData.tipo_de_mantenimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El tipo de mantenimiento es requerido',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }
    
    if (!formData.ciculatioCard) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debe seleccionar un camión',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }
    
    if (!formData.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'La descripción es requerida',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    const detallesValidos = formData.detalles.every(d =>
      d.concepto.trim() && d.cantidad > 0 && d.precioUnitario > 0
    );

    if (!detallesValidos) {
      Swal.fire({
        icon: 'warning',
        title: 'Detalles incompletos',
        text: 'Todos los detalles deben tener concepto, cantidad y precio válidos',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }

    // ✅ Confirmación antes de guardar
    const confirmResult = await Swal.fire({
      title: '¿Crear mantenimiento?',
      html: `Se creará un nuevo mantenimiento con estado <strong>Pendiente</strong><br><br>Total: <strong>${formatearMoneda(calcularTotal())}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5F8EAD',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoading(true);

      // ✅ Mostrar loading
      Swal.fire({
        title: 'Creando mantenimiento...',
        html: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const fechaLocal = new Date(formData.fecha_mantenimiento + 'T12:00:00');

      // Filtrar proveedores vacíos, null, undefined
      const proveedoresUnicos = [...new Set(
        formData.detalles
          .map(d => d.proveedor)
          .filter(p => p && typeof p === 'string' && p.trim() !== '')
      )];

      const dataToSend = {
        fecha_mantenimiento: fechaLocal.toISOString(),
        mes: fechaLocal.getMonth() + 1,
        ano: fechaLocal.getFullYear(),
        tipo_de_mantenimiento: formData.tipo_de_mantenimiento,
        descripcion: formData.descripcion,
        ciculatioCard: formData.ciculatioCard,
        estado: 'pendiente',
        proveedores: proveedoresUnicos,
        detalles: formData.detalles.map(d => ({
          concepto: d.concepto.trim(),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subTotal: calcularSubtotal(d.cantidad, d.precioUnitario),
          proveedor: (d.proveedor && d.proveedor.trim() !== '') ? d.proveedor.trim() : null
        }))
      };

      console.log('🌐 API Base URL:', api.defaults.baseURL);
      console.log('📍 Endpoint completo:', `${api.defaults.baseURL}/mantenimientos`);
      console.log('📤 Payload:', JSON.stringify(dataToSend, null, 2));

      const response = await api.post('/mantenimientos', dataToSend);

      console.log('✅ Respuesta del servidor:', response.data);

      // ✅ Alert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        html: `✅ Mantenimiento creado exitosamente<br><br><small>Total: ${formatearMoneda(calcularTotal())}</small>`,
        confirmButtonColor: '#5D9646',
        timer: 3000,
        timerProgressBar: true
      });


      
const result = response.data;

      console.log('Mantenimiento creado:', result);


      navigate('/mantenimientos');

    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('❌ Response status:', err.response?.status);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Request config:', {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        method: err.config?.method
      });
      
      // ✅ Mensajes de error específicos con SweetAlert
      let errorMessage = 'Ocurrió un error al crear el mantenimiento';
      let errorDetails = '';
      
      if (err.response?.status === 404) {
        errorMessage = err.response.data?.message || 'Recurso no encontrado. Verifica que el servidor esté corriendo.';
        
        // Mostrar detalles de proveedores no encontrados si existen
        if (err.response.data?.detalles?.proveedoresNoEncontrados) {
          errorDetails = `<br><br><small><b>Proveedores no encontrados:</b><br>${err.response.data.detalles.proveedoresNoEncontrados.join('<br>')}</small>`;
        }
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Datos inválidos';
        
        // Mostrar errores de validación si existen
        if (err.response.data?.errors) {
          const errores = err.response.data.errors.map(e => `<li>${e.field}: ${e.message}</li>`).join('');
          errorDetails = `<br><br><ul style="text-align: left; padding-left: 20px;">${errores}</ul>`;
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'No se puede conectar al servidor';
        errorDetails = '<br><br><small>Verifica que el servidor esté corriendo en http://localhost:4000</small>';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al crear mantenimiento',
        html: errorMessage + errorDetails,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    // ✅ Verificar si hay datos ingresados
    const hayDatos = 
      formData.fecha_mantenimiento ||
      formData.tipo_de_mantenimiento ||
      formData.descripcion ||
      formData.ciculatioCard ||
      formData.detalles.some(d => d.concepto || d.cantidad > 1 || d.precioUnitario > 0);

    if (!hayDatos) {
      navigate('/mantenimientos');
      return;
    }

    // ✅ Confirmación antes de cancelar
    const result = await Swal.fire({
      title: '¿Cancelar creación?',
      text: "Los datos ingresados se perderán",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar editando'
    });

    if (result.isConfirmed) {
      navigate('/mantenimientos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancelar} // ✅ Cambiado para usar confirmación
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Mantenimientos
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Plus className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#34353A] mb-1">
                Nuevo Mantenimiento
              </h1>
              <p className="text-gray-600">
                Registra un nuevo mantenimiento para tu flota
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Estado: Pendiente
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Información Básica */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#34353A] mb-4 flex items-center gap-2">
              <Calendar className="text-[#5F8EAD]" size={22} />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Fecha de Mantenimiento *
                </label>
                <input
                  type="date"
                  name="fecha_mantenimiento"
                  value={formData.fecha_mantenimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Tipo de Mantenimiento *
                </label>
                <select
                  name="tipo_de_mantenimiento"
                  value={formData.tipo_de_mantenimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">Seleccionar tipo...</option>
                  {tipoMantenimientoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camión */}
              <div>
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Camión *
                </label>
                <select
                  name="ciculatioCard"
                  value={formData.ciculatioCard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                >
                  <option value="">Seleccionar camión...</option>
                  {camiones.map(camion => (
                    <option key={camion._id} value={camion._id}>
                      {camion.licensePlate} - {camion.brand} {camion.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#34353A] mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe los trabajos realizados..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Detalles/Conceptos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#34353A] flex items-center gap-2">
                <FileText className="text-[#5D9646]" size={22} />
                Detalles de Costos
              </h3>
              <button
                onClick={agregarDetalle}
                className="px-4 py-2 bg-[#5D9646] bg-opacity-20 text-[#5D9646] rounded-lg hover:bg-[#5D9646] hover:bg-opacity-30 transition-colors font-semibold text-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.detalles.map((detalle, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Concepto */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Concepto *
                      </label>
                      <input
                        type="text"
                        value={detalle.concepto}
                        onChange={(e) => handleDetalleChange(index, 'concepto', e.target.value)}
                        placeholder="Ej: Cambio de aceite"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Proveedor por detalle */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Proveedor
                      </label>
                      <select
                        value={detalle.proveedor}
                        onChange={(e) => handleDetalleChange(index, 'proveedor', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] text-sm"
                        disabled={loadingProveedores}
                      >
                        <option value="">Sin proveedor</option>
                        {proveedores.map(prov => (
                          <option key={prov._id} value={prov._id}>
                            {prov.companyName || prov.nombre || 'Sin nombre'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                        min="1"
                        step="1"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Precio Unit. *
                      </label>
                      <input
                        type="number"
                        value={detalle.precioUnitario}
                        onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD]"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Subtotal
                      </label>
                      <div className="px-3 py-2 bg-[#5D9646] bg-opacity-10 rounded-lg font-bold text-[#5D9646] text-sm">
                        {formatearMoneda(calcularSubtotal(detalle.cantidad, detalle.precioUnitario))}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="md:col-span-1 flex items-end gap-1">
                      <button
                        onClick={() => duplicarDetalle(index)}
                        title="Duplicar con mismo proveedor"
                        className="flex-1 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Copy size={18} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => eliminarDetalle(index)}
                        disabled={formData.detalles.length === 1}
                        title="Eliminar"
                        className="flex-1 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-[#34353A] to-[#5D9646] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold">Total del Mantenimiento</span>
              <span className="text-white text-4xl font-bold">
                {formatearMoneda(calcularTotal())}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelar} // ✅ Cambiado para usar confirmación
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Mantenimiento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMantenimientoPage;
