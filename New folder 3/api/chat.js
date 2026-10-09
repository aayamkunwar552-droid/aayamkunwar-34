
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Please send a POST request."
    });
  }

  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please type a message first."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable");

      return res.status(500).json({
        error: "API key missing. Add OPENAI_API_KEY in Vercel Settings."
      });
    }

    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are Aayam AI, a friendly, helpful assistant. " +
            "Answer questions clearly and accurately. " +
            "Help with schoolwork, coding, writing and general knowledge.",
          input: message.trim(),
          max_output_tokens: 800
        })
      }
    );

    const result = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("OpenAI API error:", aiResponse.status, result);

      if (aiResponse.status === 401) {
        return res.status(502).json({
          error: "Invalid API key. Check OPENAI_API_KEY in Vercel."
        });
      }

      if (aiResponse.status === 429) {
        return res.status(502).json({
          error: "API quota or rate limit reached. Check your API usage and billing."
        });
      }

      return res.status(502).json({
        error: result.error?.message ||
          `AI request failed with status ${aiResponse.status}.`
      });
    }

    const answer = (result.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!answer) {
      return res.status(502).json({
        error: "The AI returned no text. Please try again."
      });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Server error. Check the Vercel Runtime Logs."
    });
  }
}