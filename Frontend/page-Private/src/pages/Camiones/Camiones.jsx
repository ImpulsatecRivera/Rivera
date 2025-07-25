import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check, ChevronDown, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Camion from "../../images/camion.png"

const Camiones = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
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

  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const navigate = useNavigate();

  // Configuración base para fetch con cookies
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const getStatusColor = (status) => {
    if (!status || status.trim() === '') {
      return 'text-gray-600 bg-gray-50';
    }
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'text-green-600 bg-green-50';
      case 'NO DISPONIBLE':
        return 'text-red-600 bg-red-50';
      case 'MANTENIMIENTO':
        return 'text-yellow-600 bg-yellow-50';
      case 'EN RUTA':
        return 'text-blue-600 bg-blue-50';
      case 'SIN ESTADO':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDotColor = (status) => {
    if (!status || status.trim() === '') {
      return 'bg-gray-400';
    }
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'bg-green-500';
      case 'NO DISPONIBLE':
        return 'bg-red-500';
      case 'MANTENIMIENTO':
        return 'bg-yellow-500';
      case 'EN RUTA':
        return 'bg-blue-500';
      case 'SIN ESTADO':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Función para normalizar los datos del camión
  const normalizeTruckData = (truck) => {
    // Intenta diferentes campos comunes para el ID
    const id = truck.id || truck._id || truck.truck_id || truck.camion_id;
    
    return {
      ...truck,
      id: id,
      // Asegúrate de que otros campos también estén normalizados
      name: truck.name || truck.nombre || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || 'N/A',
      state: truck.state || truck.estado || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null,
      brand: truck.brand || truck.marca || '',
      model: truck.model || truck.modelo || '',
      age: truck.age || truck.año || truck.year || '',
      ciculatioCard: truck.ciculatioCard || truck.circulationCard || '',
      description: truck.description || truck.descripcion || ''
    };
  };

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/camiones', fetchOptions);
        const data = await res.json();
        console.log("Camiones recibidos:", data);

        const camiones = Array.isArray(data) ? data : data.camiones || [];
        
        // Normaliza los datos y filtra elementos sin ID válido
        const normalizedTrucks = camiones
          .map(normalizeTruckData)
          .filter(truck => truck.id !== undefined && truck.id !== null)
          .map((truck, index) => {
            // Asignar algunos camiones como "Sin estado" para demostración
            if (index % 4 === 0) { // Cada 4to camión sin estado
              return {
                ...truck,
                state: 'Sin estado'
              };
            }
            return truck;
          });

        console.log("Camiones normalizados:", normalizedTrucks);
        setTrucks(normalizedTrucks);
        setError(false);
      } catch (err) {
        console.error('Error al obtener camiones:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const handleAddTruck = () => navigate('/camiones/aggCamion');
  
  const handleEditTruck = async (e, truck) => {
    e.stopPropagation();
    if (!truck.id) {
      console.error('No se puede editar: ID del camión no válido');
      return;
    }

    setSelectedTruck(truck);
    setEditLoading(true);
    setShowEditModal(true);

    try {
      // Cargar datos del camión y listas
      const [truckResponse, proveedoresResponse, motoristasResponse] = await Promise.all([
        fetch(`http://localhost:4000/api/camiones/${truck.id}`, fetchOptions),
        fetch('http://localhost:4000/api/proveedores', fetchOptions),
        fetch('http://localhost:4000/api/motoristas', fetchOptions)
      ]);

      const truckData = await truckResponse.json();
      const proveedoresData = await proveedoresResponse.json();
      const motoristasData = await motoristasResponse.json();

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

      // Guardar imagen actual para mostrar
      setCurrentImage(truckData.img || null);
      setImagePreview(null);

      setProveedores(proveedoresData);
      setMotoristas(motoristasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleDeleteClick = (e, truck) => {
    e.stopPropagation();
    setSelectedTruck(truck);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true); // Mostrar loading
      
      // Eliminar del backend
      const response = await fetch(`http://localhost:4000/api/camiones/${selectedTruck.id}`, {
        method: 'DELETE',
        ...fetchOptions,
      });

      if (response.ok) {
        // Solo si se eliminó exitosamente del backend, quitar del estado local
        setTrucks(trucks.filter(t => t.id !== selectedTruck.id));
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        console.log('Camión eliminado exitosamente de la base de datos');
      } else {
        // Si hay error en el backend, mostrar mensaje
        const errorData = await response.json();
        console.error('Error al eliminar camión:', errorData);
        alert('Error al eliminar el camión. Inténtalo de nuevo.');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error de conexión al eliminar camión:', error);
      alert('Error de conexión. Verifica tu conexión a internet.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false); // Ocultar loading
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);
      console.log('=== INICIANDO ACTUALIZACIÓN ===');
      console.log('FormData actual:', formData);
      console.log('¿Hay imagen nueva?:', !!formData.imagen);

      // Si hay imagen, usar FormData, sino usar JSON
      if (formData.imagen) {
        console.log('=== USANDO FORMDATA PARA IMAGEN ===');
        // Crear FormData para enviar archivo e información
        const formDataToSend = new FormData();
        
        // Agregar campos de texto
        formDataToSend.append('name', formData.nombre);
        formDataToSend.append('ciculatioCard', formData.tarjetaCirculacion);
        formDataToSend.append('licensePlate', formData.placa);
        if (formData.proveedor) formDataToSend.append('supplierId', formData.proveedor);
        formDataToSend.append('description', formData.descripcion);
        if (formData.motorista) formDataToSend.append('driverId', formData.motorista);
        formDataToSend.append('brand', formData.marca);
        formDataToSend.append('model', formData.modelo);
        formDataToSend.append('age', formData.año);
        formDataToSend.append('img', formData.imagen); // Cambiar 'imagen' por 'img'

        console.log('=== ENVIANDO FORMDATA ===');
        // Mostrar contenido de FormData
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await fetch(`http://localhost:4000/api/camiones/${selectedTruck.id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formDataToSend
        });

        console.log('=== RESPUESTA DEL SERVIDOR (FORMDATA) ===');
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const updatedTruckData = await response.json();
          console.log('=== DATOS ACTUALIZADOS ===', updatedTruckData);
          
          const updatedTruck = {
            ...selectedTruck,
            ...updatedTruckData,
            id: selectedTruck.id,
            name: updatedTruckData.name || formData.nombre,
            brand: updatedTruckData.brand || formData.marca,
            model: updatedTruckData.model || formData.modelo,
            age: updatedTruckData.age || formData.año,
            licensePlate: updatedTruckData.licensePlate || formData.placa,
            ciculatioCard: updatedTruckData.ciculatioCard || formData.tarjetaCirculacion,
            description: updatedTruckData.description || formData.descripcion,
            supplierId: updatedTruckData.supplierId || formData.proveedor,
            driverId: updatedTruckData.driverId || formData.motorista,
            img: updatedTruckData.img || imagePreview // Actualizar imagen
          };
          
          setTrucks(trucks.map(t => 
            t.id === selectedTruck.id ? updatedTruck : t
          ));
          
          setShowEditModal(false);
          setShowSuccessModal(true);
        } else {
          const errorText = await response.text();
          console.error('=== ERROR DEL SERVIDOR (FORMDATA) ===');
          console.error('Status:', response.status);
          console.error('Error text:', errorText);
          throw new Error(`Error del servidor (${response.status}): ${errorText}`);
        }
      } else {
        console.log('=== USANDO JSON SIN IMAGEN ===');
        // Sin imagen, usar JSON normal
        const updateData = {
          name: formData.nombre,
          ciculatioCard: formData.tarjetaCirculacion,
          licensePlate: formData.placa,
          supplierId: formData.proveedor || null,
          description: formData.descripcion,
          driverId: formData.motorista || null,
          brand: formData.marca,
          model: formData.modelo,
          age: formData.año
        };

        console.log('=== DATOS JSON A ENVIAR ===', updateData);

        const response = await fetch(`http://localhost:4000/api/camiones/${selectedTruck.id}`, {
          method: 'PUT',
          ...fetchOptions,
          body: JSON.stringify(updateData)
        });

        console.log('=== RESPUESTA DEL SERVIDOR (JSON) ===');
        console.log('Status:', response.status);

        if (response.ok) {
          const updatedTruckData = await response.json();
          console.log('=== DATOS ACTUALIZADOS ===', updatedTruckData);
          
          const updatedTruck = {
            ...selectedTruck,
            ...updatedTruckData,
            id: selectedTruck.id,
            name: updatedTruckData.name || formData.nombre,
            brand: updatedTruckData.brand || formData.marca,
            model: updatedTruckData.model || formData.modelo,
            age: updatedTruckData.age || formData.año,
            licensePlate: updatedTruckData.licensePlate || formData.placa,
            ciculatioCard: updatedTruckData.ciculatioCard || formData.tarjetaCirculacion,
            description: updatedTruckData.description || formData.descripcion,
            supplierId: updatedTruckData.supplierId || formData.proveedor,
            driverId: updatedTruckData.driverId || formData.motorista
          };
          
          setTrucks(trucks.map(t => 
            t.id === selectedTruck.id ? updatedTruck : t
          ));
          
          setShowEditModal(false);
          setShowSuccessModal(true);
        } else {
          const errorText = await response.text();
          console.error('=== ERROR DEL SERVIDOR (JSON) ===');
          console.error('Status:', response.status);
          console.error('Error text:', errorText);
          throw new Error(`Error del servidor (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('=== ERROR GENERAL ===');
      console.error('Error completo:', error);
      console.error('Stack trace:', error.stack);
      alert(`Error al actualizar el camión: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTruck(null);
  };

  const TruckCard = ({ truck }) => {
    const handleCardClick = () => {
      if (truck.id) {
        console.log('Navegando a camión con id:', truck.id);
        navigate(`/camiones/${truck.id}`);
      } else {
        console.error('No se puede navegar: ID del camión no válido', truck);
      }
    };

    return (
      <div
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-md font-semibold text-gray-800">{truck.name}</div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => handleEditTruck(e, truck)}
              disabled={!truck.id}
              className={`${!truck.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Edit3 size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
            <button 
              onClick={(e) => handleDeleteClick(e, truck)}
              disabled={!truck.id}
              className={`${!truck.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
            </button>
          </div>
        </div>
        <div className="mb-3">
          <img
            src={truck.img || Camion}
            alt={truck.name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        <p className="text-sm text-gray-600 mb-1">Placa: {truck.licensePlate}</p>
        <div className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(truck.state)}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor(truck.state)}`} />
          {truck.state ? truck.state.toUpperCase() : 'SIN ESTADO'}
        </div>
        
        {/* Indicador de debug para desarrollo */}
        {process.env.NODE_ENV === 'development' && !truck.id && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 p-1 rounded">
            ⚠️ ID no válido
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#34353A]">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden flex flex-col">
          <div className="mt-4">
            <button onClick={handleAddTruck} className="flex items-center space-x-4 text-gray-600 hover:text-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar camión</span>
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center mt-10 font-medium">Error al cargar los camiones.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
              {trucks.map((truck, index) => (
                <TruckCard key={truck.id || truck._id || `truck-${index}`} truck={truck} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <>
          <style>
            {`
              @keyframes slideInUp {
                from {
                  transform: translateY(100px) scale(0.9);
                  opacity: 0;
                }
                to {
                  transform: translateY(0) scale(1);
                  opacity: 1;
                }
              }
              
              @keyframes fadeInUp {
                from {
                  transform: translateY(20px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}
          </style>
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-40">
            <div 
              className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
              style={{
                animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <div 
                  className="flex items-center"
                  style={{
                    animation: 'fadeInUp 0.5s ease-out 0.2s both'
                  }}
                >
                  <Truck className="w-6 h-6 mr-3" />
                  <h2 className="text-lg font-semibold">Editar Camión</h2>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  style={{
                    animation: 'fadeInUp 0.5s ease-out 0.2s both'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-400 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando datos del camión...</p>
                </div>
              ) : (
                <div 
                  className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
                  style={{
                    animation: 'fadeInUp 0.5s ease-out 0.3s both'
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del camión</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nombre del camión"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta de circulación</label>
                      <input
                        type="text"
                        value={formData.tarjetaCirculacion}
                        onChange={(e) => handleInputChange('tarjetaCirculacion', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Tarjeta de circulación"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                      <input
                        type="text"
                        value={formData.placa}
                        onChange={(e) => handleInputChange('placa', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Placa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) => handleInputChange('marca', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Marca"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                      <input
                        type="text"
                        value={formData.modelo}
                        onChange={(e) => handleInputChange('modelo', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Modelo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                      <div className="relative">
                        <select
                          value={formData.proveedor}
                          onChange={(e) => handleInputChange('proveedor', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Seleccionar proveedor</option>
                          {proveedores.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.companyName || p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Motorista</label>
                      <div className="relative">
                        <select
                          value={formData.motorista}
                          onChange={(e) => handleInputChange('motorista', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Seleccionar motorista</option>
                          {motoristas.map((m) => (
                            <option key={m._id} value={m._id}>
                              {(m.name || m.firstName || '') + ' ' + (m.lastName || m.apellido || '')}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm h-24 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Descripción del camión"
                      />
                    </div>

                    {/* Nueva sección para imagen */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del camión</label>
                      
                      {/* Mostrar imagen actual o preview */}
                      {(imagePreview || currentImage) && (
                        <div className="mb-4">
                          <img
                            src={imagePreview || currentImage}
                            alt="Imagen del camión"
                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {imagePreview ? 'Nueva imagen seleccionada' : 'Imagen actual'}
                          </p>
                        </div>
                      )}

                      {/* Input para subir nueva imagen */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="imageInput"
                        />
                        <label
                          htmlFor="imageInput"
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-sm cursor-pointer hover:border-green-500 transition-all flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-gray-600">
                            {formData.imagen ? formData.imagen.name : 'Seleccionar nueva imagen'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="mt-6 flex justify-center"
                    style={{
                      animation: 'fadeInUp 0.5s ease-out 0.5s both'
                    }}
                  >
                    <button
                      onClick={handleSubmitEdit}
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-md font-medium text-white transition-all duration-200 ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Actualizando...
                        </div>
                      ) : (
                        'Actualizar'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-shake">
              <X size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar camión?</h2>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className={`px-4 py-2 rounded transition-all duration-200 ${
                  isDeleting 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95'
                }`}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar'
                )}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isDeleting}
                className={`px-4 py-2 border rounded transition-all duration-200 ${
                  isDeleting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 hover:scale-105 active:scale-95'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-bounce-in">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Check size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Camión actualizado</h2>
            <p className="text-gray-600 mb-6">Los cambios se han guardado exitosamente.</p>
            <button 
              onClick={handleSuccessContinue} 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Camiones;