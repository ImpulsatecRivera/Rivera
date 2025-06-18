// src/components/Login/Input.jsx
const Input = ({ label, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm mb-1 text-gray-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
);

export default Input;