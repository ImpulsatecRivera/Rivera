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
    // 1. Calcular salario total (base + extras)
    const totalSalarioMasViaticos =
        (empleado.salarioQuincenal || 0) +
        (empleado.viaticos || 0) +
        (empleado.trabajoSabadoDomingo || 0);

    // 2. RECALCULAR descuentos de ley sobre el SALARIO TOTAL
    const descuentosLeyActualizados = calcularDescuentosLey(totalSalarioMasViaticos);
    
    // Actualizar descuentos de ley en el objeto empleado
    empleado.descuentosLey = descuentosLeyActualizados;

    // 3. Calcular total de descuentos de ley
    const totalDescuentosLey =
        descuentosLeyActualizados.isss.monto +
        descuentosLeyActualizados.afp.monto +
        descuentosLeyActualizados.renta.monto;

    // 4. Calcular otros descuentos (SIN CAMISAS)
    const totalOtrosDescuentos =
        (empleado.otrosDescuentos?.anticipos || 0) +
        (empleado.otrosDescuentos?.prestamos || 0) +
        (empleado.otrosDescuentos?.otros || 0);

    // 5. Total de descuentos
    const totalDescuentos = totalDescuentosLey + totalOtrosDescuentos;

    // 6. Total a pagar
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
        const { año, mes, quincena, empleados } = req.body;

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
                data: { planillaId: planillaExistente._id }
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

        // Validar que la planilla no esté pagada o cerrada
        if (planilla.estado === 'pagada' || planilla.estado === 'cerrada') {
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

        // Validar que la planilla no esté pagada o cerrada
        if (planilla.estado === 'pagada' || planilla.estado === 'cerrada') {
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

        // Validar que la planilla no esté pagada o cerrada
        if (planilla.estado === 'pagada' || planilla.estado === 'cerrada') {
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
PlanillaQuincenalController.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, fechaPago, fechaCierre, fechaAprobacion } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de planilla inválido"
            });
        }

        const estadosValidos = ['pendiente', 'aprobada', 'pagada', 'cerrada'];
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

        const estadoActual = planilla.estado;

        // Validar que no se pueda cambiar si ya está cerrada
        if (estadoActual === 'cerrada') {
            return res.status(400).json({
                success: false,
                message: "No se puede cambiar el estado de una planilla cerrada (estado final)"
            });
        }

        // Validar que si está pagada, no pueda regresar a pendiente
        if (estadoActual === 'pagada' && (estado === 'pendiente')) {
            return res.status(400).json({
                success: false,
                message: "No se puede regresar a estado pendiente desde pagada. Solo puede pasar a cerrada."
            });
        }

        const now = new Date();

        // Si el nuevo estado es 'pagada', requerir fechaPago
        if (estado === 'pagada') {
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

            planilla.fechaPago = fechaPagoDate;
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

        // Si el nuevo estado es 'cerrada', requerir fechaCierre
        if (estado === 'cerrada') {
            if (!fechaCierre) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere la fecha de cierre cuando se marca como cerrada"
                });
            }

            const fechaCierreDate = new Date(fechaCierre);
            if (isNaN(fechaCierreDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de cierre no es válida"
                });
            }

            if (fechaCierreDate > now) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de cierre no puede ser una fecha futura"
                });
            }

            planilla.fechaCierre = fechaCierreDate;
        }

        planilla.estado = estado;
        await planilla.save();

        res.status(200).json({
            success: true,
            message: `Estado cambiado de ${estadoActual} a ${estado} exitosamente`,
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