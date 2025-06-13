import React, { useState } from 'react';
import { Truck, Package, Clock, Shield, Users, MapPin, Mail, Phone, Facebook, Instagram, ChevronRight, Play, CheckCircle2, Star, ArrowRight, Target, Zap, Heart } from 'lucide-react';
import './Dedicacion.css';
import logo from '../../assets/image.png';

const QueHacemosV2 = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);

  const services = [
    {
      id: 1,
      title: "Transporte Nacional",
      description: "Cobertura completa en todo El Salvador con la mejor flota del país",
      icon: <Truck />,
      features: ["Flota moderna", "GPS tracking", "Seguro total", "24/7 disponible"],
      color: "#4a90a4"
    },
    {
      id: 2,
      title: "Logística Integral",
      description: "Soluciones end-to-end para optimizar toda su cadena de suministro",
      icon: <Package />,
      features: ["Almacenamiento", "Distribución", "Inventario", "Análisis"],
      color: "#6ba3b7"
    },
    {
      id: 3,
      title: "Entregas Express",
      description: "Servicio de entrega urgente para cuando el tiempo es crítico",
      icon: <Clock />,
      features: ["Mismo día", "2-4 horas", "Rastreo live", "Confirmación"],
      color: "#2d5f6f"
    }
  ];

  const tabs = [
    { title: "Nuestra Historia", content: "historia" },
    { title: "Servicios", content: "servicios" },
    { title: "Proceso", content: "proceso" },
    { title: "Ventajas", content: "ventajas" }
  ];

  return (
    <div className="dedicacion-que-hacemos-v2">
      {/* Floating Hero */}
      <section className="dedicacion-floating-hero">
        <div className="dedicacion-hero-container">
          <div className="dedicacion-floating-card">
            <div className="dedicacion-card-header">
              <div className="dedicacion-pulse-dot"></div>
              <span className="dedicacion-status-text">En operación 24/7</span>
            </div>
            <h1 className="dedicacion-floating-title">¿Qué hacemos?</h1>
            <p className="dedicacion-floating-subtitle">
              Revolucionamos el transporte y la logística con tecnología de vanguardia 
              y un compromiso inquebrantable con la excelencia
            </p>
          </div>
          
          <div className="dedicacion-hero-stats-grid">
            <div className="dedicacion-stat-bubble">
              <div className="dedicacion-stat-icon">
                <Target />
              </div>
              <div className="dedicacion-stat-info">
                <span className="dedicacion-stat-number">24+</span>
                <span className="dedicacion-stat-label">Años</span>
              </div>
            </div>
            <div className="dedicacion-stat-bubble">
              <div className="dedicacion-stat-icon">
                <Zap />
              </div>
              <div className="dedicacion-stat-info">
                <span className="dedicacion-stat-number">100%</span>
                <span className="dedicacion-stat-label">Puntual</span>
              </div>
            </div>
            <div className="dedicacion-stat-bubble">
              <div className="dedicacion-stat-icon">
                <Heart />
              </div>
              <div className="dedicacion-stat-info">
                <span className="dedicacion-stat-number">∞</span>
                <span className="dedicacion-stat-label">Confianza</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs */}
      <section className="dedicacion-interactive-tabs">
        <div className="dedicacion-container">
          <div className="dedicacion-tabs-header">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`dedicacion-tab-btn ${activeTab === index ? 'dedicacion-active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
                <div className="dedicacion-tab-indicator"></div>
              </button>
            ))}
          </div>

          <div className="dedicacion-tab-content">
            {activeTab === 0 && (
              <div className="dedicacion-content-panel dedicacion-historia">
                <div className="dedicacion-timeline-modern">
                  <div className="dedicacion-timeline-item">
                    <div className="dedicacion-timeline-year">2000</div>
                    <div className="dedicacion-timeline-content">
                      <h3>El Comienzo</h3>
                      <p>Iniciamos prestando servicios a una empresa familiar, con la visión de crecer y expandirnos.</p>
                    </div>
                  </div>
                  <div className="dedicacion-timeline-item">
                    <div className="dedicacion-timeline-year">2010</div>
                    <div className="dedicacion-timeline-content">
                      <h3>Expansión</h3>
                      <p>Diversificamos servicios y encontramos nuevos aliados estratégicos para nuestro crecimiento.</p>
                    </div>
                  </div>
                  <div className="dedicacion-timeline-item">
                    <div className="dedicacion-timeline-year">2024</div>
                    <div className="dedicacion-timeline-content">
                      <h3>Liderazgo</h3>
                      <p>24 años después, seguimos conectando el éxito, un viaje a la vez, con total seguridad.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="dedicacion-content-panel dedicacion-servicios">
                <div className="dedicacion-services-cards">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`dedicacion-service-card-v2 ${expandedCard === service.id ? 'dedicacion-expanded' : ''}`}
                      onClick={() => setExpandedCard(expandedCard === service.id ? null : service.id)}
                      style={{ '--accent-color': service.color }}
                    >
                      <div className="dedicacion-card-front">
                        <div className="dedicacion-service-icon-v2">
                          {service.icon}
                        </div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <div className="dedicacion-expand-hint">
                          <ChevronRight className="dedicacion-chevron" />
                        </div>
                      </div>
                      {expandedCard === service.id && (
                        <div className="dedicacion-card-back">
                          <h4>Características:</h4>
                          <ul>
                            {service.features.map((feature, idx) => (
                              <li key={idx}>
                                <CheckCircle2 className="dedicacion-check-icon" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="dedicacion-content-panel dedicacion-proceso">
                <div className="dedicacion-process-flow">
                  <div className="dedicacion-flow-step">
                    <div className="dedicacion-step-circle">1</div>
                    <h3>Consulta</h3>
                    <p>Analizamos tus necesidades específicas</p>
                  </div>
                  <div className="dedicacion-flow-arrow">→</div>
                  <div className="dedicacion-flow-step">
                    <div className="dedicacion-step-circle">2</div>
                    <h3>Planificación</h3>
                    <p>Diseñamos la solución óptima</p>
                  </div>
                  <div className="dedicacion-flow-arrow">→</div>
                  <div className="dedicacion-flow-step">
                    <div className="dedicacion-step-circle">3</div>
                    <h3>Ejecución</h3>
                    <p>Implementamos con monitoreo 24/7</p>
                  </div>
                  <div className="dedicacion-flow-arrow">→</div>
                  <div className="dedicacion-flow-step">
                    <div className="dedicacion-step-circle">4</div>
                    <h3>Entrega</h3>
                    <p>Confirmamos resultados exitosos</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="dedicacion-content-panel dedicacion-ventajas">
                <div className="dedicacion-advantages-grid">
                  <div className="dedicacion-advantage-item">
                    <div className="dedicacion-advantage-icon">
                      <Star />
                    </div>
                    <h3>Experiencia Comprobada</h3>
                    <p>Más de 24 años liderando el sector con resultados excepcionales</p>
                  </div>
                  <div className="dedicacion-advantage-item">
                    <div className="dedicacion-advantage-icon">
                      <Shield />
                    </div>
                    <h3>Seguridad Total</h3>
                    <p>Protocolos de seguridad certificados y seguros integrales</p>
                  </div>
                  <div className="dedicacion-advantage-item">
                    <div className="dedicacion-advantage-icon">
                      <Users />
                    </div>
                    <h3>Equipo Especializado</h3>
                    <p>Profesionales capacitados y comprometidos con la excelencia</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Magnetic CTA */}
      <section className="dedicacion-magnetic-cta">
        <div className="dedicacion-cta-container">
          <div className="dedicacion-magnetic-element">
            <h2>¿Listo para transformar tu logística?</h2>
            <p>Únete a cientos de empresas que ya confían en nosotros</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-gray-800 py-12 px-4 mt-8 font-sans border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            
            {/* Columna 1: Logo e Información */}
            <div className="space-y-6">
              <div className="mb-6">
                <img 
                  src={logo}
                  alt="Rivera Distribuidora y Transporte" 
                  className="h-24 w-auto mb-4"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="/quienes-somos" className="hover:text-teal-600 transition-colors">
                      Quienes somos
                    </a>
                  </li>
                  <li>
                    <a href="/que-hacen" className="hover:text-teal-600 transition-colors">
                      Nuestra Dedicación
                    </a>
                  </li>
                  <li>
                    <a href="/mision-vision" className="hover:text-teal-600 transition-colors">
                      Misión y visión
                    </a>
                  </li>
                  <li>
                    <a href="/redes-sociales" className="hover:text-teal-600 transition-colors">
                      Nuestras redes sociales
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna 2: Contáctanos */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contáctanos</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Puedes encontrarnos en San Jacinto 
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">+503 5478-7541</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Riveradistribuidoraytransporte@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Columna 3: Redes Sociales */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuestras redes sociales</h3>
              
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/riveradistribuidoraytransporte/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                
                <a 
                  href="https://www.instagram.com/transporte.rivera/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                
                <a 
                  href="https://www.tiktok.com/@riveradistribuido?_t=ZM-8xB2Hm41EZE&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Rivera Distribuidora y Transporte © 2000-2025, All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QueHacemosV2;