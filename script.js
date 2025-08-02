function flowchartEngine(symptoms, context) {
  const lower = context.toLowerCase();

  if (lower.includes("intermittent lower abdominal pain") ||
      lower.includes("pain relieved by defecation") ||
      lower.includes("alternating constipation and diarrhea")) {
    return {
      diagnosis: "Irritable Bowel Syndrome",
      tests: ["Sigmoidoscopy", "Colonoscopy", "Barium enema", "Stool examination"],
      treatment: ["Symptomatic care", "Diet adjustment"],
      followup: ["As needed"],
      ask: "Have you noticed a pattern between defecation and symptom relief?"
    };
  } else if (lower.includes("sudden") ||
             lower.includes("severe pain") ||
             lower.includes("worsening with movement") ||
             lower.includes("high-grade fever") ||
             lower.includes("rebound tenderness")) {
    return {
      diagnosis: "Peritonitis",
      tests: ["Peritoneal fluid culture", "CBC", "Imaging studies"],
      treatment: ["Bowel decompression", "Antibiotics", "Surgery"],
      followup: ["1 week after discharge"],
      ask: "Does the pain worsen significantly when moving or breathing?"
    };
  } else if (lower.includes("dramatic abdominal distention") ||
             lower.includes("fecal vomiting") ||
             lower.includes("high-pitched bowel sounds")) {
    return {
      diagnosis: "Large-Bowel Obstruction",
      tests: ["Serum chemistry", "BUN", "Creatinine", "CBC", "Imaging studies"],
      treatment: ["Bowel decompression", "Surgery", "Prophylactic antibiotics"],
      followup: ["Weekly visits for 2–8 weeks"],
      ask: "Have you experienced bloating with unusual vomiting?"
    };
  } else if ((lower.includes("hypoactive bowel sounds") || lower.includes("hyperactive bowel sounds")) ||
             lower.includes("colicky periumbilical pain")) {
    return {
      diagnosis: "Small-Bowel Obstruction",
      tests: ["Serum chemistry", "BUN", "Creatinine", "CBC", "Imaging studies"],
      treatment: ["Bowel decompression", "Surgery", "Prophylactic antibiotics"],
      followup: ["Weekly visits for 2–8 weeks"],
      ask: "Have you noticed cramping pain in the central abdomen with changes in bowel sounds?"
    };
  }

  return {
    diagnosis: "Symptom not recognized in flowchart",
    ask: "Please describe your symptoms more clearly, including pain location, duration, and any bowel changes."
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = sender === 'You' ? 'user-msg' : 'ai-msg';
    div.textContent = `${sender}: ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const userMsg = input.value.trim();
    if (!userMsg) return;
    appendMessage('You', userMsg);
    input.value = '';

    const result = flowchartEngine([], userMsg);
    let reply = `Possible diagnosis: ${result.diagnosis}\n`;
    if (result.tests) reply += `Recommended tests: ${result.tests.join(', ')}\n`;
    if (result.treatment) reply += `Suggested treatment: ${result.treatment.join(', ')}\n`;
    if (result.followup) reply += `Follow-up: ${result.followup.join(', ')}\n`;
    if (result.ask) reply += `\n${result.ask}`;

    appendMessage('AI', reply);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});
