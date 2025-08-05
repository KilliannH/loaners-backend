const Notification = require("../models/Notification");

// GET toutes les notifs non lues
exports.getUnread = async (req, res) => {
  try {
    const notifs = await Notification.find({
      user: req.user.id,
      isRead: false,
    });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement des notifications" });
  }
};

// Marquer comme lues pour un event
exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, event: req.params.eventId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur update notifications" });
  }
};