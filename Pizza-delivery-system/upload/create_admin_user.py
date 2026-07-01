import psycopg2
from werkzeug.security import generate_password_hash

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
print("CREATING ADMIN USER IN POSTGRESQL")
print("="*60)

# Check if admin already exists
cursor.execute('SELECT id, username FROM "user" WHERE username = %s', ('admin',))
existing_admin = cursor.fetchone()

if existing_admin:
    print(f"\nAdmin user already exists with ID: {existing_admin[0]}")
else:
    print(f"\nAdmin user not found. Creating now...")

    # Generate password hash for "admin123"
    password_hash = generate_password_hash('admin123')

    # Create admin user
    cursor.execute(
        'INSERT INTO "user" (username, email, password, is_staff, is_active) VALUES (%s, %s, %s, %s, %s) RETURNING id',
        ('admin', 'admin@test.com', password_hash, True, True)
    )

    new_admin_id = cursor.fetchone()[0]
    conn.commit()

    print(f"\n" + "="*60)
    print("ADMIN USER CREATED SUCCESSFULLY")
    print("="*60)
    print(f"ID: {new_admin_id}")
    print(f"Username: admin")
    print(f"Password: admin123")
    print(f"Email: admin@test.com")
    print(f"Is Staff: True")
    print(f"Is Active: True")
    print(f"\n✓ You can now login with:")
    print(f"  Username: admin")
    print(f"  Password: admin123")
    print("="*60)

# Verify by listing all users
cursor.execute('SELECT id, username, email, is_staff, is_active FROM "user" ORDER BY id')
users = cursor.fetchall()

print(f"\n\nAll users in PostgreSQL database:")
print("-" * 60)
for user in users:
    user_id, username, email, is_staff, is_active = user
    print(f"ID: {user_id} | Username: {username} | Staff: {is_staff} | Active: {is_active}")

print("\n")

cursor.close()
conn.close()
