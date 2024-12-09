import "../Home.css";
import "./Buscar.css"; // CSS específico para esta vista
import { NavBar } from "../components/NavBar";
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";
export default function Buscar() {
  const [criterio, setCriterio] = useState("cui"); // Por defecto, busca por CUI
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [cliente, setCliente] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [error, setError] = useState("");

  const handleBuscar = async () => {
    setError("");
    setCliente(null);
    setTransacciones([]);

    if (!valorBusqueda.trim()) {
      setError("Por favor, ingrese un valor de búsqueda.");
      return;
    }

    try {
      const endpoint =
        criterio === "cui"
          ? "http://localhost:5000/buscar_por_cui"
          : "http://localhost:5000/buscar_por_cuenta";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [criterio]: valorBusqueda }), // Enviar el campo dinámico según el criterio
      });

      if (!response.ok) {
        throw new Error("No se encontró información para el criterio ingresado.");
      }

      const data = await response.json();
      setCliente(data.Cliente);
      setTransacciones(data.HistorialTransacciones);
    } catch (err) {
      setError(err.message || "Error al realizar la búsqueda.");
      console.error(err);
    }
  };

  return (
    <div className="App">
      <div className="home-container">
        <NavBar />
        <div className="home-text-section">
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 className="primary-heading" style={{ marginRight: "20px" }}>
                <RiSlashCommands2 />
              </h1>
              <h1 className="primary-text" style={{ marginRight: "20px" }}>
                Buscar y mostrar informacion
              </h1>
            </div>
          </div>
        <div className="home-banner-container">
       
          
          <div className="buscar-container">
            
            <div className="buscar-barra">
              <select
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                className="buscar-select"
              >
                <option value="cui">CUI</option>
                <option value="numero_cuenta">Número de Cuenta</option>
              </select>
              <input
                type="text"
                placeholder={` Buscar por ${criterio}`}
                value={valorBusqueda}
                onChange={(e) => setValorBusqueda(e.target.value)}
                className="buscar-input"
              />
              <button onClick={handleBuscar} className="buscar-boton">
                Buscar
              </button>
            </div>
            {error && <div className="error-mensaje">{error}</div>}
            <div className="resultado-container">
              <div className="cliente-detalle">
                {cliente && (
                  <>
                    <h3>Información del Cliente</h3>
                    <p>
                      <strong>CUI:</strong> {cliente.CUI}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {cliente.Nombre} {cliente.Apellido}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {cliente.Direccion}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {cliente.Telefono}
                    </p>
                  </>
                )}
              </div>
              <div className="transacciones-detalle">
                {transacciones.length > 0 && (
                  <>
                    <h3>Historial de Transacciones</h3>
                    <ul>
                      {transacciones.map((t) => (
                        <li key={t.IdTransaccion}>
                          <p>
                            <strong>Tipo:</strong> {t.TipoTransaccion}
                          </p>
                          <p>
                            <strong>Monto:</strong> Q{t.Monto.toFixed(2)}
                          </p>
                          <p>
                            <strong>Fecha:</strong> {t.FechaHora}
                          </p>
                          <p>
                            <strong>Autorizado por:</strong> {t.EmpleadoAutorizado}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}