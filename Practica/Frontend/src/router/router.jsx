import { Routes, Route, HashRouter } from 'react-router-dom'
import React, { useState } from 'react'

import Home from '../pages/Home'
import Servicios from '../pages/Servicios'
import Prestamos from '../pages/Prestamos'
import Buscar from '../pages/Buscar'
import Retiros from '../pages/Retiros'
import Depositos from '../pages/Depositos'


export default function AppNavigator() {

  return (
    <HashRouter>
      <Routes>
 
          <Route path="/" element={<Home user = "Default"/>} />
          <Route path="/Servicios" element={<Servicios />} />
          <Route path="/Prestamos" element={<Prestamos/>} />
          <Route path="/Buscar" element={<Buscar/>} />
          <Route path="/Retiros" element={<Retiros/>} />
          <Route path="/Depositos" element={<Depositos/>} />
      </Routes>
    </HashRouter>
  )
}