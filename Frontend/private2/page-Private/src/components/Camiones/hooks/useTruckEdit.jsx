import { useState, useCallback } from 'react';

const useTruckEdit = (fetchOptions, onUpdateSuccess) => {
  // Estados del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  
  // Estados de datos relacionados
  const [proveedores, setProveedores] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  
  // Estados del formulario
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
    imagen: null
  });
  
  // Estados de imagen
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageError, setImageError] = useState(null);

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
      imagen: null
    });
    setImagePreview(null);
    setCurrentImage(null);
    setImageError(null);
  }, []);

  // Función para abrir modal de edición
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

      // Cargar datos del camión y listas en paralelo
      const [truckResponse, proveedoresResponse, motoristasResponse] = await Promise.all([
        fetch(`https://riveraproject-production.up.railway.app/api/camiones/${truck.id}`, fetchOptions),
        fetch('https://riveraproject-production.up.railway.app/api/proveedores', fetchOptions),
        fetch('https://riveraproject-production.up.railway.app/api/motoristas', fetchOptions)
      ]);

      // Verificar respuestas
      if (!truckResponse.ok) {
        throw new Error(`Error al cargar datos del camión: ${truckResponse.status}`);
      }
      if (!proveedoresResponse.ok) {
        console.warn('Error al cargar proveedores, continuando sin ellos');
      }
      if (!motoristasResponse.ok) {
        console.warn('Error al cargar motoristas, continuando sin ellos');
      }

      // Parsear datos
      const truckData = await truckResponse.json();
      const proveedoresData = proveedoresResponse.ok ? await proveedoresResponse.json() : [];
      const motoristasData = motoristasResponse.ok ? await motoristasResponse.json() : [];

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
        imagen: null
      });

      // Establecer imagen actual
      setCurrentImage(truckData.img || null);
      setImagePreview(null);

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
  }, [fetchOptions, resetForm]);

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

    // Validaciones de archivo
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

    // Crear preview de la imagen
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
    // Si el valor es una string vacía o solo espacios, devolver null
    // Si es undefined, devolver null
    // De lo contrario, devolver el valor tal como está
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value || null;
  };

  // Función para enviar formulario de edición
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
        
        // Agregar campos de texto con sanitización
        formDataToSend.append('name', sanitizeValue(formData.nombre) || '');
        formDataToSend.append('ciculatioCard', sanitizeValue(formData.tarjetaCirculacion) || '');
        formDataToSend.append('licensePlate', sanitizeValue(formData.placa) || '');
        
        // Para campos opcionales, solo agregar si tienen valor
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

        response = await fetch(`riveraproject-production.up.railway.app/api/camiones/${selectedTruck.id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formDataToSend
        });
      } else {
        console.log('=== USANDO JSON SIN IMAGEN ===');
        
        const updateData = {
          name: sanitizeValue(formData.nombre) || '',
          ciculatioCard: sanitizeValue(formData.tarjetaCirculacion) || '',
          licensePlate: sanitizeValue(formData.placa) || '',
          brand: sanitizeValue(formData.marca) || '',
          model: sanitizeValue(formData.modelo) || '',
          age: sanitizeValue(formData.año) || ''
        };

        // Solo agregar campos opcionales si tienen valor
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

        response = await fetch(`riveraproject-production.up.railway.app/api/camiones/${selectedTruck.id}`, {
          method: 'PUT',
          ...fetchOptions,
          body: JSON.stringify(updateData)
        });
      }

      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('=== RESPUESTA COMPLETA DEL SERVIDOR ===', responseData);
        
        // Extraer los datos actualizados del campo 'data' si existe
        const updatedTruckData = responseData.data || responseData;
        console.log('=== DATOS ACTUALIZADOS EXTRAÍDOS ===', updatedTruckData);
        
        // Crear objeto camión actualizado manteniendo la estructura original
        const updatedTruck = {
          ...selectedTruck,
          ...updatedTruckData,
          // Asegurar que mantenemos el ID correcto
          id: selectedTruck.id || updatedTruckData._id || updatedTruckData.id,
          _id: selectedTruck._id || updatedTruckData._id,
          // Mapear los campos actualizados
          name: updatedTruckData.name || formData.nombre,
          brand: updatedTruckData.brand || formData.marca,
          model: updatedTruckData.model || formData.modelo,
          age: updatedTruckData.age || formData.año,
          licensePlate: updatedTruckData.licensePlate || formData.placa,
          ciculatioCard: updatedTruckData.ciculatioCard || formData.tarjetaCirculacion,
          description: updatedTruckData.description || formData.descripcion,
          supplierId: updatedTruckData.supplierId || (formData.proveedor || null),
          driverId: updatedTruckData.driverId || (formData.motorista || null),
          img: updatedTruckData.img || imagePreview || currentImage
        };
        
        console.log('=== CAMIÓN ACTUALIZADO FINAL ===', updatedTruck);
        
        // Llamar callback de éxito si existe
        if (onUpdateSuccess && typeof onUpdateSuccess === 'function') {
          onUpdateSuccess(updatedTruck);
        }
        
        // Cerrar modal
        closeEditModal();
        
        return { success: true, data: updatedTruck };
      } else {
        const errorText = await response.text();
        console.error('=== ERROR DEL SERVIDOR ===');
        console.error('Status:', response.status);
        console.error('Error text:', errorText);
        
        throw new Error(`Error del servidor (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('=== ERROR GENERAL EN EDICIÓN ===');
      console.error('Error completo:', error);
      console.error('Stack trace:', error.stack);
      
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTruck, formData, imagePreview, currentImage, fetchOptions, onUpdateSuccess, closeEditModal]);

  // Función para validar formulario
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!formData.placa.trim()) errors.placa = 'La placa es obligatoria';
    if (!formData.marca.trim()) errors.marca = 'La marca es obligatoria';
    if (!formData.modelo.trim()) errors.modelo = 'El modelo es obligatorio';
    
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
    
    // Estados derivados
    hasChanges,
    canSubmit: !isSubmitting && hasChanges && validateForm().isValid
  };
};

export default useTruckEdit;