// ==================== NAVBAR ====================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            navLinks.classList.remove("active");
        });
    });
}

// ==================== STUDENT REGISTRATION ====================
let registeredStudents = [];
let currentAvatarData = null;

// Create update overlay first
createRegOverlay();

// Avatar preview (main form)
document.getElementById("regAvatar").addEventListener("change", function () {
    let file = this.files[0];
    let preview = document.getElementById("regAvatarPreview");
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            currentAvatarData = e.target.result;
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Avatar">';
        };
        reader.readAsDataURL(file);
    } else {
        currentAvatarData = null;
        preview.innerHTML = "<span>No photo selected</span>";
    }
});

// Color picker live update (main form)
document.getElementById("regIdColor").addEventListener("input", function () {
    document.getElementById("regColorLabel").textContent = this.value;
    document.getElementById("regAvatarPreview").style.borderColor = this.value;
});

function getRegFormValues() {
    return {
        fullName: document.getElementById("regFullName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        phone: document.getElementById("regPhone").value.trim(),
        gmail: document.getElementById("regGmail").value.trim(),
        address: document.getElementById("regAddress").value.trim(),
        age: document.getElementById("regAge").value,
        course: document.getElementById("regCourse").value,
        faculty: document.getElementById("regFaculty").value,
        avatar: currentAvatarData,
        idColor: document.getElementById("regIdColor").value,
        password: document.getElementById("regPassword").value,
        confirmPassword: document.getElementById("regConfirmPassword").value,
    };
}

function validateRegForm(values) {
    let { fullName, email, phone, gmail, address, age, course, faculty, password, confirmPassword } = values;
    let message = document.getElementById("regMessage");
    let inputs = {
        fullName: document.getElementById("regFullName"),
        email: document.getElementById("regEmail"),
        phone: document.getElementById("regPhone"),
        gmail: document.getElementById("regGmail"),
        address: document.getElementById("regAddress"),
        age: document.getElementById("regAge"),
        course: document.getElementById("regCourse"),
        faculty: document.getElementById("regFaculty"),
        password: document.getElementById("regPassword"),
        confirmPassword: document.getElementById("regConfirmPassword"),
    };

    Object.values(inputs).forEach(function (input) {
        input.classList.remove("error", "success");
    });
    message.textContent = "";
    message.className = "reg-message";

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

function buildRegIdCardHTML(student, forPrint) {
    let avatarHTML = student.avatar
        ? '<img src="' + student.avatar + '" alt="Photo">'
        : "<span>No Photo</span>";
    let colorBorder = forPrint
        ? "border:3px solid rgba(255,255,255,0.6);"
        : "border:3px solid " + student.idColor + ";";

    return (
        '<div class="reg-id-card" style="background-color: ' + student.idColor + ';">' +
            '<div class="reg-avatar-box" style="' + colorBorder + '">' + avatarHTML + "</div>" +
            '<div class="reg-card-name">' + student.fullName + "</div>" +
            '<div class="reg-card-course">' + student.course + " - " + student.faculty + "</div>" +
            '<div class="reg-card-details">' +
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

function buildRegCardActionsHTML(index) {
    return (
        '<div class="reg-card-actions">' +
            '<button class="reg-btn-update" onclick="openRegUpdateForm(' + index + ')">Update</button>' +
            '<button class="reg-btn-print" onclick="printRegCard(' + index + ')">Print</button>' +
            '<button class="reg-btn-remove" onclick="removeRegStudent(this)">Remove</button>' +
        "</div>"
    );
}

function displayRegStudent(student) {
    let cards = document.getElementById("regStudentCards");
    let count = document.getElementById("regStudentCount");
    let idx = registeredStudents.length;

    let card = document.createElement("div");
    card.classList.add("reg-student-card");
    card.setAttribute("data-index", idx);
    card.innerHTML = buildRegIdCardHTML(student, false) + buildRegCardActionsHTML(idx);

    cards.appendChild(card);
    registeredStudents.push(student);
    count.textContent = "Total students: " + registeredStudents.length;
}

function removeRegStudent(button) {
    let card = button.closest(".reg-student-card");
    let index = parseInt(card.getAttribute("data-index"));

    registeredStudents.splice(index, 1);
    card.remove();

    let cards = document.querySelectorAll(".reg-student-card");
    cards.forEach(function (c, i) {
        c.setAttribute("data-index", i);
        let ub = c.querySelector(".reg-btn-update");
        let pb = c.querySelector(".reg-btn-print");
        if (ub) ub.setAttribute("onclick", "openRegUpdateForm(" + i + ")");
        if (pb) pb.setAttribute("onclick", "printRegCard(" + i + ")");
    });

    document.getElementById("regStudentCount").textContent = "Total students: " + registeredStudents.length;
}

function openRegUpdateForm(index) {
    let s = registeredStudents[index];
    let overlay = document.getElementById("regOverlay");

    document.getElementById("regUpdateIndex").value = index;
    document.getElementById("regUpdateFullName").value = s.fullName;
    document.getElementById("regUpdateEmail").value = s.email;
    document.getElementById("regUpdatePhone").value = s.phone;
    document.getElementById("regUpdateGmail").value = s.gmail;
    document.getElementById("regUpdateAddress").value = s.address;
    document.getElementById("regUpdateAge").value = s.age;
    document.getElementById("regUpdateCourse").value = s.course;
    document.getElementById("regUpdateFaculty").value = s.faculty;
    document.getElementById("regUpdateColor").value = s.idColor;
    document.getElementById("regUpdateColorLabel").textContent = s.idColor;

    let prev = document.getElementById("regUpdateAvatarPreview");
    prev.removeAttribute("data-new-avatar");
    prev.innerHTML = s.avatar ? '<img src="' + s.avatar + '" alt="Photo">' : "<span>No Photo</span>";

    overlay.classList.add("active");
}

function closeRegUpdateForm() {
    document.getElementById("regOverlay").classList.remove("active");
}

function saveRegUpdate() {
    let index = parseInt(document.getElementById("regUpdateIndex").value);
    let s = registeredStudents[index];
    let newAvatar = document.getElementById("regUpdateAvatarPreview").getAttribute("data-new-avatar");

    s.fullName = document.getElementById("regUpdateFullName").value.trim();
    s.email = document.getElementById("regUpdateEmail").value.trim();
    s.phone = document.getElementById("regUpdatePhone").value.trim();
    s.gmail = document.getElementById("regUpdateGmail").value.trim();
    s.address = document.getElementById("regUpdateAddress").value.trim();
    s.age = document.getElementById("regUpdateAge").value;
    s.course = document.getElementById("regUpdateCourse").value;
    s.faculty = document.getElementById("regUpdateFaculty").value;
    s.idColor = document.getElementById("regUpdateColor").value;
    if (newAvatar) s.avatar = newAvatar;

    refreshRegCard(index);
    closeRegUpdateForm();
}

function refreshRegCard(index) {
    let s = registeredStudents[index];
    let card = document.querySelector('.reg-student-card[data-index="' + index + '"]');
    card.innerHTML = buildRegIdCardHTML(s, false) + buildRegCardActionsHTML(index);
}

function printRegCard(index) {
    let s = registeredStudents[index];
    let avatarSection = s.avatar
        ? '<img src="' + s.avatar + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.6);display:block;margin:0 auto 14px;">'
        : "";

    let html =
        '<!DOCTYPE html><html><head><title>Student ID Card</title>' +
        '<style>' +
        'body{font-family:Segoe UI,Tahoma,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f0f0f0;}' +
        '.card{width:340px;border-radius:16px;padding:30px;text-align:center;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.2);}' +
        '.card h2{font-size:20px;margin:0 0 4px;}' +
        '.card .course{font-size:13px;opacity:0.9;margin-bottom:16px;}' +
        '.card .details{text-align:left;font-size:13px;line-height:2;background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 16px;}' +
        '.card .details p{margin:0;}' +
        '.card .details strong{display:inline-block;width:70px;}' +
        '@media print{body{background:white;}}' +
        '</style></head><body>' +
        '<div class="card" style="background-color:' + s.idColor + ';">' +
        avatarSection +
        '<h2>' + s.fullName + '</h2>' +
        '<div class="course">' + s.course + ' - ' + s.faculty + '</div>' +
        '<div class="details">' +
        '<p><strong>Email:</strong> ' + s.email + '</p>' +
        '<p><strong>Phone:</strong> ' + s.phone + '</p>' +
        '<p><strong>Gmail:</strong> ' + s.gmail + '</p>' +
        '<p><strong>Address:</strong> ' + s.address + '</p>' +
        '<p><strong>Age:</strong> ' + s.age + '</p>' +
        '<p><strong>Faculty:</strong> ' + s.faculty + '</p>' +
        '</div></div>' +
        '<script>setTimeout(function(){window.print();window.close();},600);<\/script>' +
        '</body></html>';

    let w = window.open("", "_blank", "width=400,height=500");
    if (w) {
        w.document.write(html);
        w.document.close();
    } else {
        alert("Please allow popups to print the student ID card.");
    }
}

function handleRegSubmit(event) {
    event.preventDefault();
    let values = getRegFormValues();
    let isValid = validateRegForm(values);

    if (isValid) {
        displayRegStudent(values);
        document.getElementById("registrationForm").reset();
        currentAvatarData = null;
        document.getElementById("regAvatarPreview").innerHTML = "<span>No photo selected</span>";
        document.getElementById("regColorLabel").textContent = "#667eea";
        document.getElementById("regAvatarPreview").style.borderColor = "#667eea";

        setTimeout(function () {
            let msg = document.getElementById("regMessage");
            msg.textContent = "Registration Successful!";
            msg.className = "reg-message success";
            document.querySelectorAll("#registrationForm input, #registrationForm select").forEach(function (el) {
                el.classList.remove("success");
            });
        }, 100);
    }
}

function createRegOverlay() {
    let overlay = document.createElement("div");
    overlay.id = "regOverlay";
    overlay.classList.add("reg-overlay");

    overlay.innerHTML =
        '<div class="reg-overlay-box">' +
            '<h2>Update Student Info</h2>' +
            '<input type="hidden" id="regUpdateIndex">' +
            '<div class="reg-form-group"><label>Full Name</label><input type="text" id="regUpdateFullName"></div>' +
            '<div class="reg-form-group"><label>Email</label><input type="email" id="regUpdateEmail"></div>' +
            '<div class="reg-form-group"><label>Phone</label><input type="tel" id="regUpdatePhone"></div>' +
            '<div class="reg-form-group"><label>Gmail</label><input type="email" id="regUpdateGmail"></div>' +
            '<div class="reg-form-group"><label>Address</label><input type="text" id="regUpdateAddress"></div>' +
            '<div class="reg-form-group"><label>Age</label><input type="number" id="regUpdateAge" min="10"></div>' +
            '<div class="reg-form-group"><label>Course</label>' +
                '<select id="regUpdateCourse">' +
                    '<option value="JavaScript">JavaScript</option>' +
                    '<option value="Web Design">Web Design</option>' +
                    '<option value="Python">Python</option>' +
                    '<option value="Graphic Design">Graphic Design</option>' +
                '</select></div>' +
            '<div class="reg-form-group"><label>Faculty</label>' +
                '<select id="regUpdateFaculty">' +
                    '<option value="Art">Art</option>' +
                    '<option value="Science">Science</option>' +
                    '<option value="Commercial">Commercial</option>' +
                '</select></div>' +
            '<div class="reg-form-group"><label>Photo</label><input type="file" id="regUpdateAvatar" accept="image/*">' +
                '<div class="reg-avatar-preview" id="regUpdateAvatarPreview"><span>No Photo</span></div></div>' +
            '<div class="reg-form-group"><label>ID Color</label>' +
                '<div class="reg-color-row"><input type="color" id="regUpdateColor" value="#667eea"><span id="regUpdateColorLabel">#667eea</span></div></div>' +
            '<div class="reg-btn-row">' +
                '<button class="reg-btn-save" onclick="saveRegUpdate()">Save</button>' +
                '<button class="reg-btn-cancel" onclick="closeRegUpdateForm()">Cancel</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    // Event listeners for overlay elements
    document.getElementById("regUpdateAvatar").addEventListener("change", function () {
        let file = this.files[0];
        let prev = document.getElementById("regUpdateAvatarPreview");
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                prev.innerHTML = '<img src="' + e.target.result + '" alt="Photo">';
                prev.setAttribute("data-new-avatar", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("regUpdateColor").addEventListener("input", function () {
        document.getElementById("regUpdateColorLabel").textContent = this.value;
    });

    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeRegUpdateForm();
    });
}

document.getElementById("registrationForm").addEventListener("submit", handleRegSubmit);
