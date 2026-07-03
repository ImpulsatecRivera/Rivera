/**
 * Controlador para Planillas Quincenales
 * Calcula ISSS 3%, AFP 7.25% y Renta según tabla de El Salvador
 * ✅ ACTUALIZADO: Maneja salarios como String o Number (compatibilidad Motoristas)
 */

import PlanillaQuincenal from "../Models/PlanillaQuincenal.js";
import Empleado from "../Models/Empleados.js";
import Motorista from "../Models/Motorista.js";
import { isValidObjectId } from 'mongoose';

const PlanillaQuincenalController = {};

/**
 * Redondear correctamente valores monetarios a 2 decimales
 * Redondea .5 hacia arriba (redondeo aritmético estándar)
 * Ejemplo: 54.375 → 54.38 (no 54.37)
 * 
 * Esta función maneja correctamente los errores de punto flotante de JavaScript
 */
const redondearDinero = (valor) => {
    // Convertir a string con suficientes decimales, luego redondear
    const str = (valor * 100).toFixed(10);
    const num = parseFloat(str);
    return Math.round(num) / 100;
};

/**
 * Tabla de Renta de El Salvador - QUINCENAL (CORRECTA)
 * Basada en salarios quincenales
 * Retorna: { monto, tramo, porcentaje }
 */
const calcularRenta = (salarioQuincenal) => {
    // Tramo I: $0.01 - $275.00 = SIN RETENCIÓN
    if (salarioQuincenal <= 275.00) {
        return {
            monto: 0,
            tramo: 1,
            porcentaje: 0
        };
    }

    // Tramo II: $275.01 - $447.62 = 10% sobre exceso de $275.00 + cuota fija $8.83
    if (salarioQuincenal <= 447.62) {
        const exceso = salarioQuincenal - 275.00;
        return {
            monto: 8.83 + (exceso * 0.10),
            tramo: 2,
            porcentaje: 10
        };
    }

    // Tramo III: $447.63 - $1,019.05 = 20% sobre exceso de $447.62 + cuota fija $30.00
    if (salarioQuincenal <= 1019.05) {
        const exceso = salarioQuincenal - 447.62;
        return {
            monto: 30.00 + (exceso * 0.20),
            tramo: 3,
            porcentaje: 20
        };
    }

    // Tramo IV: $1,019.06 en adelante = 30% sobre exceso de $1,019.05 + cuota fija $144.28
    const exceso = salarioQuincenal - 1019.05;
    return {
        monto: 144.28 + (exceso * 0.30),
        tramo: 4,
        porcentaje: 30
    };
};

/**
 * Calcular todos los descuentos de ley
 */
const calcularDescuentosLey = (salarioBase) => {
    // ISSS: 3% con tope quincenal de $500 (máximo $15.00)
    const baseISSS = salarioBase > 500 ? 500 : salarioBase;
    const montoISSS = redondearDinero(baseISSS * 0.03);

    // AFP: 7.25% sin tope
    const montoAFP = redondearDinero(salarioBase * 0.0725);

    // Renta: según tabla quincenal
    const renta = calcularRenta(salarioBase);

    return {
        isss: {
            porcentaje: 3,
            monto: montoISSS
        },
        afp: {
            porcentaje: 7.25,
            monto: montoAFP
        },
        renta: {
            monto: redondearDinero(renta.monto),
            tramo: renta.tramo,
            porcentaje: renta.porcentaje
        }
    };
};

/**
 * ✅ NUEVA FUNCIÓN: Obtener y validar salario (maneja String y Number)
 */
const obtenerSalarioValido = (empleadoData, nombreCompleto, tipoEmpleado) => {
    // Obtener salario (puede venir como Number o String)
    let salarioMensual = empleadoData.salary || empleadoData.salario || 0;

    // 🔧 CRÍTICO: Convertir string a número si es necesario (caso Motoristas)
    if (typeof salarioMensual === 'string') {
        salarioMensual = parseFloat(salarioMensual.replace(/[^0-9.-]/g, '')); // Limpiar caracteres no numéricos

        // Validar que la conversión fue exitosa
        if (isNaN(salarioMensual)) {
            console.error('❌ Error: El salario no es válido:', {
                empleado: nombreCompleto,
                tipo: tipoEmpleado,
                salarioOriginal: empleadoData.salario || empleadoData.salary
            });
            throw new Error(`El salario de ${nombreCompleto} no es un número válido`);
        }
    }

    // Validar que el salario sea mayor a 0
    if (!salarioMensual || salarioMensual <= 0) {
        throw new Error(`El salario de ${nombreCompleto} debe ser mayor a 0. Salario actual: ${salarioMensual}`);
    }

    return salarioMensual;
};

/**
 * ✅ CORREGIDO: Calcular totales de un empleado
 * Ahora descuentos de ley se calculan sobre el salario total
 */
const calcularTotalesEmpleado = (empleado) => {
    // Normalizar y asegurar que sean números
    const salarioQuincenal = Number(empleado.salarioQuincenal || 0);
    const viaticos = Number(empleado.viaticos || 0);
    const trabajoSabadoDomingo = Number(empleado.trabajoSabadoDomingo || 0);

    // Calcular descuentos de ley en base al salario quincenal
    const descuentosLey = calcularDescuentosLey(salarioQuincenal);
    // Asegurarnos de guardar los descuentos calculados en el objeto empleado
    empleado.descuentosLey = descuentosLey;

    const totalSalarioMasViaticos = salarioQuincenal + viaticos + trabajoSabadoDomingo;

    const totalDescuentosLey =
        (descuentosLey?.isss?.monto || 0) +
        (descuentosLey?.afp?.monto || 0) +
        (descuentosLey?.renta?.monto || 0);

    const totalOtrosDescuentos =
        (empleado.otrosDescuentos?.anticipos || 0) +
        (empleado.otrosDescuentos?.prestamos || 0) +
        (empleado.otrosDescuentos?.otros || 0);

    const totalDescuentos = totalDescuentosLey + totalOtrosDescuentos;
    const totalAPagar = totalSalarioMasViaticos - totalDescuentos;

    return {
        totalSalarioMasViaticos: redondearDinero(totalSalarioMasViaticos),
        totalDescuentos: redondearDinero(totalDescuentos),
        totalAPagar: redondearDinero(totalAPagar)
    };
};

/**
 * Calcular totales generales de la planilla (SIN CAMISAS)
 */
const calcularTotalesGenerales = (empleados) => {
    console.log('🔥 INICIANDO calcularTotalesGenerales');
    console.log('📦 Empleados recibidos:', empleados.length);

    const totales = {
        totalSalariosQuincenales: 0,
        totalViaticos: 0,
        totalTrabajoSabadoDomingo: 0,
        totalSalariosMasViaticos: 0,
        totalISSS: 0,
        totalAFP: 0,
        totalRenta: 0,
        totalAnticipos: 0,
        totalPrestamos: 0,
        totalOtros: 0,
        totalDescuentos: 0,
        totalAPagar: 0
    };

    empleados.forEach(emp => {
        console.log('👤 Procesando empleado:', emp.nombreCompleto);
        console.log('   - Trabajo Sáb/Dom:', emp.trabajoSabadoDomingo);

        totales.totalSalariosQuincenales += emp.salarioQuincenal || 0;
        totales.totalViaticos += emp.viaticos || 0;
        totales.totalTrabajoSabadoDomingo += emp.trabajoSabadoDomingo || 0;
        totales.totalSalariosMasViaticos += emp.totalSalarioMasViaticos || 0;
        totales.totalISSS += emp.descuentosLey?.isss?.monto || 0;
        totales.totalAFP += emp.descuentosLey?.afp?.monto || 0;
        totales.totalRenta += emp.descuentosLey?.renta?.monto || 0;
        totales.totalAnticipos += emp.otrosDescuentos?.anticipos || 0;
        totales.totalPrestamos += emp.otrosDescuentos?.prestamos || 0;
        totales.totalOtros += emp.otrosDescuentos?.otros || 0;
        totales.totalDescuentos += emp.totalDescuentos || 0;
        totales.totalAPagar += emp.totalAPagar || 0;
    });

    // Redondear todos los totales a 2 decimales con redondeo correcto
    Object.keys(totales).forEach(key => {
        totales[key] = redondearDinero(totales[key]);
    });

    console.log('✅ TOTALES CALCULADOS (BACKEND):', totales);
    console.log('   🎯 totalTrabajoSabadoDomingo:', totales.totalTrabajoSabadoDomingo);

    return totales;
};
/**
 * Crear una nueva planilla quincenal
 * POST /api/planillas/quincenal
 */
PlanillaQuincenalController.crear = async (req, res) => {
    try {
        let { año, mes, quincena, empleados } = req.body;

        // Si no se proporcionan año/mes/quincena, verificar si es la primera planilla
        if (!año || !mes || !quincena) {
            const ultimaPlanilla = await PlanillaQuincenal.findOne()
                .sort({ año: -1, mes: -1, quincena: -1 });

            if (ultimaPlanilla) {
                return res.status(400).json({
                    success: false,
                    message: "Año, mes y quincena son requeridos"
                });
            } else {
                // Es la primera planilla - asignar automáticamente el mes y quincena actuales
                const ahora = new Date();
                año = ahora.getFullYear();
                mes = ahora.getMonth() + 1;
                quincena = ahora.getDate() <= 15 ? 1 : 2;
            }
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
                data: { planillaId: planillaExistente._id }
            });
        }

        // Generar descripción automática
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const quincenaNum = parseInt(quincena);
        const quincenaTexto = quincenaNum === 1 ? 'Primera' : 'Segunda';
        const descripcion = `${quincenaTexto} quincena de ${meses[parseInt(mes) - 1]} ${año}`;

        // Procesar empleados
        const empleadosProcesados = await Promise.all(
            (empleados || []).map(async (emp) => {
                // Validar ObjectId
                if (!isValidObjectId(emp.empleadoId)) {
                    throw new Error(`ID de empleado inválido: ${emp.empleadoId}`);
                }

                // Buscar primero en Empleados, luego en Motoristas
                let empleadoData = await Empleado.findById(emp.empleadoId);
                let tipoEmpleado = 'Empleado';

                if (!empleadoData) {
                    empleadoData = await Motorista.findById(emp.empleadoId);
                    tipoEmpleado = 'Motorista';
                }

                if (!empleadoData) {
                    throw new Error(`Empleado con ID ${emp.empleadoId} no encontrado en ninguna tabla`);
                }

                const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();

                const salarioMensual = obtenerSalarioValido(empleadoData, nombreCompleto, tipoEmpleado);
                const salarioQuincenal = redondearDinero(salarioMensual / 2);

                const empleadoPlanilla = {
                    empleadoId: emp.empleadoId,
                    tipoEmpleado,
                    nombreCompleto,
                    salarioQuincenal,
                    viaticos: emp.viaticos || 0,
                    trabajoSabadoDomingo: emp.trabajoSabadoDomingo || 0,
                    descuentosLey: {},
                    otrosDescuentos: emp.otrosDescuentos || {
                        anticipos: 0,
                        prestamos: 0,
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

        // Calcular fechas de inicio y fin
        const fechaInicio = new Date(año, mes - 1, quincena === 1 ? 1 : 16);
        const fechaFin = quincena === 1
            ? new Date(año, mes - 1, 15)
            : new Date(año, mes, 0);

        // Crear la planilla
        const nuevaPlanilla = new PlanillaQuincenal({
            año: parseInt(año),
            mes: parseInt(mes),
            quincena: parseInt(quincena),
            fechaInicio,
            fechaFin,
            descripcion,
            empleados: empleadosProcesados,
            totales,
            estado: 'pendiente'
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
 * GET /api/planillas/quincenal?año=2025&mes=12&quincena=1&estado=pendiente
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
 * Actualizar datos de un empleado en la planilla (SIN CAMISAS)
 * PUT /api/planillas/quincenal/:id/empleado/:empleadoId
 */
PlanillaQuincenalController.actualizarEmpleado = async (req, res) => {
    try {
        const { id, empleadoId } = req.params;
        const { viaticos, trabajoSabadoDomingo, otrosDescuentos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Validar que la planilla no esté pagada o pagada
        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: `No se pueden editar empleados de una planilla en estado ${planilla.estado}`
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

        // Actualizar solo los campos permitidos
        if (viaticos !== undefined) {
            planilla.empleados[empleadoIndex].viaticos = viaticos;
        }
        if (trabajoSabadoDomingo !== undefined) {
            planilla.empleados[empleadoIndex].trabajoSabadoDomingo = trabajoSabadoDomingo;
        }
        if (otrosDescuentos) {
            planilla.empleados[empleadoIndex].otrosDescuentos = {
                anticipos: otrosDescuentos.anticipos || 0,
                prestamos: otrosDescuentos.prestamos || 0,
                otros: otrosDescuentos.otros || 0
            };
        }

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
 * Agregar un nuevo empleado a la planilla (SIN CAMISAS)
 * POST /api/planillas/quincenal/:id/empleado
 */
PlanillaQuincenalController.agregarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { empleadoId, viaticos, trabajoSabadoDomingo, otrosDescuentos } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Validar que la planilla no esté pagada o pagada
        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: `No se pueden agregar empleados a una planilla en estado ${planilla.estado}`
            });
        }

        // Verificar si el empleado ya está
        const empleadoExiste = planilla.empleados.some(
            emp => emp.empleadoId.toString() === empleadoId
        );

        if (empleadoExiste) {
            return res.status(400).json({
                success: false,
                message: "El empleado ya está en esta planilla"
            });
        }

        // Buscar primero en Empleados, luego en Motoristas
        let empleadoData = await Empleado.findById(empleadoId);
        let tipoEmpleado = 'Empleado';

        if (!empleadoData) {
            empleadoData = await Motorista.findById(empleadoId);
            tipoEmpleado = 'Motorista';
        }

        if (!empleadoData) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado en ninguna tabla"
            });
        }

        if (empleadoData.cuentaDesactivada === true) {
            return res.status(400).json({
                success: false,
                message: "No se puede agregar un empleado desactivado a la planilla quincenal"
            });
        }

        const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();

        const salarioMensual = obtenerSalarioValido(empleadoData, nombreCompleto, tipoEmpleado);
        const salarioQuincenal = redondearDinero(salarioMensual / 2);

        const nuevoEmpleado = {
            empleadoId,
            tipoEmpleado,
            nombreCompleto,
            salarioQuincenal,
            viaticos: viaticos || 0,
            trabajoSabadoDomingo: trabajoSabadoDomingo || 0,
            descuentosLey: {},
            otrosDescuentos: otrosDescuentos || {
                anticipos: 0,
                prestamos: 0,
                otros: 0
            }
        };

        // Calcular totales
        const totales = calcularTotalesEmpleado(nuevoEmpleado);
        nuevoEmpleado.totalSalarioMasViaticos = totales.totalSalarioMasViaticos;
        nuevoEmpleado.totalDescuentos = totales.totalDescuentos;
        nuevoEmpleado.totalAPagar = totales.totalAPagar;

        planilla.empleados.push(nuevoEmpleado);
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

        if (!isValidObjectId(id) || !isValidObjectId(empleadoId)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const planilla = await PlanillaQuincenal.findById(id);

        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: "Planilla no encontrada"
            });
        }

        // Validar que la planilla no esté pagada o pagada
        if (planilla.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: `No se pueden eliminar empleados de una planilla en estado ${planilla.estado}`
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
/**
 * Cambiar estado de la planilla y marcar como pagada
 * PATCH /api/planillas/quincenal/:id/estado
 * Body: { estado, pagada?, fechaPago?, fechaCierre?, fechaAprobacion? }
 */
PlanillaQuincenalController.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, pagada, fechaPago, fechaCierre, fechaAprobacion } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const estadosValidos = ['pendiente', 'aprobada', 'pagada'];
        if (estado && !estadosValidos.includes(estado)) {
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

        const estadoActual = planilla.estado;

        // Validar que no se pueda cambiar si ya está pagada
        if (estadoActual === 'pagada' && estado) {
            return res.status(400).json({
                success: false,
                message: "No se puede cambiar el estado de una planilla pagada (estado final)"
            });
        }

        const now = new Date();

        // ✅ NUEVO: Marcar como pagada
        if (pagada !== undefined) {
            if (pagada === true) {
                // Validar que esté al menos aprobada para poder pagarla
                if (estadoActual === 'pendiente' && (!estado || estado === 'pendiente')) {
                    return res.status(400).json({
                        success: false,
                        message: "La planilla debe estar aprobada para poder marcarla como pagada"
                    });
                }

                if (!fechaPago) {
                    return res.status(400).json({
                        success: false,
                        message: "Se requiere la fecha de pago cuando se marca como pagada"
                    });
                }

                const fechaPagoDate = new Date(fechaPago);
                if (isNaN(fechaPagoDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "La fecha de pago no es válida"
                    });
                }

                if (fechaPagoDate > now) {
                    return res.status(400).json({
                        success: false,
                        message: "La fecha de pago no puede ser una fecha futura"
                    });
                }

                planilla.pagada = true;
                planilla.fechaPago = fechaPagoDate;
            } else {
                // Desmarcar como pagada
                planilla.pagada = false;
                planilla.fechaPago = undefined;
            }
        }

        // Si el nuevo estado es 'aprobada', guardar fechaAprobacion
        if (estado === 'aprobada') {
            if (fechaAprobacion) {
                const fechaAprobDate = new Date(fechaAprobacion);
                if (isNaN(fechaAprobDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "La fecha de aprobación no es válida"
                    });
                }

                if (fechaAprobDate > now) {
                    return res.status(400).json({
                        success: false,
                        message: "La fecha de aprobación no puede ser una fecha futura"
                    });
                }

                planilla.fechaAprobacion = fechaAprobDate;
            } else {
                planilla.fechaAprobacion = now;
            }
        }


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

        if (planilla.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden eliminar planillas en estado pendiente"
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
 * GET /api/planillas/quincenal/empleado/:empleadoId?año=2025&mes=12
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

        // Security: If requester is an employee or motorista, allow only own planillas
        if (req.user && (req.user.userType === 'motorista' || req.user.userType === 'empleado')) {
            if (String(req.user.id) !== String(empleadoId)) {
                return res.status(403).json({ success: false, message: 'Access denied: can only view your own planillas' });
            }
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

/**
 * Obtener la última planilla quincenal creada
 * GET /api/planillas/quincenal/ultima
 */
PlanillaQuincenalController.obtenerUltima = async (req, res) => {
    try {
        const ultimaPlanilla = await PlanillaQuincenal.findOne()
            .sort({ año: -1, mes: -1, quincena: -1 })
            .populate('empleados.empleadoId');

        if (!ultimaPlanilla) {
            // Si no hay planillas, retornar la primera planilla quincenal (2026, enero, quincena 1)
            return res.status(200).json({
                success: true,
                message: 'Primera planilla quincenal del sistema',
                data: {
                    año: 2026,
                    mes: 1,
                    quincena: 1,
                    empleados: [],
                    isNewSystem: true
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Última planilla quincenal obtenida',
            data: ultimaPlanilla
        });
    } catch (error) {
        console.error('Error al obtener última planilla quincenal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener última planilla quincenal',
            error: error.message
        });
    }
};

/**
 * Copiar empleados de la última planilla quincenal a una nueva
 * POST /api/planillas/quincenal/:id/copiar-datos-anteriores
 */
PlanillaQuincenalController.copiarDatosAnteriores = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de planilla inválido'
            });
        }

        // Obtener la planilla actual
        const planillaActual = await PlanillaQuincenal.findById(id);
        if (!planillaActual) {
            return res.status(404).json({
                success: false,
                message: 'Planilla quincenal no encontrada'
            });
        }

        if (planillaActual.estado === 'pagada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden agregar empleados a una planilla pagada'
            });
        }

        // Obtener la última planilla anterior (por año, mes y quincena)
        const ultimaPlanilla = await PlanillaQuincenal.findOne({
            $or: [
                {
                    año: planillaActual.año,
                    mes: planillaActual.mes,
                    quincena: { $lt: planillaActual.quincena }
                },
                {
                    año: planillaActual.año,
                    mes: { $lt: planillaActual.mes }
                },
                {
                    año: { $lt: planillaActual.año }
                }
            ]
        }).sort({ año: -1, mes: -1, quincena: -1 });

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
                let tipoEmpleado = 'Empleado';

                if (!empleadoData) {
                    empleadoData = await Motorista.findById(empleadoId);
                    tipoEmpleado = 'Motorista';
                }

                if (!empleadoData) {
                    errores.push(`Empleado ${empleadoId} no encontrado`);
                    empleadosOmitidos++;
                    continue;
                }

                const nombreCompleto = `${empleadoData.name} ${empleadoData.lastName || ''}`.trim();
                const salarioMensual = obtenerSalarioValido(empleadoData, nombreCompleto, tipoEmpleado);
                const salarioQuincenal = redondearDinero(salarioMensual / 2);

                const nuevoEmpleado = {
                    empleadoId,
                    tipoEmpleado,
                    nombreCompleto,
                    salarioQuincenal,
                    viaticos: 0,
                    trabajoSabadoDomingo: 0,
                    descuentosLey: {},
                    otrosDescuentos: {
                        anticipos: 0,
                        prestamos: 0,
                        otros: 0
                    }
                };

                // Calcular totales
                const totales = calcularTotalesEmpleado(nuevoEmpleado);
                nuevoEmpleado.totalSalarioMasViaticos = totales.totalSalarioMasViaticos;
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

export default PlanillaQuincenalController;