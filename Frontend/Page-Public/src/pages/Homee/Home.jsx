import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import './Home.css';

const EmpresaPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Estados para el formulario del footer
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  
  const images = [
    '/path/to/image1.jpg',
    '/path/to/image2.jpg',
    '/path/to/image3.jpg',
    '/path/to/image4.jpg',
    '/path/to/image5.jpg',
    '/path/to/image6.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000); // Cambia cada 4 segundos para dar más tiempo a ver las imágenes

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Funciones para el formulario del footer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      // Simulación de envío de correo - aquí conectarías con tu backend/API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, aquí harías la llamada real a tu API:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="empresa-page">
      {/* Sección de carrusel con título */}
      <section className="empresa-intro">
        <div className="carousel-container">
          <div className="carousel-wrapper">
            {/* Imagen izquierda */}
            <div 
              className="carousel-side-image left"
              onClick={() => goToSlide((currentSlide - 1 + images.length) % images.length)}
            >
              <img src={images[(currentSlide - 1 + images.length) % images.length]} alt="Imagen anterior" />
            </div>
            
            {/* Imagen central (principal) */}
            <div className="carousel-main-image">
              <img src={images[currentSlide]} alt="Imagen principal" />
            </div>
            
            {/* Imagen derecha */}
            <div 
              className="carousel-side-image right"
              onClick={() => goToSlide((currentSlide + 1) % images.length)}
            >
              <img src={images[(currentSlide + 1) % images.length]} alt="Imagen siguiente" />
            </div>
            
            {/* Indicadores de puntos */}
            <div className="carousel-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="intro-content">
          <div className="intro-text-section">
            <h2 className="intro-title">
              Conoce un poco de<br />
              nuestra empresa
            </h2>
            <p className="intro-text">
              La empresa ofrece servicios integrales de transporte de carga, distribución y gestión logística a nivel nacional e internacional. Nos enfocamos en ser eficientes y puntuales, adaptándonos a las necesidades de cada cliente, con un equipo profesional y una ética de manufactura que garantizan calidad y confiabilidad en todo lo que hacemos.
            </p>
          </div>
          <div className="intro-image-section">
            <img src="/path/to/intro-image.jpg" alt="Nuestra empresa" />
          </div>
        </div>
      </section>

      {/* Sección del CEO */}
      <section className="ceo-section">
        <div className="ceo-content">
          <div className="ceo-image">
            <img src="/path/to/ceo-image.jpg" alt="CEO Yanira Rivera" />
          </div>
          <div className="ceo-text">
            <h2 className="ceo-title">
              Conoce a nuestra CEO<br />
              de la empresa
            </h2>
            <p className="ceo-description">
              Yanira Rivera es una destacada empresaria salvadoreña, fundadora y directora de Rivera Distribuidora y Transporte, con más de una década de experiencia en logística y transporte de cargas en El Salvador. Su compromiso la ha posicionado como un referente en la industria, gracias a su compromiso con la excelencia y la innovación. Además, ha contribuido significativamente al género en el sector y ha impulsado activamente a otras mujeres a ingresar y prosperar en esta importante industria del país.
            </p>
          </div>
        </div>
        
        <div className="ceo-footer">
          <p className="ceo-footer-text">
            <span className="quote-mark">"</span>
            Conectamos destinos, entregamos confianza.
            <span className="quote-mark">"</span>
          </p>
        </div>
      </section>

      {/* Sección ¿Quiénes somos? */}
      <section className="quienes-somos">
        <div className="quienes-content">
          <div className="quienes-image-section">
            <img src="/path/to/quienes-image.jpg" alt="Quiénes somos" />
          </div>
          <div className="quienes-text-section">
            <h2 className="quienes-title">¿Quiénes somos?</h2>
            <p className="quienes-text">
              Somos una empresa dedicada a brindar servicios de transporte de carga empresarial, distribución y gestión logística a nivel nacional. Nos enfocamos en ofrecer soluciones seguras, eficientes y puntuales, adaptados a las necesidades de cada cliente. Contamos con una flota moderna y una infraestructura sólida que nos permite garantizar la integridad de la mercancía durante todo el proceso de transporte. Operamos en diversas regiones, apoyando al crecimiento de nuestros clientes y contribuyendo al desarrollo económico del país.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER INTEGRADO */}
      <footer 
        className="text-white py-12 px-4 mt-8 font-sans"
        style={{ background: 'linear-gradient(135deg, #4a90a4 0%, #6ba3b7 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Contenido principal del footer */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Información de contacto */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6">Contáctanos</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-100 flex-shrink-0" />
                  <span className="text-base">info@riveratransporte.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-100 flex-shrink-0" />
                  <span className="text-base">+503 2234-5678</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-100 flex-shrink-0" />
                  <span className="text-base">San Salvador, El Salvador</span>
                </div>
              </div>
              
              {/* Redes sociales */}
              <div className="mt-8">
                <h4 className="text-xl font-medium text-white mb-4">Síguenos</h4>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-white mb-6">Envíanos un mensaje</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 rounded-lg bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 border-none focus:outline-none focus:bg-white focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-300"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Tu correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 rounded-lg bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 border-none focus:outline-none focus:bg-white focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-300"
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Asunto"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 border-none focus:outline-none focus:bg-white focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-300"
                />
                <textarea
                  name="message"
                  placeholder="Tu mensaje"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 border-none focus:outline-none focus:bg-white focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-300 resize-y min-h-24"
                ></textarea>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 mt-2 ${
                    isSubmitting 
                      ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                      : 'bg-blue-900 hover:bg-blue-800 hover:-translate-y-1 hover:shadow-lg'
                  }`}
                  style={{
                    background: isSubmitting 
                      ? '#666' 
                      : 'linear-gradient(135deg, #2d5f6f 0%, #4a90a4 100%)'
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>

                {submitStatus === 'success' && (
                  <div className="px-4 py-3 rounded-lg bg-green-500 bg-opacity-20 border border-green-400 border-opacity-40 text-green-100 text-center text-sm mt-2">
                    ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="px-4 py-3 rounded-lg bg-red-500 bg-opacity-20 border border-red-400 border-opacity-40 text-red-100 text-center text-sm mt-2">
                    Error al enviar el mensaje. Por favor, intenta nuevamente.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Frase inspiradora */}
          <div className="text-center py-8 border-t border-b border-white border-opacity-20 mb-8">
            <p 
              className="text-3xl md:text-4xl font-semibold italic m-0 tracking-wide"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
            >
              <span className="text-4xl md:text-5xl font-bold opacity-80 relative top-2">"</span>
              Conectamos destinos, entregamos confianza.
              <span className="text-4xl md:text-5xl font-bold opacity-80 relative top-2">"</span>
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4">
            <p className="text-sm text-white text-opacity-80 m-0">
              © 2025 Rivera Distribuidora y Transporte. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmpresaPage;