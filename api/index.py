from server.app import create_app

# Crear la aplicación Flask usando nuestra factory modular
app = create_app()

# Vercel requiere que el objeto de la aplicación se llame 'app'
# y sea accesible desde el módulo index.py (o lo que configuremos en vercel.json)
