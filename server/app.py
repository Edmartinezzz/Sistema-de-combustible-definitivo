from flask import Flask, jsonify
from flask_cors import CORS
import os
from .db import close_db
from .routes.auth import auth_bp
from .routes.clientes import clientes_bp
from .routes.retiros import retiros_bp
from .routes.inventario import inventario_bp
from .routes.agendamientos import agendamientos_bp
from .routes.sistema import sistema_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tu_clave_secreta_muy_segura')

    # Configuración CORS (Acepta Vercel y Localhost)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["*", "http://localhost:3000", "http://localhost:3001"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }, supports_credentials=True)

    # Registrar Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(clientes_bp, url_prefix='/api')
    app.register_blueprint(retiros_bp, url_prefix='/api')
    app.register_blueprint(inventario_bp, url_prefix='/api')
    app.register_blueprint(agendamientos_bp, url_prefix='/api')
    app.register_blueprint(sistema_bp, url_prefix='/api')

    # Teardown de base de datos
    app.teardown_appcontext(close_db)

    @app.route('/', methods=['GET'])
    def home():
        return jsonify({
            'status': 'online',
            'message': 'API Modular de Despacho Gas+ funcionando correctamente',
            'version': '3.0.0 (Modular)'
        })

    return app
