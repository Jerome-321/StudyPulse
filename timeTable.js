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

function loadClasses() {
  const classes = JSON.parse(localStorage.getItem('user_classes')) || [];
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
        <button onclick="editClass(${index})" style="margin-right: 4px; background: #ffc107; color: white; border: none; padding: 4px 8px; border-radius: 4px;">Edit</button>
        <button onclick="deleteClass(${index})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px;">Delete</button>
      </td>
    `;
    timetableBody.appendChild(tr);
  });
}

function saveClass(newClass) {
  const classes = JSON.parse(localStorage.getItem('user_classes')) || [];
  if (editIndex !== null) {
    classes[editIndex] = newClass;
  } else {
    classes.push(newClass);
  }
  localStorage.setItem('user_classes', JSON.stringify(classes));
  editIndex = null;
}

addClassForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const day = document.getElementById('classDay').value;
  const time = document.getElementById('classTime').value.trim();
  const room = document.getElementById('classRoom').value.trim();
  const course = document.getElementById('classCourse').value.trim();
  const type = document.getElementById('classType').value;

  if (!day || !time || !room || !course || !type) {
    alert('Please fill all fields!');
    return;
  }

  const newClass = { day, time, room, course, type };
  saveClass(newClass);
  loadClasses();
  addClassForm.reset();
  addClassModal.classList.remove('active');
});

function deleteClass(index) {
  const classes = JSON.parse(localStorage.getItem('user_classes')) || [];
  if (confirm('Are you sure you want to delete this class?')) {
    classes.splice(index, 1);
    localStorage.setItem('user_classes', JSON.stringify(classes));
    loadClasses();
  }
}

function editClass(index) {
  const classes = JSON.parse(localStorage.getItem('user_classes')) || [];
  const cls = classes[index];

  document.getElementById('classDay').value = cls.day;
  document.getElementById('classTime').value = cls.time;
  document.getElementById('classRoom').value = cls.room;
  document.getElementById('classCourse').value = cls.course;
  document.getElementById('classType').value = cls.type;

  editIndex = index;
  addClassModal.classList.add('active');
}

window.addEventListener('DOMContentLoaded', loadClasses);
