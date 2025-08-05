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
    const { lat, lng, radius = 10 } = req.query; // radius en km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Missing coordinates' });
    }

    // Trouver les locations proches (dans le rayon en mètres)
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

    // Trouver les events associés à ces locations
    const events = await Event.find({ location: { $in: locationIds } })
      .populate('location')
      .populate('owner', 'username avatar')
      .sort({ date: 1 });

    res.json(events);
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
      .populate('owner', 'username avatar')
      .populate('attendees', 'username avatar');

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
      .populate("attendees", "username avatar")
      .populate("owner", "username avatar")
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.error("Erreur getMyInvolvedEvents:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};