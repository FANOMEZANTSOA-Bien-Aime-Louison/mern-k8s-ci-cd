const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;
    console.log(nom, email, motDePasse);

    const existeDeja = await User.findOne({ email });
    if (existeDeja)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    const user = await User.create({ nom, email, motDePasse: motDePasseHash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      token,
      user: { id: user._id, nom: user.nom, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable" });

    const ok = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!ok) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, nom: user.nom, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
