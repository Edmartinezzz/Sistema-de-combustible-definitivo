from flask import Blueprint, request, jsonify, make_response
import jwt
import os
from datetime import datetime, timedelta
from ..db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'usuario' not in data or 'contrasena' not in data:
            return jsonify({'error': 'Se requieren usuario y contraseña'}), 400
            
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM usuarios WHERE usuario = %s', (data.get('usuario'),))
        usuario = cursor.fetchone()
        
        if not usuario or usuario['contrasena'] != data.get('contrasena'):
            return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
        
        secret_key = os.environ.get('SECRET_KEY', 'tu_clave_secreta_muy_segura')
        token = jwt.encode({
            'usuario': usuario['usuario'],
            'id': usuario['id'],
            'es_admin': bool(usuario['es_admin']),
            'exp': datetime.utcnow() + timedelta(hours=8)
        }, secret_key, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'usuario': {
                'id': usuario['id'],
                'usuario': usuario['usuario'],
                'nombre': usuario['nombre'],
                'es_admin': bool(usuario['es_admin'])
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/clientes/login', methods=['POST'])
def login_cliente():
    try:
        data = request.json
        cedula = data.get('cedula')
        if not cedula:
            return jsonify({'error': 'La cédula es requerida'}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM clientes WHERE cedula = %s AND activo = TRUE', (cedula,))
        cliente = cursor.fetchone()
        
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado o inactivo'}), 404
        
        secret_key = os.environ.get('SECRET_KEY', 'tu_clave_secreta_muy_segura')
        token = jwt.encode({
            'id': cliente['id'],
            'nombre': cliente['nombre'],
            'cedula': cliente['cedula'],
            'tipo': 'cliente'
        }, secret_key, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'cliente': dict(cliente)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
