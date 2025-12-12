import express from "express";
import fs from "fs";
import QRCode from "qrcode";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = "https://www.sniezka.ua/";

app.use(express.static("public"));

function loadCounter() {
  try {
    return JSON.parse(fs.readFileSync("counter.json")).count;
  } catch {
    return 0;
  }
}

function saveCounter(count) {
  fs.writeFileSync("counter.json", JSON.stringify({ count }));
}

function logScan() {
  const now = new Date();

  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync("logs.json"));
  } catch {}

  logs.push({
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0]
  });

  fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
}

const redirectUrl = "https://YOUR-RENDER-URL.onrender.com/go";

if (!fs.existsSync("qr.png")) {
  QRCode.toFile("qr.png", redirectUrl, { width: 600 });
}

app.get("/go", (req, res) => {
  let count = loadCounter();
  count++;
  saveCounter(count);

  logScan();

  res.redirect(TARGET_URL);
});

app.get("/stats-data", (req, res) => {
  const count = loadCounter();
  res.json({ scans: count });
});

app.get("/stats-graph", (req, res) => {
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync("logs.json"));
  } catch {}

  const daily = {};

  logs.forEach(log => {
    if (!daily[log.date]) daily[log.date] = 0;
    daily[log.date]++;
  });

  res.json(daily);
});

app.get("/qr", (req, res) => {
  res.sendFile(path.resolve("qr.png"));
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
