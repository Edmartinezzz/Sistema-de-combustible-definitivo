import psycopg2
import psycopg2.extras
import os
import urllib.parse
from flask import g

def get_db():
    if 'db' not in g:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception("ERROR: La variable de entorno 'DATABASE_URL' no está configurada en los ajustes de Vercel.")
        
        # Asegurar SSL para Supabase si no está en la URL
        if 'sslmode=' not in database_url:
            separator = '&' if '?' in database_url else '?'
            database_url += f"{separator}sslmode=require"

        try:
            g.db = psycopg2.connect(
                database_url,
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            g.db.set_session(autocommit=True)
        except Exception as e:
            raise Exception(f"Error al conectar a la base de datos: {str(e)}")
            
    return g.db

def close_db(error=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
