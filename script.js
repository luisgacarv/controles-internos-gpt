const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const newChatBtn = document.getElementById('new-chat-btn');
const savedChatsList = document.getElementById('saved-chats-list');

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
        // Garante que o título do primeiro chat seja "Novo Chat" se ainda não foi definido
        allChats.forEach(chat => {
            if (!chat.title) {
                chat.title = 'Novo Chat';
            }
        });

        if (allChats.length > 0) {
            activeChatId = allChats[0].id;
            loadChat(activeChatId);
        } else {
            newChat();
        }
    } else {
        newChat();
    }
}

function renderChatList() {
    const ul = document.createElement('ul');
    allChats.forEach(chat => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.classList.add('chat-item'); // Nova classe CSS
        a.dataset.chatId = chat.id;

        // Cria o wrapper para o título e ícone do chat
        const titleWrapper = document.createElement('span');
        titleWrapper.classList.add('chat-title-wrapper');
        titleWrapper.innerHTML = `<i class="fas fa-comment-dots"></i> <span class="chat-text-title">${chat.title}</span>`;
        a.appendChild(titleWrapper);

        // Botão de opções (3 pontinhos)
        const optionsBtn = document.createElement('button');
        optionsBtn.classList.add('chat-options-btn');
        optionsBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
        optionsBtn.title = 'Opções do chat';
        optionsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique no botão ative a troca de chat
            toggleChatContextMenu(e, chat.id);
        });
        a.appendChild(optionsBtn);

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

// Alterna a visibilidade do menu de contexto
function toggleChatContextMenu(event, chatId) {
    // Remove qualquer menu aberto antes de abrir um novo
    document.querySelectorAll('.chat-context-menu').forEach(menu => menu.remove());

    const listItem = event.currentTarget.closest('li');
    const menu = document.createElement('div');
    menu.classList.add('chat-context-menu');
    menu.innerHTML = `
        <ul>
            <li><a href="#" data-action="delete" data-chat-id="${chatId}"><i class="fas fa-trash-alt"></i> Excluir</a></li>
        </ul>
    `;

    menu.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Impede cliques indesejados
        removeChat(chatId);
        menu.remove(); // Fecha o menu após a ação
    });

    listItem.appendChild(menu);
    menu.style.display = 'block'; // Mostra o menu

    // Fecha o menu se clicar em qualquer lugar fora dele
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !event.currentTarget.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
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
        saveChats();
    }
}

function newChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'Novo Chat', // Título temporário
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
    saveChats(); // Salva após adicionar a mensagem de boas-vindas
}

function removeChat(chatIdToRemove) {
    // Filtra o chat a ser removido
    allChats = allChats.filter(chat => chat.id !== chatIdToRemove);

    // Se o chat removido era o ativo, muda para o primeiro chat disponível ou cria um novo
    if (activeChatId === chatIdToRemove) {
        if (allChats.length > 0) {
            switchChat(allChats[0].id);
        } else {
            newChat(); // Cria um novo chat se não houver mais nenhum
        }
    }
    saveChats(); // Salva a lista atualizada e renderiza
}

async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    const chat = allChats.find(c => c.id === activeChatId);
    if (!chat) return;

    // Se o chat for novo (histórico com apenas a mensagem de boas-vindas), define o título
    // Verifica se há apenas uma mensagem no histórico E se ela é a mensagem de boas-vindas do bot
    if (chat.history.length === 1 && chat.history[0].role === 'assistant' && chat.history[0].content.includes('Olá! Sou **Truco!**')) {
        const firstMessage = userMessage.substring(0, 30);
        chat.title = firstMessage + (userMessage.length > 30 ? '...' : ''); // Adiciona "..." se for maior que 30
    }

    // Adiciona a mensagem do usuário no histórico e na tela
    addMessage(userMessage, 'user');
    chat.history.push({ role: 'user', content: userMessage });
    saveChats(); // Salva o chat com o possível novo título

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

// Adiciona um listener global para fechar o menu de contexto se clicar fora
document.addEventListener('click', (e) => {
    document.querySelectorAll('.chat-context-menu').forEach(menu => {
        if (!menu.contains(e.target) && !e.target.closest('.chat-options-btn')) {
            menu.remove();
        }
    });
});
