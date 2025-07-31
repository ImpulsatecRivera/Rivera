// src/hooks/useTruckForm.js
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

const API_URL_MOTORISTAS = "http://localhost:4000/api/motoristas";
const API_URL_PROVEEDORES = "http://localhost:4000/api/proveedores"; 

export const useTruckForm = (onSuccess) => {
  const [motoristasDisponibles, setMotoristasDisponibles] = useState([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const imagen = watch("img");

  // Cargar motoristas
  useEffect(() => {
    fetch(API_URL_MOTORISTAS)
      .then((res) => res.json())
      .then((data) => {
        console.log('Motoristas cargados:', data);
        setMotoristasDisponibles(data);
      })
      .catch((err) => console.error("Error al cargar motoristas:", err));
  }, []);

  // Cargar proveedores
  useEffect(() => {
    fetch(API_URL_PROVEEDORES)
      .then((res) => res.json())
      .then((data) => {
        console.log('Proveedores cargados:', data);
        setProveedoresDisponibles(data);
      })
      .catch((err) => console.error("Error al cargar proveedores:", err));
  }, []);

  useEffect(() => {
    if (imagen && imagen.length > 0) {
      const file = imagen[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [imagen]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('=== DATOS RECIBIDOS EN HOOK ===');
      console.log('Data completa:', data);
      console.log('================================');

      // ✅ VALIDACIÓN CRÍTICA: Verificar imagen
      if (!data.img || !data.img[0]) {
        throw new Error('Debe seleccionar una imagen para el camión');
      }

      const formData = new FormData();

      // ✅ AGREGAR IMAGEN CORRECTAMENTE (File, no FileList)
      const imageFile = data.img[0];
      console.log('Agregando imagen:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
      formData.append('img', imageFile);

      // ✅ AGREGAR OTROS CAMPOS (excluyendo img)
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'img') {
          console.log(`Agregando a FormData: ${key} =`, value);
          formData.append(key, value || '');
        }
      });

      console.log('=== ENVIANDO REQUEST ===');
      console.log('URL:', "http://localhost:4000/api/camiones");
      console.log('Método: POST');
      
      // Debug FormData
      console.log('=== CONTENIDO FORMDATA ===');
      for (let [key, value] of formData.entries()) {
        if (key === 'img') {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const res = await fetch("http://localhost:4000/api/camiones", {
        method: "POST",
        body: formData,
        // NO incluir Content-Type para FormData
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', res.status);
      console.log('Status Text:', res.statusText);

      if (!res.ok) {
        const responseText = await res.text();
        console.log('Response Body (raw):', responseText);
        console.log('=== ERROR EN RESPUESTA ===');
        
        let errorMessage = `Error ${res.status}: ${res.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          console.log('Error data parsed:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          console.log('No se pudo parsear como JSON, usando texto crudo');
          errorMessage = responseText || errorMessage;
        }
        
        console.log('Mensaje de error final:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('=== ÉXITO ===');
      const result = await res.json();
      console.log('Camión creado:', result);
      
      reset();
      setImagePreview(null);
      onSuccess?.();
      
    } catch (error) {
      console.error('=== ERROR CAPTURADO EN HOOK ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error completo:', error);
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    motoristasDisponibles,
    proveedoresDisponibles,
    imagePreview,
    isSubmitting,
    errors,
    setValue,
  };
};