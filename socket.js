const Chat = require("./models/Chat");
const User = require("./models/User");

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Nouveau client connecté :", socket.id);

    // Rejoindre une salle par eventId
    socket.on("join", (eventId) => {
      socket.join(eventId);
      console.log(`👥 ${socket.id} a rejoint le chat de l'événement ${eventId}`);
    });

    // Quitter la salle
    socket.on("leave", (eventId) => {
      socket.leave(eventId);
      console.log(`🚪 ${socket.id} a quitté ${eventId}`);
    });

    // Envoi d’un message
    socket.on("message:send", async ({ eventId, text, sender }) => {
      try {
        const user = await User.findById(sender).select("_id username");

        if (!user || !eventId || !text.trim()) return;

        const chat = await Chat.findOneAndUpdate(
          { eventId },
          {
            $push: {
              messages: {
                sender: user._id,
                text,
                sentAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        ).populate("messages.sender", "username");

        const newMessage = chat.messages[chat.messages.length - 1];

        io.to(eventId).emit("message:new", {
          sender: { _id: user._id, username: user.username },
          text: newMessage.text,
          sentAt: newMessage.sentAt,
        });
      } catch (err) {
        console.error("❌ Erreur message:send", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client déconnecté :", socket.id);
    });
  });
}

module.exports = { setupSocket };