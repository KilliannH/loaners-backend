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
        socket.on('message:send', async ({ eventId, text, sender }) => {
            try {
                const message = {
                    sender,
                    text,
                    sentAt: new Date(),
                };

                // 🔁 Trouve ou crée la room
                let chat = await Chat.findOne({ eventId });
                if (!chat) {
                    chat = await Chat.create({ eventId, messages: [message] });
                } else {
                    chat.messages.push(message);
                    await chat.save();
                }

                // 🔍 Ajoute infos utilisateur
                const senderUser = await User.findById(sender).select("username");

                // ✉️ Renvoie le message avec user enrichi à tous les clients
                io.to(eventId).emit("message:new", {
                    ...message,
                    sender: { _id: sender, username: senderUser?.username || "Inconnu" },
                });

                // 🔔 Notif pour les autres rooms
                socket.to(eventId).emit("message:notification", {
                    eventId,
                    from: senderUser?.username || "Inconnu",
                    text,
                });
            } catch (err) {
                console.error("Erreur message:send :", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client déconnecté :", socket.id);
        });
    });
}

module.exports = { setupSocket };