// Controllers/ViajesController-dummy.js - SIN IMPORTS
const ViajesController = {};

ViajesController.getMapData = (req, res) => {
  res.json({
    success: true,
    data: { message: "Dummy working" },
    message: "Test dummy controller"
  });
};

ViajesController.getAllViajes = (req, res) => {
  res.json({ success: true, data: [] });
};

export default ViajesController;