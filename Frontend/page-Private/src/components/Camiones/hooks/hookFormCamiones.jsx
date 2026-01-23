// src/hooks/useTruckForm.js
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { config } from '../../../config.jsx';
const API_URL = config.api.API_URL;

const API_URL_MOTORISTAS = `${API_URL}/motoristas`;
const API_URL_PROVEEDORES = `${API_URL}/proveedores`; 
const API_URL_CAMIONES = `${API_URL}/camiones`;

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

  // Cargar motoristas sin camión asignado
  useEffect(() => {
    const cargarMotoristasDisponibles = async () => {
      try {
        // Cargar motoristas y camiones en paralelo
        const [motoristasRes, camionesRes] = await Promise.all([
          fetch(API_URL_MOTORISTAS, { credentials: 'include' }),
          fetch(API_URL_CAMIONES, { credentials: 'include' })
        ]);

        const motoristas = await motoristasRes.json();
        const camiones = await camionesRes.json();

        console.log('Motoristas cargados:', motoristas);
        console.log('Camiones cargados (raw):', camiones);

        // Extraer el array de camiones - manejar diferentes estructuras de respuesta
        let camionesArray = [];
        if (Array.isArray(camiones)) {
          camionesArray = camiones;
        } else if (camiones?.data && Array.isArray(camiones.data)) {
          camionesArray = camiones.data;
        } else if (camiones?.camiones && Array.isArray(camiones.camiones)) {
          camionesArray = camiones.camiones;
        }

        console.log('Camiones array procesado:', camionesArray);
        console.log('Total de camiones:', camionesArray.length);

        // Obtener IDs de motoristas que ya tienen camión asignado
        const motoristasAsignados = new Set(
          camionesArray
            .filter(camion => camion.driverId)
            .map(camion => {
              // Manejar tanto ObjectId como string
              const driverId = camion.driverId?._id || camion.driverId;
              return typeof driverId === 'string' ? driverId : driverId?.toString();
            })
            .filter(id => id) // Remover nulls/undefined
        );

        console.log('Motoristas con camión asignado:', Array.from(motoristasAsignados));

        // Filtrar motoristas que NO tienen camión asignado
        const motoristasLibres = motoristas.filter(motorista => {
          const motoristaId = motorista._id || motorista.id;
          const isAsignado = motoristasAsignados.has(motoristaId);
          return !isAsignado;
        });

        console.log('Motoristas disponibles (sin camión):', motoristasLibres);
        setMotoristasDisponibles(motoristasLibres);
      } catch (err) {
        console.error("Error al cargar motoristas disponibles:", err);
        setMotoristasDisponibles([]);
      }
    };

    cargarMotoristasDisponibles();
  }, []);

  // Cargar proveedores
  useEffect(() => {
    fetch(API_URL_PROVEEDORES, { credentials: 'include' })
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

      // ✅ SIEMPRE AGREGAR NIVEL DE GASOLINA COMO 1 (campo no usado pero requerido)
      formData.append('gasolineLevel', '1');
      console.log('gasolineLevel: 1 (valor fijo)');

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

      // ✅ AGREGAR CAMPOS MAPEADOS (excluyendo img y gasolineLevel ya que se envía con valor fijo)
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'img' && key !== 'gasolineLevel') {
          // Usar el mapeo si existe, sino usar el key original
          const apiFieldName = fieldMapping[key] || key;
          
          // Validaciones específicas
          if (apiFieldName === 'age') {
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
      console.log('URL:', API_URL_CAMIONES);
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

      const res = await fetch(API_URL_CAMIONES, {
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