import React from 'react';
import { User } from 'lucide-react';
import FormFieldInput from '../../components/UICamiones/FieldInputAgregar';

const AssignmentFields = ({ register, errors, motoristasDisponibles = [] }) => {
  console.log('🚗 === RENDER AssignmentFields ===');
  console.log('🚗 Motoristas recibidos:', motoristasDisponibles);
  console.log('🚗 Cantidad:', motoristasDisponibles?.length || 0);
  
  // Preparar opciones para motoristas
  const motoristaOptions = [
    { value: '', label: 'Seleccionar motorista (opcional)' },
    ...(motoristasDisponibles || []).map(driver => {
      console.log('👤 Procesando motorista:', driver);
      
      // ✅ Campos correctos según tu modelo
      const nombre = driver.name || '';
      const apellido = driver.lastName || '';
      const nombreCompleto = `${nombre} ${apellido}`.trim();
      
      // Número de licencia (circulationCard en tu modelo)
      const licencia = driver.circulationCard || '';
      
      // Crear label
      const label = licencia 
        ? `${nombreCompleto} - Lic: ${licencia}`
        : nombreCompleto || `Motorista ${driver._id}`;
      
      console.log('👤 Opción creada:', {
        value: driver._id,
        label,
        driver
      });
      
      return {
        value: driver._id,
        label
      };
    })
  ];

  console.log('📋 Opciones finales:', motoristaOptions);
  console.log('📋 Total opciones:', motoristaOptions.length);

  if (motoristasDisponibles.length === 0) {
    console.warn('⚠️ No hay motoristas disponibles');
  }

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Asignación
      </h3>
=======
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Motorista */}
      <FormFieldInput
        id="driverId"
        label="Motorista"
        icon={User}
        type="select"
        placeholder="Seleccionar motorista"
        options={motoristaOptions}
        {...register("driverId")}
        error={errors.driverId}
      />
>>>>>>> 8077762b9ce48ebad7f3c0bfc421712a4bb94ca3

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Motorista */}
        <FormFieldInput
          id="driverId"
          label="Motorista Asignado"
          icon={User}
          type="select"
          placeholder="Seleccionar motorista"
          options={motoristaOptions}
          {...register("driverId")}
          error={errors.driverId}
        />
        
        {/* Mensaje cuando no hay motoristas */}
        {motoristasDisponibles.length === 0 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ No hay motoristas disponibles.
            </p>
            <p className="text-xs text-yellow-500 mt-1">
              Puedes agregar el camión sin motorista y asignarlo después.
            </p>
          </div>
        )}
        
        {/* Contador */}
        <p className="text-xs text-gray-500 -mt-2">
          {motoristasDisponibles.length} motorista{motoristasDisponibles.length !== 1 ? 's' : ''} disponible{motoristasDisponibles.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default AssignmentFields;