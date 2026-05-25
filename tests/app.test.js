const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

describe("Health Check", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});