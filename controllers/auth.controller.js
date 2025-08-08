const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const loadBannedDomains = require("../utils/loadBannedDomains");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

const bannedDomains = loadBannedDomains();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || '7d';
const fallback_avatar_url = "https://i.ibb.co/vCM6YY9J/avatar-fallback.png";

const emailTemplate = fs.readFileSync(
  path.join(__dirname, "../emails/templates/verify.html"),
  "utf-8"
);

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const domain = email.split("@")[1]?.toLowerCase();
    if (bannedDomains.includes(domain)) {
      return res.status(400).json({
        message: "Email provider is not allowed.",
      });
    }

    // 2. Vérifie si l'email existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 3. Création du user
    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      username,
      email,
      password: hashed,
      fallback_avatar_url,
      emailVerified: false,
    };

    const verificationToken = crypto.randomBytes(32).toString("hex");
    userData.emailVerificationToken = verificationToken;

    const user = await User.create(userData);

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
    const filledTemplate = emailTemplate
      .replace(/{{username}}/g, user.username)
      .replace(/{{link}}/g, verificationLink);

    await sendEmail(
      user.email,
      "Verify your email address",
      filledTemplate
    );

    // 4. JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during email verification." });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.emailVerified) {
      return res.status(400).json({ message: "No verification needed." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    await user.save();

    const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    await sendEmail(user.email, "Vérifie ton adresse email", `
      Bonjour ${user.username},<br>
      Clique ici pour valider ton adresse email :<br>
      <a href="${link}">${link}</a>
    `);

    return res.status(200).json({ message: "Email sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔐 Trouver utilisateur
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // ✅ Comparer mdp
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // 🧾 Créer les tokens
    const payload = { userId: user._id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });

    // 👈 Optionnel : tu peux stocker le refreshToken en DB si tu veux pouvoir l'invalider
    // user.refreshToken = refreshToken;
    // await user.save();

    // 🔁 Renvoyer les deux tokens
    res.json({ user, token, refreshToken });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.googleSignup = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
      ],
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Vérifie si l'utilisateur existe
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        emailVerified: true,
        emailVerificationToken: undefined,
        email,
        username: name,
        avatarUrl: picture,
        googleId: sub,
      });
    }

    const pyld = { userId: user._id };

    // Génère access + refresh tokens
    const token = jwt.sign(pyld, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    const refreshToken = jwt.sign(pyld, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });

    res.json({ user, token, refreshToken });
  } catch (err) {
    res.status(401).json({ error: "Google authentication failed" });
  }
}

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });

  try {
    // ✅ Vérifie le refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const userId = decoded.userId;

    // 🎟️ Génère un nouveau token court
    const newToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}