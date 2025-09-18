import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Esta linha é nova
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama2-70b-4096', // Exemplo de modelo Groq. Verifique os modelos disponíveis na documentação.
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
