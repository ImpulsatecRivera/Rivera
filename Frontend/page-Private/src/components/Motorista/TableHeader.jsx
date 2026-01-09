import React from 'react';
import {
  User,
  Mail,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  Shield,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

const TableHeader = ({ showDetailView }) => {
  return (
    <div
      className="px-8 py-4 border-b-2"
      style={{ borderColor: '#5F8EAD', backgroundColor: '#f8fafc' }}
    >
      {/* ✅ Ahora: 9 columnas cuando NO hay detalle (agregamos Planilla + Salario) */}
      <div
        className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-9'} gap-6 text-sm font-semibold`}
        style={{ color: '#5F8EAD' }}
      >
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          Nombres
        </div>

        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          Correo Electrónico
        </div>

        <div className="flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          DUI
        </div>

        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Fecha Nacimiento
        </div>

        {!showDetailView && (
          <>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Teléfono
            </div>

            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Dirección
            </div>

            {/* ✅ NUEVO: Tipo de planilla */}
            <div className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Planilla
            </div>

            {/* ✅ NUEVO: Salario */}
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Salario
            </div>

            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Licencia
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableHeader;
