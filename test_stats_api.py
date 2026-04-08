import requests
import json

# Configuración
BASE_URL = 'http://localhost:5000'
ADMIN_EMAIL = 'admin'
ADMIN_PASSWORD = 'admin'

def test_stats():
    session = requests.Session()
    
    # 1. Login
    print(f"Iniciando sesión como {ADMIN_EMAIL}...")
    login_resp = session.post(f'{BASE_URL}/api/login', json={
        'username': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD
    })
    
    if login_resp.status_code != 200:
        print(f"Error login: {login_resp.status_code} - {login_resp.text}")
        return
        
    token = login_resp.json().get('token')
    headers = {'x-access-token': token}
    print("Login exitoso.")
    
    # 2. Get Stats
    print("\nConsultando estadísticas...")
    stats_resp = session.get(f'{BASE_URL}/api/estadisticas/retiros', headers=headers)
    
    if stats_resp.status_code == 200:
        data = stats_resp.json()
        print(json.dumps(data, indent=2))
        
        # Verificar si hay datos
        if data['litrosHoy'] == 0 and data['litrosMes'] == 0:
            print("\n⚠️ ALERTA: Las estadísticas están en 0.")
        else:
            print("\n✅ Las estadísticas tienen datos.")
    else:
        print(f"Error stats: {stats_resp.status_code} - {stats_resp.text}")

if __name__ == "__main__":
    test_stats()
