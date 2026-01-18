import MantenimientoCamiones from "../Models/MantenimientoCamiones.js";
import camiones from "../Models/Camiones.js";
import Proveedores from "../Models/Proveedores.js"; // ← NUEVO: Importar modelo
import mongoose, { isValidObjectId } from 'mongoose';

const mantenimientoCon = {};

//# obtener lista de mantenimientos de camiones
mantenimientoCon.getMantenimineto = async(req, res) => {
    try {
        const manto = await MantenimientoCamiones.find()
            .populate({
                path: "ciculatioCard",
                select: "name brand model state age licensePlate"
            })
            .populate({
                path: "proveedores",
                select: "nombre telefono email direccion"
            })
            .populate({
                path: "detalles.proveedor",
                select: "nombre"
            });
        
        if(!manto || manto.length === 0) {
            return res.status(200).json({
                message: "No se encontró ningún mantenimiento",
                data: []
            });
        }
        
        // Formatear cada mantenimiento para incluir mes, año y ESTADO
        const mantenimientosFormateados = manto.map(m => ({
            _id: m._id,
            fecha_mantenimiento: m.fecha_mantenimiento,
            mes: m.mes,
            ano: m.ano,
            tipo_de_mantenimiento: m.tipo_de_mantenimiento,
            descripcion: m.descripcion,
            detalles: m.detalles,
            proveedores: m.proveedores, // ← NUEVO
            costoTotal: m.costoTotal,
            estado: m.estado,  
            ciculatioCard: m.ciculatioCard,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt
        }));
        
        return res.status(200).json({
            message: "Lista de mantenimiento de camiones",
            count: mantenimientosFormateados.length,
            data: mantenimientosFormateados
        });
    } catch (error) {
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    } 
};

//# Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (mes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
};

//# Función auxiliar para formatear tipo de mantenimiento que se realizó
const formateartipoMantenimiento = (tipo) => {
    const tipos = {
        'preventivo': 'Mantenimiento Preventivo',
        'correctivo': 'Mantenimiento Correctivo',
        'llantas': 'Cambio de Llantas',
        'rines': 'Cambio de Rines',
        'furgo': 'Reparación de Furgón',
        'madera_furgo': 'Madera de Furgón',
        'torno': 'Reparación de Torno',
        'bomba': 'Reparación de Bomba',
        'reparacion_turbo': 'Reparación del Turbo',
        'otros': 'Otros'
    };
    return tipos[tipo] || tipo;
};

//# Obtener mantenimiento por ID con información detallada
//# Obtener mantenimiento por ID con información detallada
mantenimientoCon.obtenerMantoId = async(req, res) => {
    try {
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Número de identificación del mantenimiento inválido"
            });         
        }

        const manto = await MantenimientoCamiones.findById(id)
            .populate({
                path: "ciculatioCard",
                select: "name brand model state age licensePlate description img"
            })
            .populate({
                path: "proveedores",
                select: "companyName telefono email direccion phone partDescription" // ← CAMBIO: companyName
            })
            .populate({
                path: "detalles.proveedor",
                select: "companyName telefono phone" // ← CAMBIO: companyName
            });

        if(!manto) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado"
            });
        }

        //# Calcular información adicional
        const totalDetalle = manto.detalles.reduce((sum, detalle) => sum + detalle.subTotal, 0);
        const cantidadItems = manto.detalles.length;

        // Formatear la respuesta con información detallada
        const respuestaDetallada = {
            _id: manto._id,
            fecha: manto.fecha_mantenimiento,
            fechaFormateada: manto.fecha_mantenimiento.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            mes: manto.mes,
            ano: manto.ano,
            periodo: `${obtenerNombreMes(manto.mes)} ${manto.ano}`,
            
            // Información del camión
            camion: {
                id: manto.ciculatioCard._id,
                name: manto.ciculatioCard.name,
                brand: manto.ciculatioCard.brand,
                model: manto.ciculatioCard.model,
                state: manto.ciculatioCard.state,
                age: manto.ciculatioCard.age,
                licensePlate: manto.ciculatioCard.licensePlate,
                description: manto.ciculatioCard.description,
                img: manto.ciculatioCard.img
            },
            
            // Información del mantenimiento
            tipoMantenimiento: manto.tipo_de_mantenimiento,
            tipoMantenimientoFormateado: formateartipoMantenimiento(manto.tipo_de_mantenimiento),
            descripcion: manto.descripcion,
            estado: manto.estado,
            
            // Proveedores
            proveedores: manto.proveedores,
            
            // Detalles de costos con proveedor
            detalles: manto.detalles.map(detalle => ({
                concepto: detalle.concepto,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario,
                subTotal: detalle.subTotal,
                subtotalFormateado: `$${detalle.subTotal.toFixed(2)}`,
                proveedor: detalle.proveedor || null // ← Ya incluye el objeto completo del proveedor
            })),
            
            // Resumen financiero
            resumen: {
                cantidadItems: cantidadItems,
                costoTotal: totalDetalle,
                costoTotalFormateado: `$${totalDetalle.toFixed(2)}`,
                costoPorItem: cantidadItems > 0 ? (totalDetalle / cantidadItems).toFixed(2) : 0
            },
            
            // Metadata
            createdAt: manto.createdAt,
            updatedAt: manto.updatedAt
        };

        res.status(200).json({
            success: true,
            data: respuestaDetallada
        });

    } catch (error) {
        console.error('Error al obtener mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el mantenimiento',
            error: error.message
        });
    }
};

//# Método agregar mantenimiento
//# Método agregar mantenimiento
//# Método agregar mantenimiento
//# Método agregar mantenimiento
mantenimientoCon.postMantenimiento = async(req, res) => {
    try {
        const {
            ciculatioCard,
            fecha_mantenimiento,
            tipo_de_mantenimiento,
            descripcion,
            detalles,
            proveedores,
            estado
        } = req.body;

        console.log('📥 POST /mantenimientos - Request recibido');

        // Validar camión
        if (!ciculatioCard || !mongoose.Types.ObjectId.isValid(ciculatioCard)) {
            return res.status(400).json({
                success: false,
                message: 'ID de camión inválido o no proporcionado'
            });
        }

        const camionExist = await camiones.findById(ciculatioCard);
        if(!camionExist) {
            return res.status(404).json({
                success: false,
                message: 'Camión no encontrado'
            });
        }

        // ✅ Filtrar y validar proveedores (array principal)
        const proveedoresLimpios = Array.isArray(proveedores) 
            ? [...new Set(proveedores.filter(p => {
                if (!p || (typeof p === 'string' && p.trim() === '')) {
                    return false;
                }
                return mongoose.Types.ObjectId.isValid(p);
            }))]
            : [];

        console.log('🔍 Proveedores originales:', proveedores);
        console.log('✅ Proveedores filtrados (únicos):', proveedoresLimpios);

        if(proveedoresLimpios.length > 0) {
            const proveedoresValidos = await Proveedores.find({
                '_id': { $in: proveedoresLimpios }
            });

            console.log(`📊 Proveedores encontrados en DB: ${proveedoresValidos.length}/${proveedoresLimpios.length}`);

            if(proveedoresValidos.length !== proveedoresLimpios.length) {
                const idsEncontrados = proveedoresValidos.map(p => p._id.toString());
                const idsNoEncontrados = proveedoresLimpios.filter(p => !idsEncontrados.includes(p.toString()));
                
                console.error('❌ IDs de proveedores no encontrados:', idsNoEncontrados);
                
                return res.status(404).json({
                    success: false,
                    message: 'Uno o más proveedores no existen en la base de datos',
                    detalles: {
                        proveedoresNoEncontrados: idsNoEncontrados,
                        totalEnviados: proveedoresLimpios.length,
                        totalEncontrados: proveedoresValidos.length
                    }
                });
            }
        }

        // ✅ Validar proveedores en detalles - CON DEDUPLICACIÓN
        if(!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un detalle de mantenimiento'
            });
        }

        const proveedoresEnDetallesSinFiltrar = detalles
            .filter(d => d.proveedor && typeof d.proveedor === 'string' && d.proveedor.trim() !== '')
            .map(d => d.proveedor.trim())
            .filter(p => mongoose.Types.ObjectId.isValid(p));

        // ✅ CLAVE: Eliminar duplicados
        const proveedoresEnDetalles = [...new Set(proveedoresEnDetallesSinFiltrar)];

        console.log('🔍 Proveedores en detalles (con duplicados):', proveedoresEnDetallesSinFiltrar);
        console.log('🔍 Proveedores en detalles (únicos):', proveedoresEnDetalles);

        if(proveedoresEnDetalles.length > 0) {
            const proveedoresDetalleValidos = await Proveedores.find({
                '_id': { $in: proveedoresEnDetalles }
            });

            console.log(`📊 Proveedores de detalles en DB: ${proveedoresDetalleValidos.length}/${proveedoresEnDetalles.length}`);

            if(proveedoresDetalleValidos.length !== proveedoresEnDetalles.length) {
                const idsEncontrados = proveedoresDetalleValidos.map(p => p._id.toString());
                const idsNoEncontrados = proveedoresEnDetalles.filter(p => !idsEncontrados.includes(p.toString()));
                
                console.error('❌ IDs de proveedores en detalles no encontrados:', idsNoEncontrados);
                
                return res.status(404).json({
                    success: false,
                    message: 'Uno o más proveedores en los detalles no existen',
                    detalles: {
                        proveedoresNoEncontrados: idsNoEncontrados,
                        totalUnicos: proveedoresEnDetalles.length,
                        totalEncontrados: proveedoresDetalleValidos.length
                    }
                });
            }
        }

        // Procesar fecha
        const fecha = fecha_mantenimiento ? new Date(fecha_mantenimiento) : new Date();
        const mes = fecha.getMonth() + 1;
        const ano = fecha.getFullYear();

        // Calcular detalles y costo total
        let costoTotal = 0;
        const detalleCalculados = detalles.map(detalle => {
            const cantidad = Number(detalle.cantidad) || 1;
            const precioUnitario = Number(detalle.precioUnitario) || 0;
            const subtotal = detalle.subTotal || (cantidad * precioUnitario);
            costoTotal += subtotal;

            let proveedorValido = null;
            if (detalle.proveedor && typeof detalle.proveedor === 'string') {
                const provTrimmed = detalle.proveedor.trim();
                if (provTrimmed !== '' && mongoose.Types.ObjectId.isValid(provTrimmed)) {
                    proveedorValido = provTrimmed;
                }
            }

            return {
                concepto: detalle.concepto,
                cantidad: cantidad,
                precioUnitario: precioUnitario,
                subTotal: subtotal,
                proveedor: proveedorValido
            };
        });

        console.log('💰 Costo total calculado:', costoTotal);
        console.log('📋 Detalles procesados:', detalleCalculados.length);

        const nuevoMantenimiento = new MantenimientoCamiones({
            ciculatioCard,
            fecha_mantenimiento: fecha,
            mes,
            ano,
            tipo_de_mantenimiento,
            descripcion,
            proveedores: proveedoresLimpios,
            detalles: detalleCalculados,
            costoTotal,
            estado: estado || 'pendiente'
        });

        await nuevoMantenimiento.save();
        console.log('✅ Mantenimiento guardado con ID:', nuevoMantenimiento._id);
        
        await nuevoMantenimiento.populate([
            { 
                path: 'ciculatioCard', 
                select: 'name brand model state licensePlate' 
            },
            { 
                path: 'proveedores', 
                select: 'companyName telefono email'
            },
            { 
                path: 'detalles.proveedor', 
                select: 'companyName'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Mantenimiento registrado exitosamente',
            data: nuevoMantenimiento
        });

    } catch (error) {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('❌ Stack trace:', error.stack);

        if(error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación de datos',
                errors: Object.values(error.errors).map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        if(error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Formato de ID inválido',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno al registrar el mantenimiento',
            error: error.message
        });
    }
};

//# Método actualizar la info del mantenimiento
//# Método actualizar la info del mantenimiento
mantenimientoCon.ActualizarMantenimiento = async (req, res) => {
    try {
        const { id } = req.params;

        if(!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Id del mantenimiento no identificado",
                error: "El id proporcionado no tiene un formato válido"
            });
        }

        const mantoExisting = await MantenimientoCamiones.findById(id);
        if(!mantoExisting) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado",
                error: `No existe un mantenimiento registrado con el ID: ${id}`
            });
        }

        const {
            fecha_mantenimiento,
            tipo_de_mantenimiento,
            descripcion,
            detalles,
            proveedores,
            estado
        } = req.body;

        console.log('📝 PUT /mantenimientos/:id - Actualizando mantenimiento:', id);

        // Actualizar fecha y calcular mes/año si se proporciona nueva fecha
        if(fecha_mantenimiento) {
            const nuevaFecha = new Date(fecha_mantenimiento);
            mantoExisting.fecha_mantenimiento = nuevaFecha;
            mantoExisting.mes = nuevaFecha.getMonth() + 1;
            mantoExisting.ano = nuevaFecha.getFullYear();
        }

        // Actualizar tipo de mantenimiento si se proporciona
        if(tipo_de_mantenimiento) {
            mantoExisting.tipo_de_mantenimiento = tipo_de_mantenimiento;
        }

        // Actualizar descripción si se proporciona
        if(descripcion) {
            mantoExisting.descripcion = descripcion;
        }

        // ✅ Actualizar proveedores con filtrado y deduplicación
        if(proveedores !== undefined) {
            const proveedoresLimpios = Array.isArray(proveedores) 
                ? [...new Set(proveedores.filter(p => {
                    if (!p || (typeof p === 'string' && p.trim() === '')) {
                        return false;
                    }
                    return mongoose.Types.ObjectId.isValid(p);
                }))]
                : [];

            console.log('🔍 Proveedores a actualizar (originales):', proveedores);
            console.log('✅ Proveedores a actualizar (únicos y válidos):', proveedoresLimpios);

            if(proveedoresLimpios.length > 0) {
                const proveedoresValidos = await Proveedores.find({
                    '_id': { $in: proveedoresLimpios }
                });

                console.log(`📊 Proveedores encontrados: ${proveedoresValidos.length}/${proveedoresLimpios.length}`);

                if(proveedoresValidos.length !== proveedoresLimpios.length) {
                    const idsEncontrados = proveedoresValidos.map(p => p._id.toString());
                    const idsNoEncontrados = proveedoresLimpios.filter(p => !idsEncontrados.includes(p.toString()));
                    
                    console.error('❌ IDs de proveedores no encontrados:', idsNoEncontrados);
                    
                    return res.status(404).json({
                        success: false,
                        message: 'Uno o más proveedores no existen',
                        detalles: {
                            proveedoresNoEncontrados: idsNoEncontrados,
                            totalEnviados: proveedoresLimpios.length,
                            totalEncontrados: proveedoresValidos.length
                        }
                    });
                }
            }
            
            mantoExisting.proveedores = proveedoresLimpios;
        }

        // Actualizar estado del mantenimiento
        if(estado) {
            const estadoAnterior = mantoExisting.estado;
            mantoExisting.estado = estado;

            // Si el estado cambia a "completado", actualizar el camión a "DISPONIBLE"
            if(estado === 'completado' && estadoAnterior !== 'completado') {
                try {
                    const camionId = mantoExisting.ciculatioCard;
                    await camiones.findByIdAndUpdate(
                        camionId,
                        { state: 'DISPONIBLE' },
                        { new: true }
                    );
                    console.log(`✅ Camión ${camionId} actualizado a DISPONIBLE`);
                } catch (camionError) {
                    console.error('❌ Error al actualizar estado del camión:', camionError);
                }
            }
        }

        // ✅ Actualizar detalles con filtrado y deduplicación de proveedores
        if(detalles && Array.isArray(detalles)) {
            // Extraer proveedores de detalles
            const proveedoresEnDetallesSinFiltrar = detalles
                .filter(d => d.proveedor && typeof d.proveedor === 'string' && d.proveedor.trim() !== '')
                .map(d => d.proveedor.trim())
                .filter(p => mongoose.Types.ObjectId.isValid(p));

            // ✅ CLAVE: Eliminar duplicados
            const proveedoresEnDetalles = [...new Set(proveedoresEnDetallesSinFiltrar)];

            console.log('🔍 Proveedores en detalles (con duplicados):', proveedoresEnDetallesSinFiltrar);
            console.log('🔍 Proveedores en detalles (únicos):', proveedoresEnDetalles);

            if(proveedoresEnDetalles.length > 0) {
                const proveedoresDetalleValidos = await Proveedores.find({
                    '_id': { $in: proveedoresEnDetalles }
                });

                console.log(`📊 Proveedores de detalles en DB: ${proveedoresDetalleValidos.length}/${proveedoresEnDetalles.length}`);

                if(proveedoresDetalleValidos.length !== proveedoresEnDetalles.length) {
                    const idsEncontrados = proveedoresDetalleValidos.map(p => p._id.toString());
                    const idsNoEncontrados = proveedoresEnDetalles.filter(p => !idsEncontrados.includes(p.toString()));
                    
                    console.error('❌ IDs de proveedores en detalles no encontrados:', idsNoEncontrados);
                    
                    return res.status(404).json({
                        success: false,
                        message: 'Uno o más proveedores en los detalles no existen',
                        detalles: {
                            proveedoresNoEncontrados: idsNoEncontrados,
                            totalUnicos: proveedoresEnDetalles.length,
                            totalEncontrados: proveedoresDetalleValidos.length
                        }
                    });
                }
            }

            let costoTotal = 0;
            const detalleCalculados = detalles.map(detalle => {
                const cantidad = Number(detalle.cantidad) || 1;
                const precioUnitario = Number(detalle.precioUnitario) || 0;
                const subtotal = detalle.subTotal || (cantidad * precioUnitario);
                costoTotal += subtotal;

                // ✅ Solo incluir proveedor si es válido
                let proveedorValido = null;
                if (detalle.proveedor && typeof detalle.proveedor === 'string') {
                    const provTrimmed = detalle.proveedor.trim();
                    if (provTrimmed !== '' && mongoose.Types.ObjectId.isValid(provTrimmed)) {
                        proveedorValido = provTrimmed;
                    }
                }

                return {
                    concepto: detalle.concepto,
                    cantidad: cantidad,
                    precioUnitario: precioUnitario,
                    subTotal: subtotal,
                    proveedor: proveedorValido
                };
            });

            mantoExisting.detalles = detalleCalculados;
            mantoExisting.costoTotal = costoTotal;
            
            console.log('💰 Costo total recalculado:', costoTotal);
        }

        // Guardar los cambios
        await mantoExisting.save();
        console.log('✅ Mantenimiento actualizado exitosamente');
        
        // Populate con proveedores
        await mantoExisting.populate([
            { 
                path: 'ciculatioCard', 
                select: 'name brand model state licensePlate' 
            },
            { 
                path: 'proveedores', 
                select: 'companyName telefono email' // ← CAMBIO: companyName
            },
            { 
                path: 'detalles.proveedor', 
                select: 'companyName' // ← CAMBIO: companyName
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Mantenimiento actualizado exitosamente',
            data: mantoExisting
        });

    } catch (error) {
        console.error('❌ Error al actualizar mantenimiento:', error);
        console.error('❌ Stack trace:', error.stack);

        if(error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        if(error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Formato de ID inválido',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar el mantenimiento',
            error: error.message
        });
    }
};
//# Método para eliminar registro del mantenimiento
mantenimientoCon.DeleteManto = async(req, res) => {
    try {
        const { id } = req.params;

        if(!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Id del mantenimiento no identificado",
                error: "El id proporcionado no tiene un formato válido"
            });
        }

        const mantoEliminado = await MantenimientoCamiones.findByIdAndDelete(id);

        if(!mantoEliminado) {
            return res.status(404).json({
                success: false,
                message: "Mantenimiento no encontrado",
                error: `No existe un mantenimiento registrado con el ID: ${id}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mantenimiento eliminado exitosamente',
            data: {
                id: mantoEliminado._id,
                descripcion: mantoEliminado.descripcion,
                fecha: mantoEliminado.fecha_mantenimiento,
                costoTotal: mantoEliminado.costoTotal
            }
        });

    } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el mantenimiento',
            error: error.message
        });
    }
};

export default mantenimientoCon;