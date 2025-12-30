import { useEffect, useState } from "react";

function App() {
  // ---------------- STATES ----------------
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState(""); // For students
  const [roomSearch, setRoomSearch] = useState(""); // For rooms
  const [seatFilter, setSeatFilter] = useState(""); // New: filter by available seats
  const [sortKey, setSortKey] = useState("");

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [feePaid, setFeePaid] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const loadStudents = () => {
    fetch("http://127.0.0.1:8000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const loadRooms = () => {
    fetch("http://127.0.0.1:8000/rooms/summary")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  };

  useEffect(() => {
    loadStudents();
    loadRooms();
  }, []);

  // ---------------- ADD / UPDATE STUDENT ----------------
  const addStudent = () => {
    const url = editingId
      ? `http://127.0.0.1:8000/students/${editingId}?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`
      : `http://127.0.0.1:8000/students?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`;

    fetch(url, { method: editingId ? "PUT" : "POST" }).then(() => {
      setName("");
      setSemester("");
      setRoomId("");
      setFeePaid(false);
      setEditingId(null);
      loadStudents();
      loadRooms();
    });
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Delete this student?")) return;

    fetch(`http://127.0.0.1:8000/students/${id}`, {
      method: "DELETE",
    }).then(() => {
      loadStudents();
      loadRooms();
    });
  };

  // ---------------- FEE TOGGLE ----------------
  const updateFeeStatus = (id, currentStatus) => {
    fetch(
      `http://127.0.0.1:8000/students/${id}/fee?fee_paid=${!currentStatus}`,
      { method: "PUT" }
    ).then(() => loadStudents());
  };

  // ---------------- ROOM ACTIONS ----------------
  const addRoom = () => {
    fetch(`http://127.0.0.1:8000/rooms?room_number=${roomNumber}`, {
      method: "POST",
    }).then(() => {
      setRoomNumber("");
      loadRooms();
    });
  };

  const deleteRoom = (id) => {
    if (!window.confirm("Delete this room?")) return;

    fetch(`http://127.0.0.1:8000/rooms/${id}`, {
      method: "DELETE",
    }).then(() => loadRooms());
  };

  // ---------------- FILTER + SORT ----------------
  let filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.semester.toLowerCase().includes(search.toLowerCase())
  );

  if (sortKey) {
    filteredStudents.sort((a, b) =>
      a[sortKey].localeCompare(b[sortKey])
    );
  }

  // ---------------- FILTER ROOMS ----------------
  let filteredRooms = rooms.filter((r) => {
    const availableSeats = r.capacity - r.student_count;

    const matchNumber = r.room_number.toString().includes(roomSearch);
    const matchSeat = seatFilter ? availableSeats === Number(seatFilter) : true;

    return matchNumber && matchSeat;
  });

  // ---------------- DASHBOARD CALCULATIONS ----------------
  const totalRooms = rooms.length;
  const totalStudents = students.length;

  const seatsAvailable = rooms.reduce(
    (sum, r) => sum + (r.capacity - r.student_count),
    0
  );

  const paidStudents = students.filter((s) => s.fee_paid).length;
  const unpaidStudents = totalStudents - paidStudents;

  // ---------------- ROOM FULL CHECK ----------------
  const selectedRoom = rooms.find((r) => r.id === Number(roomId));
  const roomFull =
    selectedRoom && selectedRoom.student_count >= selectedRoom.capacity;

  // ---------------- STYLES ----------------
  const page = { backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "20px", fontFamily: "Arial" };
  const header = { backgroundColor: "#1e3a8a", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center", marginBottom: "25px" };
  const dashboard = { display: "flex", gap: "20px", marginBottom: "25px", flexWrap: "wrap" };
  const card = (bg) => ({ flex: "1 1 180px", backgroundColor: bg, color: "white", padding: "20px", borderRadius: "12px", textAlign: "center" });
  const section = { backgroundColor: "white", padding: "20px", borderRadius: "10px", marginBottom: "25px" };
  const input = { padding: "8px", margin: "5px", borderRadius: "5px" };
  const btn = { padding: "8px 14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", margin: "5px" };
  const delBtn = { ...btn, backgroundColor: "#dc2626" };
  const editBtn = { ...btn, backgroundColor: "#f59e0b" };
  const disabledBtn = { ...btn, backgroundColor: "#9ca3af", cursor: "not-allowed" };
  const table = { width: "100%", borderCollapse: "collapse", marginTop: "10px" };
  const th = { backgroundColor: "#1e3a8a", color: "white", padding: "10px" };
  const td = { padding: "10px", border: "1px solid #ddd", textAlign: "center" };

  const feeBadge = (paid) => ({
    padding: "6px 14px",
    borderRadius: "6px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: paid ? "#16a34a" : "#dc2626",
    cursor: "pointer",
    display: "inline-block",
    minWidth: "80px",
  });

  return (
    <div style={page}>
      <div style={header}>
        <h1>Hostel Room Allocation System</h1>
      </div>

      {/* DASHBOARD */}
      <div style={dashboard}>
        <div style={card("#2563eb")}><h2>{totalRooms}</h2><p>Total Rooms</p></div>
        <div style={card("#16a34a")}><h2>{totalStudents}</h2><p>Total Students</p></div>
        <div style={card("#9333ea")}><h2>{seatsAvailable}</h2><p>Seats Available</p></div>
        <div style={card("#059669")}><h2>{paidStudents}</h2><p>Paid Students</p></div>
        <div style={card("#dc2626")}><h2>{unpaidStudents}</h2><p>Unpaid Students</p></div>
      </div>

      {/* ROOMS */}
      <div style={section}>
        <h2>Rooms</h2>
        <input style={input} placeholder="Room Number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
        <button style={btn} onClick={addRoom}>Add Room</button>

        <br />
        <input
          style={input}
          placeholder="Search by Room Number"
          value={roomSearch}
          onChange={(e) => setRoomSearch(e.target.value)}
        />

        <select
          style={input}
          value={seatFilter}
          onChange={(e) => setSeatFilter(e.target.value)}
        >
          <option value="">All Seats</option>
          <option value="1">1 Seat Available</option>
          <option value="2">2 Seats Available</option>
        </select>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Room</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.room_number}</td>
                <td style={td}>
                  <b style={{ color: r.student_count >= r.capacity ? "red" : "green" }}>
                    {r.student_count >= r.capacity
                      ? "FULL"
                      : `AVAILABLE (${r.capacity - r.student_count} seats)`} 
                  </b>
                </td>
                <td style={td}>
                  <button style={delBtn} onClick={() => deleteRoom(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STUDENTS */}
      <div style={section}>
        <h2>{editingId ? "Edit Student" : "Add Student"}</h2>

        <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />

        <select style={input} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Select Room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.room_number} {r.student_count >= r.capacity ? "(FULL)" : ""}
            </option>
          ))}
        </select>

        <label>
          <input type="checkbox" checked={feePaid} onChange={(e) => setFeePaid(e.target.checked)} /> Fee Paid
        </label>

        <br /><br />

        {roomFull && <p style={{ color: "red", fontWeight: "bold" }}>Selected room is FULL</p>}

        <button style={roomFull ? disabledBtn : btn} onClick={addStudent} disabled={roomFull}>
          {editingId ? "Update Student" : "Add Student"}
        </button>

        <h2>Students List</h2>

        <input style={input} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />

        <select style={input} onChange={(e) => setSortKey(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="semester">Semester</option>
        </select>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Semester</th>
              <th style={th}>Fee</th>
              <th style={th}>Room</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id}>
                <td style={td}>{s.id}</td>
                <td style={td}>{s.name}</td>
                <td style={td}>{s.semester}</td>
                <td style={td}>
                  <span style={feeBadge(s.fee_paid)} onClick={() => updateFeeStatus(s.id, s.fee_paid)}>
                    {s.fee_paid ? "PAID" : "UNPAID"}
                  </span>
                </td>
                <td style={td}>{s.room_number}</td>
                <td style={td}>
                  <button style={editBtn} onClick={() => {
                    setEditingId(s.id);
                    setName(s.name);
                    setSemester(s.semester);
                    setFeePaid(s.fee_paid);
                    setRoomId(s.room_id);
                  }}>
                    Edit
                  </button>
                  <button style={delBtn} onClick={() => deleteStudent(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
