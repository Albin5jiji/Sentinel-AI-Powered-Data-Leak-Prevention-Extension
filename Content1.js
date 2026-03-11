// =====================
// 1. Patterns with weights
// =====================
const patterns = [
  { name: "Email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, weight: 40 },
  { name: "Credit Card", regex: /(?:\d{4}[- ]?){3}\d{4}/, weight: 80 },
  { name: "Phone Number", regex: /\b\d{10}\b/, weight: 50 },
  { name: "US SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/, weight: 80 },
  { name: "Aadhaar", regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/, weight: 70 }
];

// =====================
// 2. Probability scorer
// =====================
function getProbability(text) {
  let score = 0;
  for (const p of patterns) {
    if (p.regex.test(text)) score += p.weight;
  }
  if (score > 100) score = 100;

  if (score === 0 && text.trim().length > 0) {
    score = Math.floor(Math.random() * 30); // baseline noise
  }
  return score;
}

// =====================
// 3. Blocking modal (80–100%)
// =====================
function showBlockingModal(message) {
  if (document.getElementById("sensitive-blocker")) return;

  const overlay = document.createElement("div");
  overlay.id = "sensitive-blocker";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.color = "white";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontSize = "20px";
  overlay.style.textAlign = "center";
  overlay.style.zIndex = "999999";
  overlay.innerText = message + "\n(Press ESC or wait 10s to dismiss)";

  document.body.appendChild(overlay);

  function escHandler(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", escHandler);
    }
  }
  document.addEventListener("keydown", escHandler);

  setTimeout(() => {
    if (document.getElementById("sensitive-blocker")) {
      overlay.remove();
      document.removeEventListener("keydown", escHandler);
    }
  }, 10000);
}

// =====================
// 4. Detection handler
// =====================
let popupShown60to80 = false;

function handleDetection(el, prob, text) {
  // Reset styles each time
  el.style.outline = "";
  el.style.textDecoration = "none";
  el.style.textDecorationLine = "none";
  el.style.textDecorationStyle = "initial";
  el.style.textDecorationColor = "initial";

  const phoneRegex = /\b\d{10}\b/;

  // --- Case: Phone number → cancellable popup
  if (phoneRegex.test(text)) {
    if (confirm(`📱 Phone number detected. Probability ${prob}%. Do you want to continue?`)) {
      return; // user allowed
    } else {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = "";
      } else if (el.isContentEditable) {
        el.innerText = "";
      }
      return;
    }
  }

  // --- General sensitivity logic
  if (prob < 40) {
    return;
  } else if (prob < 60) {
    // ORANGE wavy underline
    el.style.textDecorationLine = "underline";
    el.style.textDecorationStyle = "wavy";
    el.style.textDecorationColor = "orange";
  } else if (prob < 80) {
    if (!popupShown60to80) {
      alert(`⚠️ Sensitive data detected (Probability ${prob}%). Please be cautious.`);
      popupShown60to80 = true;
    }
  } else {
    showBlockingModal(`⛔ HIGHLY sensitive data detected (${prob}%). Action blocked!`);
  }

  chrome.runtime?.sendMessage?.({
    type: "sensitiveDetected",
    probability: prob,
    text: text
  });
}

// =====================
// 5. Input listener
// =====================
document.addEventListener("input", (e) => {
  const t = e.target;
  let text = "";

  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
    text = t.value;
  } else if (t.isContentEditable) {
    text = t.innerText;
  } else {
    return;
  }

  const prob = getProbability(text);
  handleDetection(t, prob, text);
}, true);
