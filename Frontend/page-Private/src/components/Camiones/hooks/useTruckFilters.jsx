import { useState, useMemo, useCallback } from 'react';

const useTruckFilters = (trucks) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Función para normalizar términos de búsqueda
  const normalizeSearchTerm = useCallback((term) => {
    return term.toLowerCase().trim().replace(/\s+/g, ' ');
  }, []);

  // Filtrar camiones con memoización para optimización
  const filteredTrucks = useMemo(() => {
    if (!Array.isArray(trucks)) return [];

    return trucks.filter(truck => {
      // Filtro de búsqueda
      const normalizedSearch = normalizeSearchTerm(searchTerm);
      let matchesSearch = true;

      if (normalizedSearch) {
        const searchFields = [
          truck.name || '',
          truck.licensePlate || '',
          truck.brand || '',
          truck.model || '',
          truck.description || '',
          // Combinaciones comunes
          `${truck.brand} ${truck.model}`.trim(),
          `${truck.name} ${truck.licensePlate}`.trim()
        ];

        matchesSearch = searchFields.some(field => 
          normalizeSearchTerm(field).includes(normalizedSearch)
        );
      }

      // Filtro de estado
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const truckState = truck.state?.toLowerCase().replace(/\s+/g, '_') || 'sin_estado';
        matchesStatus = truckState === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [trucks, searchTerm, statusFilter, normalizeSearchTerm]);

  // Contar camiones por estado con memoización
  const statusCounts = useMemo(() => {
    if (!Array.isArray(trucks)) {
      return {
        all: 0,
        disponible: 0,
        en_ruta: 0,
        mantenimiento: 0,
        no_disponible: 0,
        sin_estado: 0
      };
    }

    const counts = trucks.reduce((acc, truck) => {
      const state = truck.state?.toLowerCase() || 'sin estado';
      
      acc.all += 1;
      
      switch (state) {
        case 'disponible':
          acc.disponible += 1;
          break;
        case 'en ruta':
          acc.en_ruta += 1;
          break;
        case 'mantenimiento':
          acc.mantenimiento += 1;
          break;
        case 'no disponible':
          acc.no_disponible += 1;
          break;
        case 'sin estado':
        default:
          acc.sin_estado += 1;
          break;
      }
      
      return acc;
    }, {
      all: 0,
      disponible: 0,
      en_ruta: 0,
      mantenimiento: 0,
      no_disponible: 0,
      sin_estado: 0
    });

    return counts;
  }, [trucks]);

  // Funciones helper para colores de estado
  const getStatusColor = useCallback((status) => {
    if (!status || status.trim() === '') {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
    
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'NO DISPONIBLE':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MANTENIMIENTO':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'EN RUTA':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'SIN ESTADO':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getDotColor = useCallback((status) => {
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
  }, []);

  // Funciones de manipulación de filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
  }, []);

  const resetToDefaults = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setViewMode('grid');
  }, []);

  // Función para establecer filtro por estado
  const setStatusFilterSafe = useCallback((status) => {
    const validStatuses = ['all', 'disponible', 'en_ruta', 'mantenimiento', 'no_disponible', 'sin_estado'];
    if (validStatuses.includes(status)) {
      setStatusFilter(status);
    } else {
      console.warn(`Estado de filtro inválido: ${status}`);
      setStatusFilter('all');
    }
  }, []);

  // Función para búsqueda debounced (opcional)
  const setSearchTermDebounced = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Información de estado actual de filtros
  const filterInfo = useMemo(() => {
    const hasActiveFilters = searchTerm.trim() !== '' || statusFilter !== 'all';
    const showingFilteredResults = hasActiveFilters && filteredTrucks.length !== trucks.length;
    
    return {
      hasActiveFilters,
      showingFilteredResults,
      totalTrucks: trucks.length,
      filteredCount: filteredTrucks.length,
      hiddenCount: trucks.length - filteredTrucks.length
    };
  }, [searchTerm, statusFilter, filteredTrucks.length, trucks.length]);

  // Estados derivados útiles
  const isEmpty = filteredTrucks.length === 0;
  const hasResults = filteredTrucks.length > 0;
  const isSearchActive = searchTerm.trim() !== '';
  const isFilterActive = statusFilter !== 'all';

  return {
    // Estados principales
    searchTerm,
    statusFilter,
    viewMode,
    
    // Setters principales
    setSearchTerm: setSearchTermDebounced,
    setStatusFilter: setStatusFilterSafe,
    setViewMode,
    
    // Datos filtrados
    filteredTrucks,
    statusCounts,
    
    // Funciones de color
    getStatusColor,
    getDotColor,
    
    // Funciones de utilidad
    clearFilters,
    resetToDefaults,
    normalizeSearchTerm,
    
    // Información de estado
    filterInfo,
    isEmpty,
    hasResults,
    isSearchActive,
    isFilterActive,
    
    // Estadísticas útiles
    totalCount: trucks.length,
    filteredCount: filteredTrucks.length,
    hasActiveFilters: filterInfo.hasActiveFilters
  };
};

export default useTruckFilters;