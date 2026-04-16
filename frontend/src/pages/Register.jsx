import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/tasks');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoins TaskFlow gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {erreur && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              <span>⚠</span> {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Ton nom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="nom@exemple.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Minimum 6 caractères"
                required
              />
            </div>
            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 mt-2"
            >
              {chargement ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Création...
                </span>
              ) : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}