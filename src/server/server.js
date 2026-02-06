import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const result = await model.generateContent(question);
    const response = result.response.text();

    res.json({ answer: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "AI failed to respond." });
  }
});

app.listen(5000, () => console.log("🚀 Gemini server running on port 5000"));
