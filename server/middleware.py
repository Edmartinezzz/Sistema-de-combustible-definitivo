import os
import jwt
from datetime import datetime
from functools import wraps
from flask import request, jsonify, g, app

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token no proporcionado'}), 403
        try:
            # En Flask, app.config['SECRET_KEY'] es global pero aquí necesitamos una referencia limpia
            # Usaremos os.environ directamente para evitar dependencias circulares complejas
            secret_key = os.environ.get('SECRET_KEY', 'tu_clave_secreta_muy_segura')
            
            data = jwt.decode(token.split()[1], secret_key, algorithms=['HS256'])
            
            if 'es_admin' in data:
                g.usuario_actual = data['usuario']
                g.usuario_id = data['id']
                g.es_admin = data['es_admin']
                g.es_cliente = False
                g.cliente_id = None
            elif 'tipo' in data and data['tipo'] == 'cliente':
                g.usuario_actual = data.get('nombre', data.get('cedula'))
                g.usuario_id = None
                g.es_admin = False
                g.es_cliente = True
                g.cliente_id = data['id']
            else:
                return jsonify({'message': 'Token inválido'}), 403
                
        except Exception as e:
            return jsonify({'message': f'Token inválido: {str(e)}'}), 403
        return f(*args, **kwargs)
    return decorated
