import React, { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Phone, Mail, ArrowLeft, User } from 'lucide-react';

const EmployeeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const employees = [
    { id: 1, name: 'Jane Cooper', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 2, name: 'Floyd Miles', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 3, name: 'Ronald Richards', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 4, name: 'Marvin McKinney', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 5, name: 'Jerome Bell', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 6, name: 'Kathryn Murphy', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 7, name: 'Jacob Jones', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' },
    { id: 8, name: 'Kristin Watson', email: 'fl@gmail.com', dni: '07659231-8', birthDate: '03/24/1999', phone: '7890-4098', address: 'United States', license: '07659231-8' }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeClick = (employee) => {
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setSelectedEmployee(employee);
      setIsLoading(false);
    }, 1500);
  };

  const LoadingDots = () => (
    <div className="flex items-center justify-center space-x-1 py-8">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{backgroundColor: '#34353A'}}>
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-2xl h-full flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
              {selectedEmployee && (
                <div className="flex items-center text-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="text-lg font-semibold">Información del empleado</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Listado de empleados</h2>
                <span className="text-sm font-medium" style={{color: '#00AC4F'}}>Empleados registrados</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Name">Name</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Employee List Table */}
              <div className={`${selectedEmployee ? 'w-1/2' : 'w-full'} overflow-x-auto transition-all duration-300`}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-8 py-4 text-left text-sm font-medium text-gray-500">Nombres</th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-gray-500">DUI</th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-gray-500">Fecha-Nacimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee, index) => (
                      <tr 
                        key={employee.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50 bg-white cursor-pointer transition-colors ${
                          selectedEmployee?.id === employee.id ? 'bg-green-200' : ''
                        }`}
                        style={selectedEmployee?.id === employee.id ? {backgroundColor: '#7dd3c0'} : {}}
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <td className="px-8 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                        <td className="px-8 py-4 text-sm text-gray-600">{employee.email}</td>
                        <td className="px-8 py-4 text-sm text-gray-600">{employee.dni}</td>
                        <td className="px-8 py-4 text-sm text-gray-600">{employee.birthDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Employee Info Panel - Right Column */}
              {selectedEmployee && (
                <div className="w-1/2 border-l border-gray-200 bg-gray-50 transition-all duration-300">
                  {isLoading ? (
                    <LoadingDots />
                  ) : (
                    <div className="p-6 h-full">
                      {/* Employee Avatar */}
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedEmployee.name}</h3>
                        
                        {/* Contact Buttons */}
                        <div className="flex justify-center space-x-3 mt-4">
                          <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                            <Phone className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                            <Mail className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Información Personal</span>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-blue-600 font-medium block mb-1">Correo electrónico</label>
                              <div className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">{selectedEmployee.email}</div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">DUI</label>
                              <p className="text-xs text-gray-900">{selectedEmployee.dni}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Fecha de nacimiento</label>
                              <p className="text-xs text-gray-900">{selectedEmployee.birthDate}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Teléfono</label>
                              <p className="text-xs text-gray-900">{selectedEmployee.phone}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Dirección</label>
                              <p className="text-xs text-gray-900">{selectedEmployee.address}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Licencia</label>
                              <p className="text-xs text-gray-900">{selectedEmployee.license}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer with Pagination */}
          <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing data 1 to 8 of 255K entries
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">1</button>
              <button className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">2</button>
              <button className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">3</button>
              <button className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">4</button>
              <span className="px-2 text-gray-400">...</span>
              <button className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">40</button>

              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Add Employee Button */}
          <div className="px-8 py-4 border-t border-gray-200 flex items-center">
            <button className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Agregar empleado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;