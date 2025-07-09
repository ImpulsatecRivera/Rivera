import React from "react";
import { Users, Truck, Clock, Package, TrendingUp } from "lucide-react";

const LogisticsDashboard = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Top Row Metrics */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Usuarios activos</div>
        <div className="flex items-center gap-2">
          <Users className="text-green-500" size={20} />
          <span className="text-2xl font-bold">1,893</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Cargas entregadas</div>
        <div className="flex items-center gap-2">
          <Truck className="text-green-500" size={20} />
          <span className="text-2xl font-bold">3,298</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Tiempo promedio de viaje</div>
        <div className="flex items-center gap-2">
          <Clock className="text-green-500" size={20} />
          <span className="text-2xl font-bold">2h 34m</span>
        </div>
      </div>

      {/* Bottom Row Metrics */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Capacidad inicial de carga</div>
        <div className="flex items-center gap-2">
          <Package className="text-green-500" size={20} />
          <span className="text-2xl font-bold">64%</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Capacidad actual de carga</div>
        <div className="flex items-center gap-2">
          <Package className="text-green-500" size={20} />
          <span className="text-2xl font-bold">86%</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-sm font-medium text-gray-600 mb-2">Incremento de eficiencia</div>
        <div className="flex items-center gap-2">
          <TrendingUp className="text-green-500" size={20} />
          <span className="text-2xl font-bold">+34%</span>
        </div>
        <span className="text-xs text-gray-500">Comparado al mes anterior</span>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
