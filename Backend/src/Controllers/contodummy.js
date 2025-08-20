// Controllers/ViajesController-dummy-completo.js
const ViajesController = {};

// Función helper para respuesta dummy
const dummyResponse = (message, data = []) => (req, res) => {
  res.status(200).json({
    success: true,
    data: data,
    message: message || "Método dummy funcionando"
  });
};

// =====================================================
// TODOS LOS MÉTODOS NECESARIOS COMO DUMMY
// =====================================================

// Métodos principales
ViajesController.getMapData = dummyResponse("Map data dummy", {
  locations: [],
  routes: [],
  statistics: {}
});

ViajesController.getAllViajes = dummyResponse("All viajes dummy");

ViajesController.getTripStats = dummyResponse("Trip stats dummy");

ViajesController.getCargaDistribution = dummyResponse("Carga distribution dummy");

ViajesController.getRealTimeMetrics = dummyResponse("Real time metrics dummy");

ViajesController.getDashboardData = dummyResponse("Dashboard data dummy");

ViajesController.getEfficiencyMetrics = dummyResponse("Efficiency metrics dummy");

ViajesController.getCargaStats = dummyResponse("Carga stats dummy");

ViajesController.getTiposDeCargas = dummyResponse("Tipos de cargas dummy");

ViajesController.getTopSubcategorias = dummyResponse("Top subcategorias dummy");

ViajesController.getTiempoPromedioViaje = dummyResponse("Tiempo promedio dummy");

ViajesController.getCapacidadCarga = dummyResponse("Capacidad carga dummy");

ViajesController.getViajesPorDias = dummyResponse("Viajes por dias dummy");

ViajesController.getCompletedTrips = dummyResponse("Completed trips dummy");

ViajesController.searchViajes = dummyResponse("Search viajes dummy");

ViajesController.getQuickStats = dummyResponse("Quick stats dummy");

// Métodos de debugging
ViajesController.debugCargas = dummyResponse("Debug cargas dummy");

ViajesController.debugEstados = dummyResponse("Debug estados dummy");

// Métodos CRUD
ViajesController.addViaje = (req, res) => {
  res.status(201).json({
    success: true,
    data: { id: "dummy-id", message: "Viaje creado (dummy)" },
    message: "Add viaje dummy"
  });
};

ViajesController.editViaje = dummyResponse("Edit viaje dummy");

ViajesController.deleteViaje = dummyResponse("Delete viaje dummy");

// Métodos con parámetros
ViajesController.getCargaDetailsByCategory = dummyResponse("Carga details by category dummy");

ViajesController.getViajesByConductor = dummyResponse("Viajes by conductor dummy");

ViajesController.getViajesByTruck = dummyResponse("Viajes by truck dummy");

ViajesController.updateLocation = dummyResponse("Update location dummy");

ViajesController.updateTripProgress = dummyResponse("Update trip progress dummy");

ViajesController.completeTrip = dummyResponse("Complete trip dummy");

ViajesController.cancelTrip = dummyResponse("Cancel trip dummy");

ViajesController.reactivateTrip = dummyResponse("Reactivate trip dummy");

ViajesController.getTripHistory = dummyResponse("Trip history dummy");

ViajesController.getTripDetails = dummyResponse("Trip details dummy");

export default ViajesController;