/**
 * Esquema de Mongoose para la colección de Clientes
 * Define la estructura y validaciones de los documentos de clientes en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Clientes
 * Contiene toda la información personal y de contacto de los clientes del sistema
 */
const clienteSchema = new Schema({
  // =====================================================
  // 🆕 TIPO DE CLIENTE
  // =====================================================
  tipoCliente: {
    type: String,
    enum: ['natural', 'corporativo'],
    default: 'natural',
    required: true
  },
  
  // =====================================================
  // 🆕 INFORMACIÓN CORPORATIVA (para clientes operativos)
  // =====================================================
  // Nombre de la empresa/cliente corporativo
  nombreEmpresa: {
    type: String,
    trim: true,
    uppercase: true,
    required: function() {
      return this.tipoCliente === 'corporativo';
    }
  },
  
  // Nombre comercial o alias (como aparece en la pizarra)
  nombreComercial: {
    type: String,
    trim: true,
    uppercase: true
    // Ej: "DIANA", "CALLEJA", "TAPASCO/SARAN"
  },
  
  // RUC/NIT de la empresa
  ruc: {
    type: String,
    trim: true,
    required: function() {
      return this.tipoCliente === 'corporativo';
    }
  },
  
  // Giro del negocio
  giroNegocio: {
    type: String,
    trim: true
    // Ej: "TRANSPORTE", "DISTRIBUCIÓN", "MANUFACTURA"
  },
  
  // Persona de contacto en la empresa
  contactoPrincipal: {
    nombre: String,
    cargo: String,
    telefono: String,
    email: String
  },
  
  // Contactos adicionales
  contactosAdicionales: [{
    nombre: String,
    cargo: String,
    telefono: String,
    email: String,
    departamento: String
  }],
  
  // Dirección de facturación (para corporativos)
  direccionFacturacion: {
    type: String,
    trim: true
  },
  
  // Términos de pago acordados
  terminosPago: {
    type: String,
    enum: ['contado', 'credito_7', 'credito_15', 'credito_30', 'credito_60', 'otros'],
    default: 'contado'
  },
  
  // Límite de crédito (si aplica)
  limiteCredito: {
    type: Number,
    default: 0
  },
  
  // Estado del cliente corporativo
  estadoCorporativo: {
    type: String,
    enum: ['activo', 'inactivo', 'suspendido', 'prospecto'],
    default: 'activo'
  },
  
  // =====================================================
  // 🔥 RUTAS FRECUENTES ACTUALIZADO
  // =====================================================
  rutasFrecuentes: [{
    origen: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    destino: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    distancia: {
      type: Number,
      min: 0,
      default: 0
    },
    tiempoEstimado: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Permitir null/undefined
          return /^([0-9]{1,2}):([0-5][0-9])$/.test(v);
        },
        message: 'Formato de tiempo inválido. Use HH:MM (ejemplo: 02:30)'
      }
    },
    vecesUsada: {
      type: Number,
      default: 0,
      min: 0
    },
    ultimoUso: {
      type: Date
    },
    montoPromedio: {
      type: Number,
      min: 0,
      default: 0
    },
    frecuencia: {
      type: String,
      enum: ['diario', 'semanal', 'quincenal', 'mensual', 'esporadico'],
      default: 'esporadico'
    }
  }],
  
  // Notas internas sobre el cliente corporativo
  notasInternas: {
    type: String,
    trim: true
  },
  
  // =====================================================
  // INFORMACIÓN PERSONAL BÁSICA (para clientes naturales)
  // =====================================================
  firstName: {
    type: String,
    required: function() {
      return this.tipoCliente === 'natural';
    },
    trim: true
  },
  
  lastName: {
    type: String,
    required: function() {
      return this.tipoCliente === 'natural';
    },
    trim: true
  },
  
  // =====================================================
  // INFORMACIÓN DE CONTACTO Y ACCESO (ambos tipos)
  // =====================================================
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // =====================================================
  // INFORMACIÓN DE GOOGLE OAUTH (solo clientes naturales)
  // =====================================================
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true
  },
  
  profilePicture: { 
    type: String 
  },
  
  isGoogleUser: { 
    type: Boolean, 
    default: false
  },
  
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  
  phoneVerified: { 
    type: Boolean, 
    default: false 
  },
  
  phoneVerifiedAt: { 
    type: Date 
  },
  
  // =====================================================
  // INFORMACIÓN DE IDENTIFICACIÓN (clientes naturales)
  // =====================================================
  idNumber: {
    type: String,
    required: function() {
      return this.tipoCliente === 'natural' && !this.isGoogleUser;
    },
    trim: true
  },
  
  birthDate: {
    type: Date,
    required: function() {
      return this.tipoCliente === 'natural' && !this.isGoogleUser;
    }
  },
  
  // =====================================================
  // INFORMACIÓN DE SEGURIDAD
  // =====================================================
  password: {
    type: String,
    required: function() {
      return this.tipoCliente === 'natural' && !this.isGoogleUser;
    }
  },
  
  // =====================================================
  // INFORMACIÓN DE CONTACTO FÍSICO
  // =====================================================
  phone: {
    type: String,
    required: function() {
      // Requerido para corporativos O para naturales no-Google
      return this.tipoCliente === 'corporativo' || 
             (this.tipoCliente === 'natural' && !this.isGoogleUser);
    },
    trim: true
  },
  
  address: {
    type: String,
    required: function() {
      // Requerido para corporativos O para naturales no-Google
      return this.tipoCliente === 'corporativo' || 
             (this.tipoCliente === 'natural' && !this.isGoogleUser);
    },
    trim: true
  },
  
  img: {
    type: String,
    required: false // No requerido para corporativos
  },

  // =====================================================
  // CAMPOS ADICIONALES PARA COMPLETAR PERFIL
  // =====================================================
  profileCompleted: {
    type: Boolean,
    default: function() {
      // Corporativos siempre completos
      if (this.tipoCliente === 'corporativo') return true;
      // Naturales dependen de Google
      return !this.isGoogleUser;
    }
  },
  
  temporaryPhone: { 
    type: String,
    trim: true
  },
  
  temporaryAddress: { 
    type: String,
    trim: true
  },
  
}, {
  timestamps: true,
  strict: false,
  collection: "Clientes"
});

// =====================================================
// MIDDLEWARE PRE-SAVE
// =====================================================
clienteSchema.pre('save', function(next) {
  // Si es usuario de Google, marcar como verificado
  if (this.isGoogleUser && this.googleId) {
    this.emailVerified = true;
  }
  
  // Validar campos requeridos según tipo de cliente
  if (this.tipoCliente === 'natural' && !this.isGoogleUser) {
    const requiredFields = ['idNumber', 'birthDate', 'password', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !this[field]);
    
    if (missingFields.length > 0) {
      return next(new Error(`Campos requeridos faltantes para cliente natural: ${missingFields.join(', ')}`));
    }
  }
  
  if (this.tipoCliente === 'corporativo') {
    const requiredFields = ['nombreEmpresa', 'ruc', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !this[field]);
    
    if (missingFields.length > 0) {
      return next(new Error(`Campos requeridos faltantes para cliente corporativo: ${missingFields.join(', ')}`));
    }
  }
  
  next();
});

// =====================================================
// ÍNDICES
// =====================================================
clienteSchema.index({ tipoCliente: 1 });
clienteSchema.index({ nombreComercial: 1 });
clienteSchema.index({ ruc: 1 }, { sparse: true });
clienteSchema.index({ estadoCorporativo: 1 });
clienteSchema.index({ 'rutasFrecuentes.origen': 1, 'rutasFrecuentes.destino': 1 });

// =====================================================
// MÉTODOS DE INSTANCIA
// =====================================================

/**
 * Verificar si el perfil está completo
 */
clienteSchema.methods.isProfileComplete = function() {
  if (this.tipoCliente === 'corporativo') {
    return !!(this.nombreEmpresa && this.ruc && this.phone && this.address);
  }
  
  if (this.tipoCliente === 'natural') {
    if (!this.isGoogleUser) return true;
    return !!(this.phone && this.address && this.idNumber && this.birthDate);
  }
  
  return false;
};

/**
 * Obtener nombre completo o nombre de empresa
 */
clienteSchema.methods.getFullName = function() {
  if (this.tipoCliente === 'corporativo') {
    return this.nombreComercial || this.nombreEmpresa;
  }
  
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

/**
 * Obtener nombre para mostrar (usado en reportes y UI)
 */
clienteSchema.methods.getNombreDisplay = function() {
  if (this.tipoCliente === 'corporativo') {
    return this.nombreComercial || this.nombreEmpresa;
  }
  
  return this.getFullName();
};

/**
 * Verificar si tiene crédito disponible
 */
clienteSchema.methods.tieneCreditoDisponible = function(monto) {
  if (this.tipoCliente !== 'corporativo') return true;
  if (this.terminosPago === 'contado') return true;
  
  return (this.limiteCredito || 0) >= monto;
};

/**
 * 🔥 NUEVO: Obtener la ruta más usada
 */
clienteSchema.methods.getRutaMasUsada = function() {
  if (!this.rutasFrecuentes || this.rutasFrecuentes.length === 0) {
    return null;
  }
  
  return this.rutasFrecuentes.reduce((prev, current) => {
    return (current.vecesUsada > prev.vecesUsada) ? current : prev;
  });
};

/**
 * 🔥 NUEVO: Obtener estadísticas de rutas
 */
clienteSchema.methods.getEstadisticasRutas = function() {
  if (!this.rutasFrecuentes || this.rutasFrecuentes.length === 0) {
    return {
      totalRutas: 0,
      totalViajes: 0,
      rutaMasUsada: null,
      distanciaTotal: 0,
      montoPromedioGeneral: 0
    };
  }
  
  const totalViajes = this.rutasFrecuentes.reduce((sum, ruta) => sum + ruta.vecesUsada, 0);
  const rutaMasUsada = this.getRutaMasUsada();
  const distanciaTotal = this.rutasFrecuentes.reduce((sum, ruta) => {
    return sum + (ruta.distancia * ruta.vecesUsada);
  }, 0);
  const montoTotal = this.rutasFrecuentes.reduce((sum, ruta) => {
    return sum + (ruta.montoPromedio * ruta.vecesUsada);
  }, 0);
  
  return {
    totalRutas: this.rutasFrecuentes.length,
    totalViajes,
    rutaMasUsada: rutaMasUsada ? {
      origen: rutaMasUsada.origen,
      destino: rutaMasUsada.destino,
      usos: rutaMasUsada.vecesUsada
    } : null,
    distanciaTotal: Math.round(distanciaTotal),
    montoPromedioGeneral: totalViajes > 0 ? Math.round((montoTotal / totalViajes) * 100) / 100 : 0
  };
};

/**
 * 🔥 NUEVO: Buscar ruta específica
 */
clienteSchema.methods.buscarRuta = function(origen, destino) {
  if (!this.rutasFrecuentes || this.rutasFrecuentes.length === 0) {
    return null;
  }
  
  const origenNormalizado = origen.trim().toUpperCase();
  const destinoNormalizado = destino.trim().toUpperCase();
  
  return this.rutasFrecuentes.find(
    r => r.origen === origenNormalizado && r.destino === destinoNormalizado
  );
};

// =====================================================
// MÉTODOS ESTÁTICOS
// =====================================================

/**
 * Obtener clientes corporativos activos
 */
clienteSchema.statics.obtenerCorporativosActivos = function() {
  return this.find({
    tipoCliente: 'corporativo',
    estadoCorporativo: 'activo'
  })
  .select('nombreEmpresa nombreComercial ruc phone contactoPrincipal rutasFrecuentes')
  .sort({ nombreComercial: 1 });
};

/**
 * Buscar cliente por nombre comercial
 */
clienteSchema.statics.buscarPorNombreComercial = function(nombre) {
  return this.findOne({
    tipoCliente: 'corporativo',
    $or: [
      { nombreComercial: { $regex: nombre, $options: 'i' } },
      { nombreEmpresa: { $regex: nombre, $options: 'i' } }
    ]
  });
};

/**
 * Obtener estadísticas de clientes
 */
clienteSchema.statics.obtenerEstadisticas = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$tipoCliente',
        total: { $sum: 1 },
        activos: {
          $sum: {
            $cond: [
              { $eq: ['$estadoCorporativo', 'activo'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      total: stat.total,
      activos: stat.activos
    };
    return acc;
  }, {});
};

/**
 * 🔥 NUEVO: Obtener clientes con más rutas frecuentes
 */
clienteSchema.statics.obtenerClientesConMasRutas = function(limit = 10) {
  return this.aggregate([
    {
      $match: {
        tipoCliente: 'corporativo',
        estadoCorporativo: 'activo'
      }
    },
    {
      $project: {
        nombreComercial: 1,
        nombreEmpresa: 1,
        totalRutas: { $size: { $ifNull: ['$rutasFrecuentes', []] } }
      }
    },
    {
      $match: {
        totalRutas: { $gt: 0 }
      }
    },
    {
      $sort: { totalRutas: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

/**
 * Exportar el modelo
 */
export default model("Clientes", clienteSchema);