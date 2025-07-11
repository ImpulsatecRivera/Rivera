import React, { useState } from 'react';
import { Trash2, Edit3, Eye, Calendar, MapPin, User, Filter, Search, ArrowLeft, Phone, Mail, Package, Truck, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Cotizacion from "../../images/cotizacion.png"
import { useNavigate } from 'react-router-dom';


export default function CotizacionesComponent() {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'detalle'
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);

  const cotizaciones = [
    {
      id: 1,
      cliente: 'Wilfrido Granados',
      telefono: '+503 7845-2134',
      email: 'wilfrido.granados@email.com',
      destino: 'Morazán, Chalatenango',
      direccionOrigen: 'San Salvador, Centro Histórico, Calle Arce #234',
      direccionDestino: 'Morazán, Chalatenango, Barrio San Antonio #567',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-08',
      fechaCreacion: '2024-07-05',
      fechaVencimiento: '2024-07-15',
      monto: '$1,250.00',
      montoBase: '$1,100.00',
      impuestos: '$150.00',
      tipoViaje: 'Carga pesada',
      descripcion: 'Transporte de maquinaria industrial pesada desde San Salvador hacia Morazán. Incluye grúa especializada y escolta de seguridad.',
      peso: '2,500 kg',
      volumen: '15 m³',
      tipoVehiculo: 'Camión de carga pesada',
      conductor: 'Mario Hernández',
      placaVehiculo: 'P-123456',
      observaciones: 'Requiere permisos especiales para transporte de maquinaria pesada. Coordinación con autoridades locales.',
      validez: '15 días',
      condicionesPago: 'Pago 50% al inicio, 50% al completar el servicio'
    },
    {
      id: 2,
      cliente: 'María José Rivera',
      telefono: '+503 6789-4321',
      email: 'maria.rivera@email.com',
      destino: 'San Miguel, Usulután',
      direccionOrigen: 'San Salvador, Colonia Escalón, Paseo Escalón #890',
      direccionDestino: 'San Miguel, Usulután, Colonia Centro #123',
      estado: 'Pendiente',
      colorEstado: 'bg-amber-100 text-amber-800 border-amber-200',
      fecha: '2024-07-09',
      fechaCreacion: '2024-07-08',
      fechaVencimiento: '2024-07-20',
      monto: '$850.00',
      montoBase: '$750.00',
      impuestos: '$100.00',
      tipoViaje: 'Mudanza',
      descripcion: 'Servicio completo de mudanza residencial. Incluye embalaje, carga, transporte y descarga de mobiliario.',
      peso: '1,200 kg',
      volumen: '8 m³',
      tipoVehiculo: 'Camión de mudanza',
      conductor: 'Por asignar',
      placaVehiculo: 'Por asignar',
      observaciones: 'Cliente requiere servicio de embalaje profesional. Mudanza programada para fin de semana.',
      validez: '10 días',
      condicionesPago: 'Pago completo al finalizar el servicio'
    },
    {
      id: 3,
      cliente: 'Carlos Mendoza',
      telefono: '+503 2345-6789',
      email: 'carlos.mendoza@email.com',
      destino: 'La Unión, Conchagua',
      direccionOrigen: 'San Salvador, Soyapango, Avenida Central #456',
      direccionDestino: 'La Unión, Conchagua, Puerto de La Unión #789',
      estado: 'Rechazada',
      colorEstado: 'bg-red-100 text-red-800 border-red-200',
      fecha: '2024-07-07',
      fechaCreacion: '2024-07-04',
      fechaVencimiento: '2024-07-18',
      monto: '$2,100.00',
      montoBase: '$1,900.00',
      impuestos: '$200.00',
      tipoViaje: 'Materiales',
      descripcion: 'Transporte de materiales de construcción (cemento, varillas, blocks) hacia proyecto portuario.',
      peso: '3,800 kg',
      volumen: '20 m³',
      tipoVehiculo: 'Camión de carga',
      conductor: 'No asignado',
      placaVehiculo: 'No asignado',
      observaciones: 'Cotización rechazada por no cumplir con las especificaciones técnicas requeridas. Cliente solicitó modificaciones.',
      validez: '7 días',
      condicionesPago: 'Pago 30% adelanto, 70% contraentrega'
    },
    {
      id: 4,
      cliente: 'Ana Sofía López',
      telefono: '+503 9876-5432',
      email: 'ana.lopez@email.com',
      destino: 'Santa Ana, Metapán',
      direccionOrigen: 'San Salvador, Mejicanos, Calle Principal #321',
      direccionDestino: 'Santa Ana, Metapán, Zona Industrial #654',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-10',
      fechaCreacion: '2024-07-09',
      fechaVencimiento: '2024-07-25',
      monto: '$675.00',
      montoBase: '$600.00',
      impuestos: '$75.00',
      tipoViaje: 'Distribución',
      descripcion: 'Servicio de distribución de productos alimenticios a centros de distribución en zona fronteriza.',
      peso: '800 kg',
      volumen: '6 m³',
      tipoVehiculo: 'Camión refrigerado',
      conductor: 'Luis Martínez',
      placaVehiculo: 'P-654321',
      observaciones: 'Productos perecederos. Requiere mantenimiento de cadena de frío durante todo el trayecto.',
      validez: '12 días',
      condicionesPago: 'Pago al contado'
    },
    {
      id: 5,
      cliente: 'Roberto Castillo',
      telefono: '+503 5432-1098',
      email: 'roberto.castillo@email.com',
      destino: 'Ahuachapán, Atiquizaya',
      direccionOrigen: 'San Salvador, Ciudad Delgado, Boulevard del Ejército #987',
      direccionDestino: 'Ahuachapán, Atiquizaya, Carretera CA-8 Km 15',
      estado: 'En Proceso',
      colorEstado: 'bg-blue-100 text-blue-800 border-blue-200',
      fecha: '2024-07-11',
      fechaCreacion: '2024-07-10',
      fechaVencimiento: '2024-07-30',
      monto: '$1,450.00',
      montoBase: '$1,300.00',
      impuestos: '$150.00',
      tipoViaje: 'Logística',
      descripcion: 'Operación logística completa incluyendo almacenamiento temporal, inventario y distribución escalonada.',
      peso: '2,000 kg',
      volumen: '12 m³',
      tipoVehiculo: 'Camión logístico',
      conductor: 'Pedro Gonzáles',
      placaVehiculo: 'P-789012',
      observaciones: 'Operación en curso. Cliente requiere reportes de seguimiento cada 4 horas durante el transporte.',
      validez: '20 días',
      condicionesPago: 'Pago 40% adelanto, 60% contraentrega'
    },
    {
      id: 6,
      cliente: 'Elena Ramírez',
      telefono: '+503 8765-4321',
      email: 'elena.ramirez@email.com',
      destino: 'Cabañas, Sensuntepeque',
      direccionOrigen: 'San Salvador, Antiguo Cuscatlán, Carretera a Santa Tecla #159',
      direccionDestino: 'Cabañas, Sensuntepeque, Calle Central #753',
      estado: 'Aprobada',
      colorEstado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fecha: '2024-07-06',
      fechaCreacion: '2024-07-03',
      fechaVencimiento: '2024-07-20',
      monto: '$980.00',
      montoBase: '$850.00',
      impuestos: '$130.00',
      tipoViaje: 'Transporte',
      descripcion: 'Transporte de equipo médico y suministros hospitalarios hacia centro de salud regional.',
      peso: '1,500 kg',
      volumen: '10 m³',
      tipoVehiculo: 'Camión especializado',
      conductor: 'José Ramírez',
      placaVehiculo: 'P-456789',
      observaciones: 'Equipo médico delicado. Requiere manejo especializado y seguro de transporte adicional.',
      validez: '14 días',
      condicionesPago: 'Pago 25% adelanto, 75% contraentrega'
    }
  ];

  const estadoIcons = {
    'Aprobada': '✓',
    'Pendiente': '⏳',
    'Rechazada': '✗',
    'En Proceso': '🚛'
  };

  const filtrosCotizaciones = cotizaciones.filter(cotizacion => {
    const cumpleFiltro = filtroEstado === 'Todos' || cotizacion.estado === filtroEstado;
    const cumpleBusqueda = cotizacion.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cotizacion.destino.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  const verDetalleCotizacion = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setVistaActual('detalle');
  };

  const navigate = useNavigate();

  const handleAddTruck = () => navigate('/cotizaciones/CotizacionForm');


  const volverALista = () => {
    setVistaActual('lista');
    setCotizacionSeleccionada(null);
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'Aprobada': return <CheckCircle className="text-emerald-600" size={24} />;
      case 'Pendiente': return <Clock className="text-amber-600" size={24} />;
      case 'Rechazada': return <XCircle className="text-red-600" size={24} />;
      case 'En Proceso': return <AlertCircle className="text-blue-600" size={24} />;
      default: return <Clock className="text-gray-600" size={24} />;
    }
  };

  if (vistaActual === 'detalle' && cotizacionSeleccionada) {
    return (
      <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
          
          {/* Header de detalle */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={volverALista}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-300 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Cotización #{cotizacionSeleccionada.id.toString().padStart(3, '0')}
                </h1>
                <p className="text-slate-600">{cotizacionSeleccionada.tipoViaje}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-6 py-3 rounded-2xl font-semibold border ${cotizacionSeleccionada.colorEstado} flex items-center gap-3`}>
                {getEstadoIcon(cotizacionSeleccionada.estado)}
                <span className="text-lg">{cotizacionSeleccionada.estado}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{cotizacionSeleccionada.monto}</p>
                <p className="text-slate-500">Valor total</p>
              </div>
            </div>
          </div>

          {/* Contenido principal en scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Información del cliente */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <User className="text-blue-600" size={24} />
                  Información del Cliente
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Nombre</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.cliente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="text-slate-700 flex items-center gap-2">
                      <Phone size={16} />
                      {cotizacionSeleccionada.telefono}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-slate-700 flex items-center gap-2">
                      <Mail size={16} />
                      {cotizacionSeleccionada.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles del envío */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <Package className="text-emerald-600" size={24} />
                  Detalles del Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Peso</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.peso}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Volumen</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.volumen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Tipo de Vehículo</p>
                    <p className="text-slate-700 flex items-center gap-2">
                      <Truck size={16} />
                      {cotizacionSeleccionada.tipoVehiculo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rutas y direcciones */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <MapPin className="text-purple-600" size={24} />
                  Rutas y Direcciones
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Origen</p>
                    <p className="text-slate-700 leading-relaxed">{cotizacionSeleccionada.direccionOrigen}</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-purple-200"></div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Destino</p>
                    <p className="text-slate-700 leading-relaxed">{cotizacionSeleccionada.direccionDestino}</p>
                  </div>
                </div>
              </div>

              {/* Información financiera */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <DollarSign className="text-orange-600" size={24} />
                  Información Financiera
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-600">Monto Base</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.montoBase}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-slate-600">Impuestos</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.impuestos}</p>
                  </div>
                  <div className="border-t border-orange-200 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-slate-800">Total</p>
                      <p className="text-2xl font-bold text-orange-600">{cotizacionSeleccionada.monto}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Condiciones de Pago</p>
                    <p className="text-slate-700">{cotizacionSeleccionada.condicionesPago}</p>
                  </div>
                </div>
              </div>

              {/* Fechas importantes */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <Calendar className="text-cyan-600" size={24} />
                  Fechas Importantes
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Creación</p>
                    <p className="text-slate-700">{cotizacionSeleccionada.fechaCreacion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Servicio</p>
                    <p className="text-slate-700">{cotizacionSeleccionada.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Fecha de Vencimiento</p>
                    <p className="text-slate-700">{cotizacionSeleccionada.fechaVencimiento}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Validez</p>
                    <p className="text-slate-700">{cotizacionSeleccionada.validez}</p>
                  </div>
                </div>
              </div>

              {/* Información del conductor */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <Truck className="text-teal-600" size={24} />
                  Información del Transporte
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Conductor</p>
                    <p className="text-lg font-semibold text-slate-800">{cotizacionSeleccionada.conductor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Placa del Vehículo</p>
                    <p className="text-slate-700 font-mono text-lg">{cotizacionSeleccionada.placaVehiculo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción completa */}
            <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Descripción del Servicio</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{cotizacionSeleccionada.descripcion}</p>
            </div>

            {/* Observaciones */}
            <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Observaciones</h2>
              <p className="text-slate-700 leading-relaxed">{cotizacionSeleccionada.observaciones}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-4" style={{ backgroundColor: '#34353A' }}>
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
        
        {/* Header mejorado */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Gestión de cotizaciones
            </h1>
            <p className="text-slate-600 text-lg">Administra y supervisa todas las cotizaciones de transporte</p>
          </div>
        </div>

        {/* Barra de filtros y búsqueda */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente o destino..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Rechazada">Rechazadas</option>
              <option value="En Proceso">En Proceso</option>
            </select>
          </div>
        </div>
        
        {/* Grid de cotizaciones mejorado */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrosCotizaciones.map((cotizacion, index) => (
              <div 
                key={cotizacion.id}
                className="group relative bg-white border border-slate-200/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Gradiente de fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Efectos de luz */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                {/* Botones de acción flotantes */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 delay-150 z-20">
                  <button 
                    onClick={() => verDetalleCotizacion(cotizacion)}
                    className="p-2.5 bg-white/80 backdrop-blur-sm text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                  >
                    <Eye size={16} />
                  </button>
                  <button onClick={handleAddTruck} className="p-2.5 bg-white/80 backdrop-blur-sm text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2.5 bg-white/80 backdrop-blur-sm text-red-500 hover:text-white hover:bg-red-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Contenido principal */}
                <div className="relative z-10">
                  
                  {/* Header de la card */}
                  <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
      <img src={Cotizacion} alt="Camión" className="w-6 h-6 object-contain" />
    </div>
    <div>
      <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors duration-300">
        Cotización #{cotizacion.id.toString().padStart(3, '0')}
      </h3>
      <p className="text-slate-500 text-sm">{cotizacion.tipoViaje}</p>
    </div>
  </div>
</div>
                  {/* Información del cliente */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Cliente</p>
                        <p className="font-semibold text-slate-800">{cotizacion.cliente}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Destino</p>
                        <p className="font-semibold text-slate-800 text-sm">{cotizacion.destino}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer con fecha y estado */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-600">{cotizacion.fecha}</span>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${cotizacion.colorEstado} group-hover:scale-110 transition-transform duration-300 flex items-center gap-2`}>
                      <span>{estadoIcons[cotizacion.estado]}</span>
                      <span>{cotizacion.estado}</span>
                    </div>
                  </div>
                </div>

                {/* Efectos decorativos */}
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 transform scale-0 group-hover:scale-100 transition-all duration-500 delay-200 group-hover:animate-pulse"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-80 transform scale-0 group-hover:scale-100 transition-all duration-700 delay-300 group-hover:animate-pulse"></div>
                
                {/* Brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay resultados */}
          {filtrosCotizaciones.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No se encontraron cotizaciones</h3>
              <p className="text-slate-500">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}