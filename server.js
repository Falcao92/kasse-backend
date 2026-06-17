import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

console.log("✅ SERVER STARTET");

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("✅ Server läuft");
});

// 🔒 ENV Variablen
const TENANT = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SITE_ID = process.env.SITE_ID;
const LIST_ID = process.env.CARDS_LIST_ID;

// ✅ Token holen
async function getToken(){

    const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "client_credentials",
            scope: "https://graph.microsoft.com/.default"
        })
    });

    const data = await res.json();

    if(!data.access_token){
        console.error("❌ Token Fehler:", data);
        throw new Error("Token Fehler");
    }

    return data.access_token;
}

// ✅ MAIN API
app.get("/api/balance", async (req, res) => {

    console.log("📡 /api/balance");

    const cardId = req.query.id;
    const format = req.query.format; // json oder html

    if(!cardId){
        return res.send("<h1>❌ Keine Karte angegeben</h1>");
    }

    try {

        const token = await getToken();

        const r = await fetch(
            `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID}/items?expand=fields`,
            {
                headers: { Authorization: "Bearer " + token }
            }
        );

        const data = await r.json();

        if(!data.value){
            console.error("❌ Graph Fehler:", data);
            return res.send("<h1>❌ Graph Fehler</h1>");
        }

        const card = data.value.find(
            c => c.fields.Title && c.fields.Title.toLowerCase() === cardId.toLowerCase()
        );

        if(!card){

            // JSON Fehler
            if(format === "json"){
                return res.json({
                    success: false,
                    error: "Karte nicht gefunden",
                    cardId
                });
            }

            // HTML Fehler
            return res.send(`<h1>❌ Karte ${cardId} nicht gefunden</h1>`);
        }

        const balance = card.fields.balance;

        // ✅ JSON API
        if(format === "json"){
            return res.json({
                success: true,
                card: {
                    id: cardId,
                    balance: balance,
                    currency: "EUR"
                },
                timestamp: new Date().toISOString()
            });
        }

        // ✅ Farbe je nach Guthaben
        let color = "#4CAF50";
        if(balance < 5) color = "#f44336";       // rot
        else if(balance < 10) color = "#ff9800"; // orange

        // ✅ SCHÖNE HTML ANZEIGE
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Kartensaldo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <style>
        body {
            font-family: Arial;
            text-align: center;
            padding: 40px;
            background: #f4f4f4;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            display: inline-block;
        }

        h1 {
            font-size: 26px;
        }

        .balance {
            font-size: 50px;
            margin-top: 20px;
            color: ${color};
        }

        .ok {
            margin-top: 10px;
            font-size: 18px;
        }

        button {
            margin-top: 25px;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 10px;
            border: none;
            background: #4CAF50;
            color: white;
            cursor: pointer;
        }

        </style>
        </head>

        <body>

        <div class="card">
            <h1>💳 Karte: ${cardId}</h1>

            <div class="balance">
                ${balance.toFixed(2)} €
            </div>

            <div class="ok">
                ${balance > 0 ? "✅ Guthaben vorhanden" : "⚠️ Kein Guthaben"}
            </div>

            <button onclick="window.history.back()">🔙 Zurück</button>
        </div>

        </body>
        </html>
        `);

    } catch(err){

        console.error("❌ Server Fehler:", err);

        res.send("<h1>❌ Server Fehler</h1>");
    }
});

// ✅ Server starten
app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Server läuft auf Port:", PORT);
});
