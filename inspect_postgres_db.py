import psycopg2
import urllib.parse
import os

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"

def check_db():
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
        
        print("--- Agendamientos Entregados ---")
        cursor.execute("SELECT count(*), COALESCE(sum(litros), 0) FROM agendamientos WHERE estado = 'entregado'")
        res = cursor.fetchone()
        print(f"Total entregados: {res[0]}")
        print(f"Total litros entregados: {res[1]}")
        
        print("\n--- Retiros Directos ---")
        cursor.execute("SELECT count(*), COALESCE(sum(litros), 0) FROM retiros")
        res = cursor.fetchone()
        print(f"Total retiros: {res[0]}")
        print(f"Total litros retiros: {res[1]}")
        
        print("\n--- Agendamientos Totales por Estado ---")
        cursor.execute("SELECT estado, count(*) FROM agendamientos GROUP BY estado")
        for row in cursor.fetchall():
            print(f"{row[0]}: {row[1]}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
