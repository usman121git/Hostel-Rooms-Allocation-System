

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection
from models import create_tables

# -------------------- APP SETUP --------------------

app = FastAPI(title="Hostel Room Allocation System")

# CORS (for React later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables at startup
create_tables()

# -------------------- HOME --------------------

@app.get("/")
def home():
    return {"message": "Hostel Room Allocation System API is running"}

# -------------------- ROOMS --------------------

@app.post("/rooms")
def add_room(room_number: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Prevent duplicate room number
        cursor.execute(
            "SELECT id FROM rooms WHERE room_number = ?",
            (room_number,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Room number already exists"
            )

        cursor.execute(
            "INSERT INTO rooms (room_number, capacity) VALUES (?, ?)",
            (room_number, 2)
        )
        conn.commit()
        return {"message": "Room added successfully"}
    finally:
        conn.close()


@app.get("/rooms")
def get_rooms():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM rooms")
        rooms = cursor.fetchall()
        return rooms
    finally:
        conn.close()


@app.delete("/rooms/{room_id}")
def delete_room(room_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Check if room exists
        cursor.execute(
            "SELECT id FROM rooms WHERE id = ?",
            (room_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )

        # Check if room has students
        cursor.execute(
            "SELECT COUNT(*) FROM students WHERE room_id = ?",
            (room_id,)
        )
        count = cursor.fetchone()[0]

        if count > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete room with students inside"
            )

        cursor.execute(
            "DELETE FROM rooms WHERE id = ?",
            (room_id,)
        )
        conn.commit()
        return {"message": f"Room with id {room_id} deleted successfully"}
    finally:
        conn.close()

# -------------------- STUDENTS --------------------

@app.post("/students")
def add_student(
    name: str,
    semester: str,
    fee_paid: bool,
    room_id: int
):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Check room exists
        cursor.execute(
            "SELECT id FROM rooms WHERE id = ?",
            (room_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Room does not exist"
            )

        # Check room capacity (max 2)
        cursor.execute(
            "SELECT COUNT(*) FROM students WHERE room_id = ?",
            (room_id,)
        )
        count = cursor.fetchone()[0]

        if count >= 2:
            raise HTTPException(
                status_code=400,
                detail="Room is already full (max 2 students)"
            )

        cursor.execute(
            """
            INSERT INTO students (name, semester, fee_paid, room_id)
            VALUES (?, ?, ?, ?)
            """,
            (name, semester, int(fee_paid), room_id)
        )

        conn.commit()
        return {"message": "Student added successfully"}
    finally:
        conn.close()


@app.get("/students")
def get_students():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                students.id,
                students.name,
                students.semester,
                students.fee_paid,
                students.room_id,
                rooms.room_number
            FROM students
            LEFT JOIN rooms ON students.room_id = rooms.id
            """
        )
        students = cursor.fetchall()
        return students
    finally:
        conn.close()


@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM students WHERE id = ?",
            (student_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        cursor.execute(
            "DELETE FROM students WHERE id = ?",
            (student_id,)
        )
        conn.commit()
        return {"message": f"Student with id {student_id} deleted successfully"}
    finally:
        conn.close()
@app.get("/rooms/summary")
def rooms_summary():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                rooms.id,
                rooms.room_number,
                rooms.capacity,
                COUNT(students.id) as student_count
            FROM rooms
            LEFT JOIN students ON students.room_id = rooms.id
            GROUP BY rooms.id
        """)
        return cursor.fetchall()
    finally:
        conn.close()
