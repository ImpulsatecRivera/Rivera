import motoristalModel from "../Models/Motorista.js";
import camioneModel from "../Models/Camiones.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import viajesModel from "../Models/Viajes.js";

/**
 * Controlador para manejar operaciones CRUD de motoristas
 */
const motoristasCon = {};

/**
 * Configuración de Cloudinary para manejo de imágenes de motoristas
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Función auxiliar para validar fechas
 */
const esFechaValida = (fecha) => {
  if (!fecha) return false;
  const fechaObj = new Date(fecha);
  return !isNaN(fechaObj.getTime());
};

/**
 * Obtener todos los motoristas registrados
 * GET /motoristas
 */
motoristasCon.get = async (req, res) => {
  try {
    const newMotorista = await motoristalModel.find();
    res.status(200).json(newMotorista);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motoristas", error: error.message });
  }
};

/**
 * Obtener un motorista específico por ID junto con su camión asignado
 * GET /motoristas/:id
 */
motoristasCon.getById = async (req, res) => {
  try {
    const motorista = await motoristalModel.findById(req.params.id);
    
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    const camion = await camioneModel.findOne({ driverId: motorista._id });
    
    const motoristaCompleto = {
      ...motorista.toObject(),
      camionAsignado: camion ? {
        _id: camion._id,
        name: camion.name,
        brand: camion.brand,
        model: camion.model,
        licensePlate: camion.licensePlate,
        state: camion.state,
        gasolineLevel: camion.gasolineLevel,
        img: camion.img
      } : null
    };
    
    res.status(200).json(motoristaCompleto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motorista", error: error.message });
  }
};

/**
 * Función auxiliar para generar email automático
 */
const generarEmail = async (name, lastName) => {
  const dominio = "rivera.com";
  let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
  let email = `${base}@${dominio}`;
  let contador = 1;

  while (await motoristalModel.findOne({ email })) {
    email = `${base}${contador}@${dominio}`;
    contador++;
  }

  return email;
};

/**
 * Registrar nuevo motorista
 * POST /motoristas
 */
motoristasCon.post = async (req, res) => {
  try {
    const { name, lastName, id, birthDate, password, phone, address, circulationCard } = req.body;

    const email = await generarEmail(name, lastName);

    const validarMotorista = await motoristalModel.findOne({ email });
    if (validarMotorista) {
      return res.status(400).json({ message: "Motorista ya registrado" });
    }

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const contraHash = await bcryptjs.hash(password, 10);

    const newmotorista = new motoristalModel({
      name,
      lastName,
      email,
      id,
      birthDate,
      password: contraHash,
      phone,
      address,
      circulationCard,
      img: imgUrl,
    });

    await newmotorista.save();
    res.status(200).json({ Message: "Motorista agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar motoristas", error: error.message });
  }
};

/**
 * Actualizar motorista
 * PUT /motoristas/:id
 */
motoristasCon.put = async (req, res) => {
  try {
    const motoristaId = req.params.id;
    const { name, lastName, password, phone, address, circulationCard } = req.body;

    const motoristaExistente = await motoristalModel.findById(motoristaId);
    if (!motoristaExistente) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const updateData = {
      name: name?.trim() || motoristaExistente.name,
      lastName: lastName?.trim() || motoristaExistente.lastName,
      phone: phone?.trim() || motoristaExistente.phone,
      address: address?.trim() || motoristaExistente.address,
      circulationCard: circulationCard?.trim() || motoristaExistente.circulationCard,
      img: imgUrl?.trim() || motoristaExistente.img,
      email: motoristaExistente.email,
      id: motoristaExistente.id,
      birthDate: motoristaExistente.birthDate,
    };

    if (name?.trim() || lastName?.trim()) {
      const nombreFinal = name?.trim() || motoristaExistente.name;
      const apellidoFinal = lastName?.trim() || motoristaExistente.lastName;
      updateData.email = await generarEmail(nombreFinal, apellidoFinal);
    }

    if (password?.trim()) {
      updateData.password = await bcryptjs.hash(password.trim(), 10);
    } else {
      updateData.password = motoristaExistente.password;
    }

    const motoristaActualizado = await motoristalModel.findByIdAndUpdate(
      motoristaId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!motoristaActualizado) {
      return res.status(404).json({ message: "Error al actualizar motorista" });
    }

    res.status(200).json({
      message: "Motorista editado correctamente",
      motorista: motoristaActualizado,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar motorista",
      error: error.message,
    });
  }
};

/**
 * Eliminar motorista
 * DELETE /motoristas/:id
 */
motoristasCon.delete = async (req, res) => {
  try {
    const deleteMotorista = await motoristalModel.findByIdAndDelete(req.params.id);
    
    if (!deleteMotorista) {
      return res.status(400).json({ Message: "Motorista no localizado" });
    }
    
    res.status(200).json({ Message: "Motorista eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar motoristas", error: error.message });
  }
};

/**
 * Obtener viajes programados de un motorista CON VALIDACIÓN DE FECHAS
 * GET /motoristas/:id/viajes-programados
 */
motoristasCon.getViajesProgramados = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    const camion = await camioneModel.findOne({ driverId: motoristaId });
    if (!camion) {
      return res.status(200).json({ 
        message: "El motorista no tiene camión asignado",
        motorista: {
          _id: motorista._id,
          name: motorista.name,
          lastName: motorista.lastName,
          email: motorista.email
        },
        viajesProgramados: []
      });
    }

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + 30);

    // CORREGIDO: Usar truckId y validar fechas
    const viajesProgramados = await viajesModel.find({
      truckId: camion._id,
      fechaSalida: {
        $exists: true,
        $ne: null,
        $gte: fechaActual,
        $lte: fechaLimite
      },
      estado: { $in: ['programado', 'pendiente', 'confirmado'] }
    }).sort({ fechaSalida: 1 });

    // Filtrar viajes con fechas válidas
    const viajesValidos = viajesProgramados.filter(viaje => esFechaValida(viaje.fechaSalida));

    console.log(`Viajes programados encontrados: ${viajesProgramados.length}`);
    console.log(`Viajes programados con fechas válidas: ${viajesValidos.length}`);

    // Agrupar viajes por día CON VALIDACIÓN
    const viajesAgrupados = {};
    
    viajesValidos.forEach(viaje => {
      try {
        const fecha = new Date(viaje.fechaSalida);
        const fechaString = fecha.toISOString().split('T')[0];
        
        if (!viajesAgrupados[fechaString]) {
          viajesAgrupados[fechaString] = [];
        }
        
        viajesAgrupados[fechaString].push({
          _id: viaje._id,
          origen: viaje.origen,
          destino: viaje.destino,
          fechaSalida: viaje.fechaSalida,
          fechaLlegada: viaje.fechaLlegada,
          estado: viaje.estado,
          descripcion: viaje.descripcion,
          carga: viaje.carga,
          cliente: viaje.cliente
        });
      } catch (error) {
        console.log(`Error agrupando viaje programado ${viaje._id}:`, error.message);
      }
    });

    const viajesPorDia = Object.keys(viajesAgrupados)
      .sort()
      .map(fecha => ({
        fecha: fecha,
        viajes: viajesAgrupados[fecha]
      }));

    res.status(200).json({
      motorista: {
        _id: motorista._id,
        name: motorista.name,
        lastName: motorista.lastName,
        email: motorista.email,
        phone: motorista.phone,
        img: motorista.img
      },
      camionAsignado: {
        _id: camion._id,
        name: camion.name,
        brand: camion.brand,
        model: camion.model,
        licensePlate: camion.licensePlate,
        state: camion.state
      },
      totalViajes: viajesValidos.length,
      viajesPorDia: viajesPorDia
    });

  } catch (error) {
    console.error("Error en getViajesProgramados:", error);
    res.status(500).json({ 
      message: "Error al obtener viajes programados", 
      error: error.message 
    });
  }
};

/**
 * Obtener todos los viajes programados CON VALIDACIÓN DE FECHAS
 * GET /motoristas/viajes-programados/todos
 */
motoristasCon.getAllViajesProgramados = async (req, res) => {
  try {
    const motoristas = await motoristalModel.find();
    const camiones = await camioneModel.find({ driverId: { $exists: true, $ne: null } });

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + 30);

    // CORREGIDO: Usar truckId y validar fechas
    const todosLosViajes = await viajesModel.find({
      truckId: { $in: camiones.map(c => c._id) },
      fechaSalida: {
        $exists: true,
        $ne: null,
        $gte: fechaActual,
        $lte: fechaLimite
      },
      estado: { $in: ['programado', 'pendiente', 'confirmado'] }
    }).sort({ fechaSalida: 1 });

    // Filtrar viajes válidos
    const viajesValidos = todosLosViajes.filter(viaje => esFechaValida(viaje.fechaSalida));

    const motoristasMap = {};
    const camionesMap = {};

    motoristas.forEach(m => {
      motoristasMap[m._id.toString()] = m;
    });

    camiones.forEach(c => {
      camionesMap[c._id.toString()] = c;
    });

    const viajesPorFecha = {};

    viajesValidos.forEach(viaje => {
      try {
        const fecha = new Date(viaje.fechaSalida).toISOString().split('T')[0];
        // CORREGIDO: Usar truckId
        const camion = camionesMap[viaje.truckId.toString()];
        
        if (camion && camion.driverId) {
          const motorista = motoristasMap[camion.driverId.toString()];
          
          if (motorista) {
            if (!viajesPorFecha[fecha]) {
              viajesPorFecha[fecha] = {};
            }

            const motoristaKey = motorista._id.toString();
            if (!viajesPorFecha[fecha][motoristaKey]) {
              viajesPorFecha[fecha][motoristaKey] = {
                motorista: {
                  _id: motorista._id,
                  name: motorista.name,
                  lastName: motorista.lastName,
                  email: motorista.email,
                  img: motorista.img
                },
                camion: {
                  _id: camion._id,
                  name: camion.name,
                  licensePlate: camion.licensePlate
                },
                viajes: []
              };
            }

            viajesPorFecha[fecha][motoristaKey].viajes.push({
              _id: viaje._id,
              origen: viaje.origen,
              destino: viaje.destino,
              fechaSalida: viaje.fechaSalida,
              fechaLlegada: viaje.fechaLlegada,
              estado: viaje.estado,
              descripcion: viaje.descripcion,
              carga: viaje.carga,
              cliente: viaje.cliente
            });
          }
        }
      } catch (error) {
        console.log(`Error procesando viaje ${viaje._id}:`, error.message);
      }
    });

    const viajesOrganizados = Object.keys(viajesPorFecha)
      .sort()
      .map(fecha => ({
        fecha: fecha,
        motoristasConViajes: Object.values(viajesPorFecha[fecha])
      }));

    res.status(200).json({
      totalDias: viajesOrganizados.length,
      totalViajes: viajesValidos.length,
      viajesPorDia: viajesOrganizados
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener todos los viajes programados", 
      error: error.message 
    });
  }
};

/**
 * Obtener historial completo de viajes CON VALIDACIÓN DE FECHAS
 * GET /motoristas/:id/historial-completo
 */
motoristasCon.getHistorialCompleto = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    const camion = await camioneModel.findOne({ driverId: motoristaId });
    if (!camion) {
      return res.status(200).json({ 
        message: "El motorista no tiene camión asignado",
        motorista: {
          _id: motorista._id,
          name: motorista.name,
          lastName: motorista.lastName,
          email: motorista.email
        },
        historialCompleto: [],
        totalViajes: 0,
        estadisticas: {
          programados: 0,
          completados: 0,
          cancelados: 0,
          enProgreso: 0
        }
      });
    }

    // CORREGIDO: Usar truckId y filtrar fechas válidas desde la consulta
    const todosLosViajes = await viajesModel.find({
      truckId: camion._id,
      fechaSalida: { $exists: true, $ne: null }
    }).sort({ fechaSalida: -1 });

    // Filtrar viajes con fechas válidas
    const viajesValidos = todosLosViajes.filter(viaje => esFechaValida(viaje.fechaSalida));

    console.log(`Total viajes encontrados: ${todosLosViajes.length}`);
    console.log(`Viajes con fechas válidas: ${viajesValidos.length}`);

    const estadisticas = {
      programados: viajesValidos.filter(v => ['programado', 'pendiente', 'confirmado'].includes(v.estado)).length,
      completados: viajesValidos.filter(v => ['completado', 'finalizado'].includes(v.estado)).length,
      cancelados: viajesValidos.filter(v => v.estado === 'cancelado').length,
      enProgreso: viajesValidos.filter(v => ['en_transito', 'iniciado'].includes(v.estado)).length
    };

    // Agrupar viajes POR MES con validación de fechas
    const viajesPorMes = {};
    
    viajesValidos.forEach(viaje => {
      try {
        const fecha = new Date(viaje.fechaSalida);
        const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!viajesPorMes[mesAno]) {
          viajesPorMes[mesAno] = [];
        }
        
        viajesPorMes[mesAno].push({
          _id: viaje._id,
          origen: viaje.origen,
          destino: viaje.destino,
          fechaSalida: viaje.fechaSalida,
          fechaLlegada: viaje.fechaLlegada,
          estado: viaje.estado,
          descripcion: viaje.descripcion,
          carga: viaje.carga,
          cliente: viaje.cliente
        });
      } catch (error) {
        console.log(`Error procesando viaje para mes ${viaje._id}:`, error.message);
      }
    });

    const historialPorMes = Object.keys(viajesPorMes)
      .sort((a, b) => b.localeCompare(a))
      .map(mesAno => {
        const [año, mes] = mesAno.split('-');
        const fecha = new Date(año, mes - 1);
        
        return {
          periodo: fecha.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
          }),
          mesAno: mesAno,
          cantidadViajes: viajesPorMes[mesAno].length,
          viajes: viajesPorMes[mesAno]
        };
      });

    // Agrupar viajes POR DÍA con validación de fechas
    const viajesAgrupados = {};
    
    viajesValidos.forEach(viaje => {
      try {
        const fecha = new Date(viaje.fechaSalida);
        const fechaString = fecha.toISOString().split('T')[0];
        
        if (!viajesAgrupados[fechaString]) {
          viajesAgrupados[fechaString] = [];
        }
        
        viajesAgrupados[fechaString].push({
          _id: viaje._id,
          origen: viaje.origen,
          destino: viaje.destino,
          fechaSalida: viaje.fechaSalida,
          fechaLlegada: viaje.fechaLlegada,
          estado: viaje.estado,
          descripcion: viaje.descripcion,
          carga: viaje.carga,
          cliente: viaje.cliente
        });
      } catch (error) {
        console.log(`Error agrupando viaje ${viaje._id}:`, error.message);
      }
    });

    const viajesPorDia = Object.keys(viajesAgrupados)
      .sort((a, b) => b.localeCompare(a))
      .map(fecha => ({
        fecha: fecha,
        viajes: viajesAgrupados[fecha]
      }));

    res.status(200).json({
      motorista: {
        _id: motorista._id,
        name: motorista.name,
        lastName: motorista.lastName,
        email: motorista.email,
        phone: motorista.phone,
        img: motorista.img
      },
      camionAsignado: {
        _id: camion._id,
        name: camion.name,
        brand: camion.brand,
        model: camion.model,
        licensePlate: camion.licensePlate,
        state: camion.state
      },
      totalViajes: viajesValidos.length,
      estadisticas,
      historialCompleto: viajesValidos.map(viaje => ({
        _id: viaje._id,
        origen: viaje.origen,
        destino: viaje.destino,
        fechaSalida: viaje.fechaSalida,
        fechaLlegada: viaje.fechaLlegada,
        estado: viaje.estado,
        descripcion: viaje.descripcion,
        carga: viaje.carga,
        cliente: viaje.cliente
      })),
      historialPorMes,
      viajesPorDia
    });

  } catch (error) {
    console.error("Error en getHistorialCompleto:", error);
    res.status(500).json({ 
      message: "Error al obtener historial completo de viajes", 
      error: error.message 
    });
  }
};

/**
 * Crear viajes de prueba (función temporal)
 * POST /motoristas/:id/crear-viajes-prueba
 */
motoristasCon.crearViajesPrueba = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    const camion = await camioneModel.findOne({ driverId: motoristaId });
    if (!camion) {
      return res.status(400).json({ message: "El motorista no tiene camión asignado" });
    }

    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    
    const pasadoManana = new Date();
    pasadoManana.setDate(hoy.getDate() + 2);

    // CORREGIDO: Usar truckId
    const viajesPrueba = [
      {
        truckId: camion._id,
        origen: "San Salvador",
        destino: "Santa Tecla", 
        fechaSalida: hoy,
        fechaLlegada: new Date(hoy.getTime() + 2 * 60 * 60 * 1000),
        estado: "programado",
        descripcion: "Transporte de materiales de construcción",
        carga: "Cemento y varillas",
        cliente: "Constructora López"
      },
      {
        truckId: camion._id,
        origen: "Santa Tecla",
        destino: "Antiguo Cuscatlán",
        fechaSalida: manana,
        fechaLlegada: new Date(manana.getTime() + 3 * 60 * 60 * 1000),
        estado: "pendiente",
        descripcion: "Entrega de mobiliario",
        carga: "Muebles de oficina",
        cliente: "Oficinas Central"
      },
      {
        truckId: camion._id,
        origen: "San Salvador",
        destino: "Soyapango",
        fechaSalida: pasadoManana,
        fechaLlegada: new Date(pasadoManana.getTime() + 1 * 60 * 60 * 1000),
        estado: "confirmado",
        descripcion: "Distribución de alimentos",
        carga: "Productos alimenticios",
        cliente: "Supermercado Rivera"
      },
      {
        truckId: camion._id,
        origen: "Antiguo Cuscatlán",
        destino: "San Salvador",
        fechaSalida: new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000),
        fechaLlegada: new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        estado: "completado",
        descripcion: "Transporte de combustible",
        carga: "Gasolina",
        cliente: "Estación Shell"
      }
    ];

    const viajesCreados = await viajesModel.insertMany(viajesPrueba);

    res.status(200).json({
      message: "Viajes de prueba creados exitosamente",
      motorista: {
        _id: motorista._id,
        name: motorista.name,
        lastName: motorista.lastName
      },
      camion: {
        _id: camion._id,
        licensePlate: camion.licensePlate
      },
      viajesCreados: viajesCreados.length,
      viajes: viajesCreados.map(v => ({
        _id: v._id,
        origen: v.origen,
        destino: v.destino,
        fechaSalida: v.fechaSalida,
        estado: v.estado
      }))
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al crear viajes de prueba", 
      error: error.message 
    });
  }
};

/**
 * Debug de viajes para diagnosticar problemas
 * GET /motoristas/:id/debug-viajes
 */
motoristasCon.debugViajes = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    const camion = await camioneModel.findOne({ driverId: motoristaId });
    const todosLosViajes = await viajesModel.find({});
    const viajesDelCamion = camion ? await viajesModel.find({ truckId: camion._id }) : [];
    const otrosCamiones = await camioneModel.find({});
    const viajesOtrosCamiones = await viajesModel.find({ 
      truckId: { $in: otrosCamiones.map(c => c._id) } 
    });

    res.status(200).json({
      debug: true,
      motorista: {
        id: motorista?._id,
        nombre: motorista?.name + ' ' + motorista?.lastName,
        existe: !!motorista
      },
      camionAsignado: {
        id: camion?._id,
        matricula: camion?.licensePlate,
        existe: !!camion
      },
      estadisticas: {
        totalViajesEnDB: todosLosViajes.length,
        viajesDelCamionAsignado: viajesDelCamion.length,
        viajesDeOtrosCamiones: viajesOtrosCamiones.length
      },
      todosLosViajes: todosLosViajes.map(v => ({
        id: v._id,
        truckId: v.truckId,
        camionId: v.camionId,
        origen: v.origen,
        destino: v.destino,
        estado: v.estado,
        fechaSalidaValida: esFechaValida(v.fechaSalida)
      })),
      viajesDelCamionAsignado: viajesDelCamion.map(v => ({
        id: v._id,
        origen: v.origen,
        destino: v.destino,
        estado: v.estado,
        fechaSalidaValida: esFechaValida(v.fechaSalida)
      })),
      camionesEnDB: otrosCamiones.map(c => ({
        id: c._id,
        matricula: c.licensePlate,
        driverId: c.driverId,
        esDelMotorista: c.driverId?.toString() === motoristaId
      }))
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      debug: true
    });
  }
};

export default motoristasCon;