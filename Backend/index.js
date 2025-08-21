// index.js
import app from "./app.js";
import "./database.js";

async function main() {
  // ✅ CORREGIDO: Usar PORT de environment variable para deploy
  const port = process.env.PORT || 4000;
  
  // Para environments serverless como Vercel, no usar app.listen
  if (process.env.NODE_ENV !== 'production' || process.env.PLATFORM !== 'vercel') {
    app.listen(port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
    });
  }
}

// Solo ejecutar main() si no estamos en un environment serverless
if (process.env.PLATFORM !== 'vercel') {
  main().catch(console.error);
}

// ✅ OBLIGATORIO: Export para platforms serverless
export default app;