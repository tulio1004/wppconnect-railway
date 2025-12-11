const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const wppconnect = require("@wppconnect-team/wppconnect");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

// ------------------------
// SWAGGER CONFIG
// ------------------------
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WPPConnect Railway Full API",
      version: "1.0.0",
      description: "Complete WPPConnect server with Swagger documentation"
    }
  },
  apis: ["./src/server.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let client;

/**
 * @openapi
 * /session/start:
 *   get:
 *     tags:
 *       - Session
 *     summary: Inicializa uma sessão WPPConnect
 *     description: Retorna status da sessão e mostra o QR Code nos logs do Railway.
 *     responses:
 *       200:
 *         description: Sessão iniciada com sucesso.
 */
app.get("/session/start", async (req, res) => {
  try {
    wppconnect.create({
      session: "default",
      puppeteerOptions: {
        headless: true,
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    }).then(c => {
      client = c;
      console.log("WPPConnect session started");
      res.json({
        status: "started",
        message: "Scan QR Code in Railway logs"
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /message:
 *   post:
 *     tags:
 *       - Message
 *     summary: Envia uma mensagem de texto pelo WhatsApp.
 *     description: Requer número e mensagem no corpo da requisição.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 example: "5581999999999"
 *               message:
 *                 type: string
 *                 example: "Olá! Teste enviado via API."
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso.
 *       400:
 *         description: Client não inicializado.
 */
app.post("/message", async (req, res) => {
  const { number, message } = req.body;

  if (!client)
    return res.status(400).json({ error: "Client not initialized" });

  try {
    const result = await client.sendText(`${number}@c.us`, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - System
 *     summary: Status geral da API
 *     responses:
 *       200:
 *         description: API online.
 */
app.get("/health", (req, res) => {
  res.json({ status: "online" });
});

app.listen(port, () => {
  console.log("Server running on port:", port);
});
