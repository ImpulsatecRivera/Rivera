import React, { useState } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ArrowRight } from 'lucide-react';

const ClientManagementInterface = () => {
  const [selectedClient, setSelectedClient] = useState({
    name: 'Ronald Richards',
    email: 'fl@gmail.com',
    dui: '07659231-8',
    birthDate: '03/24/1999',
    phone: '7890-4098',
    address: 'United States',
    license: '07659231-8'
  });

  const clients = [
    { name: 'Jane Cooper', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Floyd Miles', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Ronald Richards', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Marvin McKinney', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999', highlighted: true },
    { name: 'Jerome Bell', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Kathryn Murphy', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Jacob Jones', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' },
    { name: 'Kristin Watson', email: 'fl@gmail.com', dui: '07659231-8', birthDate: '03/24/1999' }
  ];

  return (
    <div className="flex h-screen text-white" style={{backgroundColor: '#34353A'}}>
      {/* Sidebar */}
      <div className="w-64 p-6" style={{backgroundColor: '#34353A'}}>
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        
        <nav className="space-y-4">
          <div className="text-gray-300 hover:text-white cursor-pointer">Inicio</div>
          <div className="text-gray-300 hover:text-white cursor-pointer">Viajes</div>
          <div className="text-gray-300 hover:text-white cursor-pointer">Cotizaciones</div>
          <div className="text-white font-semibold cursor-pointer">Empleados</div>
          <div className="text-gray-300 hover:text-white cursor-pointer">Motoristas</div>
          <div className="text-gray-300 hover:text-white cursor-pointer">Proveedores</div>
          <div className="text-gray-300 hover:text-white cursor-pointer">Camiones</div>
        </nav>
        
        <div className="absolute bottom-6 left-6 flex items-center text-gray-300 cursor-pointer hover:text-white">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Client List */}
        <div className="flex-1 bg-white text-gray-900 rounded-l-3xl ml-4 my-4 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Listado de clientes</h2>
            <div className="text-teal-500 text-sm mb-4">Clientes registrados</div>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div>Nombres</div>
            <div>Email</div>
            <div>DUI</div>
            <div>Fecha-Nacimiento</div>
          </div>

          {/* Client Rows */}
          <div className="space-y-2 mt-4">
            {clients.map((client, index) => (
              <div 
                key={index}
                className={`grid grid-cols-4 gap-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  client.highlighted ? 'bg-teal-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClient({...selectedClient, ...client})}
              >
                <div className="font-medium">{client.name}</div>
                <div className="text-gray-600">{client.email}</div>
                <div className="text-gray-600">{client.dui}</div>
                <div className="text-gray-600">{client.birthDate}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
            <div>Showing data 1 to 8 of 255K entries</div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Info Panel */}
        <div className="w-80 bg-white text-gray-900 rounded-r-3xl mr-4 my-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Información del Cliente</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Avatar and Contact */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{selectedClient.name}</h3>
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
                <div className="text-sm text-gray-400">{selectedClient.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">DUI</div>
                <div className="text-sm text-gray-400">{selectedClient.dui}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Fecha de nacimiento</div>
                <div className="text-sm text-gray-400">{selectedClient.birthDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Teléfono</div>
                <div className="text-sm text-gray-400">{selectedClient.phone}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Dirección</div>
                <div className="text-sm text-gray-400">{selectedClient.address}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Licencia</div>
                <div className="text-sm text-gray-400">{selectedClient.license}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientManagementInterface;