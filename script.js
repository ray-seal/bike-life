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
