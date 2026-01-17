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
      setShowEditModal(true);
      resetForm();

      console.log('=== CARGANDO DATOS PARA EDICIÓN ===');
      console.log('Camión seleccionado:', truck);

      // ✅ USAR API EN LUGAR DE FETCH
      const [truckResponse, proveedoresResponse, motoristasResponse] = await Promise.allSettled([
        api.get(`/camiones/${truck.id}`),
        api.get('/proveedores'),
        api.get('/motoristas')
      ]);

      // Verificar respuestas
      if (truckResponse.status === 'rejected') {
        throw new Error(`Error al cargar datos del camión: ${truckResponse.reason?.message}`);
      }
      
      const truckData = truckResponse.value.data;
      const proveedoresData = proveedoresResponse.status === 'fulfilled' ? proveedoresResponse.value.data : [];
      const motoristasData = motoristasResponse.status === 'fulfilled' ? motoristasResponse.value.data : [];

      if (proveedoresResponse.status === 'rejected') {
        console.warn('Error al cargar proveedores:', proveedoresResponse.reason);
      }
      if (motoristasResponse.status === 'rejected') {
        console.warn('Error al cargar motoristas:', motoristasResponse.reason);
      }

      console.log('Datos del camión cargados:', truckData);

      // Establecer datos del formulario
      setFormData({
        nombre: truckData.name || '',
        tarjetaCirculacion: truckData.ciculatioCard || truckData.circulationCard || '',
        placa: truckData.licensePlate || '',
        proveedor: truckData.supplierId?._id || truckData.supplierId || '',
        descripcion: truckData.description || '',
        motorista: truckData.driverId?._id || truckData.driverId || '',
        marca: truckData.brand || '',
        modelo: truckData.model || '',
        año: truckData.age || '',
        estado: normalizeState(truckData.state || truckData.estado),
        imagen: null
      });

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

      // Establecer listas
      setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      setMotoristas(Array.isArray(motoristasData) ? motoristasData : []);

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

      let response;

      // Determinar si usar FormData o JSON
      if (formData.imagen) {
        console.log('=== USANDO FORMDATA PARA IMAGEN ===');
        
        const formDataToSend = new FormData();
        
        formDataToSend.append('name', sanitizeValue(formData.nombre) || '');
        formDataToSend.append('ciculatioCard', sanitizeValue(formData.tarjetaCirculacion) || '');
        formDataToSend.append('licensePlate', sanitizeValue(formData.placa) || '');
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
        
        formDataToSend.append('brand', sanitizeValue(formData.marca) || '');
        formDataToSend.append('model', sanitizeValue(formData.modelo) || '');
        formDataToSend.append('age', sanitizeValue(formData.año) || '');
        formDataToSend.append('img', formData.imagen);

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
          name: sanitizeValue(formData.nombre) || '',
          ciculatioCard: sanitizeValue(formData.tarjetaCirculacion) || '',
          licensePlate: sanitizeValue(formData.placa) || '',
          brand: sanitizeValue(formData.marca) || '',
          model: sanitizeValue(formData.modelo) || '',
          age: sanitizeValue(formData.año) || '',
          state: formData.estado || 'DISPONIBLE'
        };

        const supplierId = sanitizeValue(formData.proveedor);
        if (supplierId) {
          updateData.supplierId = supplierId;
        }

        const description = sanitizeValue(formData.descripcion);
        if (description) {
          updateData.description = description;
        }

        const driverId = sanitizeValue(formData.motorista);
        if (driverId) {
          updateData.driverId = driverId;
        }

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
    
    // Funciones principales
    openEditModal,
    closeEditModal,
    submitEdit,
    
    // Funciones de manejo
    handleInputChange,
    handleImageChange,
    resetForm,
    validateForm,
    normalizeState,
    
    // Estados derivados
    hasChanges,
    canSubmit: !isSubmitting && hasChanges && validateForm().isValid
  };
};

export default useTruckEdit;