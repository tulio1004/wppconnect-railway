const express = require("express");
const cors = require("cors");
const wppconnect = require("@wppconnect-team/wppconnect");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 21465;
const SESSION = process.env.SESSION || "default";
const SECRET_KEY = process.env.SECRET_KEY || "mysecret";

app.get("/", (req, res) => {
  res.send({ status: "online" });
});

app.get("/qrcode", (req, res) => {
  res.send({ message: "Use /start to initialize the session" });
});

let client = null;

app.get("/start", async (req, res) => {
  try {
    wppconnect
      .create({
        session: SESSION,
        catchQR: (qr) => {
          console.log("QR RECEIVED:", qr);
        },
        puppeteerOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      })
      .then((_client) => {
        client = _client;
        res.send({
          status: "INITIALIZING",
          message: "Check logs for QR Code base64",
        });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
