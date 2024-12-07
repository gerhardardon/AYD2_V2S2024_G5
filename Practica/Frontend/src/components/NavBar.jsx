import { FaHome } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import React, { useState } from "react";

export function NavBar() {
  
  
  return (
    <nav>
      <div className="navbar-links-container">
        <a href="/"><FaHome/> Home</a>
        <a href="#/Servicios">Servicios</a>
        <a href="#/Prestamos">Prestamos</a>
        <a href="#/Buscar">Buscar</a>
        <a href="#/Comprobante">Comprobantes</a>
        <a href="#/Retiros">Retiros</a>
        <a href="#/Depositos">Depositos</a>
      </div>
    </nav>
  );
}