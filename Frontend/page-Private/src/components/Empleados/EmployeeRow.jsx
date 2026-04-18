import React from "react";
import { User, Mail, IdCard, Calendar, Phone, MapPin } from "lucide-react";

const safeDate = (v) => {
  if (!v) return "—";
  try {
    // Extraer fecha directamente sin crear Date object para evitar problemas de timezone
    const dateStr = String(v).substring(0, 10); // Obtener YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return "—";
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};  

const money = (n) => {
  const num = Number(n ?? 0);
  if (!Number.isFinite(num)) return "$0.00";
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(num);
};

const EmployeeRow = ({ empleado, showDetailView, selectedEmpleados, selectEmpleado }) => {
  const selected = selectedEmpleados && selectedEmpleados._id === empleado._id;
  const isDesactivado = empleado?.cuentaDesactivada === true;

  const rowColors = (() => {
    if (isDesactivado && selected) {
      return {
        backgroundColor: '#be123c',
        color: '#ffffff',
        borderColor: '#be123c',
      };
    }

    if (isDesactivado) {
      return {
        backgroundColor: '#fff7f8',
        color: '#9f1239',
        borderColor: '#fbcfe8',
      };
    }

    if (selected) {
      return {
        backgroundColor: '#5D9646',
        color: '#ffffff',
        borderColor: '#5D9646',
      };
    }

    return {
      backgroundColor: '#ffffff',
      color: '#374151',
      borderColor: 'transparent',
    };
  })();

  let iconColorClass = 'text-gray-400';
  if (selected) iconColorClass = 'text-white';
  else if (isDesactivado) iconColorClass = 'text-rose-300';

  let statusClass = 'text-emerald-700';
  if (selected) statusClass = 'text-white';
  else if (isDesactivado) statusClass = 'text-rose-700';

  const statusLabel = isDesactivado ? 'Desactivado' : 'Activo';

  return (
    <div
      className={`grid ${showDetailView ? "grid-cols-4" : "grid-cols-6"} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        selected ? "shadow-lg transform scale-[1.02]" : "hover:shadow-md hover:transform hover:scale-[1.01]"
      }`}
      style={rowColors}
      onClick={() => selectEmpleado(empleado)}
    >
      {/* Nombre + Avatar */}
      <div className="font-semibold flex items-center min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden ${
            selected ? "bg-white bg-opacity-20" : ""
          }`}
          style={{ backgroundColor: selected ? "rgba(255,255,255,0.2)" : "#5F8EAD" }}
        >
          {empleado.img ? (
            <img
              src={empleado.img}
              alt={`${empleado.name} ${empleado.lastName}`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <User className={`w-5 h-5 ${empleado.img ? "hidden" : "block"} text-white`} />
        </div>

        <div className="min-w-0">
          <div className="truncate">
            {empleado.name} {empleado.lastName}
          </div>

          {/* ✅ Nuevos campos debajo (sin agregar columnas) */}
          {!showDetailView && (
            <div className="text-[11px] opacity-90 truncate">
              <span className="font-semibold">{empleado.rol || "—"}</span>
              <span className="mx-2">•</span>
              <span>{empleado.planillaTipo || "—"}</span>
              <span className="mx-2">•</span>
              <span className={`font-semibold ${statusClass}`}>{statusLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center min-w-0">
        <Mail className={`w-4 h-4 mr-2 ${iconColorClass}`} />
        <span className="truncate">{empleado.email || "—"}</span>
      </div>

      {/* DUI */}
      <div className="flex items-center min-w-0">
        <IdCard className={`w-4 h-4 mr-2 ${iconColorClass}`} />
        <span className="truncate">{empleado.dui || "—"}</span>
      </div>

      {/* BirthDate */}
      <div className="flex items-center min-w-0">
        <Calendar className={`w-4 h-4 mr-2 ${iconColorClass}`} />
        <span className="truncate">{safeDate(empleado.birthDate)}</span>
      </div>

      {/* Solo si NO está el panel detalle */}
      {!showDetailView && (
        <>
          {/* Teléfono + Salario debajo */}
          <div className="flex items-center min-w-0">
            <Phone className={`w-4 h-4 mr-2 ${iconColorClass}`} />
            <div className="min-w-0">
              <div className="truncate">{empleado.phone ? empleado.phone.toString() : "No disponible"}</div>
              <div className="text-[11px] opacity-90 truncate">Salario: {money(empleado.salario)}</div>
            </div>
          </div>

          {/* Dirección */}
          <div className="flex items-center min-w-0">
            <MapPin className={`w-4 h-4 mr-2 ${iconColorClass}`} />
            <span className="truncate">{empleado.address || "—"}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeRow;
