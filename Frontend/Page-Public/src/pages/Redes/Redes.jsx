import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Share2, Heart, Users, TrendingUp, Eye, MessageCircle, ThumbsUp, MapPin, Mail, Phone } from 'lucide-react';
import './Redes.css';
import logo from '../../assets/image.png';

const RedesSociales = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [followers, setFollowers] = useState({
    facebook: 0,
    x: 0,
    instagram: 0,
    tiktok: 0
  });

  useEffect(() => {
    // Animación de contador
    const targetFollowers = {
      facebook: 2500,
      x: 850,
      instagram: 3200,
      tiktok: 1900
    };

    Object.keys(targetFollowers).forEach(platform => {
      let current = 0;
      const increment = targetFollowers[platform] / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetFollowers[platform]) {
          current = targetFollowers[platform];
          clearInterval(timer);
        }
        setFollowers(prev => ({
          ...prev,
          [platform]: Math.floor(current)
        }));
      }, 20);
    });
  }, []);

  const socialNetworks = [
    {
      id: 'facebook',
      name: 'Facebook',
      username: 'Rivera Distribuidora y transporte',
      description: 'Mantente al día con nuestras últimas noticias, servicios y logros empresariales.',
      url: 'https://www.facebook.com/riveradistribuidoraytransporte/',
      color: '#1877F2',
      icon: <Facebook />,
      bgGradient: 'linear-gradient(135deg, #1877F2, #42A5F5)',
      features: ['Noticias diarias', 'Fotos de servicios', 'Testimonios', 'Eventos'],
      engagement: '85% engagement rate'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      username: 'Rivera Distribuidora y transporte',
      description: 'Descubre el lado visual de nuestro trabajo con fotos y videos de nuestros servicios.',
      url: 'https://www.instagram.com/transporte.rivera/',
      color: '#E4405F',
      icon: <Instagram />,
      bgGradient: 'linear-gradient(135deg, #E4405F, #F56040, #FFDC80)',
      features: ['Stories diarias', 'Reels de servicios', 'Behind the scenes', 'Galería visual'],
      engagement: '92% engagement rate'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      username: 'Rivera Distribuidora y transporte',
      description: 'Contenido dinámico y entretenido sobre el mundo del transporte y la logística.',
      url: 'https://www.tiktok.com/@riveradistribuido?_t=ZM-8xB2Hm41EZE&_r=1',
      color: '#000000',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
        </svg>
      ),
      bgGradient: 'linear-gradient(135deg, #000000, #ff0050)',
      features: ['Videos cortos', 'Tendencias', 'Contenido viral', 'Educativo y divertido'],
      engagement: '95% engagement rate'
    }
  ];

  const socialStats = [
    { icon: <Users />, label: 'Total Seguidores', value: '8.5K+', color: '#4a90a4' },
    { icon: <Heart />, label: 'Total Likes', value: '45K+', color: '#ef4444' },
    { icon: <Share2 />, label: 'Shares Mensuales', value: '1.2K+', color: '#10b981' },
    { icon: <Eye />, label: 'Visualizaciones', value: '125K+', color: '#f59e0b' }
  ];

  return (
    <div className="redes-sociales">
      {/* Hero Section */}
      <section className="hero-redes">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Síguenos en nuestras <br />
              <span className="gradient-text">redes sociales</span>
            </h1>
            <p className="hero-subtitle">
              Mantente conectado con Rivera Distribuidora y Transporte. 
              Descubre contenido exclusivo, noticias y actualizaciones en tiempo real.
            </p>
          </div>
          
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="social-preview">
                  <div className="preview-header">
                    <div className="profile-pic"></div>
                    <div className="profile-info">
                      <h4>Rivera Transporte</h4>
                      <p>@rivera_transporte</p>
                    </div>
                  </div>
                  <div className="preview-content">
                    <p>🚛 Conectando destinos, entregamos confianza</p>
                    <div className="preview-image"></div>
                    <div className="preview-actions">
                      <Heart className="action-icon" />
                      <MessageCircle className="action-icon" />
                      <Share2 className="action-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Stats */}
      <section className="social-stats">
        <div className="container">
          <div className="stats-grid">
            {socialStats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ '--stat-color': stat.color }}>
                <div className="stat-icon">
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Networks Grid */}
      <section className="social-networks">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nuestras Plataformas</h2>
            <p className="section-subtitle">
              Cada plataforma ofrece contenido único y experiencias especiales
            </p>
          </div>
          
          <div className="networks-grid">
            {socialNetworks.map((network) => (
              <div 
                key={network.id}
                className={`network-card ${hoveredCard === network.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(network.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ '--network-color': network.color }}
              >
                <div className="card-background" style={{ background: network.bgGradient }}></div>
                
                <div className="card-header">
                  <div className="network-icon">
                    {network.icon}
                  </div>
                  <div className="network-info">
                    <h3 className="network-name">{network.name}</h3>
                    <p className="network-username">{network.username}</p>
                  </div>
                  <div className="followers-count">
                    <span className="count-number">{followers[network.id].toLocaleString()}</span>
                    <span className="count-label">seguidores</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <p className="network-description">{network.description}</p>
                  
                  <div className="network-features">
                    {network.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="engagement-rate">
                    <TrendingUp className="engagement-icon" />
                    <span>{network.engagement}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <a 
                    href={network.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="follow-button"
                  >
                    <span>Seguir en {network.name}</span>
                    <Share2 className="follow-icon" />
                  </a>
                </div>
                
                <div className="card-overlay"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Preview */}
      <section className="content-preview">
        <div className="container">
          <div className="preview-header">
            <h2 className="preview-title">Contenido Reciente</h2>
            <p className="preview-subtitle">
              Echa un vistazo a nuestras últimas publicaciones
            </p>
          </div>
          
          <div className="content-grid">
            <div className="content-item facebook-content" onClick={() => window.open('https://www.facebook.com/riveradistribuidoraytransporte/', '_blank')}>
              <div className="content-platform">
                <Facebook className="platform-icon" />
                <span>Facebook</span>
              </div>
              <div className="content-text">
                "🚛 Servicios de transporte de carga a nivel nacional. Nos caracterizamos por la puntualidad y seguridad en cada entrega. ¡Confía en nosotros para tus necesidades de logística! #RiveraTransporte #CargaNacional #TransporteSeguro"
              </div>
              <div className="content-stats">
                <span><ThumbsUp className="stat-icon" /> 28</span>
                <span><MessageCircle className="stat-icon" /> 12</span>
                <span><Share2 className="stat-icon" /> 5</span>
              </div>
            </div>
            
            <div className="content-item instagram-content" onClick={() => window.open('https://www.instagram.com/transporte.rivera/', '_blank')}>
              <div className="content-platform">
                <Instagram className="platform-icon" />
                <span>Instagram</span>
              </div>
              <div className="content-image">
                <div className="image-placeholder">📸</div>
              </div>
              <div className="content-text">
                "Nuestra flota lista para un nuevo día de trabajo. Comprometidos con brindar el mejor servicio de transporte 💪🚛 #EquipoRivera #TransporteConfiable"
              </div>
              <div className="content-stats">
                <span><Heart className="stat-icon" /> 45</span>
                <span><MessageCircle className="stat-icon" /> 8</span>
              </div>
            </div>
            
            <div className="content-item tiktok-content" onClick={() => window.open('https://www.tiktok.com/@riveradistribuido?_t=ZM-8xB2Hm41EZE&_r=1', '_blank')}>
              <div className="content-platform">
                <svg viewBox="0 0 24 24" fill="currentColor" className="platform-icon">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
                </svg>
                <span>TikTok</span>
              </div>
              <div className="content-video">
                <div className="video-placeholder">▶️</div>
                <span className="video-duration">0:24</span>
              </div>
              <div className="content-text">
                "Un día en la vida de nuestros conductores 🚛✨ Desde el amanecer trabajando para ustedes #DiaEnLaVida #ConductorProfesional #RiveraEnMovimiento"
              </div>
              <div className="content-stats">
                <span><Heart className="stat-icon" /> 189</span>
                <span><Share2 className="stat-icon" /> 23</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-social">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">¡Únete a nuestra comunidad!</h2>
            <p className="cta-description">
              Sé parte de la familia Rivera y mantente informado sobre todas nuestras novedades
            </p>
            <div className="cta-buttons">
              <a href="https://www.facebook.com/riveradistribuidoraytransporte/" target="_blank" rel="noopener noreferrer" className="cta-social-btn facebook">
                <Facebook />
                <span>Facebook</span>
              </a>
              <a href="https://www.instagram.com/transporte.rivera/" target="_blank" rel="noopener noreferrer" className="cta-social-btn instagram">
                <Instagram />
                <span>Instagram</span>
              </a>
              <a href="https://www.tiktok.com/@riveradistribuido?_t=ZM-8xB2Hm41EZE&_r=1" target="_blank" rel="noopener noreferrer" className="cta-social-btn tiktok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
                </svg>
                <span>TikTok</span>
              </a>
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
                      Que hacen
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

export default RedesSociales;