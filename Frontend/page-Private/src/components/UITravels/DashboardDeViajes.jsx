// 📊 DashboardDeViajes.jsx
const DashboardDeViajes = ({ viajesPorDias }) => {
  const programados = viajesPorDias.reduce((acc, day) =>
    acc + day.viajes.filter(v => v.estado?.actual === 'pendiente').length, 0
  );
  const enRuta = viajesPorDias.reduce((acc, day) =>
    acc + day.viajes.filter(v => v.estado?.actual === 'en_curso').length, 0
  );
  const retrasados = viajesPorDias.reduce((acc, day) =>
    acc + day.viajes.filter(v => v.estado?.actual === 'retrasado').length, 0
  );
  const completados = viajesPorDias.reduce((acc, day) =>
    acc + day.viajes.filter(v => v.estado?.actual === 'completado').length, 0
  );

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-2">📊 Dashboard de Viajes</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{programados}</div>
          <div className="text-gray-600">Programados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{enRuta}</div>
          <div className="text-gray-600">En Ruta</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{retrasados}</div>
          <div className="text-gray-600">Retrasados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{completados}</div>
          <div className="text-gray-600">Completados</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDeViajes;
