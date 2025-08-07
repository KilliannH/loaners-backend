const Chat = require('../models/Chat');
const Event = require('../models/Event');

exports.getChatByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const chat = await Chat.findOne({ eventId: eventId })
      .populate("messages.sender", "username avatarUrl");

    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({ attendees: userId })
      .populate("location")
      .sort({ date: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};