const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    // Converte o texto Markdown em HTML e insere no elemento
    messageDiv.innerHTML = marked.parse(text); 

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    userInput.value = '';

    const typingMessage = addMessage('Aguarde, estou processando sua solicitação...', 'bot');

    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao obter resposta da IA.');
        }

        const data = await response.json();

        if (data.text && data.text.length > 0) {
            typingMessage.remove();
            addMessage(data.text, 'bot');
        } else {
            typingMessage.remove();
            addMessage('A IA não retornou uma resposta. Por favor, tente novamente.', 'bot');
        }
    } catch (error) {
        console.error("Erro:", error);
        typingMessage.remove();
        addMessage(`Ocorreu um erro: ${error.message}`, 'bot');
    }
}

sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});
