export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let prompt = '';
  try {
    // Получаем тело запроса через stream (для Vercel)
    let body = '';
    await new Promise((resolve, reject) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', resolve);
      req.on('error', reject);
    });
    const data = JSON.parse(body);
    prompt = data.prompt;
    if (!prompt) throw new Error('No prompt');
  } catch (e) {
    console.error('Body parse error:', e);
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
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      // Fallback: возвращаем заглушку
      return res.status(200).json({ imageUrl: 'https://dummyimage.com/300x300/eee/333&text=No+Image' });
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('Server error:', err);
    // Fallback: возвращаем заглушку
    res.status(200).json({ imageUrl: 'https://dummyimage.com/300x300/eee/333&text=No+Image' });
  }
} 