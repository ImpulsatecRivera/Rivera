// ProveedorRow.jsx
import React from 'react';
import { Building2, Mail, Package, Phone } from 'lucide-react';

const ProveedorRow = ({ 
  proveedor, 
  index, 
  selectedProveedor, 
  selectProveedor 
}) => {
  const isSelected = selectedProveedor && selectedProveedor._id === proveedor._id;
  
  return (
    <div
      key={proveedor._id || index}
      className={`grid grid-cols-4 gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'shadow-lg transform scale-[1.02]' 
          : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
      }`}
      style={{
        backgroundColor: isSelected ? '#5D9646' : '#ffffff',
        color: isSelected ? '#ffffff' : '#374151',
        borderColor: isSelected ? '#5D9646' : 'transparent'
      }}
      onClick={() => selectProveedor(proveedor)}
    >
      <div className="font-semibold flex items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
          isSelected ? 'bg-white bg-opacity-20' : ''
        }`} style={{backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
          <Building2 className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} />
        </div>
        <span className="truncate">{proveedor.companyName}</span>
      </div>
      <div className="flex items-center truncate">
        <Mail className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{proveedor.email}</span>
      </div>
      <div className="flex items-center truncate">
        <Package className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{proveedor.partDescription}</span>
      </div>
      <div className="flex items-center truncate">
        <Phone className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{proveedor.phone}</span>
      </div>
    </div>
  );
};

export default ProveedorRow;