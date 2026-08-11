import "dotenv/config";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./src/app";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start standalone HTTP listener when not running in Vercel serverless environment
if (!process.env.VERCEL && process.env.VERCEL_ENV === undefined) {
  startServer();
}

export default app;
