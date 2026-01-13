import express from "express";
import ResumenCon from "../Controllers/ResumenDieselController.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// CONFIGURACIÓN DE MULTER PARA SUBIDA DE ARCHIVOS
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/'); // Carpeta temporal
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comprobante-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes y PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF) y archivos PDF'));
    }
  }
});

// =====================================================
// RUTAS
// =====================================================

// Obtener todos los resúmenes
router.get("/", ResumenCon.getResumen);

// Agregar resumen con comprobante opcional
router.post("/",  upload.single('comprobante'), ResumenCon.AgregarDiesel);

// Actualizar resumen con comprobante opcional
router.put("/:id", upload.single('comprobante'), ResumenCon.PutDiesel);

// Eliminar resumen
router.delete("/:id",  ResumenCon.DeleteResumen);

export default router;