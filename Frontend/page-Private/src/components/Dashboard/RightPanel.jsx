import ReportCard from "./ReportCard";

const RightPanel = () => {
  const data = [
    { label: "Food and Drink", value: "872,400" },
    { label: "Shopping", value: "1,378,200" },
    { label: "Housing", value: "928,500" },
    { label: "Transportation", value: "420,700" },
    { label: "Vehicle", value: "520,000" },
  ];

  return (
    <div className="bg-gray-100 p-6 space-y-6">
      <h3 className="font-semibold">Tipos de carga frecuentes</h3>
      <ul className="space-y-2 text-sm">
        {data.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
      <ReportCard />
    </div>
  );
};

export default RightPanel;
