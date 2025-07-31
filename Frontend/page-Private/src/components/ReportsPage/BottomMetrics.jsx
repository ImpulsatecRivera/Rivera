import React from "react";
import { Users, Truck, Clock, Package, TrendingUp, ArrowUp } from "lucide-react";

const MetricCard = ({ icon: Icon, title, value, trend, trendValue, color = "green" }) => {
  const colorClasses = {
    green: "text-green-500 bg-green-50",
    blue: "text-blue-500 bg-blue-50",
    purple: "text-purple-500 bg-purple-50",
    orange: "text-orange-500 bg-orange-50",
    red: "text-red-500 bg-red-50"
  };

  const trendColors = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100"
  };

  return (
    <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-gray-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={18} className={colorClasses[color].split(' ')[0]} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            <ArrowUp 
              size={12} 
              className={`transform ${trend === 'negative' ? 'rotate-180' : ''} ${trend === 'neutral' ? 'rotate-90' : ''}`} 
            />
            {trendValue}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 leading-tight">
        {title}
      </div>

      {/* Value */}
      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-none">
        {value}
      </div>
    </div>
  );
};

const BottomMetrics = () => {
  const metrics = [
    {
      icon: Users,
      title: "Usuarios activos",
      value: "1,893",
      color: "green",
      trend: "positive",
      trendValue: "+12%"
    },
    {
      icon: Truck,
      title: "Cargas entregadas",
      value: "3,298",
      color: "blue",
      trend: "positive",
      trendValue: "+8%"
    },
    {
      icon: Clock,
      title: "Tiempo promedio de viaje",
      value: "2h 34m",
      color: "purple",
      trend: "negative",
      trendValue: "-5%"
    },
    {
      icon: Package,
      title: "Capacidad inicial de carga",
      value: "64%",
      color: "orange",
      trend: "neutral",
      trendValue: "0%"
    },
    {
      icon: Package,
      title: "Capacidad actual de carga",
      value: "86%",
      color: "green",
      trend: "positive",
      trendValue: "+22%"
    },
    {
      icon: TrendingUp,
      title: "Incremento de eficiencia",
      value: "+34%",
      color: "green",
      trend: "positive",
      trendValue: "+7%"
    }
  ];

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1">
          Métricas de Rendimiento
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          Indicadores clave de desempeño del sistema
        </p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Mobile Alternative Layout - Stack for very small screens */}
      <div className="block xs:hidden mt-4">
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.color === 'green' ? 'text-green-500 bg-green-50' : 
                  metric.color === 'blue' ? 'text-blue-500 bg-blue-50' :
                  metric.color === 'purple' ? 'text-purple-500 bg-purple-50' :
                  metric.color === 'orange' ? 'text-orange-500 bg-orange-50' :
                  'text-red-500 bg-red-50'}`}>
                  <metric.icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">{metric.title}</div>
                  <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                </div>
              </div>
              {metric.trend && metric.trendValue && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'positive' ? 'text-green-600 bg-green-100' :
                  metric.trend === 'negative' ? 'text-red-600 bg-red-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  <ArrowUp 
                    size={10} 
                    className={`transform ${metric.trend === 'negative' ? 'rotate-180' : ''} ${metric.trend === 'neutral' ? 'rotate-90' : ''}`} 
                  />
                  {metric.trendValue}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* XS Breakpoint */
          @media (min-width: 360px) {
            .xs\\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .xs\\:hidden {
              display: none;
            }
          }
          
          /* Improved hover effects */
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1.1);
          }
          
          /* Better responsive text sizing */
          @media (max-width: 480px) {
            .text-lg { font-size: 1rem; }
            .text-xl { font-size: 1.125rem; }
            .text-2xl { font-size: 1.25rem; }
          }
          
          /* Tablet specific adjustments */
          @media (min-width: 768px) and (max-width: 1023px) {
            .lg\\:grid-cols-6 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          
          /* Small desktop adjustments */
          @media (min-width: 1024px) and (max-width: 1279px) {
            .lg\\:grid-cols-6 {
              grid-template-columns: repeat(6, minmax(0, 1fr));
            }
          }
          
          /* Large screens - keep 6 columns but with better spacing */
          @media (min-width: 1280px) {
            .xl\\:grid-cols-6 {
              grid-template-columns: repeat(6, minmax(0, 1fr));
            }
          }
          
          /* Animation improvements */
          .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Focus styles for accessibility */
          .group:focus-within {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
          }
          
          /* Print styles */
          @media print {
            .shadow-sm, .shadow-md {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default BottomMetrics;