import CotizacionesModel from "../Models/CotizacionesModel.js";
import mongoose from 'mongoose';

const cotizacionesController = {}

cotizacionesController.getAllCotizaciones = async(req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            clientId, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (pageNum < 1) {
            return res.status(400).json({ 
                message: "El número de página debe ser mayor a 0" 
            });
        }

        if (limitNum < 1 || limitNum > 100) {
            return res.status(400).json({ 
                message: "El límite debe estar entre 1 y 100" 
            });
        }

        const filtros = {};
        
        if (status) {
            const statusValidos = ['pendiente', 'enviada', 'aceptada', 'rechazada', 'ejecutada', 'cancelada'];
            if (!statusValidos.includes(status)) {
                return res.status(400).json({ 
                    message: `Status inválido. Valores permitidos: ${statusValidos.join(', ')}` 
                });
            }
            filtros.status = status;
        }

        if (clientId) {
            if (!mongoose.Types.ObjectId.isValid(clientId)) {
                return res.status(400).json({ 
                    message: "ID de cliente inválido" 
                });
            }
            filtros.clientId = clientId;
        }

        const camposValidos = ['createdAt', 'deliveryDate', 'fechaNecesaria', 'price', 'quoteName', 'status'];
        if (!camposValidos.includes(sortBy)) {
            return res.status(400).json({ 
                message: `Campo de ordenamiento inválido. Valores permitidos: ${camposValidos.join(', ')}` 
            });
        }

        const ordenValido = ['asc', 'desc'];
        if (!ordenValido.includes(sortOrder)) {
            return res.status(400).json({ 
                message: "Orden inválido. Use 'asc' o 'desc'" 
            });
        }

        const skip = (pageNum - 1) * limitNum;

        const cotizaciones = await CotizacionesModel
            .find(filtros)
            .populate('clientId', 'nombre name razonSocial displayName email phone')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limitNum);

        const total = await CotizacionesModel.countDocuments(filtros);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            success: true,
            message: "Cotizaciones obtenidas exitosamente",
            data: cotizaciones,
            pagination: {
                currentPage: pageNum,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error al obtener cotizaciones:', error);
        res.status(500).json({ 
            message: "Error interno del servidor al obtener cotizaciones", 
            error: error.message 
        });
    }
}

cotizacionesController.getCotizacionById = async(req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                message: "ID de cotización es requerido" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        const cotizacion = await CotizacionesModel
            .findById(id)
            .populate('clientId', 'nombre name razonSocial displayName email phone address');
        
        if (!cotizacion) {
            return res.status(404).json({ 
                message: "Cotización no encontrada" 
            });
        }

        // 🔹 NUEVO: nombre legible del cliente e id simple
        const clientDoc = cotizacion.clientId;
        const clientDisplayName =
          (clientDoc?.nombre?.trim?.()) ||
          (clientDoc?.name?.trim?.()) ||
          (clientDoc?.razonSocial?.trim?.()) ||
          (clientDoc?.displayName?.trim?.()) ||
          null;

        const clientIdSimple =
          (clientDoc?._id?.toString?.()) ||
          (typeof clientDoc === 'string' ? clientDoc : null);

        const cotizacionConInfo = {
            ...cotizacion.toObject(),
            clientDisplayName,     // ← agregado
            clientIdSimple,        // ← agregado
            estaVencida: cotizacion.estaVencida,
            duracionEstimada: cotizacion.duracionEstimada,
            fechaInfo: {
                diasParaVencimiento: cotizacion.costos.validezCotizacion ? 
                    Math.ceil((cotizacion.costos.validezCotizacion - new Date()) / (1000 * 60 * 60 * 24)) : null,
                diasParaNecesidad: Math.ceil((new Date(cotizacion.fechaNecesaria) - new Date()) / (1000 * 60 * 60 * 24))
            }
        };
        
        res.status(200).json({
            success: true,
            message: "Cotización obtenida exitosamente",
            data: cotizacionConInfo
        });

    } catch (error) {
        console.error('Error al obtener cotización por ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        res.status(500).json({ 
            message: "Error interno del servidor al obtener la cotización", 
            error: error.message 
        });
    }
}

cotizacionesController.createCotizacion = async (req, res) => {
  try {
    const {
      clientId,
      quoteDescription,
      quoteName,
      travelLocations,
      truckType,
      // ⚠️ alias para evitar redeclaración
      fechaNecesaria: fechaNecesariaRaw,
      deliveryDate,
      paymentMethod,
      ruta,
      carga,
      horarios,
      observaciones,
      notasInternas,
      pickupLocation,
      destinationLocation,
      estimatedDistance
    } = req.body;

    console.log('📦 Datos recibidos para crear cotización:', {
      clientId,
      quoteName,
      pickupLocation,
      destinationLocation,
      fechaNecesaria: fechaNecesariaRaw,
      paymentMethod,
      rutaOrigen: ruta?.origen?.nombre,
      rutaDestino: ruta?.destino?.nombre
    });

    // VALIDACIONES BÁSICAS
    if (!clientId) {
      return res.status(400).json({
        message: "Error de validación",
        error: "El clientId es requerido"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        message: "Error de validación",
        error: "ID de cliente inválido"
      });
    }

    if (!quoteDescription || !quoteName || !travelLocations || !fechaNecesariaRaw) {
      return res.status(400).json({
        message: "Error de validación",
        error: "Los campos quoteDescription, quoteName, travelLocations y fechaNecesaria son requeridos"
      });
    }

    // (resto de validaciones sin cambios)

    const fechaSalida = new Date(horarios.fechaSalida);
    const fechaLlegada = new Date(horarios.fechaLlegadaEstimada);
    const fechaNec = new Date(fechaNecesariaRaw);
    const ahora = new Date();

    if (fechaSalida < ahora) {
      return res.status(400).json({
        message: "Error de validación",
        error: "La fecha de salida no puede ser en el pasado"
      });
    }

    if (fechaLlegada <= fechaSalida) {
      return res.status(400).json({
        message: "Error de validación",
        error: "La fecha de llegada debe ser posterior a la fecha de salida"
      });
    }

    if (fechaNec < ahora) {
      return res.status(400).json({
        message: "Error de validación",
        error: "La fecha necesaria no puede ser en el pasado"
      });
    }

    // CREAR COTIZACIÓN
    const nuevaCotizacion = new CotizacionesModel({
      clientId,
      quoteDescription,
      quoteName,
      travelLocations,
      truckType: truckType || 'otros',
      fechaNecesaria: fechaNec,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : fechaLlegada,
      paymentMethod: paymentMethod || 'efectivo',

      pickupLocation: pickupLocation.trim(),
      destinationLocation: destinationLocation.trim(),
      estimatedDistance: estimatedDistance || ruta.distanciaTotal,
      
      ruta: {
        origen: {
          nombre: ruta.origen.nombre.trim(),
          coordenadas: {
            lat: ruta.origen.coordenadas.lat,
            lng: ruta.origen.coordenadas.lng
          },
          tipo: ruta.origen.tipo || 'ciudad'
        },
        destino: {
          nombre: ruta.destino.nombre.trim(),
          coordenadas: {
            lat: ruta.destino.coordenadas.lat,
            lng: ruta.destino.coordenadas.lng
          },
          tipo: ruta.destino.tipo || 'ciudad'
        },
        distanciaTotal: ruta.distanciaTotal,
        tiempoEstimado: ruta.tiempoEstimado
      },

      carga: {
        categoria: carga.categoria || truckType || 'otros',
        subcategoria: carga.subcategoria,
        descripcion: carga.descripcion,
        peso: {
          valor: carga.peso.valor,
          unidad: carga.peso.unidad || 'kg'
        },
        volumen: carga.volumen ? {
          valor: carga.volumen.valor,
          unidad: carga.volumen.unidad || 'm3'
        } : undefined,
        clasificacionRiesgo: carga.clasificacionRiesgo || 'normal',
        condicionesEspeciales: carga.condicionesEspeciales || {},
        valorDeclarado: carga.valorDeclarado ? {
          monto: carga.valorDeclarado.monto,
          moneda: carga.valorDeclarado.moneda || 'USD'
        } : undefined
      },

      horarios: {
        fechaSalida: fechaSalida,
        fechaLlegadaEstimada: fechaLlegada,
        tiempoEstimadoViaje: horarios.tiempoEstimadoViaje,
        flexibilidadHoraria: horarios.flexibilidadHoraria || {
          permitida: true,
          rangoTolerancia: 2
        },
        horarioPreferido: horarios.horarioPreferido
      },

      observaciones,
      notasInternas
    });

    // (validación final sin cambios)

    const cotizacionGuardada = await nuevaCotizacion.save();

    console.log('✅ Cotización creada exitosamente:', {
      id: cotizacionGuardada._id,
      quoteName: cotizacionGuardada.quoteName,
      pickupLocation: cotizacionGuardada.pickupLocation,
      destinationLocation: cotizacionGuardada.destinationLocation,
      fechaNecesaria: cotizacionGuardada.fechaNecesaria,
      price: cotizacionGuardada.price
    });

    res.status(201).json({
      message: "Cotización creada exitosamente",
      cotizacion: cotizacionGuardada
    });

  } catch (error) {
    console.error('❌ Error creando cotización:', error);
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Error de validación de modelo",
        errores
      });
    }
    if (error.name === 'CastError' && error.path === 'clientId') {
      return res.status(400).json({
        message: "Error de validación",
        error: "ID de cliente inválido"
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Error de duplicación",
        error: "Ya existe una cotización con estos datos"
      });
    }
    res.status(500).json({
      message: "Error interno del servidor al crear la cotización",
      error: error.message
    });
  }
};

cotizacionesController.updateCotizacion = async(req, res) => {
    try {
        const { id } = req.params;
        const { 
            price, 
            costos, 
            status, 
            motivoRechazo,
            pickupLocation,
            destinationLocation,
            estimatedDistance
        } = req.body;

        console.log('✏️ Actualizando cotización:', { id, status, price, pickupLocation, destinationLocation });

        if (!id) {
            return res.status(400).json({ 
                message: "ID de cotización es requerido" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        const cotizacionExistente = await CotizacionesModel.findById(id);
        
        if (!cotizacionExistente) {
            return res.status(404).json({ 
                message: "Cotización no encontrada" 
            });
        }

        const actualizacion = {};

        // ✨ ACTUALIZAR CAMPOS DE UBICACIÓN
        if (pickupLocation !== undefined) {
            actualizacion.pickupLocation = pickupLocation;
        }

        if (destinationLocation !== undefined) {
            actualizacion.destinationLocation = destinationLocation;
        }

        if (estimatedDistance !== undefined && typeof estimatedDistance === 'number' && estimatedDistance >= 0) {
            actualizacion.estimatedDistance = estimatedDistance;
        }

        // 💰 ACTUALIZAR PRECIO (cuando el transportista responde)
        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                return res.status(400).json({ 
                    message: "El precio debe ser un número mayor o igual a 0" 
                });
            }
            actualizacion.price = price;
        }

        // 💰 ACTUALIZAR COSTOS
        if (costos && typeof costos === 'object') {
            const costosActualizados = { ...cotizacionExistente.costos.toObject() };

            if (costos.combustible !== undefined) {
                if (typeof costos.combustible !== 'number' || costos.combustible < 0) {
                    return res.status(400).json({ 
                        message: "El costo de combustible debe ser un número mayor o igual a 0" 
                    });
                }
                costosActualizados.combustible = costos.combustible;
            }

            if (costos.peajes !== undefined) {
                if (typeof costos.peajes !== 'number' || costos.peajes < 0) {
                    return res.status(400).json({ 
                        message: "El costo de peajes debe ser un número mayor o igual a 0" 
                    });
                }
                costosActualizados.peajes = costos.peajes;
            }

            if (costos.conductor !== undefined) {
                if (typeof costos.conductor !== 'number' || costos.conductor < 0) {
                    return res.status(400).json({ 
                        message: "El costo del conductor debe ser un número mayor o igual a 0" 
                    });
                }
                costosActualizados.conductor = costos.conductor;
            }

            if (costos.otros !== undefined) {
                if (typeof costos.otros !== 'number' || costos.otros < 0) {
                    return res.status(400).json({ 
                        message: "Otros costos deben ser un número mayor o igual a 0" 
                    });
                }
                costosActualizados.otros = costos.otros;
            }

            if (costos.impuestos !== undefined) {
                if (typeof costos.impuestos !== 'number' || costos.impuestos < 0) {
                    return res.status(400).json({ 
                        message: "Los impuestos deben ser un número mayor o igual a 0" 
                    });
                }
                costosActualizados.impuestos = costos.impuestos;
            }

            // 📊 RECALCULAR SUBTOTAL Y TOTAL
            costosActualizados.subtotal = (costosActualizados.combustible || 0) +
                                         (costosActualizados.peajes || 0) +
                                         (costosActualizados.conductor || 0) +
                                         (costosActualizados.otros || 0);
            
            costosActualizados.total = costosActualizados.subtotal + (costosActualizados.impuestos || 0);

            actualizacion.costos = costosActualizados;
        }

        // 📅 MANEJAR CAMBIOS DE STATUS
        if (status !== undefined) {
            const statusValidos = ['pendiente', 'enviada', 'aceptada', 'rechazada', 'ejecutada', 'cancelada'];
            
            if (!statusValidos.includes(status)) {
                return res.status(400).json({ 
                    message: `Status inválido. Valores permitidos: ${statusValidos.join(', ')}` 
                });
            }

            actualizacion.status = status;

            const ahora = new Date();

            switch (status) {
                case 'enviada':
                    actualizacion.fechaEnvio = ahora;
                    actualizacion.fechaAceptacion = null;
                    actualizacion.fechaRechazo = null;
                    actualizacion.motivoRechazo = null;
                    break;

                case 'aceptada':
                    actualizacion.fechaAceptacion = ahora;
                    if (!cotizacionExistente.fechaEnvio) {
                        actualizacion.fechaEnvio = ahora;
                    }
                    actualizacion.fechaRechazo = null;
                    actualizacion.motivoRechazo = null;
                    break;

                case 'rechazada':
                    actualizacion.fechaRechazo = ahora;
                    if (!cotizacionExistente.fechaEnvio) {
                        actualizacion.fechaEnvio = ahora;
                    }
                    actualizacion.fechaAceptacion = null;
                    
                    if (!motivoRechazo || motivoRechazo.trim() === '') {
                        return res.status(400).json({ 
                            message: "El motivo de rechazo es requerido cuando el status es 'rechazada'" 
                        });
                    }
                    actualizacion.motivoRechazo = motivoRechazo.trim();
                    break;

                case 'ejecutada':
                    if (cotizacionExistente.status !== 'aceptada') {
                        return res.status(400).json({ 
                            message: "Solo se pueden ejecutar cotizaciones que han sido aceptadas" 
                        });
                    }
                    break;

                case 'cancelada':
                    break;

                case 'pendiente':
                    actualizacion.fechaEnvio = null;
                    actualizacion.fechaAceptacion = null;
                    actualizacion.fechaRechazo = null;
                    actualizacion.motivoRechazo = null;
                    break;
            }
        }

        if (Object.keys(actualizacion).length === 0) {
            return res.status(400).json({ 
                message: "No se proporcionaron campos válidos para actualizar" 
            });
        }

        const cotizacionActualizada = await CotizacionesModel.findByIdAndUpdate(
            id,
            actualizacion,
            { 
                new: true,
                runValidators: true
            }
        ).populate('clientId', 'nombre name razonSocial displayName email phone');

        console.log(`✅ Cotización actualizada - ID: ${id}, Status: ${status}, Precio: ${price}`);

        res.status(200).json({
            success: true,
            message: "Cotización actualizada exitosamente",
            data: cotizacionActualizada,
            cambiosRealizados: {
                camposActualizados: Object.keys(actualizacion),
                statusAnterior: cotizacionExistente.status,
                statusNuevo: status || cotizacionExistente.status,
                precioAnterior: cotizacionExistente.price,
                precioNuevo: price || cotizacionExistente.price
            }
        });

    } catch (error) {
        console.error('❌ Error al actualizar cotización:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Error de validación", 
                errores: Object.values(error.errors).map(err => err.message) 
            });
        }

        res.status(500).json({ 
            message: "Error interno del servidor al actualizar la cotización", 
            error: error.message 
        });
    }
}

cotizacionesController.deleteCotizacion = async(req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Eliminando cotización:', { id });

        if (!id) {
            return res.status(400).json({ 
                message: "ID de cotización es requerido" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        const cotizacionExistente = await CotizacionesModel.findById(id);
        
        if (!cotizacionExistente) {
            return res.status(404).json({ 
                message: "Cotización no encontrada" 
            });
        }

        const cotizacionEliminada = await CotizacionesModel.findByIdAndDelete(id);
        
        console.log(`✅ Cotización eliminada - ID: ${id}`);
        
        res.status(200).json({ 
            success: true,
            message: "Cotización eliminada exitosamente",
            cotizacionEliminada: {
                id: cotizacionEliminada._id,
                quoteName: cotizacionEliminada.quoteName,
                status: cotizacionEliminada.status,
                fechaEliminacion: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error al eliminar cotización:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        res.status(500).json({ 
            message: "Error interno del servidor al eliminar la cotización", 
            error: error.message 
        });
    }
}

export default cotizacionesController;
