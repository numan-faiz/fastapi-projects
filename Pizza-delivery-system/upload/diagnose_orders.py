import psycopg2

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="postgres",
    user="postgres",
    password="1234"
)

cursor = conn.cursor()

print("\n" + "="*70)
print("DIAGNOSING ORDERS AND USERS")
print("="*70)

# Check all users
cursor.execute('SELECT id, username, email, is_staff, is_active FROM "user" ORDER BY id')
users = cursor.fetchall()

print(f"\n--- USERS IN DATABASE ({len(users)} total) ---")
for user in users:
    user_id, username, email, is_staff, is_active = user
    print(f"  ID: {user_id} | Username: {username} | Staff: {is_staff} | Active: {is_active}")

# Check all orders with their user_id
cursor.execute('SELECT id, user_id, pizza_size, quantity, order_status FROM orders ORDER BY id')
orders = cursor.fetchall()

print(f"\n--- ORDERS IN DATABASE ({len(orders)} total) ---")
for order in orders:
    order_id, user_id, pizza_size, quantity, order_status = order
    print(f"  Order #{order_id} | user_id: {user_id} | Size: {pizza_size} | Qty: {quantity}")

# Check for orders with NULL or invalid user_id
cursor.execute('''
    SELECT o.id, o.user_id
    FROM orders o
    LEFT JOIN "user" u ON o.user_id = u.id
    WHERE u.id IS NULL
    ORDER BY o.id
''')
orphaned_orders = cursor.fetchall()

if orphaned_orders:
    print(f"\n*** PROBLEM FOUND ***")
    print(f"Orders with missing or invalid user_id ({len(orphaned_orders)} total):")
    for order in orphaned_orders:
        order_id, user_id = order
        if user_id is None:
            print(f"  Order #{order_id} has NULL user_id")
        else:
            print(f"  Order #{order_id} has user_id={user_id} but that user doesn't exist!")
else:
    print(f"\n✓ All orders have valid user_id values")

print("\n" + "="*70 + "\n")

cursor.close()
conn.close()
