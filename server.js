import express from "express";
import fetch from "node-fetch";
import cors from "cors";

app.use(cors());

const app = express();
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
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
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
        throw new Error("Token konnte nicht geholt werden");
    }

    return data.access_token;
}

// ✅ Guthaben API
app.get("/api/balance", async (req, res) => {

    console.log("📡 /api/balance aufgerufen");

    const cardId = req.query.id;

    if(!cardId){
        return res.json({ balance: 0 });
    }

    try {

        const token = await getToken();

        const url = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID}/items?expand=fields`;

        const r = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await r.json();

        // 🔴 Debug falls etwas schiefgeht
        if(!data.value){
            console.error("❌ Graph Fehler:", data);
            return res.json({ error: "Graph Fehler" });
        }

        // ✅ Karte suchen
        const card = data.value.find(
            c => c.fields.Title && c.fields.Title.toLowerCase() === cardId.toLowerCase()
        );

        // ✅ Antwort
        res.json({
            balance: card ? card.fields.balance : 0
        });

    } catch(err){

        console.error("❌ Server Fehler:", err);

        res.status(500).json({
            error: "Server Fehler"
        });
    }
});

// ✅ Server starten
app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Server läuft auf Port:", PORT);
});
