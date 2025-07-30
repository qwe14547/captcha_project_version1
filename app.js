const canvas = document.getElementById("captchaCanvas");
const ctx = canvas.getContext("2d");
const reloadBtn = document.getElementById("reloadBtn");
const checkBtn = document.getElementById("checkBtn");
const captchaInput = document.getElementById("captchaInput");
const statusText = document.getElementById("statusText");

let currentCaptcha = "";
let attemptCount = 0;
const maxAttempts = 3;
let captchaTimer;

function getRandomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateCaptchaText(length = 6) {
  let captcha = "";
  for (let i = 0; i < length; i++) {
    captcha += getRandomChar();
  }
  return captcha;
}

function drawCaptcha() {
  clearTimeout(captchaTimer);
  currentCaptcha = generateCaptchaText();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "30px Arial";
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";

  for (let i = 0; i < currentCaptcha.length; i++) {
    const x = 20 + i * 30;
    const y = canvas.height / 2;
    const angle = (Math.random() - 0.5) * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(currentCaptcha[i], 0, 0);
    ctx.restore();
  }

  // Noise lines
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
  }

  captchaTimer = setTimeout(() => {
    statusText.textContent = "Captcha expired. Reloading...";
    statusText.style.color = "orange";
    drawCaptcha();
  }, 60000); // Expire after 60 seconds
}

function speakCaptcha() {
  const utter = new SpeechSynthesisUtterance(currentCaptcha.split('').join(' '));
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}

checkBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const userInput = captchaInput.value.trim();

  if (userInput.toLowerCase() === currentCaptcha.toLowerCase()) {
    statusText.textContent = "Success! Captcha matched.";
    statusText.style.color = "green";
    attemptCount = 0;
  } else {
    attemptCount++;
    if (attemptCount >= maxAttempts) {
      statusText.textContent = "Too many attempts. Locked out temporarily.";
      statusText.style.color = "red";
      checkBtn.disabled = true;
      setTimeout(() => {
        attemptCount = 0;
        checkBtn.disabled = false;
        statusText.textContent = "Try again.";
        statusText.style.color = "black";
        drawCaptcha();
      }, 10000); // Lockout for 10 seconds
      return;
    }
    statusText.textContent = `Incorrect. ${maxAttempts - attemptCount} attempt(s) left.`;
    statusText.style.color = "red";
  }

  setTimeout(() => {
    statusText.textContent = "";
    captchaInput.value = "";
    drawCaptcha();
  }, 3000);
});

reloadBtn.addEventListener("click", function () {
  drawCaptcha();
  captchaInput.value = "";
  statusText.textContent = "";
});

drawCaptcha();