const supabase = supabase.createClient(
  'const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

const supabase = supabase.createClient('https://your-project-url.supabase.co', 'your-anon-key');

const form = document.getElementById("rideForm");
const rideList = document.getElementById("rideList");

let rides = JSON.parse(localStorage.getItem("rides")) || [];

function saveRides() {
  localStorage.setItem("rides", JSON.stringify(rides));
}

function displayRides() {
  rideList.innerHTML = "";
  rides.forEach((ride, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ride.date}</strong> - ${ride.destination} (${ride.distance} km)<br/>
      ${ride.notes ? `<em>${ride.notes}</em>` : ""}
    `;
    rideList.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ride = {
    destination: form.destination.value,
    distance: form.distance.value,
    date: form.date.value,
    notes: form.notes.value,
  };

  rides.push(ride);
  saveRides();
  displayRides();
  form.reset();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ride = {
    destination: form.destination.value,
    distance: form.distance.value,
    date: form.date.value,
    notes: form.notes.value,
  };

  rides.push(ride);
  saveRides();
  displayRides();
  form.reset();
});

function displayRides() {
  rideList.innerHTML = "";
  rides.forEach((ride, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ride.date}</strong> - ${ride.destination} (${ride.distance} km)<br/>
      ${ride.notes ? `<em>${ride.notes}</em><br/>` : ""}
      <button class="deleteBtn" data-index="${index}">Delete</button>
    `;
    rideList.appendChild(li);
  });

  // Add event listeners to all delete buttons
  const deleteButtons = document.querySelectorAll(".deleteBtn");
  deleteButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      rides.splice(index, 1); // remove the ride
      saveRides(); // update localStorage
      displayRides(); // re-render the list
    });
  });
}

const themeSelect = document.getElementById("theme");

// Load saved theme from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}

// On change, update theme and save it
themeSelect.addEventListener("change", function () {
  document.body.className = this.value;
  localStorage.setItem("theme", this.value);
});

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

document.getElementById('signupBtn').onclick = async () => {
  const { user, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
};

document.getElementById('loginBtn').onclick = async () => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
};

document.getElementById('logoutBtn').onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

async function loadRides() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading rides:", error.message);
  } else {
    rides = data;
    displayRides();
  }
}
