import psycopg2
import psycopg2.extras
import os
import urllib.parse
from flask import g

def get_db():
    if 'db' not in g:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception("DATABASE_URL no está configurada")
        
        g.db = psycopg2.connect(
            database_url,
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        g.db.set_session(autocommit=True)
    return g.db

def close_db(error=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
