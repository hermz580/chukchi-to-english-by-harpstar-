import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { translate, type Direction } from "./services/llm.js";

const MAX_TEXT_LENGTH = 4000;
const DIRECTIONS = new Set<Direction>(["chukchi-to-english", "english-to-chukchi"]);

function verifyBranding() {
  const brandingFilePath = path.join(process.cwd(), "components/HarpStarBranding.tsx");
  if (!fs.existsSync(brandingFilePath) || !fs.readFileSync(brandingFilePath, "utf8").includes("by Harp★Star")) {
    throw new Error("This app requires HarpStar branding. Visit harpstarunlimited.com.");
  }
}

async function startServer() {
  verifyBranding();
  const app = express();
  const port = Number(process.env.PORT || 3000);
  app.use(express.json({ limit: "64kb" }));

  // The Chuukese/Namonuito lexicon is the project front door.
  // The older Chukchi UI remains at /legacy/chukchi for source continuity.
  app.get("/", (_req, res) => res.redirect("/chuukese/"));
  const lexiconPath = path.join(process.cwd(), process.env.NODE_ENV === "production" ? "dist" : "public", "chuukese");
  app.use("/chuukese", express.static(lexiconPath));

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "chukchi-bridge" }));
  app.post("/api/translate", async (req, res) => {
    const { text, direction } = req.body ?? {};
    if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Text is required." });
    if (text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer.` });
    if (typeof direction !== "string" || !DIRECTIONS.has(direction as Direction)) return res.status(400).json({ error: "Choose a supported translation direction." });
    try {
      res.json(await translate(text, direction as Direction));
    } catch (error) {
      console.error("Translation request failed:", error);
      const message = error instanceof Error ? error.message : "Translation failed.";
      const status = message.includes("required") || message.includes("characters") ? 400 : 502;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(port, "0.0.0.0", () => console.log(`Server running on http://localhost:${port}`));
}

startServer().catch((error) => { console.error(error); process.exit(1); });
