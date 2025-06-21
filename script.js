// Supabase initialization (CDN version)
const supabaseUrl = 'https://viybvomulregopxuuoak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM elements
const rideForm = document.getElementById("rideForm");
const rideList = document.getElementById("rideList");
const themeSelect = document.getElementById("theme");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

let rides = [];

// Load saved theme from localStorage and apply it
const savedTheme = localStorage.getItem("theme") || "light";
document.body.className = savedTheme;
themeSelect.value = savedTheme;

// Theme change handler
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  document.body.className = selectedTheme;
  localStorage.setItem("theme", selectedTheme);
});

// Display rides in the list
function displayRides() {
  rideList.innerHTML = "";
  rides.forEach(ride => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ride.date}</strong> - ${ride.destination} (${ride.distance} km)<br/>
      ${ride.notes ? `<em>${ride.notes}</em><br/>` : ""}
      <button class="deleteBtn" data-id="${ride.id}">Delete</button>
    `;
    rideList.appendChild(li);
  });

  // Attach delete handlers
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const rideId = e.target.dataset.id;
      const { error } = await supabase
        .from("rides")
        .delete()
        .eq("id", rideId);

      if (error) {
        alert("Error deleting ride: " + error.message);
      } else {
        loadRides();
      }
    });
  });
}

// Load rides for logged-in user
async function loadRides() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    rides = [];
    displayRides();
    return;
  }

  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    alert("Error loading rides: " + error.message);
    return;
  }

  rides = data;
  displayRides();
}

// Add ride submit handler
rideForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
  const distance = parseFloat(document.getElementById("distance").value);
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value.trim();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please login first to save rides.");
    return;
  }

  const { error } = await supabase
    .from("rides")
    .insert([{ user_id: user.id, destination, distance, date, notes }]);

  if (error) {
    alert("Error adding ride: " + error.message);
  } else {
    rideForm.reset();
    loadRides();
  }
});

// Signup handler
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Signup failed: " + error.message);
  } else {
    alert("Signup successful! Please check your email to confirm.");
  }
});

// Login handler
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login failed: " + error.message);
  } else {
    logoutBtn.style.display = "inline-block";
    loadRides();
  }
});

// Logout handler
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  rides = [];
  displayRides();
  logoutBtn.style.display = "none";
});

// On page load, check if user is logged in and load rides
window.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    logoutBtn.style.display = "inline-block";
    loadRides();
  }
});
