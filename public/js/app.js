const healthStatus = document.getElementById("health-status");
const eventsList = document.getElementById("events-list");
const eventsEmpty = document.getElementById("events-empty");
const eventForm = document.getElementById("event-form");

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch (err) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json();
};

const renderEvents = (events) => {
  if (!events.length) {
    eventsList.innerHTML = "";
    eventsEmpty.style.display = "block";
    return;
  }

  eventsEmpty.style.display = "none";
  eventsList.innerHTML = events
    .map((eventItem) => {
      return `
        <article class="event">
          <div class="event-title">${eventItem.name}</div>
          <div class="event-meta">
            <span>${eventItem.date}</span>
            <span>${eventItem.location}</span>
            <span>${eventItem.booked}/${eventItem.capacity} booked</span>
          </div>
          <div class="event-actions">
            <button data-action="book" data-id="${eventItem.id}">Book seat</button>
            <button class="secondary" data-action="delete" data-id="${eventItem.id}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
};

const loadHealth = async () => {
  try {
    await fetchJson("/api/health");
    healthStatus.textContent = "Online";
    healthStatus.classList.add("ok");
  } catch (err) {
    healthStatus.textContent = "Offline";
    healthStatus.classList.add("bad");
  }
};

const loadEvents = async () => {
  try {
    const events = await fetchJson("/api/events");
    renderEvents(events);
  } catch (err) {
    alert(err.message);
  }
};

eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(eventForm);
  const payload = {
    name: formData.get("name"),
    date: formData.get("date"),
    location: formData.get("location"),
    capacity: Number(formData.get("capacity"))
  };

  try {
    await fetchJson("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    eventForm.reset();
    await loadEvents();
  } catch (err) {
    alert(err.message);
  }
});

eventsList.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }
  const action = target.dataset.action;
  const id = target.dataset.id;

  try {
    if (action === "book") {
      await fetchJson(`/api/events/${id}/book`, { method: "POST" });
    }
    if (action === "delete") {
      await fetchJson(`/api/events/${id}`, { method: "DELETE" });
    }
    await loadEvents();
  } catch (err) {
    alert(err.message);
  }
});

loadHealth();
loadEvents();
