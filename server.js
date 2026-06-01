require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/eventhub";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    booked: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

const normalizeEvent = (eventDoc) => ({
  id: eventDoc._id.toString(),
  name: eventDoc.name,
  date: eventDoc.date,
  location: eventDoc.location,
  capacity: eventDoc.capacity,
  booked: eventDoc.booked
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/events", async (req, res) => {
  const events = await Event.find().sort({ date: 1 }).lean();
  const normalized = events.map((eventItem) => ({
    id: eventItem._id.toString(),
    name: eventItem.name,
    date: eventItem.date,
    location: eventItem.location,
    capacity: eventItem.capacity,
    booked: eventItem.booked
  }));
  res.json(normalized);
});

app.post("/api/events", async (req, res) => {
  const { name, date, location, capacity } = req.body || {};

  if (!name || !date || !location || !capacity) {
    return res
      .status(400)
      .json({ error: "name, date, location, capacity are required" });
  }

  const parsedCapacity = Number(capacity);
  if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
    return res.status(400).json({ error: "capacity must be a positive number" });
  }

  const newEvent = await Event.create({
    name: String(name).trim(),
    date: String(date),
    location: String(location).trim(),
    capacity: parsedCapacity,
    booked: 0
  });

  res.status(201).json(normalizeEvent(newEvent));
});

app.post("/api/events/:id/book", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "invalid event id" });
  }

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({ error: "event not found" });
  }

  if (event.booked >= 1) {
    return res.status(409).json({ error: "event already booked" });
  }

  event.booked += 1;
  await event.save();
  res.json(normalizeEvent(event));
});

app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "invalid event id" });
  }

  const removed = await Event.findByIdAndDelete(id);
  if (!removed) {
    return res.status(404).json({ error: "event not found" });
  }

  res.json(normalizeEvent(removed));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
    process.exit(1);
  });
