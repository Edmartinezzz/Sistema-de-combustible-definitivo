from flask import Blueprint, request, jsonify, g
from ..db import get_db
from ..middleware import token_required

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/clientes', methods=['GET'])
@token_required
def obtener_clientes():
    db = get_db()
    cursor = db.cursor()
    busqueda = request.args.get('busqueda', '')
    query = 'SELECT * FROM clientes WHERE activo = TRUE'
    params = []
    
    if busqueda:
        query += ' AND (nombre LIKE %s OR direccion LIKE %s)'
        search_term = f'%{busqueda}%'
        params.extend([search_term, search_term])
    
    cursor.execute(query, params)
    clientes = [dict(row) for row in cursor.fetchall()]
    return jsonify(clientes)

@clientes_bp.route('/clientes/<int:cliente_id>', methods=['GET'])
@token_required
def obtener_cliente(cliente_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM clientes WHERE id = %s AND activo = TRUE', (cliente_id,))
    cliente = cursor.fetchone()
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    return jsonify(dict(cliente))

@clientes_bp.route('/clientes/<int:cliente_id>/subclientes', methods=['GET'])
@token_required
def obtener_subclientes(cliente_id):
    db = get_db()
    cursor = db.cursor()
    if g.es_cliente and g.cliente_id != cliente_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    cursor.execute('SELECT * FROM subclientes WHERE cliente_padre_id = %s AND activo = TRUE', (cliente_id,))
    subclientes = [dict(row) for row in cursor.fetchall()]
    return jsonify(subclientes)
