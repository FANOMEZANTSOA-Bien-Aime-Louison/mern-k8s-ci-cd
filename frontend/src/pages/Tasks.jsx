import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const PRIORITE = {
  urgente: { label: 'Urgent', classe: 'bg-red-50 text-red-600 border border-red-200' },
  normale: { label: 'Normal', classe: 'bg-amber-50 text-amber-600 border border-amber-200' },
  basse:   { label: 'Bas',    classe: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

const STATUT = {
  todo:     { label: 'À faire',  classe: 'bg-gray-100 text-gray-500' },
  en_cours: { label: 'En cours', classe: 'bg-blue-50 text-blue-600' },
  termine:  { label: 'Terminé',  classe: 'bg-emerald-50 text-emerald-600' },
};

const ORDRE_STATUT = { todo: 'en_cours', en_cours: 'termine', termine: 'todo' };

export default function Tasks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ titre: '', description: '', priorite: 'normale' });
  const [filtre, setFiltre] = useState('tous');
  const [chargement, setChargement] = useState(true);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setChargement(true);
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } finally {
      setChargement(false);
    }
  };

  const ouvrirModal = (task = null) => {
    setEditTask(task);
    setForm(task
      ? { titre: task.titre, description: task.description, priorite: task.priorite }
      : { titre: '', description: '', priorite: 'normale' }
    );
    setShowModal(true);
  };

  const fermerModal = () => { setShowModal(false); setEditTask(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editTask) {
      await API.put(`/tasks/${editTask._id}`, form);
    } else {
      await API.post('/tasks', form);
    }
    fermerModal();
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette tâche ?')) {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    }
  };

  const handleStatut = async (task) => {
    await API.put(`/tasks/${task._id}`, { statut: ORDRE_STATUT[task.statut] });
    fetchTasks();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tasksFiltrees = filtre === 'tous' ? tasks : tasks.filter(t => t.statut === filtre);
  const total     = tasks.length;
  const terminees = tasks.filter(t => t.statut === 'termine').length;
  const enCours   = tasks.filter(t => t.statut === 'en_cours').length;
  const aTaire    = tasks.filter(t => t.statut === 'todo').length;

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-semibold">
                  {user?.nom?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-700 font-medium">{user?.nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-700 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Titre */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Mes tâches</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez et organisez votre travail</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',     valeur: total,     couleur: 'text-gray-900' },
            { label: 'À faire',   valeur: aTaire,    couleur: 'text-gray-600' },
            { label: 'En cours',  valeur: enCours,   couleur: 'text-blue-600' },
            { label: 'Terminées', valeur: terminees, couleur: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.couleur}`}>{s.valeur}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        {total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progression globale</span>
              <span>{Math.round((terminees / total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(terminees / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Filtres + bouton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {[
              { val: 'tous',     label: 'Tous' },
              { val: 'todo',     label: 'À faire' },
              { val: 'en_cours', label: 'En cours' },
              { val: 'termine',  label: 'Terminées' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFiltre(f.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filtre === f.val
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => ouvrirModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            Nouvelle tâche
          </button>
        </div>

        {/* Liste tâches */}
        <div className="space-y-2">
          {chargement && (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"/>
            </div>
          )}

          {!chargement && tasksFiltrees.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-medium">Aucune tâche</p>
              <p className="text-gray-300 text-xs mt-1">Crée ta première tâche</p>
            </div>
          )}

          {!chargement && tasksFiltrees.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 hover:border-indigo-200 hover:shadow-sm transition group"
            >
              {/* Bouton statut */}
              <button
                onClick={() => handleStatut(task)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                  task.statut === 'termine'
                    ? 'bg-emerald-500 border-emerald-500'
                    : task.statut === 'en_cours'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {task.statut === 'termine' && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  task.statut === 'termine' ? 'line-through text-gray-400' : 'text-gray-800'
                }`}>
                  {task.titre}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITE[task.priorite].classe}`}>
                    {PRIORITE[task.priorite].label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUT[task.statut].classe}`}>
                    {STATUT[task.statut].label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => ouvrirModal(task)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button
                onClick={fermerModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Titre de la tâche"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="Description optionnelle..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'basse',   label: 'Basse',  classe: 'border-gray-200 text-gray-500' },
                    { val: 'normale', label: 'Normale', classe: 'border-amber-200 text-amber-600' },
                    { val: 'urgente', label: 'Urgente', classe: 'border-red-200 text-red-500' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setForm({ ...form, priorite: p.val })}
                      className={`py-2 rounded-xl text-xs font-medium border-2 transition ${
                        form.priorite === p.val
                          ? p.classe + ' bg-opacity-10 bg-current'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  {editTask ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}