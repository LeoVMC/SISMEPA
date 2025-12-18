"""
Script para probar detalles de usuario.
Ejecutar: python scripts/test_user.py
"""
import requests


def test_user_details():
    try:
        # Iniciar sesión
        resp = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'admin', 'password': 'password123'})
        token = resp.json()['key']
        
        # Obtener detalles del usuario
        headers = {'Authorization': f'Token {token}'}
        resp = requests.get('http://localhost:8000/api/auth/user/', headers=headers)
        print(f"Detalles del Usuario: {resp.json()}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_user_details()
