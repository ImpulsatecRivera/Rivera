import React from 'react';
import { User, Mail, CreditCard, Calendar, Phone, MapPin, Shield } from 'lucide-react';

const MotoristaRow = ({ 
  motorista, 
  index, 
  showDetailView, 
  selectedMotorista, 
  selectMotorista, 
  isLicenseValid 
}) => {
  const isSelected = selectedMotorista && (selectedMotorista._id === motorista._id || selectedMotorista.id === motorista.id);
  
  return (
    <div
      key={motorista._id || motorista.id || index}
      className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-7'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'shadow-lg transform scale-[1.02]' 
          : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
      }`}
      style={{
        backgroundColor: isSelected ? '#5D9646' : '#ffffff',
        color: isSelected ? '#ffffff' : '#374151',
        borderColor: isSelected ? '#5D9646' : 'transparent'
      }}
      onClick={() => selectMotorista(motorista)}
    >
      <div className="font-semibold flex items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden ${
          isSelected ? 'bg-white bg-opacity-20' : ''
        }`} style={{backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
          {motorista.img ? (
            <img
              src={motorista.img}
              alt={`${motorista.name} ${motorista.lastName}`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <User className={`w-5 h-5 ${motorista.img ? 'hidden' : 'block'} ${isSelected ? 'text-white' : 'text-white'}`} />
        </div>
        <span className="truncate">{motorista.name} {motorista.lastName}</span>
      </div>
      <div className="flex items-center truncate">
        <Mail className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{motorista.email}</span>
      </div>
      <div className="flex items-center truncate">
        <CreditCard className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{motorista.id}</span>
      </div>
      <div className="flex items-center truncate">
        <Calendar className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">
          {motorista.birthDate ? new Date(motorista.birthDate).toLocaleDateString() : 'No disponible'}
        </span>
      </div>
      {!showDetailView && (
        <>
          <div className="flex items-center truncate">
            <Phone className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{motorista.phone ? motorista.phone.toString() : 'No disponible'}</span>
          </div>
          <div className="flex items-center truncate">
            <MapPin className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{motorista.address || 'No disponible'}</span>
          </div>
          <div className="flex items-center truncate">
            <Shield className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            {isLicenseValid(motorista) ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isSelected 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Vigente
              </span>
            ) : (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isSelected 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Vencido
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MotoristaRow;