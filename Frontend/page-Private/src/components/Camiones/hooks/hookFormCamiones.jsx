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

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        console.log(`Agregando a FormData: ${key} =`, value);
        formData.append(key, key === "img" ? value[0] : value);
      });

      console.log('=== ENVIANDO REQUEST ===');
      console.log('URL:', "http://localhost:4000/api/camiones");
      console.log('Método: POST');
      console.log('FormData entries:', Array.from(formData.entries()));

      const res = await fetch("http://localhost:4000/api/camiones", {
        method: "POST",
        body: formData,
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', res.status);
      console.log('Status Text:', res.statusText);
      console.log('Headers:', Object.fromEntries(res.headers.entries()));

      // Obtener el texto de la respuesta para debug
      const responseText = await res.text();
      console.log('Response Body (raw):', responseText);

      if (!res.ok) {
        console.log('=== ERROR EN RESPUESTA ===');
        // Intentar parsear la respuesta como JSON para obtener el mensaje de error
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
        // IMPORTANTE: Lanzar el error para que pueda ser capturado por el componente
        throw new Error(errorMessage);
      }

      console.log('=== ÉXITO ===');
      // Si llegamos aquí, todo salió bien
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
      
      // IMPORTANTE: Re-lanzar el error para que pueda ser capturado por el componente
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