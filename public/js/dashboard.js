const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load dashboard data");
  }
  return response.json();
};

const updateStats = async () => {
  const events = await fetchJson("/api/events");

  const totalEvents = events.length;
  const totals = events.reduce(
    (acc, eventItem) => {
      acc.capacity += Number(eventItem.capacity || 0);
      acc.booked += Number(eventItem.booked || 0);
      return acc;
    },
    { capacity: 0, booked: 0 }
  );

  const totalSeats = totals.capacity;
  const bookedSeats = totals.booked;
  const availableSeats = Math.max(totalSeats - bookedSeats, 0);

  document.getElementById("stat-total-events").textContent = totalEvents;
  document.getElementById("stat-total-seats").textContent = totalSeats;
  document.getElementById("stat-booked-seats").textContent = bookedSeats;
  document.getElementById("stat-available-seats").textContent = availableSeats;
};

updateStats().catch((error) => {
  console.error(error);
});
