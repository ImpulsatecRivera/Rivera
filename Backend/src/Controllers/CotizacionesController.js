import CotizacionesModel from "../Models/CotizacionesModel.js";
import mongoose from 'mongoose';

const cotizacionesController = {}

cotizacionesController.getAllCotizaciones = async(req, res) => {
    try {
        // 🔍 Obtener parámetros de consulta opcionales
        const { 
            page = 1, 
            limit = 10, 
            status, 
            clientId, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        // ✅ Validar parámetros de paginación
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

        // 🔍 Construir filtros
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

        // ✅ Validar campo de ordenamiento
        const camposValidos = ['createdAt', 'deliveryDate', 'price', 'quoteName', 'status'];
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

        // 📊 Calcular offset para paginación
        const skip = (pageNum - 1) * limitNum;

        // 🔍 Obtener cotizaciones con filtros y paginación
        const cotizaciones = await CotizacionesModel
            .find(filtros)
            .populate('clientId', 'name email phone') // Poblar datos del cliente
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limitNum);

        // 📈 Obtener total de documentos para metadata
        const total = await CotizacionesModel.countDocuments(filtros);
        const totalPages = Math.ceil(total / limitNum);

        // ✅ Respuesta exitosa con metadata
        res.status(200).json({
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

        // ✅ Validar que el ID sea proporcionado
        if (!id) {
            return res.status(400).json({ 
                message: "ID de cotización es requerido" 
            });
        }

        // ✅ Validar formato del ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        // 🔍 Buscar cotización con datos del cliente poblados
        const cotizacion = await CotizacionesModel
            .findById(id)
            .populate('clientId', 'name email phone address'); // Poblar datos del cliente
        
        // ❌ Validar que la cotización exista
        if (!cotizacion) {
            return res.status(404).json({ 
                message: "Cotización no encontrada" 
            });
        }

        // ✅ Agregar información adicional útil
        const cotizacionConInfo = {
            ...cotizacion.toObject(),
            // Campos virtuales calculados
            estaVencida: cotizacion.estaVencida,
            duracionEstimada: cotizacion.duracionEstimada,
            // Estado de las fechas
            fechaInfo: {
                diasParaVencimiento: Math.ceil((cotizacion.costos.validezCotizacion - new Date()) / (1000 * 60 * 60 * 24)),
                diasParaEntrega: Math.ceil((new Date(cotizacion.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))
            }
        };
        
        res.status(200).json({
            message: "Cotización obtenida exitosamente",
            data: cotizacionConInfo
        });

    } catch (error) {
        console.error('Error al obtener cotización por ID:', error);
        
        // 🔍 Manejo específico de errores de Mongoose
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
            deliveryDate,
            paymentMethod,
            price,
            ruta,
            carga,
            horarios,
            costos,
            observaciones,
            notasInternas
        } = req.body;

        // 🔒 VALIDACIONES ESTRICTAS COMPLETAS
        
        // Validación de campos básicos requeridos
        if (!clientId) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El clientId es requerido" 
            });
        }

        if (!quoteDescription || !quoteName || !travelLocations || !deliveryDate || !price) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Los campos quoteDescription, quoteName, travelLocations, deliveryDate y price son requeridos" 
            });
        }

        // Validación de precio
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El precio debe ser un número mayor a 0" 
            });
        }

        // Validación estricta de ruta
        if (!ruta || !ruta.origen || !ruta.destino) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "La ruta debe incluir origen y destino completos" 
            });
        }

        // Validación de nombres de origen y destino
        if (!ruta.origen.nombre || !ruta.destino.nombre) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Los nombres del origen y destino son requeridos" 
            });
        }

        // Validación estricta de coordenadas del origen
        if (!ruta.origen.coordenadas || 
            typeof ruta.origen.coordenadas.lat !== 'number' || 
            typeof ruta.origen.coordenadas.lng !== 'number' ||
            ruta.origen.coordenadas.lat < -90 || ruta.origen.coordenadas.lat > 90 ||
            ruta.origen.coordenadas.lng < -180 || ruta.origen.coordenadas.lng > 180) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Las coordenadas del origen son requeridas y deben ser números válidos (lat: -90 a 90, lng: -180 a 180)" 
            });
        }

        // Validación estricta de coordenadas del destino
        if (!ruta.destino.coordenadas || 
            typeof ruta.destino.coordenadas.lat !== 'number' || 
            typeof ruta.destino.coordenadas.lng !== 'number' ||
            ruta.destino.coordenadas.lat < -90 || ruta.destino.coordenadas.lat > 90 ||
            ruta.destino.coordenadas.lng < -180 || ruta.destino.coordenadas.lng > 180) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Las coordenadas del destino son requeridas y deben ser números válidos (lat: -90 a 90, lng: -180 a 180)" 
            });
        }

        // Validación de distancia y tiempo de ruta
        if (typeof ruta.distanciaTotal !== 'number' || ruta.distanciaTotal <= 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "La distancia total debe ser un número mayor a 0" 
            });
        }

        if (typeof ruta.tiempoEstimado !== 'number' || ruta.tiempoEstimado <= 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El tiempo estimado debe ser un número mayor a 0" 
            });
        }

        // Validación estricta de carga
        if (!carga || !carga.descripcion) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "La carga debe incluir una descripción" 
            });
        }

        if (!carga.peso || typeof carga.peso.valor !== 'number' || carga.peso.valor <= 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "La carga debe incluir un peso válido mayor a 0" 
            });
        }

        // Validación de categoría de carga
        const categoriasValidas = [
            'alimentos_perecederos', 'alimentos_no_perecederos', 'bebidas',
            'materiales_construccion', 'textiles', 'electronicos', 'medicamentos',
            'maquinaria', 'vehiculos', 'quimicos', 'combustibles', 'papel_carton',
            'muebles', 'productos_agricolas', 'metales', 'plasticos',
            'vidrio_ceramica', 'productos_limpieza', 'cosmeticos', 'juguetes', 'otros'
        ];

        if (carga.categoria && !categoriasValidas.includes(carga.categoria)) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: `La categoría de carga debe ser una de: ${categoriasValidas.join(', ')}` 
            });
        }

        // Validación estricta de horarios
        if (!horarios || !horarios.fechaSalida || !horarios.fechaLlegadaEstimada) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Los horarios deben incluir fechaSalida y fechaLlegadaEstimada" 
            });
        }

        if (typeof horarios.tiempoEstimadoViaje !== 'number' || horarios.tiempoEstimadoViaje <= 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El tiempo estimado de viaje debe ser un número mayor a 0" 
            });
        }

        // Validar que la fecha de salida no sea en el pasado
        const fechaSalida = new Date(horarios.fechaSalida);
        const fechaLlegada = new Date(horarios.fechaLlegadaEstimada);
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

        // Validación estricta de costos
        if (!costos) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "Los costos son requeridos" 
            });
        }

        if (typeof costos.combustible !== 'number' || costos.combustible < 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El costo de combustible debe ser un número mayor o igual a 0" 
            });
        }

        if (typeof costos.peajes !== 'number' || costos.peajes < 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El costo de peajes debe ser un número mayor o igual a 0" 
            });
        }

        if (typeof costos.conductor !== 'number' || costos.conductor < 0) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: "El costo del conductor debe ser un número mayor o igual a 0" 
            });
        }

        // Validar truckType si se proporciona
        if (truckType && !categoriasValidas.includes(truckType)) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: `El tipo de camión debe ser uno de: ${categoriasValidas.join(', ')}` 
            });
        }

        // Validar paymentMethod si se proporciona
        const metodosPagoValidos = ['efectivo', 'transferencia', 'cheque', 'credito', 'tarjeta'];
        if (paymentMethod && !metodosPagoValidos.includes(paymentMethod)) {
            return res.status(400).json({ 
                message: "Error de validación", 
                error: `El método de pago debe ser uno de: ${metodosPagoValidos.join(', ')}` 
            });
        }

        // ✅ CREAR COTIZACIÓN CON VALIDACIONES ESTRICTAS PASADAS
        const nuevaCotizacion = new CotizacionesModel({
            clientId,
            quoteDescription,
            quoteName,
            travelLocations,
            truckType: truckType || 'otros',
            deliveryDate: new Date(deliveryDate),
            paymentMethod: paymentMethod || 'efectivo',
            price,
            
            ruta: {
                origen: {
                    nombre: ruta.origen.nombre,
                    coordenadas: {
                        lat: ruta.origen.coordenadas.lat,
                        lng: ruta.origen.coordenadas.lng
                    },
                    tipo: ruta.origen.tipo || 'ciudad'
                },
                destino: {
                    nombre: ruta.destino.nombre,
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
                fechaSalida: new Date(horarios.fechaSalida),
                fechaLlegadaEstimada: new Date(horarios.fechaLlegadaEstimada),
                tiempoEstimadoViaje: horarios.tiempoEstimadoViaje,
                flexibilidadHoraria: horarios.flexibilidadHoraria || {
                    permitida: true,
                    rangoTolerancia: 2
                },
                horarioPreferido: horarios.horarioPreferido
            },
            
            costos: {
                combustible: costos.combustible,
                peajes: costos.peajes,
                conductor: costos.conductor,
                otros: costos.otros || 0,
                impuestos: costos.impuestos || 0,
                moneda: costos.moneda || 'USD',
                validezCotizacion: costos.validezCotizacion ? new Date(costos.validezCotizacion) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                // subtotal y total se calculan automáticamente en el middleware pre-save
            },
            
            observaciones,
            notasInternas
        });

        // Guardar la cotización (esto activará el middleware pre-save)
        const cotizacionGuardada = await nuevaCotizacion.save();

        res.status(201).json({
            message: "Cotización creada exitosamente",
            cotizacion: cotizacionGuardada
        });

    } catch (error) {
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Error de validación de modelo",
                errores: errores
            });
        }

        // Manejar error de referencia de cliente inválido
        if (error.name === 'CastError' && error.path === 'clientId') {
            return res.status(400).json({
                message: "Error de validación",
                error: "ID de cliente inválido"
            });
        }

        // Error de datos duplicados
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

cotizacionesController.deleteCotizacion = async(req, res) => {
    try {
        const { id } = req.params;
        const { forceDelete = false } = req.body; // Opción para forzar eliminación

        // ✅ Validar que el ID sea proporcionado
        if (!id) {
            return res.status(400).json({ 
                message: "ID de cotización es requerido" 
            });
        }

        // ✅ Validar formato del ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Formato de ID inválido" 
            });
        }

        // 🔍 Primero verificar que la cotización existe
        const cotizacionExistente = await CotizacionesModel.findById(id);
        
        if (!cotizacionExistente) {
            return res.status(404).json({ 
                message: "Cotización no encontrada" 
            });
        }

        // ✅ Validaciones de negocio antes de eliminar
        
        // No permitir eliminar cotizaciones aceptadas o ejecutadas (a menos que se fuerce)
        if (!forceDelete && ['aceptada', 'ejecutada'].includes(cotizacionExistente.status)) {
            return res.status(400).json({ 
                message: `No se puede eliminar una cotización con status '${cotizacionExistente.status}'. Use forceDelete: true para forzar la eliminación.`,
                cotizacion: {
                    id: cotizacionExistente._id,
                    quoteName: cotizacionExistente.quoteName,
                    status: cotizacionExistente.status
                }
            });
        }

        // Verificar si existe un viaje asociado (usando el método del modelo)
        if (cotizacionExistente.status === 'ejecutada') {
            try {
                const mongoose = await import('mongoose');
                const ViajesModel = mongoose.model('Viajes');
                const viajeAsociado = await ViajesModel.findOne({ quoteId: id });
                
                if (viajeAsociado && !forceDelete) {
                    return res.status(400).json({ 
                        message: "No se puede eliminar una cotización que tiene un viaje asociado. Use forceDelete: true para forzar la eliminación.",
                        viajeAsociado: viajeAsociado._id
                    });
                }
            } catch (viajeError) {
                // Si el modelo Viajes no existe, continuar con la eliminación
                console.warn('Modelo Viajes no encontrado, continuando con eliminación');
            }
        }

        // 🗑️ Proceder con la eliminación
        const cotizacionEliminada = await CotizacionesModel.findByIdAndDelete(id);
        
        // ✅ Log de auditoría (en producción, esto debería ir a un sistema de logs)
        console.log(`Cotización eliminada - ID: ${id}, Usuario: ${req.user?.id || 'Sistema'}, Forzada: ${forceDelete}`);
        
        res.status(200).json({ 
            message: "Cotización eliminada exitosamente",
            cotizacionEliminada: {
                id: cotizacionEliminada._id,
                quoteName: cotizacionEliminada.quoteName,
                status: cotizacionEliminada.status,
                fechaEliminacion: new Date()
            }
        });

    } catch (error) {
        console.error('Error al eliminar cotización:', error);
        
        // 🔍 Manejo específico de errores
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
            message: "Error interno del servidor al eliminar la cotización", 
            error: error.message 
        });
    }
}



export default cotizacionesController;