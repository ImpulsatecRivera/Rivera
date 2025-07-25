import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReportsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-700 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-700">Informe General</h2>
      </div>

      <span className="text-sm text-gray-500 pr-2">Informe de este mes</span>
    </div>
  );
};

export default ReportsHeader;