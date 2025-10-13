import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

// Importación de páginas
import Home from './pages/Homee/Home'
import Ficha from './pages/Ficha/Ficha'
import Dedicacion from './pages/Dedicacion/Dedicacion'
import MisionVision from './pages/Mision-Vision/Mision-Vision'
import RedesSociales from './pages/Redes/Redes'

// Importación del asistente virtual
import VirtualAssistant from './pages/asistente/VirtualAssistant'

// Importación de componentes
import Navegation from './components/Navegation'

// Importación de tu animación Lottie
// Ajusta la ruta según donde tengas tu archivo JSON
import tuAnimacionLottie from './assets/Toggle dark mode light mode themes (1).json' // <-- CAMBIA ESTA RUTA

// Importación de estilos
import './App.css'

function App() {
  const [showLottie, setShowLottie] = useState(true)

  // Opcional: Ocultar el Lottie después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLottie(false)
    }, 5000) // Se oculta después de 5 segundos (puedes cambiar o quitar esto)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="App">
      {/* Tu animación Lottie */}
      {showLottie && (
        <div className="lottie-container">
          <Lottie 
            animationData={tuAnimacionLottie}
            loop={true}
            autoplay={true}
          />
        </div>
      )}

      <Router>
        <Navegation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Ficha" element={<Ficha />} />
            <Route path="/Dedicacion" element={<Dedicacion />} />
            <Route path="/mision-vision" element={<MisionVision />} />
            <Route path="/redes-sociales" element={<RedesSociales />} />
          </Routes>
        </main>
        <VirtualAssistant />
      </Router>
    </div>
  )
}

export default App