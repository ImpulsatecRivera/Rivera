import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrimaryButton = ({ text, to }) => {
  const navigate = useNavigate();

  return (
    <button
      className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
      onClick={() => navigate(to)}
    >
      {text}
    </button>
  );
};

export default PrimaryButton;