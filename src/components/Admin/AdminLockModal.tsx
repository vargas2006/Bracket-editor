import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, X, KeyRound } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

interface AdminLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLockModal: React.FC<AdminLockModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin, loginAdmin, logoutAdmin, settings } = useTournament();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      setPin('');
      setError('');
      onClose();
    } else {
      setError(`Invalid PIN. Hint: Default PIN is ${settings.adminPin || '1234'}`);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-[#131722] border border-slate-700/80 rounded-xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">
            {isAdmin ? 'Admin Mode Active' : 'Admin Authentication'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'You currently have full administrative permissions to manage rosters, scores, and brackets.'
              : 'Enter the community admin PIN to enable editing and tournament management.'}
          </p>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Full tournament edit rights granted.</span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Switch to Guest (View Only)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Security PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter PIN (Default: 1234)"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm tracking-widest text-center"
              />
              {error && <p className="text-xs text-rose-400 mt-1.5 text-center">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-rose-900/40"
            >
              Unlock Admin Controls
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

