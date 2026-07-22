# SIA — Voice Assistant

A browser-based voice assistant with a live, morphing orb animation and Gemini AI-powered answers.

🔗 **Live demo:** https://samiaazahid.github.io/voice-assistant/

## Features

-  Voice input using the Web Speech API
-  Spoken replies with a female voice
-  Answers any question via the Gemini API, in whatever language you ask
-  Instant local commands (no API call needed) for time, date, and opening websites
-  A liquid, morphing orb that moves while listening or speaking, and freezes when idle

## Tech stack

- HTML, CSS, JavaScript (no frameworks)
- Web Speech API (`SpeechRecognition` + `SpeechSynthesis`)
- [Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)

## Setup

1. Clone or download this repo
2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
3. Open `script.js` and add your key:
   ```js
   const CONFIG = {
     GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",
     GEMINI_MODEL: "gemini-2.5-flash"
   };
   ```
4. Open `index.html` in a browser — that's it, no build step required

## ⚠️ Security note

This is a client-side project, so the API key is visible in the browser and in this repository's source. The key used here is restricted to the Gemini API only and scoped to the free tier, which limits potential misuse. For a production app, move the API call behind a small backend or serverless proxy so the key is never exposed to the browser.

## Voice commands

| You say | SIA does |
|---|---|
| "What time is it?" | Tells the current time |
| "What's the date?" | Tells today's date |
| "Open Google / YouTube / Instagram / WhatsApp / ChatGPT" | Opens the site |
| "Who made you?" | "I was created by Samia." |
| Anything else | Answered by Gemini |

## Credits

Created by Samia.
