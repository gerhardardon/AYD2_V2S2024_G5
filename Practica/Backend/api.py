from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# Configuración de CORS
CORS(app)

# Configuración de la base de datos
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'sasa'
app.config['MYSQL_DB'] = 'moneybindb'

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
        return jsonify({'message': 'Depósito realizado con éxito!'})
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
        return jsonify({'message': 'Retiro realizado con éxito!'})
    except Exception as e:
        return jsonify({'message': 'Error al realizar el retiro', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)