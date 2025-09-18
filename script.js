const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');

// A variável que vai guardar o histórico da conversa
let chatHistory = [];

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    messageDiv.innerHTML = marked.parse(text); 
    
    chatBox.appendChild(messageDiv);
    
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 0);
    
    return messageDiv;
}

async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    // Adiciona a mensagem do usuário no histórico e na tela
    addMessage(userMessage, 'user');
    chatHistory.push({ role: 'user', content: userMessage });

    userInput.value = '';

    const typingMessage = addMessage('Aguarde, **Truco!** está processando sua solicitação...', 'bot');

    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Envia o histórico completo da conversa
            body: JSON.stringify({ messages: chatHistory })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao obter resposta da IA.');
        }

        const data = await response.json();
        
        if (data.text && data.text.length > 0) {
            typingMessage.remove();
            
            // Adiciona a resposta da IA no histórico e na tela
            addMessage(data.text, 'bot');
            chatHistory.push({ role: 'assistant', content: data.text });
        } else {
            typingMessage.remove();
            addMessage('**Truco!** não retornou uma resposta. Por favor, tente novamente.', 'bot');
        }
    } catch (error) {
        console.error("Erro:", error);
        typingMessage.remove();
        addMessage(`Ocorreu um erro: ${error.message}`, 'bot');
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});

attachBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const fileMessage = `Arquivo anexado: ${file.name} (Funcionalidade de processamento não implementada ainda)`;
        addMessage(fileMessage, 'user');
        chatHistory.push({ role: 'user', content: fileMessage });
    }
    fileInput.value = '';
});


// Mensagem inicial ao carregar a página e adicioná-la ao histórico
document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = 'Olá! Sou **Truco!**, seu assistente de controles internos. Como posso ajudar?';
    addMessage(welcomeMessage, 'bot');
    chatHistory.push({ role: 'assistant', content: welcomeMessage });
});
