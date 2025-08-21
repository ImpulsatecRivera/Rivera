import { Mail, Phone } from 'lucide-react';

const Input = ({ type, placeholder, value, onChange, className, ...props }) => {
  const Icon = type === "email" ? Mail : Phone;

  return (
    <div className={`relative w-full`}>
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full pl-10 pr-4 py-3
          bg-gray-800 border border-gray-700
          rounded-xl text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
