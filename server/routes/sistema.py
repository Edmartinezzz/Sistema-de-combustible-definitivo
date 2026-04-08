from flask import Blueprint, request, jsonify, g
from ..db import get_db
from ..middleware import token_required
from datetime import datetime

sistema_bp = Blueprint('sistema', __name__)

@sistema_bp.route('/sistema/bloqueo', methods=['GET', 'POST'])
@token_required
def sistema_bloqueo():
    db = get_db()
    cursor = db.cursor()
    
    if request.method == 'GET':
        cursor.execute('SELECT retiros_bloqueados FROM sistema_config WHERE id = 1')
        res = cursor.fetchone()
        return jsonify({'bloqueado': bool(res['retiros_bloqueados']) if res else False})
        
    if request.method == 'POST':
        if not g.es_admin:
            return jsonify({'error': 'No autorizado'}), 403
        bloqueado = request.json.get('bloqueado', False)
        cursor.execute('UPDATE sistema_config SET retiros_bloqueados = %s WHERE id = 1', (1 if bloqueado else 0,))
        db.commit()
        return jsonify({'message': f'Retiros {"bloqueados" if bloqueado else "desbloqueados"}'})

@sistema_bp.route('/admin/reset-litros', methods=['POST'])
@token_required
def reset_litros():
    if not g.es_admin:
        return jsonify({'error': 'No autorizado'}), 403
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute('''
            UPDATE clientes 
            SET litros_disponibles = litros_mes,
                litros_disponibles_gasolina = litros_mes_gasolina,
                litros_disponibles_gasoil = litros_mes_gasoil
            WHERE activo = TRUE
        ''')
        db.commit()
        return jsonify({'message': 'Litros reseteados exitosamente'})
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
