const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

// Theme change
const themeSelect = document.getElementById("theme");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}
themeSelect.addEventListener("change", function () {
  document.body.className = this.value;
  localStorage.setItem("theme", this.value);
});

// GPS tracking
let watchId = null;
let positions = [];
let startTime = null;
let maxSpeed = 0;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const rideData = document.getElementById("rideData");

startBtn.addEventListener("click", () => {
  const name = document.getElementById("riderName").value.trim();
  const bike = document.getElementById("bikeModel").value.trim();

  if (!name || !bike) {
    alert("Please enter your name and bike model.");
    return;
  }

  startTime = new Date();
  positions = [];
  maxSpeed = 0;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, speed } = pos.coords;
      if (speed && speed > maxSpeed) maxSpeed = speed;
      positions.push({ lat: latitude, lon: longitude, time: pos.timestamp });
    },
    (err) => {
      status.textContent = "GPS error: " + err.message;
    },
    { enableHighAccuracy: true }
  );

  status.textContent = "Tracking...";
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", async () => {
  if (watchId) navigator.geolocation.clearWatch(watchId);
  stopBtn.disabled = true;
  startBtn.disabled = false;

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000; // seconds
  const distance = calculateDistance(positions); // in km
  const avgSpeed = distance / (duration / 3600); // km/h

  const ride = {
    name: document.getElementById("riderName").value,
    bike: document.getElementById("bikeModel").value,
    distance: distance.toFixed(2),
    avg_speed: avgSpeed.toFixed(2),
    top_speed: (maxSpeed * 3.6).toFixed(2), // m/s to km/h
    timestamp: new Date().toISOString()
  };

  const { error } = await supabase.from("rides").insert([ride]);
  if (error) {
    status.textContent = "Upload error: " + error.message;
  } else {
    status.textContent = "Ride saved!";
  }

  rideData.innerHTML = `
    <li><strong>Name:</strong> ${ride.name}</li>
    <li><strong>Bike:</strong> ${ride.bike}</li>
    <li><strong>Distance:</strong> ${ride.distance} km</li>
    <li><strong>Avg Speed:</strong> ${ride.avg_speed} km/h</li>
    <li><strong>Top Speed:</strong> ${ride.top_speed} km/h</li>
  `;
});

function calculateDistance(coords) {
  const toRad = (value) => (value * Math.PI) / 180;
  let dist = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1], b = coords[i];
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    dist += R * c;
  }
  return dist;
}
