import { useEffect, useState } from "react";

function App() {
  // ---------------- STUDENTS STATE ----------------
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [feePaid, setFeePaid] = useState(false);
  const [roomId, setRoomId] = useState("");

  // ---------------- ROOMS STATE ----------------
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");

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

  // ---------------- STUDENT ACTIONS ----------------
  const addStudent = () => {
    fetch(
      `http://127.0.0.1:8000/students?name=${name}&semester=${semester}&fee_paid=${feePaid}&room_id=${roomId}`,
      { method: "POST" }
    ).then(() => {
      setName("");
      setSemester("");
      setRoomId("");
      loadStudents();
      loadRooms();
    });
  };

  const deleteStudent = (id) => {
    fetch(`http://127.0.0.1:8000/students/${id}`, {
      method: "DELETE",
    }).then(() => {
      loadStudents();
      loadRooms();
    });
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
    fetch(`http://127.0.0.1:8000/rooms/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => loadRooms());
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hostel Room Allocation System</h1>

      {/* ---------------- ROOMS SECTION ---------------- */}
      <h2>Rooms</h2>
      <input
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />
      <button onClick={addRoom}>Add Room</button>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Room Number</th>
           <th>Capacity</th>
<th>Students</th>
<th>Action</th>

          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.room_number}</td>
             <td>{r.capacity}</td>
<td>{r.student_count} / {r.capacity}</td>
<td>
  <button onClick={() => deleteRoom(r.id)}>Delete</button>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* ---------------- STUDENTS SECTION ---------------- */}
      <h2>Add Student</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      />
      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={feePaid}
          onChange={(e) => setFeePaid(e.target.checked)}
        />
        Fee Paid
      </label>
      <br />
      <button onClick={addStudent}>Add Student</button>

      <h2>Students List</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Semester</th>
            <th>Fee Paid</th>
            <th>Room</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.semester}</td>
              <td>{s.fee_paid ? "Yes" : "No"}</td>
              <td>{s.room_number}</td>
              <td>
                <button onClick={() => deleteStudent(s.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
