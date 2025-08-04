const Chat = require('../models/Chat');
const Event = require('../models/Event');

exports.getChatByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const chat = await Chat.findOne({ eventId })
      .populate('messages.sender', 'username avatarUrl') // peupler les infos de l’expéditeur
      .lean();

    if (!chat) {
      return res.json({ messages: [] }); // aucun message encore
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    console.error('[getChatByEvent] error:', err);
    res.status(500).json({ error: 'Erreur serveur lors du chargement du chat.' });
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
    console.error("[getUserChatRooms] error:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};