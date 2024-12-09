import "../Home.css";
import { NavBar } from "../components/NavBar";
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";
import Swal from 'sweetalert2';
import GenerarComprobante from "./GenerarComprobante";
import { useGlobalContext } from "./Global";

export default function Retiros() {
  const { variableGlobal, setVariableGlobal } = useGlobalContext();
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("ventanilla");
  const [date, setDate] = useState(new Date().toLocaleString());

  const handleWithdraw = async () => {
    // Validaciones
    if (!accountNumber || !amount || !withdrawalType) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.',
      });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto debe ser un número positivo.',
      });
      return;
    }
    if (amount > 1000) { // Límite de retiro
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto excede el límite de retiro permitido.',
      });
      return;
    }

    // Realizar la solicitud al backend
    try {
      const response = await fetch('http://localhost:5000/retirar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          amount: parseFloat(amount),
          withdrawal_type: withdrawalType,
          date: date,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        
        console.log(data);
        GenerarComprobante(data.cuenta, "Retiro", data.fechaHora, data.monto, variableGlobal);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: data.message,
        });
        // Limpiar formulario
        setAccountNumber("");
        setAmount("");
        setWithdrawalType("ventanilla");
        setDate(new Date().toLocaleString());
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error al realizar el retiro.',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al conectar con el servidor.',
      });
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
                Retiros
              </h1>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleWithdraw(); }}>
              <div>
                <label>Número de cuenta:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <label>Monto a retirar:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Tipo de retiro:</label>
                <select
                  value={withdrawalType}
                  onChange={(e) => setWithdrawalType(e.target.value)}
                >
                  <option value="ventanilla">Ventanilla</option>
                  <option value="cajero">Cajero Automático</option>
                </select>
              </div>
              <div>
                <label>Fecha y hora:</label>
                <input type="text" value={date} readOnly />
              </div>
              <button type="submit">Realizar Retiro</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}