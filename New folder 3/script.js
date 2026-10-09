
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const chat = document.getElementById("chat");
const send = document.getElementById("send");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function ask(question) {
  input.value = question;
  form.requestSubmit();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question || send.disabled) return;

  chat.querySelector(".welcome")?.remove();

  addMessage(question, "user");
  input.value = "";
  send.disabled = true;

  const reply = addMessage("Thinking...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || `Request failed: HTTP ${response.status}`
      );
    }

    reply.textContent = data.answer || "The AI returned an empty answer.";

  } catch (error) {
    console.error("Chat error:", error);
    reply.textContent = "Error: " + error.message;
  } finally {
    send.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
});