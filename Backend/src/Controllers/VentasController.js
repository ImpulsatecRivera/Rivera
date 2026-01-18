// Backend/src/Controllers/VentasController.js

import VentasModel from "../Models/Ventas.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";


// Configurar Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Obtener todas las ventas
 * GET /ventas
 */
const ventasController = {};

ventasController.get = async (req, res) => {
    try {
        const ventas = await VentasModel.find()
            .populate('clienteId')
            .sort({ fechaEmision: -1 });

        res.status(200).json(ventas);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener ventas",
            error: error.message
        });
    }
};

/**
 * Obtener venta por ID
 * GET /ventas/:id
 */
ventasController.getById = async (req, res) => {
    try {
        const venta = await VentasModel.findById(req.params.id).populate('clienteId');

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.status(200).json({ venta });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener la venta",
            error: error.message
        });
    }
};

/**
 * Crear nueva venta con voucher
 * POST /ventas
 */
ventasController.post = async (req, res) => {
    try {
        const {
            tipoDocumento,
            numeroDocumento,
            clienteId,
            fechaEmision,
            monto,
            iva,
            total,
            descripcion,
            estado,
            metodoPago
        } = req.body;

        const user = req.user?.id;
        const userType = req.user?.userType;

        // Manejar subida de voucher
        let voucherUrl = undefined;
        if (req.file) {
            try {
                const uploadOptions = {
                    folder: "vouchers-ventas",
                    resource_type: "auto"
                };
                const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
                voucherUrl = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Error al subir el voucher",
                    error: uploadError.message
                });
            }
        }

        const nuevaVenta = new VentasModel({
            tipoDocumento,
            numeroDocumento,
            clienteId,
            fechaEmision: fechaEmision || new Date(),
            monto,
            iva,
            total,
            descripcion,
            estado: estado || 'pendiente',
            metodoPago: metodoPago || 'efectivo',
            voucher: voucherUrl,
        });

        const ventaGuardada = await nuevaVenta.save();
        console.log("✅ Venta guardada:", ventaGuardada);

        // Poblar cliente
        await ventaGuardada.populate('clienteId');
        console.log("✅ Venta con cliente poblado:", ventaGuardada);

        res.status(200).json({
            message: "Venta registrada correctamente",
            venta: ventaGuardada
        });
    } catch (error) {
        console.error("❌ Error al crear venta:", error);
        res.status(500).json({
            message: "Error al registrar venta",
            error: error.message
        });
    }
};

/**
 * Actualizar venta
 * PUT /ventas/:id
 */
ventasController.put = async (req, res) => {
    try {
        const {
            tipoDocumento,
            numeroDocumento,
            clienteId,
            fechaEmision,
            monto,
            iva,
            total,
            descripcion,
            estado,
            metodoPago
        } = req.body;

        const venta = await VentasModel.findById(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Manejar actualización de voucher
        let voucherUrl = venta.voucher;
        if (req.file) {
            try {
                const uploadOptions = {
                    folder: "vouchers-ventas",
                    resource_type: "auto"
                };
                const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
                voucherUrl = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Error al subir el voucher",
                    error: uploadError.message
                });
            }
        }

        await VentasModel.findByIdAndUpdate(
            req.params.id,
            {
                tipoDocumento,
                numeroDocumento,
                clienteId,
                fechaEmision,
                monto,
                iva,
                total,
                descripcion,
                estado,
                metodoPago: metodoPago || venta.metodoPago || 'efectivo',
                voucher: voucherUrl
            },
            { new: true }
        );

        res.status(200).json({ message: "Venta actualizada correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar venta",
            error: error.message
        });
    }
};

/**
 * Eliminar venta
 * DELETE /ventas/:id
 */
ventasController.delete = async (req, res) => {
    try {
        const venta = await VentasModel.findById(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Soft-delete: marcar como anulada en lugar de borrar
        const ventaAnulada = await VentasModel.findByIdAndUpdate(
            req.params.id,
            { estado: 'anulada' },
            { new: true }
        );

        res.status(200).json({ message: "Venta anulada", venta: ventaAnulada });
    } catch (error) {
        res.status(500).json({
            message: "Error al anular venta",
            error: error.message
        });
    }
};

/**
 * Cambiar estado de venta
 * PATCH /ventas/:id/estado
 */
ventasController.cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;

        if (!['pendiente', 'pagada', 'anulada'].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        await VentasModel.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        res.status(200).json({ message: `Venta marcada como ${estado}` });
    } catch (error) {
        res.status(500).json({
            message: "Error al cambiar estado",
            error: error.message
        });
    }
};

/**
 * Actualizar comprobante de una venta existente
 * PATCH /ventas/:id/comprobante
 */
ventasController.actualizarComprobante = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se proporcionó archivo" });
        }

        const venta = await VentasModel.findById(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Subir archivo a Cloudinary
        try {
            const uploadOptions = {
                folder: "vouchers-ventas",
                resource_type: "auto"
            };
            const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
            
            // Actualizar venta con la URL del comprobante
            const ventaActualizada = await VentasModel.findByIdAndUpdate(
                req.params.id,
                { voucher: result.secure_url },
                { new: true }
            ).populate('clienteId', 'firstName lastName email');

            res.status(200).json({
                message: "Comprobante actualizado correctamente",
                venta: ventaActualizada
            });
        } catch (uploadError) {
            return res.status(400).json({
                message: "Error al subir el comprobante",
                error: uploadError.message
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar comprobante",
            error: error.message
        });
    }
};

export default ventasController;