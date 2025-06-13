import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12 px-4 mt-8 font-sans border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          
          {/* Columna 1: Logo e Información */}
          <div className="space-y-6">
            <div className="mb-6">
              <img 
                src="/path/to/rivera-logo.png" 
                alt="Rivera Distribuidora y Transporte" 
                className="h-16 w-auto mb-4"
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
                    Para mayor información descarga nuestra app y haz tus cotizaciones play.google.com/store/ apps/details?
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
                href="https://facebook.com/tu-pagina-facebook" // Reemplaza con tu link
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              
              <a 
                href="https://x.com/tu-usuario-x" // Reemplaza con tu link de X
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                aria-label="X (Twitter)"
              >
                {/* Icono de X */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              <a 
                href="https://instagram.com/tu-usuario-instagram" // Reemplaza con tu link
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              
              <a 
                href="https://tiktok.com/@tu-usuario-tiktok" // Reemplaza con tu link
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
  );
};

export default Footer;