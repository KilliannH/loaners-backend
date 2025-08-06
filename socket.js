const Chat = require("./models/Chat");
const User = require("./models/User");
const Notification = require("./models/Notification");
const Event = require("./models/Event");

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

                const event = await Event.findById(eventId).populate("attendees", "_id");
                const attendeeIds = event.attendees.map((u) => u._id.toString());

                // ❌ Si l’utilisateur n’est pas dans la liste des participants : refuser
                if (!attendeeIds.includes(sender.toString())) {
                    console.log(`⛔️ Refusé : user ${sender} tente d’écrire sans être inscrit à l’event ${eventId}`);
                    return;
                }

                if (connectedUsers.size === 0) {
                    console.log("⚠️ Aucun user connecté identifié !");
                }
                for (const [socketId, userId] of connectedUsers.entries()) {
                    // 🔍 Vérifie si le user est un participant ET n’est pas l’auteur
                    if (attendeeIds.includes(userId) && userId !== sender.toString()) {
                        const socketsInRoom = await io.in(eventId).fetchSockets();
                        const isInRoom = socketsInRoom.some((s) => connectedUsers.get(s.id) === userId);

                        // ⚠️ Si l'utilisateur est déjà dans la room, on ne lui envoie pas de notif
                        if (isInRoom) {
                            console.log(`👁️ User ${userId} est déjà dans la salle ${eventId}, pas de notif.`);
                            continue;
                        }

                        console.log(`🔔 Notif à envoyer à user ${userId}`);

                        await Notification.create({
                            user: userId,
                            event: eventId,
                            content: text,
                            type: "message",
                        });

                        console.log(`💾 Notif DB créée pour ${userId}`);

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