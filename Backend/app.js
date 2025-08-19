import express from "express";
import camionesRoutes from "./src/Routes/camionesRoutes.js"
import empleadoRoutes from "./src/Routes/empleadosRoutes.js"
import motoristasRoutes from "./src/Routes/motoristaRoutes.js"
import proveedoresRoutes from "./src/Routes/proveedoresRoutes.js"
import ClientesRoutes from "./src/Routes/clienteRoutes.js"
import RegisterClienteRoutes from "./src/Routes/RegisterClienteRouter.js"
import CotizacionesRoutes from "./src/Routes/cotizacionesRoutes.js"
import autoUpdateRoutes from './src/Routes/autoUpdateRoutes.js';
import LoginRoutes from "./src/Routes/LoginRoutes.js" 
import LogoutRoutes from "./src/Routes/Logout.js" 
import RecoveryRoutes from "./src/Routes/Recovery.js"
import RegisterRoutes from "./src/Routes/RegisterRoute.js"
import ViajesRoutes from "./src/Routes/ViajesRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors";
 
const app = express();

app.use(express.json());
app.use(cookieParser());

// 🔧 CONFIGURACIÓN CORS MEJORADA PARA COOKIES Y HEADERS
console.log('🌐 [APP] Configurando CORS para producción...');
app.use(
  cors({
    origin: [
       'https://rivera-project-ecru.vercel.app', 
       'https://rivera-project-uhuf.vercel.app',
       'http://localhost:3000',
       'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cookie',
      'Set-Cookie',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  })
);

// 🔧 MIDDLEWARE ADICIONAL PARA HEADERS DE COOKIES
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://rivera-project-ecru.vercel.app',
    'https://rivera-project-uhuf.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('🔑 [APP] Headers CORS configurados para origin:', origin);
  }
  next();
});

// 🔧 LOGGING MIDDLEWARE PARA DEBUGGING
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('🍪 [APP] Cookies recibidas:', req.cookies);
  console.log('🔑 [APP] Headers Authorization:', req.headers.authorization ? 'Presente' : 'Ausente');
  console.log("🌐 [Middleware] Origin:", req.headers.origin);
  console.log("📍 [Middleware] Ruta:", req.method, req.path);
  next();
});

app.use("/api/camiones", camionesRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/motoristas", motoristasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", ClientesRoutes);
app.use("/api/login", LoginRoutes);
app.use("/api/logout", LogoutRoutes);
app.use("/api/register", RegisterClienteRoutes);
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/recovery", RecoveryRoutes);
app.use('/api/auto-update', autoUpdateRoutes);
app.use("/api/viajes", ViajesRoutes);

export default app;