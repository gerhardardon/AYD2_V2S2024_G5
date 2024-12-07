import "../Home.css";
import { NavBar } from "../components/NavBar";
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";

export default function Prestamos() {
  return (
    <div className="App">
      <div className="home-container">
        <NavBar />
        <div className="home-banner-container">
          <div className="home-text-section">
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 className="primary-heading" style={{ marginRight: "20px" }}>
                <RiSlashCommands2 />
              </h1>
              <h1 className="primary-text" style={{ marginRight: "20px" }}>
                Pago de prestamos
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
