// Supabase setup
const supabase = supabase.createClient(
  'https://viybvomulregopxuuoak.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJ2b211bHJlZ29weHV1b2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTYwNjIsImV4cCI6MjA2NjA5MjA2Mn0.QGb-_kmJcSV_-huSPod8OERvtFWSXkJprtxSnFNleMU'
);

// DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const distanceEl = document.getElementById('distance');
const avgSpeedEl = document.getElementById('avgSpeed');
const topSpeedEl = document.getElementById('topSpeed');
const themeSelect = document.getElementById('theme');

let watchId = null;
let positions = [];
let totalDistance = 0;
let topSpeed = 0;

themeSelect.addEventListener("change", function () {
  document.body.className = this.value;
  localStorage.setItem("theme", this.value);
});

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}

// Haversine formula
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Start tracking
startBtn.addEventListener('click', () => {
  positions = [];
  totalDistance = 0;
  topSpeed = 0;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const coords = pos.coords;
      const timestamp = pos.timestamp;

      if (positions.length > 0) {
        const last = positions[positions.length - 1];
        const dist = calcDistance(
          last.coords.latitude,
          last.coords.longitude,
          coords.latitude,
          coords.longitude
        );
        totalDistance += dist;

        const timeDiff = (timestamp - last.timestamp) / 1000 / 3600;
        const speed = dist / timeDiff;
        if (speed > topSpeed) topSpeed = speed;
      }

      positions.push({ coords, timestamp });

      const avgSpeed = totalDistance / ((positions[positions.length - 1].timestamp - positions[0].timestamp) / 1000 / 3600);
      distanceEl.textContent = totalDistance.toFixed(2);
      avgSpeedEl.textContent = avgSpeed.toFixed(2);
      topSpeedEl.textContent = topSpeed.toFixed(2);
    },
    (err) => alert('Error accessing location: ' + err.message),
    { enableHighAccuracy: true }
  );

  startBtn.disabled = true;
  stopBtn.disabled = false;
});

// Stop tracking and upload
stopBtn.addEventListener('click', async () => {
  navigator.geolocation.clearWatch(watchId);

  const name = document.getElementById('riderName').value;
  const bike = document.getElementById('bikeModel').value;

  const avgSpeed = parseFloat(avgSpeedEl.textContent);
  const topSpeedValue = parseFloat(topSpeedEl.textContent);
  const distance = parseFloat(distanceEl.textContent);

  const { error } = await supabase.from("gps_rides").insert([
    {
      name,
      bike,
      distance,
      avg_speed: avgSpeed,
      top_speed: topSpeedValue,
      date: new Date().toISOString()
    }
  ]);

  if (error) alert("Error saving ride: " + error.message);
  else alert("Ride saved!");

  startBtn.disabled = false;
  stopBtn.disabled = true;
});
