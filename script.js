let users = [
    { username: "Shivani1", password: "Shi@123", role: "user", locker: "locker1" },
    { username: "admin", password: "admin123", role: "admin", locker: "all" }
  ];
  
  let currentUser = null;
  let inactivityTimer = null;  // Timer for auto logout
  let reservationTimers = {};  // Timers for each locker
  
  // Toggle Password visibility
  function togglePassword() {
    const passField = document.getElementById("password");
    passField.type = passField.type === "password" ? "text" : "password";
  }
  
  // Login Function
  function login() {
    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const error = document.getElementById("login-error");
  
    currentUser = users.find(user => user.username === usernameInput && user.password === passwordInput);
  
    if (currentUser) {
      document.getElementById("login-section").classList.add("hidden");
      document.getElementById("dashboard-section").classList.remove("hidden");
      document.getElementById("welcome-user").innerText = `Welcome, ${currentUser.username}!`;
      renderLockers();
      showNotification("Login successful!");
      error.textContent = "";
      resetInactivityTimer();
    } else {
      error.textContent = "Invalid username or password!";
    }
  }
  
  // Render lockers dynamically
  function renderLockers() {
    const grid = document.getElementById("locker-grid");
    grid.innerHTML = "";
  
    for (let i = 1; i <= 3; i++) {
      const lockerId = `locker${i}`;
  
      if (currentUser.role === "admin" || currentUser.locker === lockerId) {
        const card = document.createElement("div");
        card.className = "locker-card";
        card.id = lockerId;
        card.innerHTML = `
          <h3>Locker ${i}</h3>
          <p class="locker-status available">Available</p>
          <button class="locker-button" onclick="toggleLocker('${lockerId}')">Lock</button>
          <button class="reserve-button" onclick="reserveLocker('${lockerId}')">Reserve (10s)</button>
        `;
        grid.appendChild(card);
      }
    }
  }
  
  // Toggle locker open/lock
  function toggleLocker(lockerId) {
    resetInactivityTimer();
  
    const locker = document.getElementById(lockerId);
    const status = locker.querySelector(".locker-status");
    const button = locker.querySelector(".locker-button");
  
    if (status.classList.contains("available")) {
      status.textContent = "Occupied";
      status.classList.remove("available");
      status.classList.add("occupied");
      button.textContent = "Open";
      logActivity(`${lockerId} Locked`);
      showNotification(`${lockerId} locked successfully!`);
    } else {
      status.textContent = "Available";
      status.classList.remove("occupied");
      status.classList.add("available");
      button.textContent = "Lock";
      logActivity(`${lockerId} Opened`);
      showNotification(`${lockerId} opened successfully!`);
    }
  }
  
  // Reserve Locker
  function reserveLocker(lockerId) {
    resetInactivityTimer();
  
    if (reservationTimers[lockerId]) {
      showNotification("Already reserved!");
      return;
    }
  
    toggleLocker(lockerId);
    showNotification(`${lockerId} Reserved for 10 seconds!`);
    logActivity(`${lockerId} Reserved`);
  
    reservationTimers[lockerId] = setTimeout(() => {
      toggleLocker(lockerId);  // Auto-release locker after time
      showNotification(`${lockerId} Reservation expired!`);
      logActivity(`${lockerId} Reservation expired`);
      delete reservationTimers[lockerId];
    }, 10000); // 10 seconds
  }
  
  // Show notification
  function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 3000);
  }
  
  // Log activities
  function logActivity(activity) {
    const historyLog = document.getElementById("history-log");
    const li = document.createElement("li");
    const now = new Date();
    li.innerText = `${activity} @ ${now.toLocaleTimeString()}`;
    historyLog.appendChild(li);
  }
  
  // Logout function
  function logout() {
    currentUser = null;
    clearTimeout(inactivityTimer);
    document.getElementById("dashboard-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }
  
  // Inactivity Timer Functions
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      alert("Session expired due to inactivity.");
      logout();
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  // Modal for Password Change
  function showChangePassword() {
    document.getElementById("password-modal").classList.remove("hidden");
  }
  
  function closeModal() {
    document.getElementById("password-modal").classList.add("hidden");
    document.getElementById("password-error").textContent = "";
  }
  
  // Change Password Logic
  function changePassword() {
    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const error = document.getElementById("password-error");
  
    if (newPassword === "" || confirmPassword === "") {
      error.textContent = "Please fill both fields!";
    } else if (newPassword !== confirmPassword) {
      error.textContent = "Passwords do not match!";
    } else {
      currentUser.password = newPassword;
      users = users.map(user =>
        user.username === currentUser.username ? { ...user, password: newPassword } : user
      );
      closeModal();
      showNotification("Password changed successfully!");
    }
  }
  