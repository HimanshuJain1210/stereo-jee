export async function POST(request) {
  try {
    const { messages, studentName } = await request.json();

    const systemPrompt = `You are a JEE Chemistry expert tutor helping ${studentName || 'a student'} prepare for JEE Mains and Advanced. 

Your style:
- Clear, concise explanations — no fluff
- Use examples relevant to JEE problems
- When explaining reactions or structures, use text representations (e.g. CH3-CH=CH2)
- For stereochemistry questions, walk through step by step
- If a question is off-topic from JEE syllabus, gently redirect
- End every answer with a 1-line "Key Point to Remember" in bold

Topics you cover: all JEE Chemistry — Physical, Organic, Inorganic. Focus areas: Stereoisomerism, Organic reactions, Electrochemistry, Thermodynamics, Equilibrium.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://stereo-jee.vercel.app',
        'X-Title': 'StereoJEE — Chemistry Tutor'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: 'AI service error', detail: err }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, no response received.';
    return Response.json({ reply });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
