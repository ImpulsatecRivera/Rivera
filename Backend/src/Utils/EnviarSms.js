// Utils/EnviarSms.js
import twilio from "twilio";
import { config } from "../config.js";

// Debug de configuración
console.log('🔧 Verificando config Twilio:');
console.log('ACCOUNT_SID:', config.TWILIO_ACCOUNT_SID ? `${config.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : '❌ NO DEFINIDO');
console.log('AUTH_TOKEN:', config.TWILIO_AUTH_TOKEN ? `${config.TWILIO_AUTH_TOKEN.substring(0, 10)}...` : '❌ NO DEFINIDO');
console.log('PHONE_NUMBER:', config.TWILIO_PHONE_NUMBER || '❌ NO DEFINIDO');

// Configurar el cliente de Twilio
const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// Función para enviar SMS
export const EnviarSms = async (to, message) => {
  try {
    console.log(`📱 Intentando enviar SMS a: ${to}`);
    console.log(`📞 Desde: ${config.TWILIO_PHONE_NUMBER}`);
    console.log(`💬 Mensaje: ${message}`);
    
    const msg = await client.messages.create({
      body: message,
      from: config.TWILIO_PHONE_NUMBER,
      to: to,
    });
    
    console.log("✅ SMS enviado exitosamente:", msg.sid);
    
    // 🚀 IMPORTANTE: Retornar resultado de éxito
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
    
    // 🚀 IMPORTANTE: Retornar resultado de error
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      status: error.status 
    };
  }
};