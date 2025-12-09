import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  IconButton
} from "@mui/material";

import { Add, Delete } from "@mui/icons-material";

export default function EditMantenimiento({ id, onClose }) {
  const [loading, setLoading] = useState(true);
  const [manto, setManto] = useState({
    fecha_mantenimiento: "",
    tipo_de_mantenimiento: "",
    descripcion: "",
    detalles: []
  });

  // Obtener datos
  useEffect(() => {
    axios.get(`/api/mantenimientos/${id}`).then((res) => {
      setManto(res.data.data);
      setLoading(false);
    });
  }, [id]);

  // Agregar detalle
  const addDetalle = () => {
    setManto({
      ...manto,
      detalles: [...manto.detalles, { concepto: "", cantidad: 1, precioUnitario: 0 }]
    });
  };

  // Cambiar valor detalle
  const changeDetalle = (index, field, value) => {
    const nuevos = [...manto.detalles];
    nuevos[index][field] = value;
    setManto({ ...manto, detalles: nuevos });
  };

  // Eliminar detalle
  const removeDetalle = (index) => {
    const nuevos = manto.detalles.filter((_, i) => i !== index);
    setManto({ ...manto, detalles: nuevos });
  };

  // Guardar cambios
  const submitUpdate = async () => {
    try {
      await axios.put(`/api/mantenimientos/${id}`, manto);
      alert("Mantenimiento actualizado!");
      onClose && onClose();
    } catch {
      alert("Error al actualizar");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: "25px auto",
        padding: "30px",
        borderRadius: "20px",
        backdropFilter: "blur(12px)",
        boxShadow: "0px 0px 30px rgba(0,0,0,0.25)",
        background: "rgba(25,25,25,0.60)",
        color: "#fff"
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Editar Mantenimiento
      </Typography>

      <Divider sx={{ borderColor: "#777", mb: 3 }} />

      {/* Fecha */}
      <TextField
        fullWidth
        label="Fecha de Mantenimiento"
        type="date"
value={manto?.fecha_mantenimiento ? new Date(manto.fecha_mantenimiento).toISOString().substring(0,10) : ""}
        onChange={(e) => setManto({ ...manto, fecha_mantenimiento: e.target.value })}
        sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#ddd" } }}
        InputProps={{ style: { color: "#fff" } }}
      />

      {/* Tipo */}
      <TextField
        fullWidth
        label="Tipo de Mantenimiento"
value={manto?.tipo_de_mantenimiento || ""}
        onChange={(e) => setManto({ ...manto, tipo_de_mantenimiento: e.target.value })}
        sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#ddd" } }}
        InputProps={{ style: { color: "#fff" } }}
      />

      {/* Descripcion */}
      <TextField
        fullWidth
        label="Descripción"
        multiline
        rows={3}
value={manto?.descripcion || ""}
        onChange={(e) => setManto({ ...manto, descripcion: e.target.value })}
        sx={{ mb: 3 }}
        InputLabelProps={{ style: { color: "#ddd" } }}
        InputProps={{ style: { color: "#fff" } }}
      />

      <Divider sx={{ borderColor: "#777", mb: 2 }} />

      {/* DETALLES */}
      <Typography variant="h6" sx={{ mb: 2 }}>Detalles del mantenimiento</Typography>

      {(manto?.detalles ?? []).map((d, i) => (
  <Box
    key={i}
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 100px 140px 40px",
      gap: 2,
      mb: 2,
      alignItems: "center"
    }}
  >
    <TextField
      label="Concepto"
      value={d?.concepto || ""}
      onChange={(e) => changeDetalle(i, "concepto", e.target.value)}
      InputLabelProps={{ style: { color: "#ccc" } }}
      InputProps={{ style: { color: "#fff" } }}
    />
    <TextField
      label="Cantidad"
      type="number"
      value={d?.cantidad || 1}
      onChange={(e) => changeDetalle(i, "cantidad", e.target.value)}
      InputLabelProps={{ style: { color: "#ccc" } }}
      InputProps={{ style: { color: "#fff" } }}
    />
    <TextField
      label="Precio Unit."
      type="number"
      value={d?.precioUnitario || 0}
      onChange={(e) => changeDetalle(i, "precioUnitario", e.target.value)}
      InputLabelProps={{ style: { color: "#ccc" } }}
      InputProps={{ style: { color: "#fff" } }}
    />

    <IconButton color="error" onClick={() => removeDetalle(i)}>
      <Delete />
    </IconButton>
  </Box>
))}


      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={addDetalle}
        sx={{ mt: 1, mb: 3, borderColor: "#999", color: "#fff" }}
      >
        Agregar detalle
      </Button>

      <Divider sx={{ borderColor: "#777", mb: 3 }} />

      <Button
        fullWidth
        variant="contained"
        sx={{
          background: "linear-gradient(45deg, #0077ff, #009dff)",
          fontSize: "18px",
          padding: "10px",
          borderRadius: "12px"
        }}
        onClick={submitUpdate}
      >
        Guardar cambios
      </Button>
    </Box>
  );
}
