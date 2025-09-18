const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn'); // Novo botão
const fileInput = document.getElementById('file-input'); // Novo input de arquivo

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    // Converte o texto Markdown em HTML e insere no elemento
    messageDiv.innerHTML = marked.parse(text); 
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv; // Retorna o elemento da mensagem
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    userInput.value = '';

    const typingMessage = addMessage('Aguarde, **Truco!** está processando sua solicitação...', 'bot');

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

// Lógica para o botão de anexar arquivo
attachBtn.addEventListener('click', () => {
    fileInput.click(); // Abre o seletor de arquivos
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        addMessage(`Arquivo anexado: ${file.name} (Funcionalidade de processamento não implementada ainda)`, 'user');
        // Aqui você adicionaria a lógica para enviar o arquivo ao backend
        // ou processá-lo de alguma forma.
        // Exemplo: uploadFile(file);
    }
    fileInput.value = ''; // Limpa o input para permitir anexar o mesmo arquivo novamente
});


// Mensagem inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    addMessage('Olá! Sou **Truco!**, seu assistente de controles internos. Como posso ajudar?', 'bot');
});
