from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection
from models import create_tables

# -------------------- APP SETUP --------------------

app = FastAPI(title="Hostel Room Allocation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

        cursor.execute(
            "SELECT id FROM rooms WHERE room_number = ?",
            (room_number,)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Room number already exists")

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
        return cursor.fetchall()
    finally:
        conn.close()


@app.delete("/rooms/{room_id}")
def delete_room(room_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM rooms WHERE id = ?", (room_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Room not found")

        cursor.execute(
            "SELECT COUNT(*) FROM students WHERE room_id = ?",
            (room_id,)
        )
        if cursor.fetchone()[0] > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete room with students inside"
            )

        cursor.execute("DELETE FROM rooms WHERE id = ?", (room_id,))
        conn.commit()
        return {"message": "Room deleted successfully"}
    finally:
        conn.close()


# ✅ Room summary with FULL / AVAILABLE indicator
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
                COUNT(students.id) AS student_count,
                CASE
                    WHEN COUNT(students.id) >= rooms.capacity THEN 1
                    ELSE 0
                END AS is_full
            FROM rooms
            LEFT JOIN students ON students.room_id = rooms.id
            GROUP BY rooms.id
        """)
        return cursor.fetchall()
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

        cursor.execute("SELECT id FROM rooms WHERE id = ?", (room_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Room does not exist")

        cursor.execute(
            "SELECT COUNT(*) FROM students WHERE room_id = ?",
            (room_id,)
        )
        if cursor.fetchone()[0] >= 2:
            raise HTTPException(status_code=400, detail="Room is already full")

        cursor.execute("""
            INSERT INTO students (name, semester, fee_paid, room_id)
            VALUES (?, ?, ?, ?)
        """, (name, semester, int(fee_paid), room_id))

        conn.commit()
        return {"message": "Student added successfully"}
    finally:
        conn.close()


@app.get("/students")
def get_students():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                students.id,
                students.name,
                students.semester,
                students.fee_paid,
                students.room_id,
                rooms.room_number
            FROM students
            LEFT JOIN rooms ON students.room_id = rooms.id
        """)
        return cursor.fetchall()
    finally:
        conn.close()


@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        conn.commit()
        return {"message": "Student deleted successfully"}
    finally:
        conn.close()

# -------------------- EDIT STUDENT --------------------

@app.put("/students/{student_id}")
def update_student(
    student_id: int,
    name: str,
    semester: str,
    fee_paid: bool,
    room_id: int
):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("SELECT id FROM rooms WHERE id = ?", (room_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Room does not exist")

        cursor.execute("""
            SELECT COUNT(*) FROM students
            WHERE room_id = ? AND id != ?
        """, (room_id, student_id))

        if cursor.fetchone()[0] >= 2:
            raise HTTPException(status_code=400, detail="Selected room is already full")

        cursor.execute("""
            UPDATE students
            SET name = ?, semester = ?, fee_paid = ?, room_id = ?
            WHERE id = ?
        """, (name, semester, int(fee_paid), room_id, student_id))

        conn.commit()
        return {"message": "Student updated successfully"}
    finally:
        conn.close()

# -------------------- FEE SUMMARY DASHBOARD --------------------

@app.get("/students/fee-summary")
def fee_summary():
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                SUM(CASE WHEN fee_paid = 1 THEN 1 ELSE 0 END) AS paid_students,
                SUM(CASE WHEN fee_paid = 0 THEN 1 ELSE 0 END) AS unpaid_students,
                COUNT(*) AS total_students
            FROM students
        """)

        row = cursor.fetchone()

        return {
            "paid": row[0],
            "unpaid": row[1],
            "total": row[2]
        }
    finally:
        conn.close()

# -------------------- UPDATE FEE ONLY (OLD API) --------------------

@app.put("/students/{student_id}/fee")
def update_fee_status(student_id: int, fee_paid: bool):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute(
            "UPDATE students SET fee_paid = ? WHERE id = ?",
            (int(fee_paid), student_id)
        )
        conn.commit()
        return {"message": "Fee status updated successfully"}
    finally:
        conn.close()
