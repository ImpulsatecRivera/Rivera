// components/FinancieraInfoCard.jsx
import React from 'react';
import { DollarSign } from 'lucide-react';
import InfoCard from '../UICotizaciones/InfoCard';

const FinancieraInfoCard = ({ cotizacion }) => {
  return (
    <InfoCard
      title="Información Financiera"
      icon={DollarSign}
      gradient="from-orange-50 to-red-50"
      borderColor="border-orange-100"
      iconColor="text-orange-600"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Monto Base</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.montoBase}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Impuestos</p>
          <p className="text-lg font-semibold text-slate-800">{cotizacion.impuestos}</p>
        </div>
        <div className="border-t border-orange-200 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-slate-800">Total</p>
            <p className="text-2xl font-bold text-orange-600">{cotizacion.monto}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Condiciones de Pago</p>
          <p className="text-slate-700">{cotizacion.condicionesPago}</p>
        </div>
      </div>
    </InfoCard>
  );
};

export default FinancieraInfoCard;