import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
const app = express();

const genAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));


console.log(process.env.GOOGLE_API_KEY);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));



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
        model: GEMINI_MODEL,
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
