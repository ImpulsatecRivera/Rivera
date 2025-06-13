import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

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
  );
};

export default Footer;