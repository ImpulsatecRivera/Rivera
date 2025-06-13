import React, { useState, useEffect } from 'react';
import { Target, Eye, Truck, Leaf, Shield, Users, Award, CheckCircle, MapPin, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import './Mision-Vision.css';
import logo from '../../assets/image.png';

const MisionVision = () => {
  const [activeSection, setActiveSection] = useState('mision');
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1
    });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sectores = [
    { name: "Agroindustrial", icon: <Leaf />, color: "#10b981" },
    { name: "Agrícola", icon: <Target />, color: "#059669" },
    { name: "Ganadero", icon: <Award />, color: "#047857" },
    { name: "Comercial", icon: <Users />, color: "#065f46" }
  ];

  const valores = [
    {
      icon: <Shield />,
      title: "Seguridad",
      description: "Protección total de la carga y bienestar de nuestros trabajadores"
    },
    {
      icon: <Leaf />,
      title: "Sostenibilidad",
      description: "Compromiso con el medio ambiente y desarrollo sostenible"
    },
    {
      icon: <Users />,
      title: "Responsabilidad",
      description: "Enfoque en la responsabilidad social y empresarial"
    },
    {
      icon: <Award />,
      title: "Excelencia",
      description: "Búsqueda constante de la calidad y eficiencia en nuestros servicios"
    }
  ];

  return (
    <div className="mv-mision-vision">
      {/* Hero Section */}
      <section className="mv-hero-mv">
        <div className="mv-hero-content">
          <div className="mv-hero-text">
            <h1 className="mv-hero-title">
              Conoce nuestra <br />
              <span className="mv-highlight">misión y visión</span>
            </h1>
            <p className="mv-hero-subtitle">
              Liderando el futuro del transporte y la logística en El Salvador 
              con compromiso, innovación y sostenibilidad
            </p>
          </div>
          <div className="mv-hero-image">
            <div className="mv-truck-container">
              <img 
                src="/path/to/truck-hero.png" 
                alt="Camión Rivera Transporte" 
                className="mv-truck-img"
              />
              <div className="mv-floating-elements">
                <div className="mv-floating-dot mv-dot-1"></div>
                <div className="mv-floating-dot mv-dot-2"></div>
                <div className="mv-floating-dot mv-dot-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="mv-nav-tabs">
        <div className="mv-container">
          <div className="mv-tabs-container">
            <button 
              className={`mv-tab-button ${activeSection === 'mision' ? 'mv-active' : ''}`}
              onClick={() => setActiveSection('mision')}
            >
              <Target className="mv-tab-icon" />
              Misión
            </button>
            <button 
              className={`mv-tab-button ${activeSection === 'vision' ? 'mv-active' : ''}`}
              onClick={() => setActiveSection('vision')}
            >
              <Eye className="mv-tab-icon" />
              Visión
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="mv-content-sections">
        <div className="mv-container">
          {activeSection === 'mision' && (
            <div className="mv-content-panel mv-mision-panel" data-animate id="mv-mision-content">
              <div className="mv-panel-header">
                <div className="mv-section-badge">
                  <Target className="mv-badge-icon" />
                  <span>Nuestra Misión</span>
                </div>
              </div>
              
              <div className="mv-mission-content">
                <div className="mv-mission-text">
                  <div className="mv-mission-card">
                    <h2 className="mv-section-title">¿Qué nos impulsa cada día?</h2>
                    <p className="mv-mission-description">
                      Somos una empresa de Logística y Transporte de Carga Empresarial, 
                      enfocada en un desarrollo auto sostenible, que marque la diferencia 
                      y sea reconocida a través de su servicio de transporte de carga en 
                      los sectores: Agroindustrial, agrícola, ganadero y comercial.
                    </p>
                    <p className="mv-mission-description">
                      Enfocados en la seguridad y bienestar de sus trabajadores y 
                      protección del medio ambiente.
                    </p>
                    
                    <div className="mv-sectores-grid">
                      {sectores.map((sector, index) => (
                        <div 
                          key={index} 
                          className="mv-sector-item"
                          style={{ '--sector-color': sector.color }}
                        >
                          <div className="mv-sector-icon">
                            {sector.icon}
                          </div>
                          <span className="mv-sector-name">{sector.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mv-mission-visual">
                  <div className="mv-mission-stats">
                    <div className="mv-stat-card">
                      <div className="mv-stat-number">4</div>
                      <div className="mv-stat-label">Sectores</div>
                    </div>
                    <div className="mv-stat-card">
                      <div className="mv-stat-number">100%</div>
                      <div className="mv-stat-label">Sostenible</div>
                    </div>
                  </div>
                  <img 
                    src="/path/to/mission-image.jpg" 
                    alt="Misión Rivera Transporte" 
                    className="mv-mission-img"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'vision' && (
            <div className="mv-content-panel mv-vision-panel" data-animate id="mv-vision-content">
              <div className="mv-panel-header">
                <div className="mv-section-badge mv-vision-badge">
                  <Eye className="mv-badge-icon" />
                  <span>Nuestra Visión</span>
                </div>
              </div>
              
              <div className="mv-vision-content">
                <div className="mv-vision-main">
                  <h2 className="mv-section-title">¿Hacia dónde vamos?</h2>
                  <div className="mv-vision-card">
                    <p className="mv-vision-description">
                      Ser reconocida como una empresa que presta servicios de transporte 
                      de carga empresarial, distribución y administración logística, 
                      responsable, eficiente y eficaz.
                    </p>
                  </div>
                  
                  <div className="mv-vision-features">
                    <div className="mv-feature-item">
                      <CheckCircle className="mv-feature-icon" />
                      <span>Liderazgo en el sector</span>
                    </div>
                    <div className="mv-feature-item">
                      <CheckCircle className="mv-feature-icon" />
                      <span>Servicios eficientes</span>
                    </div>
                    <div className="mv-feature-item">
                      <CheckCircle className="mv-feature-icon" />
                      <span>Responsabilidad empresarial</span>
                    </div>
                    <div className="mv-feature-item">
                      <CheckCircle className="mv-feature-icon" />
                      <span>Distribución eficaz</span>
                    </div>
                  </div>
                </div>
                
                <div className="mv-vision-visual">
                  <div className="mv-vision-circle">
                    <div className="mv-circle-content">
                      <Eye className="mv-vision-icon" />
                      <span className="mv-vision-year">2030</span>
                      <span className="mv-vision-text">Visión</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className="mv-values-section" data-animate id="mv-values-section">
        <div className="mv-container">
          <div className="mv-values-header">
            <h2 className="mv-values-title">Nuestros Valores</h2>
            <p className="mv-values-subtitle">
              Los principios que guían cada una de nuestras acciones
            </p>
          </div>
          
          <div className="mv-values-grid">
            {valores.map((valor, index) => (
              <div key={index} className="mv-value-card">
                <div className="mv-value-icon">
                  {valor.icon}
                </div>
                <h3 className="mv-value-title">{valor.title}</h3>
                <p className="mv-value-description">{valor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="mv-impact-section" data-animate id="mv-impact-section">
        <div className="mv-container">
          <div className="mv-impact-content">
            <div className="mv-impact-text">
              <h2 className="mv-impact-title">Impacto y Compromiso</h2>
              <p className="mv-impact-description">
                Nuestro compromiso va más allá del transporte. Trabajamos cada día 
                para generar un impacto positivo en la sociedad, el medio ambiente 
                y el desarrollo económico de El Salvador.
              </p>
              
              <div className="mv-impact-metrics">
                <div className="mv-metric-item">
                  <div className="mv-metric-number">25+</div>
                  <div className="mv-metric-label">Años de experiencia</div>
                </div>
                <div className="mv-metric-item">
                  <div className="mv-metric-number">500+</div>
                  <div className="mv-metric-label">Empresas atendidas</div>
                </div>
                <div className="mv-metric-item">
                  <div className="mv-metric-number">100%</div>
                  <div className="mv-metric-label">Compromiso ambiental</div>
                </div>
              </div>
            </div>
            
            <div className="mv-impact-visual">
              <img 
                src="/path/to/impact-image.jpg" 
                alt="Impacto Rivera Transporte" 
                className="mv-impact-img"
              />
              <div className="mv-impact-overlay">
                <div className="mv-overlay-content">
                  <Truck className="mv-overlay-icon" />
                  <span className="mv-overlay-text">Conectando El Salvador</span>
                </div>
              </div>
            </div>
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

export default MisionVision;