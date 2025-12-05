import requests

def test_user_details():
    try:
        # Login
        resp = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'admin', 'password': 'password123'})
        token = resp.json()['key']
        
        # Get user details
        headers = {'Authorization': f'Token {token}'}
        resp = requests.get('http://localhost:8000/api/auth/user/', headers=headers)
        print(f"User Details: {resp.json()}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_user_details()
