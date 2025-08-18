import clienteModel from "../Models/Clientes.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const clienteCon = {};

/**
 * Función para validar si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Función para validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para validar número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
const validatePhone = (phone) => {
  // Permite formatos: +123456789, 123-456-7890, (123) 456-7890, 123.456.7890
  const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{8,15}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
};

/**
 * Función para validar fecha de nacimiento
 * @param {string} birthDate - Fecha a validar
 * @returns {boolean} - true si es válido
 */
const validateBirthDate = (birthDate) => {
  const date = new Date(birthDate);
  const now = new Date();
  const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate()); // 120 años máximo
  const maxAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate()); // 13 años mínimo
  
  return date >= minAge && date <= maxAge;
};

/**
 * Función para validar número de identificación
 * @param {string} idNumber - Número de ID a validar
 * @returns {boolean} - true si es válido
 */
const validateIdNumber = (idNumber) => {
  // Formato básico: 8-15 dígitos
  const idRegex = /^\d{8,15}$/;
  return idRegex.test(idNumber?.replace(/[-\s]/g, ''));
};

/**
 * Función para validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - {isValid: boolean, message: string}
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 6 caracteres"
    };
  }
  
  // Al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra y un número"
    };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Función para validar campos requeridos
 * @param {object} data - Datos a validar
 * @param {array} requiredFields - Campos requeridos
 * @returns {object} - {isValid: boolean, missingFields: array}
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Obtener todos los clientes
 * GET /clientes
 */
clienteCon.get = async (req, res) => {
  try {
    // Obtener todos los clientes con paginación opcional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validar parámetros de paginación
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de paginación inválidos",
        error: "La página debe ser >= 1 y el límite entre 1-100"
      });
    }

    // Obtener clientes con conteo total
    const [clientes, totalClientes] = await Promise.all([
      clienteModel.find()
        .select('-password') // Excluir contraseñas de la respuesta
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      clienteModel.countDocuments()
    ]);

    if (!clientes || clientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No se encontraron clientes",
        data: {
          clientes: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalClientes: 0,
            clientesPerPage: limit
          }
        }
      });
    }

    // Calcular información de paginación
    const totalPages = Math.ceil(totalClientes / limit);

    res.status(200).json({
      success: true,
      message: "Clientes obtenidos exitosamente",
      data: {
        clientes,
        pagination: {
          currentPage: page,
          totalPages,
          totalClientes,
          clientesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener clientes",
      error: error.message
    });
  }
};

/**
 * Actualizar cliente existente
 * PUT /clientes/:id
 */
clienteCon.PutClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Verificar que el cliente existe
    const clienteActual = await clienteModel.findById(id);
    if (!clienteActual) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    const {
      firstName, // Corregido de "firtsName"
      lastName,
      email,
      idNumber,
      birthDate,
      password,
      phone,
      address
    } = req.body;

    // Validaciones específicas por campo si se proporcionan
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
        error: "Por favor proporciona un email válido"
      });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Formato de teléfono inválido",
        error: "El teléfono debe tener entre 8-15 dígitos"
      });
    }

    if (idNumber && !validateIdNumber(idNumber)) {
      return res.status(400).json({
        success: false,
        message: "Número de identificación inválido",
        error: "El número de identificación debe tener entre 8-15 dígitos"
      });
    }

    if (birthDate && !validateBirthDate(birthDate)) {
      return res.status(400).json({
        success: false,
        message: "Fecha de nacimiento inválida",
        error: "La fecha debe corresponder a una persona entre 13 y 120 años"
      });
    }

    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Contraseña inválida",
          error: passwordValidation.message
        });
      }
    }

    // Verificar unicidad de email si se está actualizando
    if (email && email !== clienteActual.email) {
      const emailExists = await clienteModel.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email duplicado",
          error: "Ya existe otro cliente registrado con este email"
        });
      }
    }

    // Verificar unicidad de número de identificación si se está actualizando
    if (idNumber && idNumber !== clienteActual.idNumber) {
      const idExists = await clienteModel.findOne({
        idNumber,
        _id: { $ne: id }
      });
      
      if (idExists) {
        return res.status(409).json({
          success: false,
          message: "Número de identificación duplicado",
          error: "Ya existe otro cliente con este número de identificación"
        });
      }
    }

    // Preparar datos para actualización (solo campos proporcionados)
    const datosActualizados = {};
    
    if (firstName) datosActualizados.firstName = firstName.trim();
    if (lastName) datosActualizados.lastName = lastName.trim();
    if (email) datosActualizados.email = email.toLowerCase().trim();
    if (idNumber) datosActualizados.idNumber = idNumber.trim();
    if (birthDate) datosActualizados.birthDate = birthDate;
    if (phone) datosActualizados.phone = phone.trim();
    if (address !== undefined) datosActualizados.address = address?.trim();

    // Hash de la contraseña si se proporciona
    if (password) {
      datosActualizados.password = await bcryptjs.hash(password, 12);
    }

    // Actualizar timestamp de última modificación
    datosActualizados.updatedAt = new Date();

    // Realizar la actualización
    const clienteActualizado = await clienteModel.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    ).select('-password'); // Excluir contraseña de la respuesta

    res.status(200).json({
      success: true,
      message: "Cliente actualizado correctamente",
      data: {
        cliente: clienteActualizado
      }
    });
  } catch (error) {
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: "Datos duplicados",
        error: `Ya existe un cliente con ese ${field}`
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar cliente",
      error: error.message
    });
  }
};

/**
 * Eliminar cliente
 * DELETE /clientes/:id
 */
clienteCon.deleteClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Intentar eliminar el cliente
    const deletedCliente = await clienteModel.findByIdAndDelete(id);
    
    if (!deletedCliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente eliminado correctamente",
      data: {
        clienteEliminado: {
          id: deletedCliente._id,
          nombre: `${deletedCliente.firstName} ${deletedCliente.lastName}`,
          email: deletedCliente.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar cliente",
      error: error.message
    });
  }
};

/**
 * Obtener métricas detalladas de usuarios activos
 * GET /clientes/usuarios-activos
 * 
 * Este método calcula estadísticas avanzadas sobre la actividad de usuarios
 * incluyendo usuarios activos en diferentes períodos de tiempo, tendencias
 * y distribución por tipo de actividad.
 */
clienteCon.getUsuariosActivos = async (req, res) => {
  try {
    // Definir rangos de tiempo para análisis de actividad
    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
    const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
    const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));

    // Agregación compleja para calcular múltiples métricas de actividad
    const metricas = await clienteModel.aggregate([
      {
        $facet: {
          // Conteo total de usuarios registrados
          totalUsuarios: [
            { $count: "total" }
          ],
          
          // Usuarios activos en los últimos 30 días
          usuariosActivos30Dias: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace30Dias } },
                  { updatedAt: { $gte: hace30Dias } },
                  { createdAt: { $gte: hace30Dias } }
                ]
              }
            },
            { $count: "activos" }
          ],

          // Usuarios muy activos en los últimos 7 días
          usuariosMuyActivos: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace7Dias } },
                  { updatedAt: { $gte: hace7Dias } }
                ]
              }
            },
            { $count: "muyActivos" }
          ],

          // Usuarios online en las últimas 24 horas
          usuariosOnline: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace24Horas } },
                  { updatedAt: { $gte: hace24Horas } }
                ]
              }
            },
            { $count: "online" }
          ],

          // Tendencia de registro de usuarios por mes
          usuariosPorPeriodo: [
            {
              $match: {
                createdAt: { $exists: true }
              }
            },
            {
              $group: {
                _id: {
                  año: { $year: "$createdAt" },
                  mes: { $month: "$createdAt" }
                },
                nuevosUsuarios: { $sum: 1 }
              }
            },
            { $sort: { "_id.año": -1, "_id.mes": -1 } },
            { $limit: 6 } // Últimos 6 meses
          ],

          // Distribución de usuarios por nivel de actividad
          distribucionActividad: [
            {
              $addFields: {
                estadoActividad: {
                  $cond: {
                    if: { $gte: ["$ultimoAcceso", hace24Horas] },
                    then: "online",
                    else: {
                      $cond: {
                        if: { $gte: ["$ultimoAcceso", hace7Dias] },
                        then: "activo",
                        else: {
                          $cond: {
                            if: { $gte: ["$ultimoAcceso", hace30Dias] },
                            then: "poco_activo",
                            else: "inactivo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              $group: {
                _id: "$estadoActividad",
                cantidad: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Procesar y estructurar los resultados de la agregación
    const resultados = metricas[0];
    
    const totalUsuarios = resultados.totalUsuarios[0]?.total || 0;
    const usuariosActivos = resultados.usuariosActivos30Dias[0]?.activos || 0;
    const usuariosMuyActivos = resultados.usuariosMuyActivos[0]?.muyActivos || 0;
    const usuariosOnline = resultados.usuariosOnline[0]?.online || 0;

    // Calcular tendencias comparando con el período anterior (30-60 días atrás)
    const hace60Dias = new Date(ahora.getTime() - (60 * 24 * 60 * 60 * 1000));
    const usuariosActivosAnterior = await clienteModel.countDocuments({
      $or: [
        { 
          ultimoAcceso: { 
            $gte: hace60Dias, 
            $lt: hace30Dias 
          } 
        },
        { 
          updatedAt: { 
            $gte: hace60Dias, 
            $lt: hace30Dias 
          } 
        }
      ]
    });

    // Calcular porcentaje de cambio en la tendencia
    const tendencia = usuariosActivosAnterior > 0 
      ? ((usuariosActivos - usuariosActivosAnterior) / usuariosActivosAnterior * 100).toFixed(1)
      : usuariosActivos > 0 ? "+100" : "0";

    // Estructurar respuesta completa con todas las métricas
    const response = {
      success: true,
      data: {
        // Métricas principales de actividad
        usuariosActivos: {
          total: usuariosActivos,
          porcentaje: totalUsuarios > 0 ? ((usuariosActivos / totalUsuarios) * 100).toFixed(1) : "0",
          tendencia: tendencia > 0 ? `+${tendencia}%` : `${tendencia}%`,
          tipoCambio: tendencia > 0 ? "positive" : tendencia < 0 ? "negative" : "neutral"
        },

        // Desglose detallado de métricas
        detalles: {
          totalUsuarios,
          usuariosOnline,
          usuariosMuyActivos,
          usuariosActivos,
          usuariosInactivos: totalUsuarios - usuariosActivos
        },

        // Distribución por tipo de actividad
        distribucion: resultados.distribucionActividad.reduce((acc, item) => {
          acc[item._id || 'sin_datos'] = item.cantidad;
          return acc;
        }, {}),

        // Descripción de los períodos utilizados
        periodos: {
          online: "Últimas 24 horas",
          muyActivos: "Últimos 7 días", 
          activos: "Últimos 30 días",
          tendencia: "Comparado con mes anterior"
        }
      },

      // Metadatos de la consulta
      metadata: {
        fechaConsulta: ahora.toISOString(),
        criterioActividad: "ultimoAcceso o updatedAt en últimos 30 días",
        totalRegistros: totalUsuarios,
        version: "1.0"
      },

      message: `${usuariosActivos} usuarios activos de ${totalUsuarios} registrados`
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al calcular usuarios activos", 
      error: error.message 
    });
  }
};

/**
 * Obtener resumen rápido de usuarios para métricas del dashboard
 * GET /clientes/resumen
 * 
 * Versión optimizada y simplificada para obtener métricas básicas
 * de actividad de usuarios de forma rápida.
 */
clienteCon.getResumenUsuarios = async (req, res) => {
  try {
    // Definir período de actividad (últimos 30 días)
    const hace30Dias = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    // Ejecutar consultas en paralelo para optimizar rendimiento
    const [total, activos] = await Promise.all([
      clienteModel.countDocuments(),
      clienteModel.countDocuments({
        $or: [
          { ultimoAcceso: { $gte: hace30Dias } },
          { updatedAt: { $gte: hace30Dias } },
          { createdAt: { $gte: hace30Dias } }
        ]
      })
    ]);

    // Calcular métricas adicionales para tendencias
    const hace60Dias = new Date(Date.now() - (60 * 24 * 60 * 60 * 1000));
    const activosAnterior = await clienteModel.countDocuments({
      $or: [
        { ultimoAcceso: { $gte: hace60Dias, $lt: hace30Dias } },
        { updatedAt: { $gte: hace60Dias, $lt: hace30Dias } }
      ]
    });

    // Calcular tendencia real comparando períodos
    let tendencia = "neutral";
    let cambio = "0%";
    
    if (activosAnterior > 0) {
      const diferencia = ((activos - activosAnterior) / activosAnterior * 100);
      cambio = diferencia > 0 ? `+${diferencia.toFixed(1)}%` : `${diferencia.toFixed(1)}%`;
      tendencia = diferencia > 0 ? "positive" : diferencia < 0 ? "negative" : "neutral";
    } else if (activos > 0) {
      cambio = "+100%";
      tendencia = "positive";
    }

    // Respuesta optimizada para dashboards
    res.status(200).json({
      success: true,
      data: {
        usuariosActivos: activos.toLocaleString(),
        totalUsuarios: total.toLocaleString(),
        porcentajeActividad: total > 0 ? ((activos / total) * 100).toFixed(1) : "0",
        tendencia,
        cambio
      },
      metadata: {
        fechaConsulta: new Date().toISOString(),
        periodo: "Últimos 30 días"
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al obtener resumen de usuarios", 
      error: error.message 
    });
  }
};

export default clienteCon;