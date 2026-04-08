from flask import Blueprint, request, jsonify, g
from ..db import get_db
from ..middleware import token_required

retiros_bp = Blueprint('retiros', __name__)

@retiros_bp.route('/retiros', methods=['POST'])
@token_required
def registrar_retiro():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
    try:
        cliente_id = data.get('cliente_id')
        litros = float(data.get('litros', 0))
        tipo_combustible = data.get('tipo_combustible', 'gasolina')
        
        if litros <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a cero'}), 400

        # Verificar si el cliente existe
        cursor.execute('SELECT * FROM clientes WHERE id = %s AND activo = TRUE', (cliente_id,))
        cliente = cursor.fetchone()
        
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado'}), 404
            
        campo_disponible = f'litros_disponibles_{tipo_combustible}'
        
        # Registrar el retiro
        cursor.execute('''
            INSERT INTO retiros (cliente_id, fecha, hora, litros, usuario_id, tipo_combustible)
            VALUES (%s, CURRENT_DATE, CURRENT_TIME, %s, %s, %s)
        ''', (cliente_id, litros, g.usuario_id, tipo_combustible))
        
        # Actualizar el saldo del cliente
        cursor.execute(f'''
            UPDATE clientes 
            SET litros_disponibles = COALESCE(litros_disponibles, 0) - %s,
                {campo_disponible} = COALESCE({campo_disponible}, 0) - %s
            WHERE id = %s
        ''', (litros, litros, cliente_id))
        
        db.commit()
        return jsonify({'mensaje': 'Retiro registrado exitosamente'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400

@retiros_bp.route('/retiros', methods=['GET'])
@token_required
def obtener_retiros():
    cliente_id = request.args.get('cliente_id')
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT r.*, c.nombre as cliente_nombre, u.nombre as usuario_nombre 
        FROM retiros r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE 1=1
    '''
    params = []
    
    if cliente_id:
        query += ' AND r.cliente_id = %s'
        params.append(cliente_id)
    if fecha_inicio:
        query += ' AND r.fecha >= %s'
        params.append(fecha_inicio)
    if fecha_fin:
        query += ' AND r.fecha <= %s'
        params.append(fecha_fin)
    
    query += ' ORDER BY r.fecha DESC, r.hora DESC'
    cursor.execute(query, params)
    retiros = [dict(row) for row in cursor.fetchall()]
    return jsonify(retiros)

@retiros_bp.route('/estadisticas', methods=['GET'])
@token_required
def obtener_estadisticas_generales():
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute('SELECT COUNT(*) as total FROM clientes WHERE activo = TRUE')
        total_clientes = cursor.fetchone()['total']
        
        cursor.execute('SELECT SUM(litros) as total FROM retiros')
        res = cursor.fetchone()
        total_litros = res['total'] if res and res['total'] else 0
        
        return jsonify({
            'totalClientes': total_clientes,
            'totalLitrosEntregados': total_litros
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
