import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const data = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
  datasets: [
    {
      label: 'Viajes',
      data: [120, 190, 300, 500, 200],
      backgroundColor: '#a100f2',
    },
  ],
};

const Chart = () => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">Actividad de viajes</h2>
      <div className="mt-4">
        <Bar data={data} />
      </div>
    </div>
  );
};

export default Chart;
