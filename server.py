from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import date

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde cualquier origen
# Ruta para autenticar

@app.route('/api/login', methods=['POST'])
def login():
    try:
        connection = get_database_connection()
        cursor = connection.cursor()

        data = request.get_json()
        id_cliente, clave_electronica = data.get("id_cliente"), data.get("nombre")

        # Verificar las credenciales (esto debe mejorarse usando hashing de contraseñas)
        query = 'SELECT * FROM CLIENTES WHERE id_cliente = %s AND nombre = %s'
        cursor.execute(query, (id_cliente, clave_electronica))
        user = cursor.fetchone()

        if user:
            return jsonify({"success": True, "user_id": user[0]})
        else:
            return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401

    except mysql.connector.Error as err:
        print(f"Error de MySQL: {err}")
        return jsonify({"error": "Error al autenticar"}), 500

    finally:
        cursor.close()
        connection.close()

# Configuración de conexión a la base de datos
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "123456789",
    "database": "webmobile1",
}

# Manejo de conexiones a la base de datos
def get_database_connection():
    return mysql.connector.connect(**db_config)

# Ruta para autenticar
# Ruta para obtener categorías de productos
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        connection = get_database_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT DISTINCT CATEGORIA FROM PRODUCTOS")
        results = cursor.fetchall()

        categories = [row["CATEGORIA"] for row in results]

        return jsonify({"categories": categories})

    except mysql.connector.Error as err:
        print(f"Error de MySQL: {err}")
        return jsonify({"error": "Error al obtener categorías"}), 500

    finally:
        cursor.close()
        connection.close()

# Ruta para obtener productos
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        connection = get_database_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM PRODUCTOS")
        results = cursor.fetchall()

        return jsonify({"products": results})

    except mysql.connector.Error as err:
        print(f"Error de MySQL: {err}")
        return jsonify({"error": "Error al obtener productos"}), 500

    finally:
        cursor.close()
        connection.close()
# Ruta para crear un pedido y su detalle
@app.route('/api/create-order', methods=['POST'])
def create_order():
    try:
        connection = get_database_connection()
        cursor = connection.cursor()

        # Obtén los datos del pedido desde la solicitud POST
        data = request.get_json()
        id_cliente, monto_neto, monto_bruto, items = (
            data['id_cliente'],
            data['monto_neto'],
            data['monto_bruto'],
            data['items'],
        )

        # Inserta el pedido en la tabla PEDIDOS
        cursor.execute(
            'INSERT INTO PEDIDOS (ID_CLIENTE, FECHA_PEDIDO, MONTO_NETO, MONTO_BRUTO) VALUES (%s, %s, %s, %s)',
            (id_cliente, date.today(), monto_neto, monto_bruto),
        )
        connection.commit()

        # Obtén el ID del pedido recién insertado
        cursor.execute('SELECT LAST_INSERT_ID()')
        id_pedido = cursor.fetchone()[0]

        # Inserta los detalles del pedido en la tabla DETALLE_PEDIDO
        for item in items:
            cursor.execute(
                'INSERT INTO DETALLE_PEDIDO (ID_PEDIDO, ID_PRODUCTO, CANTIDAD, MONTO_TOTAL_PRODUCTO) VALUES (%s, %s, %s, %s)',
                (id_pedido, item['id_producto'], item['cantidad'], item['monto_total_producto']),
            )
        connection.commit()

        return jsonify({"success": True, "message": "Pedido creado con éxito"}), 200

    except mysql.connector.Error as err:
        print(f"Error de MySQL: {err}")
        return jsonify({"error": "Error al crear el pedido"}), 500

    finally:
        cursor.close()
        connection.close()
         
if __name__ == '__main__':
    app.run(port=5000)
