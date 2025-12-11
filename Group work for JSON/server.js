import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const toursJsonPath = path.join(__dirname, "data", "tours.json");
const bookingsJsonPath = path.join(__dirname, "data", "bookings.json");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); 


let tours = [];
let bookings = [];
let bookingIdCounter = 0;

function loadBookingsFromJSON() {
  if (!fs.existsSync(bookingsJsonPath)) {
    console.warn("bookings.json not found at", bookingsJsonPath);
    return;
  }

  try {
    const json = fs.readFileSync(bookingsJsonPath, "utf-8");
    const result = JSON.parse(json);

    const bookingList = Array.isArray(result.bookings) ? result.bookings : [];

    bookings = bookingList.map((b) => ({
      id: parseInt(b.id),
      name: b.name || "",
      partySize: parseInt(b.partySize) || 0,
      tourId: parseInt(b.tourId),
      time: b.time || "",
      operator: b.operator || "",
    }));

    bookings.forEach((booking) => {
      if (booking.id > bookingIdCounter) bookingIdCounter = booking.id;
    });

    console.log("Loaded bookings from JSON:", bookings.length, "records");
  } catch (e) {
    console.error("Error parsing bookings.json:", e);
  }
}

function saveBookingsToJSON() {
  try {
    const data = { bookings: bookings };
    fs.writeFileSync(bookingsJsonPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Bookings saved to JSON file.");
  } catch (e) {
    console.error("Error saving bookings.json:", e);
  }
}


function loadToursFromJSON() {
  if (!fs.existsSync(toursJsonPath)) {
    console.error("tours.json not found at", toursJsonPath);
    return;
  }

  try {
    const json = fs.readFileSync(toursJsonPath, "utf-8");
    const result = JSON.parse(json);

    const rawTours = result.tours || [];
    const tourList = Array.isArray(rawTours) ? rawTours : [rawTours];

    tours = tourList.map((t) => ({
      id: parseInt(t.id),
      operator: t.operator,
      price: parseFloat(t.price),
      image: t.image,
      location: {
        lat: parseFloat(t.location.lat),
        lng: parseFloat(t.location.lng),
      },
      launches: (t.launches || []).map((l) => ({
        time: l.time,
        capacity: parseInt(l.capacity),
      })),
    }));

    console.log("Loaded tours from JSON:", tours.length, "tours");
  } catch (e) {
    console.error("Error parsing tours.json:", e);
  }
}

function saveToursToJSON() {
  try {
    const data = { tours: tours };
    fs.writeFileSync(toursJsonPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Tours saved to JSON file.");
  } catch (e) {
    console.error("Error saving tours.json:", e);
  }
}


app.get("/api/tours", (req, res) => {
  console.log("get ", tours.length, "tours");
  res.json(tours);
});


app.post("/api/bookings", (req, res) => {
  const { name, partySize, tourId, time } = req.body;
  if (!name || !partySize || !tourId || !time) {
    return res.status(400).json({ error: "Missing booking data" });
  }

  const tour = tours.find((t) => t.id === tourId);
  if (!tour) return res.status(404).json({ error: "Tour not found" });

  const launch = tour.launches.find((l) => l.time === time);
  if (!launch) return res.status(404).json({ error: "Launch time not found" });

  if (launch.capacity < partySize) {
    return res.status(400).json({ error: "Not enough capacity" });
  }

  launch.capacity -= partySize;
  saveToursToJSON();

  const newBooking = {
    id: ++bookingIdCounter,
    name,
    partySize,
    tourId,
    time,
    operator: tour.operator,
  };

  bookings.push(newBooking);
  saveBookingsToJSON();

  res.status(201).json(newBooking);
});


app.get("/api/bookings/:id", (req, res) => {
  const booking = bookings.find((b) => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});


app.delete("/api/bookings/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookingIndex === -1) return res.status(404).json({ error: "Booking not found" });

  const booking = bookings[bookingIndex];

  const tour = tours.find((t) => t.id === booking.tourId);
  const launch = tour.launches.find((l) => l.time === booking.time);
  launch.capacity += booking.partySize;

  bookings.splice(bookingIndex, 1);

  saveToursToJSON();
  saveBookingsToJSON();

  res.json({ message: "Booking cancelled", ...booking });
});



loadBookingsFromJSON();
loadToursFromJSON();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});