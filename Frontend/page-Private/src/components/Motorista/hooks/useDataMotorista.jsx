import { useState, useEffect, useCallback, useMemo } from 'react';
import { config } from '../../../config';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { api } from '../../../context/authContext';
import { useAuth } from '../../../context/authContext';
import Swal from 'sweetalert2';

const API_URL = config.api.API_URL;

const useDataMotorista = () => {
  // Estados principales
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  // Estados de modales
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');

  // ✅ estado para botón/loading en Update
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  // ✅ Helper: normalizar motorista con campos del model
  const normalizeMotorista = useCallback((m, idx = 0) => {
    return {
      ...m,
      _id: m?._id || m?.id || `temp-${idx}`,

      name: m?.name || '',
      lastName: m?.lastName || '',
      email: m?.email || '',
      id: m?.id || '',
      birthDate: m?.birthDate || null,
      phone: m?.phone || '',
      address: m?.address || '',
      circulationCard: m?.circulationCard || '',
      img: m?.img || null,

      // ✅ nuevos/campos del model
      planillaTipo: (m?.planillaTipo || '').toString(),
      salario: m?.salario ?? 0,
      phoneVerified: Boolean(m?.phoneVerified),
      phoneVerifiedAt: m?.phoneVerifiedAt || null,

      createdAt: m?.createdAt || null,
      updatedAt: m?.updatedAt || null,
    };
  }, []);

  // ✅ Fetch motoristas (soporta varias estructuras)
  const fetchMotoristas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/motoristas`);

      const data = response.data;

      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data?.data?.motoristas)) arr = data.data.motoristas;
      else if (Array.isArray(data?.motoristas)) arr = data.motoristas;
      else if (Array.isArray(data?.data)) arr = data.data;
      else arr = [];

      const normalized = arr.map((m, i) => normalizeMotorista(m, i));

      // ✅ ordenar si quieres (por defecto createdAt desc si existe)
      const sorted = [...normalized].sort((a, b) => {
        const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });

      setMotoristas(sorted);
    } catch (err) {
      console.error('Error al cargar motoristas:', err);

      if (err?.message?.includes('Network') || err?.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que el backend esté corriendo y la URL sea correcta.');
      } else if (err?.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar los motoristas: ${err.message}`);
      }

      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeMotorista]);

  // Cargar motoristas al iniciar
  useEffect(() => {
    fetchMotoristas();
  }, [fetchMotoristas]);

  // ✅ Función para verificar licencia (misma lógica, con safety)
  const isLicenseValid = (motorista) => {
    try {
      if (!motorista?.circulationCard) return false;

      if (motorista?.birthDate) {
        const birthDate = new Date(motorista.birthDate);
        if (Number.isNaN(birthDate.getTime())) return Boolean(motorista.circulationCard);

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age >= 18;
      }

      return true;
    } catch (e) {
      console.error('Error en isLicenseValid:', e);
      return false;
    }
  };

  // ✅ Filtrar motoristas (incluye planillaTipo/salario)
  const filterMotoristas = useMemo(() => {
    const list = Array.isArray(motoristas) ? motoristas : [];
    const q = String(searchTerm || '').toLowerCase().trim();

    if (!q) return list;

    return list.filter((m) => {
      const haystack = [
        m.name,
        m.lastName,
        m.id,
        m.email,
        m.planillaTipo,
        String(m.salario ?? ''),
        m.circulationCard
      ].join(' ').toLowerCase();

      return haystack.includes(q);
    });
  }, [motoristas, searchTerm]);

  // Navegación
  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/motoristas/agregarMotorista');
  };

  // Manejo de opciones
  const handleOptionsClick = (e) => {
    e.stopPropagation();
    setShowAlert(true);
  };

  const { user } = useAuth();

  const handleEdit = () => {
    // Only Admins can edit any motorista; a Motorista may edit their own profile via mobile (or web if id matches)
    if (!user) {
      // Mostrar modal como en el login cuando no está autenticado
      Swal.fire({
        title: 'No autenticado',
        text: 'Por favor inicia sesión para continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    if (user.userType === 'Administrador' || (user.userType === 'Motorista' && String(user.id) === String(selectedMotorista?._id))) {
      setShowAlert(false);
      setShowEditAlert(true);
      return;
    }

    Swal.fire({
      title: 'Acceso restringido',
      html: 'No tienes permisos para editar este motorista. Contacta a un administrador.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#2563eb'
    });
  };

  const handleDelete = () => {
    if (!user || user.userType !== 'Administrador') {
      Swal.fire({
        title: 'Acceso restringido',
        html: 'No tienes permisos para eliminar motoristas. Contacta a un administrador.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb'
      });
      setShowAlert(false);
      return;
    }

    setShowAlert(false);
    setShowConfirmDelete(true);
  };

  // Eliminar motorista
  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      if (!selectedMotorista?._id) {
        setError('No hay motorista seleccionado para eliminar');
        return;
      }

      await api.delete(`/motoristas/${selectedMotorista._id}`);

      setMotoristas(prev =>
        Array.isArray(prev) ? prev.filter(m => m._id !== selectedMotorista._id) : []
      );

      setShowDetailView(false);
      setSelectedMotorista(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (err) {
      console.error("Error al eliminar motorista:", err);
      setError("Error al eliminar el motorista");
    }
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  // ✅ Editar motorista: soporta multipart (img) + nuevos campos
  // NOTA: aquí "formData" puede ser:
  // 1) Un FormData (si tu modal ya lo manda como FormData)
  // 2) Un objeto normal (si tu modal manda { name, ... , image })
  const handleSaveEdit = async (formData) => {
    if (!selectedMotorista?._id) {
      setError('No hay motorista seleccionado para actualizar');
      return;
    }

    setUploading(true);

    try {
      const url = `/motoristas/${selectedMotorista._id}`;

      // --- Caso 1: ya viene FormData ---
      if (typeof FormData !== 'undefined' && formData instanceof FormData) {
        // ✅ asegurar que envíe campos nuevos si existen (por si tu modal no los añadió)
        // (Si ya están, append duplicará, así que solo "set" si existe)
        // FormData no tiene set en todos los navegadores viejos, pero en modern sí.
        // Lo dejamos simple: no tocar si ya lo estás manejando en el modal.

        const response = await api.put(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000
        });

        const serverMotorista =
          response.data?.data?.motorista ||
          response.data?.motorista ||
          response.data?.data ||
          response.data;

        const normalizedFromServer = normalizeMotorista(serverMotorista, 0);

        const merged = normalizeMotorista(
          { ...selectedMotorista, ...normalizedFromServer, _id: selectedMotorista._id },
          0
        );

        setMotoristas(prev =>
          Array.isArray(prev) ? prev.map(m => (m._id === selectedMotorista._id ? merged : m)) : [merged]
        );
        setSelectedMotorista(merged);

        setShowEditAlert(false);
        setSuccessType('edit');
        setShowSuccessAlert(true);
        return;
      }

      // --- Caso 2: viene objeto normal ---
      // Espera keys: name,lastName,phone,address,password,circulationCard,planillaTipo,salario,image/img
      const imgFile = formData?.image || formData?.img;

      // si hay imagen => multipart
      if (imgFile) {
        const submitData = new FormData();

        const appendIf = (key, val) => {
          if (val === undefined || val === null) return;
          const s = typeof val === 'string' ? val.trim() : val;
          if (typeof s === 'string' && s === '') return;
          submitData.append(key, s);
        };

        appendIf('name', formData?.name);
        appendIf('lastName', formData?.lastName);
        appendIf('phone', formData?.phone);
        appendIf('address', formData?.address);
        appendIf('password', formData?.password);
        appendIf('circulationCard', formData?.circulationCard);

        // ✅ NUEVOS CAMPOS
        appendIf('planillaTipo', formData?.planillaTipo);
        if (String(formData?.salario ?? '').trim() !== '') {
          submitData.append('salario', String(Number(formData.salario)));
        }

        submitData.append('img', imgFile);

        const response = await api.put(url, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000
        });

        const serverMotorista =
          response.data?.data?.motorista ||
          response.data?.motorista ||
          response.data?.data ||
          response.data;

        const normalizedFromServer = normalizeMotorista(serverMotorista, 0);

        const merged = normalizeMotorista(
          { ...selectedMotorista, ...normalizedFromServer, _id: selectedMotorista._id },
          0
        );

        setMotoristas(prev =>
          Array.isArray(prev) ? prev.map(m => (m._id === selectedMotorista._id ? merged : m)) : [merged]
        );
        setSelectedMotorista(merged);

        setShowEditAlert(false);
        setSuccessType('edit');
        setShowSuccessAlert(true);
        return;
      }

      // sin imagen => JSON
      const updateData = {};

      const setIf = (key, val) => {
        if (val === undefined || val === null) return;
        if (typeof val === 'string') {
          const t = val.trim();
          if (!t) return;
          updateData[key] = t;
        } else {
          updateData[key] = val;
        }
      };

      setIf('name', formData?.name);
      setIf('lastName', formData?.lastName);
      setIf('phone', formData?.phone);
      setIf('address', formData?.address);
      setIf('password', formData?.password);
      setIf('circulationCard', formData?.circulationCard);

      // ✅ NUEVOS CAMPOS
      setIf('planillaTipo', formData?.planillaTipo);
      if (String(formData?.salario ?? '').trim() !== '') {
        updateData.salario = Number(formData.salario);
      }

      if (Object.keys(updateData).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      const response = await api.put(url, updateData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      const serverMotorista =
        response.data?.data?.motorista ||
        response.data?.motorista ||
        response.data?.data ||
        response.data;

      const normalizedFromServer = normalizeMotorista(serverMotorista, 0);

      const merged = normalizeMotorista(
        { ...selectedMotorista, ...normalizedFromServer, ...updateData, _id: selectedMotorista._id },
        0
      );

      setMotoristas(prev =>
        Array.isArray(prev) ? prev.map(m => (m._id === selectedMotorista._id ? merged : m)) : [merged]
      );
      setSelectedMotorista(merged);

      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
    } catch (err) {
      console.error('Error al actualizar motorista:', err);

      if (err?.response) {
        const msg = err.response.data?.message || 'Error del servidor';
        setError(`Error: ${msg}`);
      } else {
        setError(`Error: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Cerrar modales
  const closeAlert = () => setShowAlert(false);
  const closeSuccessAlert = () => setShowSuccessAlert(false);
  const closeEditAlert = () => setShowEditAlert(false);

  // Seleccionar motorista
  const selectMotorista = (motorista) => {
    if (!motorista?._id) {
      setError('Motorista inválido seleccionado');
      return;
    }
    setSelectedMotorista(motorista);
    setShowDetailView(true);
  };

  // Cerrar vista detalle
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedMotorista(null);
  };

  // Refrescar datos
  const handleRefresh = async () => {
    await fetchMotoristas();
  };

  // ✅ (Opcional) ordenamiento real con sortBy
  const sortedMotoristas = useMemo(() => {
    const list = Array.isArray(filterMotoristas) ? [...filterMotoristas] : [];
    if (sortBy === 'Newest') {
      return list.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));
    }
    if (sortBy === 'Oldest') {
      return list.sort((a, b) => (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0)));
    }
    if (sortBy === 'A-Z') {
      return list.sort((a, b) => `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`));
    }
    if (sortBy === 'Z-A') {
      return list.sort((a, b) => `${b.name} ${b.lastName}`.localeCompare(`${a.name} ${a.lastName}`));
    }
    return list;
  }, [filterMotoristas, sortBy]);

  return {
    // Estados
    motoristas,
    selectedMotorista,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    uploading,

    // listas
    filterMotoristas: sortedMotoristas,

    // Setters
    setSearchTerm,
    setSortBy,
    setError,

    // Funciones
    fetchMotoristas,
    handleContinue,
    handleOptionsClick,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleSaveEdit,
    closeAlert,
    closeSuccessAlert,
    closeEditAlert,
    selectMotorista,
    closeDetailView,
    handleRefresh,
    isLicenseValid
  };
};

export default useDataMotorista;
