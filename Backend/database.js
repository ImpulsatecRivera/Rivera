import mongoose from "mongoose";
import dotenv from 'dotenv';
import {config} from "./src/config.js";


dotenv.config();

const URI=config.db.URI;

mongoose.connect(URI);

const connection = mongoose.connection;


connection.once("open", () => {
    console.log("DB conectada");
  });
  
  // Veo si se desconectó
  connection.on("disconnected", () => {
    console.log("DB is desconectada");
  });
  
  // Veo si hay un error
  connection.on("error", (error) => {
    console.log("error encontrado" + error);
  });