import { useEffect, useState } from "react";

const BASE_URL = "https://hostel-rooms-allocation-system-2.onrender.com";

function App() {
  // ---------------- STATES ----------------
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [studentFeeFilter, setStudentFeeFilter] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [seatFilter, setSeatFilter] = useState("");
  const [sortKey, setSortKey] = useState("");

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [feePaid, setFeePaid] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const loadStudents = () => {
    fetch(`${BASE_URL}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data));
  };

  const loadRooms = () => {
    fetch(`${BASE_URL}/rooms/summary`)
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
      ? `${BASE_URL}/students/${editingId}?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`
      : `${BASE_URL}/students?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`;

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

    fetch(`${BASE_URL}/students/${id}`, {
      method: "DELETE",
    }).then(() => {
      loadStudents();
      loadRooms();
    });
  };

  // ---------------- FEE TOGGLE ----------------
  const updateFeeStatus = (id, currentStatus) => {
    fetch(
      `${BASE_URL}/students/${id}/fee?fee_paid=${!currentStatus}`,
      { method: "PUT" }
    ).then(() => loadStudents());
  };

  // ---------------- ROOM ACTIONS ----------------
  const addRoom = () => {
    fetch(`${BASE_URL}/rooms?room_number=${roomNumber}`, {
      method: "POST",
    }).then(() => {
      setRoomNumber("");
      loadRooms();
    });
  };

  const deleteRoom = (id) => {
    if (!window.confirm("Delete this room?")) return;

    fetch(`${BASE_URL}/rooms/${id}`, {
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

  return (
    /* UI CODE UNCHANGED */
    <div style={page}>
      {/* rest of your JSX exactly same */}
    </div>
  );
}

export default App;
