const Header = () => (
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-lg font-semibold">Actividad de viajes</h2>
    <select className="ml-4 p-1 text-sm rounded border">
      <option>Mensual</option>
      <option>Semanal</option>
    </select>
  </div>
);

export default Header;