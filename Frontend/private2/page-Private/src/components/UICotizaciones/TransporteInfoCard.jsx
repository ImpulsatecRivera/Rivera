// components/TransporteInfoCard.jsx
import React from 'react';
import { Truck } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const TransporteInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Información del Transporte"
      icon={Truck}
      gradient="from-teal-50 to-cyan-50"
      borderColor="border-teal-100"
      iconColor="text-teal-600"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Conductor</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.conductor}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Placa del Vehículo</p>
          <p className="text-slate-700 font-mono text-lg">{cotizacion.placaVehiculo}</p>
        </div>
      </div>
    </InfoCard>
  );
};

export default TransporteInfoCard;