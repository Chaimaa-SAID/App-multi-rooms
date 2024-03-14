var socket = io.connect('http://localhost:3000');

socket.emit('username', username);
socket.emit('oldWhispers', username);
document.title = username + ' - ' + document.title;


document.getElementById('chatForm').addEventListener('submit', (e) => {

    e.preventDefault();

    const textInput = document.getElementById('msgInput').value;
    document.getElementById('msgInput').value = '';

    const receiver = document.getElementById('receiverInput').value;

    if (textInput.length > 0) {

        socket.emit('newMessage', textInput, receiver);

        if (receiver === "all") {
            createElementFunction('newMessageMe', textInput);
        }
    } else {
        return false;
    }

});

socket.on('newUser', (username) => {
    createElementFunction('newUser', username);
});

socket.on('oldWhispers', (messages) => {
    messages.forEach(message => {
        createElementFunction('oldWhispers', message);
    });
})

socket.on('newUserInDb', (username) => {
    newOption = document.createElement('option');
    newOption.textContent = username;
    newOption.value = username;
    document.getElementById('receiverInput').appendChild(newOption);
})

// déconnexion
socket.on('quitUser', (message) => {
    createElementFunction('quitUser', message);
});


// Nouveau message émis
socket.on('newMessageAll', (content) => {
    createElementFunction('newMessageAll', content);
});
// Nouveau message privé
socket.on('whisper', (content) => {
    createElementFunction('whisper', content);
});


// Un utilisateur en train d'ecrire
socket.on('writting', (username) => {
    document.getElementById('isWritting').textContent = username + ' est en train d\'écrire';
});
// Un utilisateur a arrêté d'ecrire
socket.on('notWritting', (username) => {
    document.getElementById('isWritting').textContent = '';
});


// Changement de chatroom
socket.on('emitChannel', (channel) => {
    if (channel.previousChannel) {
        document.getElementById(channel.previousChannel).classList.remove('active')
    }
    document.getElementById(channel.newChannel).classList.add('active')
});

// nouveau chatroom Crée
socket.on('newChannel', (newChannel) => {
    createChannel(newChannel)
});
// Récuperation anciens messages du channel
socket.on('oldMessages', (messages) => {
    messages.forEach(message => {
        if (message.sender === username) {
            createElementFunction('oldMessagesMe', { sender: message.sender, content: message.content });
        } else {
            createElementFunction('oldMessages', { sender: message.sender, content: message.content });
        }
    });
});

function writting() {
    socket.emit('writting', username);
}

function notWritting() {
    socket.emit('notWritting', username);
}

function createElementFunction(element, content) {

    const newElement = document.createElement("li");
    let userSpan, usernameDiv, messageDiv;

    switch (element) {

        case 'newMessageMe':
            userSpan = document.createElement("span");
            userSpan.classList.add("message-username");
            userSpan.innerHTML = 'Moi';

            usernameDiv = document.createElement("div");
            usernameDiv.classList.add("message-data");
            usernameDiv.appendChild(userSpan);

            messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "other-message");
            messageDiv.innerHTML = content;

            newElement.classList.add('clearfix');
            newElement.appendChild(usernameDiv);
            newElement.appendChild(messageDiv);

            document.getElementById('msgContainer').appendChild(newElement);
            break;


        case 'newMessageAll':
            if (content.username !== username) {
                userSpan = document.createElement("span");
                userSpan.classList.add("message-username");
                userSpan.innerHTML = content.username;

                usernameDiv = document.createElement("div");
                usernameDiv.classList.add("message-data", "text-right");
                usernameDiv.appendChild(userSpan);

                messageDiv = document.createElement("div");
                messageDiv.classList.add("message", "other-message", "float-right");
                messageDiv.innerHTML = content.message;

                newElement.classList.add('clearfix');
                newElement.appendChild(usernameDiv);
                newElement.appendChild(messageDiv);

                document.getElementById('msgContainer').appendChild(newElement);
            }
            break;

        case 'whisper':
            userSpan = document.createElement("span");
            userSpan.classList.add("message-username");
            userSpan.innerHTML = content.sender + ' (message privé)';

            usernameDiv = document.createElement("div");
            usernameDiv.classList.add("message-data", "text-right");
            usernameDiv.appendChild(userSpan);

            messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "other-message", "float-right", "private-message");
            messageDiv.innerHTML = content.message;

            newElement.classList.add('clearfix');
            newElement.appendChild(usernameDiv);
            newElement.appendChild(messageDiv);

            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'newUser':
            newElement.classList.add(element, 'event-info');
            newElement.textContent = content + ' a rejoint le chat';
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'quitUser':
            newElement.classList.add(element, 'event-info');
            newElement.textContent = content + ' a quitté le chat';
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessages':
            userSpan = document.createElement("span");
            userSpan.classList.add("message-username");
            userSpan.innerHTML = content.sender;

            usernameDiv = document.createElement("div");
            usernameDiv.classList.add("message-data", "text-right");
            usernameDiv.appendChild(userSpan);

            messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "other-message", "float-right");
            messageDiv.innerHTML = content.content;

            newElement.classList.add('clearfix');
            newElement.appendChild(usernameDiv);
            newElement.appendChild(messageDiv);

            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessagesMe':
            userSpan = document.createElement("span");
            userSpan.classList.add("message-username");
            userSpan.innerHTML = content.sender;

            usernameDiv = document.createElement("div");
            usernameDiv.classList.add("message-data");
            usernameDiv.appendChild(userSpan);

            messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "my-message");
            messageDiv.innerHTML = content.content;

            newElement.classList.add('clearfix');
            newElement.appendChild(usernameDiv);
            newElement.appendChild(messageDiv);

            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldWhispers':
            userSpan = document.createElement("span");
            userSpan.classList.add("message-username");
            userSpan.innerHTML = content.sender + ' (message privé)';

            usernameDiv = document.createElement("div");
            usernameDiv.classList.add("message-data", "text-right");
            usernameDiv.appendChild(userSpan);

            messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "other-message", "float-right", "private-message");
            messageDiv.innerHTML = content.content;

            newElement.classList.add('clearfix');
            newElement.appendChild(usernameDiv);
            newElement.appendChild(messageDiv);

            document.getElementById('msgContainer').appendChild(newElement);
            break;

    }
}

function createChannel(newRoom) {
    const newRoomItem = document.createElement("li");
    newRoomItem.classList.add('clearfix');
    newRoomItem.id = newRoom;
    newRoomItem.innerHTML = '<div id="' + newRoom + '" class="about"><div class="name">' + newRoom + '</div></div>';
    newRoomItem.setAttribute('onclick', "_joinRoom('" + newRoom + "')")
    document.getElementById('chatroomsList').appendChild(newRoomItem);
}


function _joinRoom(channel) {
    // Réinitialisation des messages
    document.getElementById('msgContainer').innerHTML = "";
    //document.getElementById(channel).classList.add("active");
    // Changement du chatroom
    socket.emit('changeChannel', channel);
}


function _createRoom() {
    while (!newRoom) {
        var newRoom = prompt('Nom du nouveau chatroom ?');
    }

    _joinRoom(newRoom);
}
