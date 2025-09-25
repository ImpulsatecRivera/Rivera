// Utils/EnviarSms.js
import twilio from "twilio";
import { config } from "../config.js";

// ✅ Usar variables del nivel raíz (sin .TWILIO)
const client = twilio(
  config.TWILIO_ACCOUNT_SID,    // Correcto
  config.TWILIO_AUTH_TOKEN      // Correcto
);

export const EnviarSms = async (to, message) => {
  try {
    console.log(`📱 Enviando SMS desde: ${config.TWILIO_PHONE_NUMBER}`); // Correcto
    
    const msg = await client.messages.create({
      body: message,
      from: config.TWILIO_PHONE_NUMBER,  // Correcto
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