import dotenv from "dotenv";

dotenv.config();

export const config ={
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
    }
}