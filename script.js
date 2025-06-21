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

const bgColorSelect = document.getElementById("bgColor");

bgColorSelect.addEventListener("change", function () {
  document.body.style.backgroundColor = this.value;

  // Optional: Save to localStorage to remember the user's choice
  localStorage.setItem("bgColor", this.value);
});

// Restore background color on page load
const savedBg = localStorage.getItem("bgColor");
if (savedBg) {
  document.body.style.backgroundColor = savedBg;
  bgColorSelect.value = savedBg;
}
