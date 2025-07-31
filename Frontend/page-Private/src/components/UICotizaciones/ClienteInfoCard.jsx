// components/ClienteInfoCard.jsx
import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const ClienteInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Información del Cliente"
      icon={User}
      gradient="from-blue-50 to-indigo-50"
      borderColor="border-blue-100"
      iconColor="text-blue-600"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Nombre</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.cliente}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Teléfono</p>
          <p className="text-slate-700 flex items-center gap-2">
            <Phone size={16} />
            {cotizacion.telefono}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Email</p>
          <p className="text-slate-700 flex items-center gap-2">
            <Mail size={16} />
            {cotizacion.email}
          </p>
        </div>
      </div>
    </InfoCard>
  );
};

export default ClienteInfoCard;