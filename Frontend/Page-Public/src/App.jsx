import { BrowserRouter as Router, Routes, Route } from 'react-router'

import { useState } from 'react'

import Home from './pages/Homee/Home'
import Ficha from './pages/Ficha/Ficha'
import Dedicacion from './pages/Dedicacion/Dedicacion'
import MisionVision from './pages/Mision-Vision/Mision-Vision'
import RedesSociales from './pages/Redes/Redes'


import Navegation from './components/Navegation'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        {/* Barra de navegación que estará presente en todas las páginas */}
        <Navegation />
        
        {/* Definición de las rutas disponibles en la app */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Ficha" element={<Ficha />} />
          <Route path="/Dedicacion" element={<Dedicacion />} />
          <Route path="/mision-vision" element={<MisionVision />} />
          <Route path="/redes-sociales" element={<RedesSociales />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
