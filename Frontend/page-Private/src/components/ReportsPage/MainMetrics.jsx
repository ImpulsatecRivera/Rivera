import React from 'react';
import { Activity, MapPin, TrendingUp, Clock } from 'lucide-react';
import MetricCard from './MetricCard';

const MainMetrics = () => {
  const metrics = [
    { icon: Activity, value: '10.528', sublabel: 'Km recorridos mes', color: 'green' },
    { icon: MapPin, value: '1.893', sublabel: 'Km de viajes del mes', color: 'blue' },
    { icon: TrendingUp, value: '1.893 km', sublabel: 'De viajes de hoy', color: 'green' },
    { icon: Clock, value: '30m', sublabel: 'Hrs de cada viaje', color: 'blue' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default MainMetrics;