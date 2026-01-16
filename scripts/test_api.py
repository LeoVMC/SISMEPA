"""
Script para probar la API.
Ejecutar: python scripts/test_api.py
"""
import requests


def test_api():
    try:
        resp = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'admin', 'password': 'password123'})
        if resp.status_code != 200:
            print(f"Error de login: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()['key']
        print(f"Token: {token}")

        headers = {'Authorization': f'Token {token}'}
        resp = requests.get('http://localhost:8000/api/docentes/', headers=headers)
        print(f"Estado Docentes: {resp.status_code}")
        print(f"Datos Docentes: {resp.json()}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_api()
