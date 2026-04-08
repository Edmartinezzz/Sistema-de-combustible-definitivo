from flask import Flask, jsonify
import os
import sys

# Añadir el directorio raíz al path para que Vercel encuentre 'server'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from server.app import create_app
    app = create_app()
except Exception as e:
    # Si falla la creación de la app (ej: falta DATABASE_URL)
    # creamos una app de emergencia para mostrar el error real
    app = Flask(__name__)
    
    @app.route('/api/debug')
    def debug():
        return jsonify({
            "status": "error",
            "message": "La aplicación no pudo iniciarse",
            "details": str(e),
            "sys_path": sys.path,
            "env_vars_present": {
                "DATABASE_URL": "DATABASE_URL" in os.environ,
                "SECRET_KEY": "SECRET_KEY" in os.environ
            }
        }), 500

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Python Runtime is alive"})
