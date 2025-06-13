import { BrowserRouter as Router, Routes, Route } from 'react-router'

import { useState } from 'react'

import Home from './pages/Homee/Home'


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
        </Routes>
      </Router>
    </>
  )
}

export default App
