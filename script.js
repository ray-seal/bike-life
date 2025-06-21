const supabase = supabase.createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
);

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const themeSelect = document.getElementById("theme");
const distanceSpan = document.getElementById("distance");
const topSpeedSpan = document.getElementById("topSpeed");
const avgSpeedSpan = document.getElementById("avgSpeed");

let watchId;
let coords = [];
let startTime;

// THEME
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}
themeSelect.addEventListener("change", function () {
  document.body.className = this.value;
  localStorage.setItem("theme", this.value);
});

// GEO TRACKING
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

startBtn.onclick = () => {
  coords = [];
  startTime = new Date();
  watchId = navigator.geolocation.watchPosition(
    pos => {
      coords.push({ 
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        speed: pos.coords.speed || 0,
        time: new Date()
      });

      // Update display
      const d = calculateStats().distance;
      distanceSpan.textContent = d.toFixed(2);
    },
    err => alert("GPS error: " + err.message),
    { enableHighAccuracy: true }
  );

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = async () => {
  navigator.geolocation.clearWatch(watchId);
  const stats = calculateStats();

  const name = document.getElementById("name").value;
  const bike = document.getElementById("bike").value;

  const { error } = await supabase.from("rides").insert([
    {
      name,
      bike,
      distance: stats.distance,
      avg_speed: stats.avgSpeed,
      top_speed: stats.topSpeed,
      date: new Date().toISOString()
    }
  ]);

  if (error) alert("Upload failed: " + error.message);
  else alert("Ride saved!");

  // Reset
  startBtn.disabled = false;
  stopBtn.disabled = true;
  distanceSpan.textContent = avgSpeedSpan.textContent = topSpeedSpan.textContent = "0";
};

function calculateStats() {
  if (coords.length < 2) return { distance: 0, avgSpeed: 0, topSpeed: 0 };
  let dist = 0;
  let top = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i-1];
    const b = coords[i];
    dist += getDistance(a.lat, a.lon, b.lat, b.lon);
    if (b.speed && b.speed > top) top = b.speed;
  }

  const duration = (coords.at(-1).time - coords[0].time) / 3600000; // hours
  const avg = dist / duration || 0;

  avgSpeedSpan.textContent = avg.toFixed(1);
  topSpeedSpan.textContent = (top * 3.6).toFixed(1); // m/s to km/h

  return { distance: dist, avgSpeed: avg, topSpeed: top * 3.6 };
}
