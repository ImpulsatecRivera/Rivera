import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const viajeSchema = new Schema({
  quoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cotizaciones',
    required: true
  },
  
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  truckId: {
    type: Schema.Types.ObjectId,
    ref: 'Camiones',
    required: true
  },
  
  // ⏰ HORARIOS MEJORADOS PARA AUTO-ACTUALIZACIÓN
  departureTime: {
    type: Date,
    required: true
  },
  
  arrivalTime: {
    type: Date,
    required: true
  },
  
  // 🆕 TIEMPOS ADICIONALES PARA CONTROL
  horarios: {
    salidaReal: Date,           // Cuando realmente salió
    llegadaEstimada: Date,      // Estimación actualizada en tiempo real
    llegadaReal: Date,          // Cuando realmente llegó
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    }
  },
  
  ruta: {
    origen: {
      nombre: {
        type: String,
        required: true
      },
      coordenadas: {
        lat: {
          type: Number,
          required: true,
          min: -90,
          max: 90
        },
        lng: {
          type: Number,
          required: true,
          min: -180,
          max: 180
        }
      },
      // 🆕 TIPO DE UBICACIÓN PARA FRONTEND
      tipo: {
        type: String,
        enum: ['terminal', 'ciudad', 'puerto', 'bodega', 'cliente'],
        default: 'ciudad'
      }
    },
    destino: {
      nombre: {
        type: String,
        required: true
      },
      coordenadas: {
        lat: {
          type: Number,
          required: true,
          min: -90,
          max: 90
        },
        lng: {
          type: Number,
          required: true,
          min: -180,
          max: 180
        }
      },
      // 🆕 TIPO DE UBICACIÓN PARA FRONTEND
      tipo: {
        type: String,
        enum: ['terminal', 'ciudad', 'puerto', 'bodega', 'cliente'],
        default: 'ciudad'
      }
    },
    
    // 📊 DATOS CALCULADOS AUTOMÁTICAMENTE
    distanciaTotal: {
      type: Number,
      min: 0
    },
    tiempoEstimado: {
      type: Number, // en minutos
      min: 0
    },
    
    // 🛣️ RUTA DETALLADA OPCIONAL (para GPS avanzado)
    rutaOptimizada: {
      type: [[Number]],
      select: false // No incluir por defecto en queries
    }
  },
  
  // 📊 ESTADO CON AUTO-ACTUALIZACIÓN MEJORADO
  estado: {
    actual: {
      type: String,
      enum: ['pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado'],
      default: 'pendiente'
    },
    fechaCambio: {
      type: Date,
      default: Date.now
    },
    
    // 🔄 CONFIGURACIÓN PARA AUTO-UPDATE
    autoActualizar: {
      type: Boolean,
      default: true
    },
    
    // 📋 HISTORIAL DE CAMBIOS
    historial: [{
      estadoAnterior: String,
      estadoNuevo: String,
      fecha: {
        type: Date,
        default: Date.now
      },
      motivo: String // 'automatico', 'manual', 'gps', etc.
    }]
  },
  
  // 📍 TRACKING MEJORADO
  tracking: {
    ubicacionActual: {
      lat: Number,
      lng: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      velocidad: {
        type: Number,
        min: 0
      },
      direccion: {
        type: Number,
        min: 0,
        max: 360
      }
    },
    
    // 📈 PROGRESO CALCULADO AUTOMÁTICAMENTE
    progreso: {
      porcentaje: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      ultimaActualizacion: {
        type: Date,
        default: Date.now
      },
      calculoAutomatico: {
        type: Boolean,
        default: true
      }
    },
    
    // 🕒 HISTORIAL COMPACTO DE UBICACIONES
    historialUbicaciones: {
      type: [{
        lat: Number,
        lng: Number,
        timestamp: Date,
        velocidad: Number
      }],
      select: false, // No incluir por defecto
      validate: {
        validator: function(array) {
          return array.length <= 100; // Máximo 100 puntos
        },
        message: 'Máximo 100 puntos de historial permitidos'
      }
    }
  },
  
  // 📦 CARGA MEJORADA
  // 📦 ESQUEMA DE CARGA MEJORADO PARA TU MODELO DE VIAJES

// Reemplaza tu sección "carga" actual con esto:
carga: {
  // 🏷️ CATEGORÍA PRINCIPAL
  categoria: {
    type: String,
    enum: [
      'alimentos_perecederos',     // Frutas, verduras, carnes, lácteos
      'alimentos_no_perecederos',  // Granos, enlatados, secos
      'bebidas',                   // Agua, refrescos, alcohol
      'materiales_construccion',   // Cemento, hierro, madera
      'textiles',                  // Ropa, telas, zapatos
      'electronicos',              // Computadoras, celulares, electrodomésticos
      'medicamentos',              // Farmacéuticos, equipos médicos
      'maquinaria',               // Equipos industriales, herramientas
      'vehiculos',                // Carros, motos, repuestos
      'quimicos',                 // Productos químicos, pinturas
      'combustibles',             // Gasolina, diesel, gas
      'papel_carton',             // Documentos, empaques, libros
      'muebles',                  // Escritorios, sillas, electrodomésticos
      'productos_agricolas',      // Semillas, fertilizantes, pesticidas
      'metales',                  // Acero, aluminio, cobre
      'plasticos',                // Productos plásticos, empaques
      'vidrio_ceramica',          // Botellas, vajillas, ventanas
      'productos_limpieza',       // Detergentes, desinfectantes
      'cosmeticos',               // Maquillaje, perfumes, cuidado personal
      'juguetes',                 // Juguetes, artículos deportivos
      'otros'                     // Para casos especiales
    ],
    required: true,
    default: 'otros'
  },

  // 🎯 SUBCATEGORÍA ESPECÍFICA (permite más detalle)
  subcategoria: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // 📝 DESCRIPCIÓN DETALLADA
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  // ⚖️ INFORMACIÓN DE PESO
  peso: {
    valor: {
      type: Number,
      min: 0,
      required: true
    },
    unidad: {
      type: String,
      enum: ['kg', 'ton', 'lb', 'oz'],
      default: 'kg'
    }
  },

  // 📐 INFORMACIÓN DE VOLUMEN
  volumen: {
    valor: {
      type: Number,
      min: 0
    },
    unidad: {
      type: String,
      enum: ['m3', 'ft3', 'l', 'gal'],
      default: 'm3'
    }
  },

  // 🚨 CLASIFICACIÓN DE RIESGO
  clasificacionRiesgo: {
    type: String,
    enum: [
      'normal',           // Sin riesgos especiales
      'fragil',          // Requiere cuidado especial
      'peligroso',       // Materiales peligrosos (químicos, explosivos)
      'perecedero',      // Se daña con el tiempo
      'refrigerado',     // Requiere temperatura controlada
      'congelado',       // Requiere congelación
      'inflamable',      // Riesgo de incendio
      'toxico',          // Sustancias tóxicas
      'corrosivo',       // Sustancias corrosivas
      'radioactivo',     // Materiales radioactivos
      'biologico'        // Materiales biológicos
    ],
    default: 'normal'
  },

  // 🌡️ CONDICIONES ESPECIALES DE TRANSPORTE
  condicionesEspeciales: {
    temperaturaMinima: Number,     // °C
    temperaturaMaxima: Number,     // °C
    humedadMaxima: Number,         // %
    requiereVentilacion: {
      type: Boolean,
      default: false
    },
    evitarVibración: {
      type: Boolean,
      default: false
    },
    posicionVertical: {
      type: Boolean,
      default: false
    },
    protegerDeLuz: {
      type: Boolean,
      default: false
    }
  },

  // 💰 INFORMACIÓN ECONÓMICA
  valor: {
    montoDeclarado: Number,        // Valor de la mercancía
    moneda: {
      type: String,
      enum: ['USD', 'SVC', 'EUR'],
      default: 'USD'
    },
    asegurado: {
      type: Boolean,
      default: false
    },
    numeroPoliza: String           // Si está asegurado
  },

  // 📦 INFORMACIÓN DE EMPAQUE
  empaque: {
    tipo: {
      type: String,
      enum: [
        'caja_carton',
        'caja_madera', 
        'saco',
        'contenedor',
        'pallet',
        'bolsa_plastico',
        'tanque',
        'barril',
        'otro'
      ],
      default: 'caja_carton'
    },
    cantidad: {
      type: Number,
      min: 1,
      default: 1
    },
    dimensiones: {
      largo: Number,    // cm
      ancho: Number,    // cm
      alto: Number      // cm
    }
  },

  // 📋 DOCUMENTACIÓN REQUERIDA
  documentacion: {
    facturaComercial: {
      type: Boolean,
      default: false
    },
    certificadoOrigen: {
      type: Boolean,
      default: false
    },
    permisoSanitario: {
      type: Boolean,
      default: false
    },
    licenciaImportacion: {
      type: Boolean,
      default: false
    },
    otros: [String]  // Array de otros documentos
  },

  // 🏷️ CÓDIGOS Y CLASIFICACIONES
  codigos: {
    codigoArancelario: String,     // Para aduanas
    codigoONU: String,            // Para mercancías peligrosas
    codigoInterno: String,        // Código interno de la empresa
    numeroLote: String,           // Para trazabilidad
    fechaVencimiento: Date        // Para productos perecederos
  },

  // ⚠️ INSTRUCCIONES ESPECIALES
  instruccionesEspeciales: {
    type: String,
    maxlength: 1000
  },

  // 📊 MÉTRICAS CALCULADAS (virtuales o calculadas)
  densidad: {
    type: Number,
    // Se calcula como peso/volumen
  },

  // 🚛 REQUISITOS DE VEHÍCULO
  requisitoVehiculo: {
    tipoCarroceria: {
      type: String,
      enum: [
        'carga_seca',
        'refrigerado',
        'tanque',
        'plataforma',
        'tolva',
        'contenedor'
      ]
    },
    capacidadMinima: Number,      // Toneladas
    equipoEspecial: [String]      // ['grúa', 'rampa', 'bomba']
  }
},

// 📊 EJEMPLOS DE DATOS REALISTAS:

/* 
🍎 EJEMPLO 1: Alimentos perecederos
{
  categoria: 'alimentos_perecederos',
  subcategoria: 'frutas frescas',
  descripcion: 'Manzanas rojas gala para exportación',
  peso: { valor: 1500, unidad: 'kg' },
  volumen: { valor: 3.2, unidad: 'm3' },
  clasificacionRiesgo: 'perecedero',
  condicionesEspeciales: {
    temperaturaMinima: 2,
    temperaturaMaxima: 8,
    requiereVentilacion: true
  },
  valor: {
    montoDeclarado: 2500,
    moneda: 'USD',
    asegurado: true
  },
  empaque: {
    tipo: 'caja_carton',
    cantidad: 150
  },
  codigos: {
    fechaVencimiento: new Date('2025-09-15')
  }
}

💊 EJEMPLO 2: Medicamentos
{
  categoria: 'medicamentos',
  subcategoria: 'antibióticos',
  descripcion: 'Amoxicilina 500mg - 10,000 tabletas',
  peso: { valor: 25, unidad: 'kg' },
  clasificacionRiesgo: 'normal',
  condicionesEspeciales: {
    temperaturaMaxima: 25,
    protegerDeLuz: true
  },
  documentacion: {
    permisoSanitario: true,
    licenciaImportacion: true
  },
  valor: {
    montoDeclarado: 15000,
    asegurado: true,
    numeroPoliza: 'POL-2025-001'
  }
}

🏗️ EJEMPLO 3: Materiales de construcción
{
  categoria: 'materiales_construccion',
  subcategoria: 'cemento',
  descripcion: 'Cemento Portland gris - 200 sacos de 50kg',
  peso: { valor: 10000, unidad: 'kg' },
  clasificacionRiesgo: 'normal',
  empaque: {
    tipo: 'saco',
    cantidad: 200
  },
  requisitoVehiculo: {
    tipoCarroceria: 'carga_seca',
    capacidadMinima: 12
  }
}
*/
  
  // 👤 CONDUCTOR
  conductor: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Motorista',
      required: true
    },
    nombre: String,    // Backup si no se puede hacer populate
    telefono: String   // Backup si no se puede hacer populate
  },
  
  // 💰 INFORMACIÓN FINANCIERA OPCIONAL
  costos: {
    combustible: {
      type: Number,
      default: 0
    },
    peajes: {
      type: Number,
      default: 0
    },
    otros: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  
  // 🚨 ALERTAS Y NOTIFICACIONES
  alertas: [{
    tipo: {
      type: String,
      enum: ['retraso', 'desviacion', 'emergencia', 'mantenimiento', 'llegada', 'salida']
    },
    mensaje: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    resuelta: {
      type: Boolean,
      default: false
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'critica'],
      default: 'media'
    }
  }],
  
  // 🌡️ CONDICIONES ESPECIALES
  condiciones: {
    clima: String,              // 'soleado', 'lluvia', 'tormenta'
    trafico: String,            // 'normal', 'pesado', 'congestion'
    carretera: String,          // 'buena', 'regular', 'mala'
    observaciones: String
  }
  
}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Viajes"
});

// 🔄 MIDDLEWARE PRE-SAVE PARA AUTO-ACTUALIZACIÓN
viajeSchema.pre('save', function(next) {
  const ahora = new Date();
  
  // Solo auto-actualizar si está habilitado
  if (this.estado.autoActualizar) {
    const estadoAnterior = this.estado.actual;
    
    // 🚀 AUTO-INICIAR VIAJES (si ya pasó la hora de salida)
    if (this.estado.actual === 'pendiente' && this.departureTime <= ahora) {
      this.estado.actual = 'en_curso';
      this.estado.fechaCambio = ahora;
      this.horarios.salidaReal = this.horarios.salidaReal || ahora;
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_curso',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`🚀 Viaje ${this._id} iniciado automáticamente`);
    }
    
    // ✅ AUTO-COMPLETAR VIAJES (si ya pasó la hora de llegada Y progreso >= 95%)
    if (this.estado.actual === 'en_curso' && 
        this.arrivalTime <= ahora && 
        this.tracking.progreso.porcentaje >= 95) {
      
      this.estado.actual = 'completado';
      this.estado.fechaCambio = ahora;
      this.horarios.llegadaReal = ahora;
      this.tracking.progreso.porcentaje = 100;
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'completado',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`✅ Viaje ${this._id} completado automáticamente`);
    }
    
    // ⚠️ AUTO-MARCAR RETRASOS (si pasó 30 min de la hora de llegada y progreso < 95%)
    if (this.estado.actual === 'en_curso' && 
        this.arrivalTime <= new Date(ahora.getTime() - 30 * 60000) && // 30 min de gracia
        this.tracking.progreso.porcentaje < 95) {
      
      this.estado.actual = 'retrasado';
      this.estado.fechaCambio = ahora;
      
      // Agregar alerta de retraso
      this.alertas.push({
        tipo: 'retraso',
        mensaje: `Viaje retrasado - Programado para ${this.arrivalTime.toLocaleString()}`,
        fecha: ahora,
        prioridad: 'alta'
      });
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'retrasado',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`⚠️ Viaje ${this._id} marcado como retrasado`);
    }
  }
  
  // 🕐 Actualizar timestamp de horarios
  this.horarios.ultimaActualizacion = ahora;
  
  next();
});

// 📊 MÉTODOS VIRTUALES
viajeSchema.virtual('duracionProgramada').get(function() {
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60)); // en minutos
});

viajeSchema.virtual('duracionReal').get(function() {
  if (this.horarios.salidaReal && this.horarios.llegadaReal) {
    return Math.floor((this.horarios.llegadaReal - this.horarios.salidaReal) / (1000 * 60));
  }
  return null;
});

viajeSchema.virtual('retrasoEnMinutos').get(function() {
  if (this.horarios.llegadaReal && this.arrivalTime) {
    return Math.floor((this.horarios.llegadaReal - this.arrivalTime) / (1000 * 60));
  }
  return null;
});

viajeSchema.virtual('estadoColor').get(function() {
  const colores = {
    'pendiente': 'yellow',
    'en_curso': 'blue', 
    'completado': 'green',
    'retrasado': 'orange',
    'cancelado': 'red'
  };
  return colores[this.estado.actual] || 'gray';
});

// 🔍 ÍNDICES PARA PERFORMANCE
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ arrivalTime: 1 });
viajeSchema.index({ 'ruta.origen.nombre': 1 });
viajeSchema.index({ 'ruta.destino.nombre': 1 });
viajeSchema.index({ 'tracking.ubicacionActual.timestamp': 1 });
viajeSchema.index({ createdAt: 1 });

// 📱 MÉTODO ESTÁTICO PARA DATOS DEL MAPA
viajeSchema.statics.getMapData = async function() {
  return this.find({ 
    'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] } 
  })
  .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
  .populate('conductor.id', 'nombre telefono')
  .select('-tracking.historialUbicaciones -ruta.rutaOptimizada') // Excluir datos pesados
  .sort({ departureTime: 1 })
  .lean();
};

// 🔄 MÉTODO PARA ACTUALIZAR PROGRESO
viajeSchema.methods.actualizarProgreso = function() {
  if (this.tracking.calculoAutomatico && 
      this.tracking.ubicacionActual.lat && 
      this.tracking.ubicacionActual.lng) {
    
    const ahora = new Date();
    const tiempoTranscurrido = ahora - (this.horarios.salidaReal || this.departureTime);
    const tiempoTotal = this.arrivalTime - this.departureTime;
    
    // Calcular progreso basado en tiempo (simplificado)
    let progresoTemporal = Math.min(95, (tiempoTranscurrido / tiempoTotal) * 100);
    
    // Asegurar que no retroceda
    this.tracking.progreso.porcentaje = Math.max(
      this.tracking.progreso.porcentaje, 
      Math.max(0, progresoTemporal)
    );
    
    this.tracking.progreso.ultimaActualizacion = ahora;
    
    console.log(`📈 Progreso actualizado para viaje ${this._id}: ${this.tracking.progreso.porcentaje}%`);
  }
};

// 📍 MÉTODO PARA AGREGAR UBICACIÓN AL HISTORIAL
viajeSchema.methods.agregarUbicacion = function(lat, lng, velocidad = 0) {
  // Agregar ubicación actual
  this.tracking.ubicacionActual = {
    lat,
    lng,
    timestamp: new Date(),
    velocidad,
    direccion: this.tracking.ubicacionActual.direccion || 0
  };
  
  // Agregar al historial (mantener solo últimas 50 ubicaciones)
  if (!this.tracking.historialUbicaciones) {
    this.tracking.historialUbicaciones = [];
  }
  
  this.tracking.historialUbicaciones.push({
    lat,
    lng,
    timestamp: new Date(),
    velocidad
  });
  
  // Mantener solo las últimas 50 ubicaciones
  if (this.tracking.historialUbicaciones.length > 50) {
    this.tracking.historialUbicaciones = this.tracking.historialUbicaciones.slice(-50);
  }
  
  // Actualizar progreso automáticamente
  this.actualizarProgreso();
};

export default model("Viajes", viajeSchema);