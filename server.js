import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("✅ SERVER STARTET");

// ✅ TEST ROUTE
app.get("/", (req, res) => {
    res.send("✅ Server funktioniert");
});

// ✅ API ROUTE
app.get("/api/balance", async (req, res) => {

    console.log("✅ API HIT");

    const cardId = req.query.id;

    if(!cardId){
        return res.json({ balance: 0 });
    }

    try {

        // 👉 NUR TEST (ohne Graph!)
        return res.json({
            balance: 123
        });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Fehler" });
    }
});

app.listen(PORT, () => {
    console.log("✅ Server läuft auf Port:", PORT);
});
