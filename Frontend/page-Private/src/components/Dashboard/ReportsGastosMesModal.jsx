import React, { useState, useEffect } from 'react';
import { config } from '../../config';

const monthNames = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const getWeeksForMonth = (mes, ano) => {
  const firstDay = new Date(ano, mes - 1, 1);
  const lastDay = new Date(ano, mes, 0, 23, 59, 59, 999);
  const weeks = [];

  // find the Monday that starts the week containing firstDay (this may be in the previous month)
  let d = new Date(firstDay);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() - 1);
  }

  while (d <= lastDay) {
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 5); // Saturday
    const visibleStart = start < firstDay ? new Date(firstDay) : start;
    const visibleEnd = end > lastDay ? new Date(lastDay) : end;
    // Only include weeks that have days within the requested month and never include previous-month days
    if (visibleStart <= visibleEnd) {
      weeks.push({ start: new Date(visibleStart), end: new Date(visibleEnd) });
    }
    d.setDate(d.getDate() + 7);
  }

  return weeks;
};

const ReportsGastosMesModal = ({ isOpen, onClose }) => {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [ano, setAno] = useState(today.getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [cenaMap, setCenaMap] = useState({});
  const [incaf, setIncaf] = useState('');
  const [renovacion, setRenovacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mes || !ano) return;
    const w = getWeeksForMonth(Number(mes), Number(ano));
    setWeeks(w);
    // reset cena map keys to ensure alignment
    const initial = {};
    w.forEach(week => {
      initial[week.start.toISOString().slice(0,10)] = cenaMap[week.start.toISOString().slice(0,10)] || '';
    });
    setCenaMap(initial);
    setError('');
  }, [mes, ano]);

  if (!isOpen) return null;

  const handleCenaChange = (key, value) => {
    setCenaMap(prev => ({ ...prev, [key]: value }));
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!mes || !ano) {
      setError('Selecciona mes y año');
      return;
    }

    // prepare cesta de semanas
    const cenaArray = Object.keys(cenaMap).map(k => ({ weekStart: k, amount: Number(cenaMap[k] || 0) }));

    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${config.api.API_URL}/reporte/gastosMes/pdf`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mes: Number(mes), ano: Number(ano), cena: cenaArray, incaf: Number(incaf || 0), renovacion: Number(renovacion || 0) })
      });

      if (!resp.ok) {
        const json = await resp.json().catch(() => null);
        throw new Error(json?.message || `Error en servidor ${resp.status}`);
      }

      const contentType = resp.headers.get('content-type') || '';
      const blob = await resp.blob();
      if (contentType.includes('application/pdf')) {
        const filename = `Consolidado-Gastos-${mes}-${ano}.pdf`;
        downloadBlob(blob, filename);
        onClose();
      } else {
        // try parse text
        const text = await blob.text();
        throw new Error(`Respuesta inesperada: ${text}`);
      }

    } catch (e) {
      console.error('Error generando reporte mensual:', e);
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl w-11/12 max-w-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Generar reporte mensual consolidado (PDF)</h3>
            <p className="text-sm text-gray-600">Selecciona mes y año. Agrega montos de "Cena" por semana, INCAF y Renovación/Esquelas.</p>
          </div>
          <button onClick={onClose} className="text-gray-500">Cerrar</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Mes</label>
            <select value={mes} onChange={e=>setMes(e.target.value)} className="w-full mt-1 p-2 border rounded">
              {monthNames.map((mname, idx) => (
                <option key={idx} value={idx+1}>{mname}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Año</label>
            <select value={ano} onChange={e=>setAno(e.target.value)} className="w-full mt-1 p-2 border rounded">
              {/* Years range: currentYear - 5 .. currentYear + 10 (auto-updates each year) */}
              {(() => {
                const current = today.getFullYear();
                const start = current - 5;
                const end = current + 10;
                const options = [];
                for (let y = start; y <= end; y++) options.push(<option key={y} value={y}>{y}</option>);
                return options;
              })()}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-700">Efectivo de viaje - Cena (semanas Lunes a Sábado)</h4>
          <p className="text-xs text-gray-500">Se generarán automáticamente semanas del mes (lunes a sábado). Ingresa monto por semana.</p>
          <div className="mt-2 space-y-2">
            {weeks.length === 0 && <div className="text-sm text-gray-500">No hay semanas completas en este mes</div>}
            {weeks.map((w, i) => {
              const key = w.start.toISOString().slice(0,10);
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-48 text-sm">DEL {String(w.start.getDate()).padStart(2,'0')} AL {String(w.end.getDate()).padStart(2,'0')}</div>
                  <input type="number" min={0} step="0.01" value={cenaMap[key] || ''} onChange={e=>handleCenaChange(key, e.target.value)} className="p-2 border rounded w-36" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700">INCAF</label>
            <input type="number" step="0.01" min={0} value={incaf} onChange={e=>setIncaf(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Renovación / Esquelas</label>
            <input type="number" step="0.01" min={0} value={renovacion} onChange={e=>setRenovacion(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
        </div>

        {error && <div className="text-red-500 mt-3 text-sm">{error}</div>}

        <div className="flex items-center justify-end mt-5 gap-2">
          <button onClick={onClose} className="py-2 px-4 rounded-lg text-sm hover:bg-gray-100" disabled={loading}>Cancelar</button>
          <button onClick={handleGenerate} className="py-2 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60" disabled={loading}>{loading ? 'Generando...' : 'Generar PDF'}</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsGastosMesModal;
