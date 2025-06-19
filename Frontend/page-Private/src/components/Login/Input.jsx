const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-white">{label}</label>
      <input
        className="p-2 rounded-md text-black"
        {...props}
      />
    </div>
  );
};

export default Input;