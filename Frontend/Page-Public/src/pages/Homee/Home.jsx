import React, { useState, useEffect } from 'react';
import './Home.css';

const EmpresaPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
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
    </div>
  );
};

export default EmpresaPage;