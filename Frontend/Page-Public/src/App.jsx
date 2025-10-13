import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// Importación de páginas
import Home from './pages/Homee/Home'
import Ficha from './pages/Ficha/Ficha'
import Dedicacion from './pages/Dedicacion/Dedicacion'
import MisionVision from './pages/Mision-Vision/Mision-Vision'
import RedesSociales from './pages/Redes/Redes'

// Importación del asistente virtual (ruta corregida)
import VirtualAssistant from './pages/asistente/VirtualAssistant'

// Importación de componentes
import Navegation from './components/Navegation'

// Importación de estilos
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
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
  <VirtualAssistant />  {/* Aquí está el asistente flotante */}
</Router>
    </div>
  )
}

export default App