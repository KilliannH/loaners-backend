const Chat = require('../models/Chat');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connecté :', socket.id);

    socket.on('joinRoom', (eventId) => {
      socket.join(eventId);
      console.log(`✅ Rejoint la room : ${eventId}`);
    });

    socket.on('sendMessage', async ({ eventId, senderId, text }) => {
      try {
        let chat = await Chat.findOne({ eventId });
        if (!chat) {
          chat = await Chat.create({ eventId, messages: [] });
        }

        const message = { sender: senderId, text, sentAt: new Date() };
        chat.messages.push(message);
        await chat.save();

        io.to(eventId).emit('newMessage', {
          ...message,
          sender: { _id: senderId }, // tu peux peupler si besoin
        });
      } catch (err) {
        console.error("❌ Erreur socket :", err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket déconnecté :', socket.id);
    });
  });
};