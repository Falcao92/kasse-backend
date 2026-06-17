import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("✅ SERVER STARTET");

// ✅ HARD TEST ROUTE
app.get("/", (req, res) => {
    console.log("ROOT HIT");
    res.send("OK ROOT");
});

app.get("/api/balance", (req, res) => {
    console.log("API HIT");
    res.json({ balance: 123 });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Server läuft auf Port:", PORT);
});
