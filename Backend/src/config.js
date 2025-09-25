import dotenv from "dotenv";

dotenv.config();

export const config = {
    db: {
        URI: process.env.DB_URI,               
    },      
    server: {
        port: process.env.PORT,
    },      
    cloudinary:{
        cloudinary_name: process.env.CLOUDINARY_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret : process.env.CLOUDINARY_API_SECRET
    },
    JWT: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES,
    },
    ADMIN:{
        emailAdmin: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    },
    email:{
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    },
    GOOGLE: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    },
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  }


console.log('🔧 [CONFIG] Variables de entorno cargadas:');
console.log('TWILIO_ACCOUNT_SID:', config.TWILIO_ACCOUNT_SID ? '✅' : '❌');
console.log('TWILIO_AUTH_TOKEN:', config.TWILIO_AUTH_TOKEN ? '✅' : '❌');
console.log('TWILIO_PHONE_NUMBER:', config.TWILIO_PHONE_NUMBER ? '✅' : '❌');
console.log('GOOGLE_CLIENT_ID:', config.GOOGLE.CLIENT_ID ? '✅' : '❌');
console.log('GOOGLE_CLIENT_SECRET:', config.GOOGLE.CLIENT_SECRET ? '✅' : '❌');