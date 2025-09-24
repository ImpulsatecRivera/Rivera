import motoristalModel from "../Models/Motorista.js";
import camioneModel from "../Models/Camiones.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import viajesModel from "../Models/Viajes.js";
import mongoose from "mongoose";

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

/* ====================== Helpers ====================== */
const esFechaValida = (fecha) => {
  if (!fecha) return false;
  const x = new Date(fecha);
  return !isNaN(x.getTime());
};

const pickFechaSalida = (v) =>
  v?.fechaSalida ??
  v?.fecha ??
  v?.createdAt ??        // fallback por si no hay fecha clara
  v?.departureTime ??
  v?.salida ??
  v?.horarios?.fechaSalida ??
  null;

const pickFechaLlegada = (v) =>
  v?.fechaLlegada ??
  v?.arrivalTime ??
  v?.llegada ??
  v?.horarios?.fechaLlegadaEstimada ??
  null;

const normalizarEstado = (s) => {
  const e = (s || "").toString().toLowerCase();
  if (e === "en_curso") return "en_transito";
  return e || "programado";
};

const toIdList = (x) => {
  const arr = [];
  if (!x) return arr;
  try {
    const oid = x instanceof mongoose.Types.ObjectId ? x : new mongoose.Types.ObjectId(x);
    arr.push(oid);
  } catch (_) {}
  try {
    arr.push(x.toString());
  } catch (_) {}
  return [...new Set(arr)];
};

/** Construye todas las variantes posibles para matchear un camión en viajes */
const buildTruckMatch = (camion) => {
  const ids = toIdList(camion?._id);
  const idsStr = ids.map((v) => v.toString());
  const placa = camion?.licensePlate || camion?.placa || null;

  const or = [
    { truckId: { $in: ids } },
    { camionId: { $in: ids } },
    { truckId: { $in: idsStr } },
    { camionId: { $in: idsStr } },
    { "truck._id": { $in: ids } },
    { "camion._id": { $in: ids } },
    { "truck.id": { $in: idsStr } },
    { "camion.id": { $in: idsStr } },
  ];

  if (placa) {
    or.push(
      { "truck.licensePlate": placa },
      { "camion.licensePlate": placa },
      { "truck.placa": placa },
      { "camion.placa": placa }
    );
  }
  return or;
};

/** Construye variantes para matchear por CONDUCTOR (ObjectId y string) */
const buildDriverMatch = (motoristaOrId) => {
  const ids = toIdList(motoristaOrId?._id ?? motoristaOrId);
  const idsStr = ids.map((v) => v.toString());
  return [
    { driverId: { $in: ids } },
    { motoristaId: { $in: ids } },
    { conductorId: { $in: ids } },

    { driverId: { $in: idsStr } },
    { motoristaId: { $in: idsStr } },
    { conductorId: { $in: idsStr } },

    { "driver._id": { $in: ids } },
    { "motorista._id": { $in: ids } },
    { "conductor._id": { $in: ids } },

    { "driver.id": { $in: idsStr } },
    { "motorista.id": { $in: idsStr } },
    { "conductor.id": { $in: idsStr } },
  ];
};

/* ====================== Rutas CRUD básicas ====================== */

motoristasCon.get = async (req, res) => {
  try {
    const newMotorista = await motoristalModel.find();
    res.status(200).json(newMotorista);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motoristas", error: error.message });
  }
};

motoristasCon.getById = async (req, res) => {
  try {
    const motorista = await motoristalModel.findById(req.params.id);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    // soporta driverId como ObjectId o string
    const driverVariants = toIdList(motorista._id);
    const camion = await camioneModel.findOne({ driverId: { $in: driverVariants } });

    const motoristaCompleto = {
      ...motorista.toObject(),
      camionAsignado: camion
        ? {
            _id: camion._id,
            name: camion.name,
            brand: camion.brand,
            model: camion.model,
            licensePlate: camion.licensePlate,
            state: camion.state,
            gasolineLevel: camion.gasolineLevel,
            img: camion.img,
          }
        : null,
    };

    res.status(200).json(motoristaCompleto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motorista", error: error.message });
  }
};

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

    const motoristaActualizado = await motoristalModel.findByIdAndUpdate(motoristaId, updateData, {
      new: true,
      runValidators: true,
    });

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
 * Obtener viajes programados (4 semanas) – sin filtrar fechas en Mongo (se filtra en JS)
 * Devuelve también lista plana `viajes` para el hook.
 */
motoristasCon.getViajesProgramados = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    // Buscar camión soportando driverId como ObjectId o string
    const driverVariants = toIdList(motoristaId);
    const camion = await camioneModel.findOne({ driverId: { $in: driverVariants } });
    if (!camion) {
      // AÚN SIN CAMIÓN: igual vamos a buscar por CONDUCTOR para no devolver vacío
      const estadoIn = ["programado","pendiente","confirmado","iniciado","en_curso","en_transito"];
      const driverOr = buildDriverMatch(motorista);
      const docsSoloConductor = await viajesModel.find({ $and: [{ $or: driverOr }, { estado: { $in: estadoIn } }] }).lean();

      const fechaActual = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaActual.getDate() + 30);

      const enRango = (d) => esFechaValida(d) && new Date(d).getTime() >= fechaActual.getTime() && new Date(d).getTime() <= fechaLimite.getTime();

      const viajesValidos = docsSoloConductor
        .map((v)=>({ ...v, _salida: pickFechaSalida(v), _estadoNorm: normalizarEstado(v.estado) }))
        .filter((v)=>enRango(v._salida))
        .sort((a,b)=> new Date(a._salida)-new Date(b._salida));

      const viajesPlano = viajesValidos.map((v)=>({
        _id: v._id,
        origen: v.origen,
        destino: v.destino,
        fechaSalida: v._salida,
        fechaLlegada: pickFechaLlegada(v),
        estado: v._estadoNorm,
        descripcion: v.descripcion,
        carga: v.carga,
        cliente: v.cliente,
      }));

      const agrupado = {};
      for (const v of viajesPlano) {
        const d = new Date(v.fechaSalida).toISOString().split("T")[0];
        (agrupado[d] ||= []).push(v);
      }
      const viajesPorDia = Object.keys(agrupado).sort().map((fecha)=>({ fecha, viajes: agrupado[fecha] }));

      return res.status(200).json({
        motorista: {
          _id: motorista._id,
          name: motorista.name,
          lastName: motorista.lastName,
          email: motorista.email,
          phone: motorista.phone,
          img: motorista.img,
        },
        camionAsignado: null,
        totalViajes: viajesPlano.length,
        viajesPorDia,
        viajes: viajesPlano,
      });
    }

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + 30);

    // 🎯 Match robusto por CAMIÓN y también por CONDUCTOR
    const truckOr = buildTruckMatch(camion);
    const driverOr = buildDriverMatch(motorista);

    // Trae TODO por identificación y estado; fecha se evalúa en JS
    const estadoIn = ["programado","pendiente","confirmado","iniciado","en_curso","en_transito"];
    const query = { $and: [{ $or: [...truckOr, ...driverOr] }, { estado: { $in: estadoIn } }] };

    const docs = await viajesModel.find(query).lean();

    const enRango = (d) => {
      if (!esFechaValida(d)) return false;
      const t = new Date(d).getTime();
      return t >= fechaActual.getTime() && t <= fechaLimite.getTime();
    };

    const viajesValidos = docs
      .map((v) => {
        const salida = pickFechaSalida(v);
        return { ...v, _salida: salida, _estadoNorm: normalizarEstado(v.estado) };
      })
      .filter((v) => enRango(v._salida))
      .sort((a, b) => new Date(a._salida) - new Date(b._salida));

    // Lista plana
    const viajesPlano = viajesValidos.map((v) => ({
      _id: v._id,
      origen: v.origen,
      destino: v.destino,
      fechaSalida: v._salida,
      fechaLlegada: pickFechaLlegada(v),
      estado: v._estadoNorm,
      descripcion: v.descripcion,
      carga: v.carga,
      cliente: v.cliente,
    }));

    // Agrupado por día
    const agrupado = {};
    for (const v of viajesPlano) {
      const d = new Date(v.fechaSalida).toISOString().split("T")[0];
      (agrupado[d] ||= []).push(v);
    }

    const viajesPorDia = Object.keys(agrupado)
      .sort()
      .map((fecha) => ({ fecha, viajes: agrupado[fecha] }));

    res.status(200).json({
      motorista: {
        _id: motorista._id,
        name: motorista.name,
        lastName: motorista.lastName,
        email: motorista.email,
        phone: motorista.phone,
        img: motorista.img,
      },
      camionAsignado: {
        _id: camion._id,
        name: camion.name,
        brand: camion.brand,
        model: camion.model,
        licensePlate: camion.licensePlate,
        state: camion.state,
      },
      totalViajes: viajesPlano.length,
      viajesPorDia,
      viajes: viajesPlano,
    });
  } catch (error) {
    console.error("Error en getViajesProgramados:", error);
    res.status(500).json({
      message: "Error al obtener viajes programados",
      error: error.message,
    });
  }
};

/**
 * Obtener todos los viajes programados (4 semanas) – sin filtrar fechas en Mongo (se filtra en JS)
 */
motoristasCon.getAllViajesProgramados = async (req, res) => {
  try {
    const motoristas = await motoristalModel.find();
    const camiones = await camioneModel.find({ driverId: { $exists: true, $ne: null } });

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + 30);

    const camionesMap = {};
    camiones.forEach((c) => {
      camionesMap[c._id.toString()] = c;
    });

    const allTruckIds = camiones.map((c) => c._id);
    const allTruckIdsStr = camiones.map((c) => c._id.toString());
    const allPlates = camiones.map((c) => c.licensePlate || c.placa).filter(Boolean);

    // Match robusto para TODOS los camiones asignados
    const truckOr = [
      { truckId: { $in: [...allTruckIds, ...allTruckIdsStr] } },
      { camionId: { $in: [...allTruckIds, ...allTruckIdsStr] } },
      { "truck._id": { $in: allTruckIds } },
      { "camion._id": { $in: allTruckIds } },
      { "truck.id": { $in: allTruckIdsStr } },
      { "camion.id": { $in: allTruckIdsStr } },
    ];
    if (allPlates.length) {
      truckOr.push(
        { "truck.licensePlate": { $in: allPlates } },
        { "camion.licensePlate": { $in: allPlates } },
        { "truck.placa": { $in: allPlates } },
        { "camion.placa": { $in: allPlates } }
      );
    }

    const estadoIn = ["programado", "pendiente", "confirmado", "iniciado", "en_curso", "en_transito"];
    const query = { $and: [{ $or: truckOr }, { estado: { $in: estadoIn } }] };

    const docs = await viajesModel.find(query).lean();

    const enRango = (d) => {
      if (!esFechaValida(d)) return false;
      const t = new Date(d).getTime();
      return t >= fechaActual.getTime() && t <= fechaLimite.getTime();
    };

    const motoristasMap = {};
    motoristas.forEach((m) => {
      motoristasMap[m._id.toString()] = m;
    });

    const porFecha = {};

    for (const v of docs) {
      const salida = pickFechaSalida(v);
      if (!enRango(salida)) continue;

      const fecha = new Date(salida).toISOString().split("T")[0];

      const keyCamion =
        v?.truckId?.toString?.() ||
        v?.camionId?.toString?.() ||
        (typeof v?.truckId === "string" ? v.truckId : null) ||
        (typeof v?.camionId === "string" ? v.camionId : null) ||
        v?.truck?._id?.toString?.() ||
        v?.camion?._id?.toString?.();

      const camion = keyCamion ? camionesMap[keyCamion] : null;
      if (!camion || !camion.driverId) continue;

      const motorista = motoristasMap[camion.driverId.toString()];
      if (!motorista) continue;

      porFecha[fecha] ||= {};
      const mKey = motorista._id.toString();

      porFecha[fecha][mKey] ||= {
        motorista: {
          _id: motorista._id,
          name: motorista.name,
          lastName: motorista.lastName,
          email: motorista.email,
          img: motorista.img,
        },
        camion: {
          _id: camion._id,
          name: camion.name,
          licensePlate: camion.licensePlate,
        },
        viajes: [],
      };

      porFecha[fecha][mKey].viajes.push({
        _id: v._id,
        origen: v.origen,
        destino: v.destino,
        fechaSalida: salida,
        fechaLlegada: pickFechaLlegada(v),
        estado: normalizarEstado(v.estado),
        descripcion: v.descripcion,
        carga: v.carga,
        cliente: v.cliente,
      });
    }

    const viajesOrganizados = Object.keys(porFecha)
      .sort()
      .map((fecha) => ({
        fecha,
        motoristasConViajes: Object.values(porFecha[fecha]),
      }));

    const totalViajes = viajesOrganizados.reduce(
      (acc, d) => acc + d.motoristasConViajes.reduce((a, m) => a + m.viajes.length, 0),
      0
    );

    res.status(200).json({
      totalDias: viajesOrganizados.length,
      totalViajes,
      viajesPorDia: viajesOrganizados,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener todos los viajes programados",
      error: error.message,
    });
  }
};

/**
 * Historial completo – sin filtrar por existencia de fecha en la query (se ordena en JS)
 * Acepta truckId/camionId/motoristaId/driverId/conductorId y placa.
 */
motoristasCon.getHistorialCompleto = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    // Buscar camión soportando driverId como ObjectId o string
    const driverVariants = toIdList(motoristaId);
    const camion = await camioneModel.findOne({ driverId: { $in: driverVariants } });

    // 🎯 Match robusto por camión + conductor (aunque no tenga camión)
    const truckOr = camion ? buildTruckMatch(camion) : [];
    const driverOr = buildDriverMatch(motorista);

    // Sin filtro de fechas – traemos TODO lo que coincida
    const query = { $or: [...truckOr, ...driverOr] };

    const docs = await viajesModel.find(query).lean();

    const viajesValidos = docs
      .map((v) => ({
        ...v,
        _salida: pickFechaSalida(v),
        _llegada: pickFechaLlegada(v),
        _estadoNorm: normalizarEstado(v.estado),
      }))
      .filter((v) => esFechaValida(v._salida)) // descartamos solo basura no-fecha
      .sort((a, b) => new Date(b._salida) - new Date(a._salida));

    const estadisticas = {
      programados: viajesValidos.filter((v) =>
        ["programado", "pendiente", "confirmado"].includes(v._estadoNorm)
      ).length,
      completados: viajesValidos.filter((v) =>
        ["completado", "finalizado"].includes(v._estadoNorm)
      ).length,
      cancelados: viajesValidos.filter((v) => v._estadoNorm === "cancelado").length,
      enProgreso: viajesValidos.filter((v) =>
        ["en_transito", "iniciado"].includes(v._estadoNorm)
      ).length,
    };

    // Plano
    const historialPlano = viajesValidos.map((v) => ({
      _id: v._id,
      origen: v.origen,
      destino: v.destino,
      fechaSalida: v._salida,
      fechaLlegada: v._llegada,
      estado: v._estadoNorm,
      descripcion: v.descripcion,
      carga: v.carga,
      cliente: v.cliente,
    }));

    // Por mes
    const porMes = {};
    for (const v of viajesValidos) {
      const d = new Date(v._salida);
      const mesAno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      (porMes[mesAno] ||= []).push(v);
    }

    const historialPorMes = Object.keys(porMes)
      .sort((a, b) => b.localeCompare(a))
      .map((mesAno) => {
        const [y, m] = mesAno.split("-");
        const fecha = new Date(Number(y), Number(m) - 1);
        return {
          periodo: fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long" }),
          mesAno,
          cantidadViajes: porMes[mesAno].length,
          viajes: porMes[mesAno].map((v) => ({
            _id: v._id,
            origen: v.origen,
            destino: v.destino,
            fechaSalida: v._salida,
            fechaLlegada: v._llegada,
            estado: v._estadoNorm,
            descripcion: v.descripcion,
            carga: v.carga,
            cliente: v.cliente,
          })),
        };
      });

    // Por día
    const porDia = {};
    for (const v of viajesValidos) {
      const d = new Date(v._salida).toISOString().split("T")[0];
      (porDia[d] ||= []).push(v);
    }
    const viajesPorDia = Object.keys(porDia)
      .sort((a, b) => b.localeCompare(a))
      .map((fecha) => ({
        fecha,
        viajes: porDia[fecha].map((v) => ({
          _id: v._id,
          origen: v.origen,
          destino: v.destino,
          fechaSalida: v._salida,
          fechaLlegada: v._llegada,
          estado: v._estadoNorm,
          descripcion: v.descripcion,
          carga: v.carga,
          cliente: v.cliente,
        })),
      }));

    res.status(200).json({
      motorista: {
        _id: motorista._id,
        name: motorista.name,
        lastName: motorista.lastName,
        email: motorista.email,
        phone: motorista.phone,
        img: motorista.img,
      },
      camionAsignado: camion
        ? {
            _id: camion._id,
            name: camion.name,
            brand: camion.brand,
            model: camion.model,
            licensePlate: camion.licensePlate,
            state: camion.state,
          }
        : null,
      totalViajes: viajesValidos.length,
      estadisticas,
      historialCompleto: historialPlano, // compat hook
      historialPorMes,
      viajesPorDia,
      viajes: historialPlano,            // lista plana adicional (compat)
    });
  } catch (error) {
    console.error("Error en getHistorialCompleto:", error);
    res.status(500).json({
      message: "Error al obtener historial completo de viajes",
      error: error.message,
    });
  }
};

/**
 * Debug de viajes para diagnosticar problemas
 */
motoristasCon.debugViajes = async (req, res) => {
  try {
    const motoristaId = req.params.id;

    const motorista = await motoristalModel.findById(motoristaId);
    const driverVariants = toIdList(motoristaId);
    const camion = await camioneModel.findOne({ driverId: { $in: driverVariants } });
    const todosLosViajes = await viajesModel.find({});
    const viajesDelCamion = camion ? await viajesModel.find({ $or: buildTruckMatch(camion) }) : [];
    const otrosCamiones = await camioneModel.find({});
    const viajesOtrosCamiones = await viajesModel.find({
      $or: otrosCamiones.flatMap((c) => buildTruckMatch(c)),
    });

    res.status(200).json({
      debug: true,
      motorista: {
        id: motorista?._id,
        nombre: motorista ? `${motorista?.name} ${motorista?.lastName}` : null,
        existe: !!motorista,
      },
      camionAsignado: {
        id: camion?._id,
        matricula: camion?.licensePlate,
        existe: !!camion,
      },
      estadisticas: {
        totalViajesEnDB: todosLosViajes.length,
        viajesDelCamionAsignado: viajesDelCamion.length,
        viajesDeOtrosCamiones: viajesOtrosCamiones.length,
      },
      todosLosViajes: todosLosViajes.map((v) => ({
        id: v._id,
        truckId: v.truckId,
        camionId: v.camionId,
        origen: v.origen,
        destino: v.destino,
        estado: v.estado,
        fechaUsada: pickFechaSalida(v),
        fechaSalidaValida: esFechaValida(pickFechaSalida(v)),
      })),
      viajesDelCamionAsignado: viajesDelCamion.map((v) => ({
        id: v._id,
        origen: v.origen,
        destino: v.destino,
        estado: v.estado,
        fechaUsada: pickFechaSalida(v),
        fechaSalidaValida: esFechaValida(pickFechaSalida(v)),
      })),
      camionesEnDB: otrosCamiones.map((c) => ({
        id: c._id,
        matricula: c.licensePlate,
        driverId: c.driverId,
        esDelMotorista: c.driverId?.toString() === motoristaId,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      debug: true,
    });
  }
};

export default motoristasCon;
