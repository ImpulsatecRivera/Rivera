/**
 * Controlador para Planillas Semanales
 * Calcula salario base semanal para empleados con tipoSalario="semanal"
 */

import PlanillaSemanal from "../Models/PlanillaSemanal.js";
import Empleado from "../Models/Empleados.js";
import Motorista from "../Models/Motorista.js";
import { isValidObjectId } from 'mongoose';

const PlanillaSemanalController = {};

/**
 * Redondear correctamente valores monetarios a 2 decimales
 */
const redondearDinero = (valor) => {
    const str = (valor * 100).toFixed(10);
    const num = parseFloat(str);
    return Math.round(num) / 100;
};

/**
 * Obtener y validar salario (maneja String y Number)
 */
const obtenerSalarioValido = (empleadoData, nombreCompleto, tipoEmpleado) => {
    let salarioMensual = empleadoData.salary || empleadoData.salario || 0;

    if (typeof salarioMensual === 'string') {
        salarioMensual = parseFloat(salarioMensual.replace(/[^0-9.-]/g, ''));
        
        if (isNaN(salarioMensual)) {
            console.error('❌ Error: El salario no es válido:', {
                empleado: nombreCompleto,
                tipo: tipoEmpleado,
                salarioOriginal: empleadoData.salario || empleadoData.salary
            });
            throw new Error(`El salario de ${nombreCompleto} no es un número válido`);
        }
    }

    if (!salarioMensual || salarioMensual <= 0) {
        throw new Error(`El salario de ${nombreCompleto} debe ser mayor a 0. Salario actual: ${salarioMensual}`);
    }

    return salarioMensual;
};

/**
 * Generar array de días con fechas (lunes a sábado)
 */
const generarDiasSemana = (fechaInicio) => {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const resultado = [];
    const fecha = new Date(fechaInicio);

    for (let i = 0; i < 6; i++) {
        resultado.push({
            dia: dias[i],
            fecha: new Date(fecha),
            base: 0,
            viaticos: 0,
            faltaInjustificada: false,
            descuentoFalta: 0
        });
        fecha.setDate(fecha.getDate() + 1);
    }

    return resultado;
};

/**
 * Calcular totales de un empleado
 */
const calcularTotalesEmpleado = (empleado) => {
    const totalBase = empleado.dias.reduce((sum, d) => sum + (d.base || 0), 0);
    const totalViaticos = empleado.dias.reduce((sum, d) => sum + (d.viaticos || 0), 0);
    
    // Sumar todos los descuentos de faltas injustificadas
    const totalDescuentosFaltas = empleado.dias.reduce((sum, d) => sum + (d.descuentoFalta || 0), 0);
    
    // totalDescuentos son SOLO las faltas (NO incluye anticipos)
    const totalDescuentos = totalDescuentosFaltas;
    
    // ✅ Lógica de anticipos según planillaTipo:
    // - Semanal: anticipos se RESTAN (ya recibieron dinero de esta misma semana)
    // - Quincenal/Mensual: anticipos se SUMAN (es un pago extra, su paga aún no llega)
    let totalAPagar;
    if (empleado.planillaTipo === 'Semanal') {
        // Empleados semanales: restar anticipos
        totalAPagar = totalBase + totalViaticos - (empleado.anticipos || 0) - totalDescuentos;
    } else {
        // Empleados quincenales/mensuales: sumar anticipos
        totalAPagar = totalBase + totalViaticos + (empleado.anticipos || 0) - totalDescuentos;
    }

    return {
        totalBase: redondearDinero(totalBase),
        totalViaticos: redondearDinero(totalViaticos),
        totalDescuentos: redondearDinero(totalDescuentos),
        totalAPagar: redondearDinero(totalAPagar)
    };
};

/**
 * Calcular totales generales de la planilla
 */
const calcularTotalesGenerales = (empleados) => {
    const totales = {
        totalBase: 0,
        totalViaticos: 0,
        totalAnticipos: 0,
        totalDescuentos: 0,
        totalAPagar: 0
    };

    empleados.forEach(emp => {
        totales.totalBase += emp.totalBase || 0;
        totales.totalViaticos += emp.totalViaticos || 0;
        totales.totalAnticipos += emp.anticipos || 0;
        totales.totalDescuentos += emp.totalDescuentos || 0;
        totales.totalAPagar += emp.totalAPagar || 0;
    });

    Object.keys(totales).forEach(key => {
        totales[key] = redondearDinero(totales[key]);
    });

    return totales;
};

/**
 * Crear una nueva planilla semanal
 * POST /api/planillas/semanal
 */
PlanillaSemanalController.crear = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, diasHabiles, empleados } = req.body;

        // Validar campos requeridos
        if (!fechaInicio || !fechaFin || !diasHabiles) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: fechaInicio, fechaFin, diasHabiles'
            });
        }

        // Convertir fechas forzando zona horaria local (El Salvador)
        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T23:59:59');

        // Validar que fechaInicio sea lunes
        if (inicio.getDay() !== 1) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser un lunes'
            });
        }

        // Validar que fechaFin sea sábado
        if (fin.getDay() !== 6) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser un sábado'
            });
        }

        // Validar que el periodo no supere una semana (lunes a sábado)
        // Comparamos las fechas en 00:00:00 para contar días enteros
        const inicioDia = new Date(fechaInicio + 'T00:00:00');
        const finDia = new Date(fechaFin + 'T00:00:00');
        const msPorDia = 24 * 60 * 60 * 1000;
        const diasIncl = Math.round((finDia - inicioDia) / msPorDia) + 1;

        if (isNaN(diasIncl) || diasIncl < 1) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
            });
        }

        if (diasIncl > 6) {
            return res.status(400).json({
                success: false,
                message: 'El período debe cubrir como máximo una semana (lunes a sábado, 6 días)'
            });
        }

        // Validar días hábiles
        const diasHabilesNum = parseInt(diasHabiles);
        if (isNaN(diasHabilesNum) || diasHabilesNum < 20 || diasHabilesNum > 31) {
            return res.status(400).json({
                success: false,
                message: 'Los días hábiles deben estar entre 20 y 31'
            });
        }

        // Verificar si ya existe una planilla para este período
        const planillaExistente = await PlanillaSemanal.findOne({
            $or: [
                { fechaInicio: inicio, fechaFin: fin },
                {
                    $and: [
                        { fechaInicio: { $lte: fin } },
                        { fechaFin: { $gte: inicio } }
                    ]
                }
            ]
        });

        if (planillaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una planilla para este período o uno que se solapa'
            });
        }

        // Crear nueva planilla
        const nuevaPlanilla = new PlanillaSemanal({
            fechaInicio: inicio,
            fechaFin: fin,
            diasHabiles: diasHabilesNum,
            estado: 'pendiente',
            empleados: []
        });

        await nuevaPlanilla.save();

        res.status(201).json({
            success: true,
            message: 'Planilla semanal creada exitosamente',
            data: nuevaPlanilla
        });

    } catch (error) {
        console.error('Error al crear planilla semanal:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la planilla semanal',
            error: error.message
        });
    }
};

/**
 * Obtener todas las planillas semanales con filtros
 * GET /api/planillas/semanal?estado=pendiente&page=1&limit=10
 */
PlanillaSemanalController.obtenerTodas = async (req, res) => {
    try {
        const { estado, page = 1, limit = 10 } = req.query;

        const filtro = {};
        if (estado) filtro.estado = estado;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const planillas = await PlanillaSemanal.find(filtro)
            .sort({ fechaInicio: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PlanillaSemanal.countDocuments(filtro);

        res.status(200).json({
            success: true,
            data: planillas,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener planillas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las planillas',
            error: error.message
        });
    }
};

/**
 * Obtener una planilla por ID
 * GET /api/planillas/semanal/:id
 */
PlanillaSemanalController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: planilla
        });
    } catch (error) {
        console.error('Error al obtener planilla:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la planilla',
            error: error.message
        });
    }
};

/**
 * Actualizar datos de un empleado en la planilla
 * PUT /api/planillas/semanal/:id/empleado/:empleadoId
 */
PlanillaSemanalController.actualizarEmpleado = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;
        const { dias, anticipos, descuentos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden editar empleados de una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        // Actualizar días si se envían
        if (dias && Array.isArray(dias)) {
            planilla.empleados[empleadoIndex].dias = dias;
        }

        // Actualizar anticipos y descuentos
        if (anticipos !== undefined) {
            planilla.empleados[empleadoIndex].anticipos = anticipos;
        }
        if (descuentos !== undefined) {
            planilla.empleados[empleadoIndex].descuentos = descuentos;
        }

        // Recalcular totales del empleado
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalBase = totales.totalBase;
        planilla.empleados[empleadoIndex].totalViaticos = totales.totalViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            data: planilla
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el empleado',
            error: error.message
        });
    }
};

/**
 * Agregar un nuevo empleado a la planilla
 * POST /api/planillas/semanal/:id/empleado
 */
PlanillaSemanalController.agregarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { empleadoId, anticipos, descuentos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden agregar empleados a una planilla pagada'
            });
        }

        // Verificar si el empleado ya está
        const empleadoExiste = planilla.empleados.some(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoExiste) {
            return res.status(400).json({
                success: false,
                message: 'El empleado ya está en esta planilla'
            });
        }

        // Buscar primero en Empleados, luego en Motoristas
        let empleadoData = await Empleado.findById(empleadoId);
        let tipoEmpleado = 'empleado';

        if (!empleadoData) {
            empleadoData = await Motorista.findById(empleadoId);
            tipoEmpleado = 'motorista';
        }

        if (!empleadoData) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en ninguna tabla'
            });
        }

        const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();
        const salarioMensual = obtenerSalarioValido(empleadoData, nombreCompleto, tipoEmpleado);
        const planillaTipo = empleadoData.planillaTipo || '';

        // Generar días de la semana con fechas
        const dias = generarDiasSemana(planilla.fechaInicio);

        // ✅ Si planillaTipo es "Semanal", calcular base diaria automáticamente
        // Base diaria = salarioMensual / diasHabiles
        if (planillaTipo === 'Semanal' && salarioMensual > 0) {
            const baseDiaria = redondearDinero(salarioMensual / planilla.diasHabiles);
            
            // Asignar base a cada día
            dias.forEach(dia => {
                dia.base = baseDiaria;
            });
        }

        const nuevoEmpleado = {
            empleadoId,
            tipo: tipoEmpleado,
            nombreCompleto,
            planillaTipo,  // ✅ Guardar para saber cómo calcular anticipos
            dias,
            totalBase: 0,
            totalViaticos: 0,
            anticipos: 0,
            totalAPagar: 0
        };

        // Calcular totales iniciales
        const totales = calcularTotalesEmpleado(nuevoEmpleado);
        nuevoEmpleado.totalBase = totales.totalBase;
        nuevoEmpleado.totalViaticos = totales.totalViaticos;
        nuevoEmpleado.totalDescuentos = totales.totalDescuentos;
        nuevoEmpleado.totalAPagar = totales.totalAPagar;

        planilla.empleados.push(nuevoEmpleado);
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Empleado agregado exitosamente',
            data: planilla
        });
    } catch (error) {
        console.error('Error al agregar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar el empleado',
            error: error.message
        });
    }
};

/**
 * Eliminar un empleado de la planilla
 * DELETE /api/planillas/semanal/:id/empleado/:empleadoId
 */
PlanillaSemanalController.eliminarEmpleado = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden eliminar empleados de una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        planilla.empleados.splice(empleadoIndex, 1);
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Empleado eliminado exitosamente',
            data: planilla
        });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el empleado',
            error: error.message
        });
    }
};

/**
 * Cambiar estado de la planilla
 * PATCH /api/planillas/semanal/:id/estado
 */
PlanillaSemanalController.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, fechaPago, fechaCierre, fechaAprobacion, pagada } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        const estadosValidos = ['pendiente', 'aprobada', 'pagada'];
        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido',
                estadosValidos
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        const estadoActual = planilla.estado;

        // Validar que no se pueda cambiar si ya está pagada
        if (estadoActual === 'pagada' && estado) {
            return res.status(400).json({
                success: false,
                message: 'No se puede cambiar el estado de una planilla pagada (estado final)'
            });
        }

        // ✅ NUEVA VALIDACIÓN: No permitir aprobar/pagar planilla vacía
        if (estado && ['aprobada', 'pagada'].includes(estado)) {
            if (!planilla.empleados || planilla.empleados.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede cambiar el estado a "' + estado + '" porque la planilla no tiene empleados'
                });
            }
        }

        // ✅ NUEVA VALIDACIÓN: No permitir regresar de aprobada a pendiente
        if (estadoActual === 'aprobada' && estado === 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'No se puede regresar de estado "aprobada" a "pendiente"'
            });
        }

        // ✅ NUEVA VALIDACIÓN: No permitir regresar de pagada a aprobada o pendiente
        if (estadoActual === 'pagada' && ['aprobada', 'pendiente'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'No se puede regresar de estado "pagada". Este es el estado final'
            });
        }

        const now = new Date();

        // Marcar como pagada
        if (pagada !== undefined) {
            if (pagada === true) {
                // ✅ VALIDAR que la planilla tenga empleados
                if (!planilla.empleados || planilla.empleados.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se puede marcar como pagada una planilla sin empleados'
                    });
                }

                if (estadoActual === 'pendiente' && (!estado || estado === 'pendiente')) {
                    return res.status(400).json({
                        success: false,
                        message: 'La planilla debe estar aprobada para poder marcarla como pagada'
                    });
                }

                if (!fechaPago) {
                    return res.status(400).json({
                        success: false,
                        message: 'Se requiere la fecha de pago cuando se marca como pagada'
                    });
                }

                const fechaPagoDate = new Date(fechaPago);
                if (isNaN(fechaPagoDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha de pago no es válida'
                    });
                }

                if (fechaPagoDate > now) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha de pago no puede ser una fecha futura'
                    });
                }

                planilla.pagada = true;
                planilla.fechaPago = fechaPagoDate;
            } else {
                planilla.pagada = false;
                planilla.fechaPago = undefined;
            }
        }

        // Si el nuevo estado es 'aprobada'
        if (estado === 'aprobada') {
            if (fechaAprobacion) {
                const fechaAprobDate = new Date(fechaAprobacion);
                if (isNaN(fechaAprobDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha de aprobación no es válida'
                    });
                }

                if (fechaAprobDate > now) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha de aprobación no puede ser una fecha futura'
                    });
                }

                planilla.fechaAprobacion = fechaAprobDate;
            } else {
                planilla.fechaAprobacion = now;
            }
        }

        // Cambiar estado si se especificó
        if (estado) {
            planilla.estado = estado;
        }

        await planilla.save();

        res.status(200).json({
            success: true,
            message: estado 
                ? `Estado cambiado de ${estadoActual} a ${estado} exitosamente`
                : 'Planilla actualizada exitosamente',
            data: planilla
        });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado',
            error: error.message
        });
    }
};

/**
 * Eliminar una planilla completa
 * DELETE /api/planillas/semanal/:id
 */
PlanillaSemanalController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden eliminar planillas en estado pendiente'
            });
        }

        await PlanillaSemanal.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Planilla eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar planilla:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la planilla',
            error: error.message
        });
    }
};

/**
 * Obtener planillas por empleado
 * GET /api/planillas/semanal/empleado/:empleadoId
 */
PlanillaSemanalController.obtenerPorEmpleado = async (req, res) => {
    try {
        const { empleadoId } = req.params;

        if (!isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de empleado inválido'
            });
        }

        // Security: If requester is an employee or motorista, allow only own planillas
        if (req.user && (req.user.userType === 'motorista' || req.user.userType === 'empleado')) {
            if (String(req.user.id) !== String(empleadoId)) {
                return res.status(403).json({ success: false, message: 'Access denied: can only view your own planillas' });
            }
        }

        const filtro = {
            'empleados.empleadoId': empleadoId
        };

        const planillas = await PlanillaSemanal.find(filtro)
            .sort({ fechaInicio: -1 });

        const planillasFiltradas = planillas.map(planilla => {
            const empleadoEnPlanilla = planilla.empleados.find(
                emp => emp.empleadoId.toString() === empleadoId
            );

            return {
                _id: planilla._id,
                fechaInicio: planilla.fechaInicio,
                fechaFin: planilla.fechaFin,
                diasHabiles: planilla.diasHabiles,
                estado: planilla.estado,
                empleado: empleadoEnPlanilla
            };
        });

        res.status(200).json({
            success: true,
            data: planillasFiltradas
        });
    } catch (error) {
        console.error('Error al obtener planillas del empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las planillas',
            error: error.message
        });
    }
};

/**
 * Actualizar un día específico de un empleado (principalmente viáticos)
 * PATCH /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia
 */
PlanillaSemanalController.actualizarDia = async (req, res) => {
    try {
        const { id, empleadoId, dia } = req.params;
        const { viaticos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (!dia) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "dia" es requerido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede editar una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        // Buscar el día específico
        const diaIndex = planilla.empleados[empleadoIndex].dias.findIndex(d => d.dia === dia);
        if (diaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Día no encontrado en el registro del empleado'
            });
        }

        // Actualizar solo viáticos (base no se toca, se calculó al agregar)
        if (viaticos !== undefined) {
            planilla.empleados[empleadoIndex].dias[diaIndex].viaticos = parseFloat(viaticos) || 0;
        }

        // Recalcular totales del empleado
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalBase = totales.totalBase;
        planilla.empleados[empleadoIndex].totalViaticos = totales.totalViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Día actualizado exitosamente',
            data: {
                empleado: planilla.empleados[empleadoIndex],
                diaActualizado: planilla.empleados[empleadoIndex].dias[diaIndex]
            }
        });

    } catch (error) {
        console.error('Error al actualizar día:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar día',
            error: error.message
        });
    }
};

/**
 * Actualizar anticipos de un empleado
 * PATCH /api/planillas/semanal/:id/empleado/:empleadoId/montos
 */
PlanillaSemanalController.actualizarMontos = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;
        const { anticipos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede editar una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        // Actualizar anticipos
        if (anticipos !== undefined) {
            planilla.empleados[empleadoIndex].anticipos = Math.max(0, parseFloat(anticipos) || 0);
        }

        // Recalcular totales del empleado (automáticamente suma o resta según planillaTipo)
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalBase = totales.totalBase;
        planilla.empleados[empleadoIndex].totalViaticos = totales.totalViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Anticipos actualizados exitosamente',
            data: planilla.empleados[empleadoIndex]
        });

    } catch (error) {
        console.error('Error al actualizar montos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar montos',
            error: error.message
        });
    }
};

/**
 * Marcar falta injustificada en un día específico
 * POST /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia/falta
 */
PlanillaSemanalController.marcarFaltaInjustificada = async (req, res) => {
    try {
        const { id, empleadoId, dia } = req.params;
        const { descuentoFalta } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (!dia) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "dia" es requerido'
            });
        }

        if (!descuentoFalta || descuentoFalta <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El campo "descuentoFalta" es requerido y debe ser mayor a 0'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden marcar faltas en una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        // Buscar el día específico por nombre
        const diaIndex = planilla.empleados[empleadoIndex].dias.findIndex(
            d => d.dia === dia
        );
        
        if (diaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Día no encontrado en el registro del empleado'
            });
        }

        // Marcar falta injustificada y asignar/actualizar monto
        planilla.empleados[empleadoIndex].dias[diaIndex].faltaInjustificada = true;
        planilla.empleados[empleadoIndex].dias[diaIndex].descuentoFalta = redondearDinero(parseFloat(descuentoFalta));

        // Recalcular totales del empleado (automáticamente suma todos los descuentoFalta)
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalBase = totales.totalBase;
        planilla.empleados[empleadoIndex].totalViaticos = totales.totalViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Falta injustificada marcada exitosamente',
            data: {
                empleado: planilla.empleados[empleadoIndex],
                diaActualizado: planilla.empleados[empleadoIndex].dias[diaIndex]
            }
        });

    } catch (error) {
        console.error('Error al marcar falta injustificada:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar falta injustificada',
            error: error.message
        });
    }
};

/**
 * Desmarcar falta injustificada en un día específico
 * DELETE /api/planillas/semanal/:id/empleado/:empleadoId/dia/:dia/falta
 */
PlanillaSemanalController.desmarcarFaltaInjustificada = async (req, res) => {
    try {
        const { id, empleadoId, dia } = req.params;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (!dia) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "dia" es requerido'
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden desmarcar faltas en una planilla pagada'
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en esta planilla'
            });
        }

        // Buscar el día específico por nombre
        const diaIndex = planilla.empleados[empleadoIndex].dias.findIndex(
            d => d.dia === dia
        );
        
        if (diaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Día no encontrado en el registro del empleado'
            });
        }

        // Desmarcar falta injustificada
        planilla.empleados[empleadoIndex].dias[diaIndex].faltaInjustificada = false;

        // Limpiar el monto de descuentoFalta del día específico
        planilla.empleados[empleadoIndex].dias[diaIndex].descuentoFalta = 0;

        // Recalcular totales del empleado (automáticamente recalcula sin este descuentoFalta)
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalBase = totales.totalBase;
        planilla.empleados[empleadoIndex].totalViaticos = totales.totalViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Falta injustificada desmarcada exitosamente',
            data: {
                empleado: planilla.empleados[empleadoIndex],
                diaActualizado: planilla.empleados[empleadoIndex].dias[diaIndex]
            }
        });

    } catch (error) {
        console.error('Error al desmarcar falta injustificada:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desmarcar falta injustificada',
            error: error.message
        });
    }
};

export default PlanillaSemanalController;