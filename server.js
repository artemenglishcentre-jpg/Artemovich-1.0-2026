const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const USERS_FILE = './users.json';
const MSGS_FILE = './messages.json';

function loadData(file, defaultValue) {
    try {
        if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) { console.log("Ошибка файла " + file); }
    return defaultValue;
}

function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let users = loadData(USERS_FILE, {});
let messages = loadData(MSGS_FILE, []);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    socket.on('auth', (data) => {
        const { firstName, lastName, password, isLogin } = data;
        const fullName = `${firstName} ${lastName}`.trim();

        const processLogin = () => {
            socket.emit('auth success', { name: fullName });
            // СРАЗУ отправляем историю только этому пользователю
            socket.emit('chat history', messages); 
            console.log(`[ВОШЕЛ]: ${fullName}`);
        };

        if (isLogin) {
            if (users[fullName] === password) {
                processLogin();
            } else {
                socket.emit('auth error', "Неверный пароль!");
            }
        } else {
            if (!users[fullName]) {
                users[fullName] = password;
                saveData(USERS_FILE, users);
                processLogin();
            } else {
                socket.emit('auth error', "Уже зарегистрирован!");
            }
        }
    });

    socket.on('chat message', (data) => {
        messages.push(data);
        saveData(MSGS_FILE, messages); // Сохраняем в файл
        io.emit('chat message', data); 
    });
});

const PORT = process.env.PORT || 59342; // Берет порт от хостинга или 59342 по умолчанию
server.listen(PORT, () => {
    console.log(`Артемович в сети на порту ${PORT}`);
});