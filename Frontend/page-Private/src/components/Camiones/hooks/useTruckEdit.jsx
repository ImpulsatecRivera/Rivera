import { useState, useCallback } from 'react';
import { config } from '../../../config.jsx';
import { api } from '../../../Context/authContext'; // ✅ IMPORTAR API

const API_URL = config.api.API_URL;

const useTruckEdit = (fetchOptions, onUpdateSuccess) => {
  // Estados del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  
  // Estados de datos relacionados
  const [proveedores, setProveedores] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  
  // Estados del formulario - ACTUALIZADO con estado
  const [formData, setFormData] = useState({
    nombre: '',
    tarjetaCirculacion: '',
    placa: '',
    proveedor: '',
    descripcion: '',
    motorista: '',
    marca: '',
    modelo: '',
    año: '',
    estado: 'DISPONIBLE',
    imagen: null
  });
  
  // Estados de imagen
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageError, setImageError] = useState(null);

  // ✅ Estados de imagen de tarjeta de circulación
  const [circulationCardImagePreview, setCirculationCardImagePreview] = useState(null);
  const [currentCirculationCardImage, setCurrentCirculationCardImage] = useState(null);
  const [circulationCardImageError, setCirculationCardImageError] = useState(null);

  // Función para normalizar el estado desde la API
  const normalizeState = useCallback((state) => {
    if (!state) return 'DISPONIBLE';
    
    const normalized = state.toUpperCase();
    
    const stateMap = {
      'DISPONIBLE': 'DISPONIBLE',
      'EN RUTA': 'EN RUTA',
      'EN_RUTA': 'EN RUTA',
      'MANTENIMIENTO': 'MANTENIMIENTO',
      'FUERA DE SERVICIO': 'FUERA DE SERVICIO',
      'FUERA_DE_SERVICIO': 'FUERA DE SERVICIO',
      'NO DISPONIBLE': 'FUERA DE SERVICIO',
      'NO_DISPONIBLE': 'FUERA DE SERVICIO',
      'SIN ESTADO': 'DISPONIBLE',
      'SIN_ESTADO': 'DISPONIBLE'
    };
    
    return stateMap[normalized] || 'DISPONIBLE';
  }, []);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      tarjetaCirculacion: '',
      placa: '',
      proveedor: '',
      descripcion: '',
      motorista: '',
      marca: '',
      modelo: '',
      año: '',
      estado: 'DISPONIBLE',
      imagen: null
    });
    setImagePreview(null);
    setCurrentImage(null);
    setImageError(null);
    // ✅ Resetear estados de imagen de tarjeta
    setCirculationCardImagePreview(null);
    setCurrentCirculationCardImage(null);
    setCirculationCardImageError(null);
  }, []);

  // Función para abrir modal de edición - ACTUALIZADO CON API
  const openEditModal = useCallback(async (truck) => {
    if (!truck?.id) {
      console.error('No se puede editar: ID del camión no válido');
      return { success: false, error: 'ID del camión no válido' };
    }

    try {
      setSelectedTruck(truck);
      setEditLoading(true);
      // NO abrir el modal aún, esperar a que carguen los datos
      resetForm();

      console.log('=== CARGANDO DATOS PARA EDICIÓN ===');
      console.log('Camión seleccionado:', truck);

      // ✅ USAR API EN LUGAR DE FETCH - Cargar también todos los camiones
      const [truckResponse, proveedoresResponse, motoristasResponse, camionesResponse] = await Promise.allSettled([
        api.get(`/camiones/${truck.id}`),
        api.get('/proveedores'),
        api.get('/motoristas'),
        api.get('/camiones')
      ]);

      // Verificar respuestas
      if (truckResponse.status === 'rejected') {
        throw new Error(`Error al cargar datos del camión: ${truckResponse.reason?.message}`);
      }
      
      // Extraer truckData correctamente - La API devuelve { message, data: {...} }
      const apiResponse = truckResponse.value.data;
      const truckData = apiResponse.data || apiResponse;
      
      const proveedoresData = proveedoresResponse.status === 'fulfilled' ? proveedoresResponse.value.data : [];
      const motoristasData = motoristasResponse.status === 'fulfilled' ? motoristasResponse.value.data : [];
      
      // Extraer el array de camiones - manejar diferentes estructuras de respuesta
      let camionesData = [];
      if (camionesResponse.status === 'fulfilled') {
        const camionesRaw = camionesResponse.value.data;
        // Si la respuesta tiene un array directamente, usarlo; si no, buscar en propiedades comunes
        if (Array.isArray(camionesRaw)) {
          camionesData = camionesRaw;
        } else if (camionesRaw?.data && Array.isArray(camionesRaw.data)) {
          camionesData = camionesRaw.data;
        } else if (camionesRaw?.camiones && Array.isArray(camionesRaw.camiones)) {
          camionesData = camionesRaw.camiones;
        }
      }

      if (proveedoresResponse.status === 'rejected') {
        console.warn('Error al cargar proveedores:', proveedoresResponse.reason);
      }
      if (motoristasResponse.status === 'rejected') {
        console.warn('Error al cargar motoristas:', motoristasResponse.reason);
      }
      if (camionesResponse.status === 'rejected') {
        console.warn('Error al cargar camiones:', camionesResponse.reason);
      }

      console.log('Datos del camión cargados:', truckData);
      console.log('Total de camiones cargados:', camionesData.length);
      
      // DEBUG: Imprimir TODAS las propiedades de truckData
      console.log('%c=== TODAS LAS PROPIEDADES DE truckData ===', 'background: yellow; color: black; font-size: 14px; font-weight: bold;');
      console.log('OBJETO COMPLETO EN JSON:', JSON.stringify(truckData, null, 2));
      console.log('Claves disponibles:', Object.keys(truckData));
      Object.entries(truckData).forEach(([key, value]) => {
        if (typeof value === 'object') {
          console.log(`${key}:`, value);
        } else {
          console.log(`${key}: "${value}"`);
        }
      });
      console.log('%c=== FIN DE PROPIEDADES ===', 'background: yellow; color: black; font-size: 14px; font-weight: bold;');
      
      // Identificar el motorista actual del camión
      const motoristaActualId = truckData.driverId?._id || truckData.driverId;
      console.log('Motorista actual del camión:', motoristaActualId);
      
      // Crear un mapa de motoristas asignados a otros camiones
      const motoristasAsignadosMap = new Map();
      camionesData.forEach(camion => {
        const camionId = camion._id || camion.id;
        const currentTruckId = truck.id || truck._id;
        const isCurrentTruck = camionId === currentTruckId;
        
        // Solo mapear camiones con motorista asignado que no sean el actual
        if (!isCurrentTruck && camion.driverId) {
          const driverId = camion.driverId?._id || camion.driverId;
          const driverIdStr = typeof driverId === 'string' ? driverId : driverId?.toString();
          if (driverIdStr) {
            motoristasAsignadosMap.set(driverIdStr, {
              camionId: camionId,
              camionNombre: camion.name || camion.nombre || 'Camión sin nombre'
            });
          }
        }
      });

      console.log('Motoristas asignados a otros camiones:', motoristasAsignadosMap.size);

      // MOSTRAR TODOS los motoristas con metadata de asignación - FILTRAR: Solo motoristas, excluir auxiliares
      const motoristasConMetadata = motoristasData
        .filter(motorista => motorista.rol === 'motorista') // ✅ FILTRAR POR ROL
        .map(motorista => {
        const motoristaId = motorista._id || motorista.id;
        const isCurrentDriver = motoristaActualId && motoristaId === motoristaActualId;
        const asignacionInfo = motoristasAsignadosMap.get(motoristaId);
        
        return {
          ...motorista,
          isCurrentDriver, // Es el motorista asignado a ESTE camión
          isAsignado: !!asignacionInfo, // Está asignado a otro camión
          asignacionInfo // Info del camión al que está asignado (si aplica)
        };
      });

      console.log('Total de motoristas a mostrar:', motoristasConMetadata.length);

      // ✅ Función para formatear fecha al formato YYYY-MM-DD para input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          // Usar UTC para evitar problemas de zona horaria
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (error) {
          return '';
        }
      };

      // Establecer datos del formulario
      const formDataToSet = {
        nombre: truckData.name || '',
        tarjetaCirculacion: formatDateForInput(truckData.ciculatioCard || truckData.circulationCard),
        placa: truckData.licensePlate || '',
        proveedor: truckData.supplierId?._id || truckData.supplierId || '',
        descripcion: truckData.description || '',
        motorista: truckData.driverId?._id || truckData.driverId || '',
        marca: truckData.brand || '',
        modelo: truckData.model || '',
        año: truckData.age || '',
        estado: normalizeState(truckData.state || truckData.estado),
        imagen: null
      };
      
      console.log('=== DATOS FORMATEADOS PARA FORMULARIO ===');
      console.log('FormData a establecer:', formDataToSet);
      console.log('Nombre:', formDataToSet.nombre);
      console.log('Placa:', formDataToSet.placa);
      console.log('Marca:', formDataToSet.marca);
      console.log('Modelo:', formDataToSet.modelo);
      console.log('Año:', formDataToSet.año);
      console.log('Estado:', formDataToSet.estado);
      console.log('Proveedor ID:', formDataToSet.proveedor);
      console.log('Motorista ID:', formDataToSet.motorista);
      
      setFormData(formDataToSet);

      // Establecer imagen actual
      const imageUrl = truckData.img || truckData.image || null;
      console.log('URL de imagen del camión:', imageUrl);
      
      if (imageUrl) {
        setCurrentImage(imageUrl);
        setImagePreview(null);
        console.log('✅ Imagen cargada desde servidor:', imageUrl);
      } else {
        setCurrentImage(null);
        setImagePreview(null);
        console.log('⚠️ No hay imagen para este camión');
      }

      // ✅ Establecer imagen de tarjeta de circulación actual
      const circulationCardImageUrl = truckData.circulationCardImage || truckData.circulationCardImageUrl || null;
      console.log('URL de imagen de tarjeta de circulación:', circulationCardImageUrl);
      
      if (circulationCardImageUrl) {
        setCurrentCirculationCardImage(circulationCardImageUrl);
        setCirculationCardImagePreview(null);
        console.log('✅ Imagen de tarjeta cargada desde servidor:', circulationCardImageUrl);
      } else {
        setCurrentCirculationCardImage(null);
        setCirculationCardImagePreview(null);
        console.log('⚠️ No hay imagen de tarjeta para este camión');
      }

      // Establecer listas - usar todos los motoristas con metadata
      setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      setMotoristas(Array.isArray(motoristasConMetadata) ? motoristasConMetadata : []);

      // IMPORTANTE: Abrir el modal DESPUÉS de cargar todos los datos
      setShowEditModal(true);
      console.log('✅ Modal abierto con datos cargados');

      return { success: true };
    } catch (error) {
      console.error('Error al cargar datos para edición:', error);
      setShowEditModal(false);
      return { success: false, error: error.message };
    } finally {
      setEditLoading(false);
    }
  }, [resetForm, normalizeState]);

  // Función para cerrar modal de edición
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedTruck(null);
    resetForm();
    setProveedores([]);
    setMotoristas([]);
  }, [resetForm]);

  // Función para manejar cambios en inputs
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Función para manejar cambio de imagen
  const handleImageChange = useCallback((file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      setImageError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setImageError('Formato no soportado. Use JPG, PNG o GIF.');
      return;
    }

    setImageError(null);
    setFormData(prev => ({
      ...prev,
      imagen: file
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.onerror = () => {
      setImageError('Error al procesar la imagen.');
    };
    reader.readAsDataURL(file);
  }, []);

  // ✅ Función para manejar cambio de imagen de tarjeta de circulación
  const handleCirculationCardImageChange = useCallback((file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      setCirculationCardImageError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setCirculationCardImageError('Formato no soportado. Use JPG, PNG o GIF.');
      return;
    }

    setCirculationCardImageError(null);
    setFormData(prev => ({
      ...prev,
      circulationCardImage: file
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setCirculationCardImagePreview(e.target.result);
    };
    reader.onerror = () => {
      setCirculationCardImageError('Error al procesar la imagen.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Función auxiliar para sanitizar valores vacíos
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value || null;
  };

  // Función para enviar formulario de edición - ACTUALIZADO CON API
  const submitEdit = useCallback(async () => {
    if (!selectedTruck?.id) {
      return { success: false, error: 'No hay camión seleccionado para editar' };
    }

    try {
      setIsSubmitting(true);
      console.log('=== INICIANDO ACTUALIZACIÓN ===');
      console.log('FormData actual:', formData);
      console.log('¿Hay imagen nueva?:', !!formData.imagen);
      console.log('¿Hay imagen de tarjeta nueva?:', !!formData.circulationCardImage);

      let response;

      // Determinar si usar FormData o JSON
      if (formData.imagen || formData.circulationCardImage) {
        console.log('=== USANDO FORMDATA PARA IMÁGENES ===');
        
        const formDataToSend = new FormData();
        
        // Agregar solo si no está vacío
        const nombre = sanitizeValue(formData.nombre);
        if (nombre) formDataToSend.append('name', nombre);
        
        const tarjeta = sanitizeValue(formData.tarjetaCirculacion);
        if (tarjeta) formDataToSend.append('ciculatioCard', tarjeta);
        
        const placa = sanitizeValue(formData.placa);
        if (placa) formDataToSend.append('licensePlate', placa);
        
        formDataToSend.append('state', formData.estado || 'DISPONIBLE');
        
        const supplierId = sanitizeValue(formData.proveedor);
        if (supplierId) {
          formDataToSend.append('supplierId', supplierId);
        }
        
        const description = sanitizeValue(formData.descripcion);
        if (description) {
          formDataToSend.append('description', description);
        }
        
        const driverId = sanitizeValue(formData.motorista);
        if (driverId) {
          formDataToSend.append('driverId', driverId);
        }
        
        const marca = sanitizeValue(formData.marca);
        if (marca) formDataToSend.append('brand', marca);
        
        const modelo = sanitizeValue(formData.modelo);
        if (modelo) formDataToSend.append('model', modelo);
        
        const año = sanitizeValue(formData.año);
        if (año) formDataToSend.append('age', año);
        
        // ✅ Agregar imagen del camión si existe
        if (formData.imagen) {
          formDataToSend.append('img', formData.imagen);
        }

        // ✅ Agregar imagen de tarjeta de circulación si existe
        if (formData.circulationCardImage) {
          formDataToSend.append('circulationCardImage', formData.circulationCardImage);
        }

        console.log('=== ENVIANDO FORMDATA ===');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        // ✅ USAR API CON FORMDATA
        response = await api.put(`/camiones/${selectedTruck.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        console.log('=== USANDO JSON SIN IMAGEN ===');
        
        const updateData = {
          state: formData.estado || 'DISPONIBLE'
        };
        
        // Agregar solo los campos que tienen valor
        const nombre = sanitizeValue(formData.nombre);
        if (nombre) updateData.name = nombre;
        
        const tarjeta = sanitizeValue(formData.tarjetaCirculacion);
        if (tarjeta) updateData.ciculatioCard = tarjeta;
        
        const placa = sanitizeValue(formData.placa);
        if (placa) updateData.licensePlate = placa;
        
        const marca = sanitizeValue(formData.marca);
        if (marca) updateData.brand = marca;
        
        const modelo = sanitizeValue(formData.modelo);
        if (modelo) updateData.model = modelo;
        
        const año = sanitizeValue(formData.año);
        if (año) updateData.age = año;
        
        const supplierId = sanitizeValue(formData.proveedor);
        if (supplierId) updateData.supplierId = supplierId;
        
        const description = sanitizeValue(formData.descripcion);
        if (description) updateData.description = description;
        
        const driverId = sanitizeValue(formData.motorista);
        if (driverId) updateData.driverId = driverId;

        console.log('=== DATOS JSON A ENVIAR ===', updateData);

        // ✅ USAR API CON JSON
        response = await api.put(`/camiones/${selectedTruck.id}`, updateData);
      }

      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      const responseData = response.data;
      console.log('=== RESPUESTA COMPLETA DEL SERVIDOR ===', responseData);
      
      const updatedTruckData = responseData.data || responseData;
      console.log('=== DATOS ACTUALIZADOS EXTRAÍDOS ===', updatedTruckData);
      
      const updatedTruck = {
        ...selectedTruck,
        ...updatedTruckData,
        id: selectedTruck.id || updatedTruckData._id || updatedTruckData.id,
        _id: selectedTruck._id || updatedTruckData._id,
        name: updatedTruckData.name || formData.nombre,
        brand: updatedTruckData.brand || formData.marca,
        model: updatedTruckData.model || formData.modelo,
        age: updatedTruckData.age || formData.año,
        licensePlate: updatedTruckData.licensePlate || formData.placa,
        ciculatioCard: updatedTruckData.ciculatioCard || formData.tarjetaCirculacion,
        description: updatedTruckData.description || formData.descripcion,
        state: updatedTruckData.state || formData.estado,
        supplierId: updatedTruckData.supplierId || (formData.proveedor || null),
        driverId: updatedTruckData.driverId || (formData.motorista || null),
        img: updatedTruckData.img || imagePreview || currentImage
      };
      
      console.log('=== CAMIÓN ACTUALIZADO FINAL ===', updatedTruck);
      
      if (onUpdateSuccess && typeof onUpdateSuccess === 'function') {
        onUpdateSuccess(updatedTruck);
      }
      
      closeEditModal();
      
      return { success: true, data: updatedTruck };

    } catch (error) {
      console.error('=== ERROR GENERAL EN EDICIÓN ===');
      console.error('Error completo:', error);
      console.error('Response:', error.response?.data);
      
      let errorMessage = 'Error al actualizar el camión';
      
      if (error.response?.status === 401) {
        errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para editar camiones.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Camión no encontrado.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTruck, formData, imagePreview, currentImage, onUpdateSuccess, closeEditModal]);

  // Función para validar formulario
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!formData.placa.trim()) errors.placa = 'La placa es obligatoria';
    if (!formData.marca.trim()) errors.marca = 'La marca es obligatoria';
    if (!formData.modelo.trim()) errors.modelo = 'El modelo es obligatorio';
    if (!formData.estado) errors.estado = 'El estado es obligatorio';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData]);

  // Estados derivados útiles
  const hasChanges = selectedTruck && (
    formData.nombre !== (selectedTruck.name || '') ||
    formData.placa !== (selectedTruck.licensePlate || '') ||
    formData.marca !== (selectedTruck.brand || '') ||
    formData.modelo !== (selectedTruck.model || '') ||
    formData.año !== (selectedTruck.age || '') ||
    formData.descripcion !== (selectedTruck.description || '') ||
    normalizeState(formData.estado) !== normalizeState(selectedTruck.state || selectedTruck.estado) ||
    !!formData.imagen
  );

  return {
    // Estados del modal
    showEditModal,
    editLoading,
    isSubmitting,
    selectedTruck,
    
    // Estados de datos
    proveedores,
    motoristas,
    
    // Estados del formulario
    formData,
    imagePreview,
    currentImage,
    imageError,
    
    // ✅ Estados de imagen de tarjeta de circulación
    circulationCardImagePreview,
    currentCirculationCardImage,
    circulationCardImageError,
    
    // Funciones principales
    openEditModal,
    closeEditModal,
    submitEdit,
    
    // Funciones de manejo
    handleInputChange,
    handleImageChange,
    handleCirculationCardImageChange, // ✅ Nueva función
    resetForm,
    validateForm,
    normalizeState,
    
    // Estados derivados
    hasChanges,
    canSubmit: !isSubmitting && hasChanges && validateForm().isValid
  };
};

export default useTruckEdit;