/**
 * Controlador para Planillas Quincenales
 * Maneja la creación, actualización y consulta de planillas quincenales
 */

import PlanillaQuincenal from "../Models/PlanillaQuincenal.js";
import Empleado from "../Models/Empleado.js";
import Motorista from "../Models/Motorista.js";
import { isValidObjectId } from 'mongoose';

const PlanillaQuincenalController = {};

/**
 * Calcular descuentos de ley automáticamente
 */
const calcularDescuentosLey = (salarioBase) => {
    return {
        isss: {
            porcentaje: 3,
            monto: salarioBase * 0.03
        },
        afp: {
            porcentaje: 7.25,
            monto: salarioBase * 0.0725
        },
        renta: {
            monto: 0
        }
    };
};

/**
 * Calcular totales de un empleado
 */
const calcularTotalesEmpleado = (empleado) => {
    const totalSalarioMasViaticos = 
        (empleado.salarioQuincenal || 0) + 
        (empleado.viaticos || 0) + 
        (empleado.trabajoSabadoDomingo || 0);

    const totalDescuentosLey = 
        (empleado.descuentosLey?.isss?.monto || 0) +
        (empleado.descuentosLey?.afp?.monto || 0) +
        (empleado.descuentosLey?.renta?.monto || 0);

    const totalOtrosDescuentos = 
        (empleado.otrosDescuentos?.anticipos || 0) +
        (empleado.otrosDescuentos?.prestamos || 0) +
        (empleado.otrosDescuentos?.camisas || 0) +
        (empleado.otrosDescuentos?.otros || 0);

    const totalDescuentos = totalDescuentosLey + totalOtrosDescuentos;
    const totalAPagar = totalSalarioMasViaticos - totalDescuentos;

    return {
        totalSalarioMasViaticos,
        totalDescuentos,
        totalAPagar
    };
};

/**
 * Calcular totales generales de la planilla
 */
const calcularTotalesGenerales = (empleados) => {
    const totales = {
        totalSalariosQuincenales: 0,
        totalViaticos: 0,
        totalTrabajoExtra: 0,
        totalSalarioMasViaticos: 0,
        totalISSS: 0,
        totalAFP: 0,
        totalRenta: 0,
        totalAnticipos: 0,
        totalPrestamos: 0,
        totalCamisas: 0,
        totalOtrosDescuentos: 0,
        totalDescuentos: 0,
        totalAPagar: 0
    };

    empleados.forEach(emp => {
        totales.totalSalariosQuincenales += emp.salarioQuincenal || 0;
        totales.totalViaticos += emp.viaticos || 0;
        totales.totalTrabajoExtra += emp.trabajoSabadoDomingo || 0;
        totales.totalSalarioMasViaticos += emp.totalSalarioMasViaticos || 0;
        totales.totalISSS += emp.descuentosLey?.isss?.monto || 0;
        totales.totalAFP += emp.descuentosLey?.afp?.monto || 0;
        totales.totalRenta += emp.descuentosLey?.renta?.monto || 0;
        totales.totalAnticipos += emp.otrosDescuentos?.anticipos || 0;
        totales.totalPrestamos += emp.otrosDescuentos?.prestamos || 0;
        totales.totalCamisas += emp.otrosDescuentos?.camisas || 0;
        totales.totalOtrosDescuentos += emp.otrosDescuentos?.otros || 0;
        totales.totalDescuentos += emp.totalDescuentos || 0;
        totales.totalAPagar += emp.totalAPagar || 0;
    });

    return totales;
};

/**
 * Crear una nueva planilla quincenal
 * POST /api/planillas/quincenal
 */
PlanillaQuincenalController.crear = async (req, res) => {
    try {
        const { 
            año, 
            mes, 
            quincena, 
            fechaInicio, 
            fechaFin, 
            empleados
        } = req.body;

        // Validaciones básicas
        if (!año || !mes || !quincena) {
            return res.status(400).json({
                success: false,
                message: "Año, mes y quincena son requeridos"
            });
        }

        if (![1, 2].includes(parseInt(quincena))) {
            return res.status(400).json({
                success: false,
                message: "La quincena debe ser 1 (primera) o 2 (segunda)"
            });
        }

        // Verificar si ya existe una planilla para esta quincena
        const planillaExistente = await PlanillaQuincenal.findOne({
            año: parseInt(año),
            mes: parseInt(mes),
            quincena: parseInt(quincena)
        });

        if (planillaExistente) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una planilla para esta quincena",
                planillaId: planillaExistente._id
            });
        }

        // Generar descripción automática
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const quincenaTexto = quincena === 1 ? 'Primera' : 'Segunda';
        const descripcion = `${quincenaTexto} quincena de ${meses[mes - 1]} ${año}`;

        // Procesar empleados
        const empleadosProcesados = await Promise.all(
            (empleados || []).map(async (emp) => {
                // Validar ObjectId
                if (!isValidObjectId(emp.empleadoId)) {
                    throw new Error(`ID de empleado inválido: ${emp.empleadoId}`);
                }

                // Buscar empleado
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

                // Calcular salario quincenal (mitad del salario mensual)
                const salarioMensual = empleadoData.salary || empleadoData.salario || 0;
                const salarioQuincenal = emp.salarioQuincenal || (salarioMensual / 2);

                // Calcular descuentos de ley si no se proporcionan
                const descuentosLey = emp.descuentosLey || calcularDescuentosLey(salarioQuincenal);

                const empleadoPlanilla = {
                    empleadoId: emp.empleadoId,
                    tipoEmpleado: emp.tipoEmpleado,
                    nombreCompleto,
                    salarioQuincenal,
                    viaticos: emp.viaticos || 0,
                    trabajoSabadoDomingo: emp.trabajoSabadoDomingo || 0,
                    descuentosLey,
                    otrosDescuentos: emp.otrosDescuentos || {
                        anticipos: 0,
                        prestamos: 0,
                        camisas: 0,
                        otros: 0
                    }
                };

                // Calcular totales
                const totales = calcularTotalesEmpleado(empleadoPlanilla);
                empleadoPlanilla.totalSalarioMasViaticos = totales.totalSalarioMasViaticos;
                empleadoPlanilla.totalDescuentos = totales.totalDescuentos;
                empleadoPlanilla.totalAPagar = totales.totalAPagar;

                return empleadoPlanilla;
            })
        );

        // Calcular totales generales
        const totales = calcularTotalesGenerales(empleadosProcesados);

        // Crear la planilla
        const nuevaPlanilla = new PlanillaQuincenal({
            año: parseInt(año),
            mes: parseInt(mes),
            quincena: parseInt(quincena),
            fechaInicio: fechaInicio || new Date(año, mes - 1, quincena === 1 ? 1 : 16),
            fechaFin: fechaFin || new Date(año, mes - 1, quincena === 1 ? 15 : new Date(año, mes, 0).getDate()),
            descripcion,
            empleados: empleadosProcesados,
            totales,
            estado: 'borrador'
        });

        const planillaGuardada = await nuevaPlanilla.save();

        res.status(201).json({
            success: true,
            message: "Planilla quincenal creada exitosamente",
            data: planillaGuardada
        });
    } catch (error) {
        console.error("Error al crear planilla quincenal:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear la planilla quincenal",
            error: error.message
        });
    }
};

/**
 * Obtener todas las planillas quincenales con filtros
 * GET /api/planillas/quincenal
 */
PlanillaQuincenalController.obtenerTodas = async (req, res) => {
    try {
        const { año, mes, quincena, estado, page = 1, limit = 10 } = req.query;

        const filtro = {};
        if (año) filtro.año = parseInt(año);
        if (mes) filtro.mes = parseInt(mes);
        if (quincena) filtro.quincena = parseInt(quincena);
        if (estado) filtro.estado = estado;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const planillas = await PlanillaQuincenal.find(filtro)
            .sort({ año: -1, mes: -1, quincena: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PlanillaQuincenal.countDocuments(filtro);

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
 * GET /api/planillas/quincenal/:id
 */
PlanillaQuincenalController.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

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
 * Actualizar datos de un empleado en la planilla
 * PUT /api/planillas/quincenal/:id/empleado/:empleadoId
 */
PlanillaQuincenalController.actualizarEmpleado = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;
        const datosActualizar = req.body;

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

        const planilla = await PlanillaQuincenal.findById(id);

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

        // Actualizar campos permitidos
        const camposPermitidos = [
            'salarioQuincenal',
            'viaticos',
            'trabajoSabadoDomingo',
            'descuentosLey',
            'otrosDescuentos'
        ];

        camposPermitidos.forEach(campo => {
            if (datosActualizar[campo] !== undefined) {
                planilla.empleados[empleadoIndex][campo] = datosActualizar[campo];
            }
        });

        // Recalcular totales del empleado
        const totales = calcularTotalesEmpleado(planilla.empleados[empleadoIndex]);
        planilla.empleados[empleadoIndex].totalSalarioMasViaticos = totales.totalSalarioMasViaticos;
        planilla.empleados[empleadoIndex].totalDescuentos = totales.totalDescuentos;
        planilla.empleados[empleadoIndex].totalAPagar = totales.totalAPagar;

        // Recalcular totales generales
        planilla.totales = calcularTotalesGenerales(planilla.empleados);

        await planilla.save();

        res.status(200).json({
            success: true,
            message: "Empleado actualizado exitosamente",
            data: planilla
        });
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el empleado",
            error: error.message
        });
    }
};

/**
 * Agregar un nuevo empleado a la planilla
 * POST /api/planillas/quincenal/:id/empleado
 */
PlanillaQuincenalController.agregarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const datosEmpleado = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        if (!isValidObjectId(datosEmpleado.empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Verificar si el empleado ya está en la planilla
        const empleadoExiste = planilla.empleados.some(
            emp => emp.empleadoId.toString() === datosEmpleado.empleadoId
        );

        if (empleadoExiste) {
            return res.status(400).json({
                success: false,
                message: "El empleado ya está en esta planilla"
            });
        }

        // Buscar datos del empleado
        let empleadoData;
        if (datosEmpleado.tipoEmpleado === 'Motorista') {
            empleadoData = await Motorista.findById(datosEmpleado.empleadoId);
        } else {
            empleadoData = await Empleado.findById(datosEmpleado.empleadoId);
        }

        if (!empleadoData) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado"
            });
        }

        const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();

        const salarioMensual = empleadoData.salary || empleadoData.salario || 0;
        const salarioQuincenal = datosEmpleado.salarioQuincenal || (salarioMensual / 2);

        const descuentosLey = datosEmpleado.descuentosLey || calcularDescuentosLey(salarioQuincenal);

        const nuevoEmpleado = {
            empleadoId: datosEmpleado.empleadoId,
            tipoEmpleado: datosEmpleado.tipoEmpleado,
            nombreCompleto,
            salarioQuincenal,
            viaticos: datosEmpleado.viaticos || 0,
            trabajoSabadoDomingo: datosEmpleado.trabajoSabadoDomingo || 0,
            descuentosLey,
            otrosDescuentos: datosEmpleado.otrosDescuentos || {
                anticipos: 0,
                prestamos: 0,
                camisas: 0,
                otros: 0
            }
        };

        // Calcular totales
        const totales = calcularTotalesEmpleado(nuevoEmpleado);
        nuevoEmpleado.totalSalarioMasViaticos = totales.totalSalarioMasViaticos;
        nuevoEmpleado.totalDescuentos = totales.totalDescuentos;
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
 * DELETE /api/planillas/quincenal/:id/empleado/:empleadoId
 */
PlanillaQuincenalController.eliminarEmpleado = async (req, res) => {
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

        const planilla = await PlanillaQuincenal.findById(id);

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
 * PATCH /api/planillas/quincenal/:id/estado
 */
PlanillaQuincenalController.cambiarEstado = async (req, res) => {
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

        const planilla = await PlanillaQuincenal.findById(id);

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
 * DELETE /api/planillas/quincenal/:id
 */
PlanillaQuincenalController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

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

        await PlanillaQuincenal.findByIdAndDelete(id);

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
 * GET /api/planillas/quincenal/empleado/:empleadoId
 */
PlanillaQuincenalController.obtenerPorEmpleado = async (req, res) => {
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

        const planillas = await PlanillaQuincenal.find(filtro)
            .sort({ año: -1, mes: -1, quincena: -1 });

        const planillasFiltradas = planillas.map(planilla => {
            const empleadoEnPlanilla = planilla.empleados.find(
                emp => emp.empleadoId.toString() === empleadoId
            );

            return {
                _id: planilla._id,
                quincena: planilla.quincena,
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

export default PlanillaQuincenalController;