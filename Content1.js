// =====================
// 1. Patterns with weights
// =====================
const patterns = [
  { name: "Email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, weight: 40 },
  { name: "Credit Card", regex: /(?:\d{4}[- ]?){3}\d{4}/, weight: 80 },
  { name: "Phone Number", regex: /\b\d{10}\b/, weight: 50 },
  { name: "US SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/, weight: 80 },
  { name: "Aadhaar", regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/, weight: 70 },

  { name: "AWS Key", regex: /AKIA[0-9A-Z]{16}/, weight: 95 },
  { name: "JWT Token", regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, weight: 95 },
  { name: "OpenAI Key", regex: /sk-[A-Za-z0-9]{20,}/, weight: 95 }
];


// =====================
// 2. Feature Extraction
// =====================
function extractFeatures(text){

  const length = text.length

  const digits = (text.match(/\d/g) || []).length
  const letters = (text.match(/[a-zA-Z]/g) || []).length
  const spaces = (text.match(/\s/g) || []).length
  const special = (text.match(/[^a-zA-Z0-9]/g) || []).length

  return {
    digitRatio: digits/(length||1),
    letterRatio: letters/(length||1),
    spaceRatio: spaces/(length||1),
    specialRatio: special/(length||1),
    entropy: entropy(text),
    length
  }

}


// =====================
// 3. ML-style scoring
// =====================

function entropy(str) {

  const map = {}

  for (const c of str) {
    map[c] = (map[c] || 0) + 1
  }

  let e = 0

  for (const k in map) {
    const p = map[k] / str.length
    e -= p * Math.log2(p)
  }

  return e
}

function mlScore(text){

  const f = extractFeatures(text)

  let score = 0

  if(f.digitRatio > 0.7) score += 35
  if(f.specialRatio > 0.25) score += 20
  if(f.entropy > 3.5) score += 30
  if(f.length > 20) score += 10

  if(f.letterRatio > 0.6) score -= 25
  if(f.spaceRatio > 0.35) score -= 15

  return score
}


// =====================
// 4. Final probability
// =====================
function getProbability(text) {

  let regexScore = 0;
  let detectedType = null;

  for (const p of patterns) {
    if (p.regex.test(text)) {
      regexScore = Math.max(regexScore, p.weight);
      detectedType = p.name;
    }
  }

  const aiScore = mlScore(text);

  let finalScore = Math.round((regexScore * 0.7) + (aiScore * 0.3));

  if (finalScore > 100) finalScore = 100;
  if (finalScore < 0) finalScore = 0;

  return { score: finalScore, type: detectedType };

}


// =====================
// 5. Blocking modal
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
// 6. Highlight function
// =====================
function highlightSensitive(el) {

  el.style.backgroundColor = "rgba(255,0,0,0.15)";
  el.style.border = "2px solid #ff4d4d";
  el.style.borderRadius = "6px";
  el.style.boxShadow = "0 0 6px rgba(255,0,0,0.5)";

}


// =====================
// 7. Detection handler
// =====================
let popupShown60to80 = false;

function handleDetection(el, prob, text, detectedType) {

  // reset styles
  el.style.outline = "";
  el.style.textDecoration = "";
  el.style.backgroundColor = "";
  el.style.border = "";
  el.style.boxShadow = "";

  const phoneRegex = /\b\d{10}\b/;

  // phone popup
  if (phoneRegex.test(text)) {

    if (confirm(`📱 Phone number detected. Probability ${prob}%. Continue?`)) {
      return;
    } else {

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = "";
      } else if (el.isContentEditable) {
        el.innerText = "";
      }

      return;
    }

  }

  // sensitivity logic
  if (prob < 40) {

    return;

  } else if (prob < 60) {

    el.style.textDecorationLine = "underline";
    el.style.textDecorationStyle = "wavy";
    el.style.textDecorationColor = "orange";

  } else if (prob < 80) {

    highlightSensitive(el);

    if (!popupShown60to80) {
      alert(`⚠ Sensitive data detected (${prob}%)`);
      popupShown60to80 = true;
    }

  } else {

    highlightSensitive(el);

    showBlockingModal(`⛔ HIGHLY sensitive data detected (${prob}%)`);

  }

  if (chrome.runtime?.id) {

    chrome.runtime.sendMessage({
      type: "sensitiveDetected",
      probability: prob,
      category: detectedType,
      text: text
    });

  }

}


// =====================
// 8. Input listener
// =====================
document.addEventListener("input", (e) => {

  const t = e.target;
  let text = "";

  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
    text = t.value;
  }
  else if (t.isContentEditable) {
    text = t.innerText;
  }
  else {
    return;
  }

  const result = getProbability(text);

  handleDetection(t, result.score, text, result.type);

}, true);


// =====================
// 9. Page-wide scanning
// =====================
function scanPage() {

  const pageText = document.body.innerText.slice(0, 2000);

  const result = getProbability(pageText);

  if (result.score > 90) {

    showBlockingModal(
      "⚠ Sensitive information detected on this page"
    );

  }

}

setTimeout(scanPage, 3000);