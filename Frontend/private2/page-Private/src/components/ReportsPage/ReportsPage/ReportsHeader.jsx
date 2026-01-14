import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReportsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-[#2a2d31] rounded-lg mb-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white hover:text-[#34353A] hover:bg-white/20 p-2 rounded transition-all duration-200"
          title="Volver al Dashboard"
        >
          <FiArrowLeft size={18} />
        </button>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Informe General</h2>
      </div>

      <span className="text-xs sm:text-sm text-gray-300 pr-2 hidden sm:inline">Informe de este mes</span>
    </div>
  );
};

export default ReportsHeader;