// Utils/EnviarSms.js
import twilio from "twilio";
import { config } from "../config.js";

console.log('🔧 Verificando config Twilio:');
console.log('ACCOUNT_SID:', config.TWILIO_ACCOUNT_SID ? `${config.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : '❌ NO DEFINIDO');
console.log('AUTH_TOKEN:', config.TWILIO_AUTH_TOKEN ? `${config.TWILIO_AUTH_TOKEN.substring(0, 10)}...` : '❌ NO DEFINIDO');
console.log('PHONE_NUMBER:', config.TWILIO_PHONE_NUMBER || '❌ NO DEFINIDO');

// ✅ Validar credenciales ANTES de crear el cliente
if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
  console.error('❌ CRITICAL: Credenciales Twilio incompletas en .env');
}

// ✅ Crear cliente solo si hay credenciales válidas
const client = (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN)
  ? twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
  : null;

// Función para enviar SMS
export const EnviarSms = async (to, message) => {
  try {
    // ✅ Validar que el cliente exista
    if (!client) {
      console.error('❌ Cliente Twilio no inicializado');
      return {
        success: false,
        error: 'Servicio SMS no configurado - credenciales faltantes',
        code: 'CONFIG_ERROR',
        status: null
      };
    }

    if (!config.TWILIO_PHONE_NUMBER) {
      console.error('❌ TWILIO_PHONE_NUMBER no configurado');
      return {
        success: false,
        error: 'Número de teléfono Twilio no configurado',
        code: 'PHONE_MISSING',
        status: null
      };
    }

    console.log(`📱 Intentando enviar SMS a: ${to}`);
    console.log(`📞 Desde: ${config.TWILIO_PHONE_NUMBER}`);
    console.log(`💬 Mensaje: ${message}`);
    
    const msg = await client.messages.create({
      body: message,
      from: config.TWILIO_PHONE_NUMBER,
      to: to,
    });
    
    console.log("✅ SMS enviado exitosamente:", msg.sid);
    
    return { 
      success: true, 
      messageId: msg.sid,
      status: msg.status 
    };
    
  } catch (error) {
    console.error("❌ Error completo enviando SMS:", {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      status: error.status 
    };
  }
};