import sqlite3
from pathlib import Path
from werkzeug.security import check_password_hash

# Connect to database
db_path = Path(__file__).resolve().parent / "pizza.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n" + "="*60)
print("COMPARING USER PASSWORD HASHES")
print("="*60)

# Get admin user
cursor.execute("SELECT id, username, password, is_staff, is_active FROM user WHERE username = 'admin'")
admin = cursor.fetchone()

# Get a working user (john)
cursor.execute("SELECT id, username, password, is_staff, is_active FROM user WHERE username = 'john'")
john = cursor.fetchone()

print("\n--- ADMIN USER ---")
if admin:
    admin_id, admin_username, admin_password, admin_staff, admin_active = admin
    print(f"ID: {admin_id}")
    print(f"Username: {admin_username}")
    print(f"Is Staff: {bool(admin_staff)}")
    print(f"Is Active: {bool(admin_active)}")
    print(f"Password Hash Method: {admin_password.split(':')[0] if admin_password else 'None'}")
    print(f"Full Hash (first 80 chars): {admin_password[:80] if admin_password else 'None'}")

    # Test if password verification works
    print(f"\nTesting password 'admin123':")
    if admin_password:
        try:
            result = check_password_hash(admin_password, 'admin123')
            print(f"  check_password_hash result: {result}")
        except Exception as e:
            print(f"  ERROR: {e}")
    else:
        print(f"  No password hash set!")

print("\n--- JOHN USER (working login) ---")
if john:
    john_id, john_username, john_password, john_staff, john_active = john
    print(f"ID: {john_id}")
    print(f"Username: {john_username}")
    print(f"Is Staff: {bool(john_staff)}")
    print(f"Is Active: {bool(john_active)}")
    print(f"Password Hash Method: {john_password.split(':')[0] if john_password else 'None'}")
    print(f"Full Hash (first 80 chars): {john_password[:80] if john_password else 'None'}")

print("\n--- HASH FORMAT COMPARISON ---")
if admin and john:
    admin_method = admin_password.split(':')[0] if admin_password else 'None'
    john_method = john_password.split(':')[0] if john_password else 'None'
    print(f"Admin hash method: {admin_method}")
    print(f"John hash method: {john_method}")
    if admin_method != john_method:
        print(f"\n*** MISMATCH DETECTED ***")
        print(f"Admin uses '{admin_method}' but John uses '{john_method}'")
        print(f"This could be causing the login issue!")

print("\n" + "="*60)

conn.close()
