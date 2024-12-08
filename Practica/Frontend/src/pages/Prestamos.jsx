
import "../Home.css";
import { NavBar } from "../components/NavBar";
import React, { useState } from "react";
import { RiSlashCommands2 } from "react-icons/ri";
import Swal from 'sweetalert2';
import GenerarComprobante from "./GenerarComprobante";
import { useGlobalContext } from "./Global";

export default function Prestamo() {
  const { variableGlobal, setVariableGlobal } = useGlobalContext();
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("efectivo");
  const [date, setDate] = useState(new Date().toLocaleString());
  const [numeroPrestamo, setNumeroPrestamo] = useState("");

  const handlePrestamo = async () => {
    // Validaciones
    if (!accountNumber || !amount || !depositMethod || !numeroPrestamo) {
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
      const response = await fetch('http://localhost:5000/prestamo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          amount: parseFloat(amount),
          deposit_method: depositMethod,
          date: date,
          numero_prestamo: numeroPrestamo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        GenerarComprobante(data.cuenta, "Pago Prestamo", data.fechaHora, data.monto, variableGlobal);
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
        setNumeroPrestamo("");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error al realizar el pago.',
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
                Pago de Prestamo
              </h1>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handlePrestamo(); }}>
              <div>
                <label>Número de cuenta:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <label>Número de préstamo:</label>
                <input
                  type="text"
                  value={numeroPrestamo}
                  onChange={(e) => setNumeroPrestamo(e.target.value)}
                />
              </div>

              <div>
                <label>Monto a pagar:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Método de Pago:</label>
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
              <button type="submit">Realizar Pago</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}