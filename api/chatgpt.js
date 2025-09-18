import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content;

    res.status(200).json({ text });
  } catch (error) {
    console.error('Erro na API do OpenAI:', error);
    res.status(500).json({
      message: 'Ocorreu um erro ao conectar com a IA. Por favor, tente novamente mais tarde.',
      error: error.message,
    });
  }
};
