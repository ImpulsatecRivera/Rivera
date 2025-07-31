// components/EnvioInfoCard.jsx
import React from 'react';
import { Package, Truck } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const EnvioInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Detalles del Envío"
      icon={Package}
      gradient="from-emerald-50 to-green-50"
      borderColor="border-emerald-100"
      iconColor="text-emerald-600"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Peso</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.peso}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Volumen</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.volumen}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Tipo de Vehículo</p>
          <p className="text-slate-700 flex items-center gap-2">
            <Truck size={16} />
            {cotizacion.tipoVehiculo}
          </p>
        </div>
      </div>
    </InfoCard>
  );
};

export default EnvioInfoCard;