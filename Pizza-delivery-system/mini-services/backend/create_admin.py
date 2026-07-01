from database import Session, engine
from models import User
from werkzeug.security import generate_password_hash

session = Session(bind=engine)

# Check existing users
users = session.query(User).all()
print(f'\n=== Current Users in Database ===')
print(f'Total users: {len(users)}\n')

if users:
    for user in users:
        print(f'Username: {user.username}')
        print(f'Email: {user.email}')
        print(f'Is Staff: {user.is_staff}')
        print(f'Is Active: {user.is_active}')
        print('-' * 40)
else:
    print('No users found in database.\n')

# Check if admin user exists
admin_user = session.query(User).filter(User.username == 'admin').first()

if admin_user:
    print(f'\n❌ Admin user already exists!')
    print(f'Username: {admin_user.username}')
    print(f'Email: {admin_user.email}')
    print(f'Is Staff: {admin_user.is_staff}')
    print(f'Is Active: {admin_user.is_active}')
else:
    print('\n✅ Creating admin user...')
    # Create admin user with password: admin123
    new_admin = User(
        username='admin',
        email='admin@pizzadelivery.com',
        password=generate_password_hash('admin123'),
        is_staff=True,
        is_active=True
    )

    session.add(new_admin)
    session.commit()

    print('✅ Admin user created successfully!')
    print(f'Username: admin')
    print(f'Password: admin123')
    print(f'Email: admin@pizzadelivery.com')
    print(f'Is Staff: True')
    print(f'Is Active: True')

session.close()
