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
        a.classList.add('chat-item');
        a.dataset.chatId = chat.id;

        const titleWrapper = document.createElement('span');
        titleWrapper.classList.add('chat-title-wrapper');
        titleWrapper.innerHTML = `<i class="fas fa-comment-dots"></i> <span class="chat-text-title">${chat.title}</span>`;
        a.appendChild(titleWrapper);

        const optionsBtn = document.createElement('button');
        optionsBtn.classList.add('chat-options-btn');
        optionsBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
        optionsBtn.title = 'Opções do chat';
        optionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
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
    console.log("Tentando abrir o menu de contexto para o chat:", chatId); // Linha de diagnóstico
    
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
        e.stopPropagation();
        removeChat(chatId);
        menu.remove();
    });

    listItem.appendChild(menu);
    menu.style.display = 'block';

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
        chatBox.innerHTML = '';
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
        title: 'Novo Chat',
        history: []
    };
    allChats.unshift(newChat);
    activeChatId = newChat.id;
    chatBox.innerHTML = '';
    saveChats();
    
    const welcomeMessage = 'Olá! Sou **Truco!**, seu assistente de controles internos. Como posso ajudar?';
    addMessage(welcomeMessage, 'bot');
    newChat.history.push({ role: 'assistant', content: welcomeMessage });
    saveChats();
}

function removeChat(chatIdToRemove) {
    allChats = allChats.filter(chat => chat.id !== chatIdToRemove);

    if (activeChatId === chatIdToRemove) {
        if (allChats.length > 0) {
            switchChat(allChats[0].id);
        } else {
            newChat();
        }
    }
    saveChats();
}

async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage
