const Chat = require("./models/Chat");
const User = require("./models/User");

function setupSocket(io) {
    const connectedUsers = new Map();
    io.on("connection", (socket) => {
        console.log("🟢 Nouveau client connecté :", socket.id);

        socket.on("identify", (userId) => {
            connectedUsers.set(socket.id, userId);
            console.log(`✅ Socket ${socket.id} identifié comme user ${userId}`);
        });

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
        socket.on('message:send', async ({ eventId, text, sender }) => {
            try {
                const message = {
                    sender,
                    text,
                    sentAt: new Date(),
                };

                let chat = await Chat.findOne({ eventId });
                if (!chat) {
                    chat = await Chat.create({ eventId, messages: [message] });
                } else {
                    chat.messages.push(message);
                    await chat.save();
                }

                const senderUser = await User.findById(sender).select("username");

                io.to(eventId).emit("message:new", {
                    ...message,
                    sender: { _id: sender, username: senderUser?.username || "Inconnu" },
                });

                const event = await require("./models/Event").findById(eventId).populate("attendees", "_id");
                const attendeeIds = event.attendees.map((u) => u._id.toString());

                for (const [socketId, userId] of connectedUsers.entries()) {
                    if (attendeeIds.includes(userId) && userId !== sender.toString()) {
                        io.to(socketId).emit("message:notification", {
                            eventId,
                            from: senderUser?.username || "Inconnu",
                            text,
                        });
                    }
                }
            } catch (err) {
                console.error("❌ Erreur message:send :", err);
            }
        });

        socket.on("disconnect", () => {
            connectedUsers.delete(socket.id);
            console.log("🔴 Client déconnecté :", socket.id);
        });
    });
}

module.exports = { setupSocket };