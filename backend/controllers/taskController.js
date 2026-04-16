const Task = require('../models/Task');

// Lire toutes les tâches
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une tâche
exports.createTask = async (req, res) => {
  try {
    const { titre, description, priorite } = req.body;
    const task = await Task.create({
      titre,
      description,
      priorite,
      user: req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Modifier une tâche
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};