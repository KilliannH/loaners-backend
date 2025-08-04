const Event = require('../models/Event');
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