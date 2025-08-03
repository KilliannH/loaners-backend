const Location = require('../models/Location');

exports.createLocation = async (req, res) => {
  try {
    const { name, address, coordinates } = req.body;
    const location = await Location.create({ name, address, coordinates });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};