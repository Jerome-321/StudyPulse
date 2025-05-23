const addClassBtn = document.getElementById('addClassBtn');
const addClassModal = document.getElementById('addClassModal');
const closeAddClass = document.getElementById('closeAddClass');
const addClassForm = document.getElementById('addClassForm');
const timetableBody = document.querySelector('#timetable tbody');

let editIndex = null; // For editing mode

addClassBtn.addEventListener('click', () => {
  editIndex = null; // Reset edit mode
  addClassForm.reset();
  addClassModal.classList.add('active');
});

closeAddClass.addEventListener('click', () => {
  addClassModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
  if (e.target === addClassModal) {
    addClassModal.classList.remove('active');
  }
});

// Get timetable from server
function loadClasses() {
    fetch('api/timetable.php')
        .then(res => res.json())
        .then(classes => {
            timetableBody.innerHTML = '';
            classes.forEach((cls, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cls.day}</td>
                    <td>${cls.time}</td>
                    <td>${cls.room}</td>
                    <td>${cls.course}</td>
                    <td>${cls.type}</td>
                    <td>
                        <button onclick="editClass(${cls.id})">Edit</button>
                        <button onclick="deleteClass(${cls.id})">Delete</button>
                    </td>
                `;
                timetableBody.appendChild(tr);
            });
        });
}

// Save or update class
function saveClass(newClass, id = null) {
    fetch('api/timetable.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...newClass, id})
    })
    .then(res => res.json())
    .then(() => {
        loadClasses();
        addClassForm.reset();
        addClassModal.classList.remove('active');
    });
}

// Delete class
function deleteClass(id) {
    if (!confirm('Delete this class?')) return;
    fetch('api/timetable.php', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id})
    })
    .then(res => res.json())
    .then(() => loadClasses());
}

// Edit class (fetch single class info)
function editClass(id) {
    fetch('api/timetable.php')
        .then(res => res.json())
        .then(classes => {
            const cls = classes.find(c => c.id == id);
            if (!cls) return;
            document.getElementById('classDay').value = cls.day;
            document.getElementById('classTime').value = cls.time;
            document.getElementById('classRoom').value = cls.room;
            document.getElementById('classCourse').value = cls.course;
            document.getElementById('classType').value = cls.type;
            editIndex = id;
            addClassModal.classList.add('active');
        });
}

addClassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newClass = {
        day: document.getElementById('classDay').value,
        time: document.getElementById('classTime').value.trim(),
        room: document.getElementById('classRoom').value.trim(),
        course: document.getElementById('classCourse').value.trim(),
        type: document.getElementById('classType').value
    };
    if (!newClass.day || !newClass.time || !newClass.room || !newClass.course || !newClass.type) {
        alert('Please fill all fields!');
        return;
    }
    saveClass(newClass, editIndex);
    editIndex = null;
});

window.addEventListener('DOMContentLoaded', loadClasses);
