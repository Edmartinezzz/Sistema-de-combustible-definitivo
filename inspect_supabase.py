import psycopg2
import urllib.parse
import json
from datetime import datetime

# DATABASE_URL de Supabase
DATABASE_URL = "postgresql://postgres.qzdtexeoofxhdoctxrix:OG8Keb7LWivnMl4d@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

def default_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)

def inspect_supabase():
    try:
        result = urllib.parse.urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port
        )
        cursor = conn.cursor()
        
        print("--- Usuarios (público) ---")
        cursor.execute("SELECT id, usuario, contrasena, nombre, es_admin FROM usuarios")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        for row in rows:
            print(json.dumps(dict(zip(columns, row)), default=default_serializer))

        print("\n--- Clientes (sample) ---")
        cursor.execute("SELECT id, nombre, cedula, password, activo FROM clientes LIMIT 5")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        for row in rows:
            print(json.dumps(dict(zip(columns, row)), default=default_serializer))

        print("\n--- Configuración Sistema ---")
        cursor.execute("SELECT * FROM sistema_config")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        for row in rows:
            print(json.dumps(dict(zip(columns, row)), default=default_serializer))

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_supabase()
