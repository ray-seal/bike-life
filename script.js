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

displayRides();
