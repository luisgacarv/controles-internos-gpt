import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Recebe o array de mensagens, não apenas um prompt
  const { messages } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      // Passa o histórico de mensagens completo
      messages: messages,
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
