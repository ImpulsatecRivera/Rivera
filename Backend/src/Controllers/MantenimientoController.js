import MantenimientoCamiones from "../Models/MantenimientoCamiones.js";
import camiones from "../Models/Camiones.js";
import mongoose, { isValidObjectId } from 'mongoose'; // Cambiar a import, no require

const mantenimientoCon = {};

//# obtener lista de mantenimientos de camiones
mantenimientoCon.getMantenimineto = async(req, res) => {
    try {
        const manto = await MantenimientoCamiones.find()
            .populate({
                path: "ciculatioCard",
                select: "name brand model state age licensePlate"
            });
        
        if(!manto || manto.length === 0) {
            return res.status(200).json({
                message: "No se encontró ningún mantenimiento",
                data: []
            });
        }
        
        // Formatear cada mantenimiento para incluir mes y año
        const mantenimientosFormateados = manto.map(m => ({
            _id: m._id,
            fecha_mantenimiento: m.fecha_mantenimiento,
            mes: m.mes,
            ano: m.ano,
            tipo_de_mantenimiento: m.tipo_de_mantenimiento,
            descripcion: m.descripcion,
            detalles: m.detalles,
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
            
            // Detalles de costos
           detalles: manto.detalles.map(detalle => ({
    concepto: detalle.concepto,
    cantidad: detalle.cantidad,
    precioUnitario: detalle.precioUnitario,
    subTotal: detalle.subTotal,  // ← Cambiar a camelCase
    subtotalFormateado: `$${detalle.subTotal.toFixed(2)}`
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
mantenimientoCon.postMantenimiento = async(req, res) => {
    try {
        const {
            ciculatioCard,
            fecha_mantenimiento,
            tipo_de_mantenimiento,
            descripcion,
            detalles
        } = req.body;

        const camionExist = await camiones.findById(ciculatioCard);
        if(!camionExist) {
            return res.status(404).json({
                success: false,
                message: 'Camión no encontrado'
            });
        }

        const fecha = fecha_mantenimiento ? new Date(fecha_mantenimiento) : new Date();
        const mes = fecha.getMonth() + 1;
        const ano = fecha.getFullYear();

        let costoTotal = 0;
        const detalleCalculados = detalles?.map(detalle => {
            const subtotal = detalle.subTotal || (detalle.cantidad * detalle.precioUnitario);
            costoTotal += subtotal;

            return {
                concepto: detalle.concepto,
                cantidad: detalle.cantidad || 1,
                precioUnitario: detalle.precioUnitario || 0,
                subTotal: subtotal
            };
        }) || [];

        const nuevoMantenimiento = new MantenimientoCamiones({
            ciculatioCard,
            fecha_mantenimiento: fecha,
            mes,
            ano,
            tipo_de_mantenimiento,
            descripcion,
            detalles: detalleCalculados,
            costoTotal
        });

        await nuevoMantenimiento.save();
        await nuevoMantenimiento.populate('ciculatioCard', 'name brand model state licensePlate');

        res.status(201).json({
            success: true,
            message: 'Mantenimiento registrado exitosamente',
            data: nuevoMantenimiento
        });
    } catch (error) {
        console.error('Error al registrar el mantenimiento del camión:', error);

        if(error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al registrar el mantenimiento',
            error: error.message
        });
    }
};

//#Metodo actualizar la info del manto
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
            detalles
        } = req.body;

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

        // Actualizar detalles y recalcular costo total si se proporcionan
        if(detalles && Array.isArray(detalles)) {
            let costoTotal = 0;
            const detalleCalculados = detalles.map(detalle => {
                const subtotal = detalle.subTotal || (detalle.cantidad * detalle.precioUnitario);
                costoTotal += subtotal;

                return {
                    concepto: detalle.concepto,
                    cantidad: detalle.cantidad || 1,
                    precioUnitario: detalle.precioUnitario || 0,
                    subTotal: subtotal
                };
            });

            mantoExisting.detalles = detalleCalculados;
            mantoExisting.costoTotal = costoTotal;
        }

        // Guardar los cambios
        await mantoExisting.save();
        await mantoExisting.populate('ciculatioCard', 'name brand model state licensePlate');

        res.status(200).json({
            success: true,
            message: 'Mantenimiento actualizado exitosamente',
            data: mantoExisting
        });

    } catch (error) {
        console.error('Error al actualizar mantenimiento:', error);

        if(error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
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