const cron = require("node-cron");
const Event = require("../models/Event");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

const cleanupOldEvents = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // 1. Trouver les events à supprimer
    const oldEvents = await Event.find({ date: { $lt: oneWeekAgo } });

    if (oldEvents.length === 0) return;

    const oldEventIds = oldEvents.map((e) => e._id);

    // 2. Supprimer les données liées
    await Chat.deleteMany({ eventId: { $in: oldEventIds } });
    await Notification.deleteMany({ event: { $in: oldEventIds } });
    await Event.deleteMany({ _id: { $in: oldEventIds } });

    console.log(`🧹 ${oldEventIds.length} ancien(s) événement(s) supprimé(s)`);
  } catch (err) {
    console.error("❌ Erreur nettoyage événements :", err);
  }
};

// Tâche planifiée : chaque jour à 4h du matin
cron.schedule("0 4 * * *", cleanupOldEvents);