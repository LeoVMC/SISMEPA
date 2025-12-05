import requests

url = "http://localhost:8000/api/auth/login/"
data = {"username": "admin", "password": "admin123"}
response = requests.post(url, json=data)
token = response.json().get("key")

if token:
    print(f"Token: {token}")
    user_url = "http://localhost:8000/api/auth/user/"
    headers = {"Authorization": f"Token {token}"}
    user_res = requests.get(user_url, headers=headers)
    print("User Data:", user_res.json())
else:
    print("Login failed", response.text)
