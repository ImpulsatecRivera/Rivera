import app from "./app.js";
import "./database.js";

async function main() {
  // Google Cloud Run asigna el puerto automáticamente
  const port = process.env.PORT || 4000;
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
  });
}

main();