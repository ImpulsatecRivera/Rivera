import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config.jsx";

const API_URL = config.api.API_URL;

export const useTruckForm = (onSuccess) => {
  const [motoristasDisponibles, setMotoristasDisponibles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= MOTORISTAS ================= */
  useEffect(() => {
    const cargarMotoristas = async () => {
      try {
        console.log('🔍 Cargando motoristas desde:', `${API_URL}/motoristas`);
        
        const res = await axios.get(`${API_URL}/motoristas`, {
          withCredentials: true,
        });

        // Tu API devuelve array directo
        const motoristas = Array.isArray(res.data) ? res.data : [];
        console.log('👥 Total motoristas:', motoristas.length);

        // Filtrar activos (asumiendo que todos están activos si no hay campo state)
        const activos = motoristas.filter((m) => {
          const estado = (m.state || m.estado || m.status || "ACTIVO").toUpperCase();
          return ["ACTIVO", "DISPONIBLE", "AVAILABLE", "ACTIVE"].includes(estado);
        });

        console.log('✅ Motoristas activos:', activos.length);
        setMotoristasDisponibles(activos);
        
      } catch (error) {
        console.error("❌ Error cargando motoristas:", error);
        setMotoristasDisponibles([]);
      }
    };

    cargarMotoristas();
  }, []);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      console.log('📤 === INICIO SUBMIT ===');
      console.log('📤 Data recibida:', data);

      const formData = new FormData();

      // Campos obligatorios
      formData.append("licensePlate", data.licensePlate.toUpperCase());
      formData.append("state", (data.state || "DISPONIBLE").toUpperCase());
      formData.append("gasolineLevel", data.gasolineLevel || 4);

      // Campos opcionales
      if (data.name?.trim()) formData.append("name", data.name.trim());
      if (data.brand?.trim()) formData.append("brand", data.brand.trim());
      if (data.model?.trim()) formData.append("model", data.model.trim());
      if (data.age) formData.append("age", data.age);
      if (data.description?.trim()) formData.append("description", data.description.trim());
      if (data.ciculatioCard) formData.append("ciculatioCard", data.ciculatioCard);
      
      // Driver ID
      if (data.driverId && data.driverId.trim() !== '') {
        formData.append("driverId", data.driverId.trim());
        console.log('✅ Motorista asignado:', data.driverId);
      }
      
      if (data.salario) formData.append("salario", data.salario);

      // ✅ IMÁGENES - Manejo correcto
      console.log('🖼️ Procesando imágenes...');
      console.log('   data.img:', data.img);
      console.log('   Tipo data.img:', data.img?.constructor?.name);
      
      // Imagen principal
      if (data.img) {
        let imageFile = null;
        
        if (data.img instanceof FileList && data.img.length > 0) {
          imageFile = data.img[0];
          console.log('✅ Imagen principal (FileList):', imageFile.name);
        } else if (data.img instanceof File) {
          imageFile = data.img;
          console.log('✅ Imagen principal (File):', imageFile.name);
        } else if (Array.isArray(data.img) && data.img.length > 0) {
          imageFile = data.img[0];
          console.log('✅ Imagen principal (Array):', imageFile.name);
        }
        
        if (imageFile instanceof File) {
          formData.append("img", imageFile);
          console.log('✅ Imagen agregada al FormData');
        } else {
          console.warn('⚠️ No se pudo procesar la imagen principal');
        }
      } else {
        console.log('ℹ️ No hay imagen principal');
      }

      // Imagen de tarjeta de circulación
      if (data.circulationCardImage) {
        let cardImage = null;
        
        if (data.circulationCardImage instanceof FileList && data.circulationCardImage.length > 0) {
          cardImage = data.circulationCardImage[0];
          console.log('✅ Imagen tarjeta (FileList):', cardImage.name);
        } else if (data.circulationCardImage instanceof File) {
          cardImage = data.circulationCardImage;
          console.log('✅ Imagen tarjeta (File):', cardImage.name);
        } else if (Array.isArray(data.circulationCardImage) && data.circulationCardImage.length > 0) {
          cardImage = data.circulationCardImage[0];
          console.log('✅ Imagen tarjeta (Array):', cardImage.name);
        }
        
        if (cardImage instanceof File) {
          formData.append("circulationCardImage", cardImage);
          console.log('✅ Imagen tarjeta agregada al FormData');
        } else {
          console.warn('⚠️ No se pudo procesar la imagen de tarjeta');
        }
      } else {
        console.log('ℹ️ No hay imagen de tarjeta de circulación');
      }

      // Debug FormData
      console.log('📋 === CONTENIDO FORMDATA ===');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type
          });
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log('📡 Enviando a:', `${API_URL}/camiones`);
      
      const res = await axios.post(`${API_URL}/camiones`, formData, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
      });

      console.log('✅ Respuesta exitosa:', res.data);

      if (onSuccess) onSuccess(res.data);
      return res.data;
      
    } catch (error) {
      console.error('❌ Error en submit:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    onSubmit,
    motoristasDisponibles,
    isSubmitting,
  };
};