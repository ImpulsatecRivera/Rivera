// Utils/EnviarSms.js
import twilio from "twilio";
import { config } from "../config.js";

// Configurar el cliente de Twilio
const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// Función para enviar SMS
export const EnviarSms = async (to, message) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: config.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log("SMS enviado:", msg.sid);
  } catch (error) {
    console.error("Error enviando SMS:", error);
  }
};
