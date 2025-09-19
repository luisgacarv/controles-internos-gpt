import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { messages } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
    });

    const text = completion.choices[0].message.content;
    const tokenUsage = completion.usage; // Captura o uso de tokens

    // Retorna o texto da resposta e o objeto de uso de tokens
    res.status(200).json({ text, tokenUsage });
  } catch (error) {
    console.error('Erro na API da Groq:', error);
    if (error.status === 401) {
      res.status(401).json({ message: 'Erro de Autenticação: Verifique se sua chave de API está correta e tem permissões.' });
    } else if (error.status === 404) {
      res.status(404).json({ message: 'Modelo de IA não encontrado ou indisponível.' });
    } else {
      res.status(500).json({
        message: 'Ocorreu um erro ao conectar com a IA. Por favor, tente novamente mais tarde.',
        error: error.message,
      });
    }
  }
};
