import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="postgres",
    user="postgres",
    password="1234"
)

cursor = conn.cursor()

print("\n" + "="*60)
print("CHECKING ADMIN USER IN POSTGRESQL")
print("="*60)

# Check current admin user
cursor.execute('SELECT id, username, email, password, is_staff, is_active FROM "user" WHERE username = %s', ('admin',))
admin = cursor.fetchone()

if admin:
    admin_id, username, email, old_password_hash, is_staff, is_active = admin
    print(f"\nFound admin user:")
    print(f"  ID: {admin_id}")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    print(f"  Is Staff: {is_staff}")
    print(f"  Is Active: {is_active}")

    if old_password_hash:
        print(f"  Old Password Hash: {old_password_hash[:60]}...")

        # Test current password
        print(f"\nTesting if current password is 'admin123':")
        test_result = check_password_hash(old_password_hash, 'admin123')
        print(f"  Result: {test_result}")

        if not test_result:
            print(f"\n  Password is NOT 'admin123'. Resetting...")

            # Generate new password hash
            new_password_hash = generate_password_hash('admin123')

            # Update the password
            cursor.execute('UPDATE "user" SET password = %s WHERE id = %s', (new_password_hash, admin_id))
            conn.commit()

            print(f"\n" + "="*60)
            print("PASSWORD RESET SUCCESSFUL")
            print("="*60)
            print(f"Username: admin")
            print(f"Password: admin123")
            print(f"New Password Hash: {new_password_hash[:60]}...")
            print(f"\nYou can now login with admin / admin123")
        else:
            print(f"\n  Password is already 'admin123' - no reset needed!")
    else:
        print(f"  ERROR: No password hash found!")
else:
    print("\nERROR: Admin user not found in PostgreSQL database!")

print("="*60 + "\n")

cursor.close()
conn.close()
