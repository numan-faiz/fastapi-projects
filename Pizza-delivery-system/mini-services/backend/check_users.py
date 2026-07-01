import sqlite3
from pathlib import Path

# Connect directly to the database
db_path = Path(__file__).resolve().parent / "pizza.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query all users
cursor.execute("SELECT id, username, email, is_staff, is_active FROM user")
users = cursor.fetchall()

print("\n" + "="*50)
print("USERS IN DATABASE")
print("="*50)

if users:
    print(f"\nTotal users found: {len(users)}\n")
    for user in users:
        user_id, username, email, is_staff, is_active = user
        print(f"ID: {user_id}")
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Is Staff: {bool(is_staff)}")
        print(f"Is Active: {bool(is_active)}")
        print("-" * 50)
else:
    print("\nNo users found in database!")
    print("\nThe database exists but is empty.")

conn.close()

print("\n" + "="*50)
