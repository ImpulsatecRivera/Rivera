import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Calendar, Award, Users, TrendingUp, Building } from 'lucide-react';
import './Ficha.css';
import logo from '../../assets/image.png';
import Ceo from "../../Images/Imagen4.jpg";
import Equipo from "../../Images/Imagen1.jpg";
import Imagen11 from "../../Images/Images11.jpg"
import Imagen13 from "../../Images/Imagen13.jpg"

const FichaHistorica = () => {
  return (
    <div className="ficha-historica-page">
      {/* Hero Section */}
      <section className="ficha-hero-section">
        <div className="ficha-hero-overlay">
          <div className="ficha-hero-content">
            <h1 className="ficha-hero-title">Ficha histórica</h1>
            <div className="ficha-hero-subtitle">
              <Calendar className="ficha-calendar-icon" />
              <span>Más de 25 años construyendo el futuro del transporte</span>
            </div>
          </div>
        </div>
        <img 
          src={Equipo}
          alt="Historia de Rivera Transporte" 
          className="ficha-hero-image"
        />
      </section>

      {/* Main Content */}
      <section className="ficha-content-section">
        <div className="ficha-container">
          
          {/* Introducción con imagen */}
          <div className="ficha-intro-section">
            <div className="ficha-intro-text">
              <h2 className="ficha-section-title">Nuestra historia</h2>
              <p className="ficha-intro-paragraph">
                Rivera Distribuidora y Transporte es una empresa salvadoreña con más de 25 años de experiencia en 
                el sector logístico y de transporte de carga. Fundada y liderada por Yanira Rivera, la compañía 
                ha sido pionera en promover la igualdad de género en un sector tradicionalmente dominado por 
                hombres. Su enfoque innovador y su compromiso con la excelencia han transformado el panorama 
                del transporte en El Salvador.
              </p>
            </div>
            <div className="ficha-intro-image">
              <img 
                src={Ceo}
                alt="Yanira Rivera - Fundadora" 
                className="ficha-founder-image"
              />
              <div className="ficha-image-caption">
                <strong>Yanira Rivera</strong><br />
                Fundadora y CEO
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="ficha-timeline-section">
            <h2 className="ficha-section-title ficha-centered">Nuestro camino</h2>
            <div className="ficha-timeline">
              <div className="ficha-timeline-item">
                <div className="ficha-timeline-marker">
                  <Building className="ficha-timeline-icon" />
                </div>
                <div className="ficha-timeline-content">
                  <h3>1999 - Fundación</h3>
                  <p>Inicio de Rivera Distribuidora y Transporte con una visión innovadora en el sector logístico.</p>
                </div>
              </div>
              
              <div className="ficha-timeline-item">
                <div className="ficha-timeline-marker">
                  <Users className="ficha-timeline-icon" />
                </div>
                <div className="ficha-timeline-content">
                  <h3>2005 - Expansión del equipo</h3>
                  <p>Crecimiento significativo del equipo y promoción de la igualdad de género en la industria.</p>
                </div>
              </div>
              
              <div className="ficha-timeline-item">
                <div className="ficha-timeline-marker">
                  <TrendingUp className="ficha-timeline-icon" />
                </div>
                <div className="ficha-timeline-content">
                  <h3>2015 - Innovación digital</h3>
                  <p>Implementación de tecnologías avanzadas y presencia en redes sociales.</p>
                </div>
              </div>
              
              <div className="ficha-timeline-item">
                <div className="ficha-timeline-marker">
                  <Award className="ficha-timeline-icon" />
                </div>
                <div className="ficha-timeline-content">
                  <h3>2024 - Reconocimiento</h3>
                  <p>Liderazgo reconocido en el desarrollo empresarial y apoyo a MYPEs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="ficha-achievements-section">
            <h2 className="ficha-section-title ficha-centered">Logros destacados</h2>
            <div className="ficha-achievements-grid">
              <div className="ficha-achievement-card">
                <div className="ficha-achievement-icon">
                  <Calendar />
                </div>
                <h3>+25 años</h3>
                <p>De experiencia en el sector logístico</p>
              </div>
              
              <div className="ficha-achievement-card">
                <div className="ficha-achievement-icon">
                  <Users />
                </div>
                <h3>Pioneros</h3>
                <p>En igualdad de género en transporte</p>
              </div>
              
              <div className="ficha-achievement-card">
                <div className="ficha-achievement-icon">
                  <TrendingUp />
                </div>
                <h3>Innovación</h3>
                <p>Líderes en tecnología logística</p>
              </div>
              
              <div className="ficha-achievement-card">
                <div className="ficha-achievement-icon">
                  <MapPin />
                </div>
                <h3>El Salvador</h3>
                <p>Transformando el panorama nacional</p>
              </div>
            </div>
          </div>

          {/* Detailed History */}
          <div className="ficha-history-detail">
            <div className="ficha-history-content">
              <div className="ficha-history-text">
                <h2 className="ficha-section-title">Trayectoria y evolución</h2>
                <div className="ficha-history-paragraphs">
                  <p>
                    A lo largo de su trayectoria, Rivera Distribuidora y Transporte ha destacado por su visión empresarial 
                    y su capacidad para adaptarse a las necesidades del mercado. La empresa ha compartido su historia 
                    y logros a través de diversas plataformas, incluyendo redes sociales como Facebook e Instagram, 
                    donde celebra sus hitos y reafirma su compromiso con la innovación y el empoderamiento femenino 
                    en la industria logística.
                  </p>
                  
                  <p>
                    Además, Yanira Rivera ha sido reconocida por su liderazgo y contribución al desarrollo empresarial 
                    en El Salvador, participando en iniciativas que apoyan a las micro y pequeñas empresas (MYPE) y 
                    promoviendo el crecimiento del sector logístico en la región.
                  </p>
                </div>
              </div>
              
              <div className="ficha-history-images">
                <img 
                  src={Imagen11}
                  alt="Evolución de la empresa" 
                  className="ficha-history-img"
                />
              </div>
            </div>
          </div>

          {/* Impact Section */}
          <div className="ficha-impact-section">
            <div className="ficha-impact-content">
              <h2 className="ficha-section-title">Nuestro impacto</h2>
              <div className="ficha-impact-grid">
                <div className="ficha-impact-item">
                  <div className="ficha-impact-number">24+</div>
                  <div className="ficha-impact-label">Años de experiencia</div>
                </div>
                <div className="ficha-impact-item">
                  <div className="ficha-impact-number">100%</div>
                  <div className="ficha-impact-label">Compromiso con la excelencia</div>
                </div>
                <div className="ficha-impact-item">
                  <div className="ficha-impact-number">∞</div>
                  <div className="ficha-impact-label">Apoyo a emprendedoras</div>
                </div>
              </div>
            </div>
            <div className="ficha-impact-image">
              <img 
                src={Imagen13}
                alt="Impacto de Rivera Transporte" 
                className="ficha-impact-img"
              />
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

export default FichaHistorica;