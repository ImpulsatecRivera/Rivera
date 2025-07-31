// components/RutasInfoCard.jsx
import React from 'react';
import { MapPin } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const RutasInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Rutas y Direcciones"
      icon={MapPin}
      gradient="from-purple-50 to-pink-50"
      borderColor="border-purple-100"
      iconColor="text-purple-600"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Origen</p>
          <p className="text-slate-700 leading-relaxed">{cotizacion.direccionOrigen}</p>
        </div>
        <div className="flex justify-center">
          <div className="w-px h-8 bg-purple-200"></div>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Destino</p>
          <p className="text-slate-700 leading-relaxed">{cotizacion.direccionDestino}</p>
        </div>
      </div>
    </InfoCard>
  );
};

export default RutasInfoCard;