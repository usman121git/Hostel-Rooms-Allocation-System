import { useEffect, useState } from "react";

// AUTOMATICALLY SELECT BACKEND URL
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://127.0.0.1:8000"
  : "https://hostel-rooms-allocation-system-3.onrender.com";

function App() {
  console.log("Current API_BASE_URL:", API_BASE_URL);
  // ---------------- STATES ----------------
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  // ---------------- AUTH STATE ----------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState(""); // For students
  const [studentFeeFilter, setStudentFeeFilter] = useState(""); // New: Paid/Unpaid filter
  const [roomSearch, setRoomSearch] = useState(""); // For rooms
  const [seatFilter, setSeatFilter] = useState(""); // Filter by available seats
  const [sortKey, setSortKey] = useState("");

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [feePaid, setFeePaid] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const loadStudents = () => {
    fetch(`${API_BASE_URL}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const loadRooms = () => {
    fetch(`${API_BASE_URL}/rooms/summary`)
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
      ? `${API_BASE_URL}/students/${editingId}?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`
      : `${API_BASE_URL}/students?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`;

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

    fetch(`${API_BASE_URL}/students/${id}`, {
      method: "DELETE",
    }).then(() => {
      loadStudents();
      loadRooms();
    });
  };

  // ---------------- FEE TOGGLE ----------------
  const updateFeeStatus = (id, currentStatus) => {
    fetch(
      `${API_BASE_URL}/students/${id}/fee?fee_paid=${!currentStatus}`,
      { method: "PUT" }
    ).then(() => loadStudents());
  };

  // ---------------- ROOM ACTIONS ----------------
  const addRoom = () => {
    fetch(`${API_BASE_URL}/rooms?room_number=${roomNumber}`, {
      method: "POST",
    }).then(() => {
      setRoomNumber("");
      loadRooms();
    });
  };

  const deleteRoom = (id) => {
    if (!window.confirm("Delete this room?")) return;

    fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "DELETE",
    }).then(() => loadRooms());
  };

  // ---------------- FILTER + SORT STUDENTS ----------------
  let filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.semester.toLowerCase().includes(search.toLowerCase());

    const matchFee =
      studentFeeFilter === ""
        ? true
        : studentFeeFilter === "paid"
          ? s.fee_paid
          : !s.fee_paid;

    return matchSearch && matchFee;
  });

  if (sortKey) {
    filteredStudents.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
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

  // ---------------- LOGIN HANDLER ----------------
  const handleLogin = () => {
    if (username === "admin123" && password === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials! Try admin123 / 1234");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={page}>
        <div style={{
          maxWidth: "400px",
          margin: "100px auto",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#1e3a8a", marginBottom: "20px" }}>Admin Login</h1>
          <input
            style={{ ...input, width: "90%", padding: "12px", marginBottom: "15px" }}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            style={{ ...input, width: "90%", padding: "12px", marginBottom: "25px" }}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button style={{ ...btn, width: "100%", padding: "12px", fontSize: "16px" }} onClick={handleLogin}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

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

        <input style={input} placeholder="Search by Name/Semester" value={search} onChange={(e) => setSearch(e.target.value)} />

        <select style={input} value={studentFeeFilter} onChange={(e) => setStudentFeeFilter(e.target.value)}>
          <option value="">All Students</option>
          <option value="paid">Paid Students</option>
          <option value="unpaid">Unpaid Students</option>
        </select>

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
