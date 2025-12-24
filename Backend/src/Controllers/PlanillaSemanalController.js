import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import Empleado from '../Models/Empleados.js';
import Motorista from '../Models/Motorista.js';

const PlanillaSemanalController = {};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Validar que una fecha sea lunes
 */
const esLunes = (fecha) => {
    return fecha.getDay() === 1;
};

/**
 * Validar que una fecha sea sábado
 */
const esSabado = (fecha) => {
    return fecha.getDay() === 6;
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
            faltaInjustificada: false
        });
        fecha.setDate(fecha.getDate() + 1);
    }

    return resultado;
};

/**
 * Buscar empleado o motorista por ID
 */
const buscarPersonal = async (id, tipo) => {
    try {
        if (tipo === 'empleado') {
            return await Empleado.findById(id);
        } else {
            return await Motorista.findById(id);
        }
    } catch (error) {
        return null;
    }
};

// ============================================
// CREAR PLANILLA SEMANAL
// ============================================
PlanillaSemanalController.crearPlanilla = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, diasHabiles } = req.body;

        // Validar campos requeridos
        if (!fechaInicio || !fechaFin || !diasHabiles) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: fechaInicio, fechaFin, diasHabiles'
            });
        }

        // Convertir fechas
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // Validar que fechaInicio sea lunes
        if (!esLunes(inicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser un lunes'
            });
        }

        // Validar que fechaFin sea sábado
        if (!esSabado(fin)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser un sábado'
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

        // Validar que la semana sea exactamente 6 días
        const diffDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        if (diffDias !== 5) { // De lunes a sábado son 5 días de diferencia
            return res.status(400).json({
                success: false,
                message: 'El período debe ser exactamente de lunes a sábado (6 días)'
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
        res.status(500).json({
            success: false,
            message: 'Error al crear planilla semanal',
            error: error.message
        });
    }
};

// ============================================
// AGREGAR EMPLEADO A PLANILLA
// ============================================
PlanillaSemanalController.agregarEmpleado = async (req, res) => {
    try {
        const { planillaId } = req.params;
        const { empleadoId, tipo } = req.body;

        // Validar campos requeridos
        if (!empleadoId || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: empleadoId, tipo'
            });
        }

        // Validar tipo
        if (!['empleado', 'motorista'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'El tipo debe ser "empleado" o "motorista"'
            });
        }

        // Buscar planilla
        const planilla = await PlanillaSemanal.findById(planillaId);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Validar que la planilla no esté cerrada o pagada
        if (['pagada', 'cerrada'].includes(planilla.estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede agregar empleados a una planilla ${planilla.estado}`
            });
        }

        // Buscar empleado/motorista
        const personal = await buscarPersonal(empleadoId, tipo);
        if (!personal) {
            return res.status(404).json({
                success: false,
                message: `${tipo === 'empleado' ? 'Empleado' : 'Motorista'} no encontrado`
            });
        }

        // Verificar que tenga tipoSalario "semanal"
        if (personal.tipoSalario !== 'semanal') {
            return res.status(400).json({
                success: false,
                message: `Este ${tipo} no tiene tipo de salario semanal (actual: ${personal.tipoSalario || 'no definido'})`
            });
        }

        // Verificar que no esté ya en la planilla
        const yaExiste = planilla.empleados.some(
            emp => emp.empleadoId.toString() === empleadoId && emp.tipo === tipo
        );

        if (yaExiste) {
            return res.status(400).json({
                success: false,
                message: 'Este empleado ya está agregado a la planilla'
            });
        }

        // Calcular salario semanal (salario mensual / 4)
        const salarioMensual = parseFloat(personal.salario) || 0;
        const salarioSemanal = salarioMensual / 4;

        // Generar días de la semana con fechas
        const dias = generarDiasSemana(planilla.fechaInicio);

        // Crear objeto empleado para agregar
        const nuevoEmpleado = {
            empleadoId: personal._id,
            tipo: tipo,
            nombreCompleto: `${personal.name} ${personal.lastName}`,
            salarioSemanal: Math.round(salarioSemanal * 100) / 100,
            dias: dias,
            totalBase: 0,
            totalViaticos: 0,
            anticipos: 0,
            descuentos: 0,
            totalPagar: 0
        };

        // Agregar a la planilla
        planilla.empleados.push(nuevoEmpleado);
        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Empleado agregado exitosamente',
            data: nuevoEmpleado
        });

    } catch (error) {
        console.error('Error al agregar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar empleado',
            error: error.message
        });
    }
};

// ============================================
// REGISTRAR DÍA DE TRABAJO
// ============================================
PlanillaSemanalController.registrarDia = async (req, res) => {
    try {
        const { planillaId, empleadoIndex } = req.params;
        const { dia, viaticos, faltaInjustificada } = req.body;

        // Validar campos requeridos
        if (!dia) {
            return res.status(400).json({
                success: false,
                message: 'El campo "dia" es requerido (lunes, martes, etc.)'
            });
        }

        // Buscar planilla
        const planilla = await PlanillaSemanal.findById(planillaId);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Validar que la planilla esté abierta
        if (['pagada', 'cerrada'].includes(planilla.estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede registrar días en una planilla ${planilla.estado}`
            });
        }

        // Buscar empleado en la planilla
        const empleado = planilla.empleados[parseInt(empleadoIndex)];
        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en la planilla'
            });
        }

        // Buscar el día específico
        const diaIndex = empleado.dias.findIndex(d => d.dia === dia);
        if (diaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Día no encontrado en el registro del empleado'
            });
        }

        // Calcular base diaria (salarioSemanal / diasHabiles)
        const baseDiaria = empleado.salarioSemanal / planilla.diasHabiles;

        // Actualizar día
        planilla.empleados[empleadoIndex].dias[diaIndex] = {
            ...planilla.empleados[empleadoIndex].dias[diaIndex],
            base: Math.round(baseDiaria * 100) / 100, // SIEMPRE se calcula
            viaticos: parseFloat(viaticos) || 0,
            faltaInjustificada: Boolean(faltaInjustificada)
        };

        // Recalcular totales del empleado
        const diasActualizados = planilla.empleados[empleadoIndex].dias;
        planilla.empleados[empleadoIndex].totalBase = diasActualizados.reduce((sum, d) => sum + (d.base || 0), 0);
        planilla.empleados[empleadoIndex].totalViaticos = diasActualizados.reduce((sum, d) => sum + (d.viaticos || 0), 0);

        // Recalcular total a pagar
        const { totalBase, totalViaticos, anticipos, descuentos } = planilla.empleados[empleadoIndex];
        planilla.empleados[empleadoIndex].totalPagar = totalBase + totalViaticos - anticipos - descuentos;

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Día registrado exitosamente',
            data: planilla.empleados[empleadoIndex]
        });

    } catch (error) {
        console.error('Error al registrar día:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar día',
            error: error.message
        });
    }
};

// ============================================
// ACTUALIZAR ANTICIPOS/DESCUENTOS
// ============================================
PlanillaSemanalController.actualizarAnticiposDescuentos = async (req, res) => {
    try {
        const { planillaId, empleadoIndex } = req.params;
        const { anticipos, descuentos } = req.body;

        // Buscar planilla
        const planilla = await PlanillaSemanal.findById(planillaId);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Validar que la planilla esté abierta
        if (['pagada', 'cerrada'].includes(planilla.estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede modificar una planilla ${planilla.estado}`
            });
        }

        // Buscar empleado
        const empleado = planilla.empleados[parseInt(empleadoIndex)];
        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en la planilla'
            });
        }

        // Actualizar anticipos y descuentos
        if (anticipos !== undefined) {
            planilla.empleados[empleadoIndex].anticipos = Math.max(0, parseFloat(anticipos) || 0);
        }
        if (descuentos !== undefined) {
            planilla.empleados[empleadoIndex].descuentos = Math.max(0, parseFloat(descuentos) || 0);
        }

        // Recalcular total a pagar
        const { totalBase, totalViaticos, anticipos: ant, descuentos: desc } = planilla.empleados[empleadoIndex];
        planilla.empleados[empleadoIndex].totalPagar = totalBase + totalViaticos - ant - desc;

        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Anticipos/descuentos actualizados exitosamente',
            data: planilla.empleados[empleadoIndex]
        });

    } catch (error) {
        console.error('Error al actualizar anticipos/descuentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar anticipos/descuentos',
            error: error.message
        });
    }
};

// ============================================
// OBTENER TODAS LAS PLANILLAS
// ============================================
PlanillaSemanalController.obtenerPlanillas = async (req, res) => {
    try {
        const { estado, page = 1, limit = 10 } = req.query;

        const query = {};
        if (estado) {
            query.estado = estado;
        }

        const planillas = await PlanillaSemanal.find(query)
            .sort({ fechaInicio: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await PlanillaSemanal.countDocuments(query);

        res.status(200).json({
            success: true,
            data: planillas,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener planillas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener planillas',
            error: error.message
        });
    }
};

// ============================================
// OBTENER PLANILLA POR ID
// ============================================
PlanillaSemanalController.obtenerPlanillaPorId = async (req, res) => {
    try {
        const { id } = req.params;

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
            message: 'Error al obtener planilla',
            error: error.message
        });
    }
};

// ============================================
// CAMBIAR ESTADO DE PLANILLA
// ============================================
PlanillaSemanalController.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar estado
        const estadosValidos = ['pendiente', 'aprobada', 'pagada', 'cerrada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }

        const planilla = await PlanillaSemanal.findById(id);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Validar transiciones de estado
        const transicionesValidas = {
            'pendiente': ['aprobada', 'cerrada'],
            'aprobada': ['pagada', 'cerrada'],
            'pagada': ['cerrada'],
            'cerrada': []
        };

        if (!transicionesValidas[planilla.estado].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede cambiar de estado "${planilla.estado}" a "${estado}"`
            });
        }

        planilla.estado = estado;
        await planilla.save();

        res.status(200).json({
            success: true,
            message: `Planilla cambiada a estado: ${estado}`,
            data: planilla
        });

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado de planilla',
            error: error.message
        });
    }
};

// ============================================
// ELIMINAR EMPLEADO DE PLANILLA
// ============================================
PlanillaSemanalController.eliminarEmpleado = async (req, res) => {
    try {
        const { planillaId, empleadoIndex } = req.params;

        const planilla = await PlanillaSemanal.findById(planillaId);
        if (!planilla) {
            return res.status(404).json({
                success: false,
                message: 'Planilla no encontrada'
            });
        }

        // Validar que la planilla esté abierta
        if (['pagada', 'cerrada'].includes(planilla.estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar empleados de una planilla ${planilla.estado}`
            });
        }

        const index = parseInt(empleadoIndex);
        if (index < 0 || index >= planilla.empleados.length) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado en la planilla'
            });
        }

        planilla.empleados.splice(index, 1);
        await planilla.save();

        res.status(200).json({
            success: true,
            message: 'Empleado eliminado de la planilla exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar empleado',
            error: error.message
        });
    }
};

export default PlanillaSemanalController;