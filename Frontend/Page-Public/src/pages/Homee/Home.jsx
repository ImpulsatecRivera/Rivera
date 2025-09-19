import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import './Home.css';
import logo from '../../assets/image.png';
import Equipo from "../../Images/Imagen1.jpg";
import Nosotros from "../../Images/Imagen2.jpg";
import Equipo3 from "../../Images/Imagen12.jpg";
import Equipo4 from "../../Images/imagen15.jpg";
import Equipo5 from "../../Images/imagen16.jpg";
import Equipo7 from "../../Images/Imagen18.jpg";
import Ceo from "../../Images/Imagen4.jpg";
import Conoce from "../../Images/imagen14.jpg";


const Home = () => {
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
    Equipo,
    Equipo3,
    Equipo4,
    Equipo5,
    Equipo7
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
              La empresa ofrecer servicios integral de transportes de carga, distribuciów y gestión logística a nivel nacional e internacional. Nos enfocamos en ser eficientes y puntuales, adaptándonos a las necesidades de cada cliente, con un equipo profesional y una ética de manufactura que garantizan calidad y confiabilidad en todo lo que hacemos.
            </p>
          </div>
          <div className="intro-image-section">
            <img src={Conoce} alt="Nuestra empresa" />
          </div>
        </div>
      </section>

      {/* Sección del CEO */}
      <section className="ceo-section">
        <div className="ceo-content">
          <div className="ceo-image">
            <img src={Ceo} alt="CEO Yanira Rivera" />
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
            <img src={Nosotros} alt="Quiénes somos" />
          </div>
          <div className="quienes-text-section">
            <h2 className="quienes-title">¿Quiénes somos?</h2>
            <p className="quienes-text">
              Somos una empresa dedicada a brindar servicios de transporte de carga empresarial, distribución y gestión logística a nivel nacional. Nos enfocamos en ofrecer soluciones seguras, eficientes y puntuales, adaptados a las necesidades de cada cliente. Contamos con una flota moderna y una infraestructura sólida que nos permite garantizar la integridad de la mercancía durante todo el proceso de transporte. Operamos en diversas regiones, apoyando al crecimiento de nuestros clientes y contribuyendo al desarrollo económico del país.
            </p>
          </div>
        </div>
      </section>

      {/* NUEVO FOOTER - IDÉNTICO A LA IMAGEN */}
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
                    <a href="/" className="hover:text-teal-600 transition-colors">
                      Quienes somos
                    </a>
                  </li>
                  <li>
                    <a href="/Dedicacion" className="hover:text-teal-600 transition-colors">
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
                  href="https://www.facebook.com/riveradistribuidoraytransporte/" // Reemplaza con tu link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                
                <a 
                  href="https://www.instagram.com/transporte.rivera/" // Reemplaza con tu link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                
                <a 
                  href="https://www.tiktok.com/@riveradistribuido?_t=ZM-8xB2Hm41EZE&_r=1" // Reemplaza con tu link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                  aria-label="TikTok"
                >
                  {/* Icono de TikTok */}
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

export default Home;