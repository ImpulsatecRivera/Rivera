// EmployeeTableHeader.jsx
import React from 'react';
import { User, Mail, IdCard, Calendar, Phone, MapPin, BadgeDollarSign, ClipboardList, Shield } from 'lucide-react';

const EmployeeTableHeader = ({ showDetailView }) => {
  return (
    <div
      className="px-8 py-4 border-b-2"
      style={{ borderColor: '#5F8EAD', backgroundColor: '#f8fafc' }}
    >
      {/* ✅ Mantengo el mismo layout (4 cols cuando hay panel de detalle / 6 cols cuando no)
          ✅ No rompo tu tabla: agrego los nuevos campos SOLO cuando showDetailView === true (4 columnas)
          ✅ Cuando NO hay detail view, sigue mostrando Teléfono y Dirección como antes */}
      <div
        className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 text-sm font-semibold`}
        style={{ color: '#5F8EAD' }}
      >
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          Nombres
        </div>

        {showDetailView ? (
          <>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Rol
            </div>
            <div className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Planilla
            </div>
            <div className="flex items-center">
              <BadgeDollarSign className="w-4 h-4 mr-2" />
              Salario
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Correo Electrónico
            </div>
            <div className="flex items-center">
              <IdCard className="w-4 h-4 mr-2" />
              DUI
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Fecha Nacimiento
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Teléfono
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Dirección
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeTableHeader;
