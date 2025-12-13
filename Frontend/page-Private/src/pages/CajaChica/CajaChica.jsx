import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Send, Wrench, Download, Search, Filter, Calendar, Edit, Trash2 } from 'lucide-react';

export default function CajaChicaModern() {
  const [balance] = useState(250.00);
  const [activeTab, setActiveTab] = useState('all');
  
  const transactions = [
    { id: 1, desc: 'Spotify Subscription', type: 'Shopping', card: '1234', date: '28 Jan, 12:30 AM', amount: -82.50, icon: ShoppingCart },
    { id: 2, desc: 'Freepik Sales', type: 'Transfer', card: '1234', date: '25 Jan, 10:40 PM', amount: 87.90, icon: Send },
    { id: 3, desc: 'Mobile Service', type: 'Service', card: '1234', date: '20 Jan, 10:40 PM', amount: -15.0, icon: Wrench },
    { id: 4, desc: 'Wilson', type: 'Transfer', card: '1234', date: '15 Jan, 03:29 PM', amount: -105.0, icon: Send },
    { id: 5, desc: 'Emily', type: 'Transfer', card: '1234', date: '14 Jan, 10:40 PM', amount: 88.40, icon: Send },
  ];

  const stats = [
    { label: 'Total Ingresos', value: '$176.30', change: '+12.5%', trend: 'up', color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Gastos', value: '$202.50', change: '-8.3%', trend: 'down', color: 'from-rose-500 to-pink-500' },
    { label: 'Transacciones', value: '24', change: '+5', trend: 'up', color: 'from-blue-500 to-cyan-500' },
  ];

  const handleDelete = (id) => {
    // Aquí va tu lógica de eliminación
    console.log('Eliminar transacción:', id);
  };

  const handleEdit = (id) => {
    // Aquí va tu lógica de edición
    console.log('Editar transacción:', id);
  };

  const handleDownload = (id) => {
    // Aquí va tu lógica de descarga
    console.log('Descargar transacción:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Caja Chica</h1>
            <p className="text-slate-500 mt-1">Gestiona tus transacciones diarias</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
            <Download size={20} />
            Exportar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Balance Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-2">Balance Total</p>
              <h2 className="text-5xl font-bold mb-4">${balance.toFixed(2)}</h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white/90">70% del límite usado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                {stat.trend === 'up' ? 
                  <TrendingUp className="text-emerald-500" size={18} /> : 
                  <TrendingDown className="text-rose-500" size={18} />
                }
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</h3>
              <p className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change} vs mes anterior
              </p>
            </div>
          ))}
        </div>

        {/* Control Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Transacción</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="number" 
              placeholder="0.00"
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <select className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors appearance-none bg-white">
              <option>Ingreso</option>
              <option>Gasto</option>
            </select>
            <input 
              type="text" 
              placeholder="Descripción"
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
              Añadir Comprobante
            </button>
          </div>
          <button className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-900 transition-colors">
            Realizar Operación
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Últimas Transacciones</h3>
                <p className="text-sm text-slate-500 mt-1">Historial completo de movimientos</p>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar..."
                    className="w-full md:w-64 pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <button className="px-4 py-2.5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex items-center gap-2">
                  <Filter size={18} />
                </button>
                <button className="px-4 py-2.5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex items-center gap-2">
                  <Calendar size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {['all', 'income', 'expense'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'all' ? 'Todas' : tab === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID Transacción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tarjeta</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                          <tx.icon className={tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'} size={20} />
                        </div>
                        <span className="font-medium text-slate-800">{tx.desc}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">#{12548796}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">••••{tx.card}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{tx.date}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Descargar - Azul */}
                        <button
                          onClick={() => handleDownload(tx.id)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>

                        {/* Botón Editar - Amarillo */}
                        <button
                          onClick={() => handleEdit(tx.id)}
                          className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Botón Eliminar - Rojo */}
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">Mostrando 1-5 de 24 transacciones</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Anterior
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === 1 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}