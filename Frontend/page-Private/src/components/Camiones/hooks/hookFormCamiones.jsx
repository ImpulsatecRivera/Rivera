import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { config } from "../../../config.jsx";

const API_URL = config.api.API_URL;
const API_URL_MOTORISTAS = `${API_URL}/motoristas`;
const API_URL_CAMIONES = `${API_URL}/camiones`;

export const useTruckForm = (onSuccess) => {
  const [motoristasDisponibles, setMotoristasDisponibles] = useState([]);
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

        // Filtrar motoristas que NO tienen camión asignado Y que sean rol "motorista" (no auxiliar)
        const motoristasLibres = motoristas.filter(motorista => {
          const motoristaId = motorista._id || motorista.id;
          const isAsignado = motoristasAsignados.has(motoristaId);
          const esMotorista = motorista.rol === 'motorista'; // ✅ FILTRAR POR ROL
          return !isAsignado && esMotorista;
        });

        console.log('Motoristas disponibles (sin camión y con rol motorista):', motoristasLibres);
        setMotoristasDisponibles(motoristasLibres);
      } catch (err) {
        console.error("Error al cargar motoristas disponibles:", err);
        setMotoristasDisponibles([]);
      }
    };

    cargarMotoristasDisponibles();
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
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    errors,
    onSubmit,
    motoristasDisponibles,
    isSubmitting,
    imagen,
  };
};