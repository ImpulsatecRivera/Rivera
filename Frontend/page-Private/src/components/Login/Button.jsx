const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full bg-[#1f2937] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#111827] transition ${className}`}
  >
    {children}
  </button>
);

export default Button;
