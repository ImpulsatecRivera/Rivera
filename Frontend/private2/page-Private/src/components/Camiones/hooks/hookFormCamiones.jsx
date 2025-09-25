// src/hooks/useTruckForm.js
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

const API_URL_MOTORISTAS = "https://riveraproject-production-933e.up.railway.app/api/motoristas";
const API_URL_PROVEEDORES = "https://riveraproject-production-933e.up.railway.app/api/proveedores"; 

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
      console.log('Claves disponibles:', Object.keys(data));
      
      // Debug específico para campos críticos
      console.log('=== CAMPOS CRÍTICOS ===');
      console.log('nivelGasolina:', data.nivelGasolina, 'tipo:', typeof data.nivelGasolina);
      console.log('gasolineLevel:', data.gasolineLevel, 'tipo:', typeof data.gasolineLevel);
      console.log('name:', data.name, 'tipo:', typeof data.name);
      console.log('marca:', data.marca, 'tipo:', typeof data.marca);
      console.log('brand:', data.brand, 'tipo:', typeof data.brand);
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

      // ✅ MAPEAR CAMPOS CORRECTAMENTE SEGÚN TU API
      const fieldMapping = {
        // Mapeo de nombres de formulario a nombres de API
        name: 'name',
        nombre: 'name',
        marca: 'brand',
        brand: 'brand',
        modelo: 'model',
        model: 'model',
        año: 'age',
        age: 'age',
        year: 'age',
        placa: 'licensePlate',
        licensePlate: 'licensePlate',
        tarjetaCirculacion: 'ciculatioCard',
        circulationCard: 'ciculatioCard',
        ciculatioCard: 'ciculatioCard',
        descripcion: 'description',
        description: 'description',
        // MÚLTIPLES VARIACIONES PARA NIVEL DE GASOLINA
        nivelGasolina: 'gasolineLevel',
        gasolineLevel: 'gasolineLevel',
        gasoline: 'gasolineLevel',
        gas: 'gasolineLevel',
        fuel: 'gasolineLevel',
        estado: 'state',
        state: 'state',
        proveedor: 'supplierId',
        supplierId: 'supplierId',
        supplier: 'supplierId',
        motorista: 'driverId',
        driverId: 'driverId',
        driver: 'driverId'
      };

      // ✅ AGREGAR CAMPOS MAPEADOS (excluyendo img)
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'img') {
          // Usar el mapeo si existe, sino usar el key original
          const apiFieldName = fieldMapping[key] || key;
          
          // Validaciones específicas
          if (apiFieldName === 'gasolineLevel') {
            console.log('=== DEBUG NIVEL DE GASOLINA ===');
            console.log('Valor original:', value);
            console.log('Tipo original:', typeof value);
            console.log('Es string vacío?', value === '');
            console.log('Es undefined?', value === undefined);
            console.log('Es null?', value === null);
            
            // Manejar casos especiales
            let gasLevel;
            if (value === '' || value === undefined || value === null || value === 'undefined') {
              gasLevel = 0; // Valor por defecto
              console.log('Usando valor por defecto: 0');
            } else {
              gasLevel = parseFloat(value);
              console.log('Valor parseado:', gasLevel);
              
              if (isNaN(gasLevel)) {
                gasLevel = 0;
                console.log('NaN detectado, usando 0');
              }
            }
            
            // Validar rango
            if (gasLevel < 0 || gasLevel > 100) {
              console.error('Nivel de gasolina fuera de rango:', gasLevel);
              throw new Error(`El nivel de gasolina debe estar entre 0 y 100. Valor recibido: ${gasLevel}`);
            }
            
            console.log(`Valor final a enviar: ${gasLevel}`);
            console.log('=== FIN DEBUG GASOLINA ===');
            formData.append(apiFieldName, gasLevel.toString());
          } else if (apiFieldName === 'age') {
            // Asegurar que el año sea un número
            const year = parseInt(value) || new Date().getFullYear();
            console.log(`Agregando a FormData: ${apiFieldName} = ${year} (año)`);
            formData.append(apiFieldName, year.toString());
          } else if (apiFieldName === 'supplierId' || apiFieldName === 'driverId') {
            // Solo agregar IDs si tienen valor
            if (value && value.trim() !== '') {
              console.log(`Agregando a FormData: ${apiFieldName} = ${value} (ID)`);
              formData.append(apiFieldName, value.trim());
            } else {
              console.log(`Saltando campo vacío: ${apiFieldName}`);
            }
          } else {
            // Campos de texto normales
            const fieldValue = value || '';
            console.log(`Agregando a FormData: ${apiFieldName} = ${fieldValue}`);
            formData.append(apiFieldName, fieldValue);
          }
        }
      });

      console.log('=== ENVIANDO REQUEST ===');
      console.log('URL:', "http://localhost:4000/api/camiones");
      console.log('Método: POST');
      
      // Debug FormData
      console.log('=== CONTENIDO FORMDATA FINAL ===');
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
        credentials: 'include', // Agregar credenciales si es necesario
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