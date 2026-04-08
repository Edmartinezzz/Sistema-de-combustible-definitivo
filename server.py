from server.app import create_app
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

app = create_app()

if __name__ == '__main__':
    # Puerto dinámico para producción (Railway/Render usan PORT)
    port = int(os.environ.get('PORT', 5000))
    # En producción, host debe ser 0.0.0.0 para aceptar conexiones externas
    host = os.environ.get('HOST', '0.0.0.0')
    # Debug solo en desarrollo
    is_dev = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print(f"🚀 Servidor Modular de Despacho Gas+ iniciado en http://{host}:{port}")
    app.run(host=host, port=port, debug=is_dev)
