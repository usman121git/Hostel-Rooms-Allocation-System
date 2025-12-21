import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "hostel.db")

def get_connection():
    conn = sqlite3.connect(
        DATABASE_PATH,
        check_same_thread=False,
        timeout=10
    )
    conn.row_factory = sqlite3.Row
    return conn
