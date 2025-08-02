import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv'; // npm install node-fetch@2
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Your Hugging Face API key
const HF_API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, deepGen.js, script.js, style.css)
app.use(express.static(__dirname));
app.use('/test-data', express.static(path.join(__dirname, 'test-data')));

// Proxy endpoint to Hugging Face API
app.post('/api/deepseek', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('Error forwarding request:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
