import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl
} from "@mui/material";
import { Add, Delete, ArrowBack } from "@mui/icons-material";
import { api } from '../../Context/authContext';
import Swal from 'sweetalert2'; // ← IMPORTAR SWEETALERT2

export default function EditMantenimiento({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [manto, setManto] = useState({
    fecha_mantenimiento: "",
    tipo_de_mantenimiento: "",
    descripcion: "",
    estado: "pendiente",
    detalles: []
  });

  const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente', color: '#eab308' },
    { value: 'en_proceso', label: 'En Proceso', color: '#5F8EAD' },
    { value: 'completado', label: 'Completado', color: '#5D9646' },
    { value: 'cancelado', label: 'Cancelado', color: '#ef4444' }
  ];

  useEffect(() => {
    cargarProveedores();
    cargarMantenimiento();
  }, [id]);

  const cargarProveedores = async () => {
    try {
      const { data } = await api.get('/proveedores');
      const proveedoresData = data.data || data || [];
      console.log('✅ Proveedores cargados:', proveedoresData);
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('❌ Error al cargar proveedores:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar proveedores',
        text: 'No se pudieron cargar los proveedores. Por favor recarga la página.',
        confirmButtonColor: '#5F8EAD'
      });
    }
  };

  const cargarMantenimiento = async () => {
    try {
      const { data } = await api.get(`/mantenimientos/${id}`);
      const mantenimiento = data.data || data;

      console.log('📦 Mantenimiento cargado:', mantenimiento);

      setManto({
        fecha_mantenimiento: mantenimiento.fecha_mantenimiento || "",
        tipo_de_mantenimiento: mantenimiento.tipo_de_mantenimiento || mantenimiento.tipoMantenimiento || "",
        descripcion: mantenimiento.descripcion || "",
        estado: mantenimiento.estado || "pendiente",
        detalles: Array.isArray(mantenimiento.detalles) 
          ? mantenimiento.detalles.map(d => ({
              concepto: d.concepto || "",
              cantidad: d.cantidad || 1,
              precioUnitario: d.precioUnitario || 0,
              proveedor: d.proveedor?._id || d.proveedor || ""
            }))
          : []
      });
    } catch (error) {
      console.error('❌ Error al cargar mantenimiento:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        html: `No se pudieron cargar los datos del mantenimiento.<br><small>${error.response?.data?.message || error.message}</small>`,
        confirmButtonColor: '#ef4444'
      }).then(() => {
        navigate('/mantenimientos');
      });
    } finally {
      setLoading(false);
    }
  };

  const addDetalle = () => {
    const detallesActuales = manto?.detalles || [];
    setManto({
      ...manto,
      detalles: [...detallesActuales, { concepto: "", cantidad: 1, precioUnitario: 0, proveedor: "" }]
    });
  };

  const changeDetalle = (index, field, value) => {
    if (!manto?.detalles) return;
    const nuevos = [...manto.detalles];
    nuevos[index][field] = value;
    setManto({ ...manto, detalles: nuevos });
  };

  const removeDetalle = async (index) => {
    if (!manto?.detalles) return;
    
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
      const nuevos = manto.detalles.filter((_, i) => i !== index);
      setManto({ ...manto, detalles: nuevos });
      
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El detalle ha sido eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const calcularTotal = () => {
    if (!manto?.detalles || !Array.isArray(manto.detalles)) return 0;
    return manto.detalles.reduce((acc, d) => {
      return acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0);
    }, 0);
  };

  const submitUpdate = async () => {
    try {
      // ✅ Validaciones con SweetAlert
      if (!manto.fecha_mantenimiento) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'La fecha es requerida',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }
      
      if (!manto.tipo_de_mantenimiento) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'El tipo de mantenimiento es requerido',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }
      
      if (!manto.descripcion.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'La descripción es requerida',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      if (!manto.detalles || manto.detalles.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin detalles',
          text: 'Debe agregar al menos un detalle al mantenimiento',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      // Validar que todos los detalles estén completos
      const detallesIncompletos = manto.detalles.some(d => 
        !d.concepto.trim() || d.cantidad <= 0 || d.precioUnitario <= 0
      );

      if (detallesIncompletos) {
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
        title: '¿Guardar cambios?',
        text: manto.estado === 'completado' 
          ? "El mantenimiento se marcará como completado y el camión estará disponible" 
          : "Se actualizará la información del mantenimiento",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#5F8EAD',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmResult.isConfirmed) return;

      // Mostrar loading
      Swal.fire({
        title: 'Guardando cambios...',
        html: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const detallesConSubtotal = (manto?.detalles || []).map(detalle => ({
        concepto: detalle.concepto.trim(),
        cantidad: Number(detalle.cantidad) || 1,
        precioUnitario: Number(detalle.precioUnitario) || 0,
        subTotal: (Number(detalle.cantidad) || 1) * (Number(detalle.precioUnitario) || 0),
        proveedor: (detalle.proveedor && detalle.proveedor.trim() !== '') ? detalle.proveedor.trim() : null
      }));

      // ✅ Extraer proveedores únicos de los detalles
      const proveedoresUnicos = [...new Set(
        detallesConSubtotal
          .map(d => d.proveedor)
          .filter(p => p !== null && p !== '')
      )];

      const payload = {
        fecha_mantenimiento: manto.fecha_mantenimiento,
        tipo_de_mantenimiento: manto.tipo_de_mantenimiento,
        descripcion: manto.descripcion,
        estado: manto.estado,
        proveedores: proveedoresUnicos,
        detalles: detallesConSubtotal
      };

      console.log('📤 Payload enviado:', payload);

      const { data } = await api.put(`/mantenimientos/${id}`, payload);
      
      if (data.success) {
        // ✅ Alert de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          html: manto.estado === 'completado' 
            ? '✅ Mantenimiento actualizado exitosamente<br>🚛 El camión ha sido actualizado a estado DISPONIBLE' 
            : '✅ Mantenimiento actualizado exitosamente',
          confirmButtonColor: '#5D9646',
          timer: 3000,
          timerProgressBar: true
        });
        
        navigate('/mantenimientos');
      } else {
        throw new Error(data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      console.error('❌ Response:', error.response?.data);
      
      let errorMessage = 'Ocurrió un error al actualizar el mantenimiento';
      let errorDetails = '';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Mostrar detalles de proveedores no encontrados si existen
        if (error.response.data?.detalles?.proveedoresNoEncontrados) {
          errorDetails = `<br><br><small><b>Proveedores no encontrados:</b><br>${error.response.data.detalles.proveedoresNoEncontrados.join('<br>')}</small>`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        html: errorMessage + errorDetails,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleCancelar = async () => {
    // ✅ Confirmación antes de cancelar
    const result = await Swal.fire({
      title: '¿Cancelar edición?',
      text: "Los cambios no guardados se perderán",
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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Typography sx={{ color: '#5F8EAD', fontSize: '16px', mb: 2, fontWeight: 600 }}>
          Cargando mantenimiento...
        </Typography>
        <Typography sx={{ color: '#999', fontSize: '14px' }}>ID: {id}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleCancelar} // ✅ Cambiado para usar confirmación
            sx={{ 
              color: '#5F8EAD',
              '&:hover': { backgroundColor: '#5F8EAD', backgroundOpacity: 0.1 }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography sx={{ 
            fontSize: '24px',
            fontWeight: 600,
            color: '#34353A',
            letterSpacing: '-0.5px'
          }}>
            Editar Mantenimiento
          </Typography>
        </Box>
      </Box>

      {/* Formulario Principal */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: '12px',
        border: '2px solid #5F8EAD',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Fecha */}
          <Box>
            <Typography sx={{ 
              fontSize: '14px',
              fontWeight: 500,
              color: '#34353A',
              mb: 1
            }}>
              Fecha de Mantenimiento
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={manto?.fecha_mantenimiento ? new Date(manto.fecha_mantenimiento).toISOString().substring(0,10) : ""}
              onChange={(e) => setManto({ ...manto, fecha_mantenimiento: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#5F8EAD' },
                  '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                }
              }}
            />
          </Box>

          {/* Tipo */}
          <Box>
            <Typography sx={{ 
              fontSize: '14px',
              fontWeight: 500,
              color: '#34353A',
              mb: 1
            }}>
              Tipo de Mantenimiento
            </Typography>
            <TextField
              fullWidth
              placeholder="Ej: Correctivo, Preventivo, Rines"
              value={manto?.tipo_de_mantenimiento || ""}
              onChange={(e) => setManto({ ...manto, tipo_de_mantenimiento: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#5F8EAD' },
                  '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                }
              }}
            />
          </Box>

          {/* ESTADO DEL MANTENIMIENTO */}
          <Box>
            <Typography sx={{ 
              fontSize: '14px',
              fontWeight: 500,
              color: '#34353A',
              mb: 1
            }}>
              🚦 Estado del Mantenimiento
            </Typography>
            <FormControl fullWidth>
              <Select
                value={manto?.estado || "pendiente"}
                onChange={(e) => setManto({ ...manto, estado: e.target.value })}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#5F8EAD' },
                  '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                }}
              >
                {estadosDisponibles.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: estado.color
                        }}
                      />
                      <Typography sx={{ fontSize: '14px' }}>{estado.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {manto?.estado === 'completado' && (
              <Typography sx={{ 
                fontSize: '12px', 
                color: '#5D9646', 
                mt: 1,
                fontWeight: 500 
              }}>
                ✓ Al guardar, el camión se actualizará automáticamente a DISPONIBLE
              </Typography>
            )}
          </Box>

          {/* Descripción */}
          <Box>
            <Typography sx={{ 
              fontSize: '14px',
              fontWeight: 500,
              color: '#34353A',
              mb: 1
            }}>
              Descripción
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe los detalles del mantenimiento..."
              value={manto?.descripcion || ""}
              onChange={(e) => setManto({ ...manto, descripcion: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#5F8EAD' },
                  '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Sección de Detalles */}
      <Paper sx={{ 
        p: 3,
        borderRadius: '12px',
        border: '2px solid #5D9646',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ 
            fontSize: '18px',
            fontWeight: 600,
            color: '#34353A'
          }}>
            Detalles del mantenimiento
          </Typography>
          <Button
            startIcon={<Add />}
            onClick={addDetalle}
            sx={{
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: '#5D9646',
              borderColor: '#5D9646',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#5D9646',
                backgroundOpacity: 0.1,
                borderColor: '#5D9646'
              }
            }}
            variant="outlined"
          >
            Agregar detalle
          </Button>
        </Box>

        {/* Lista de Detalles */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(manto?.detalles ?? []).map((d, i) => (
            <Box
              key={i}
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 100px 120px 40px',
                gap: 2,
                alignItems: 'start',
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            >
              <TextField
                placeholder="Concepto"
                value={d?.concepto || ""}
                onChange={(e) => changeDetalle(i, "concepto", e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#5F8EAD' },
                    '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                  }
                }}
              />
              
              {/* Select de proveedor */}
              <FormControl fullWidth>
                <Select
                  value={d?.proveedor || ""}
                  onChange={(e) => changeDetalle(i, "proveedor", e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#5F8EAD' },
                    '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                  }}
                >
                  <MenuItem value="">
                    <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>Sin proveedor</Typography>
                  </MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov._id} value={prov._id}>
                      <Typography sx={{ fontSize: '13px' }}>
                        {prov.companyName || prov.nombre || 'Sin nombre'}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                placeholder="Cant."
                type="number"
                value={d?.cantidad || 1}
                onChange={(e) => changeDetalle(i, "cantidad", e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#5F8EAD' },
                    '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                  }
                }}
              />
              <TextField
                placeholder="Precio"
                type="number"
                value={d?.precioUnitario || 0}
                onChange={(e) => changeDetalle(i, "precioUnitario", e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#5F8EAD' },
                    '&.Mui-focused fieldset': { borderColor: '#5F8EAD', borderWidth: '2px' }
                  }
                }}
              />
              <IconButton 
                onClick={() => removeDetalle(i)}
                sx={{ 
                  color: '#ef4444',
                  '&:hover': { backgroundColor: '#fee2e2' }
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Total */}
        {manto?.detalles && manto.detalles.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mt: 3,
            pt: 3,
            borderTop: '2px solid #5D9646'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                Total:
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#5D9646' }}>
                ${calcularTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Botones de Acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          onClick={handleCancelar} // ✅ Cambiado para usar confirmación
          sx={{
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 500,
            py: 1.5,
            borderRadius: '8px',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            '&:hover': {
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db'
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={submitUpdate}
          sx={{
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            py: 1.5,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #34353A 0%, #5F8EAD 100%)',
            boxShadow: 'none',
            '&:hover': {
              opacity: 0.9,
              boxShadow: '0 4px 6px -1px rgba(52, 53, 58, 0.3)'
            }
          }}
        >
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
}