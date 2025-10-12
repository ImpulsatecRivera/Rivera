// Controllers/CallController.js
import twilio from 'twilio';
import { config } from '../config.js';
import ViajesModel from '../Models/Viajes.js';
import MotoristasModel from '../Models/Motorista.js';
import ClientesModelo from '../Models/Clientes.js';

const twilioClient = twilio(
  config.TWILIO_ACCOUNT_SID,
  config.TWILIO_AUTH_TOKEN
);

const CallController = {};

// Estados donde se permite llamar
const ESTADOS_LLAMADAS_ACTIVAS = ['listo', 'en_curso', 'retrasado'];

// Crear sesión de llamada
CallController.createCallSession = async (req, res) => {
  const { viajeId } = req.body;
  const userId = req.user.id; // Del middleware de autenticación

  try {
    // 1. Buscar viaje
    const viaje = await ViajesModel.findById(viajeId)
      .populate('motoristaId')
      .populate('clienteId');

    if (!viaje) {
      return res.status(404).json({ 
        message: "Viaje no encontrado" 
      });
    }

    // 2. Verificar estado del viaje
    if (!ESTADOS_LLAMADAS_ACTIVAS.includes(viaje.estado)) {
      const mensajesPorEstado = {
        'pendiente': 'El viaje aún no ha sido aceptado por un conductor',
        'programado': 'El viaje está programado para el futuro',
        'completado': 'El viaje ya ha finalizado',
        'cancelado': 'El viaje fue cancelado',
        'pausado': 'El viaje está pausado temporalmente'
      };

      return res.status(400).json({ 
        message: mensajesPorEstado[viaje.estado] || 'No puedes llamar en este momento',
        currentState: viaje.estado,
        allowedStates: ESTADOS_LLAMADAS_ACTIVAS
      });
    }

    // 3. Verificar que haya motorista asignado
    if (!viaje.motoristaId) {
      return res.status(400).json({ 
        message: "No hay conductor asignado a este viaje" 
      });
    }

    // 4. Verificar que el usuario sea parte del viaje
    const esMotorista = viaje.motoristaId._id.toString() === userId;
    const esCliente = viaje.clienteId._id.toString() === userId;

    if (!esMotorista && !esCliente) {
      return res.status(403).json({ 
        message: "No tienes permiso para acceder a este viaje" 
      });
    }

    // 5. Verificar teléfonos verificados
    if (!viaje.motoristaId.phoneVerified) {
      return res.status(400).json({ 
        message: esMotorista 
          ? "Debes verificar tu número de teléfono primero" 
          : "El conductor aún no ha verificado su número",
        requiresVerification: true,
        userType: "motorista"
      });
    }

    if (!viaje.clienteId.phoneVerified) {
      return res.status(400).json({ 
        message: esCliente
          ? "Debes verificar tu número de teléfono primero"
          : "El cliente aún no ha verificado su número",
        requiresVerification: true,
        userType: "cliente"
      });
    }

    // 6. Normalizar teléfonos
    const normalizePhone = (phone) => {
      if (!phone) return null;
      
      // Remover espacios y guiones
      phone = phone.replace(/[\s-]/g, '');
      
      if (!phone.startsWith('+')) {
        return phone.startsWith('503') 
          ? `+${phone}` 
          : `+503${phone}`;
      }
      return phone;
    };

    const phoneMotorista = normalizePhone(viaje.motoristaId.phone);
    const phoneCliente = normalizePhone(viaje.clienteId.phone);

    if (!phoneMotorista || !phoneCliente) {
      return res.status(400).json({ 
        message: "Números de teléfono inválidos" 
      });
    }

    console.log(`📞 Creando sesión de llamada - Viaje: ${viajeId} (${viaje.estado})`);
    console.log(`   Motorista: ${phoneMotorista}`);
    console.log(`   Cliente: ${phoneCliente}`);
    console.log(`   Solicitante: ${esMotorista ? 'Motorista' : 'Cliente'}`);

    // 7. Devolver número proxy
    const proxyNumber = config.TWILIO_PHONE_NUMBER;

    // Opcional: Actualizar timestamp de última llamada
    // await viaje.updateOne({
    //   lastCallSessionAt: new Date(),
    //   callSessionActiveBy: esMotorista ? 'motorista' : 'cliente'
    // });

    res.json({
      success: true,
      proxyNumber: proxyNumber,
      viajeId: viajeId,
      viajeEstado: viaje.estado,
      message: esMotorista 
        ? "Llama a este número para contactar al cliente" 
        : "Llama a este número para contactar al conductor",
      contactName: esMotorista 
        ? viaje.clienteId.nombre || 'Cliente'
        : viaje.motoristaId.nombre || 'Conductor',
      yourRole: esMotorista ? 'motorista' : 'cliente'
    });

  } catch (error) {
    console.error("❌ Error creando sesión:", error);
    res.status(500).json({ 
      message: "Error al crear sesión de llamada",
      error: error.message 
    });
  }
};

// Webhook de Twilio - Maneja llamadas entrantes al proxy
CallController.handleIncomingCall = async (req, res) => {
  const { From, To, CallSid } = req.body;

  console.log(`📞 Llamada entrante:`);
  console.log(`   De: ${From}`);
  console.log(`   Al proxy: ${To}`);
  console.log(`   CallSid: ${CallSid}`);

  try {
    // Limpiar número que llama (quitar símbolos)
    const cleanFrom = From.replace(/\D/g, '');
    console.log(`   Número limpio: ${cleanFrom}`);

    // Buscar viaje activo
    const viaje = await ViajesModel.findOne({
      estado: { $in: ESTADOS_LLAMADAS_ACTIVAS }
    })
    .populate('motoristaId clienteId')
    .sort({ createdAt: -1 }); // El más reciente

    if (!viaje) {
      console.log("❌ No hay viaje activo");
      return res.type('text/xml').send(`
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="es-MX" voice="alice">
            Lo sentimos, no hay un viaje activo en este momento.
          </Say>
          <Hangup/>
        </Response>
      `);
    }

    console.log(`✅ Viaje encontrado: ${viaje._id} (${viaje.estado})`);

    // Obtener y limpiar teléfonos
    const phoneMotorista = viaje.motoristaId.phone.replace(/\D/g, '');
    const phoneCliente = viaje.clienteId.phone.replace(/\D/g, '');

    console.log(`   Tel Motorista: ${phoneMotorista}`);
    console.log(`   Tel Cliente: ${phoneCliente}`);

    // Determinar quién llama y a quién conectar
    let targetPhone;
    let callerRole;
    let callerName;
    let receiverName;

    // Comparar últimos 8 dígitos para evitar problemas con códigos de país
    const lastDigitsFrom = cleanFrom.slice(-8);
    const lastDigitsMotorista = phoneMotorista.slice(-8);
    const lastDigitsCliente = phoneCliente.slice(-8);

    if (lastDigitsFrom === lastDigitsMotorista) {
      // Llama el motorista → conectar con cliente
      targetPhone = viaje.clienteId.phone;
      callerRole = 'motorista';
      callerName = viaje.motoristaId.nombre || 'Conductor';
      receiverName = viaje.clienteId.nombre || 'Cliente';
      
      console.log(`🚗 Motorista llamando → conectar con cliente`);
      
    } else if (lastDigitsFrom === lastDigitsCliente) {
      // Llama el cliente → conectar con motorista
      targetPhone = viaje.motoristaId.phone;
      callerRole = 'cliente';
      callerName = viaje.clienteId.nombre || 'Cliente';
      receiverName = viaje.motoristaId.nombre || 'Conductor';
      
      console.log(`👤 Cliente llamando → conectar con motorista`);
      
    } else {
      console.log(`❌ Número no reconocido: ${From}`);
      console.log(`   Esperaba: ${phoneMotorista} o ${phoneCliente}`);
      
      return res.type('text/xml').send(`
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="es-MX" voice="alice">
            Número no autorizado para este viaje.
          </Say>
          <Hangup/>
        </Response>
      `);
    }

    // Normalizar número destino
    if (!targetPhone.startsWith('+')) {
      targetPhone = targetPhone.startsWith('503') 
        ? `+${targetPhone}` 
        : `+503${targetPhone}`;
    }

    console.log(`✅ Conectando a: ${targetPhone}`);

    // Opcional: Registrar llamada en base de datos
    // await CallLogModel.create({
    //   viajeId: viaje._id,
    //   callSid: CallSid,
    //   fromNumber: From,
    //   toNumber: targetPhone,
    //   callerRole: callerRole,
    //   timestamp: new Date()
    // });

    // Responder con TwiML para conectar la llamada
    return res.type('text/xml').send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial
          callerId="${config.TWILIO_PHONE_NUMBER}"
          timeout="30"
          record="do-not-record"
        >
          <Number>${targetPhone}</Number>
        </Dial>
        <Say language="es-MX" voice="alice">
          No fue posible conectar la llamada. Por favor intenta nuevamente.
        </Say>
      </Response>
    `);

  } catch (error) {
    console.error("❌ Error en webhook:", error);
    
    return res.type('text/xml').send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="es-MX" voice="alice">
          Error en el sistema. Por favor intenta más tarde.
        </Say>
        <Hangup/>
      </Response>
    `);
  }
};

// Webhook para status de llamada (opcional)
CallController.handleCallStatus = async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  
  console.log(`📊 Status de llamada:`);
  console.log(`   CallSid: ${CallSid}`);
  console.log(`   Status: ${CallStatus}`);
  console.log(`   Duración: ${CallDuration}s`);

  // Opcional: Guardar en BD
  // await CallLogModel.updateOne(
  //   { callSid: CallSid },
  //   { 
  //     status: CallStatus,
  //     duration: CallDuration,
  //     completedAt: new Date()
  //   }
  // );

  res.sendStatus(200);
};

export default CallController;