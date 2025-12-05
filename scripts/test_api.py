import requests

def test_api():
    try:
        # Login to get token
        resp = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'admin', 'password': 'password123'})
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()['key']
        print(f"Token: {token}")

        # Fetch docentes
        headers = {'Authorization': f'Token {token}'}
        resp = requests.get('http://localhost:8000/api/docentes/', headers=headers)
        print(f"Docentes Status: {resp.status_code}")
        print(f"Docentes Data: {resp.json()}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
