import BannerBackground from "../assets/home-banner-background.png";
import { HiArrowRight } from "react-icons/hi2";
import React, { useState } from "react";
import { useGlobalContext } from "./Global";
import '../Home.css'


export default function Home() {
  const { variableGlobal, setVariableGlobal } = useGlobalContext();
  const handleChage = (e) => {
    setVariableGlobal(e.target.value)
    console.log(variableGlobal)
  }
    const handleClick = () => {
        window.location.hash = '#/Servicios';
    };

  return (
    <div className="App">
      <div className="home-container">
        
        <div className="home-banner-container">
        <div className="home-bannerImage-container">
            <img src={BannerBackground} style={{ "backgroundImage": '../assets/image.png', "backgroundSize": "All" }} />
          </div>
          <div className="home-text-section">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 className="primary-heading" style={{marginRight: "20px"}}>
                MONEY BIN
              </h1>
            </div>
            <p className="primary-text">
              Tu institucion financiera de confianza, en todos lados.
            </p>
            <div className = "form-group">
                <input className="secundary-text"
                  type="text"
                  id="encargado"
                  name="encargado"
                  placeholder="Nombre del encargado"
                  onChange={handleChage}
                  required
                />
            </div>
            
            <button onClick={handleClick} className="secondary-button">
              Pruebalo ya! <HiArrowRight />{" "}
            </button>
          </div>
          <div className="home-image-section">
          </div>
        </div>
      </div>
    </div>
  );
}