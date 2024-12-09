-- Crear la base de datos
CREATE DATABASE MoneyBinDB;
USE MoneyBinDB;

-- Tabla Cliente
CREATE TABLE Cliente (
    CUI INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Apellido VARCHAR(50) NOT NULL,
    Direccion VARCHAR(100) NOT NULL,
    Telefono VARCHAR(15) NOT NULL
);

-- Tabla Cuenta
CREATE TABLE Cuenta (
    NumeroCuenta INT NOT NULL PRIMARY KEY,
    CUI INT NOT NULL,
    SaldoActual DECIMAL(10, 2) NOT NULL,
    FechaUltimaActualizacion DATETIME NOT NULL,
    FOREIGN KEY (CUI) REFERENCES Cliente(CUI)
);

-- Tabla Transaccion
CREATE TABLE Transaccion (
    IdTransaccion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NumeroCuenta INT NOT NULL,
    TipoTransaccion ENUM('PagoServicio', 'PagoPrestamo', 'Deposito', 'Retiro') NOT NULL,
    Monto DECIMAL(10, 2) NOT NULL,
    FechaHora DATETIME NOT NULL,
    EmpleadoAutorizado VARCHAR(50) NOT NULL,
    FOREIGN KEY (NumeroCuenta) REFERENCES Cuenta(NumeroCuenta)
);

-- Tabla de Prestamos
CREATE TABLE Prestamo(
    IdPrestamo INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NumeroCuenta INT NOT NULL,
    Monto DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (NumeroCuenta) REFERENCES Cuenta(NumeroCuenta)
);

-- Tabla PagoPrestamo
CREATE TABLE PagoPrestamo (
    IdPagoPrestamo INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    IdTransaccion INT NOT NULL,
    NumeroPrestamo INT NOT NULL,
    FOREIGN KEY (IdTransaccion) REFERENCES Transaccion(IdTransaccion)
);

-- Tabla PagoServicio
CREATE TABLE PagoServicio (
    IdPagoServicio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    IdTransaccion INT NOT NULL,
    NombreEncargado VARCHAR(50) NOT NULL,
    CodigoServicio VARCHAR(20) NOT NULL,
    FOREIGN KEY (IdTransaccion) REFERENCES Transaccion(IdTransaccion)
);

-- Tabla Comprobante
CREATE TABLE Comprobante (
    IdComprobante INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    IdTransaccion INT NOT NULL,
    NombreArchivo VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdTransaccion) REFERENCES Transaccion(IdTransaccion)
);

-- Insertar datos de ejemplo en Cliente
INSERT INTO Cliente (CUI, Nombre, Apellido, Direccion, Telefono) VALUES
(101010101, 'Juan', 'Pérez', 'Ciudad Guatemala, Zona 1', '5555-1234'),
(202020202, 'Ana', 'López', 'Antigua Guatemala, Sacatepéquez', '5555-5678');

-- Insertar datos de ejemplo en Cuenta
INSERT INTO Cuenta (NumeroCuenta, CUI, SaldoActual, FechaUltimaActualizacion) VALUES
(1001, 101010101, 5000.00, '2024-12-07 10:00:00'),
(1002, 202020202, 3000.00, '2024-12-07 11:00:00');

-- Insertar datos de ejemplo en Transaccion
INSERT INTO Transaccion (NumeroCuenta, TipoTransaccion, Monto, FechaHora, EmpleadoAutorizado) VALUES
(1001, 'Deposito', 1000.00, '2024-12-07 10:30:00', 'Empleado1'),
(1002, 'PagoServicio', 500.00, '2024-12-07 11:15:00', 'Empleado2');

-- inserta un Prestamo
INSERT INTO Prestamo (NumeroCuenta, Monto) VALUES
(1001, 10000);

-- Insertar datos de ejemplo en PagoPrestamo
INSERT INTO PagoPrestamo (IdTransaccion, NumeroPrestamo) VALUES
(1, 555001);

-- Insertar datos de ejemplo en PagoServicio
INSERT INTO PagoServicio (IdTransaccion, NombreEncargado, CodigoServicio) VALUES
(2, 'Compañía Eléctrica', 'CE-2024');

-- Insertar datos de ejemplo en Comprobante
INSERT INTO Comprobante (IdTransaccion, NombreArchivo) VALUES
(1, 'comprobante1.pdf'),
(2, 'comprobante2.pdf');
