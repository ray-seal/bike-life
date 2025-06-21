// Initialize Supabase
const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

// DOM Elements
const form = document.getElementById('rideForm');
const riderNameInput = document.getElementById('riderName');
const bikeNameInput = document.getElementById('bikeName');
const distanceDisplay = document.getElementById('distance');
const topSpeedDisplay = document.getElementById('topSpeed');
const avgSpeedDisplay = document.getElementById('avgSpeed');
const themeSelect = document.getElementById('theme');

// Theme Setup
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}
themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value;
  localStorage.setItem("theme", themeSelect.value);
});

// Ride Tracking Logic
let positions = [];
let watchId;
let startTime;

form.addEventListener("submit", function (e) {
  e.preventDefault();
  positions = [];
  startTime = Date.now();
  
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    handlePosition,
    (err) => alert("Error: " + err.message),
    { enableHighAccuracy: true, maximumAge: 1000 }
  );

  alert("Tracking started! Ride safely 🏍️");
});

function handlePosition(pos) {
  const { latitude, longitude, speed } = pos.coords;
  const timestamp = pos.timestamp;

  positions.push({ latitude, longitude, speed: speed || 0, timestamp });

  if (positions.length > 1) {
    const dist = calcTotalDistance(positions).toFixed(2);
    const topSpeed = calcTopSpeed(positions).toFixed(1);
    const avgSpeed = calcAverageSpeed(positions).toFixed(1);

    distanceDisplay.textContent = dist;
    topSpeedDisplay.textContent = topSpeed;
    avgSpeedDisplay.textContent = avgSpeed;

    // Save every 1km or on change
    if (dist >= 1 && dist % 1 < 0.05) {
      saveRideData(dist, topSpeed, avgSpeed);
    }
  }
}

function calcTotalDistance(posArray) {
  let total = 0;
  for (let i = 1; i < posArray.length; i++) {
    total += getDistance(posArray[i - 1], posArray[i]);
  }
  return total;
}

function getDistance(p1, p2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in km
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);
  const lat1 = toRad(p1.latitude);
  const lat2 = toRad(p2.latitude);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcTopSpeed(posArray) {
  return Math.max(...posArray.map(p => (p.speed || 0) * 3.6)); // m/s to km/h
}

function calcAverageSpeed(posArray) {
  if (posArray.length < 2) return 0;
  const dist = calcTotalDistance(posArray);
  const durationHrs = (posArray.at(-1).timestamp - posArray[0].timestamp) / (1000 * 60 * 60);
  return dist / durationHrs;
}

async function saveRideData(distance, topSpeed, avgSpeed) {
  const name = riderNameInput.value;
  const bike = bikeNameInput.value;

  const { error } = await supabase.from("rides").insert([
    {
      name,
      bike,
      distance_km: parseFloat(distance),
      top_speed_kph: parseFloat(topSpeed),
      avg_speed_kph: parseFloat(avgSpeed),
      timestamp: new Date().toISOString(),
    }
  ]);

  if (error) {
    console.error("Error saving ride:", error.message);
  }
}
