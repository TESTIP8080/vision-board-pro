// server/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

if (!process.env.OPENAI_API_KEY) {
    console.error("ОШИБКА: Ключ OPENAI_API_KEY не найден. Проверьте файл .env");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Текст задачи (prompt) обязателен' });
    }

    console.log(`Получен промпт для генерации: "${prompt}"`);

    try {
        const dallEPrompt = `Create a visually engaging icon representing the task: '${prompt}'. Style: modern flat design, graphic, vibrant colors, 2D, sticker, isolated on a white background. Crucially, DO NOT include any text or letters in the image. Focus only on the visual concept.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: dallEPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: 'url',
        });

        const imageUrl = response.data[0].url;
        console.log(`Картинка успешно сгенерирована: ${imageUrl}`);
        
        res.json({ imageUrl });

    } catch (error) {
        console.error("Ошибка при генерации изображения в OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Не удалось сгенерировать изображение.' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port} и готов творить!`);
}); 