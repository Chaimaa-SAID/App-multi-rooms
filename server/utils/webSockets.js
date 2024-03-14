import ChatMessageModel from "../models/chatMessage.js";
import ChatRoomModel from "../models/chatRoom.js";
import UserModel from "./../models/user.js";

let users = [];

class WebSockets {

   connection(socket) {
      socket.on('username', async (username) => {
         const currentUser = await UserModel.findOne({ username: username });

         if (currentUser) {
            // chatroom par défaut
            await _joinRoom("Accueil");

            socket.username = username;
            users.push(socket);
            socket.broadcast.to(socket.channel).emit('newUser', username);

         } else {
            const user = new User();
            user.username = username;
            user.save();

            // On join automatiquement le channel "salon1" par défaut
            await _joinRoom("Accueil");

            socket.username = username;
            users.push(socket)
            socket.broadcast.to(socket.channel).emit('newUser', username);
            socket.broadcast.emit('newUserInDb', username);
         }


      });

      socket.on('oldWhispers', async (username) => {
         try {
            const messages = await ChatMessageModel.find({ receiver: username }).limit(5)
            socket.emit('oldWhispers', messages)
         } catch (error) {
            return false
         }

      });

      socket.on('changeChannel', async (channel) => {
         await _joinRoom(channel);
      });

      // Quand un nouveau message est envoyé
      socket.on('newMessage', async (message, receiver) => {
         if (receiver === "all") {

            const chat = new ChatMessageModel();
            chat.chatRoomId = socket.channel;
            chat.sender = socket.username;
            chat.receiver = receiver;
            chat.content = message;
            await chat.save();

            socket.broadcast.to(socket.channel).emit('newMessageAll', { message: message, username: socket.username});

         } else {
            try {
               const user = await UserModel.findOne({ username: receiver })
               if (user) {
                  const socketReceiver = await users.find(element => element.username === user.username)

                  if (socketReceiver) {
                     socketReceiver.emit('whisper', { sender: socket.username, message: message })
                  }

                  var chat = new ChatMessageModel();
                  chat.sender = socket.username;
                  chat.receiver = receiver;
                  chat.content = message;
                  await chat.save();
               } else {
                  return false
               }
            } catch (err) {
               return false
            }

         }

      })

      // Quand un user se déconnecte
      socket.on('disconnect', () => {
         var index = users.indexOf(socket)
         if (index > -1) {
            users.splice(index, 1)
         }
         socket.broadcast.to(socket.channel).emit('quitUser', socket.username);
      });

      socket.on('writting', (username) => {
         socket.broadcast.to(socket.channel).emit('writting', username);
      });

      socket.on('notWritting', (username) => {
         socket.broadcast.to(socket.channel).emit('notWritting', username);
      });

      async function _joinRoom(channelParam) {

         //Si l'utilisateur est déjà dans un channel, on le stock
         var previousChannel = ''
         if (socket.channel) {
            previousChannel = socket.channel;
         }

         //On quitte tous les channels et on rejoint le channel ciblé
         socket.leaveAll();
         socket.join(channelParam);
         socket.channel = channelParam;

         try {
            const chatRoom = await ChatRoomModel.findOne({ name: socket.channel });
            if (chatRoom) {
               const messages = await ChatMessageModel.find({ chatRoomId: socket.channel });
               if (!messages) {
                  return false;
               }
               else {
                  socket.emit('oldMessages', messages);
                  //Si l'utilisateur vient d'un autre channel, on le fait passer, sinon on ne fait passer que le nouveau
                  if (previousChannel) {
                     socket.emit('emitChannel', { previousChannel: previousChannel, newChannel: socket.channel });
                  } else {
                     socket.emit('emitChannel', { newChannel: socket.channel });
                  }
               }

            }
            else {
               var room = new ChatRoomModel();
               room.name = socket.channel;
               room.save();

               socket.broadcast.emit('newChannel', socket.channel);
               socket.emit('emitChannel', { previousChannel: previousChannel, newChannel: socket.channel });
            }
         } catch (err) {
            return false
         }

      }
   }
};

export default new WebSockets();