// ==========================================================
// CONFIG — Proxy Worker URL
// ==========================================================
const CONFIG = {
  WORKER_URL: "https://geminiproxy.samiaazahid01.workers.dev" 
};

// Internal status tracker only
let currentStatus = "Ready";

const userTextEl = document.getElementById("userText");
const botReplyEl = document.getElementById("botReply");
const micBtn = document.getElementById("micBtn");
const waveContainer = document.getElementById("waveContainer");

// ==========================================================
// Voices — cache them and pick a female voice for replies
// ==========================================================
let cachedVoices = [];
function loadVoices() {
  cachedVoices = window.speechSynthesis.getVoices();
}
loadVoices();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickFemaleVoice(lang) {
  if (!cachedVoices.length) return null;
  const langMatches = cachedVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
  const pool = langMatches.length ? langMatches : cachedVoices;
  const femaleByName = pool.find(v =>
    /female|zira|samantha|jenny|susan|victoria|karen|moira|tessa|fiona|aria|salli|joanna/i.test(v.name)
  );
  return femaleByName || pool[0] || null;
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setStatus("This browser does not support voice recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.classList.add("listening");
  waveContainer.classList.add("active");
  setStatus("Listening...");

  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript.trim();
    userTextEl.textContent = text;
    respond(text);
  };

  recognition.onerror = function () {
    micBtn.classList.remove("listening");
    waveContainer.classList.remove("active");
    setStatus("Could not hear you, please try again.");
  };

  recognition.onend = function () {
    micBtn.classList.remove("listening");
    waveContainer.classList.remove("active");
  };

  recognition.start();
}

function setStatus(text) {
  currentStatus = text;
}

// ==========================================================
// MAIN RESPONSE FUNCTION
// ==========================================================
async function respond(text) {
  const lower = text.toLowerCase();

  if (lower.includes("who created you") || lower.includes("who made you")) {
    return finishTurn("I was created by Samia.");
  }

  if (lower.includes("time")) {
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return finishTurn("The current time is " + t);
  }

  if (lower.includes("date")) {
    return finishTurn("Today's date is " + new Date().toDateString());
  }

  const sites = {
    "open google": ["Opening Google.", "https://www.google.com"],
    "open youtube": ["Opening YouTube.", "https://www.youtube.com"],
    "open instagram": ["Opening Instagram.", "https://www.instagram.com"],
    "open whatsapp": ["Opening WhatsApp Web.", "https://web.whatsapp.com"],
    "open chatgpt": ["Opening ChatGPT.", "https://chat.openai.com"],
    "open snapchat": ["Opening SnapChat.", "https://www.snapchat.com"]
  };
  for (const key in sites) {
    if (lower.includes(key)) {
      window.open(sites[key][1]);
      return finishTurn(sites[key][0]);
    }
  }

  if (lower.includes("bye")) {
    return finishTurn("Goodbye! Take care.");
  }

  if (lower.includes("thank you")) {
    return finishTurn("You're welcome!");
  }

  setStatus("Thinking...");
  const reply = await askGemini(text);
  finishTurn(reply);
}

// ==========================================================
// GEMINI API CALL (VIA CLOUDFLARE PROXY)
// ==========================================================
async function askGemini(userText) {
  if (!CONFIG.WORKER_URL) {
    return "Worker URL missing.";
  }

  const body = {
    system_instruction: {
      parts: [{
        text: "You are SIA, a friendly female voice assistant created by Samia. " +
              "Always answer in 1 to 3 short sentences, since your reply will be spoken out loud. " +
              "Detect the language the user is writing or speaking in, and always reply fluently in " +
              "that same language, whatever it is. If someone asks who made or created you, always say " +
              "Samia created you, answered in the same language as their question."
      }]
    },
    contents: [
      { role: "user", parts: [{ text: userText }] }
    ]
  };

  try {
    const res = await fetch(CONFIG.WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error("Worker/Gemini API error:", res.status);
      return "Something went wrong with the proxy worker. Please try again.";
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : "Sorry, I couldn't get a reply.";
  } catch (err) {
    console.error("Network/Proxy error:", err);
    return "There seems to be a connection problem.";
  }
}

// ==========================================================
// SHOW + SPEAK
// ==========================================================
function finishTurn(reply) {
  botReplyEl.textContent = reply;
  setStatus("Ready");
  speak(reply);
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  const voice = pickFemaleVoice(utterance.lang);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => waveContainer.classList.add("active");
  utterance.onend = () => waveContainer.classList.remove("active");

  window.speechSynthesis.speak(utterance);
}
