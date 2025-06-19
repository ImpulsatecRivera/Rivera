import avatar from "../../images/avatarDashboard.png";

const Sidebar = () => {
  const menuItems = [
    "Inicio",
    "Viajes",
    "Cotizaciones",
    "Empleados",
    "Motoristas",
    "Proveedores",
    "Camiones"
  ];

  return (
    <nav className="bg-[#1A1D23] text-white w-64 p-6 flex flex-col justify-between h-screen">
      <div>
        <div className="flex justify-center mb-6">
          <img src={avatar} alt="Avatar" className="h-20 object-contain" />
        </div>
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li
              key={item}
              className="hover:text-purple-400 text-sm font-medium cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 text-sm text-gray-400 hover:text-white cursor-pointer">
        <span className="inline-block mr-2">⎋</span> Cerrar sesión
      </div>
    </nav>
  );
};

export default Sidebar;
