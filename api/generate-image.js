export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let prompt = '';
  try {
    if (req.body) {
      if (typeof req.body === 'string') {
        prompt = JSON.parse(req.body).prompt;
      } else {
        prompt = req.body.prompt;
      }
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // --- OpenAI DALL-E интеграция ---
  const apiKey = process.env.OPENAI_API_KEY;
  const dallEPrompt = `Create a visually engaging icon representing the task: '${prompt}'. Style: modern flat design, graphic, vibrant colors, 2D, sticker, isolated on a white background. Crucially, DO NOT include any text or letters in the image. Focus only on the visual concept.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallEPrompt,
        n: 1,
        size: '512x512',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    res.status(200).json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate image' });
  }
} 