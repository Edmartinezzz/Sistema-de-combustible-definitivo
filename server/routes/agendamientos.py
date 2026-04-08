from flask import Blueprint, request, jsonify, g
from ..db import get_db
from ..middleware import token_required

agendamientos_bp = Blueprint('agendamientos', __name__)

@agendamientos_bp.route('/agendamientos', methods=['POST'])
@token_required
def crear_agendamiento():
    db = get_db()
    cursor = db.cursor()
    try:
        data = request.json
        cliente_id = data.get('cliente_id')
        tipo = data.get('tipo_combustible', 'gasolina')
        litros = float(data.get('litros', 0))
        fecha = data.get('fecha_agendada')
        
        # Lógica simplificada para brevedad, en producción replicar validaciones de server.py
        cursor.execute('''
            SELECT COALESCE(MAX(codigo_ticket), 0) + 1 as next_ticket
            FROM agendamientos WHERE fecha_agendada = %s
        ''', (fecha,))
        ticket = cursor.fetchone()['next_ticket']
        
        cursor.execute('''
            INSERT INTO agendamientos (cliente_id, tipo_combustible, litros, fecha_agendada, estado, codigo_ticket)
            VALUES (%s, %s, %s, %s, 'pendiente', %s)
        ''', (cliente_id, tipo, litros, fecha, ticket))
        
        db.commit()
        return jsonify({'message': 'Agendamiento creado', 'ticket': ticket}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400

@agendamientos_bp.route('/agendamientos/cliente/<int:cliente_id>', methods=['GET'])
@token_required
def obtener_agendamientos_cliente(cliente_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM agendamientos WHERE cliente_id = %s ORDER BY fecha_agendada DESC', (cliente_id,))
    res = [dict(row) for row in cursor.fetchall()]
    return jsonify(res)
