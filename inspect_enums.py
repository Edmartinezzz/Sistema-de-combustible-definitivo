import psycopg2
import urllib.parse

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"

def inspect_enums():
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
        
        print("--- Enums ---")
        cursor.execute("""
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public';
        """)
        
        enums = {}
        for row in cursor.fetchall():
            if row[0] not in enums:
                enums[row[0]] = []
            enums[row[0]].append(row[1])
            
        for name, values in enums.items():
            print(f"{name}: {values}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_enums()
