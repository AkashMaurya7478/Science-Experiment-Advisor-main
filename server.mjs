import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import { marked } from "marked";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load API key from .env file

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// NVIDIA AI API Config
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY, // Store API key in .env file
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post("/get-response", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [{ role: "user", content: prompt+"You are an science experiment expert give me science experiment that I can perform on given material" }],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: false, // Change to true if streaming responses
    });

    res.json({
      response: marked.parse(completion.choices[0]?.message?.content || "No response", {
        mangle: false,
        headerIds: false
      }),
    });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Failed to fetch response from NVIDIA AI", details: error.message });
  }
});

// Add a route for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
