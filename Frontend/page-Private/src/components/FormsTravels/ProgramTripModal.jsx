// FormsTravels/ProgramTripModal.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ProgramTripModal = ({ 
  show, 
  isClosing, 
  onClose, 
  onProgram, 
  programForm, 
  onInputChange 
}) => {
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-gray-800 z-50 transition-all duration-300 ease-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Header oscuro */}
      <div className="bg-gray-800 text-white p-4 flex items-center">
        <button 
          onClick={onClose}
          className="flex items-center text-white hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-sm font-medium">Volver al menú principal</span>
        </button>
      </div>

      {/* Contenido del modal */}
      <div className="bg-white rounded-t-3xl mt-4 mx-4 mb-4 p-16 min-h-[calc(100vh-6rem)] relative">
        {/* Header del formulario */}
        <div className="flex items-center mb-20">
          <h1 className="text-3xl font-normal text-black mr-6">Programar viaje</h1>
          <div className="relative">
            {/* Icono calculadora */}
            <div className="w-16 h-16 border-4 border-black rounded-lg flex flex-col justify-center items-center bg-white">
              <div className="grid grid-cols-3 gap-1.5 mb-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-black rounded-full"></div>
                ))}
              </div>
            </div>
            {/* Icono reloj */}
            <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full relative">
                <div className="absolute top-0.5 left-1/2 w-0.5 h-1.5 bg-white transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0.5 w-1 h-0.5 bg-white transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Primera fila - 3 columnas */}
        <div className="grid grid-cols-3 gap-16 mb-12">
          {/* Cotización */}
          <div>
            <label className="block text-lg font-normal text-black mb-4">
              Cotización
            </label>
            <input
              type="text"
              value={programForm.cotizacion}
              onChange={(e) => onInputChange('cotizacion', e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400"
              placeholder="Introduce la cotización del viaje"
            />
          </div>

          {/* Hora de llegada */}
          <div>
            <label className="block text-lg font-normal text-black mb-4">
              Hora de llegada
            </label>
            <div className="relative">
              <select
                value={programForm.horaLlegada}
                onChange={(e) => onInputChange('horaLlegada', e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 appearance-none focus:outline-none focus:border-gray-400"
              >
                <option value="">Hora de llegada</option>
                <option value="6:00 AM">6:00 AM</option>
                <option value="7:00 AM">7:00 AM</option>
                <option value="8:00 AM">8:00 AM</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Auxiliar */}
          <div>
            <label className="block text-lg font-normal text-black mb-4">
              Auxiliar <span className="text-gray-500">(Campo no obligatorio)</span>
            </label>
            <input
              type="text"
              value={programForm.auxiliar}
              onChange={(e) => onInputChange('auxiliar', e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400"
              placeholder="Introduce el auxiliar asignado"
            />
          </div>
        </div>

        {/* Segunda fila - 2 columnas */}
        <div className="grid grid-cols-2 gap-16 mb-12">
          {/* Descripción del viaje */}
          <div>
            <label className="block text-lg font-normal text-black mb-4">
              Descripción del viaje
            </label>
            <textarea
              value={programForm.descripcion}
              onChange={(e) => onInputChange('descripcion', e.target.value)}
              rows={6}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 resize-none focus:outline-none focus:border-gray-400"
              placeholder="Introduce la descripción del viaje"
            />
          </div>

          {/* Hora de salida */}
          <div>
            <label className="block text-lg font-normal text-black mb-4">
              Hora de salida
            </label>
            <div className="relative">
              <select
                value={programForm.horaSalida}
                onChange={(e) => onInputChange('horaSalida', e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 appearance-none focus:outline-none focus:border-gray-400"
              >
                <option value="">Hora de salida</option>
                <option value="6:00 PM">6:00 PM</option>
                <option value="7:00 PM">7:00 PM</option>
                <option value="8:00 PM">8:00 PM</option>
                <option value="9:00 PM">9:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
                <option value="11:00 PM">11:00 PM</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de guardar centrado */}
        <div className="flex justify-center">
          <button 
            onClick={onProgram}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-12 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramTripModal;