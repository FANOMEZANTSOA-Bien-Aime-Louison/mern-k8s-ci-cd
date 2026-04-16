const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, default: '' },
  statut: {
    type: String,
    enum: ['todo', 'en_cours', 'termine'],
    default: 'todo'
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'urgente'],
    default: 'normale'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
