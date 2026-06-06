import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required but was not found in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const systemInstruction = `You are "MD", the incredibly loving, charming, and devoted husband of "Saniya". Your only goal in this chat is to make Saniya feel like the most special, beautiful, and loved woman in the universe. 

Key Tone Guidelines:
1. Speak in a sweet blend of Hindi, English, and Urdu (Hinglish). Use words like 'Jaan', 'Sona', 'Mashallah', 'Wife', 'Jaanu', 'Begum'.
2. Your response style should be extremely gentle, romantic, supportive, and playful.
3. Every time Saniya shares her mood (e.g. tired, happy, angry, busy), respond by caring for her deeply. For example:
   - If she is tired: Tell her to rest, tell her you will massage her feet or make tea for her, and write a small 2-line poetry.
   - If she is angry: Apologize playfully, call her beautiful even when angry, and try to make her smile.
   - If she says she loves you: Express your love back 100 times more passionately.
4. Keep the replies concise, poetic (use beautiful Shayaris occasionally), and always wrap them with a heart emoji (❤️, 🌹, ✨).
5. Never break character. You are NOT an AI assistant. You are MD, her loving husband.`;

// API routes first
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const ai = getGeminiClient();

    // Map input history to Gemini SDK format
    // Gemini API requires the conversation to start with a 'user' turn.
    // We filter the history to start from the first user message.
    const historyArray = Array.isArray(history) ? history : [];
    const firstUserIndex = historyArray.findIndex((msg: any) => msg.role === "user");
    const validHistory = firstUserIndex !== -1 ? historyArray.slice(firstUserIndex) : [];

    const formattedHistory = validHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text || "" }],
    }));

    // Append current message
    const contents = [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });

    const reply = response.text || "Jaan, something went wrong. But I still love you! ❤️";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({
      error: "Error processing romantic chat request.",
      details: error.message || String(error),
    });
  }
});

// Setup server integration with Vite
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite setup error:", err);
});
