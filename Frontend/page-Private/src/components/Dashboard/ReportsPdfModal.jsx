import React, { useState } from 'react';
import { config } from '../../config';
import Swal from 'sweetalert2';

const ReportsPdfModal = ({ isOpen, onClose }) => {
  const [date, setDate] = useState('');
  const [manualEntries, setManualEntries] = useState([]); // { name, amount }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null; 

  const parseLocalDate = (yyyyMmDd) => {
    // yyyyMmDd is expected in format 'YYYY-MM-DD'
    const parts = String(yyyyMmDd || '').split('-');
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1; // monthIndex
    const d = Number(parts[2]);
    return new Date(y, m, d);
  };

  const validateDate = (isoDate) => {
    if (!isoDate) return 'Selecciona una fecha';
    const d = parseLocalDate(isoDate);
    if (!d) return 'Fecha inválida';
    const day = d.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
    if (day === 0) return 'La fecha no puede ser domingo. Selecciona lunes o un día entre ese día y sábado.';
    return '';
  };

  const addManualEntry = () => {
    setManualEntries(prev => [...prev, { name: '', amount: '' }]);
  };

  const updateManualEntry = (index, field, value) => {
    setManualEntries(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeManualEntry = (index) => {
    setManualEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const err = validateDate(date);
    if (err) {
      setError(err);
      return;
    }

    // Validar entradas manuales
    for (let i = 0; i < manualEntries.length; i++) {
      const e = manualEntries[i];
      if (!e.name || e.name.trim() === '') {
        setError('El nombre de la entrada manual #' + (i + 1) + ' es obligatorio');
        return;
      }
      const amt = Number(e.amount);
      if (isNaN(amt) || amt < 0) {
        setError('El monto de la entrada manual #' + (i + 1) + ' debe ser un número válido');
        return;
      }
    }

    setError('');
    setLoading(true);

        // Mostrar alerta de procesamiento
        Swal.fire({
          title: 'Generando reporte...',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
              <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #5F8EAD;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              "></div>
              <p style="color: #666; font-size: 14px; margin: 0;">Por favor espera mientras se genera el PDF...</p>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false
        });

    try {
      // date ya viene en formato 'YYYY-MM-DD' desde el input type=date (evitamos .toISOString() por TZ)
      const payload = {
        date,
        manualEntries: manualEntries.map(m => ({ name: m.name, amount: Number(m.amount) || 0 }))
      };

      const endpoint = `${config.api.API_URL}/reporte/viajesGastos/pdf`;
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 404) {
          // Mensaje más claro para 404
          throw new Error(`Ruta no encontrada (404). Verifica que el backend esté en ${endpoint}`);
        }
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-semanal-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLoading(false);
      
            // Cerrar alerta de procesamiento y mostrar éxito
            Swal.fire({
              icon: 'success',
              title: '¡Reporte generado!',
              text: 'El PDF se ha descargado correctamente',
              confirmButtonColor: '#5D9646',
              timer: 2000,
              showConfirmButton: false
            });

      onClose();
    } catch (e) {
      
            // Cerrar alerta de procesamiento y mostrar error
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: e.message || 'Error al generar el PDF',
              confirmButtonColor: '#ef4444'
            });

      setLoading(false);
      setError(e.message || 'Error al generar el PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl w-11/12 max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Generar reporte semanal (PDF)</h3>
        <p className="text-sm text-gray-600 mb-4">Selecciona la fecha (puede ser lunes o una fecha entre ese día y sábado)</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError(''); }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Efectivo de viaje</label>
            <button
              type="button"
              onClick={addManualEntry}
              className="text-sm text-blue-600 hover:underline"
            >
              + Agregar
            </button>
          </div>

          {manualEntries.length === 0 && (
            <p className="text-xs text-gray-500">Agregar montos adicionales (ej. reembolsos, extras)</p>
          )}

          <div className="space-y-2 mt-2">
            {manualEntries.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={m.name}
                  onChange={(e) => updateManualEntry(i, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl bg-white"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={m.amount}
                  onChange={(e) => updateManualEntry(i, 'amount', e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-xl bg-white"
                  min={0}
                />
                <button
                  type="button"
                  onClick={() => removeManualEntry(i)}
                  className="px-3 py-2 text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div> 

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex items-center justify-end mt-4 space-x-2">
          <button
            className="py-2 px-4 rounded-lg text-sm hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="py-2 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPdfModal;
