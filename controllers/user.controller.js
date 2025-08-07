const User = require('../models/User');
const Event = require('../models/Event');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username avatarUrl bio");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await Event.find({
      date: { $gte: sevenDaysAgo }, // uniquement les events récents ou à venir
      $or: [
        { owner: req.params.id },
        { attendees: req.params.id },
      ],
    })
      .populate("location")
      .sort({ date: 1 });

    res.json({ user, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl, bio } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { username, avatarUrl, bio },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};