// ProveedorTableHeader.jsx
import React from 'react';
import { Building2, Mail, Package, Phone } from 'lucide-react';

const ProveedorTableHeader = ({ showDetailView }) => {
  return (
    <div className="px-8 py-4 border-b-2" style={{borderColor: '#5F8EAD', backgroundColor: '#f8fafc'}}>
      <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-4'} gap-6 text-sm font-semibold`} style={{color: '#5F8EAD'}}>
        <div className="flex items-center">
          <Building2 className="w-4 h-4 mr-2" />
          Empresa
        </div>
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          Correo Electrónico
        </div>
        <div className="flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Repuesto Principal
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Teléfono
        </div>
      </div>
    </div>
  );
};

export default ProveedorTableHeader;