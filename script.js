const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const newChatBtn = document.getElementById('new-chat-btn');
const savedChatsList = document.getElementById('saved-chats-list');

// Variáveis para a gestão de chats
let allChats = [];
let activeChatId = null;

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

function saveChats() {
    localStorage.setItem('truco-chats', JSON.stringify(allChats));
    renderChatList();
}

function loadChats() {
    const saved = localStorage.getItem('truco-chats');
    if (saved) {
        allChats = JSON.parse(saved);
        if (allChats.length > 0) {
            // Se houver chats salvos, carrega o primeiro
            activeChatId = allChats[0].id;
            loadChat(activeChatId);
        } else {
            // Se a lista estiver vazia, cria um novo chat
            newChat();
        }
    } else {
        // Se não houver nada, cria um novo chat
        newChat();
    }
}

function renderChatList() {
    const ul = document.createElement('ul');
    allChats.forEach(chat => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.dataset.chatId = chat.id;
        a.innerHTML = `<i class="fas fa-comment-dots"></i> ${chat.title}`;
        if (chat.id === activeChatId) {
            a.classList.add('chat-item-active');
        }
        a.addEventListener('click', (e) => {
            e.preventDefault();
            switchChat(chat.id);
        });
        li.appendChild(a);
        ul.appendChild(li);
    });
    savedChatsList.innerHTML = '<h4>Chats Salvos</h4>';
    savedChatsList.appendChild(ul);
}

function switchChat(chatId) {
    const chat = allChats.find(c => c.id === chatId);
    if (chat) {
        activeChatId = chatId;
        chatBox.innerHTML = ''; // Limpa o chat atual
        chat.history.forEach(msg => {
            addMessage(msg.content, msg.role);
        });
        document.querySelectorAll('.chat-item-active').forEach(el => el.classList.remove('chat-item-active'));
        document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('chat-item-active');
    }
}

function newChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'Novo Chat',
        history: []
    };
    allChats.unshift(newChat); // Adiciona no início da lista
    activeChatId = newChat.id;
    chatBox.innerHTML = ''; // Limpa o chat atual
    saveChats();
    
    // Mensagem de boas-vindas para o novo chat
    const welcomeMessage = 'Olá! Sou **Truco!**, seu assistente de controles internos. Como posso ajudar?';
    addMessage(welcomeMessage, 'bot');
    newChat.history.push({ role: 'assistant', content: welcomeMessage });
    saveChats();
}

async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    const chat = allChats.find(c => c.id === activeChatId);
    if (!chat) return;

    // Se o chat for novo, define um título
    if (chat.history.length === 0) {
        chat.title = userMessage.substring(0, 20) + '...';
    }

    // Adiciona a mensagem do usuário no histórico e na tela
    addMessage(userMessage, 'user');
    chat.history.push({ role: 'user', content: userMessage });
    saveChats();

    userInput.value = '';

    const typingMessage = addMessage('Aguarde, **Truco!** está processando sua solicitação...', 'bot');

    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: chat.history })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao obter resposta da IA.');
        }

        const data = await response.json();
        
        if (data.text && data.text.length > 0) {
            typingMessage.remove();
            
            addMessage(data.text, 'bot');
            chat.history.push({ role: 'assistant', content: data.text });
            saveChats();
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
        const chat = allChats.find(c => c.id === activeChatId);
        chat.history.push({ role: 'user', content: fileMessage });
        saveChats();
    }
    fileInput.value = '';
});
newChatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    newChat();
});

// Inicialização
document.addEventListener('DOMContentLoaded', loadChats);
