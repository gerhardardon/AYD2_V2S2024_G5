import "../Home.css";
import { NavBar } from "../components/NavBar";
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";

export default function Servicios() {
  const [formData, setFormData] = useState({
    encargado: "",
    codigoServicio: "",
    monto: "",
  });

  const [mensaje, setMensaje] = useState("");

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Simula la llamada a la API para procesar el pago
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación rápida
    if (!formData.encargado || !formData.codigoServicio || !formData.monto) {
      setMensaje("Por favor, complete todos los campos.");
      return;
    }

    try {
      // Simula una solicitud al backend
      const response = await fetch("http://localhost:5000/pagos-servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje(`¡Pago procesado con éxito! ID de Transacción: ${data.idTransaccion}`);
      } else {
        setMensaje("Error al procesar el pago. Intente nuevamente.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensaje("Error de conexión con el servidor.");
    }
  };

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
                Pago de Servicios
              </h1>
            </div>
            {/* Formulario de pago */}
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="encargado">Encargado del servicio</label>
                <input
                  type="text"
                  id="encargado"
                  name="encargado"
                  value={formData.encargado}
                  onChange={handleChange}
                  placeholder="Nombre del encargado"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="codigoServicio">Código del servicio</label>
                <input
                  type="text"
                  id="codigoServicio"
                  name="codigoServicio"
                  value={formData.codigoServicio}
                  onChange={handleChange}
                  placeholder="Ejemplo: AGUA001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="monto">Monto a pagar</label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="Ingrese el monto"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" className="primary-button">
                Realizar Pago
              </button>
            </form>
            {/* Mensaje de resultado */}
            {mensaje && <p className="message">{mensaje}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
