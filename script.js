const users = [{ username: "p", password: "testuser" }];

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(div => div.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

function validateRegistration() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  const confirm = document.getElementById("regConfirm").value;
  const first = document.getElementById("firstName").value;
  const last = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  const nameRegex = /^[a-zA-Zא-ת]+$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(first) || !nameRegex.test(last)) {
    alert("First and Last names must contain letters only.");
    return false;
  }
  if (!passRegex.test(pass)) {
    alert("Password must include at least 8 characters, letters and numbers.");
    return false;
  }
  if (pass !== confirm) {
    alert("Passwords do not match.");
    return false;
  }
  if (!emailRegex.test(email)) {
    alert("Invalid email format.");
    return false;
  }

  users.push({ username: user, password: pass });
  alert("Registration successful!");
  showScreen('login');
  return false;
}

function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const error = document.getElementById("loginError");

  const found = users.find(u => u.username === user && u.password === pass);
  if (found) {
    showScreen("game");
    error.textContent = "";
  } else {
    error.textContent = "Incorrect username or password.";
  }
}

function openAbout() {
  document.getElementById("aboutModal").classList.remove("hidden");
}

function closeAbout() {
  document.getElementById("aboutModal").classList.add("hidden");
}

// close with esc
window.addEventListener("keydown", function(e) {
  const modal = document.getElementById("aboutModal");

  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    e.preventDefault();     
    e.stopImmediatePropagation(); 
    closeAbout();
  }
});

// close with click outside the window
window.addEventListener("click", function(e) {
  const modal = document.getElementById("aboutModal");
  if (e.target === modal) {
    closeAbout();
  }
});

// Initialization
window.onload = function () {
  const day = document.getElementById("birthDay");
  const month = document.getElementById("birthMonth");
  const year = document.getElementById("birthYear");
  for (let d = 1; d <= 31; d++) day.innerHTML += `<option>${d}</option>`;
  for (let m = 1; m <= 12; m++) month.innerHTML += `<option>${m}</option>`;
  for (let y = 2025; y >= 1900; y--) year.innerHTML += `<option>${y}</option>`;
  showScreen("welcome");
};
