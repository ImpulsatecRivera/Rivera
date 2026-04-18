// DetailPanel.jsx (Motoristas)

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import Lottie from "lottie-react";
import sandyLoadingAnimation from "../../assets/lotties/Sandy Loading.json";

const DetailPanel = ({
  selectedMotorista,
  closeDetailView,
  handleOptionsClick,
  isLicenseValid,
  getLicenseStatus,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [selectedMotorista]);

  // Helpers
  const safeText = (v, fallback = "No disponible") => {
    const s = (v ?? "").toString().trim();
    return s ? s : fallback;
  };

  const formatDate = (v) => {
    if (!v) return "No disponible";
    try {
      // Extraer fecha directamente sin crear Date object para evitar problemas de timezone
      const dateStr = String(v).substring(0, 10); // Obtener YYYY-MM-DD
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return "No disponible";
      return `${day}/${month}/${year}`;
    } catch {
      return "No disponible";
    }
  };

  const formatDateLocal = (v) => {
    if (!v) return "No disponible";
    try {
      // Extraer solo la fecha sin convertir a Date para evitar problemas de zona horaria
      const fechaStr = String(v).split('T')[0]; // YYYY-MM-DD
      const [year, month, day] = fechaStr.split('-').map(Number);
      const d = new Date(year, month - 1, day); // Crear fecha local
      if (Number.isNaN(d.getTime())) return "No disponible";
      return d.toLocaleDateString();
    } catch (e) {
      return "No disponible";
    }
  };

  // ✅ Salario con fallbacks
  const getSalario = (m) => m?.salario ?? m?.salary ?? m?.sueldo ?? null;

  const formatSalary = (v) => {
    if (v === null || v === undefined || v === "") return "No disponible";
    const num = Number(v);
    if (Number.isNaN(num)) return "No disponible";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ✅ Planilla con fallbacks
  const getPlanillaTipo = (m) =>
    m?.planillaTipo ??
    m?.planilla ??
    m?.tipoPlanilla ??
    m?.tipoDePlanilla ??
    m?.planilla_type ??
    "";

  // Formatea el tipo de planilla a un label legible (Semanal | Quincenal | Mensual)
  const formatPlanillaLabel = (planilla) => {
    const s = (planilla ?? '').toString().toLowerCase().trim();
    if (!s) return 'Mensual';
    if (s.includes('seman') || s === '1') return 'Semanal';
    if (s.includes('quinc') || s === '2') return 'Quincenal';
    if (s.includes('mens')) return 'Mensual';
    return 'Mensual';
  }; 

  if (isLoading) {
    return (
      <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, #34353A 0%, #2a2b2f 100%)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10 animate-pulse"
              style={{
                backgroundColor: "#5F8EAD",
                animation: "float 3s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-10 right-10 w-16 h-16 rounded-full opacity-10 animate-pulse"
              style={{
                backgroundColor: "#5D9646",
                animation: "float 3s ease-in-out infinite reverse",
              }}
            />
            <div
              className="absolute top-1/2 left-4 w-12 h-12 rounded-full opacity-10 animate-pulse"
              style={{
                backgroundColor: "#5F8EAD",
                animation: "float 4s ease-in-out infinite",
              }}
            />
          </div>

          <div className="text-center z-10">
            <div className="relative mb-8 flex justify-center">
              <div className="w-48 h-48 flex items-center justify-center">
                <Lottie
                  animationData={sandyLoadingAnimation}
                  loop
                  autoplay
                  className="w-full h-full"
                  style={{
                    filter: "drop-shadow(0 10px 30px rgba(95, 142, 173, 0.4))",
                  }}
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-white animate-pulse">
                Cargando Perfil
              </h2>
              <p className="text-gray-300 text-lg">
                Preparando información del {selectedMotorista?.rol === 'auxiliar' ? 'auxiliar' : 'motorista'}
              </p>
            </div>

            <div className="flex justify-center space-x-3 mb-8">
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: "#5F8EAD",
                    animation:
                      "bounce-custom 1.6s ease-in-out infinite both",
                  }}
                />
                <div
                  className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                  style={{ backgroundColor: "#5F8EAD", opacity: "0.3" }}
                />
              </div>

              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: "#FFFFFF",
                    animation:
                      "bounce-custom 1.6s ease-in-out infinite both",
                    animationDelay: "0.2s",
                  }}
                />
                <div
                  className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                  style={{
                    backgroundColor: "#FFFFFF",
                    opacity: "0.3",
                    animationDelay: "0.2s",
                  }}
                />
              </div>

              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: "#5D9646",
                    animation:
                      "bounce-custom 1.6s ease-in-out infinite both",
                    animationDelay: "0.4s",
                  }}
                />
                <div
                  className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                  style={{
                    backgroundColor: "#5D9646",
                    opacity: "0.3",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            </div>

            <div className="w-80 mx-auto">
              <div className="w-full bg-gray-600 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                <div
                  className="h-2 rounded-full relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #5F8EAD 0%, #5D9646 50%, #5F8EAD 100%)",
                    width: "100%",
                    animation: "loading-wave 2.5s ease-in-out infinite",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                    style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-400 animate-pulse">
                <span style={{ animation: "text-fade 3s ease-in-out infinite" }}>
                  Verificando credenciales del {selectedMotorista?.rol === 'auxiliar' ? 'auxiliar' : 'motorista'}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ NO uses <style jsx> (eso es de Next). En React normal usa <style> */}
        <style>{`
          @keyframes loading-wave {
            0% { transform: translateX(-100%); opacity: 0.5; }
            50% { transform: translateX(0%); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0.5; }
          }
          @keyframes bounce-custom {
            0%, 80%, 100% { transform: scale(0.8) translateY(0); opacity: 0.5; }
            40% { transform: scale(1.2) translateY(-10px); opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.1); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes text-fade {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!selectedMotorista) return null;

  const salarioValue = getSalario(selectedMotorista);
  const planillaValue = getPlanillaTipo(selectedMotorista);
  const isDesactivado = selectedMotorista?.cuentaDesactivada === true;

  return (
    <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
      {/* ✅ Quitada la decoración que podía tapar el botón */}

      {/* Header - Fijo */}
      <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0 relative z-20">
        <div className="flex items-center">
          <button
            className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
            onClick={closeDetailView}
            type="button"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedMotorista.rol === 'auxiliar' ? 'Detalles del Auxiliar' : 'Detalles del Motorista'}
          </h2>
        </div>

        <button
          onClick={handleOptionsClick}
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          title="Opciones"
          type="button"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-10">
        {/* Profile Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div
              className="w-28 h-28 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)",
              }}
            >
              {selectedMotorista.img ? (
                <img
                  src={selectedMotorista.img}
                  alt={`${safeText(selectedMotorista.name, "")} ${safeText(
                    selectedMotorista.lastName,
                    ""
                  )}`}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              <User
                className={`w-14 h-14 text-white ${
                  selectedMotorista.img ? "hidden" : "block"
                }`}
              />
            </div>
          </div>

          <h3 className="font-bold text-xl mb-2 text-gray-900">
            {safeText(selectedMotorista.name, "")}{" "}
            {safeText(selectedMotorista.lastName, "")}
          </h3>

          <div className="mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                isDesactivado
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              {isDesactivado ? 'Cuenta desactivada' : 'Cuenta activa'}
            </span>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md"
              style={{ backgroundColor: "#5D9646" }}
              type="button"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button
              className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md"
              style={{ backgroundColor: "#5F8EAD" }}
              type="button"
            >
              <Mail className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Information Cards */}
        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#5F8EAD" }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Información Personal</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </div>
                <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">
                  {safeText(selectedMotorista.email)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">DUI</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                  {safeText(selectedMotorista.id ?? selectedMotorista.dui)}
                </div>
              </div>

              {/* ✅ PLANILLA TIPO (con fallbacks) */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Tipo de Planilla
                </div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2" style={{ color: "#5F8EAD" }} />
                  {safeText(planillaValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto y Ubicación */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#5D9646" }}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <Calendar className="w-4 h-4 mr-2" style={{ color: "#5D9646" }} />
                  {formatDate(selectedMotorista.birthDate)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <Phone className="w-4 h-4 mr-2" style={{ color: "#5D9646" }} />
                  {safeText(selectedMotorista.phone)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Dirección</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <MapPin className="w-4 h-4 mr-2" style={{ color: "#5D9646" }} />
                  {safeText(selectedMotorista.address)}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Información Financiera (SALARIO con fallbacks) */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#10b981" }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Información Financiera</span>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Salario</div>
              <div className="text-lg font-bold text-emerald-700 bg-white p-4 rounded-lg border border-emerald-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" style={{ color: "#10b981" }} />
                  <span>{formatSalary(salarioValue)}</span>
                </div>

                {Number(salarioValue) > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    {formatPlanillaLabel(planillaValue)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Documentación */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#34353A" }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Documentación</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Tarjeta de Circulación
                </div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" style={{ color: "#34353A" }} />
                  {safeText(selectedMotorista.circulationCard)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Estado de Licencia
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  {(() => {
                    const status = getLicenseStatus?.(selectedMotorista) || 'Sin fecha';
                    if (status === 'Vigente') {
                      return (
                        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Shield className="w-4 h-4 mr-2" />
                          Licencia Vigente
                        </span>
                      );
                    } else if (status === 'Próxima a vencer') {
                      return (
                        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Shield className="w-4 h-4 mr-2" />
                          Próxima a vencer
                        </span>
                      );
                    } else {
                      return (
                        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <Shield className="w-4 h-4 mr-2" />
                          Licencia Vencida
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento de Licencia
                </div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <Calendar className="w-4 h-4 mr-2" style={{ color: "#34353A" }} />
                  {formatDateLocal(selectedMotorista.fechaVencimientoLicencia)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* fin content */}
      </div>
    </div>
  );
};

export default DetailPanel;
