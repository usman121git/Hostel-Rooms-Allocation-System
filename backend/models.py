from database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # Rooms table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number INTEGER UNIQUE,
        capacity INTEGER
    )
    """)

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        semester TEXT,
        fee_paid INTEGER,
        room_id INTEGER,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
    """)

    conn.commit()
    conn.close()
