let registeredStudents = [];
let currentAvatarData = null;

// Create update overlay first so elements exist for event listeners
createUpdateOverlay();

// Avatar preview on file select (main form)
document.getElementById("avatar").addEventListener("change", function () {
  let file = this.files[0];
  let preview = document.getElementById("avatarPreview");

  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      currentAvatarData = e.target.result;
      preview.innerHTML = '<img src="' + e.target.result + '" alt="Avatar">';
    };
    reader.readAsDataURL(file);
  } else {
    currentAvatarData = null;
    preview.innerHTML = '<span>No photo selected</span>';
  }
});

// Color picker live update on avatar preview border (main form)
document.getElementById("idColor").addEventListener("input", function () {
  document.getElementById("colorLabel").textContent = this.value;
  document.getElementById("avatarPreview").style.borderColor = this.value;
});

// Update avatar preview in the update form
document.getElementById("updateAvatar").addEventListener("change", function () {
  let file = this.files[0];
  let preview = document.getElementById("updateAvatarPreview");

  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = '<img src="' + e.target.result + '" alt="Photo">';
      preview.setAttribute("data-new-avatar", e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// Update color picker in the update form
document.getElementById("updateColor").addEventListener("input", function () {
  document.getElementById("updateColorLabel").textContent = this.value;
});

function getFormValues() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    gmail: document.getElementById("gmail").value.trim(),
    address: document.getElementById("address").value.trim(),
    age: document.getElementById("age").value,
    course: document.getElementById("course").value,
    faculty: document.getElementById("faculty").value,
    avatar: currentAvatarData,
    idColor: document.getElementById("idColor").value,
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
  };
}

function validateForm(values) {
  let { fullName, email, phone, gmail, address, age, course, faculty, password, confirmPassword } = values;
  let message = document.getElementById("message");
  let inputs = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    gmail: document.getElementById("gmail"),
    address: document.getElementById("address"),
    age: document.getElementById("age"),
    course: document.getElementById("course"),
    faculty: document.getElementById("faculty"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
  };

  Object.values(inputs).forEach(function (input) {
    input.classList.remove("error", "success");
  });
  message.textContent = "";
  message.className = "message";

  if (fullName === "") {
    message.textContent = "Please enter your full name.";
    message.classList.add("error");
    inputs.fullName.classList.add("error");
    return false;
  }

  if (email === "") {
    message.textContent = "Please enter your email address.";
    message.classList.add("error");
    inputs.email.classList.add("error");
    return false;
  }

  if (email.indexOf("@") === -1) {
    message.textContent = "Please enter a valid email address containing @.";
    message.classList.add("error");
    inputs.email.classList.add("error");
    return false;
  }

  if (phone === "") {
    message.textContent = "Please enter your phone number.";
    message.classList.add("error");
    inputs.phone.classList.add("error");
    return false;
  }

  if (gmail === "") {
    message.textContent = "Please enter your gmail address.";
    message.classList.add("error");
    inputs.gmail.classList.add("error");
    return false;
  }

  if (gmail.indexOf("@") === -1) {
    message.textContent = "Please enter a valid gmail address containing @.";
    message.classList.add("error");
    inputs.gmail.classList.add("error");
    return false;
  }

  if (address === "") {
    message.textContent = "Please enter your address.";
    message.classList.add("error");
    inputs.address.classList.add("error");
    return false;
  }

  if (age === "" || parseInt(age) < 10) {
    message.textContent = "You must be at least 10 years old to register.";
    message.classList.add("error");
    inputs.age.classList.add("error");
    return false;
  }

  if (course === "") {
    message.textContent = "Please select a course.";
    message.classList.add("error");
    inputs.course.classList.add("error");
    return false;
  }

  if (faculty === "") {
    message.textContent = "Please select a faculty.";
    message.classList.add("error");
    inputs.faculty.classList.add("error");
    return false;
  }

  if (password.length < 6) {
    message.textContent = "Password must contain at least 6 characters.";
    message.classList.add("error");
    inputs.password.classList.add("error");
    inputs.confirmPassword.classList.add("error");
    return false;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.classList.add("error");
    inputs.password.classList.add("error");
    inputs.confirmPassword.classList.add("error");
    return false;
  }

  Object.values(inputs).forEach(function (input) {
    input.classList.add("success");
  });

  return true;
}

function buildIdCardHTML(student, forPrint) {
  var avatarHTML = student.avatar
    ? '<img src="' + student.avatar + '" alt="Photo">'
    : "<span>No Photo</span>";

  var colorBorder = forPrint
    ? "border:3px solid rgba(255,255,255,0.6);"
    : "border:3px solid " + student.idColor + ";";

  return (
    '<div class="id-card" style="background-color: ' + student.idColor + ';">' +
      '<div class="avatar-box" style="' + colorBorder + '">' + avatarHTML + "</div>" +
      '<div class="card-name">' + student.fullName + "</div>" +
      '<div class="card-course">' + student.course + " - " + student.faculty + "</div>" +
      '<div class="card-details">' +
        "<p><strong>Email:</strong> " + student.email + "</p>" +
        "<p><strong>Phone:</strong> " + student.phone + "</p>" +
        "<p><strong>Gmail:</strong> " + student.gmail + "</p>" +
        "<p><strong>Address:</strong> " + student.address + "</p>" +
        "<p><strong>Age:</strong> " + student.age + "</p>" +
        "<p><strong>Faculty:</strong> " + student.faculty + "</p>" +
      "</div>" +
    "</div>"
  );
}

function buildCardActionsHTML(index) {
  return (
    '<div class="card-actions">' +
      '<button class="btn-update" onclick="openUpdateForm(' + index + ')">Update</button>' +
      '<button class="btn-print" onclick="printStudentCard(' + index + ')">Print</button>' +
      '<button class="btn-remove" onclick="removeStudent(this)">Remove</button>' +
    "</div>"
  );
}

function displayStudent(student) {
  var studentCards = document.getElementById("studentCards");
  var studentCount = document.getElementById("studentCount");
  var cardIndex = registeredStudents.length;

  var card = document.createElement("div");
  card.classList.add("student-card");
  card.setAttribute("data-index", cardIndex);

  card.innerHTML = buildIdCardHTML(student, false) + buildCardActionsHTML(cardIndex);

  studentCards.appendChild(card);
  registeredStudents.push(student);
  studentCount.textContent = "Total students: " + registeredStudents.length;
}

function removeStudent(button) {
  var card = button.closest(".student-card");
  var index = parseInt(card.getAttribute("data-index"));

  registeredStudents.splice(index, 1);
  card.remove();

  var cards = document.querySelectorAll(".student-card");
  cards.forEach(function (c, i) {
    c.setAttribute("data-index", i);
    var updateBtn = c.querySelector(".btn-update");
    var printBtn = c.querySelector(".btn-print");
    if (updateBtn) updateBtn.setAttribute("onclick", "openUpdateForm(" + i + ")");
    if (printBtn) printBtn.setAttribute("onclick", "printStudentCard(" + i + ")");
  });

  document.getElementById("studentCount").textContent = "Total students: " + registeredStudents.length;
}

function openUpdateForm(index) {
  var student = registeredStudents[index];
  var overlay = document.getElementById("updateOverlay");

  document.getElementById("updateIndex").value = index;
  document.getElementById("updateFullName").value = student.fullName;
  document.getElementById("updateEmail").value = student.email;
  document.getElementById("updatePhone").value = student.phone;
  document.getElementById("updateGmail").value = student.gmail;
  document.getElementById("updateAddress").value = student.address;
  document.getElementById("updateAge").value = student.age;
  document.getElementById("updateCourse").value = student.course;
  document.getElementById("updateFaculty").value = student.faculty;
  document.getElementById("updateColor").value = student.idColor;
  document.getElementById("updateColorLabel").textContent = student.idColor;

  var updatePreview = document.getElementById("updateAvatarPreview");
  updatePreview.removeAttribute("data-new-avatar");
  if (student.avatar) {
    updatePreview.innerHTML = '<img src="' + student.avatar + '" alt="Photo">';
  } else {
    updatePreview.innerHTML = "<span>No Photo</span>";
  }

  overlay.classList.add("active");
}

function closeUpdateForm() {
  document.getElementById("updateOverlay").classList.remove("active");
}

function saveUpdate() {
  var index = parseInt(document.getElementById("updateIndex").value);
  var student = registeredStudents[index];

  var newAvatar = document.getElementById("updateAvatarPreview").getAttribute("data-new-avatar");

  student.fullName = document.getElementById("updateFullName").value.trim();
  student.email = document.getElementById("updateEmail").value.trim();
  student.phone = document.getElementById("updatePhone").value.trim();
  student.gmail = document.getElementById("updateGmail").value.trim();
  student.address = document.getElementById("updateAddress").value.trim();
  student.age = document.getElementById("updateAge").value;
  student.course = document.getElementById("updateCourse").value;
  student.faculty = document.getElementById("updateFaculty").value;
  student.idColor = document.getElementById("updateColor").value;

  if (newAvatar) {
    student.avatar = newAvatar;
  }

  refreshCard(index);
  closeUpdateForm();
}

function refreshCard(index) {
  var student = registeredStudents[index];
  var card = document.querySelector('.student-card[data-index="' + index + '"]');

  card.innerHTML = buildIdCardHTML(student, false) + buildCardActionsHTML(index);
}

function printStudentCard(index) {
  var student = registeredStudents[index];

  var avatarSection = student.avatar
    ? '<img src="' + student.avatar + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.6);display:block;margin:0 auto 14px;">'
    : "";

  var html =
    "<!DOCTYPE html><html><head><title>Student ID Card</title>" +
    "<style>" +
    "body{font-family:Segoe UI,Tahoma,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f0f0f0;}" +
    ".card{width:340px;border-radius:16px;padding:30px;text-align:center;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.2);}" +
    ".card h2{font-size:20px;margin:0 0 4px;}" +
    ".card .course{font-size:13px;opacity:0.9;margin-bottom:16px;}" +
    ".card .details{text-align:left;font-size:13px;line-height:2;background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 16px;}" +
    ".card .details p{margin:0;}" +
    ".card .details strong{display:inline-block;width:70px;}" +
    "@media print{body{background:white;}}" +
    "</style></head><body>" +
    '<div class="card" style="background-color:' + student.idColor + ';">' +
    avatarSection +
    "<h2>" + student.fullName + "</h2>" +
    '<div class="course">' + student.course + " - " + student.faculty + "</div>" +
    '<div class="details">' +
    "<p><strong>Email:</strong> " + student.email + "</p>" +
    "<p><strong>Phone:</strong> " + student.phone + "</p>" +
    "<p><strong>Gmail:</strong> " + student.gmail + "</p>" +
    "<p><strong>Address:</strong> " + student.address + "</p>" +
    "<p><strong>Age:</strong> " + student.age + "</p>" +
    "<p><strong>Faculty:</strong> " + student.faculty + "</p>" +
    "</div></div>" +
    "<script>setTimeout(function(){window.print();window.close();},600);<\/script>" +
    "</body></html>";

  var printWindow = window.open("", "_blank", "width=400,height=500");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert("Please allow popups to print the student ID card.");
  }
}

function handleSubmit(event) {
  event.preventDefault();

  var values = getFormValues();
  var isValid = validateForm(values);

  if (isValid) {
    displayStudent(values);
    document.getElementById("registrationForm").reset();
    currentAvatarData = null;
    document.getElementById("avatarPreview").innerHTML = "<span>No photo selected</span>";
    document.getElementById("colorLabel").textContent = "#4a6fa5";
    document.getElementById("avatarPreview").style.borderColor = "#4a6fa5";

    setTimeout(function () {
      var message = document.getElementById("message");
      message.textContent = "Registration Successful!";
      message.className = "message success";

      var inputs = document.querySelectorAll("#registrationForm input, #registrationForm select");
      inputs.forEach(function (input) {
        input.classList.remove("success");
      });
    }, 100);
  }
}

function createUpdateOverlay() {
  var overlay = document.createElement("div");
  overlay.id = "updateOverlay";
  overlay.classList.add("update-overlay");

  overlay.innerHTML =
    '<div class="update-form-box">' +
      "<h2>Update Student Info</h2>" +
      '<input type="hidden" id="updateIndex">' +
      '<div class="form-group"><label>Full Name</label><input type="text" id="updateFullName"></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="updateEmail"></div>' +
      '<div class="form-group"><label>Phone</label><input type="tel" id="updatePhone"></div>' +
      '<div class="form-group"><label>Gmail</label><input type="email" id="updateGmail"></div>' +
      '<div class="form-group"><label>Address</label><input type="text" id="updateAddress"></div>' +
      '<div class="form-group"><label>Age</label><input type="number" id="updateAge" min="10"></div>' +
      '<div class="form-group"><label>Course</label>' +
        '<select id="updateCourse">' +
          '<option value="JavaScript">JavaScript</option>' +
          '<option value="Web Design">Web Design</option>' +
          '<option value="Python">Python</option>' +
          '<option value="Graphic Design">Graphic Design</option>' +
        "</select></div>" +
      '<div class="form-group"><label>Faculty</label>' +
        '<select id="updateFaculty">' +
          '<option value="Art">Art</option>' +
          '<option value="Science">Science</option>' +
          '<option value="Commercial">Commercial</option>' +
        "</select></div>" +
      '<div class="form-group"><label>Photo</label><input type="file" id="updateAvatar" accept="image/*">' +
        '<div class="avatar-preview" id="updateAvatarPreview"><span>No Photo</span></div></div>' +
      '<div class="form-group"><label>ID Color</label>' +
        '<div class="color-picker-row"><input type="color" id="updateColor" value="#4a6fa5"><span id="updateColorLabel">#4a6fa5</span></div></div>' +
      '<div class="btn-row">' +
        '<button class="btn-save" onclick="saveUpdate()">Save</button>' +
        '<button class="btn-cancel" onclick="closeUpdateForm()">Cancel</button>' +
      "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeUpdateForm();
  });
}

document.getElementById("registrationForm").addEventListener("submit", handleSubmit);
