document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Substitua "seu_usuario" e "sua_senha" por dados reais
    const validUsername = 'admin';
    const validPassword = 'senha123';

    if (usernameInput === validUsername && passwordInput === validPassword) {
        // Salva a flag de login no localStorage
        localStorage.setItem('isLoggedIn', 'true');
        // Redireciona para a página principal
        window.location.href = 'index.html';
    } else {
        errorMessage.textContent = 'Usuário ou senha incorretos.';
    }
});
