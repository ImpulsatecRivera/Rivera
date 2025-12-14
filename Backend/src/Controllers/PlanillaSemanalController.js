/**
 * Controlador para Planillas Semanales
 * Maneja la creación, actualización y consulta de planillas semanales
 */

import PlanillaSemanal from "../Models/PlanillaSemanal.js";
import Empleado from "../Models/Empleado.js";
import Motorista from "../Models/Motorista.js";
import { isValidObjectId } from 'mongoose';

const PlanillaSemanalController = {};

/**
 * Obtener número de semana del año
 */
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Calcular totales de un empleado en la planilla
 */
const calcularTotalesEmpleado = (empleado) => {
    const totalBase = empleado.registrosDiarios.reduce((sum, r) => sum + (r.base || 0), 0);
    const totalViaticos = empleado.registrosDiarios.reduce((sum, r) => sum + (r.viaticos || 0), 0);
    const subtotal = totalBase + totalViaticos;
    const totalAPagar = subtotal - (empleado.anticipos || 0) - (empleado.descuentos || 0);

    return {
        totalBase,
        totalViaticos,
        totalAPagar
    };
};

/**
 * Calcular totales generales de la planilla
 */
const calcularTotalesGenerales = (empleados) => {
    return {
        totalBase: empleados.reduce((sum, e) => sum + (e.totalBase || 0), 0),
        totalViaticos: empleados.reduce((sum, e) => sum + (e.totalViaticos || 0), 0),
        totalAnticipos: empleados.reduce((sum, e) => sum + (e.anticipos || 0), 0),
        totalDescuentos: empleados.reduce((sum, e) => sum + (e.descuentos || 0), 0),
        totalGeneral: empleados.reduce((sum, e) => sum + (e.totalAPagar || 0), 0)
    };
};

/**
 * Crear una nueva planilla semanal
 * POST /api/planillas/semanal
 */
PlanillaSemanalController.crear = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, empleados } = req.body;

        // Validaciones básicas
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                message: "Las fechas de inicio y fin son requeridas"
            });
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // Calcular año, mes y número de semana
        const año = inicio.getFullYear();
        const mes = inicio.getMonth() + 1;
        const numeroSemana = getWeekNumber(inicio);

        // Verificar si ya existe una planilla para esta semana
        const planillaExistente = await PlanillaSemanal.findOne({
            año,
            mes,
            numeroSemana
        });

        if (planillaExistente) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una planilla para esta semana",
                planillaId: planillaExistente._id
            });
        }

        // Generar descripción automática
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const descripcion = `Del ${inicio.getDate()} al ${fin.getDate()} de ${meses[mes - 1]} ${año}`;

        // Procesar empleados
        const empleadosProcesados = await Promise.all(
            (empleados || []).map(async (emp) => {
                // Validar ObjectId
                if (!isValidObjectId(emp.empleadoId)) {
                    throw new Error(`ID de empleado inválido: ${emp.empleadoId}`);
                }

                // Buscar empleado en la colección correspondiente
                let empleadoData;
                if (emp.tipoEmpleado === 'Motorista') {
                    empleadoData = await Motorista.findById(emp.empleadoId);
                } else {
                    empleadoData = await Empleado.findById(emp.empleadoId);
                }

                if (!empleadoData) {
                    throw new Error(`Empleado con ID ${emp.empleadoId} no encontrado`);
                }

                const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();

                // Calcular totales
                const totales = calcularTotalesEmpleado(emp);

                return {
                    empleadoId: emp.empleadoId,
                    tipoEmpleado: emp.tipoEmpleado,
                    nombreCompleto,
                    registrosDiarios: emp.registrosDiarios || [],
                    totalBase: totales.totalBase,
                    totalViaticos: totales.totalViaticos,
                    anticipos: emp.anticipos || 0,
                    descuentos: emp.descuentos || 0,
                    totalAPagar: totales.totalAPagar
                };
            })
        );

        // Calcular totales generales
        const totales = calcularTotalesGenerales(empleadosProcesados);

        // Crear la planilla
        const nuevaPlanilla = new PlanillaSemanal({
            numeroSemana,
            año,
            mes,
            fechaInicio: inicio,
            fechaFin: fin,
            descripcion,
            empleados: empleadosProcesados,
            totales,
            estado: 'borrador'
        });

        const planillaGuardada = await nuevaPlanilla.save();

        res.status(201).json({
            success: true,
            message: "Planilla semanal creada exitosamente",
            data: planillaGuardada
        });
    } catch (error) {
        console.error("Error al crear planilla semanal:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear la planilla semanal",
            error: error.message
        });
    }
};

/**
 * Obtener todas las planillas semanales con filtros
 * GET /api/planillas/semanal
 */
PlanillaSemanalController.obtenerTodas = async (req, res) => {
    try {
        const { año, mes, estado, page = 1, limit = 10 } = req.query;

        const filtro = {};
        if (año) filtro.año = parseInt(año);
        if (mes) filtro.mes = parseInt(mes);
        if (estado) filtro.estado = estado;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const planillas = await PlanillaSemanal.find(filtro)
            .sort({ año: -1, mes: -1, numeroSemana: -1 })
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
        console.error("Error al obtener planillas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las planillas",
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
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            data: planilla
        });
    } catch (error) {
        console.error("Error al obtener planilla:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la planilla",
            error: error.message
        });
    }
};

/**
 * Actualizar registros diarios de un empleado en la planilla
 * PUT /api/planillas/semanal/:id/empleado/:empleadoId
 */
PlanillaSemanalController.actualizarRegistroEmpleado = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;
        const { registrosDiarios, anticipos, descuentos } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        if (!isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Encontrar el empleado en la planilla
        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado en esta planilla"
            });
        }

        // Actualizar registros
        if (registrosDiarios) {
            planilla.empleados[empleadoIndex].registrosDiarios = registrosDiarios;
        }
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
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: "Registro actualizado exitosamente",
            data: planilla
        });
    } catch (error) {
        console.error("Error al actualizar registro:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el registro",
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
        const { empleadoId, tipoEmpleado, registrosDiarios, anticipos, descuentos } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        if (!isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Verificar si el empleado ya está en la planilla
        const empleadoExiste = planilla.empleados.some(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoExiste) {
            return res.status(400).json({
                success: false,
                message: "El empleado ya está en esta planilla"
            });
        }

        // Buscar datos del empleado
        let empleadoData;
        if (tipoEmpleado === 'Motorista') {
            empleadoData = await Motorista.findById(empleadoId);
        } else {
            empleadoData = await Empleado.findById(empleadoId);
        }

        if (!empleadoData) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado"
            });
        }

        const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();

        const nuevoEmpleado = {
            empleadoId,
            tipoEmpleado,
            nombreCompleto,
            registrosDiarios: registrosDiarios || [],
            anticipos: anticipos || 0,
            descuentos: descuentos || 0
        };

        // Calcular totales
        const totales = calcularTotalesEmpleado(nuevoEmpleado);
        nuevoEmpleado.totalBase = totales.totalBase;
        nuevoEmpleado.totalViaticos = totales.totalViaticos;
        nuevoEmpleado.totalAPagar = totales.totalAPagar;

        planilla.empleados.push(nuevoEmpleado);

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: "Empleado agregado exitosamente",
            data: planilla
        });
    } catch (error) {
        console.error("Error al agregar empleado:", error);
        res.status(500).json({
            success: false,
            message: "Error al agregar el empleado",
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

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        if (!isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        const empleadoIndex = planilla.empleados.findIndex(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado en esta planilla"
            });
        }

        planilla.empleados.splice(empleadoIndex, 1);

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: "Empleado eliminado exitosamente",
            data: planilla
        });
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar el empleado",
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
        const { estado } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const estadosValidos = ['borrador', 'pendiente', 'pagada', 'cerrada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido",
                estadosValidos
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        planilla.estado = estado;

        if (estado === 'pagada' || estado === 'cerrada') {
            planilla.fechaAprobacion = new Date();
        }

        await planilla.save();

        res.status(200).json({
            success: true,
            message: `Estado cambiado a ${estado} exitosamente`,
            data: planilla
        });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({
            success: false,
            message: "Error al cambiar el estado",
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
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaSemanal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Solo permitir eliminar si está en borrador
        if (planilla.estado !== 'borrador') {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden eliminar planillas en estado borrador"
            });
        }

        await PlanillaSemanal.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Planilla eliminada exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar planilla:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar la planilla",
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
        const { año, mes } = req.query;

        if (!isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido"
            });
        }

        const filtro = {
            'empleados.empleadoId': empleadoId
        };

        if (año) filtro.año = parseInt(año);
        if (mes) filtro.mes = parseInt(mes);

        const planillas = await PlanillaSemanal.find(filtro)
            .sort({ año: -1, mes: -1, numeroSemana: -1 });

        // Filtrar solo los datos del empleado específico
        const planillasFiltradas = planillas.map(planilla => {
            const empleadoEnPlanilla = planilla.empleados.find(
                emp => emp.empleadoId.toString() === empleadoId
            );

            return {
                _id: planilla._id,
                numeroSemana: planilla.numeroSemana,
                año: planilla.año,
                mes: planilla.mes,
                fechaInicio: planilla.fechaInicio,
                fechaFin: planilla.fechaFin,
                descripcion: planilla.descripcion,
                estado: planilla.estado,
                empleado: empleadoEnPlanilla
            };
        });

        res.status(200).json({
            success: true,
            data: planillasFiltradas
        });
    } catch (error) {
        console.error("Error al obtener planillas del empleado:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las planillas",
            error: error.message
        });
    }
};

export default PlanillaSemanalController;