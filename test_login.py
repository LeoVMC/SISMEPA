import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/auth/login/'
data = json.dumps({'username': '10000000', 'password': 'admin'}).encode('utf-8')
headers = {'Content-Type': 'application/json'}
req = urllib.request.Request(url, data=data, headers=headers)

print(f"Testing login for user: 10000000")
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print("Response:")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}")
    print("Error content:")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Connection Error: {e}")
