console.log("Script loaded");

// Initialize Supabase client — replace with your actual keys
const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

console.log("Supabase client initialized");

// Get DOM elements
const rideForm = document.getElementById("rideForm");
const rideList = document.getElementById("rideList");
const themeSelect = document.getElementById("theme");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

let rides = [];

console.log("DOM elements selected");

// Apply saved theme on page load
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = ""; // clear existing classes
    document.body.classList.add(savedTheme);
    themeSelect.value = savedTheme;
    console.log("Applied saved theme:", savedTheme);
  }

  checkUserAndLoadRides();
});

// Theme selector change handler
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  console.log("Theme changed to:", selectedTheme);
  document.body.className = "";
  document.body.classList.add(selectedTheme);
  localStorage.setItem("theme", selectedTheme);
});

// Signup handler
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  console.log("Signing up with:", email);

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Signup error: " + error.message);
    console.error("Signup error:", error);
  } else {
    alert("Check your email to confirm your account.");
  }
});

// Login handler
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  console.log("Logging in with:", email);

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login error: " + error.message);
    console.error("Login error:", error);
  } else {
    alert("Login successful!");
    logoutBtn.style.display = "inline";
    loadRides();
  }
});

// Logout handler
logoutBtn.addEventListener("click", async () => {
  console.log("Logging out");
  await supabase.auth.signOut();
  rides = [];
  displayRides();
  logoutBtn.style.display = "none";
});

// Ride form submit handler
rideForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
  const distance = parseFloat(document.getElementById("distance").value);
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value.trim();

  if (!destination || !distance || !date) {
    alert("Please fill in all required fields.");
    return;
  }

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

// Load rides from Supabase for current user
async function loadRides() {
  console.log("Loading rides");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    console.log("No user logged in");
    rideList.innerHTML = "<li>Please log in to see your rides.</li>";
    logoutBtn.style.display = "none";
    return;
  }

  logoutBtn.style.display = "inline";

  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading rides:", error.message);
    rideList.innerHTML = "<li>Error loading rides.</li>";
  } else {
    rides = data;
    displayRides();
  }
}

// Display rides in list with delete buttons
function displayRides() {
  rideList.innerHTML = "";

  if (!rides || rides.length === 0) {
    rideList.innerHTML = "<li>No rides logged yet.</li>";
    return;
  }

  rides.forEach((ride) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ride.date}</strong> - ${ride.destination} (${ride.distance} km)<br/>
      ${ride.notes ? `<em>${ride.notes}</em><br/>` : ""}
      <button class="deleteBtn" data-id="${ride.id}">Delete</button>
    `;
    rideList.appendChild(li);
  });

  // Attach delete event handlers
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const rideId = e.target.dataset.id;
      console.log("Deleting ride id:", rideId);

      const { error } = await supabase.from("rides").delete().eq("id", rideId);

      if (error) {
        alert("Error deleting ride: " + error.message);
      } else {
        loadRides();
      }
    });
  });
}

// Check user on page load and load rides
async function checkUserAndLoadRides() {
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    logoutBtn.style.display = "inline";
    loadRides();
  } else {
    logoutBtn.style.display = "none";
    rideList.innerHTML = "<li>Please log in to see your rides.</li>";
  }
}
