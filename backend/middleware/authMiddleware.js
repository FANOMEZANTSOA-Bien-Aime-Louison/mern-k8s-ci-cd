const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log('=== MIDDLEWARE EXÉCUTÉ ===');
  console.log('Type de next:', typeof next);
  console.log('next est une fonction?', typeof next === 'function');
  
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé, token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-motDePasse');

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    console.log('Middleware OK, appel de next()');
    next();
  } catch (error) {
    console.error('Erreur middleware:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

console.log('Middleware chargé, protect est de type:', typeof protect);
module.exports = protect;