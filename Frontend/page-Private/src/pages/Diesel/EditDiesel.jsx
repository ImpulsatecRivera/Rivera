import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, AlertCircle, Fuel } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../Context/authContext";
import Swal from 'sweetalert2'; // ✅ IMPORTAR

const ESTADOS = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
};

const toISODate = (dateLike) => {
  if (!dateLike) return "";

  if (typeof dateLike === "string") {
    const s = dateLike.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export default function EditDiesel() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [camiones, setCamiones] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    CicurlationCard: "",
    Galones: "",
    Total: "",
    numeroMarchamo: "", // ✅ NUEVO
    estado: ESTADOS.PENDIENTE,
  });

  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeEstado = (v) => String(v || "").trim().toLowerCase();
  const canonEstado = (v) => (normalizeEstado(v) === "completado" ? ESTADOS.COMPLETADO : ESTADOS.PENDIENTE);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        // 🔹 Camiones
        const { data: camData } = await api.get('/camiones');
        const camRows = camData?.data || [];
        setCamiones(camRows);

        // 🔹 Diesel
        const { data: dieselData } = await api.get('/resumen');
        const rows = dieselData?.data || [];
        const found = rows.find((r) => String(r?._id || r?.id) === String(id));
        
        if (!found) throw new Error("No se encontró el registro de diésel");

        const fecha = found.fecha || found.date || found.createdAt || found.fecha_diesel;
        const cic =
          (typeof found.CicurlationCard === "object" && found.CicurlationCard?._id) ||
          found.CicurlationCard ||
          "";

        const estadoBD = canonEstado(found.estado || found.Estado || found.status);

        setFormData({
          fecha: toISODate(fecha),
          CicurlationCard: cic,
          Galones: String(found.Galones ?? found.galones ?? 0),
          Total: String(found.Total ?? found.total ?? 0),
          numeroMarchamo: found.numeroMarchamo || "", // ✅ NUEVO
          estado: estadoBD,
        });

        setIsLocked(estadoBD === ESTADOS.COMPLETADO);

      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar datos',
          text: e.response?.data?.message || e.message || "Error al cargar",
          confirmButtonColor: '#ef4444'
        }).then(() => {
          navigate("/diesel");
        });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const precioPorGalon = useMemo(() => {
    const g = toNumber(formData.Galones);
    const t = toNumber(formData.Total);
    if (g <= 0) return 0;
    return t / g;
  }, [formData.Galones, formData.Total]);

  const formatearMoneda = (cantidad) => {
    const n = Number(cantidad || 0);
    return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
  };

  const handleChange = (e) => {
    if (isLocked) return;

    const { name, value } = e.target;

    if (name === "fecha") {
      const today = getTodayISO();
      if (value && value > today) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha no válida',
          text: 'No se permiten fechas futuras. Solo fechas pasadas o el día de hoy.',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isLocked) {
        throw new Error("Este registro ya está completado y no se puede editar.");
      }

      // ✅ Validaciones con SweetAlert
      if (!formData.fecha) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'La fecha es requerida',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      if (formData.fecha > getTodayISO()) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha no válida',
          text: 'La fecha no puede ser a futuro.',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      if (!formData.CicurlationCard) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'Debe seleccionar un camión',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      if (toNumber(formData.Galones) <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Galones inválidos',
          text: 'Los galones deben ser mayores que 0',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      if (toNumber(formData.Total) <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Total inválido',
          text: 'El total debe ser mayor que 0',
          confirmButtonColor: '#5F8EAD'
        });
        return;
      }

      // ✅ Confirmación antes de guardar
      const confirmResult = await Swal.fire({
        title: '¿Guardar cambios?',
        text: formData.estado === ESTADOS.COMPLETADO
          ? "El registro se marcará como completado y ya no podrás editarlo después"
          : "Se actualizará la información del registro",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#5F8EAD',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmResult.isConfirmed) return;

      setSaving(true);

      // ✅ Mostrar loading
      Swal.fire({
        title: 'Guardando cambios...',
        html: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const payload = {
        fecha: formData.fecha,
        Galones: toNumber(formData.Galones),
        Total: toNumber(formData.Total),
        CicurlationCard: formData.CicurlationCard,
        numeroMarchamo: formData.numeroMarchamo.trim() || null, // ✅ NUEVO
        estado: formData.estado,
      };

      console.log('📤 Payload enviado:', payload);

      const { data } = await api.put(`/resumen/${id}`, payload);
      
      if (!data?.success) {
        throw new Error(data?.message || "Error al actualizar");
      }

      // ✅ Alert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        html: formData.estado === ESTADOS.COMPLETADO
          ? '✅ Registro actualizado y marcado como completado'
          : '✅ Registro actualizado exitosamente',
        confirmButtonColor: '#5D9646',
        timer: 3000,
        timerProgressBar: true
      });

      navigate("/diesel");
    } catch (e) {
      console.error(e);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: e.response?.data?.message || e.message || "Error al actualizar",
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async () => {
    const result = await Swal.fire({
      title: '¿Cancelar edición?',
      text: "Los cambios no guardados se perderán",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar editando'
    });

    if (result.isConfirmed) {
      navigate("/diesel");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#5F8EAD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando diésel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleCancelar}
            className="flex items-center gap-2 text-[#5F8EAD] hover:text-[#34353A] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Diésel
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#34353A] to-[#5F8EAD] p-4 rounded-2xl shadow-lg">
              <Fuel className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#34353A] mb-1">Editar Diésel</h1>
              <p className="text-gray-600">Actualiza los datos del registro</p>

              {isLocked && (
                <p className="mt-2 text-sm font-semibold text-[#5D9646] bg-[#5D9646] bg-opacity-10 border-2 border-[#5D9646] inline-block px-3 py-1 rounded-xl">
                  ✅ Este registro está COMPLETADO y ya no se puede editar.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                max={getTodayISO()}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Camión */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Camión / Placa</label>
              <select
                name="CicurlationCard"
                value={formData.CicurlationCard}
                onChange={handleChange}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Seleccionar camión...</option>
                {camiones.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.licensePlate} - {c.brand} {c.model}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ NUEVO: Número de Marchamo */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">
                Número de Marchamo
                <span className="text-gray-400 font-normal text-xs ml-2">(Opcional)</span>
              </label>
              <input
                type="text"
                name="numeroMarchamo"
                value={formData.numeroMarchamo}
                onChange={handleChange}
                placeholder="Ej: M-12345-2024"
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Estado del registro</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value={ESTADOS.PENDIENTE}>🟡 Pendiente</option>
                <option value={ESTADOS.COMPLETADO}>🟢 Completado</option>
              </select>

              {!isLocked && formData.estado === ESTADOS.COMPLETADO && (
                <p className="text-xs text-gray-500 mt-2">
                  Al guardar como <b>Completado</b>, ya no podrás editar este registro después.
                </p>
              )}
            </div>

            {/* Galones */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Galones</label>
              <input
                type="number"
                name="Galones"
                value={formData.Galones}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-semibold text-[#34353A] mb-2">Total (USD)</label>
              <input
                type="number"
                name="Total"
                value={formData.Total}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8EAD] focus:border-[#5F8EAD] ${
                  isLocked ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />

              <p className="text-xs text-gray-500 mt-2">
                Precio aproximado por galón: <b>{formatearMoneda(precioPorGalon)}</b>
              </p>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleCancelar}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving || isLocked}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34353A] to-[#5F8EAD] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}