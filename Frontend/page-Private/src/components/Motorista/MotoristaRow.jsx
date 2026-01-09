import React from 'react';
import {
  User,
  Mail,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  Shield,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

const MotoristaRow = ({
  motorista,
  index,
  showDetailView,
  selectedMotorista,
  selectMotorista,
  isLicenseValid,
}) => {
  const isSelected =
    selectedMotorista &&
    (selectedMotorista._id === motorista._id || selectedMotorista.id === motorista.id);

  // ✅ Ahora mostramos 2 columnas extra: Planilla + Salario
  // - Si está showDetailView, dejamos 4 (como lo tenías) para que el panel detalle tenga espacio
  // - Si NO está showDetailView, pasamos a 9 cols
  const gridCols = showDetailView ? 'grid-cols-4' : 'grid-cols-9';

  return (
    <div
      key={motorista._id || motorista.id || index}
      className={`grid ${gridCols} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'shadow-lg transform scale-[1.02]'
          : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
      }`}
      style={{
        backgroundColor: isSelected ? '#5D9646' : '#ffffff',
        color: isSelected ? '#ffffff' : '#374151',
        borderColor: isSelected ? '#5D9646' : 'transparent',
      }}
      onClick={() => selectMotorista(motorista)}
    >
      {/* Nombre */}
      <div className="font-semibold flex items-center min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden ${
            isSelected ? 'bg-white bg-opacity-20' : ''
          }`}
          style={{
            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#5F8EAD',
          }}
        >
          {motorista.img ? (
            <img
              src={motorista.img}
              alt={`${motorista.name} ${motorista.lastName}`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <User
            className={`w-5 h-5 ${motorista.img ? 'hidden' : 'block'} text-white`}
          />
        </div>
        <span className="truncate">
          {motorista.name} {motorista.lastName}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center truncate">
        <Mail className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{motorista.email || '—'}</span>
      </div>

      {/* DUI */}
      <div className="flex items-center truncate">
        <CreditCard className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{motorista.id || '—'}</span>
      </div>

      {/* Nacimiento */}
      <div className="flex items-center truncate">
        <Calendar className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">
          {motorista.birthDate ? new Date(motorista.birthDate).toLocaleDateString() : 'No disponible'}
        </span>
      </div>

      {!showDetailView && (
        <>
          {/* Teléfono */}
          <div className="flex items-center truncate">
            <Phone className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">
              {motorista.phone ? String(motorista.phone) : 'No disponible'}
            </span>
          </div>

          {/* Dirección */}
          <div className="flex items-center truncate">
            <MapPin className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{motorista.address || 'No disponible'}</span>
          </div>

          {/* ✅ Tipo de planilla */}
          <div className="flex items-center truncate">
            <ClipboardList className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{motorista.planillaTipo || 'No disponible'}</span>
          </div>

          {/* ✅ Salario */}
          <div className="flex items-center truncate">
            <DollarSign className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">
              {motorista.salario === 0 || motorista.salario
                ? Number(motorista.salario).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : 'No disponible'}
            </span>
          </div>

          {/* Vigencia */}
          <div className="flex items-center truncate">
            <Shield className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            {isLicenseValid(motorista) ? (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isSelected ? 'bg-white bg-opacity-20 text-white' : 'bg-green-100 text-green-800'
                }`}
              >
                Vigente
              </span>
            ) : (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isSelected ? 'bg-white bg-opacity-20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
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
