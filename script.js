// Initialize Supabase
const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

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

// Theme logic
const themes = ["light", "dark", "kawasaki", "suzuki", "ducati", "honda"];

const savedTheme = localStorage.getItem("theme");
if (savedTheme && themes.includes(savedTheme)) {
  document.body.classList.add(savedTheme);
  themeSelect.value = savedTheme;
} else {
  // Default to light if no saved or invalid theme
  document.body.classList.add("light");
  themeSelect.value = "light";
}

themeSelect.addEventListener("change", function () {
  // Remove all theme classes first
  themes.forEach(t => document.body.classList.remove(t));
  // Add the selected theme
  document.body.classList.add(this.value);
  localStorage.setItem("theme", this.value);
});

// Load rides from Supabase
async function loadRides() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading rides:", error.message);
  } else {
    rides = data;
    displayRides();
  }
}

// Display rides
function displayRides() {
  rideList.innerHTML = "";
  rides.forEach((ride) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ride.date}</strong> - ${ride.destination} (${ride.distance} km)<br/>
      ${ride.notes ? `<em>${ride.notes}</em><br/>` : ""}
      <button class="deleteBtn" data-id="${ride.id}">Delete</button>
    `;
    rideList.appendChild(li);
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const rideId = e.target.dataset.id;
      const { error } = await supabase.from("rides").delete().eq("id", rideId);
      if (error) {
        alert("Error deleting ride: " + error.message);
      } else {
        loadRides();
      }
    });
  });
}

// Add ride
rideForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const destination = document.getElementById("destination").value;
  const distance = parseFloat(document.getElementById("distance").value);
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    alert("You must be logged in to save a ride.");
    return;
  }

  const { error } = await supabase.from("rides").insert([
    {
      user_id: user.id,
      destination,
      distance,
      date,
      notes,
    },
  ]);

  if (error) {
    alert("Error saving ride: " + error.message);
  } else {
    rideForm.reset();
    loadRides();
  }
});

// Signup
signupBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    alert("Signup error: " + error.message);
  } else {
    alert("Check your email to confirm your account.");
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    alert("Login error: " + error.message);
  } else {
    logoutBtn.style.display = "inline";
    loadRides();
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  rides = [];
  displayRides();
  logoutBtn.style.display = "none";
});

// Auto-load rides if already logged in
window.addEventListener("DOMContentLoaded", async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    logoutBtn.style.display = "inline";
    loadRides();
  }
});
