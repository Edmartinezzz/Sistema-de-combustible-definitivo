import sqlite3
import os

DB_PATH = 'database.db'

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: No existe {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- Agendamientos Entregados ---")
    cursor.execute("SELECT count(*), sum(litros) FROM agendamientos WHERE estado = 'entregado'")
    res = cursor.fetchone()
    print(f"Total entregados: {res[0]}")
    print(f"Total litros entregados: {res[1]}")
    
    print("\n--- Retiros Directos ---")
    cursor.execute("SELECT count(*), sum(litros) FROM retiros")
    res = cursor.fetchone()
    print(f"Total retiros: {res[0]}")
    print(f"Total litros retiros: {res[1]}")
    
    print("\n--- Agendamientos Totales por Estado ---")
    cursor.execute("SELECT estado, count(*) FROM agendamientos GROUP BY estado")
    for row in cursor.fetchall():
        print(f"{row[0]}: {row[1]}")

    conn.close()

if __name__ == "__main__":
    check_db()
