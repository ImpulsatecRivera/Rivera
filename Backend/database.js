import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import {config} from "./src/config.js";




const URI=config.db.URI



mongoose.connect(URI);

const connection = mongoose.connection;


connection.once("open", () => {
    console.log("DB conectada");
  });
  
  connection.on("disconnected", () => {
    console.log("DB is desconectada");
  });
  
  connection.on("error", (error) => {
    console.log("error encontrado" + error);
  });