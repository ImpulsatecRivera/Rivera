const Title = ({ children, className = "" }) => {
  return (
    <h2 className={`text-2xl font-bold text-center mb-6 ${className}`}>
      {children}
    </h2>
  );
};

export default Title;