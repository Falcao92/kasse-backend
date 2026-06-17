import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("✅ SERVER STARTET");

// ✅ TEST ROUTE
app.get("/", (req, res) => {
    res.send("✅ Server funktioniert");
});

// 🔒 ENV Variablen
const TENANT = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SITE_ID = process.env.SITE_ID;
const LIST_ID = process.env.CARDS_LIST_ID;

// ✅ TOKEN holen
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
    return data.access_token;
}

// ✅ API ROUTE
app.get("/api/balance", async (req, res) => {

    console.log("✅ API HIT /api/balance");

    const cardId = req.query.id;

    if(!cardId){
        return res.json({ balance: 0 });
    }

    try{
        const token = await getToken();

        const r = await fetch(
            `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID}/items?expand=fields`,
            {
                headers: { Authorization: "Bearer " + token }
            }
        );

        const data = await r.json();

        const card = data.value.find(c => c.fields.Title === cardId);

        return res.json({
            balance: card ? card.fields.balance : 0
        });

    } catch(err){
        console.error(err);
        return res.json({ error: "Server Fehler" });
    }
});

// ✅ START
app.listen(PORT, () => {
    console.log("✅ Server läuft auf Port:", PORT);
});
