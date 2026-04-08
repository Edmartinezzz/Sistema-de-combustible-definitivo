import psycopg2
import urllib.parse
import os

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"
SCHEMA_FILE = 'server/schema.sql'

def apply_schema():
    try:
        print(f"Connecting to DB...")
        result = urllib.parse.urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port
        )
        cursor = conn.cursor()
        
        print(f"Reading schema from {SCHEMA_FILE}...")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
            
        print("Executing schema...")
        cursor.execute(schema_sql)
        conn.commit()
        
        print("✅ Schema applied successfully!")
        
        # Verify tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        print("\nTables in DB now:")
        for row in cursor.fetchall():
            print(f"- {row[0]}")

        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    apply_schema()
