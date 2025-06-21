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

// Theme logic: apply saved theme on load and setup change listener
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = ""; // clear existing classes
    document.body.classList.add(savedTheme);
    themeSelect.value = savedTheme;
  }

  // Load rides if user is logged in
  loadRides();
});

themeSelect.addEventListener("change", function () {
  // Clear all theme classes from body
  document.body.className = "";
  // Add selected theme class
  document.body.classList.add(this.value);
  // Save selected theme
  localStorage.setItem("theme", this.value);

  // Show visible feedback on page (bottom-right corner)
  let feedback = document.getElementById("themeFeedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "themeFeedback";
    feedback.style.position = "fixed";
    feedback.style.bottom = "10px";
    feedback.style.right = "10px";
    feedback.style.backgroundColor = "rgba(0,0,0,0.7)";
    feedback.style.color = "white";
    feedback.style.padding = "5px 10px";
    feedback.style.borderRadius = "5px";
    feedback.style.zIndex = 1000;
    document.body.appendChild(feedback);
  }
  feedback.textContent = `Theme changed to: ${this.value}`;
});

// Load rides from Supabase
async function loadRides() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
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

// Display rides
function displayRides() {
  rideList.innerHTML = "";
  if (rides.length === 0) {
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

  const destination = document.getElementById("destination").value.trim();
  const distance = parseFloat(document.getElementById("distance").value);
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value.trim();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    alert("You must be logged in to save a ride.");
    return;
  }

  if (!destination || !distance || !date) {
    alert("Please fill in all required fields.");
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
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("Signup error: " + error.message);
  } else {
    alert("Check your email to confirm your account.");
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

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
