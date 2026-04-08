import psycopg2
import urllib.parse
import json
from datetime import datetime

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"

def default_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)

def inspect_rows():
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
        
        print("--- Sample Order ---")
        cursor.execute("SELECT * FROM \"Order\" LIMIT 1")
        columns = [desc[0] for desc in cursor.description]
        row = cursor.fetchone()
        if row:
            print(json.dumps(dict(zip(columns, row)), default=default_serializer, indent=2))
        else:
            print("No rows in Order")

        print("\n--- Sample Delivery ---")
        cursor.execute("SELECT * FROM \"Delivery\" LIMIT 1")
        columns = [desc[0] for desc in cursor.description]
        row = cursor.fetchone()
        if row:
            print(json.dumps(dict(zip(columns, row)), default=default_serializer, indent=2))
        else:
            print("No rows in Delivery")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_rows()
