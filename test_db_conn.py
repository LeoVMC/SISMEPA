import psycopg2
import traceback

try:
    conn = psycopg2.connect(
        host="localhost",
        database="unefa_monitoring_db",
        user="unefa_user",
        password="123456",
        port="5433"
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    try:
        print(f"Connection failed: {e}")
    except:
        traceback.print_exc()
