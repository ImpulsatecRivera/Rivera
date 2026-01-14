import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { config } from '../../config';
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { Add, Delete, ArrowBack } from "@mui/icons-material";

export default function EditMantenimiento({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [manto, setManto] = useState({
    fecha_mantenimiento: "",
    tipo_de_mantenimiento: "",
    descripcion: "",
    estado: "pendiente",
    detalles: []
  });

  // Opciones de estado con colores corporativos
  const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente', color: '#eab308' },
    { value: 'en_proceso', label: 'En Proceso', color: '#5F8EAD' },
    { value: 'completado', label: 'Completado', color: '#5D9646' },
    { value: 'cancelado', label: 'Cancelado', color: '#ef4444' }
  ];

  // Obtener datos
  useEffect(() => {
    const url = `${config.api.API_URL}/mantenimientos/${id}`;
    console.log('🔍 Intentando cargar desde URL:', url);
    
    fetch(url, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        const data = result.data || result;
        
        if (!data || typeof data !== 'object') {
          alert('No se pudieron cargar los datos del mantenimiento');
          setLoading(false);
          return;
        }

        console.log('✅ Datos cargados:', data);
        
        setManto({
          fecha_mantenimiento: data.fecha_mantenimiento || "",
          tipo_de_mantenimiento: data.tipo_de_mantenimiento || data.tipoMantenimiento || "",
          descripcion: data.descripcion || "",
          estado: data.estado || "pendiente",
          detalles: Array.isArray(data.detalles) ? data.detalles : []
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error al cargar mantenimiento:', error);
        alert(`Error al cargar los datos del mantenimiento.\n${error.message}`);
        setLoading(false);
      });
  }, [id]);

  // Agregar detalle
  const addDetalle = () => {
    const detallesActuales = manto?.detalles || [];
    setManto({
      ...manto,
      detalles: [...detallesActuales, { concepto: "", cantidad: 1, precioUnitario: 0 }]
    });
  };

  // Cambiar valor detalle
  const changeDetalle = (index, field, value) => {
    if (!manto?.detalles) return;
    const nuevos = [...manto.detalles];
    nuevos[index][field] = value;
    setManto({ ...manto, detalles: nuevos });
  };

  // Eliminar detalle
  const removeDetalle = (index) => {
    if (!manto?.detalles) return;
    const nuevos = manto.detalles.filter((_, i) => i !== index);
    setManto({ ...manto, detalles: nuevos });
  };

  // Calcular costo total
  const calcularTotal = () => {
    if (!manto?.detalles || !Array.isArray(manto.detalles)) return 0;
    return manto.detalles.reduce((acc, d) => {
      return acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0);
    }, 0);
  };

  // Guardar cambios
  const submitUpdate = async () => {
    try {
      const detallesConSubtotal = (manto?.detalles || []).map(detalle => ({
        concepto: detalle.concepto,
        cantidad: Number(detalle.cantidad) || 1,
        precioUnitario: Number(detalle.precioUnitario) || 0,
        subTotal: (Number(detalle.cantidad) || 1) * (Number(detalle.precioUnitario) || 0)
      }));

      const payload = {
        fecha_mantenimiento: manto.fecha_mantenimiento,
        tipo_de_mantenimiento: manto.tipo_de_mantenimiento,
        descripcion: manto.descripcion,
        estado: manto.estado,
        detalles: detallesConSubtotal
      };

      console.log('📤 Enviando payload:', payload);

      const response = await fetch(`${config.api.API_URL}/mantenimientos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert("✅ Mantenimiento actualizado exitosamente!");
        
        if (manto.estado === 'completado') {
          alert("🚛 El camión ha sido actualizado a estado DISPONIBLE");
        }
        
        navigate('/mantenimientos');
      } else {
        throw new Error(result.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`❌ Error: ${error.message || 'Error al actualizar el mantenimiento'}`);
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
        <Typography sx={{ color: '#5F8EAD', fontSize: '16px', mb: 2, fontWeight: 600 }}>Cargando mantenimiento...</Typography>
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
            onClick={() => navigate('/mantenimientos')} 
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
                gridTemplateColumns: '2fr 100px 120px 40px',
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
          onClick={() => navigate('/mantenimientos')}
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