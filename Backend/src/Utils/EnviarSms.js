// Utils/EnviarSms.js
import twilio from "twilio";
import { config } from "../config.js";

// Configurar el cliente usando la estructura correcta
const client = twilio(
  config.TWILIO.ACCOUNT_SID,  // Cambio aquí
  config.TWILIO.AUTH_TOKEN    // Cambio aquí
);

export const EnviarSms = async (to, message) => {
  try {
    console.log(`📱 Enviando SMS desde: ${config.TWILIO.PHONE_NUMBER}`);
    
    const msg = await client.messages.create({
      body: message,
      from: config.TWILIO.PHONE_NUMBER,  // Cambio aquí
      to: to,
    });
    
    console.log("✅ SMS enviado:", msg.sid);
    return { 
      success: true, 
      messageId: msg.sid,
      status: msg.status 
    };
    
  } catch (error) {
    console.error("❌ Error enviando SMS:", error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};