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

  // Здесь должна быть логика обращения к OpenAI
  // Например:
  // const imageUrl = await getImageFromOpenAI(prompt);

  // Для теста:
  const imageUrl = 'https://dummyimage.com/300x300/eee/333&text=Demo';

  res.status(200).json({ imageUrl });
} 