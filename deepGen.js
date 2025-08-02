import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

window.flowchartData = {};
window.flowchartMd = "";

async function testApiConnection() {
  console.log("Testing proxy API connection...");
  try {
    const res = await fetch("/api/deepseek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello!" }),
    });

    console.log("Response status:", res.status);
    const data = await res.json();

    if (!res.ok) {
      console.error("API returned an error:", data);
    } else {
      console.log("Proxy API connection successful. Response:", data);
    }
  } catch (err) {
    console.error("Failed to connect to the proxy API:", err);
  }
}

async function loadFlowchart() {
  try {
    const res = await fetch("test-data/flowcharts.md");
    const rawText = await res.text();
    window.flowchartMd = rawText;

    const sectionRegex = /### \*\*(\d+\.\s+.+?)\*\*\n+([\s\S]+?)(?=###|\Z)/g;
    const map = {};
    let match;
    while ((match = sectionRegex.exec(rawText)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      map[title] = content;
    }
    window.flowchartData = map;
  } catch (err) {
    console.error("Error loading flowchart:", err);
  }
}

async function sendToAgent(userInput) {
  const prompt =
    `You are a clinical assistant using diagnostic flowcharts.\n\n` +
    `Reference flowcharts below (markdown format):\n\n${window.flowchartMd}\n\n` +
    `Patient description: "${userInput}"\n\n` +
    `Please respond with the most relevant clinical reasoning and next steps based on the flowchart data.`;

  try {
    const res = await fetch("/api/deepseek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // Hugging Face API returns array with generated_text property in most cases
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data.generated_text) {
      return data.generated_text;
    } else {
      return "No answer received from model.";
    }
  } catch (err) {
    console.error("API error:", err);
    return "⚠️ Unable to connect to medical assistant. Please try again later.";
  }
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = sender === "You" ? "user-msg" : "ai-msg";
  div.innerHTML = `<strong>${sender}:</strong><br>${marked.parse(text)}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSend() {
  const inputEl = document.getElementById("user-input");
  const input = inputEl.value.trim();
  if (!input) return;

  appendMessage("You", input);
  inputEl.value = "";

  const reply = await sendToAgent(input);
  appendMessage("AI", reply);
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("send-btn").addEventListener("click", handleSend);
  document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
  loadFlowchart();
  testApiConnection(); // Remove or comment out after confirming connection works
});
