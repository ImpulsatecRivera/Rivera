import React from 'react';
import { User, Mail, IdCard, Calendar, Phone, MapPin } from 'lucide-react';

const EmployeeTableHeader = ({ showDetailView }) => {
  return (
    <div className="px-8 py-4 border-b-2" style={{borderColor: '#5F8EAD', backgroundColor: '#f8fafc'}}>
      <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 text-sm font-semibold`} style={{color: '#5F8EAD'}}>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          Nombres
        </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeTableHeader;