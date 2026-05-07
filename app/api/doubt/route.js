export async function POST(request) {
  try {
    const { messages, studentName } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key not configured. Please add OPENROUTER_API_KEY in Vercel environment variables." }, { status: 500 });
    }

    const systemPrompt = [
      "You are a JEE Chemistry expert tutor helping " + (studentName || "a student") + " prepare for JEE Mains and Advanced.",
      "",
      "Your teaching style:",
      "- You are like a friendly senior who scored 99 percentile in JEE Chemistry",
      "- Give short clear answers first, then explain the reason",
      "- Use simple text structures like CH3-CH=CH2 or (R)-lactic acid",
      "- For stereochemistry: always walk step by step, never skip steps",
      "- Use analogies and everyday language, avoid textbook jargon",
      "- Keep answers under 200 words unless the student asks for more detail",
      "- End every answer with: KEY POINT: (one memorable line)",
      "",
      "Topics: all JEE Chemistry. Priority focus: Stereoisomerism, Named reactions, Electrochemistry, Thermodynamics, Equilibrium, Coordination chemistry."
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://stereo-jee.vercel.app",
        "X-Title": "StereoJEE"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data?.error?.message || data?.error || JSON.stringify(data);
      return Response.json({ error: "OpenRouter error: " + detail }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, no response received.";
    return Response.json({ reply });

  } catch (error) {
    return Response.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
