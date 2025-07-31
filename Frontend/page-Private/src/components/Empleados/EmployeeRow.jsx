import React from 'react';
import { User, Mail, IdCard, Calendar, Phone, MapPin } from 'lucide-react';

const EmployeeRow = ({ 
  empleado, 
  showDetailView, 
  selectedEmpleados, 
  selectEmpleado 
}) => {
  return (
    <div
      className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        selectedEmpleados && selectedEmpleados._id === empleado._id 
          ? 'shadow-lg transform scale-[1.02]' 
          : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
      }`}
      style={{
        backgroundColor: selectedEmpleados && selectedEmpleados._id === empleado._id ? '#5D9646' : '#ffffff',
        color: selectedEmpleados && selectedEmpleados._id === empleado._id ? '#ffffff' : '#374151',
        borderColor: selectedEmpleados && selectedEmpleados._id === empleado._id ? '#5D9646' : 'transparent'
      }}
      onClick={() => selectEmpleado(empleado)}
    >
      <div className="font-semibold flex items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden ${
          selectedEmpleados && selectedEmpleados._id === empleado._id ? 'bg-white bg-opacity-20' : ''
        }`} style={{backgroundColor: selectedEmpleados && selectedEmpleados._id === empleado._id ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
          {empleado.img ? (
            <img 
              src={empleado.img} 
              alt={`${empleado.name} ${empleado.lastName}`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <User className={`w-5 h-5 ${empleado.img ? 'hidden' : 'block'} ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-white'}`} />
        </div>
        <span className="truncate">{empleado.name} {empleado.lastName}</span>
      </div>
      <div className="flex items-center truncate">
        <Mail className={`w-4 h-4 mr-2 ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{empleado.email}</span>
      </div>
      <div className="flex items-center truncate">
        <IdCard className={`w-4 h-4 mr-2 ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{empleado.dui}</span>
      </div>
      <div className="flex items-center truncate">
        <Calendar className={`w-4 h-4 mr-2 ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{new Date(empleado.birthDate).toLocaleDateString()}</span>
      </div>
      {!showDetailView && (
        <>
          <div className="flex items-center truncate">
            <Phone className={`w-4 h-4 mr-2 ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{empleado.phone ? empleado.phone.toString() : 'No disponible'}</span>
          </div>
          <div className="flex items-center truncate">
            <MapPin className={`w-4 h-4 mr-2 ${selectedEmpleados && selectedEmpleados._id === empleado._id ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{empleado.address}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeRow;