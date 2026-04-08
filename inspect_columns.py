import psycopg2
import urllib.parse

DATABASE_URL = "postgresql://neondb_owner:npg_MOq0Wvd9Ugwx@ep-aged-salad-ad56givo-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?schema=public&sslmode=require&channel_binding=require"

def inspect_columns():
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
        
        tables = ['Delivery', 'Order', 'User', 'FuelInventory']
        
        for table in tables:
            print(f"\n--- Columns in {table} ---")
            try:
                cursor.execute(f"""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}';
                """)
                columns = cursor.fetchall()
                if not columns:
                    # Try lowercase if case sensitive
                    cursor.execute(f"""
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = '{table.lower()}';
                    """)
                    columns = cursor.fetchall()
                
                for col in columns:
                    print(f"{col[0]}: {col[1]}")
            except Exception as e:
                print(f"Error inspecting {table}: {e}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_columns()
