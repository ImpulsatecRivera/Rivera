// src/hooks/useFleetMetrics.js

import { useMemo } from 'react';

/**
 * Hook para calcular métricas de mantenimiento de un camión
 * @param {Array} mantenimientos - Array de mantenimientos del camión
 * @returns {Object} Métricas calculadas
 */
export const useFleetMetrics = (mantenimientos = []) => {
  
  const metrics = useMemo(() => {
    if (!mantenimientos || mantenimientos.length === 0) {
      return {
        totalMantenimientos: 0,
        costoTotal: 0,
        costoPromedio: 0,
        diasPromedioEntreManto: 0,
        ultimoMantenimiento: null,
        healthScore: 'unknown',
        alertas: [],
        mantenimientosPorTipo: {},
        tendenciaCostos: 'estable',
        diasDesdeUltimoManto: null
      };
    }

    // Ordenar por fecha (más reciente primero)
    const sortedMantenimientos = [...mantenimientos].sort(
      (a, b) => new Date(b.fecha_mantenimiento) - new Date(a.fecha_mantenimiento)
    );

    // 1. Total de mantenimientos
    const totalMantenimientos = mantenimientos.length;

    // 2. Costo total y promedio
    const costoTotal = mantenimientos.reduce((sum, mant) => {
      const total = mant.detalles?.reduce((detSum, det) => detSum + (det.subTotal || 0), 0) || 0;
      return sum + total;
    }, 0);
    const costoPromedio = totalMantenimientos > 0 ? costoTotal / totalMantenimientos : 0;

    // 3. Último mantenimiento
    const ultimoMantenimiento = sortedMantenimientos[0];

    // 4. Días desde último mantenimiento
    const diasDesdeUltimoManto = ultimoMantenimiento 
      ? Math.floor((new Date() - new Date(ultimoMantenimiento.fecha_mantenimiento)) / (1000 * 60 * 60 * 24))
      : null;

    // 5. Días promedio entre mantenimientos
    let diasPromedioEntreManto = 0;
    if (sortedMantenimientos.length > 1) {
      const intervalos = [];
      for (let i = 0; i < sortedMantenimientos.length - 1; i++) {
        const dias = Math.floor(
          (new Date(sortedMantenimientos[i].fecha_mantenimiento) - 
           new Date(sortedMantenimientos[i + 1].fecha_mantenimiento)) / (1000 * 60 * 60 * 24)
        );
        intervalos.push(dias);
      }
      diasPromedioEntreManto = Math.round(
        intervalos.reduce((sum, dias) => sum + dias, 0) / intervalos.length
      );
    }

    // 6. Mantenimientos por tipo
    const mantenimientosPorTipo = mantenimientos.reduce((acc, mant) => {
      const tipo = mant.tipo_de_mantenimiento || 'otros';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    // 7. Health Score (basado en días sin mantenimiento)
    let healthScore = 'good';
    if (diasDesdeUltimoManto === null) {
      healthScore = 'unknown';
    } else if (diasDesdeUltimoManto > 60) {
      healthScore = 'critical';
    } else if (diasDesdeUltimoManto > 30) {
      healthScore = 'warning';
    }

    // 8. Alertas
    const alertas = [];
    if (diasDesdeUltimoManto > 60) {
      alertas.push(`Más de 60 días sin mantenimiento (${diasDesdeUltimoManto} días)`);
    } else if (diasDesdeUltimoManto > 30) {
      alertas.push(`Más de 30 días sin mantenimiento (${diasDesdeUltimoManto} días)`);
    }

    // Detectar mantenimientos pendientes
    const pendientes = mantenimientos.filter(m => m.estado === 'pendiente').length;
    if (pendientes > 0) {
      alertas.push(`${pendientes} mantenimiento${pendientes > 1 ? 's' : ''} pendiente${pendientes > 1 ? 's' : ''}`);
    }

    // Detectar mantenimientos en proceso
    const enProceso = mantenimientos.filter(m => m.estado === 'en_proceso').length;
    if (enProceso > 0) {
      alertas.push(`${enProceso} mantenimiento${enProceso > 1 ? 's' : ''} en proceso`);
    }

    // 9. Tendencia de costos (últimos 3 vs primeros 3)
    let tendenciaCostos = 'estable';
    if (sortedMantenimientos.length >= 6) {
      const ultimos3 = sortedMantenimientos.slice(0, 3);
      const primeros3 = sortedMantenimientos.slice(-3);
      
      const promedioRecientes = ultimos3.reduce((sum, m) => {
        const total = m.detalles?.reduce((s, d) => s + (d.subTotal || 0), 0) || 0;
        return sum + total;
      }, 0) / 3;

      const promedioAntiguos = primeros3.reduce((sum, m) => {
        const total = m.detalles?.reduce((s, d) => s + (d.subTotal || 0), 0) || 0;
        return sum + total;
      }, 0) / 3;

      if (promedioRecientes > promedioAntiguos * 1.2) {
        tendenciaCostos = 'incrementando';
      } else if (promedioRecientes < promedioAntiguos * 0.8) {
        tendenciaCostos = 'disminuyendo';
      }
    }

    return {
      totalMantenimientos,
      costoTotal,
      costoPromedio,
      diasPromedioEntreManto,
      ultimoMantenimiento,
      healthScore,
      alertas,
      mantenimientosPorTipo,
      tendenciaCostos,
      diasDesdeUltimoManto
    };

  }, [mantenimientos]);

  return metrics;
};

/**
 * Hook para agrupar mantenimientos por camión
 * @param {Array} mantenimientos - Array de todos los mantenimientos
 * @returns {Array} Array de objetos { truck, mantenimientos, metrics }
 */
export const useGroupByTruck = (mantenimientos = []) => {
  
  const fleetData = useMemo(() => {
    if (!mantenimientos || mantenimientos.length === 0) return [];

    // Agrupar por camión
    const grouped = mantenimientos.reduce((acc, mant) => {
      const truckId = mant.ciculatioCard?._id;
      
      if (!truckId) return acc; // Ignorar mantenimientos sin camión

      if (!acc[truckId]) {
        acc[truckId] = {
          truck: mant.ciculatioCard,
          mantenimientos: []
        };
      }
      
      acc[truckId].mantenimientos.push(mant);
      return acc;
    }, {});

    // Convertir a array y calcular métricas para cada camión
    return Object.values(grouped).map(data => ({
      ...data,
      // Las métricas se calcularán con el hook useFleetMetrics en cada componente
    }));

  }, [mantenimientos]);

  return fleetData;
};

/**
 * Función helper para obtener configuración de health score
 * @param {string} healthScore - 'good' | 'warning' | 'critical' | 'unknown'
 * @returns {Object} Configuración de estilo y label
 */
export const getHealthConfig = (healthScore) => {
  const configs = {
    good: {
      label: 'Buen Estado',
      icon: '●●●',
      color: 'text-[#5D9646]',
      bg: 'bg-[#5D9646] bg-opacity-20',
      border: 'border-[#5D9646]'
    },
    warning: {
      label: 'Atención',
      icon: '●●○',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-400'
    },
    critical: {
      label: 'Crítico',
      icon: '●○○',
      color: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-400'
    },
    unknown: {
      label: 'Sin Datos',
      icon: '○○○',
      color: 'text-gray-400',
      bg: 'bg-gray-100',
      border: 'border-gray-300'
    }
  };

  return configs[healthScore] || configs.unknown;
};