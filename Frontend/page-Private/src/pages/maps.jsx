import React, { useState, useEffect, useRef } from 'react';
import { Truck, TrendingUp, Plus, Minus } from 'lucide-react';

const ElSalvadorMap = () => {
  const [zoomLevel, setZoomLevel] = useState(8);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Ubicaciones con coordenadas reales de El Salvador
  const locations = [
    { 
      name: "Santa Ana Municipality", 
      coords: [13.9942, -89.5592], 
      type: "red", 
      number: "",
      description: "Municipio principal del occidente"
    },
    { 
      name: "Lourdes", 
      coords: [13.6667, -89.3833], 
      type: "green", 
      number: "3",
      description: "3 rutas activas"
    },
    { 
      name: "Chalatenango", 
      coords: [14.0333, -88.9333], 
      type: "green", 
      number: "5",
      description: "5 rutas frecuentes"
    },
    { 
      name: "Sensuntepeque", 
      coords: [13.8667, -88.6333], 
      type: "green", 
      number: "5",
      description: "5 rutas activas"
    },
    { 
      name: "Usulután", 
      coords: [13.3500, -88.4500], 
      type: "green", 
      number: "3",
      description: "3 rutas disponibles"
    }
  ];

  // Ciudades de referencia
  const cities = [
    { name: "San Salvador", coords: [13.6929, -89.2182] },
    { name: "San Miguel", coords: [13.4833, -88.1833] },
    { name: "Soyapango", coords: [13.7167, -89.1389] },
    { name: "Mejicanos", coords: [13.7408, -89.2075] }
  ];

  useEffect(() => {
    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Cargar CSS de Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);

        // Cargar JS de Leaflet
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (mapRef.current && window.L && !mapInstanceRef.current) {
        // Inicializar mapa centrado en El Salvador
        const map = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true
        }).setView([13.7942, -88.8965], zoomLevel);

        // Agregar tiles de OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Agregar marcadores personalizados
        locations.forEach(location => {
          const markerClass = `marker-${location.type}`;
          
          const customIcon = window.L.divIcon({
            className: 'custom-marker-container',
            html: `<div class="custom-marker ${markerClass}">${location.number}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });

          const marker = window.L.marker(location.coords, { icon: customIcon }).addTo(map);
          
          marker.bindPopup(`
            <div style="font-family: 'Segoe UI', sans-serif;">
              <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${location.name}</div>
              <div style="color: #666; font-size: 13px;">${location.description}</div>
            </div>
          `, {
            closeButton: true,
            autoClose: false
          });
        });

        // Agregar rutas
        const routeCoords = [
          [locations[0].coords, locations[1].coords],
          [locations[1].coords, [13.6833, -89.0333]],
          [[13.6833, -89.0333], locations[4].coords],
          [locations[2].coords, locations[3].coords],
          [locations[3].coords, [13.6833, -89.0333]]
        ];

        routeCoords.forEach(route => {
          window.L.polyline(route, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
          }).addTo(map);
        });

        // Agregar ciudades de referencia
        cities.forEach(city => {
          window.L.circleMarker(city.coords, {
            radius: 4,
            fillColor: '#64748b',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map).bindTooltip(city.name, {
            permanent: false,
            direction: 'top'
          });
        });

        mapInstanceRef.current = map;
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      setZoomLevel(prev => prev + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      setZoomLevel(prev => prev - 1);
    }
  };

  return (
    <>
      <style>
        {`
          .custom-marker {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          }
          
          .custom-marker:hover {
            transform: scale(1.2);
          }
          
          .marker-red {
            background: #dc2626;
          }
          
          .marker-green {
            background: #16a34a;
          }
          
          .marker-blue {
            background: #2563eb;
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
        `}
      </style>
      
      <div className="w-full h-screen bg-gray-800 p-6">
        <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-2 border-gray-300">
          
          {/* Header */}
          <div className="absolute top-8 left-8 z-30 flex items-center space-x-3">
            <div 
              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => window.history.back()}
            >
              <span className="text-sm text-gray-600 font-medium">←</span>
            </div>
            <h1 className="text-xl font-medium text-gray-900">Rutas frecuentes</h1>
          </div>

          {/* Mapa */}
          <div 
            ref={mapRef}
            className="w-full h-full rounded-[2rem]"
            style={{ zIndex: 1 }}
          />

          {/* Tarjeta de información */}
          <div className="absolute bottom-8 left-8 z-30 bg-white rounded-2xl shadow-xl p-5 w-72 border-2 border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Truck className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1 font-medium">Rutas frecuentes</div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">3</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-semibold">35% en este mes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de zoom */}
          <div className="absolute top-24 right-8 z-30 flex flex-col space-y-3">
            <button 
              onClick={handleZoomIn}
              className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-2 border-gray-200 hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-2 border-gray-200 hover:shadow-xl"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ElSalvadorMap;