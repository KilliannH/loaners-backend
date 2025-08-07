const Location = require('../models/Location');

exports.createLocation = async (req, res) => {
  try {
    const { name, address, coordinates } = req.body;

    if (!name || !address || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const existing = await Location.findOne({ name, address });
    if (existing) return res.status(200).json(existing);

    const location = await Location.create({
      name,
      address,
      coordinates: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat], // bien sous [lng, lat]
      },
    });

    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// GET /locations?query=bataclan
exports.searchLocations = async (req, res) => {
  const query = req.query.query?.trim();
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query trop courte.' });
  }

  try {
    const results = await Location.find({
      name: { $regex: query, $options: 'i' },
    }).limit(10);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};