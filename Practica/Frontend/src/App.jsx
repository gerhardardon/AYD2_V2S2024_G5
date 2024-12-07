import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Retiros from './pages/Retiros';


function About() {
  return <h2>Sobre nosotros</h2>;
}

function App() {
  // useNavigate permite navegar de forma programática
  const navigate = useNavigate();

  return (
    <div>
      <h1>APP BANCO</h1>
      
      {/* Botones para navegar entre las rutas */}
      <div>
        <button onClick={() => navigate('/retiros')}>Retiros</button>
        <button onClick={() => navigate('/about')}>Sobre nosotros</button>
      </div>

      <Routes>
        <Route path="/retiros" element={<Retiros/>} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
