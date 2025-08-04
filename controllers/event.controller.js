const Event = require('../models/Event');
const Chat = require('../models/Chat');
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
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    // Si déjà inscrit
    if (event.attendees.includes(req.user.id)) {
      return res.status(200).json({ message: "Déjà inscrit" });
    }

    // Ajout du participant
    event.attendees.push(req.user.id);
    await event.save();

    // 🔁 Vérifie nombre de participants
    if (event.attendees.length >= 2) {
      const existingChat = await Chat.findOne({ eventId: event._id });

      if (!existingChat) {
        await Chat.create({ eventId: event._id });
        console.log("✅ Room de chat créée pour l'événement :", event._id);
      }
    }

    res.status(200).json({ message: "Inscription réussie" });
  } catch (err) {
    console.error("Erreur joinEvent:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};