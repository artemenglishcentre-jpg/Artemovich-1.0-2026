const socket = io();
const authBox = document.getElementById('login-overlay');
const authTitle = document.getElementById('auth-title');
const mainAuthBtn = document.getElementById('main-auth-btn');
const toggleText = document.getElementById('toggle-text');
const regFirstName = document.getElementById('reg-first-name');
const regLastName = document.getElementById('reg-last-name');
const authPass = document.getElementById('auth-pass');
const sendMsgBtn = document.getElementById('send-msg-btn');
const msgInput = document.getElementById('message-input');
const chatBox = document.getElementById('chat');

let isLoginMode = true;
let currentUser = "";

function updateAuthUI() {
    const link = document.getElementById('toggle-link');
    if (!link) return;
    link.onclick = () => {
        isLoginMode = !isLoginMode;
        authTitle.innerText = isLoginMode ? "Вход" : "Регистрация";
        mainAuthBtn.innerText = isLoginMode ? "Войти" : "Зарегистрироваться";
        toggleText.innerHTML = isLoginMode 
            ? 'Нет аккаунта? <span id="toggle-link" style="color: blue; cursor: pointer; text-decoration: underline;">Зарегистрироваться</span>'
            : 'Уже есть аккаунт? <span id="toggle-link" style="color: blue; cursor: pointer; text-decoration: underline;">Войти</span>';
        updateAuthUI();
    };
}
updateAuthUI();

mainAuthBtn.onclick = () => {
    socket.emit('auth', {
        firstName: regFirstName.value.trim(),
        lastName: regLastName.value.trim(),
        password: authPass.value.trim(),
        isLogin: isLoginMode
    });
};

socket.on('auth success', (data) => {
    currentUser = data.name;
    authBox.style.display = "none";
});

socket.on('auth error', (msg) => alert(msg));

// --- ПРИЕМ СООБЩЕНИЙ И ИСТОРИИ ---
socket.on('chat history', (history) => {
    chatBox.innerHTML = ""; // Чистим чат
    history.forEach(data => addMessageToChat(data));
});

socket.on('chat message', (data) => {
    addMessageToChat(data);
});

function addMessageToChat(data) {
    const message = document.createElement('p');
    message.innerHTML = `<b>${data.name}:</b> ${data.text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendMsgBtn.onclick = () => {
    if (msgInput.value.trim() !== "" && currentUser !== "") {
        socket.emit('chat message', { name: currentUser, text: msgInput.value });
        msgInput.value = "";
    }
};
