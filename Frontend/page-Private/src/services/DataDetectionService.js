// src/services/DataDetectionService.js
import axios from 'axios';

class DataDetectionService {
  constructor() {
    this.cache = {};
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Verificar si hay datos en un módulo
  async hasData(moduleName, endpoint) {
    const cacheKey = `data_${moduleName}`;
    
    // Usar caché si está disponible
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.cacheTimeout) {
      return this.cache[cacheKey].value;
    }

    try {
      const { data } = await axios.get(endpoint);
      
      // Detectar si hay datos (array con elementos o propiedad count > 0)
      const hasData = Array.isArray(data) 
        ? data.length > 0 
        : (data.data?.length > 0 || data.count > 0 || data.total > 0);
      
      // Guardar en caché
      this.cache[cacheKey] = {
        value: hasData,
        timestamp: Date.now()
      };

      return hasData;
    } catch (error) {
      console.error(`Error verificando datos de ${moduleName}:`, error);
      return true; // Si hay error, asumir que hay datos (no molestar al usuario)
    }
  }

  // Verificar múltiples módulos a la vez
  async hasAnyData(modules) {
    const checks = await Promise.all(
      Object.entries(modules).map(async ([name, endpoint]) => {
        const hasData = await this.hasData(name, endpoint);
        return { name, hasData };
      })
    );

    return checks.some(check => check.hasData);
  }

  // Limpiar caché
  clearCache() {
    this.cache = {};
  }

  // Limpiar caché de un módulo específico
  clearModuleCache(moduleName) {
    delete this.cache[`data_${moduleName}`];
  }
}

export default new DataDetectionService();