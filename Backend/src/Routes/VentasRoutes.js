import express from "express";
import ventasController from "../Controllers/VentasController.js";
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";
import multer from 'multer';
import path from 'path';

const router = express.Router();

// =====================================================
// CONFIGURACIÓN DE MULTER PARA SUBIDA DE COMPROBANTES
// =====================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/'); // Carpeta temporal
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'comprobante-venta-' + uniqueSuffix + path.extname(file.originalname));
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

// CRUD básico
router.route("/")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor",]), ventasController.get)
    .post(validateAuthToken(["admin", "Operativo", "Supervisor",]), upload.single('comprobante'), ventasController.post);

router.route("/:id")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor",]), ventasController.getById)
    .put(validateAuthToken(["admin", "Operativo", "Supervisor",]), upload.single('comprobante'), ventasController.put)
    .delete(validateAuthToken(["admin", "Operativo", "Supervisor",]), ventasController.delete);

// Cambiar estado de la venta (p. ej. anular)
router.patch(
    "/:id/estado",
    validateAuthToken(["admin", "Operativo", "Supervisor",]),
    ventasController.cambiarEstado
);

// Subir comprobante a una venta existente
router.patch("/:id/comprobante", validateAuthToken(["admin", "Operativo", "Supervisor",]), upload.single('comprobante'), ventasController.actualizarComprobante);

export default router;