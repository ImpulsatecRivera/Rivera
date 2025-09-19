import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Truck, Package, Clock, MapPin, Phone, Mail, User, Minimize2 } from 'lucide-react';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy Rivera AI, tu asistente virtual. Estoy aquí para responder tus preguntas sobre nuestros servicios. ¿Qué te gustaría saber?",
      sender: 'bot',
      timestamp: new Date(),
      options: [
        "¿Qué servicios ofrecen?",
        "Horarios de atención", 
        "Zonas de cobertura",
        "Información de contacto"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Respuestas informativas del bot
  const botResponses = {
    "¿qué servicios ofrecen?": {
      text: "Rivera Distribuidora y Transporte ofrece los siguientes servicios:",
      options: [
        "🚛 Transporte Nacional",
        "📦 Logística Integral", 
        "⚡ Entregas Express",
        "🏪 Distribución Comercial"
      ]
    },
    "servicios disponibles": {
      text: "Rivera Distribuidora y Transporte ofrece los siguientes servicios:",
      options: [
        "🚛 Transporte Nacional",
        "📦 Logística Integral", 
        "⚡ Entregas Express",
        "🏪 Distribución Comercial"
      ]
    },
    "horarios de atención": {
      text: "Nuestros horarios de atención son:\n\n📅 Lunes a Viernes: 7:00 AM - 6:00 PM\n📅 Sábados: 8:00 AM - 2:00 PM\n📅 Domingos: Cerrado\n\nPara emergencias, contamos con servicio 24/7 en entregas express.",
      options: ["Información de contacto", "Servicios de emergencia"]
    },
    "zonas de cobertura": {
      text: "Nuestra cobertura incluye:\n\n🗺️ Todo El Salvador\n🗺️ Todas las cabeceras departamentales\n🗺️ Principales municipios\n🗺️ Zonas rurales (consultar disponibilidad)\n\nCobertura especializada en el área metropolitana de San Salvador.",
      options: ["¿Qué servicios ofrecen?", "Información de contacto"]
    },
    "información de contacto": {
      text: "Aquí tienes nuestros datos de contacto:",
      contact: {
        phone: "+503 5478-7541",
        email: "Riveradistribuidoraytransporte@gmail.com",
        address: "San Jacinto, El Salvador"
      }
    },
    "transporte nacional": {
      text: "Nuestro servicio de Transporte Nacional incluye:\n\n• Cobertura completa en El Salvador\n• Flota moderna equipada con GPS\n• Seguro integral para todas las cargas\n• Seguimiento en tiempo real 24/7\n• Personal capacitado y certificado\n• Diferentes tipos de vehículos según la carga",
      options: ["Zonas de cobertura", "Más servicios"]
    },
    "logística integral": {
      text: "Nuestro servicio de Logística Integral incluye:\n\n• Almacenamiento seguro y climatizado\n• Gestión profesional de inventarios\n• Distribución personalizada según necesidades\n• Optimización de rutas y entregas\n• Control de calidad en cada proceso\n• Reportes detallados de movimientos",
      options: ["Horarios de atención", "Más servicios"]
    },
    "entregas express": {
      text: "Nuestro servicio de Entregas Express - Para cuando el tiempo es crítico:\n\n• Entregas el mismo día en área metropolitana\n• Servicio urgente de 2-4 horas\n• Rastreo GPS en tiempo real\n• Confirmación inmediata de entrega\n• Disponible 24/7 para emergencias\n• Personal especializado en entregas rápidas",
      options: ["Horarios de atención", "Más servicios"]
    },
    "distribución comercial": {
      text: "Nuestro servicio de Distribución Comercial especializada incluye:\n\n• Red de distribución a nivel nacional\n• Manejo especializado de inventarios comerciales\n• Entregas programadas según demanda\n• Reportes detallados y análisis de ventas\n• Soporte para empresas de todos los tamaños\n• Gestión de devoluciones y cambios",
      options: ["Zonas de cobertura", "Más servicios"]
    },
    "más servicios": {
      text: "¿Te interesa conocer más detalles sobre algún servicio específico?",
      options: [
        "🚛 Transporte Nacional",
        "📦 Logística Integral", 
        "⚡ Entregas Express",
        "🏪 Distribución Comercial"
      ]
    },
    "servicios de emergencia": {
      text: "Nuestros servicios de emergencia incluyen:\n\n🚨 Entregas urgentes 24/7\n🚨 Transporte de medicamentos\n🚨 Distribución de emergencia\n🚨 Logística para situaciones críticas\n\nPara emergencias, llama directamente al +503 5478-7541",
      contact: true
    }
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const response = generateBotResponse(message.toLowerCase());
      const botMessage = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        options: response.options,
        contact: response.contact
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (message) => {
    // Normalizar mensaje para búsqueda
    const normalizedMessage = message.toLowerCase().trim();
    
    // Buscar palabras clave en el mensaje con mejor matching
    for (const [key, response] of Object.entries(botResponses)) {
      const normalizedKey = key.toLowerCase();
      
      // Coincidencia exacta o parcial
      if (normalizedMessage.includes(normalizedKey) || 
          normalizedKey.includes(normalizedMessage) ||
          // Buscar palabras individuales
          normalizedKey.split(' ').some(word => normalizedMessage.includes(word))) {
        return response;
      }
    }

    // Respuestas específicas basadas en palabras clave informativas
    if (normalizedMessage.includes('precio') || normalizedMessage.includes('costo') || normalizedMessage.includes('tarifa')) {
      return {
        text: "Los precios varían según el tipo de servicio, destino y características de la carga. Para obtener información específica de tarifas, puedes contactarnos directamente.",
        options: ["Información de contacto", "¿Qué servicios ofrecen?"]
      };
    }

    if (normalizedMessage.includes('tiempo') || normalizedMessage.includes('demora') || normalizedMessage.includes('cuanto tarda')) {
      return {
        text: "Los tiempos de entrega dependen del tipo de servicio y destino:\n\n• Transporte Nacional: 1-2 días hábiles\n• Entregas Express: Mismo día (área metropolitana)\n• Logística Integral: Según programación acordada\n• Distribución Comercial: Rutas programadas",
        options: ["Zonas de cobertura", "Entregas express"]
      };
    }

    if (normalizedMessage.includes('seguro') || normalizedMessage.includes('seguridad') || normalizedMessage.includes('garantía')) {
      return {
        text: "Todos nuestros servicios incluyen:\n\n• Seguro integral para las cargas\n• Rastreo GPS en tiempo real 24/7\n• Protocolos de seguridad certificados\n• Personal capacitado y verificado\n• Garantía de entrega con confirmación\n• Manejo especializado según tipo de carga",
        options: ["¿Qué servicios ofrecen?", "Información de contacto"]
      };
    }

    if (normalizedMessage.includes('horario') || normalizedMessage.includes('hora') || normalizedMessage.includes('atienden')) {
      return botResponses["horarios de atención"];
    }

    if (normalizedMessage.includes('donde') || normalizedMessage.includes('ubicación') || normalizedMessage.includes('dirección')) {
      return {
        text: "Nuestra oficina principal está ubicada en San Jacinto, El Salvador. Ofrecemos servicios de recogida y entrega en todo el país.",
        contact: {
          phone: "+503 5478-7541",
          email: "Riveradistribuidoraytransporte@gmail.com",
          address: "San Jacinto, El Salvador"
        },
        options: ["Zonas de cobertura"]
      };
    }

    if (normalizedMessage.includes('gracias') || normalizedMessage.includes('ok') || normalizedMessage.includes('perfecto')) {
      return {
        text: "¡De nada! Me alegra poder ayudarte con la información. ¿Hay algo más sobre nuestros servicios que te gustaría saber?",
        options: [
          "¿Qué servicios ofrecen?",
          "Horarios de atención",
          "Información de contacto"
        ]
      };
    }

    // Respuesta por defecto informativa
    return {
      text: "Estoy aquí para brindarte información sobre Rivera Distribuidora y Transporte. ¿Sobre qué aspecto de nuestros servicios te gustaría conocer más?",
      options: [
        "¿Qué servicios ofrecen?",
        "Horarios de atención",
        "Zonas de cobertura",
        "Información de contacto"
      ]
    };
  };

  return (
    <>
      {/* Botón flotante */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#4a90a4] to-[#10b981] text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          
          {/* Indicador de notificación */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            1
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ¿Necesitas información?
            <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </button>
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} ${isMinimized ? 'h-14' : 'h-[32rem]'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4a90a4] to-[#10b981] text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rivera AI</h3>
              <p className="text-xs opacity-90">Asistente Informativo</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-[#4a90a4]' : 'bg-gray-300'}`}>
                      {message.sender === 'user' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <Truck className="w-4 h-4 text-gray-600" />
                      }
                    </div>
                    
                    <div className={`p-3 rounded-xl ${message.sender === 'user' ? 'bg-[#4a90a4] text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      
                      {/* Options */}
                      {message.options && (
                        <div className="mt-3 space-y-2">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(option)}
                              className="block w-full text-left p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      {message.contact && typeof message.contact === 'object' && (
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{message.contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span className="break-all">{message.contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{message.contact.address}</span>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  placeholder="Pregúntame sobre nuestros servicios..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-sm text-gray-800"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isTyping || !inputMessage.trim()}
                  className="bg-[#10b981] text-white p-2 rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default VirtualAssistant;