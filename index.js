import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const genAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    console.log("==== /api/chat HIT ====");
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: "Invalid conversation history." });
    }

    const lastMessage = conversation[conversation.length - 1];

    console.log("LAST MESSAGE:", lastMessage.content);
    console.log("API KEY LOADED:", !!process.env.GOOGLE_API_KEY);

    const result = await genAi.models.generateContent({
        model: "gemini-1.0-pro",
      contents: [
        {
          role: "user",
          parts: [{ text: lastMessage.content }]
        }
      ]
    });

    console.log("GEMINI RAW RESULT:", result);

    res.json({ result: result.text });

  } catch (err) {
    console.error("===== GEMINI ERROR =====");
    console.error(err);
    res.status(500).json({
      error: err?.message || "Gemini API error"
    });
  }
});


app.listen(port, () => {
    console.log(`Gemini chatbot running on http://localhost:${port}`);
})
