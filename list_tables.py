import psycopg2
import urllib.parse

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"

def list_tables():
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
        
        print("--- Tablas en la base de datos ---")
        cursor.execute("""
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        """)
        
        for row in cursor.fetchall():
            print(f"{row[0]}.{row[1]}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_tables()
