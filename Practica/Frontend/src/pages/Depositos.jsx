import "../Home.css";
import { NavBar } from "../components/NavBar";
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";
import Swal from 'sweetalert2';

export default function Depositos() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("efectivo");
  const [date, setDate] = useState(new Date().toLocaleString());

  const handleDeposit = async () => {
    // Validaciones
    if (!accountNumber || !amount || !depositMethod) {
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

    // Realizar la solicitud al backend
    try {
      const response = await fetch('http://localhost:5000/depositar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          amount: parseFloat(amount),
          deposit_method: depositMethod,
          date: date,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: data.message,
        });
        // Limpiar formulario
        setAccountNumber("");
        setAmount("");
        setDepositMethod("efectivo");
        setDate(new Date().toLocaleString());
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error al realizar el depósito.',
        });
      }
    } catch (error) {
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
                Depósitos
              </h1>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleDeposit(); }}>
              <div>
                <label>Número de cuenta:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <label>Monto a depositar:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Método de depósito:</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                </select>
              </div>
              <div>
                <label>Fecha y hora:</label>
                <input type="text" value={date} readOnly />
              </div>
              <button type="submit">Realizar Depósito</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}