from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime
from decimal import Decimal

app = Flask(__name__)

# Configuración de CORS
CORS(app)

# Configuración de la base de datos
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'MoneyBinDB'

mysql = MySQL(app)

@app.route('/')
def main():
    return jsonify({'message': 'Hello World!'})

@app.route('/check_db_connection', methods=['GET'])
def check_db_connection():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        return jsonify({'message': 'Conexión a la base de datos exitosa!'})
    except Exception as e:
        return jsonify({'message': 'Error al conectar a la base de datos', 'error': str(e)})

@app.route('/depositar', methods=['POST'])
def depositar():
    data = request.get_json()
    account_number = data.get('account_number')
    amount = data.get('amount')
    deposit_method = data.get('deposit_method')
    date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if not account_number or not amount or not deposit_method:
        return jsonify({'message': 'Todos los campos son obligatorios.'}), 400
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({'message': 'El monto debe ser un número positivo.'}), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT SaldoActual FROM Cuenta WHERE NumeroCuenta = %s", (account_number,))
        account = cursor.fetchone()
        if not account:
            return jsonify({'message': 'Número de cuenta no encontrado.'}), 404

        new_balance = account[0] + amount
        cursor.execute("UPDATE Cuenta SET SaldoActual = %s, FechaUltimaActualizacion = %s WHERE NumeroCuenta = %s", 
                       (new_balance, date, account_number))
        cursor.execute("INSERT INTO Transaccion (NumeroCuenta, TipoTransaccion, Monto, FechaHora, EmpleadoAutorizado) VALUES (%s, %s, %s, %s, %s)", 
                       (account_number, 'Deposito', amount, date, 'Empleado1'))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Depósito realizado con éxito!',
            "fechaHora": str(date),
            "monto": str(round(amount,2)),
            "cuenta": str(account_number)})
    except Exception as e:
        return jsonify({'message': 'Error al realizar el depósito', 'error': str(e)}), 500

@app.route('/retirar', methods=['POST'])
def retirar():
    data = request.get_json()
    account_number = data.get('account_number')
    amount = data.get('amount')
    withdrawal_type = data.get('withdrawal_type')
    date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if not account_number or not amount or not withdrawal_type:
        return jsonify({'message': 'Todos los campos son obligatorios.'}), 400
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({'message': 'El monto debe ser un número positivo.'}), 400
    if amount > 1000:  # Límite de retiro
        return jsonify({'message': 'El monto excede el límite de retiro permitido.'}), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT SaldoActual FROM Cuenta WHERE NumeroCuenta = %s", (account_number,))
        account = cursor.fetchone()
        if not account:
            return jsonify({'message': 'Número de cuenta no encontrado.'}), 404
        if account[0] < amount:
            return jsonify({'message': 'Fondos insuficientes.'}), 400

        new_balance = account[0] - amount
        cursor.execute("UPDATE Cuenta SET SaldoActual = %s, FechaUltimaActualizacion = %s WHERE NumeroCuenta = %s", 
                       (new_balance, date, account_number))
        cursor.execute("INSERT INTO Transaccion (NumeroCuenta, TipoTransaccion, Monto, FechaHora, EmpleadoAutorizado) VALUES (%s, %s, %s, %s, %s)", 
                       (account_number, 'Retiro', amount, date, 'Empleado1'))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Retiro realizado con éxito!',
            "fechaHora": str(date),
            "monto": str(round(amount,2)),
            "cuenta": str(account_number)})
    
    except Exception as e:
        return jsonify({'message': 'Error al realizar el retiro', 'error': str(e)}), 500
    


@app.route("/pagos-servicios", methods=["POST"])
def pagos_servicios():
    data = request.json
    encargado = data.get("encargado")
    codigo_servicio = data.get("codigoServicio")
    monto = float(data.get("monto"))

    if not encargado or not codigo_servicio or not monto:
        return jsonify({"error": "Todos los campos son obligatorios."}), 400

    try:
        # Convertimos monto a Decimal para compatibilidad con la base de datos
        monto = Decimal(monto)
        # Crear un cursor para realizar consultas
        cursor = mysql.connection.cursor()

        # Paso 1: Buscar el CUI del cliente dado su nombre
        query_cui = "SELECT CUI FROM Cliente WHERE CONCAT(Nombre, ' ', Apellido) = %s"
        cursor.execute(query_cui, (encargado,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": f"No se encontró un cliente con el nombre '{encargado}'."}), 404

        cui = result[0]

        # Paso 2: Buscar el número de cuenta asociado al CUI
        query_cuenta = "SELECT NumeroCuenta, SaldoActual FROM Cuenta WHERE CUI = %s"
        cursor.execute(query_cuenta, (cui,))
        cuenta = cursor.fetchone()
        if not cuenta:
            return jsonify({"error": f"No se encontró una cuenta asociada al cliente con CUI {cui}."}), 404

        numero_cuenta, saldo_actual = cuenta

        # Verificar si el saldo es suficiente
        if saldo_actual < monto:
            return jsonify({"error": "Saldo insuficiente."}), 400

        # Paso 3: Registrar la transacción en la tabla `Transaccion`
        fecha_hora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        empleado_autorizado = "Empleado1"  # Cambiar según lógica de autenticación

        query_transaccion = """
            INSERT INTO Transaccion (NumeroCuenta, TipoTransaccion, Monto, FechaHora, EmpleadoAutorizado)
            VALUES (%s, 'PagoServicio', %s, %s, %s)
        """
        cursor.execute(query_transaccion, (numero_cuenta, monto, fecha_hora, empleado_autorizado))
        mysql.connection.commit()
        id_transaccion = cursor.lastrowid

        # Paso 4: Registrar los detalles en la tabla `PagoServicio`
        query_pago_servicio = """
            INSERT INTO PagoServicio (IdTransaccion, NombreEncargado, CodigoServicio)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query_pago_servicio, (id_transaccion, encargado, codigo_servicio))
        mysql.connection.commit()

        # Paso 5: Actualizar el saldo de la cuenta
        nuevo_saldo = saldo_actual - monto
        query_update_saldo = """
            UPDATE Cuenta
            SET SaldoActual = %s, FechaUltimaActualizacion = %s
            WHERE NumeroCuenta = %s
        """
        cursor.execute(query_update_saldo, (nuevo_saldo, fecha_hora, numero_cuenta))
        mysql.connection.commit()

        # Datos pal comprobante:
        print(numero_cuenta,"Pago de servicios",fecha_hora,monto,"nombreyfirma")

        # Respuesta exitosa
        return jsonify({
            "message": "Pago realizado con éxito.",
            "idTransaccion": str(id_transaccion),
            "nuevoSaldo": str(nuevo_saldo),
            "fechaHora": fecha_hora,
            "monto": str(round(monto,2)),
            "cuenta": numero_cuenta
        })

    except Exception as e:
        print(e)
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        cursor.close()

@app.route("/prestamo", methods=["POST"])
def pagos_prestamo():
    data = request.json
    account_number = data.get("account_number")
    amount = float(data.get("amount"))
    deposit_method = data.get("deposit_method") 
    numero_prestamo = data.get("numero_prestamo")
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Validación de campos
    if not account_number or not amount or not deposit_method or not numero_prestamo:
        return jsonify({"error": "Todos los campos son obligatorios."}), 400
    
    #try-catch para manejar errores
    try:

        # Convertimos monto a Decimal para compatibilidad con la base de datos
        amount = Decimal(amount)
        # Crear un cursor para realizar consultas
        cursor = mysql.connection.cursor()

        # Paso 1: Verificar si la cuenta existe
        query_cuenta = "SELECT SaldoActual FROM Cuenta WHERE NumeroCuenta = %s"
        cursor.execute(query_cuenta, (account_number,))
        cuenta = cursor.fetchone()

        if not cuenta:
            return jsonify({"message": f"No se encontró una cuenta con el número '{account_number}'."}), 404

        saldo_actual = cuenta[0]
        nuevo_saldo = saldo_actual - amount
        #si es una transferencia se debe verificar que el monto sea mayor al monto
        print(deposit_method)
        if deposit_method == "transferencia":
            if saldo_actual < amount:
                return jsonify({"message": "Saldo insuficiente."}), 400
            
            query_update_saldo = """
                UPDATE Cuenta
                SET SaldoActual = %s, FechaUltimaActualizacion = %s
                WHERE NumeroCuenta = %s
            """
            cursor.execute(query_update_saldo, (nuevo_saldo, date, account_number))
            mysql.connection.commit()


        # insertar transacción
        query_transaccion = """
            INSERT INTO Transaccion (NumeroCuenta, TipoTransaccion, Monto, FechaHora, EmpleadoAutorizado)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query_transaccion, (account_number, 'PagoPrestamo', amount, date, 'Empleado1',))
        mysql.connection.commit()
        id_transaccion = cursor.lastrowid

        # insertar detalles de prestamo
        query_prestamo = """
            INSERT INTO PagoPrestamo (IdTransaccion, NumeroPrestamo)
            VALUES (%s, %s)
        """
        cursor.execute(query_prestamo, (id_transaccion, numero_prestamo))
        mysql.connection.commit()
        
        #consulta el saldo en la tabla de prestamos
        query_prestamo = "SELECT Monto FROM Prestamo WHERE IdPrestamo = %s"
        cursor.execute(query_prestamo, (numero_prestamo,))
        prestamo = cursor.fetchone()
        if not prestamo:
            return jsonify({"message": f"No se encontró un prestamo con el número '{numero_prestamo}'."}), 404
            
        monto_prestamo = prestamo[0]
        nuevo_monto = monto_prestamo - amount
        query_update_prestamo = """
                UPDATE Prestamo
                SET Monto = %s
                WHERE IdPrestamo = %s
            """
        cursor.execute(query_update_prestamo, (nuevo_monto, numero_prestamo))
        mysql.connection.commit()
 

        # Datos para el comprobante:
        print(account_number,"Pago de prestamo",date,amount,"nombreyfirma")

        # Respuesta exitosa
        return jsonify({
            "message": "Pago realizado con éxito.",
            "idTransaccion": str(id_transaccion),
            "nuevoSaldo": str(nuevo_saldo),
            "fechaHora": date,
            "monto": str(round(amount,2)),
            "cuenta": account_number
        })
    except Exception as e:
        print(e)
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        cursor.close()

@app.route('/buscar_por_cuenta', methods=['POST'])
def buscar_por_cuenta():
    # Obtener el JSON enviado en el cuerpo de la solicitud
    data = request.get_json()

    if not data or 'numero_cuenta' not in data:
        return jsonify({'error': 'El campo numero_cuenta es requerido en el cuerpo de la solicitud'}), 400

    numero_cuenta = data['numero_cuenta']

    try:
        cursor = mysql.connection.cursor()

        # Consultar los detalles del cliente
        query_cliente = """
            SELECT c.CUI, c.Nombre, c.Apellido, c.Direccion, c.Telefono
            FROM Cliente c
            JOIN Cuenta ct ON c.CUI = ct.CUI
            WHERE ct.NumeroCuenta = %s
        """
        cursor.execute(query_cliente, (numero_cuenta,))
        cliente = cursor.fetchone()

        if not cliente:
            return jsonify({'error': 'No se encontró ningún cliente con el número de cuenta proporcionado'}), 404

        cliente_data = {
            'CUI': cliente[0],
            'Nombre': cliente[1],
            'Apellido': cliente[2],
            'Direccion': cliente[3],
            'Telefono': cliente[4]
        }

        # Consultar el historial de transacciones
        query_transacciones = """
            SELECT t.IdTransaccion, t.TipoTransaccion, t.Monto, t.FechaHora, t.EmpleadoAutorizado
            FROM Transaccion t
            WHERE t.NumeroCuenta = %s
            ORDER BY t.FechaHora DESC
        """
        cursor.execute(query_transacciones, (numero_cuenta,))
        transacciones = cursor.fetchall()

        transacciones_data = [
            {
                'IdTransaccion': transaccion[0],
                'TipoTransaccion': transaccion[1],
                'Monto': float(transaccion[2]),  # Convertir Decimal a float para JSON
                'FechaHora': transaccion[3].strftime('%Y-%m-%d %H:%M:%S'),
                'EmpleadoAutorizado': transaccion[4]
            }
            for transaccion in transacciones
        ]

        # Respuesta final
        return jsonify({
            'Cliente': cliente_data,
            'HistorialTransacciones': transacciones_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/buscar_por_cui', methods=['POST'])
def buscar_por_cui():
    # Validar el encabezado Content-Type
    if request.content_type != 'application/json':
        return jsonify({'error': 'El Content-Type debe ser application/json'}), 415

    # Obtener el JSON enviado en el cuerpo de la solicitud
    data = request.get_json()

    if not data or 'cui' not in data:
        return jsonify({'error': 'El campo cui es requerido en el cuerpo de la solicitud'}), 400

    cui = data['cui']

    try:
        cursor = mysql.connection.cursor()

        # Consultar los detalles del cliente
        query_cliente = """
            SELECT c.CUI, c.Nombre, c.Apellido, c.Direccion, c.Telefono
            FROM Cliente c
            WHERE c.CUI = %s
        """
        cursor.execute(query_cliente, (cui,))
        cliente = cursor.fetchone()

        if not cliente:
            return jsonify({'error': 'No se encontró ningún cliente con el CUI proporcionado'}), 404

        cliente_data = {
            'CUI': cliente[0],
            'Nombre': cliente[1],
            'Apellido': cliente[2],
            'Direccion': cliente[3],
            'Telefono': cliente[4]
        }

        # Consultar el historial de transacciones asociadas a las cuentas del cliente
        query_transacciones = """
            SELECT t.IdTransaccion, t.TipoTransaccion, t.Monto, t.FechaHora, t.EmpleadoAutorizado
            FROM Transaccion t
            JOIN Cuenta ct ON t.NumeroCuenta = ct.NumeroCuenta
            WHERE ct.CUI = %s
            ORDER BY t.FechaHora DESC
        """
        cursor.execute(query_transacciones, (cui,))
        transacciones = cursor.fetchall()

        transacciones_data = [
            {
                'IdTransaccion': transaccion[0],
                'TipoTransaccion': transaccion[1],
                'Monto': float(transaccion[2]),  # Convertir Decimal a float para JSON
                'FechaHora': transaccion[3].strftime('%Y-%m-%d %H:%M:%S'),
                'EmpleadoAutorizado': transaccion[4]
            }
            for transaccion in transacciones
        ]

        # Respuesta final
        return jsonify({
            'Cliente': cliente_data,
            'HistorialTransacciones': transacciones_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)