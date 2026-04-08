from flask import Blueprint, request, jsonify, g
from ..db import get_db
from ..middleware import token_required

inventario_bp = Blueprint('inventario', __name__)

@inventario_bp.route('/inventario/estado', methods=['GET'])
def obtener_estado_inventario():
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute('SELECT tipo_combustible, litros_disponibles FROM inventario ORDER BY id DESC')
        inventarios = cursor.fetchall()
        
        estado_inventario = {}
        tipos_vistos = set()
        for inv in inventarios:
            tipo = inv['tipo_combustible']
            if tipo not in tipos_vistos:
                estado_inventario[tipo] = inv['litros_disponibles']
                tipos_vistos.add(tipo)
        
        return jsonify({
            'inventario': estado_inventario,
            'disponible': any(litros > 0 for litros in estado_inventario.values())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventario_bp.route('/inventario', methods=['POST'])
@token_required
def crear_inventario():
    if not g.es_admin:
        return jsonify({'error': 'No autorizado'}), 403
        
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
    try:
        tipo = data.get('tipo_combustible').lower()
        litros_ingresados = float(data.get('litros_ingresados', 0))
        
        cursor.execute('SELECT litros_disponibles FROM inventario WHERE tipo_combustible = %s ORDER BY id DESC LIMIT 1', (tipo,))
        last = cursor.fetchone()
        disponible = (last['litros_disponibles'] if last else 0) + litros_ingresados
        
        cursor.execute('''
            INSERT INTO inventario (tipo_combustible, litros_ingresados, litros_disponibles, usuario_id, observaciones)
            VALUES (%s, %s, %s, %s, %s)
        ''', (tipo, litros_ingresados, disponible, g.usuario_id, data.get('observaciones', '')))
        
        db.commit()
        return jsonify({'message': 'Inventario actualizado'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
