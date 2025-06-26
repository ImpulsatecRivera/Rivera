import React, { useState } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeManagementInterface = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
   const navigate = useNavigate();

  const employees = [
    { name: 'Jane Cooper', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Floyd Miles', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Ronald Richards', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Marvin McKinney', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Jerome Bell', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Kathryn Murphy', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Jacob Jones', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Kristin Watson', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Devon Lane', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Courtney Henry', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Theresa Webb', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Darrell Steward', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Brooklyn Simmons', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Eleanor Pena', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Cameron Williamson', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' },
    { name: 'Savannah Nguyen', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', phone: '7556-9709', address: 'United States', license: '07659231-8' }
  ];

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/empleados/agregarEmployee');
  };

  return (
    <div className="flex h-screen text-white" style={{backgroundColor: '#34353A'}}>
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Employee List */}
        <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white text-gray-900 ${showDetailView ? 'rounded-l-3xl' : 'rounded-3xl'} ml-4 my-4 flex flex-col`}>
          {/* Header - Fixed */}
          <div className="p-8 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Listado de empleados</h2>
              <div className="text-teal-500 text-sm mb-4">Empleados registrados</div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <div className="text-sm text-gray-500">
                    Sort by: <span className="text-gray-700 font-medium">Newest</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Header - Fixed */}
            <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500`}>
              <div>Nombres</div>
              <div>Email</div>
              <div>DUI</div>
              <div>Fecha-Nacimiento</div>
              {!showDetailView && (
                <>
                  <div>Teléfono</div>
                  <div>Dirección</div>
                </>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="space-y-2 py-4">
              {employees.map((employee, index) => (
                <div 
                  key={index}
                  className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee && selectedEmployee.name === employee.name ? 'bg-teal-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowDetailView(true);
                  }}
                >
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-gray-600">{employee.email}</div>
                  <div className="text-gray-600">{employee.dui}</div>
                  <div className="text-gray-600">{employee.birthDate}</div>
                  {!showDetailView && (
                    <>
                      <div className="text-gray-600">{employee.phone}</div>
                      <div className="text-gray-600">{employee.address}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-8 pt-4 flex-shrink-0 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing data 1 to 8 of 256K entries
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex space-x-1">
                  <button className="w-8 h-8 bg-teal-500 text-white rounded-lg text-sm font-medium">1</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">2</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">3</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">4</button>
                  <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm text-gray-700">40</button>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Add Employee Button */}
            <div className="mt-4">
              <button onClick={handleContinue} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Agregar empleado</span>
              </button>
            </div>
          </div>
        </div>

        {/* Employee Info Panel */}
        {showDetailView && selectedEmployee && (
          <div className="w-80 bg-white text-gray-900 rounded-r-3xl mr-4 my-4 p-6">
            <div className="flex items-center mb-6">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full mr-3"
                onClick={() => {
                  setShowDetailView(false);
                  setSelectedEmployee(null);
                }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold">Información del Empleado</h2>
            </div>

            {/* Avatar and Contact */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{selectedEmployee.name}</h3>
              <div className="flex justify-center space-x-3">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Información Personal</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                  <div className="text-sm text-gray-400">{selectedEmployee.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">DUI</div>
                  <div className="text-sm text-gray-400">{selectedEmployee.dui}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                  <div className="text-sm text-gray-400">{selectedEmployee.birthDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                  <div className="text-sm text-gray-400">{selectedEmployee.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="text-sm text-gray-400">{selectedEmployee.address}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementInterface;