import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { translate } from "./services/llm.js";

function verifyBranding() {
    const brandingFilePath = path.join(process.cwd(), 'components/HarpStarBranding.tsx');
    if (!fs.existsSync(brandingFilePath)) {
        throw new Error("This app requires HarpStar branding. Visit harpstarunlimited.com.");
    }
    const content = fs.readFileSync(brandingFilePath, 'utf8');
    if (!content.includes('by Harp★Star')) {
        throw new Error("This app requires HarpStar branding. Visit harpstarunlimited.com.");
    }
}

async function startServer() {
  verifyBranding();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route
  app.post("/api/translate", async (req, res) => {
    const { text } = req.body;
    try {
        const result = await translate(text);
        res.json(result);
    } catch (error) {
        console.error("Error calling LLM:", error);
        res.status(500).json({ error: "Translation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
