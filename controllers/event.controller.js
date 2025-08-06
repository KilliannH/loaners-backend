const Event = require('../models/Event');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const Location = require('../models/Location');

exports.createEvent = async (req, res) => {
  try {
    const { name, description, type, date, locationId } = req.body;

    const event = await Event.create({
      name,
      description,
      type,
      date,
      location: locationId,
      owner: req.user.id,
      attendees: [req.user.id]
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNearbyEvents = async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 15, offset = 0, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Missing coordinates' });
    }

    const locations = await Location.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    });

    const locationIds = locations.map(loc => loc._id);

    const filter = {
      location: { $in: locationIds },
      ...(type && { type })
    };

    const total = await Event.countDocuments(filter); // 🔢 Total count

    const events = await Event.find(filter)
      .populate('location')
      .populate('owner', 'username avatarUrl')
      .sort({ date: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json({
      events,
      total,
      hasMore: parseInt(offset) + parseInt(limit) < total // ✅ front-friendly info
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('location') // si tu veux les infos du lieu
      .populate('owner', 'username avatarUrl')
      .populate('attendees', 'username avatarUrl');

    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    res.json(event);
  } catch (err) {
    console.error("Erreur getEventById:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.joinEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    // Empêche les doublons
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ error: "Déjà inscrit à cet événement" });
    }

    event.attendees.push(userId);
    await event.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur joinEvent:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    const index = event.attendees.indexOf(req.user.id);
    if (index === -1) return res.status(400).json({ error: "Tu ne participes pas à cet événement" });

    event.attendees.splice(index, 1);
    await event.save();

    await Notification.deleteMany({
      user: req.user.id,
      event: req.params.id,
      read: false
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur leaveEvent:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getMyInvolvedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({
      $or: [
        { owner: userId },
        { attendees: userId }
      ]
    })
      .populate("location")
      .populate("attendees", "username avatarUrl")
      .populate("owner", "username avatarUrl")
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.error("Erreur getMyInvolvedEvents:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, date } = req.body;

    if (!name || !description || !type || !date) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Événement introuvable." });
    }

    if (event.owner._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Non autorisé à modifier cet événement." });
    }

    event.name = name;
    event.description = description;
    event.type = type;
    event.date = new Date(date);

    await event.save();

    res.status(200).json(event);
  } catch (err) {
    console.error("[updateEvent] error:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Optionnel : Vérifie que seul le créateur peut supprimer
    if (event.owner._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Event.findByIdAndDelete(id);

    // 2. Supprimer les chats liés à cet événement
    await Chat.deleteMany({ eventId: id });

    // 3. Supprimer les notifications liées à cet événement
    await Notification.deleteMany({ event: event });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("[deleteEvent] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};