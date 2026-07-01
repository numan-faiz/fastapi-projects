import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

# Connect directly to the database
db_path = Path(__file__).resolve().parent / "pizza.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check current admin user
cursor.execute("SELECT id, username, email, password FROM user WHERE username = 'admin'")
admin = cursor.fetchone()

if admin:
    admin_id, username, email, old_password_hash = admin
    print("\n" + "="*50)
    print("CURRENT ADMIN USER")
    print("="*50)
    print(f"ID: {admin_id}")
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Old Password Hash: {old_password_hash[:50]}..." if old_password_hash else "No password set")

    # Generate new password hash for "admin123"
    new_password_hash = generate_password_hash("admin123")

    # Update the password
    cursor.execute("UPDATE user SET password = ? WHERE id = ?", (new_password_hash, admin_id))
    conn.commit()

    print("\n" + "="*50)
    print("PASSWORD RESET SUCCESSFUL")
    print("="*50)
    print(f"Username: admin")
    print(f"Password: admin123")
    print(f"New Password Hash: {new_password_hash[:50]}...")
    print("\n✅ You can now login with:")
    print("   Username: admin")
    print("   Password: admin123")
    print("="*50 + "\n")
else:
    print("\n❌ Admin user not found!")

conn.close()
