import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const GlobalContext = createContext();

// Crear el proveedor para envolver tu aplicación
export const GlobalProvider = ({ children }) => {
  const [variableGlobal, setVariableGlobal] = useState('Valor Inicial'); // Estado global

  // Puedes agregar más variables y funciones si es necesario
  return (
    <GlobalContext.Provider value={{ variableGlobal, setVariableGlobal }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Crear un hook personalizado para usar el contexto
export const useGlobalContext = () => useContext(GlobalContext);
