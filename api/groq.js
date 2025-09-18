import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Modelo alterado para um da sua lista
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content;

    res.status(200).json({ text });
  } catch (error) {
    console.error('Erro na API da Groq:', error);
    res.status(500).json({
      message: 'Ocorreu um erro ao conectar com a IA. Por favor, tente novamente mais tarde.',
      error: error.message,
    });
  }
};
