/**
 * Controlador para Planillas Semanales
 * Calcula salario base semanal para empleados con tipoSalario="semanal"
 */

import PlanillaSemanal from "../Models/PlanillaSemanal.js";
import Empleado from "../Models/Empleados.js";
import Motorista from "../Models/Motorista.js";
import Viajes from "../Models/Viajes.js";
import { isValidObjectId } from 'mongoose';

const PlanillaSemanalController = {};

/**
 * Obtener el día de la semana en UTC
 * 0 = domingo, 1 = lunes, 2 = martes, ... 6 = sábado
 */
function getDayInUTC(date) {
    return date.getUTCDay();
}

/**
 * Convertir una fecha a Date object
 * Maneja tanto strings ISO completos como YYYY-MM-DD
 */
function parseDateToUTC(dateInput) {
    // Si ya es un Date object, devolverlo
    if (dateInput instanceof Date) {
        return dateInput;
    }
    
    // Si es un string ISO completo (con T y hora)
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
        return new Date(dateInput);
    }
    
    // Si es formato YYYY-MM-DD simple
    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }
    
    // Fallback: intentar parsear como Date
    return new Date(dateInput);
}

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

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const obtenerDiaSemanaUTC = (fecha) => {
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    if (Number.isNaN(date.getTime())) return null;
    return DIAS_SEMANA[date.getUTCDay()] || null;
};

const obtenerRangoPlanillaUTC = (planilla) => {
    const inicio = new Date(planilla.fechaInicio);
    inicio.setUTCHours(0, 0, 0, 0);

    const fin = new Date(planilla.fechaFin);
    fin.setUTCHours(23, 59, 59, 999);

    return { inicio, fin };
};

const extraerParticipantesViaje = (viaje) => {
    const ids = [];

    if (viaje?.conductorId) {
        ids.push(String(viaje.conductorId));
    }

    if (Array.isArray(viaje?.auxiliares)) {
        viaje.auxiliares.forEach((aux) => {
            const auxId = aux?.auxiliarId || aux?._id || aux?.id;
            if (auxId) {
                ids.push(String(auxId));
            }
        });
    }

    return [...new Set(ids)];
};

const reiniciarViaticosPlanilla = (planilla) => {
    if (!planilla?.empleados) return;

    planilla.empleados.forEach((empleado) => {
        if (!Array.isArray(empleado.dias)) return;
        empleado.dias.forEach((dia) => {
            dia.viaticos = 0;
        });
    });
};

const recalcularTotalesPlanilla = (planilla) => {
    if (!planilla?.empleados) return;

    planilla.empleados.forEach((empleado) => {
        const totales = calcularTotalesEmpleado(empleado);
        empleado.totalBase = totales.totalBase;
        empleado.totalViaticos = totales.totalViaticos;
        empleado.totalDescuentos = totales.totalDescuentos;
        empleado.totalAPagar = totales.totalAPagar;
    });

    planilla.totales = calcularTotalesGenerales(planilla.empleados);
};

const obtenerMontosExtraPorParticipante = (viaje, participantes) => {
    const montos = new Map();

    if (Array.isArray(viaje?.montosExtraPersonal) && viaje.montosExtraPersonal.length > 0) {
        viaje.montosExtraPersonal.forEach((item) => {
            const empleadoId = String(item?.empleadoId || '');
            const monto = Number(item?.monto || 0);
            if (!empleadoId || !Number.isFinite(monto) || monto <= 0) return;
            montos.set(empleadoId, monto);
        });
    }

    if (montos.size === 0) {
        const montoComun = Number(viaje?.cantidadViajesExtra || 0);
        if (Number.isFinite(montoComun) && montoComun > 0) {
            participantes.forEach((empleadoId) => {
                montos.set(String(empleadoId), montoComun);
            });
        }
    }

    return montos;
};

const esEstadoCompletado = (estado) => {
    const estadoNormalizado = String(estado || '').trim().toLowerCase();
    return estadoNormalizado === 'completado';
};

const cargarGananciasViajesExtraEnPlanilla = async (planilla) => {
    const { inicio, fin } = obtenerRangoPlanillaUTC(planilla);

    const viajesExtra = await Viajes.find({
        tipoViaje: 'operativo',
        esViajeExtra: true,
        departureTime: { $gte: inicio, $lte: fin },
    }).select('departureTime conductorId auxiliares cantidadViajesExtra montosExtraPersonal estado');

    const planillaEmpleadoIds = new Set((planilla.empleados || []).map((empleado) => String(empleado.empleadoId)));

    reiniciarViaticosPlanilla(planilla);

    viajesExtra.forEach((viaje) => {
        const estadoActual = viaje?.estado?.actual ?? viaje?.estado;
        if (!esEstadoCompletado(estadoActual)) return;

        const diaSemana = obtenerDiaSemanaUTC(viaje.departureTime);
        if (!diaSemana || diaSemana === 'domingo') return;

        const participantes = extraerParticipantesViaje(viaje).filter((id) => planillaEmpleadoIds.has(id));
        const montosPorParticipante = obtenerMontosExtraPorParticipante(viaje, participantes);

        participantes.forEach((empleadoId) => {
            const montoExtra = Number(montosPorParticipante.get(String(empleadoId)) || 0);
            if (!Number.isFinite(montoExtra) || montoExtra <= 0) return;

            const empleado = planilla.empleados.find((item) => String(item.empleadoId) === String(empleadoId));
            if (!empleado) return;

            const diaEmpleado = Array.isArray(empleado.dias)
                ? empleado.dias.find((item) => item.dia === diaSemana)
                : null;

            if (!diaEmpleado) return;

            diaEmpleado.viaticos = redondearDinero((diaEmpleado.viaticos || 0) + montoExtra);
        });
    });

    recalcularTotalesPlanilla(planilla);

    return planilla;
};

PlanillaSemanalController.cargarGananciasViajesExtra = async (req, res) => {
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

        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede recalcular una planilla pagada'
            });
        }

        await cargarGananciasViajesExtraEnPlanilla(planilla);
        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Ganancias por viajes extra cargadas exitosamente',
            data: planilla
        });
    } catch (error) {
        console.error('Error al cargar ganancias por viajes extra:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar ganancias por viajes extra',
            error: error.message
        });
    }
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

        // Convertir fechas usando UTC
        const inicio = parseDateToUTC(fechaInicio);
        const fin = parseDateToUTC(fechaFin);

        // Validar que las fechas sean válidas
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Las fechas proporcionadas no son válidas'
            });
        }

        // Validar que fechaInicio sea lunes (usando UTC)
        if (getDayInUTC(inicio) !== 1) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser un lunes'
            });
        }

        // Validar que fechaFin sea sábado (usando UTC)
        if (getDayInUTC(fin) !== 6) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser un sábado'
            });
        }

        // Validar que el periodo no supere una semana (lunes a sábado)
        const unDiaMs = 24 * 60 * 60 * 1000;
        const diasDiferencia = Math.round((fin.getTime() - inicio.getTime()) / unDiaMs);

        if (diasDiferencia < 0) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
        }

        if (diasDiferencia !== 5) {
            return res.status(400).json({
                success: false,
                message: 'El período debe ser exactamente de lunes a sábado (5 días de diferencia)'
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
            if (planillaExistente.fechaInicio.getTime() === inicio.getTime() && 
                planillaExistente.fechaFin.getTime() === fin.getTime()) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una planilla semanal para exactamente este período (del ' + 
                             inicio.toLocaleDateString('es-ES') + ' al ' + fin.toLocaleDateString('es-ES') + ')'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una planilla semanal que se solapa con el período solicitado. ' +
                             'La planilla existente es del ' + planillaExistente.fechaInicio.toLocaleDateString('es-ES') + 
                             ' al ' + planillaExistente.fechaFin.toLocaleDateString('es-ES') + 
                             '. Por favor, elige un período diferente.'
                });
            }
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

        if (empleadoData.cuentaDesactivada === true) {
            return res.status(400).json({
                success: false,
                message: 'No se puede agregar personal con cuenta desactivada'
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
                    message: `No se puede cambiar el estado a "${estado}" porque la planilla no tiene empleados asignados. Añade al menos un empleado antes de proceder.`
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
        const viaticosActualizados = viaticos;

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

        if (viaticosActualizados === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Debes enviar viaticos para actualizar el día'
            });
        }

        // Actualizar valores editables (base no se toca, se calculó al agregar)
        planilla.empleados[empleadoIndex].dias[diaIndex].viaticos = parseFloat(viaticosActualizados) || 0;

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

/**
 * Obtener la última planilla semanal creada
 * GET /api/planillas/semanal/ultima
 */
PlanillaSemanalController.obtenerUltima = async (req, res) => {
    try {
        const ultimaPlanilla = await PlanillaSemanal.findOne()
            .sort({ createdAt: -1, fechaInicio: -1 })
            .populate('empleados.empleadoId');

        if (!ultimaPlanilla) {
            return res.status(404).json({
                success: false,
                message: 'No hay planillas semanales previas'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Última planilla semanal obtenida',
            data: ultimaPlanilla
        });
    } catch (error) {
        console.error('Error al obtener última planilla semanal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener última planilla semanal',
            error: error.message
        });
    }
};

/**
 * Copiar empleados de la última planilla semanal a una nueva
 * POST /api/planillas/semanal/:id/copiar-datos-anteriores
 */
PlanillaSemanalController.copiarDatosAnteriores = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        // Obtener la planilla actual
        const planillaActual = await PlanillaSemanal.findById(id);
        if (!planillaActual) {
            return res.status(404).json({
                success: false,
                message: 'Planilla semanal no encontrada'
            });
        }

        if (planillaActual.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden agregar empleados a una planilla pagada'
            });
        }

        // Obtener la última planilla anterior (por fecha)
        const ultimaPlanilla = await PlanillaSemanal.findOne({
            _id: { $ne: id },
            fechaInicio: { $lt: planillaActual.fechaInicio }
        }).sort({ fechaInicio: -1 });

        if (!ultimaPlanilla) {
            return res.status(400).json({
                success: false,
                message: 'No se detectan planillas anteriores. Esta es la primera planilla en el sistema. Agrega empleados manualmente.'
            });
        }

        if (!ultimaPlanilla.empleados || ultimaPlanilla.empleados.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La planilla anterior no tiene empleados para copiar'
            });
        }

        // Obtener solo los IDs de empleados de la planilla anterior
        const empleadosIds = ultimaPlanilla.empleados.map(emp => emp.empleadoId.toString());

        let empleadosAgregados = 0;
        let empleadosOmitidos = 0;
        const errores = [];

        // Agregar cada empleado usando la misma lógica que agregarEmpleado
        for (const empleadoId of empleadosIds) {
            try {
                // Verificar si el empleado ya está en la planilla actual
                const empleadoExiste = planillaActual.empleados.some(
                    emp => emp.empleadoId.toString() === empleadoId
                );

                if (empleadoExiste) {
                    empleadosOmitidos++;
                    continue;
                }

                // Buscar el empleado en la base de datos
                let empleadoData = await Empleado.findById(empleadoId);
                let tipoEmpleado = 'empleado';

                if (!empleadoData) {
                    empleadoData = await Motorista.findById(empleadoId);
                    tipoEmpleado = 'motorista';
                }

                if (!empleadoData) {
                    errores.push(`Empleado ${empleadoId} no encontrado`);
                    empleadosOmitidos++;
                    continue;
                }

                if (empleadoData.cuentaDesactivada === true) {
                    errores.push(`Empleado ${empleadoId} omitido por cuenta desactivada`);
                    empleadosOmitidos++;
                    continue;
                }

                const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();
                const salarioMensual = obtenerSalarioValido(empleadoData, nombreCompleto, tipoEmpleado);
                const planillaTipo = empleadoData.planillaTipo || '';

                // Generar días de la semana con fechas
                const dias = generarDiasSemana(planillaActual.fechaInicio);

                // Si planillaTipo es "Semanal", calcular base diaria automáticamente
                if (planillaTipo === 'Semanal' && salarioMensual > 0) {
                    const baseDiaria = redondearDinero(salarioMensual / planillaActual.diasHabiles);
                    dias.forEach(dia => {
                        dia.base = baseDiaria;
                    });
                }

                const nuevoEmpleado = {
                    empleadoId,
                    tipo: tipoEmpleado,
                    nombreCompleto,
                    planillaTipo,
                    dias,
                    totalBase: 0,
                    totalViaticos: 0,
                    anticipos: 0,
                    totalDescuentos: 0,
                    totalAPagar: 0
                };

                // Calcular totales iniciales
                const totales = calcularTotalesEmpleado(nuevoEmpleado);
                nuevoEmpleado.totalBase = totales.totalBase;
                nuevoEmpleado.totalViaticos = totales.totalViaticos;
                nuevoEmpleado.totalDescuentos = totales.totalDescuentos;
                nuevoEmpleado.totalAPagar = totales.totalAPagar;

                planillaActual.empleados.push(nuevoEmpleado);
                empleadosAgregados++;

            } catch (error) {
                console.error(`Error al agregar empleado ${empleadoId}:`, error);
                errores.push(`Error al agregar empleado ${empleadoId}: ${error.message}`);
                empleadosOmitidos++;
            }
        }

        // Recalcular totales generales de la planilla
        planillaActual.totales = calcularTotalesGenerales(planillaActual.empleados);
        await planillaActual.save();

        res.status(200).json({
            success: true,
            message: `Empleados copiados exitosamente. ${empleadosAgregados} agregados, ${empleadosOmitidos} omitidos.`,
            data: planillaActual,
            detalles: {
                empleadosAgregados,
                empleadosOmitidos,
                errores: errores.length > 0 ? errores : undefined
            }
        });
    } catch (error) {
        console.error('Error al copiar datos anteriores:', error);
        res.status(500).json({
            success: false,
            message: 'Error al copiar datos anteriores',
            error: error.message
        });
    }
};

export default PlanillaSemanalController;