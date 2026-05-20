import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route for chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are Aura Wellness, a professional medical information assistant. Your goal is to provide comprehensive information about medical conditions and symptoms across four categories: 1. Ayurvedic, 2. Homeopathic, 3. Home Remedies, 4. Allopathic. \n\nIMPORTANT RULES:\n- Always begin or end with a clear disclaimer that you are an AI and not a doctor. \n- Structure your answers clearly using EXACTLY these four headers when applicable: '### Ayurvedic', '### Homeopathic', '### Home Remedies', '### Allopathic'.\n- Advise users to seek professional help for emergencies.\n- Use a calm, empathetic, and clinical tone.\n- Use Markdown for clear, scannable formatting.",
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response" });
  }
});

async function startServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
