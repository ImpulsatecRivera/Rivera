// components/FechasInfoCard.jsx
import React from 'react';
import { Calendar } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const FechasInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Fechas Importantes"
      icon={Calendar}
      gradient="from-cyan-50 to-blue-50"
      borderColor="border-cyan-100"
      iconColor="text-cyan-600"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Creación</p>
          <p className="text-slate-700">{cotizacion.fechaCreacion}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Servicio</p>
          <p className="text-slate-700">{cotizacion.fecha}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Vencimiento</p>
          <p className="text-slate-700">{cotizacion.fechaVencimiento}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Validez</p>
          <p className="text-slate-700">{cotizacion.validez}</p>
        </div>
      </div>
    </InfoCard>
  );
};

export default FechasInfoCard;