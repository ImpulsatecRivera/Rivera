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

// 🔧 CONFIGURACIÓN DE DOMINIOS PERMITIDOS
const ALLOWED_ORIGINS = [
  'https://rivera-project-ecru.vercel.app', 
  'https://rivera-project-uhuf.vercel.app',
    // Para Vite en desarrollo
];

// 🔧 LISTA COMPLETA DE HEADERS COMUNES QUE AXIOS PUEDE ENVIAR
const ALLOWED_HEADERS = [
  // Headers básicos
  'Content-Type',
  'Authorization',
  'Accept',
  'Origin',
  'User-Agent',
  'Referer',
  'X-Requested-With',
  
  // Headers de cookies
  'Cookie',
  'Set-Cookie',
  
  // Headers de caché (los que estaban causando problemas)
  'Cache-Control',
  'Pragma',
  'Expires',
  'If-Modified-Since',
  'If-None-Match',
  
  // Headers de CORS
  'Access-Control-Allow-Credentials',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  
  // Headers adicionales comunes
  'X-CSRF-Token',
  'X-Forwarded-For',
  'X-Real-IP'
];

// 🔧 CONFIGURACIÓN CORS PRINCIPAL
console.log('🌐 [APP] Configurando CORS para producción...');
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como aplicaciones móviles)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ [CORS] Origen no permitido:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ALLOWED_HEADERS,
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200, // Para navegadores legacy
  maxAge: 86400 // Cachear preflight por 24 horas
}));

// 🔧 MIDDLEWARE MANUAL PARA CASOS EDGE
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Solo configurar headers si el origen está permitido
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization');
  }
  
  // Manejar peticiones OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('✅ [CORS] Respondiendo a preflight para:', req.path);
    return res.status(200).end();
  }
  
  next();
});

// 🔧 LOGGING MIDDLEWARE MEJORADO
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
  
  // Log de debugging condicional (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🌐 Origin:', req.headers.origin || 'Sin origin');
    console.log('🍪 Cookies:', Object.keys(req.cookies).length > 0 ? 'Presentes' : 'Ausentes');
    console.log('🔑 Authorization:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    // Log de headers problemáticos
    const problematicHeaders = ['cache-control', 'pragma', 'expires'];
    problematicHeaders.forEach(header => {
      if (req.headers[header]) {
        console.log(`📋 Header ${header}:`, req.headers[header]);
      }
    });
  }
  
  next();
});

// 🔧 MIDDLEWARE DE SEGURIDAD ADICIONAL
app.use((req, res, next) => {
  // Headers de seguridad
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  next();
});

// 🔧 RUTAS DE LA APLICACIÓN
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

// 🔧 RUTA DE HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'Configured' 
  });
});

// 🔧 MANEJO DE ERRORES CORS
app.use((error, req, res, next) => {
  if (error.message === 'No permitido por CORS') {
    console.log('❌ [CORS ERROR] Origen rechazado:', req.headers.origin);
    return res.status(403).json({
      error: 'CORS: Origen no permitido',
      origin: req.headers.origin
    });
  }
  next(error);
});

export default app;